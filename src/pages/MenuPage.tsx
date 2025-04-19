import React from 'react';

interface MenuPageProps {
  onMenuSelect: (page: "gallery" | "photo" | "family" | "guestbook") => void;
}

const MenuPage: React.FC<MenuPageProps> = ({ onMenuSelect }) => {
  // 버튼 호버 효과를 위한 상태
  const [hoveredButton, setHoveredButton] = React.useState<string | null>(null);

  // 각 메뉴 버튼의 설정
  const menuButtons = [
    {
      id: 'gallery',
      name: '갤러리\n걷기',
      color: '#8ACBD9', // 하늘색/민트색
      hoverColor: '#5babb2', // 더 진한 하늘색
      position: 'top-left',
      onClick: () => onMenuSelect('gallery')
    },
    {
      id: 'photo',
      name: '세인\n영건과\n사진 찍기',
      color: '#FF80D2', // 핑크색
      hoverColor: '#e57bbf', // 더 진한 핑크색
      position: 'top-right',
      onClick: () => onMenuSelect('photo')
    },
    {
      id: 'family',
      name: '새로운\n가족 구성\n보기',
      color: '#6DC140', // 녹색
      hoverColor: '#639e36', // 더 진한 녹색
      position: 'bottom-left',
      onClick: () => onMenuSelect('family')
    },
    {
      id: 'guestbook',
      name: '인사\n남기기',
      color: '#F7CD48', // 노란색/금색
      hoverColor: '#d9be30', // 더 진한 노란색
      position: 'bottom-right',
      onClick: () => onMenuSelect('guestbook')
    }
  ];

  // 위치에 따른 클래스 결정
  const getPositionClass = (position: string) => {
    switch (position) {
      case 'top-left': return 'left-0 top-0';
      case 'top-right': return 'right-0 top-0';
      case 'bottom-left': return 'left-0 bottom-0';
      case 'bottom-right': return 'right-0 bottom-0';
      default: return '';
    }
  };

  return (
    <div 
      className="h-full w-full relative flex flex-col justify-center items-center"
      style={{ backgroundColor: "#F7F7F7" }}
    >
      <div 
        className="grid grid-cols-2 gap-0 w-10/12 aspect-square"
        style={{ marginTop: "-60px" }}
      >
        {menuButtons.map((button) => (
          <button
            key={button.id}
            onClick={button.onClick}
            onMouseEnter={() => setHoveredButton(button.id)}
            onMouseLeave={() => setHoveredButton(null)}
            onTouchStart={() => setHoveredButton(button.id)}
            onTouchEnd={() => setHoveredButton(null)}
            className="flex items-center justify-center text-white text-xl font-medium rounded-none"
            style={{
              backgroundColor: hoveredButton === button.id ? button.hoverColor : button.color,
              transition: 'background-color 0.2s ease-in-out',
              whiteSpace: 'pre-line',
              textAlign: 'center',
              lineHeight: '1.2',
              fontFamily: "'Noto Sans KR', sans-serif"
            }}
          >
            {button.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default MenuPage; 