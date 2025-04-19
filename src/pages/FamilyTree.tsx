import React, { useState } from 'react';

interface FamilyTreeProps {
  onBack: () => void;
}

// 가족 구성원 정보 타입
interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  phone?: string;
  bankAccount?: string;
  isChild?: boolean;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ onBack }) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);
  const [showGuide, setShowGuide] = useState(true);

  // 가족 구성원 데이터
  const familyMembers: FamilyMember[] = [
    { id: "yangkyunghee", name: "양경희", relation: "이은지, 이영건의 엄마", phone: "010-2017-7716", bankAccount: "100-1111-1111 농협" },
    { id: "leejungkil", name: "이정길", relation: "이은지, 이영건의 아빠", phone: "010-2354-9962", bankAccount: "100-2222-2222 농협" },
    { id: "leeunji", name: "이은지", relation: "양경희, 이정길의 딸\n이영건의 누나\n손상옥의 아내\n손현빈의 엄마", isChild: true },
    { id: "leeyounggun", name: "이영건", relation: "양경희, 이정길의 아들\n이은지의 동생", phone: "010-5104-9962", bankAccount: "110-274-870261 신한은행" },
    { id: "kimsieun", name: "김시은", relation: "홍세인, 홍세영의 엄마", phone: "010-9209-4919", bankAccount: "352-1887-6759-73 농협" },
    { id: "hongseongmyun", name: "홍성면", relation: "홍세인, 홍세영의 아빠", phone: "010-9749-0030", bankAccount: "100-4444-4444 농협" },
    { id: "hongsein", name: "홍세인", relation: "김시은, 홍성면의 딸\n홍세영의 언니", phone: "010-6470-8811", bankAccount: "100-190-830082 케이뱅크" },
    { id: "hongseeyoung", name: "홍세영", relation: "홍세인, 홍성면의 딸\n홍세인의 동생", isChild: true },
    { id: "mire", name: "밀레", relation: "홍세인, 이영건의 반려견", isChild: true },
  ];

  // 팝업 닫기 핸들러
  const closePopup = () => {
    setSelectedMember(null);
  };

  // 전화 걸기 함수
  const makePhoneCall = (phone: string) => {
    window.location.href = `tel:${phone}`;
  };

  // 문자 보내기 함수
  const sendSMS = (phone: string) => {
    window.location.href = `sms:${phone}`;
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* 배경 - 위아래 두 색상 */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#DEFE63] from-70% to-[#7fcd1b] to-30% z-0"></div>
      
      {/* 구름 이미지 */}
      <img 
        src="/cloud.svg" 
        alt="구름 1" 
        className="absolute z-10"
        style={{ 
          left: '7%',
          top: '25%',
          width: '30%'
        }}
      />

      {/* 두 번째 구름 이미지 */}
      <img 
        src="/cloud.svg" 
        alt="구름 2" 
        className="absolute z-10"
        style={{ 
          right: '10%',
          top: '18%',
          width: '25%'
        }}
      />
      
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[10px] left-1 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center overflow-hidden">
        {/* 안내 메시지 - 상단 배치 */}
        {showGuide && (
          <div className="absolute top-20 left-0 right-0 z-30 flex justify-center">
            <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-md text-center">
              <p className="text-sm font-regular text-gray-800 leading-tight">이름을 눌러서 정보를 확인하세요.</p>
              <p className="text-sm font-regular text-gray-800 leading-tight mt-0.5">화환은 정중히 사양합니다.</p>
            </div>
          </div>
        )}
        
        <div className="relative w-full h-full flex items-center justify-center mt-12">
          {/* SVG 이미지 */}
          <div className="relative w-full max-w-md">
            <img 
              src="/new_family_tree.svg" 
              alt="가족 트리" 
              className="w-full"
              style={{ 
                maxHeight: '75vh',
                objectFit: 'contain',
                marginTop: '20px'
              }}
            />
            
            {/* 1행: 양경희, 이정길, 김시은, 홍성면 */}
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[0]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '4%', top: '5%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[1]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '30%', top: '5%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[4]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '53%', top: '5%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[5]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '79%', top: '5%', width: '17%', height: '8%' }}
            />
            
            {/* 2행: 이은지, 이영건, 홍세인, 홍세영 */}
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[2]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '7%', top: '48%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[3]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '27%', top: '48%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[6]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '56%', top: '48%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[7]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '77%', top: '48%', width: '17%', height: '8%' }}
            />
            
            {/* 3행: 밀레 */}
            <button 
              onClick={() => {
                setSelectedMember(familyMembers[8]);
                setShowGuide(false);
              }} 
              className="absolute"
              style={{ left: '41%', top: '59%', width: '17%', height: '8%' }}
            />
          </div>
        </div>
      </div>
      
      {/* 가족 구성원 정보 팝업 */}
      {selectedMember && selectedMember.id !== "mire" && (
        <div className="fixed inset-0 flex items-center justify-center pt-4 z-[60] bg-black/30">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[85%] max-w-xs rounded-lg p-6 shadow-xl">
            {/* 닫기 버튼 - 연한 에메랄드색 원 */}
            <button 
              onClick={closePopup}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* 가족 구성원 정보 */}
            <div className="text-center mt-4">
              <h3 className="text-2xl font-bold mb-2">{selectedMember.name}</h3>
              
              {/* 이은지, 홍세영은 간격 추가 */}
              {selectedMember.id === "leeunji" || selectedMember.id === "hongseeyoung" ? (
                <p className="whitespace-pre-line mb-4 text-m mt-3">{selectedMember.relation}</p>
              ) : (
                <p className="whitespace-pre-line mb-4 text-m">{selectedMember.relation}</p>
              )}
              
              {/* 이은지, 홍세영은 기존 레이아웃 유지 */}
              {selectedMember.id === "leeunji" || selectedMember.id === "hongseeyoung" ? (
                <></>
              ) : (
                <>
                  {/* 전화번호와 버튼 */}
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-left flex-1 text-sm">{selectedMember.phone}</p>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => makePhoneCall(selectedMember.phone || '')}
                        className="bg-[#6DC140] text-white px-3 py-1 rounded-md text-xs"
                      >
                        전화
                      </button>
                      <button 
                        onClick={() => sendSMS(selectedMember.phone || '')}
                        className="bg-[#6DC140] text-white px-3 py-1 rounded-md text-xs"
                      >
                        문자
                      </button>
                    </div>
                  </div>
                  
                  {/* 계좌번호 - 복사 버튼 없이 전화번호와 같은 스타일로 표시 */}
                  {selectedMember.bankAccount && (
                    <div className="flex items-center mb-1">
                      <p className="text-left flex-1 text-sm">{selectedMember.bankAccount}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 밀레 특별 팝업 */}
      {selectedMember && selectedMember.id === "mire" && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/30">
          <div className="relative w-[80%] max-w-xs">
            <img 
              src="/family_millet_01.jpg" 
              alt="밀레" 
              className="w-full h-auto rounded-lg shadow-xl"
              onError={(e) => {
                console.error("이미지 로딩 실패:", e);
                const target = e.target as HTMLImageElement;
                // 절대 경로로 시도
                target.src = "https://raw.githubusercontent.com/seinandpopurri/sywed_ver1/main/public/family_millet_01.jpg";
              }}
            />
            {/* 닫기 버튼 - 연한 에메랄드색 원 */}
            <button 
              onClick={closePopup}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FamilyTree; 