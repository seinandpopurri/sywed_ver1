import { useEffect, useRef, useState } from "react";
import Part1 from "./Part1";
import Part2 from "./Part2";
import Part3 from "./Part3";
import Part4 from "./Part4";
import Part5 from "./Part5";
import "./index.css";

export default function App() {
  const [showHeader, setShowHeader] = useState(false);
  const [showDirectionPad, setShowDirectionPad] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 페이지 로드 시 맨 위로 스크롤
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollRef.current) return;
      
      const scrollTop = scrollRef.current.scrollTop;
      const screenHeight = scrollRef.current.offsetHeight;
      
      // 헤더 표시 여부 설정
      setShowHeader(scrollTop >= screenHeight * 0.5);

      // 파트3 감지 및 방향 패드 표시 여부 설정
      const sectionElements = scrollRef.current.querySelectorAll("section");
      const part3Section = sectionElements[2];
      
      if (part3Section) {
        const part3Rect = part3Section.getBoundingClientRect();
        const containerRect = scrollRef.current.getBoundingClientRect();
        
        // 파트3이 화면에 보이는지 확인
        const part3Top = part3Rect.top - containerRect.top;
        const part3Bottom = part3Rect.bottom - containerRect.top;
        const viewportHeight = containerRect.height;
        
        // 파트3이 화면에 충분히 표시될 때만 컨트롤러 표시
        const visibleHeight = Math.min(part3Bottom, viewportHeight) - Math.max(part3Top, 0);
        const isPart3Visible = 
          visibleHeight > 0 && 
          visibleHeight > viewportHeight * 0.5;
        
        setShowDirectionPad(isPart3Visible);
      }
    };

    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", handleScroll);
    }
    
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const startMoving = (dir: string) => {
    window.dispatchEvent(new CustomEvent("move", { detail: dir }));
    intervalRef.current = setInterval(() => {
      window.dispatchEvent(new CustomEvent("move", { detail: dir }));
    }, 150);
  };

  const stopMoving = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current as unknown as number);
      intervalRef.current = null;
    }
  };

  return (
    <div className="w-screen h-screen bg-sky-100 flex justify-center items-center relative">
      {showDirectionPad && (
        <div
          className="absolute z-[100] bottom-[18%] lg:bottom-[8%]"
          style={{
            width: "110px",
            height: "110px",
            left: "50%",
            transform: "translateX(-50%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          <div className="relative w-full h-full rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm border-2 border-gray-300">
            {/* 방향키 버튼들 */}
            {[
              {
                dir: "up",
                icon: "↑",
                style: {
                  top: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius: "40%",
                },
              },
              {
                dir: "down",
                icon: "↓",
                style: {
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  borderRadius: "40%",
                },
              },
              {
                dir: "left",
                icon: "←",
                style: {
                  top: "50%",
                  left: "8px",
                  transform: "translateY(-50%)",
                  borderRadius: "40%",
                },
              },
              {
                dir: "right",
                icon: "→",
                style: {
                  top: "50%",
                  right: "8px",
                  transform: "translateY(-50%)",
                  borderRadius: "40%",
                },
              },
            ].map((btn, i) => (
              <button
                key={i}
                type="button"
                className="no-select-btn"
                onPointerDown={() => startMoving(btn.dir)}
                onPointerUp={stopMoving}
                onPointerLeave={stopMoving}
                onPointerCancel={stopMoving}
                onContextMenu={(e) => e.preventDefault()}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  width: "32px",
                  height: "32px",
                  backgroundColor: "#f1f1f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                  border: "1px solid #d1d1d1",
                  color: "#4b4b4b",
                  fontSize: "16px",
                  fontWeight: "bold",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  ...btn.style,
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                  const transform = btn.dir === "up" || btn.dir === "down"
                    ? "translateX(-50%) scale(0.95)"
                    : "translateY(-50%) scale(0.95)";
                  e.currentTarget.style.transform = transform;
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f1f1";
                  const transform = btn.dir === "up" || btn.dir === "down"
                    ? "translateX(-50%)"
                    : "translateY(-50%)";
                  e.currentTarget.style.transform = transform;
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                  const transform = btn.dir === "up" || btn.dir === "down"
                    ? "translateX(-50%) scale(0.95)"
                    : "translateY(-50%) scale(0.95)";
                  e.currentTarget.style.transform = transform;
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = "#f1f1f1";
                  const transform = btn.dir === "up" || btn.dir === "down"
                    ? "translateX(-50%)"
                    : "translateY(-50%)";
                  e.currentTarget.style.transform = transform;
                }}
              >
                {btn.icon}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className="relative overflow-hidden shadow-xl rounded-xl"
        style={{ width: "393px", height: "852px", maxHeight: "100vh" }}
      >
        {showHeader && (
          <div
            className="absolute top-0 left-0 w-full bg-white/80 text-center py-2 z-50 backdrop-blur-sm"
            style={{ 
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)"
            }}
          >
            <p className="text-xs">
              2025. 6. 8. (Sun) 2:00 p.m.{" "}
              <a
                href="https://map.naver.com/v5/search/아만티%20호텔%20서울"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#3b82f6] transition-colors duration-200"
              >
                아만티 호텔 서울
              </a>
            </p>
            <p className="text-xs">홍세인과 이영건의 결혼식에 초대합니다.</p>
          </div>
        )}

        <div
          ref={scrollRef}
          className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar"
          style={{ 
            touchAction: "pan-y", 
            overscrollBehavior: "contain",
            scrollBehavior: "smooth" 
          }}
        >
          <section className="h-full">
            <Part1 />
          </section>
          <section className="h-full">
            <Part2 />
          </section>
          <section
            className="bg-pink-200"
            style={{ 
              height: `${(48 + 4 + 3) * 36}px`, // LAST_PHOTO_Y + PHOTO_HEIGHT + EXTRA_BOTTOM_SPACE * TILE_SIZE
              paddingBottom: "20px",
              marginBottom: "-20px"
            }}
          >
            <Part3 scrollContainerRef={scrollRef} />
          </section>

          <section className="h-full overflow-hidden">
            <Part4 paddingTop={20} />
          </section>

          <section className="h-full bg-white">
            <Part5 />
          </section>
        </div>
      </div>
    </div>
  );
}
