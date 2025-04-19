import { useState, useEffect, useRef, RefObject } from "react";

// 상수 정의
const GRID_WIDTH = 11;
const GRID_HEIGHT = 60;
const TILE_SIZE = 36;

// 첫 번째 사진의 Y 위치
const FIRST_PHOTO_Y = 3;
// 마지막 사진의 Y 위치
const LAST_PHOTO_Y = 48;
// 마지막 사진의 높이
const PHOTO_HEIGHT = 4;
// 여백을 확장할 추가 공간
const EXTRA_BOTTOM_SPACE = FIRST_PHOTO_Y;

const photos = [
  { id: "left-0", side: "left", x: 1, y: FIRST_PHOTO_Y, message: "도쿄에서", imagePath: "/gallery/left_01.jpg" },
  { id: "left-1", side: "left", x: 1, y: 8, message: "따뜻한 날씨", imagePath: "/gallery/left_02.jpg" },
  { id: "left-2", side: "left", x: 1, y: 13, message: "산책 중 한 컷", imagePath: "/gallery/left_03.jpg" },
  { id: "left-3", side: "left", x: 1, y: 18, message: "꽃 피던 날", imagePath: "/gallery/left_04.jpg" },
  { id: "left-4", side: "left", x: 1, y: 23, message: "생일 기념🎂", imagePath: "/gallery/left_05.jpg" },
  { id: "left-5", side: "left", x: 1, y: 28, message: "카페 데이트", imagePath: "/gallery/left_06.jpg" },
  { id: "left-6", side: "left", x: 1, y: 33, message: "저녁 노을", imagePath: "/gallery/left_07.jpg" },
  { id: "left-7", side: "left", x: 1, y: 38, message: "길고양이랑 🐾", imagePath: "/gallery/left_08.jpg" },
  { id: "left-8", side: "left", x: 1, y: 43, message: "벚꽃 아래에서", imagePath: "/gallery/left_09.jpg" },
  { id: "left-9", side: "left", x: 1, y: LAST_PHOTO_Y, message: "첫 여행 기억", imagePath: "/gallery/left_10.jpg" },
  { id: "right-0", side: "right", x: 7, y: FIRST_PHOTO_Y, message: "눈 오는 날", imagePath: "/gallery/right_01.jpg" },
  { id: "right-1", side: "right", x: 7, y: 8, message: "우산 속 우리", imagePath: "/gallery/right_02.jpg" },
  { id: "right-2", side: "right", x: 7, y: 13, message: "한강에서", imagePath: "/gallery/right_03.jpg" },
  { id: "right-3", side: "right", x: 7, y: 18, message: "일요일 오전", imagePath: "/gallery/right_04.jpg" },
  { id: "right-4", side: "right", x: 7, y: 23, message: "고양이처럼", imagePath: "/gallery/right_05.jpg" },
  { id: "right-5", side: "right", x: 7, y: 28, message: "생각에 잠긴 날", imagePath: "/gallery/right_06.jpg" },
  { id: "right-6", side: "right", x: 7, y: 33, message: "바닷가에서 🌊", imagePath: "/gallery/right_07.jpg" },
  { id: "right-7", side: "right", x: 7, y: 38, message: "빵집 앞에서", imagePath: "/gallery/right_08.jpg" },
  { id: "right-8", side: "right", x: 7, y: 43, message: "기차 타기 전", imagePath: "/gallery/right_09.jpg" },
  { id: "right-9", side: "right", x: 7, y: LAST_PHOTO_Y, message: "조용한 오후", imagePath: "/gallery/right_10.jpg" },
];

interface GalleryWalkProps {
  scrollContainerRef: RefObject<HTMLDivElement | null>;
  onBack: () => void;
}

