import React, { useState, useRef, useEffect } from 'react';
import { db, storage } from '../firebase';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface PhotoWithUsProps {
  onBack: () => void;
}

interface PhotoItem {
  id: string;
  photoURL: string;
  password: string;
  createdAt: Date;
}

const PhotoWithUs: React.FC<PhotoWithUsProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const galleryEndRef = useRef<HTMLDivElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);
  // 구멍 위치 및 크기 설정
  // top: 구멍의 수직 위치 (숫자가 크면 아래로 이동, 작으면 위로 이동)
  // left: 구멍의 수평 위치 (숫자가 크면 오른쪽, 작으면 왼쪽, 50%가 중앙)
  // size: 구멍의 크기 (픽셀 단위, 숫자가 작을수록 구멍이 작아짐)
  const [holePosition, setHolePosition] = useState({ top: '23%', left: '51%', size: 47 });
  
  // 크롭 영역 설정값 - 최적의 값으로 고정 설정
  const [cropScale] = useState(5.0);  // 구멍 크기 대비 크롭 영역 배율
  const [outputSize] = useState(400); // 출력 이미지 크기 (픽셀)
  const [aspectRatio] = useState(2.5); // 가로:세로 비율 (2.5:1)
  
  // 크롭 영역 설정 - 사용자가 쉽게 조절할 수 있는 값들
  const cropConfig = {
    outputSize,
    cropScale,
    aspectRatio,
  };
  
  // 개발자 도구의 이전 설정 삭제
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).cropConfig = null;
      (window as any).updateCropConfig = null;
    }
  }, []);
  
  // 사진 갤러리 관련 상태
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoPassword, setPhotoPassword] = useState("");
  const [deletePhotoId, setDeletePhotoId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // 브라우저 환경 감지
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
    
    // 인스타그램과 카카오톡 내부 브라우저 감지 - 더 다양한 패턴 추가
    const isInstagram = userAgent.includes('instagram');
    // 카카오톡 브라우저 확실하게 감지하기 위한 여러 패턴
    const isKakao = userAgent.includes('kakao') || 
                   userAgent.includes('kakaotalk') || 
                   userAgent.includes('naver') ||
                   /\bkakao\b/.test(userAgent);
    
    // 추가적인 인앱 브라우저 감지 (FBAN: Facebook App, FBAV: Facebook Browser)
    const isFacebook = userAgent.includes('fban') || userAgent.includes('fbav');
    const isLine = userAgent.includes('line');
    // 안드로이드 웹뷰 감지
    const isAndroidWebView = userAgent.includes('wv') || 
                            (userAgent.includes('android') && !userAgent.includes('chrome'));
    
    const isInApp = isInstagram || isKakao || isFacebook || isLine || isAndroidWebView || 
                   (!userAgent.includes('safari') && userAgent.includes('mobile'));
    
    setIsInAppBrowser(isInApp);
    
    // 디버깅 정보 추가
    console.log('브라우저 환경 상세:', { 
      userAgent, 
      isKakao,
      hasKakaoText: userAgent.includes('kakao'),
      hasKakaoTalkText: userAgent.includes('kakaotalk'),
      isInApp
    });
  }, []);

  // 컴포넌트 마운트 시 자동으로 카메라 시작
  useEffect(() => {
    startCamera();
    loadPhotos();
    
    // 컴포넌트 언마운트 시 카메라 종료
    return () => {
      stopCamera();
    };
  }, []);

  // 카메라 시작
  const startCamera = async () => {
    try {
      // 이미 실행 중인 카메라가 있다면 정지
      stopCamera();
      
      setCameraError(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.error('카메라 접근 오류:', err);
      setCameraError('카메라에 접근할 수 없습니다.\n카메라 권한을 확인해주세요.');
    }
  };

  // 카메라 종료
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
  };

  // 현재 화면의 정확한 구멍 위치와 크기 계산
  const getExactHolePosition = (): { x: number, y: number, size: number } => {
    if (!photoContainerRef.current) {
      return { x: 0, y: 0, size: holePosition.size };
    }
    
    const container = photoContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerWidth = containerRect.width;
    const containerHeight = containerRect.height;
    
    // 구멍은 컨테이너에서 left와 top 위치에 맞게 배치
    // left 백분율을 픽셀로 변환
    const leftPercentage = parseFloat(holePosition.left) / 100;
    const holeX = containerWidth * leftPercentage;
    
    // top 백분율을 픽셀로 변환
    const topPercentage = parseFloat(holePosition.top) / 100;
    const holeY = containerHeight * topPercentage;
    
    return {
      x: holeX,
      y: holeY,
      size: holePosition.size
    };
  };

  // 사진 촬영
  const capturePhoto = () => {
    if (!cameraReady || !videoRef.current || !canvasRef.current || !photoContainerRef.current) return;
    
    // 정확한 구멍 위치 계산
    const holeInfo = getExactHolePosition();
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // 배경 이미지 로드
    const frameImg = new Image();
    frameImg.onload = () => {
      // 캔버스 크기 설정 - 비율 유지하면서 충분한 해상도
      const aspectRatio = frameImg.naturalWidth / frameImg.naturalHeight;
      const targetHeight = 1200;
      const targetWidth = targetHeight * aspectRatio;
      
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      
      // 배경색 초기화
      context.fillStyle = '#FFFFFF';
      context.fillRect(0, 0, canvas.width, canvas.height);
      
      // 배경 이미지 그리기
      context.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
      
      // 얼굴 부분에 사용자 카메라 화면 합성하기 위한 위치 계산
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;
      
      // 정확히 같은 위치에 구멍을 그리기 위한 계산
      const containerRect = photoContainerRef.current!.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const containerHeight = containerRect.height;

      // 컨테이너와 캔버스 사이의 비율 계산
      const widthRatio = canvas.width / containerWidth;
      const heightRatio = canvas.height / containerHeight;

      // 구멍 위치와 크기 계산 (캔버스 기준)
      const holeSize = holeInfo.size * widthRatio;
      const holeX = holeInfo.x * widthRatio - holeSize / 2;  // 중앙 정렬
      // 구멍 위치 보정을 위한 오프셋 추가 (음수: 위로 이동, 양수: 아래로 이동)
      const offsetY = 2; // 위치 조정값 (양수로 변경하여 아래로 이동)
      const holeY = (holeInfo.y * heightRatio - holeSize / 2) + offsetY; // 중앙 정렬 + 보정값
      
      // 비디오에서 얼굴 부분 잘라내기
      const aspectRatioVideo = videoWidth / videoHeight;
      let srcX, srcY, srcWidth, srcHeight;
      
      if (aspectRatioVideo > 1) {
        srcHeight = videoHeight;
        srcWidth = srcHeight;
        srcX = (videoWidth - srcWidth) / 2;
        srcY = 0;
      } else { // 세로가 더 긴 경우
        srcWidth = videoWidth;
        srcHeight = srcWidth;
        srcX = 0;
        // 얼굴은 보통 화면 상단에 있으므로 위쪽에서 자름 - 더 높게 조정
        srcY = (videoHeight - srcHeight) / 2; // 값을 더 작게 하면 더 아래쪽이 찍힘
      }
      
      // 원형 클리핑 마스크 생성
      context.save();
      context.beginPath();
      context.arc(holeX + holeSize/2, holeY + holeSize/2, holeSize/2, 0, Math.PI * 2);
      context.closePath();
      context.clip();
      
      // 카메라 좌우 반전을 위해 추가 캔버스 사용
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = videoWidth;
      tempCanvas.height = videoHeight;
      const tempContext = tempCanvas.getContext('2d');
      
      if (tempContext) {
        // 비디오 프레임을 임시 캔버스에 반전시켜 그림
        tempContext.translate(videoWidth, 0);
        tempContext.scale(-1, 1);
        tempContext.drawImage(video, 0, 0, videoWidth, videoHeight);
        
        // 임시 캔버스의 반전된 이미지를 원본 캔버스에 그림
        context.drawImage(
          tempCanvas,
          srcX, srcY, srcWidth, srcHeight,
          holeX, holeY, holeSize, holeSize
        );
      }
      
      context.restore();
      
      // 결과 이미지 데이터 URL로 변환
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    };
    
    // 커플 이미지 로드
    frameImg.src = '/sy_00.jpg';
    frameImg.onerror = () => {
      // 이미지 로드 실패 시 대체 작업
      setCameraError('사진 합성에 필요한 이미지를 로드할 수 없습니다.');
    };
  };

  // 다시 촬영
  const retakePhoto = () => {
    setCapturedImage(null);
    // 카메라가 꺼져있을 수 있으므로 다시 시작
    startCamera();
  };

  // 이미지 저장
  const savePhoto = () => {
    if (!capturedImage) return;
    
    try {
      // 이미지 다운로드
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `세인영건과_사진_${new Date().toISOString().slice(0,10)}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('사진 저장 오류:', err);
      alert('사진을 저장하는 중 오류가 발생했습니다. 직접 이미지를 길게 눌러 저장해주세요.');
    }
  };

  // iOS 공유 기능
  const sharePhoto = () => {
    if (!capturedImage || !navigator.share) return;
    
    fetch(capturedImage)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "sy_wed_.jpg", { type: "image/jpeg" });
        navigator.share({
          files: [file],
        }).catch(err => {
          console.error('공유 오류:', err);
        });
      });
  };

  // 사진 갤러리 관련 함수
  // 사진 불러오기
  const loadPhotos = async () => {
    try {
      console.log("사진 갤러리 로드 시작");
      // 시간 역순(최신순)으로 정렬
      const q = query(collection(db, "photos"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedPhotos: PhotoItem[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedPhotos.push({
          id: doc.id,
          photoURL: data.photoURL,
          password: data.password,
          createdAt: data.createdAt.toDate()
        });
      });
      
      console.log(`${loadedPhotos.length}개의 사진 로드 완료`);
      setPhotos(loadedPhotos);
    } catch (error) {
      console.error("사진 불러오기 오류:", error);
      showErrorPopup("사진을 불러오는 중 오류가 발생했습니다.");
    }
  };

  // 에러 표시 함수
  const showErrorPopup = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };

  // 비밀번호 입력 핸들러
  const handlePhotoPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하고 4자리로 제한
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPhotoPassword(value);
  };

  const handleDeletePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하고 4자리로 제한
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setDeletePassword(value);
  };

  // 사진 남기기 모달 열기
  const openSavePhotoModal = () => {
    setIsSavingPhoto(true);
  };

  // 사진 저장
  const savePhotoToGallery = async () => {
    console.log("사진 남기기 시작", { capturedImage: !!capturedImage, photoPassword });
    
    if (!capturedImage) {
      console.error("캡처된 이미지가 없습니다.");
      showErrorPopup("사진이 없습니다. 다시 시도해주세요.");
      return;
    }
    
    if (!photoPassword || photoPassword.length !== 4) {
      console.error("비밀번호가 올바르지 않습니다:", photoPassword);
      showErrorPopup("비밀번호 네 자리를 입력해 주세요.");
      return;
    }

    // 중복 업로드 방지
    if (isUploading) {
      console.log("이미 업로드 중입니다.");
      return;
    }

    setIsUploading(true);

    // 타임아웃 설정
    const uploadTimeout = setTimeout(() => {
      console.error("업로드 타임아웃 발생");
      showErrorPopup("업로드 시간이 초과되었습니다. 다시 시도해주세요.");
      setIsUploading(false);
      setIsSavingPhoto(false);
    }, 30000); // 30초 타임아웃

    try {
      console.log("이미지 처리 시작");
      
      // 이미지 크롭 처리 - 직접 경량화된 데이터 URL 반환
      const croppedImageUrl = await cropImageToDataUrl(capturedImage);
      if (!croppedImageUrl) {
        throw new Error("이미지 크롭 실패");
      }
      
      console.log("이미지 크롭 완료");

      // 간소화된 방식: Storage 우회하고 직접 Firestore에 저장
      try {
        console.log("Firestore에 직접 저장 시작");
        
        // Firestore에 메타데이터와 이미지 데이터 직접 저장
        const photoData = {
          photoURL: croppedImageUrl, // 직접 데이터 URL 저장
          password: photoPassword,
          createdAt: new Date()
        };
        
        const docRef = await addDoc(collection(db, "photos"), photoData);
        console.log("Firestore에 데이터 저장 완료:", docRef.id);
        
        // 타임아웃 클리어
        clearTimeout(uploadTimeout);
        
        // 성공 처리
        setIsSavingPhoto(false);
        setPhotoPassword("");
        setIsUploading(false);
        
        // 사진 리스트 새로고침
        await loadPhotos();
        
        // 사진이 성공적으로 저장되었다는 메시지
        alert("저장되었습니다. 감사해요!");
      } catch (error) {
        console.error("Firestore 저장 오류:", error);
        throw error;
      }
    } catch (error) {
      console.error("전체 저장 프로세스 오류:", error);
      showErrorPopup("사진을 저장하는 동안 오류가 발생했습니다.");
      clearTimeout(uploadTimeout);
      setIsSavingPhoto(false);
      setIsUploading(false);
    }
  };

  // 이미지 크롭 함수 - 데이터 URL을 직접 반환
  const cropImageToDataUrl = async (imageDataUrl: string): Promise<string | null> => {
    return new Promise((resolve, reject) => {
      try {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        
        img.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            
            if (!ctx) {
              console.error("캔버스 컨텍스트를 가져올 수 없습니다.");
              reject(null);
              return;
            }
            
            // 얼굴 부분 크롭 설정 - 이미지 크기 축소
            const holeSize = holePosition.size;
            const outputWidth = cropConfig.outputSize; // 출력 가로 크기
            const outputHeight = Math.round(outputWidth / cropConfig.aspectRatio); // 비율에 맞게 세로 크기 계산
            
            canvas.width = outputWidth;
            canvas.height = outputHeight;
            
            // 이미지의 중앙 부분을 계산
            const centerX = img.width / 2;
            const centerY = img.height * (parseFloat(holePosition.top) / 100);
            
            // 크롭 영역 계산 - 가로를 더 넓게 설정
            const cropHeight = holeSize * cropConfig.cropScale; // 세로 크기는 기존 배율 적용
            const cropWidth = cropHeight * cropConfig.aspectRatio; // 가로 크기는 aspectRatio만큼 더 넓게
            
            ctx.drawImage(
              img,
              centerX - cropWidth / 2,  // 중앙에서 크롭 영역의 절반만큼 왼쪽
              centerY - cropHeight / 2, // 중앙에서 크롭 영역의 절반만큼 위쪽
              cropWidth,                // 가로로 더 넓은 크롭 영역
              cropHeight,               // 세로 크롭 영역
              0,
              0,
              outputWidth,
              outputHeight
            );
            
            // 최적화된 품질의 JPEG 데이터 URL 반환
            const dataUrl = canvas.toDataURL('image/jpeg', 1.0); // 품질을 100%로 설정
            resolve(dataUrl);
          } catch (err) {
            console.error("캔버스 처리 오류:", err);
            reject(null);
          }
        };
        
        img.onerror = (err) => {
          console.error("이미지 로드 오류:", err);
          reject(null);
        };
        
        img.src = imageDataUrl;
      } catch (err) {
        console.error("크롭 프로세스 오류:", err);
        reject(null);
      }
    });
  };

  // 사진 삭제 모달 열기
  const openDeleteModal = (id: string) => {
    setDeletePhotoId(id);
    setDeletePassword("");
    setIsDeleting(true);
  };

  // 사진 삭제
  const deletePhoto = async () => {
    if (!deletePhotoId) return;
    
    try {
      const photoToDelete = photos.find(photo => photo.id === deletePhotoId);
      
      if (!photoToDelete) {
        showErrorPopup("사진을 찾을 수 없습니다.");
        return;
      }
      
      // 비밀번호 확인 (일반 비밀번호 또는 마스터 비밀번호)
      if (deletePassword !== photoToDelete.password && deletePassword !== "5678") {
        showErrorPopup("비밀번호가 일치하지 않습니다.");
        return;
      }
      
      // 사진 삭제
      await deleteDoc(doc(db, "photos", deletePhotoId));
      
      // 삭제 모달 닫기
      setIsDeleting(false);
      setDeletePhotoId(null);
      setDeletePassword("");
      
      // 사진 다시 불러오기
      loadPhotos();
    } catch (error) {
      console.error("사진 삭제 오류:", error);
      showErrorPopup("사진을 삭제하는 동안 오류가 발생했습니다.");
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-white pt-4 overflow-y-auto overflow-x-hidden">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[10px] left-1 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <div className="w-full max-w-md mt-14 mb-6 px-4">
        {cameraError ? (
          // 카메라 오류 메시지
          <div className="bg-white p-4 text-center">
            <p className="text-xs text-gray-500 mb-6" style={{ whiteSpace: 'pre-line' }}>{cameraError}</p>
            <p className="text-xs text-gray-500 mb-4">
              카메라 권한이 거부되었다면<br />브라우저 설정에서 권한을 허용해주세요.
            </p>
            <button
              onClick={startCamera}
              className="px-6 py-2 bg-[#FF80D2] text-white rounded-none font-medium"
            >
              다시 시도하기
            </button>
          </div>
        ) : capturedImage ? (
          // 촬영된 사진 표시
          <div className="bg-white">
            <div className="mb-4">
              <img 
                src={capturedImage} 
                alt="세인 & 영건과 함께 찍은 사진" 
                className="w-full h-auto" 
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={retakePhoto}
                className="flex-1 py-2 bg-[#FF80D2] text-white rounded-none font-medium"
              >
                다시 찍기
              </button>
              
              <button
                onClick={isIOS && typeof navigator.share === 'function' ? sharePhoto : savePhoto}
                className="flex-1 py-2 bg-[#FF80D2] text-white rounded-none font-medium"
              >
                저장하기
              </button>
              
              <button
                onClick={openSavePhotoModal}
                className="flex-1 py-2 bg-[#FF80D2] text-white rounded-none font-medium"
              >
                사진 남기기
              </button>
            </div>
          </div>
        ) : (
          // 카메라 뷰
          <div 
            ref={photoContainerRef}
            className="bg-white"
          >
            <div className="relative aspect-[3/4] w-full mb-4">
              {/* 배경 이미지 */}
              <img 
                src="/sy_00.jpg" 
                alt="세인 & 영건 사진" 
                className="absolute inset-0 w-full h-full object-cover z-0"
                onError={() => setCameraError('배경 이미지를 불러올 수 없습니다.')}
              />

              {/* 구멍을 만들기 위한 마스크 기법 사용 */}
              <div 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10" 
                style={{ 
                  width: `${holePosition.size}px`, 
                  height: `${holePosition.size}px`,
                  top: holePosition.top,
                  left: holePosition.left
                }}
              >
                {/* 카메라 화면이 보이는 원형 구멍 */}
                <div className="w-full h-full rounded-full overflow-hidden">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={capturePhoto}
              disabled={!cameraReady}
              className="w-auto px-6 py-2 bg-[#FF80D2] text-white rounded-none disabled:opacity-50 font-medium mx-auto block"
            >
              사진 찍기
            </button>
          </div>
        )}
      </div>
      
      {/* 사진 갤러리 */}
      <div className="w-full max-w-md px-4 mb-15 pb-1">
        <div className="divide-y divide-gray-300">
          {photos.length > 0 ? (
            <div>
              {/* 2개씩 묶어서 행으로 표시 - 사진 크기 키움 */}
              {Array.from({ length: Math.ceil(photos.length / 2) }).map((_, rowIndex) => (
                <div key={rowIndex} className="flex py-2 space-x-1">
                  {photos.slice(rowIndex * 2, rowIndex * 2 + 2).map((photo) => (
                    <div key={photo.id} className="relative w-1/2">
                      <div 
                        className="w-full relative" 
                        style={{ 
                          paddingBottom: `${100 / aspectRatio}%`, // 가로:세로 비율 설정
                          overflow: 'hidden' 
                        }}
                      >
                        <img 
                          src={photo.photoURL} 
                          alt="사용자 사진" 
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                      </div>
                      <button 
                        onClick={() => openDeleteModal(photo.id)}
                        className="absolute top-1 left-1 bg-[#ff80d2]/50 hover:bg-[#ff80d2]/80 w-4 h-4 flex items-center justify-center rounded-full transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ))} 
              {/* 스크롤 참조 요소 */}
              <div ref={galleryEndRef} />
            </div>
          ) : (
            <p className="text-center py-4 text-xs text-gray-500">
              첫 번째 사진을 남겨보세요!
            </p>
          )}
        </div>
        {/* 추가 여백 */}
        <div className="h-40"></div>
      </div>
      
      {/* 숨겨진 캔버스 (이미지 합성용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* 사진 남기기 모달 */}
      {isSavingPhoto && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-4 shadow-xl">
            <button 
              onClick={() => {
                if (!isUploading) {
                  setIsSavingPhoto(false);
                  setPhotoPassword("");
                }
              }}
              disabled={isUploading}
              className={`absolute top-2 left-2 ${isUploading ? 'bg-gray-400' : 'bg-[#8acad9]/50 hover:bg-[#8acad9]/80'} w-5 h-5 flex items-center justify-center rounded-full transition-colors`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center mt-4">
              <p className="text-xs mb-3">삭제 시 사용할<br />비밀번호를 입력해 주세요.</p>
              
              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={photoPassword}
                  onChange={handlePhotoPasswordChange}
                  disabled={isUploading}
                  className="w-32 px-3 py-1 border-b border-gray-800 bg-transparent mb-3 text-center focus:outline-none text-xs"
                  placeholder="비밀번호 네 자리"
                  maxLength={4}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && photoPassword.length === 4) {
                      savePhotoToGallery();
                    }
                  }}
                />
              </div>
              
              <button
                onClick={savePhotoToGallery}
                disabled={isUploading || !photoPassword || photoPassword.length !== 4}
                className={`${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff96d6] hover:bg-pink-500'} text-white px-3 py-1 rounded-md transition-colors text-xs`}
              >
                {isUploading ? '업로드 중...' : '사진 남기기'}
              </button>
              
              {isUploading && (
                <p className="text-xs mt-2 text-gray-600">업로드 중입니다. 잠시만 기다려주세요...</p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* 삭제 모달 */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-4 shadow-xl">
            <button 
              onClick={() => {
                setIsDeleting(false);
                setDeletePhotoId(null);
              }}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center mt-4">
              <p className="text-xs mb-3">삭제하려면 비밀번호를 입력하세요.</p>
              
              <div className="flex justify-center">
                <input
                  type="text"
                  inputMode="numeric"
                  value={deletePassword}
                  onChange={handleDeletePasswordChange}
                  className="w-32 px-3 py-1 border-b border-gray-800 bg-transparent mb-3 text-center focus:outline-none text-xs"
                  placeholder="비밀번호 입력"
                  maxLength={4}
                />
              </div>
              
              <button
                onClick={deletePhoto}
                className="bg-[#ff96d6] text-white px-3 py-1 rounded-md hover:bg-pink-500 transition-colors text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 에러 팝업 */}
      {showError && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-4 shadow-xl">
            <button 
              onClick={() => setShowError(false)}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-5 h-5 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center mt-4 mb-1">
              <p className="text-xs">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoWithUs; 