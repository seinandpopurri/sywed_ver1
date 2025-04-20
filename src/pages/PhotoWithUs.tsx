import React, { useState, useRef, useEffect } from 'react';

interface PhotoWithUsProps {
  onBack: () => void;
}

const PhotoWithUs: React.FC<PhotoWithUsProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const photoContainerRef = useRef<HTMLDivElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);
  // 구멍 위치 및 크기 설정
  // top: 구멍의 수직 위치 (숫자가 크면 아래로 이동, 작으면 위로 이동)
  // left: 구멍의 수평 위치 (숫자가 크면 오른쪽, 작으면 왼쪽, 50%가 중앙)
  // size: 구멍의 크기 (픽셀 단위, 숫자가 작을수록 구멍이 작아짐)
  const [holePosition, setHolePosition] = useState({ top: '23%', left: '51%', size: 47 });

  // iOS 감지
  useEffect(() => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));
  }, []);

  // 컴포넌트 마운트 시 자동으로 카메라 시작
  useEffect(() => {
    startCamera();
    
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

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-start bg-white pt-4 overflow-y-auto">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[10px] left-1 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <div className="w-full max-w-md mt-14 mb-20 px-4">
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
                {isIOS && typeof navigator.share === 'function' ? '저장하기' : '저장하기'}
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
      
      {/* 숨겨진 캔버스 (이미지 합성용) */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default PhotoWithUs; 