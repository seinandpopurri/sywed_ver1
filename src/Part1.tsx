import { useState, useEffect } from "react";

export default function Part1() {
  const [firstLine, setFirstLine] = useState("");
  const [fontSize, setFontSize] = useState("min(8vw, 38px)");
  const [arrowColorIndex, setArrowColorIndex] = useState(0);
  const [hoverSein, setHoverSein] = useState(false);
  const [hoverYellogg, setHoverYellogg] = useState(false);
  const [hoverAmanti, setHoverAmanti] = useState(false);
  
  // 웹사이트에서 사용한 색상 배열
  const arrowColors = ['#8ACBD9', '#F7CD48', '#6DC140', '#D8A423']; 
  
  // 화살표 색상을 주기적으로 변경하는 효과
  useEffect(() => {
    const interval = setInterval(() => {
      setArrowColorIndex((prevIndex) => (prevIndex + 1) % arrowColors.length);
    }, 1000); // 1초마다 색상 변경
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // 랜덤하게 이름 순서 결정 (0 또는 1)
    const randomOrder = Math.random() < 0.5;
    setFirstLine(randomOrder ? "홍세인과 이영건의" : "이영건과 홍세인의");
    
    // 화면 크기에 따라 글자 크기 설정
    const handleResize = () => {
      // 모바일 기기인지 확인 (화면 너비가 768px 미만인 경우)
      const isMobile = window.innerWidth < 768;
      // 아이폰의 경우 더 큰 폰트 사이즈 사용, 데스크탑은 작은 폰트 사이즈
      setFontSize(isMobile ? "min(10vw, 48px)" : "min(6vw, 38px)");
    };
    
    // 초기 실행
    handleResize();
    
    // 화면 크기 변경 시 글자 크기 조정
    window.addEventListener('resize', handleResize);
    
    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => window.removeEventListener('resize', handleResize);
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 링크를 위한 기본 스타일
  const linkStyle = {
    color: 'inherit',
    textDecoration: 'none',
    transition: 'color 0.3s ease'
  };

  // 호버 상태에 따른 스타일
  const seinStyle = {
    ...linkStyle,
    color: hoverSein ? '#FF80D2' : 'inherit'
  };

  const yellowggStyle = {
    ...linkStyle,
    color: hoverYellogg ? '#FF80D2' : 'inherit'
  };

  const amantiStyle = {
    ...linkStyle,
    color: hoverAmanti ? '#6DC140' : 'inherit'
  };

  // 링크 클릭 핸들러 - 이벤트 전파 중지
  const handleLinkClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 이벤트 버블링 중지
    // 클릭 시 모든 호버 상태 초기화
    setHoverSein(false);
    setHoverYellogg(false);
    setHoverAmanti(false);
  };

  // 이름 렌더링 함수
  const renderNameLine = () => {
    if (firstLine === "홍세인과 이영건의") {
      return (
        <>
          <a 
            href="http://instagram.com/seinandpopurri" 
            target="_blank" 
            rel="noopener noreferrer"
            style={seinStyle}
            onMouseEnter={() => setHoverSein(true)}
            onMouseLeave={() => setHoverSein(false)}
            onClick={handleLinkClick}
          >
            홍세인
          </a>
          과{" "}
          <a 
            href="http://instagram.com/misiio.here" 
            target="_blank" 
            rel="noopener noreferrer"
            style={yellowggStyle}
            onMouseEnter={() => setHoverYellogg(true)}
            onMouseLeave={() => setHoverYellogg(false)}
            onClick={handleLinkClick}
          >
            이영건
          </a>
          의
        </>
      );
    } else {
      return (
        <>
          <a 
            href="http://instagram.com/misiio.here" 
            target="_blank" 
            rel="noopener noreferrer"
            style={yellowggStyle}
            onMouseEnter={() => setHoverYellogg(true)}
            onMouseLeave={() => setHoverYellogg(false)}
            onClick={handleLinkClick}
          >
            이영건
          </a>
          과{" "}
          <a 
            href="http://instagram.com/seinandpopurri" 
            target="_blank" 
            rel="noopener noreferrer"
            style={seinStyle}
            onMouseEnter={() => setHoverSein(true)}
            onMouseLeave={() => setHoverSein(false)}
            onClick={handleLinkClick}
          >
            홍세인
          </a>
          의
        </>
      );
    }
  };

  return (
    <div 
      className="h-full w-full relative flex flex-col justify-center items-center"
      style={{ 
        backgroundColor: "#DEFE63", // 연두색 배경
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      {/* 흰색 배경 박스 - 좌우 꽉 차게, 높이 조절 가능 */}
      <div 
        className="w-full bg-white flex justify-center items-center" 
        style={{ 
          marginTop: "-80px",
          height: "auto", // 높이를 내용에 맞게 조절
          paddingTop: "20px",
          paddingBottom: "20px"
        }}
      >
        <div className="flex flex-col items-center justify-center w-full px-2">
          {/* 첫 번째 줄: 이영건과 홍세인의 */}
          <p
            className="w-full text-center font-bold"
            style={{ 
              color: "#6DC140",
              fontSize: fontSize, // 동적으로 설정된 글자 크기 적용
              marginBottom: "-8px", // 기존 마진 유지
              whiteSpace: "nowrap" // 줄바꿈 방지
            }}
          >
            {renderNameLine()}
          </p>

          {/* 두 번째 줄: 결혼식에 초대합니다 */}
          <p
            className="w-full text-center font-bold"
            style={{ 
              color: "#FFC82C",
              fontSize: fontSize, // 동적으로 설정된 글자 크기 적용
              marginBottom: "-8px", // 기존 마진 유지
              whiteSpace: "nowrap" // 줄바꿈 방지
            }}
          >
            결혼식에 초대합니다
          </p>

          {/* 날짜 */}
          <p
            className="w-full text-center font-bold"
            style={{ 
              color: "#72F596",
              fontSize: fontSize, // 동적으로 설정된 글자 크기 적용
              marginBottom: "-8px", // 기존 마진 유지
              whiteSpace: "nowrap" // 줄바꿈 방지
            }}
          >
            25년 6월 8일 일요일
          </p>

          {/* 시간 */}
          <p
            className="w-full text-center font-bold"
            style={{ 
              color: "#36BFCE",
              fontSize: fontSize, // 동적으로 설정된 글자 크기 적용
              marginBottom: "-8px", // 기존 마진 유지
              whiteSpace: "nowrap" // 줄바꿈 방지
            }}
          >
            오후 2시
          </p>

          {/* 장소 - 네이버 지도 링크 추가 */}
          <p
            className="w-full text-center font-bold"
            style={{ 
              color: "#FF80D2",
              fontSize: fontSize, // 동적으로 설정된 글자 크기 적용
              marginBottom: "0px", // 마지막 줄 마진 조정
              whiteSpace: "nowrap" // 줄바꿈 방지
            }}
          >
            <a 
              href="https://map.naver.com/v5/search/아만티%20호텔%20서울" 
              target="_blank" 
              rel="noopener noreferrer"
              style={amantiStyle}
              onMouseEnter={() => setHoverAmanti(true)}
              onMouseLeave={() => setHoverAmanti(false)}
              onClick={handleLinkClick}
            >
              아만티 호텔 서울
            </a>
          </p>
        </div>
      </div>
      
      {/* 깜빡이는 삼각형 화살표 버튼 */}
      <div 
        className="absolute left-1/2 transform -translate-x-1/2"
        style={{ 
          animation: "pulse 1.5s infinite ease-in-out",
          transition: "color 0.5s ease-in-out",
          zIndex: 10,
          top: "calc(50% + 120px)" // 화면 중앙에서 아래로 50px 위치시킴 (흰색 박스 바로 아래)
        }}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="30" 
          height="30" 
          viewBox="0 0 24 24" 
          fill={arrowColors[arrowColorIndex]} 
          stroke="none"
        >
          <polygon points="2,8 12,20 22,8" />
        </svg>
      </div>
    </div>
  );
}
