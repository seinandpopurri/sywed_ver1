import { motion } from "framer-motion";

export default function Part1() {
  const naverMapLink = "https://map.naver.com/v5/search/아만티%20호텔%20서울";

  const lines = [
    "홍세인 이영건의",
    "결혼식에",
    "초대합니다.",
    "", // 공백 한 줄
    "2025년 6월 8일 일요일 2시",
    "아만티 호텔 서울",
    "서울시 마포구 월드컵북로 31",
  ];

  return (
    <div className="h-full w-full bg-yellow-200 relative px-4">
      {/* ⬆️ 전체를 위로 올리기 위한 flex 설정 */}
      <div className="flex flex-col items-center pt-16">
        {/* 임시 GIF 자리 (200x200 흰색 박스) */}
        <div className="w-[200px] h-[200px] bg-white mb-4 rounded-md shadow-md" />

        {/* 텍스트 라인들 */}
        {lines.map((line, index) => {
          if (line === "") return <div key={index} className="h-4" />;

          return (
            <motion.p
              key={index}
              className={`text-center leading-tight ${
                index < 3 ? "text-xl font-bold" : "text-sm"
              } mt-1`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.35, // ⏱ 느리게: 한 줄당 0.35초
                duration: 0.8, // ⏱ 등장 속도도 여유롭게
                ease: "easeOut",
              }}
            >
              {line.includes("아만티") ? (
                <a
                  href={naverMapLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="no-underline hover:text-[#3b82f6] transition-colors duration-200"
                >
                  {line}
                </a>
              ) : (
                line
              )}
            </motion.p>
          );
        })}
      </div>

      {/* 마지막 줄과 화살표 사이 여백 두 줄 */}
      <div className="h-4" />
      <div className="h-4" />

      {/* 깜빡이는 아래 삼각형 */}
      <motion.div
        className="text-center animate-bounce text-xl text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: lines.length * 0.35 + 0.5 }}
      >
        <span className="inline-block">▼</span>
      </motion.div>
    </div>
  );
}
