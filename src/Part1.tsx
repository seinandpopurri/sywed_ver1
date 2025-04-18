import { useState, useEffect } from "react";

export default function Part1() {
  const [firstLine, setFirstLine] = useState("");

  useEffect(() => {
    // 랜덤하게 이름 순서 결정 (0 또는 1)
    const randomOrder = Math.random() < 0.5;
    setFirstLine(randomOrder ? "홍세인과 이영건의" : "이영건과 홍세인의");
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  return (
    <div 
      className="h-full w-full relative flex flex-col justify-center items-center"
      style={{ 
        backgroundColor: "#d8ff5c", // 연두색 배경
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      {/* 흰색 배경 박스 - 좌우 꽉 차게, 높이 조절 가능 */}
      <div 
        className="w-full bg-white py-12" 
        style={{ 
          marginTop: "-80px"
          /* 여기서 py-12 값을 조절하여 위아래 패딩(높이)를 조절할 수 있습니다 */
          /* 예: py-16 (더 큰 패딩), py-8 (더 작은 패딩) */
        }}
      >
        <div className="flex flex-col items-center w-full px-4">
          {/* 첫 번째 줄: 이영건과 홍세인의 */}
          <p
            className="w-full text-center text-4xl font-bold mb-2"
            style={{ color: "#7ab43a" }} // 녹색
          >
            {firstLine}
          </p>

          {/* 두 번째 줄: 결혼식에 초대합니다 */}
          <p
            className="w-full text-center text-4xl font-bold mb-8"
            style={{ color: "#ffcc33" }} // 노란색/황금색
          >
            결혼식에 초대합니다
          </p>

          {/* 날짜 */}
          <p
            className="w-full text-center text-4xl font-bold mb-2"
            style={{ color: "#66ff99" }} // 민트색
          >
            25년 6월 8일 일요일
          </p>

          {/* 시간 */}
          <p
            className="w-full text-center text-4xl font-bold mb-2"
            style={{ color: "#33cccc" }} // 청록색
          >
            오후 2시
          </p>

          {/* 장소 */}
          <p
            className="w-full text-center text-4xl font-bold"
            style={{ color: "#ff99cc" }} // 핑크색
          >
            아만티 호텔 서울
          </p>
        </div>
      </div>
    </div>
  );
}
