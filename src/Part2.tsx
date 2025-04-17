export default function Part2() {
  const naverMapLink = "https://map.naver.com/v5/search/아만티%20호텔%20서울";

  return (
    <div className="h-full w-full bg-blue-200 relative flex justify-center items-center">
      {/* 사진: 정중앙 정렬 */}
      <img
        src="/hi.jpg"
        alt="우리 사진"
        className="w-[300px] h-[400px] object-cover shadow-md"
        style={{ transform: "translateY(-32px)" }}
      />
    </div>
  );
}
