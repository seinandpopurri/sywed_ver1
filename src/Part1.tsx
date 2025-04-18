import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Part1() {
  const naverMapLink = "https://map.naver.com/v5/search/아만티%20호텔%20서울";
  const [firstLine, setFirstLine] = useState("");

  useEffect(() => {
    // 랜덤하게 이름 순서 결정 (0 또는 1)
    const randomOrder = Math.random() < 0.5;
    setFirstLine(randomOrder ? "홍세인과 이영건의" : "이영건과 홍세인의");
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  // 첫 번째 부분만 배열로 유지
  const titleLines = [
    firstLine, // 랜덤하게 결정된 이름 순서
    "결혼식에",
    "초대합니다.",
  ];

  return (
    <div 
      className="h-full w-full relative px-4 text-white"
      style={{ 
        backgroundColor: "#3b82f6", // 파란색 배경으로 되돌리기
        fontFamily: "'Noto Sans KR', sans-serif"
      }}
    >
      {/* ⬆️ 전체를 위로 올리기 위한 flex 설정 */}
      <div 
        className="flex flex-col items-center"
        style={{ paddingTop: "100px" }} // 인라인 스타일로 패딩 적용
      >
        {/* 임시 GIF 자리 (200x200 흰색 박스) */}
        <div className="w-[200px] h-[200px] bg-white mb-12 rounded-md shadow-md" />

        {/* 제목 부분 */}
        {titleLines.map((line, index) => (
          <motion.p
            key={index}
            className="text-center leading-tight text-2xl md:text-3xl font-bold mt-1"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: index * 0.35,
              duration: 0.8,
              ease: "easeOut",
            }}
          >
            {line}
          </motion.p>
        ))}

        {/* 공백 */}
        <div className="h-6"></div>
        <div className="h-6"></div>

        {/* 날짜/시간/장소 부분 - 직접 작성 */}
        <motion.p
          className="text-center text-sm mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 3 * 0.35, duration: 0.8, ease: "easeOut" }}
        >
          2025년 6월 8일 일요일 2시
        </motion.p>
        <motion.p
          className="text-center text-sm mt-1"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 * 0.35, duration: 0.8, ease: "easeOut" }}
        >
          <a
            href={naverMapLink}
            target="_blank"
            rel="noopener noreferrer"
            className="no-underline hover:text-[#bfdbfe] transition-colors duration-200"
          >
            아만티 호텔 서울
          </a>
        </motion.p>
      </div>

      {/* 하단 여백 */}
      <div className="h-4" />
    </div>
  );
}
