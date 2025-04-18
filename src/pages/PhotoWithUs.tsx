import React, { useState, useEffect, useRef } from 'react';

interface PhotoWithUsProps {
  onBack: () => void;
}

const PhotoWithUs: React.FC<PhotoWithUsProps> = ({ onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
      try {
        setIsLoading(true);
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user' }, // 전면 카메라 사용
          audio: false
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            setIsLoading(false);
            setIsCameraReady(true);
          };
        }
      } catch (err) {
        console.error('카메라 접근 오류:', err);
        setIsLoading(false);
        alert('카메라에 접근할 수 없습니다. 카메라 접근 권한을 확인해주세요.');
      }
    };

    startCamera();

    // 컴포넌트 언마운트 시 카메라 종료
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current && isCameraReady) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      if (context) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // 이미지를 데이터 URL로 변환
        const imageDataUrl = canvas.toDataURL('image/png');
        setCapturedImage(imageDataUrl);
      }
    }
  };

  const savePhoto = () => {
    if (capturedImage) {
      // 링크 요소 생성
      const link = document.createElement('a');
      link.href = capturedImage;
      link.download = `세인영건과_사진_${new Date().toISOString().slice(0,10)}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center bg-pink-200">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[12px] left-4 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      {isLoading ? (
        <div className="text-center p-6 rounded-lg bg-white/80 shadow-lg">
          <h2 className="text-3xl font-bold mb-4 text-pink-700">세인 & 영건과 사진 찍기</h2>
          <p className="text-xl text-gray-700">만드는 중...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center w-full max-w-md py-4">
          <h2 className="text-2xl font-bold mb-4 text-pink-700">세인 & 영건과 사진 찍기</h2>
          
          <div className="relative w-full aspect-square rounded-lg overflow-hidden mb-4">
            {!capturedImage ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-10"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                  <div className="w-3/4 h-3/4 rounded-full border-8 border-white border-dashed"></div>
                </div>
              </>
            ) : (
              <img 
                src={capturedImage} 
                alt="촬영된 사진" 
                className="w-full h-full object-cover" 
              />
            )}
          </div>

          <canvas ref={canvasRef} style={{ display: 'none' }} />
          
          <div className="flex space-x-4">
            {!capturedImage ? (
              <button
                onClick={capturePhoto}
                disabled={!isCameraReady}
                className="px-3 py-1 bg-pink-500 text-white rounded-md shadow-md hover:bg-pink-600 transition-colors disabled:opacity-50"
              >
                사진 찍기
              </button>
            ) : (
              <>
                <button
                  onClick={retakePhoto}
                  className="px-3 py-1 bg-gray-500 text-white rounded-md shadow-md hover:bg-gray-600 transition-colors"
                >
                  다시 찍기
                </button>
                <button
                  onClick={savePhoto}
                  className="px-3 py-1 bg-pink-500 text-white rounded-md shadow-md hover:bg-pink-600 transition-colors"
                >
                  저장하기
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoWithUs; 