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
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = scrollRef.current?.scrollTop ?? 0;
      const screenHeight = scrollRef.current?.offsetHeight ?? 0;
      setShowHeader(scrollTop >= screenHeight * 0.9);

      const sectionElements =
        scrollRef.current?.querySelectorAll("section") ?? [];
      const part3Section = sectionElements[2];

      if (part3Section && scrollRef.current) {
        const part3Rect = part3Section.getBoundingClientRect();
        const containerRect = scrollRef.current.getBoundingClientRect();
        const isPart3InView =
          part3Rect.bottom > containerRect.top &&
          part3Rect.top < containerRect.bottom;
        setShowDirectionPad(isPart3InView);
      }
    };

    const ref = scrollRef.current;
    ref?.addEventListener("scroll", handleScroll);
    return () => ref?.removeEventListener("scroll", handleScroll);
  }, []);

  const startMoving = (dir: string) => {
    window.dispatchEvent(new CustomEvent("move", { detail: dir }));
    intervalRef.current = setInterval(() => {
      window.dispatchEvent(new CustomEvent("move", { detail: dir }));
    }, 150);
  };

  const stopMoving = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return (
    <div className="w-screen h-screen bg-sky-100 flex justify-center items-center relative">
      {showDirectionPad && (
        <div
          className="absolute z-50 bottom-[120px] lg:bottom-[60px]"
          style={{
            width: "96px",
            height: "96px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="relative w-full h-full rounded-full bg-white shadow-md flex items-center justify-center">
            {[
              {
                dir: "up",
                style: {
                  top: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                },
              },
              {
                dir: "down",
                style: {
                  bottom: "8px",
                  left: "50%",
                  transform: "translateX(-50%)",
                },
              },
              {
                dir: "left",
                style: {
                  top: "50%",
                  left: "8px",
                  transform: "translateY(-50%)",
                },
              },
              {
                dir: "right",
                style: {
                  top: "50%",
                  right: "8px",
                  transform: "translateY(-50%)",
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
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#e5e7eb",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "background-color 0.2s",
                  ...btn.style,
                }}
                onTouchStart={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9a8d4";
                }}
                onTouchEnd={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseDown={(e) => {
                  e.currentTarget.style.backgroundColor = "#f9a8d4";
                }}
                onMouseUp={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div
        className="relative overflow-hidden shadow-xl rounded-xl"
        style={{ width: "393px", height: "852px" }}
      >
        {showHeader && (
          <div
            className="absolute top-0 left-0 w-full bg-white/60 text-center py-2 z-10"
            style={{ width: "100%", maxWidth: "393px" }}
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
          className="h-full w-full overflow-y-scroll overflow-x-hidden snap-y snap-mandatory scroll-smooth hide-scrollbar"
          style={{ touchAction: "pan-y", overscrollBehavior: "contain" }}
        >
          <section className="h-full snap-start">
            <Part1 />
          </section>
          <section className="h-full snap-start">
            <Part2 />
          </section>
          <section
            className="snap-start bg-pink-200"
            style={{ height: `${36 * 55}px` }} // ✅ 높이 줄임
          >
            <Part3 scrollContainerRef={scrollRef} />
          </section>

          <section className="h-full snap-start bg-green-200">
            <Part4 paddingTop={100} />
          </section>

          <section className="h-full snap-start">
            <Part5 />
          </section>
        </div>
      </div>
    </div>
  );
}
