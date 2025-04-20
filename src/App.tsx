import { useEffect, useRef, useState } from "react";
import Part1 from "./Part1";
import "./index.css";
import MenuPage from "./pages/MenuPage";
import GalleryWalk from "./pages/GalleryWalk";
import PhotoWithUs from "./pages/PhotoWithUs";
import FamilyTree from "./pages/FamilyTree";
import GuestBook from "./pages/GuestBook";

// 페이지 타입 정의
type PageType = "home" | "menu" | "gallery" | "photo" | "family" | "guestbook";

export default function App() {
  const [showHeader, setShowHeader] = useState(false);
  const [showDirectionPad, setShowDirectionPad] = useState(false);
  const [currentPage, setCurrentPage] = useState<PageType>("home");
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({
    home: null,
    menu: null
  });

  useEffect(() => {
    // 페이지 로드 시 맨 위로 스크롤 (최초 로드시에만 실행)
    scrollRef.current?.scrollTo({ top: 0 });
  }, []);

  // 페이지 변경시 헤더 표시 여부 설정 (별도의 useEffect로 분리)
  useEffect(() => {
    // 서브 페이지인 경우 헤더 표시
    if (currentPage !== "home" && currentPage !== "menu") {
      setShowHeader(true);
    }
  }, [currentPage]);

  // 스크롤 이벤트 핸들러
  const handleScroll = () => {
    if (!scrollRef.current) return;
    
    const scrollTop = scrollRef.current.scrollTop;
    const screenHeight = scrollRef.current.offsetHeight;
    
    // 헤더 표시 여부 설정 - 첫 번째 페이지를 지나면 표시
    setShowHeader(scrollTop >= screenHeight * 0.5);

    // 현재 화면의 위치에 따라 페이지 상태 업데이트
    if (scrollTop < screenHeight * 0.5) {
      // 홈 페이지 영역
      if (currentPage === "home" || currentPage === "menu") {
        setCurrentPage("home");
      }
    } else {
      // 메뉴 페이지 영역
      if (currentPage === "home" || currentPage === "menu") {
        setCurrentPage("menu");
      }
    }
  };

  useEffect(() => {
    const ref = scrollRef.current;
    
    // 현재 페이지가 갤러리일 때 방향 패드 표시
    setShowDirectionPad(currentPage === "gallery");
    
    if (ref && (currentPage === "home" || currentPage === "menu")) {
      ref.addEventListener("scroll", handleScroll);
    }
    
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentPage]);

  useEffect(() => {
    const ref = scrollRef.current;
    
    // 현재 페이지가 갤러리일 때 방향 패드 표시
    setShowDirectionPad(currentPage === "gallery");
    
    if (ref && (currentPage === "home" || currentPage === "menu")) {
      ref.addEventListener("scroll", handleScroll);
    }
    
    // 갤러리, 사진, 가족, 방명록 페이지일 때만 스크롤 위치를 초기화
    // 홈과 메뉴 페이지 사이에는 스크롤을 자유롭게 허용
    if (ref && currentPage !== "home" && currentPage !== "menu") {
      // 즉시 스크롤 초기화
      ref.scrollTo({ top: 0 });
      
      // Vercel 배포 환경에서의 안정성을 위해 지연 후 한번 더 초기화
      setTimeout(() => {
        if (ref) {
          ref.scrollTo({ top: 0 });
        }
      }, 100);
    }
    
    return () => {
      if (ref) {
        ref.removeEventListener("scroll", handleScroll);
      }
    };
  }, [currentPage]);

  // 메뉴 페이지로 이동하는 함수
  const goToMenu = () => {
    sectionRefs.current.menu?.scrollIntoView({ behavior: 'smooth' });
    setCurrentPage("menu");
  };

  // 메뉴 페이지에서 특정 메뉴 선택 시 호출되는 함수
  const handleMenuSelect = (page: PageType) => {
    // 스크롤 이벤트 제거
    const ref = scrollRef.current;
    if (ref) {
      ref.removeEventListener("scroll", handleScroll);
      
      // home과 menu가 아닌 서브페이지로 이동할 때만 스크롤 초기화
      if (page !== "home" && page !== "menu") {
        // 스크롤 위치를 맨 위로 초기화
        ref.scrollTo({ top: 0 });
        
        // 약간의 지연 후 스크롤 위치를 다시 확인하고 초기화 (Vercel 환경 대응)
        setTimeout(() => {
          if (ref) {
            ref.scrollTo({ top: 0 });
          }
        }, 100);
      }
    }
    
    // 페이지 상태 업데이트
    setCurrentPage(page);
  };

  // 서브 페이지에서 메뉴 페이지로 돌아가는 함수
  const goBackToMenu = () => {
    // 페이지 상태 먼저 변경
    setCurrentPage("menu");
    
    // 메뉴 페이지로 바로 스크롤 - requestAnimationFrame 사용하여 DOM 업데이트 후 실행
    requestAnimationFrame(() => {
      if (scrollRef.current && sectionRefs.current.menu) {
        const screenHeight = scrollRef.current.offsetHeight;
        scrollRef.current.scrollTop = screenHeight; // 첫 페이지 높이만큼 스크롤
      }
      
      // 스크롤 이벤트 리스너 추가
      setTimeout(() => {
        const ref = scrollRef.current;
        if (ref) {
          ref.addEventListener("scroll", handleScroll);
        }
      }, 100);
    });
  };

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

  // 현재 페이지에 따라 렌더링할 컴포넌트 결정
  const renderPage = () => {
    switch (currentPage) {
      case "home":
      case "menu":
        return (
          <>
            <section 
              ref={(el) => { sectionRefs.current.home = el; }} 
              className="h-full"
              onClick={goToMenu}
            >
              <Part1 />
            </section>
            <section 
              ref={(el) => { sectionRefs.current.menu = el; }} 
              className="h-full"
            >
              <MenuPage onMenuSelect={handleMenuSelect} />
            </section>
          </>
        );
      case "gallery":
        return <GalleryWalk key="gallery-walk" onBack={goBackToMenu} scrollContainerRef={scrollRef} />;
      case "photo":
        return <PhotoWithUs onBack={goBackToMenu} />;
      case "family":
        return <FamilyTree onBack={goBackToMenu} />;
      case "guestbook":
        return <GuestBook onBack={goBackToMenu} />;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#F7F7F7] flex justify-center items-center relative">
      {showDirectionPad && (
        <div
          className="absolute z-[100] bottom-[18%] lg:bottom-[8%]"
          style={{
            width: "140px",
            height: "140px",
            left: "50%",
            transform: "translateX(-50%)",
            paddingBottom: "env(safe-area-inset-bottom, 0px)"
          }}
        >
          <div className="relative w-full h-full rounded-full bg-white/90 shadow-lg flex items-center justify-center backdrop-blur-sm border-gray-300">
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
                  width: "42px",
                  height: "42px",
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
        className="relative overflow-hidden shadow-xl"
        style={{ width: "393px", height: "852px", maxHeight: "100vh" }}
      >
        {/* 서브페이지이거나 스크롤이 충분히 내려간 경우 헤더 표시 */}
        {(currentPage !== "home" || showHeader) && (
          <div
            className="absolute top-0 left-0 w-full bg-white/80 text-center py-2 z-[100] backdrop-blur-sm no-select"
            style={{ 
              paddingTop: "calc(env(safe-area-inset-top, 0px) + 8px)",
              left: 0,
              right: 0
            }}
          >
            <p className="text-xs mx-auto">
              2025. 6. 8. Sun. 2:00 p.m. {" "}
              <a
                href="https://map.naver.com/v5/search/아만티%20호텔%20서울"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#FF80D2] transition-colors duration-200"
              >
                아만티 호텔 서울
              </a>
            </p>
            <p className="text-xs mx-auto">홍세인과 이영건의 결혼식에 초대합니다.</p>
          </div>
        )}

        <div
          ref={scrollRef}
          className="h-full w-full overflow-y-auto overflow-x-hidden hide-scrollbar"
          style={{ 
            touchAction: "pan-y", 
            overscrollBehavior: "contain"
          }}
        >
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