const GalleryWalk: React.FC<GalleryWalkProps> = ({ scrollContainerRef, onBack }) => {
  const [position, setPosition] = useState({ x: 5, y: 3 });
  const [showHint, setShowHint] = useState(false);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [popupPhotoId, setPopupPhotoId] = useState<string | null>(null);
  const characterRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);

  const move = (dir: "up" | "down" | "left" | "right") => {
    // 방향키를 움직이면 힌트 메시지를 숨김
    setShowHint(false);
    
    setPosition((prev) => {
      const next = { ...prev };
      if (dir === "up") next.y = Math.max(prev.y - 1, 0);
      if (dir === "down") next.y = Math.min(prev.y + 1, LAST_PHOTO_Y + PHOTO_HEIGHT + 1); // 마지막 사진 아래 한 칸까지
      if (dir === "left") next.x = Math.max(prev.x - 1, 4);
      if (dir === "right") next.x = Math.min(prev.x + 1, 6);

      const isBlocked = photos.some(
        (p) =>
          next.x >= p.x && next.x < p.x + 3 && next.y >= p.y && next.y < p.y + 4
      );

      if (isBlocked) return prev;
      return next;
    });
  };

  useEffect(() => {
    const handleMove = (e: CustomEvent) => {
      move(e.detail);
    };
    window.addEventListener("move", handleMove as EventListener);
    return () => {
      window.removeEventListener("move", handleMove as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    if (scrollContainerRef?.current && characterRef?.current) {
      const container = scrollContainerRef.current;
      const character = characterRef.current;

      const containerRect = container.getBoundingClientRect();
      const characterRect = character.getBoundingClientRect();

      const offset = characterRect.top - containerRect.top;

      // 화면 크기를 체크하여 스크롤 위치를 조정
      const isMobile = window.innerWidth <= 768;
      // 모바일에서는 화면의 50% 지점에, 큰 화면에서는 70% 지점에 캐릭터를 위치시킵니다
      const scrollPosition = isMobile ? 0.50 : 0.70;
      
      // 캐릭터 위치가 화면의 적절한 지점으로 오도록 스크롤 조정
      const targetScrollTop =
        container.scrollTop + offset - container.clientHeight * scrollPosition;
      const maxScrollTop = container.scrollHeight - container.clientHeight;
      
      const safeScrollTop = Math.min(
        targetScrollTop, 
        maxScrollTop - 1
      );

      container.scrollTo({
        top: safeScrollTop,
        behavior: "smooth",
      });
    }
  }, [position]);

  useEffect(() => {
    // 컴포넌트 마운트 시 힌트 표시
    setShowHint(true);
    // 타임아웃 제거 - 방향키를 누를 때까지 계속 표시
  }, []);

  useEffect(() => {
    const current = photos.find((p) => {
      const facingX = p.side === "left" ? p.x + 3 : p.x - 1;
      const matchX = position.x === facingX;
      const matchY = position.y >= p.y && position.y < p.y + 4;
      return matchX && matchY;
    });

    if (current?.id !== activePhotoId) {
      setActivePhotoId(current?.id || null);
    }
  }, [position]);

  const currentPhoto = photos.find((p) => p.id === activePhotoId);

  return (
    <div
      className="relative bg-[#EFEFEF] gallery-text-no-select"
      style={{
        width: `${GRID_WIDTH * TILE_SIZE}px`,
        height: `${(LAST_PHOTO_Y + PHOTO_HEIGHT + EXTRA_BOTTOM_SPACE) * TILE_SIZE}px`,
        margin: "0 auto",
        paddingTop: `${FIRST_PHOTO_Y * TILE_SIZE}px`,
        imageRendering: "pixelated",
      }}
    >
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[10px] left-1 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>

      {photos.map((photo) => (
        <div
          key={photo.id}
          className="absolute overflow-hidden"
          style={{
            width: TILE_SIZE * 3,
            height: TILE_SIZE * 4,
            left: photo.x * TILE_SIZE,
            top: photo.y * TILE_SIZE,
            zIndex: 5,
            backgroundColor: "#e5e7eb",
            border: "1px solid #a87c56",
          }}
          onClick={() => setPopupPhotoId(photo.id)}
        >
          <img
            src={photo.imagePath}
            alt="사진"
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {popupPhotoId && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setPopupPhotoId(null)}
        >
          <img
            src={photos.find(p => p.id === popupPhotoId)?.imagePath}
            alt="확대된 사진"
            className="w-[250px] h-[333px] object-cover"
          />
        </div>
      )}

      {showHint && (
        <div
          className="absolute text-xs text-center bg-white/80 px-4 py-2 rounded shadow z-30"
          style={{
            left: position.x * TILE_SIZE + TILE_SIZE / 2,
            top: position.y * TILE_SIZE + 50,
            transform: "translateX(-50%)",
            width: "250px",
            lineHeight: "1.5"
          }}
        >
          밀레를 움직여서 사진쪽으로 다가가 보세요.
          <br />
          사진을 클릭하면 더 크게 볼 수 있습니다.
        </div>
      )}

      {/* 캐릭터 (움직일 수 있는 캐릭터) */}
      <div
        ref={characterRef}
        className="absolute flex flex-col items-center"
        style={{
          left: position.x * TILE_SIZE,
          top: position.y * TILE_SIZE,
          width: TILE_SIZE,
          height: TILE_SIZE,
          zIndex: 10,
          transition: "transform 0.1s linear"
        }}
      >
        {/* 캐릭터 아바타 */}
        <div className="w-8 h-8">
          <img 
            src="/gallery_millet.png" 
            alt="밀레 캐릭터" 
            className="w-full h-full object-contain"
          />
        </div>

        {/* 사진에 접근했을 때 메시지 */}
        {currentPhoto && (
          <div
            className="absolute text-xs text-center bg-white px-2 py-1 rounded shadow whitespace-nowrap"
            style={{
              top: "-30px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "auto",
              maxWidth: "120px",
            }}
          >
            {currentPhoto.message}
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryWalk; 