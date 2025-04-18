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
  isChild?: boolean;
}

const FamilyTree: React.FC<FamilyTreeProps> = ({ onBack }) => {
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null);

  // 가족 구성원 데이터
  const familyMembers: FamilyMember[] = [
    { id: "yangkyunghee", name: "양경희", relation: "이은지, 이영건의 엄마", phone: "010-1111-1111" },
    { id: "leejungkil", name: "이정길", relation: "이은지, 이영건의 아빠", phone: "010-2222-2222" },
    { id: "leeunji", name: "이은지", relation: "양경희, 이정길의 딸\n이영건의 누나\n손상옥의 아내\n손현빈의 엄마", isChild: true },
    { id: "leeyounggun", name: "이영건", relation: "양경희, 이정길의 아들", phone: "010-5104-9962" },
    { id: "kimsieun", name: "김시은", relation: "홍세인, 홍성면의 아빠", phone: "010-3333-3333" },
    { id: "hongseongmyun", name: "홍성면", relation: "홍세인, 홍세영의 아빠", phone: "010-9749-0030" },
    { id: "hongsein", name: "홍세인", relation: "김시은, 홍성면의 아들", phone: "010-4444-4444" },
    { id: "hongseeyoung", name: "홍세영", relation: "홍세인, 홍성면의 딸", isChild: true },
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
      <div className="absolute inset-0 bg-gradient-to-b from-[#dcfa88] from-70% to-[#7fcd1b] to-30% z-0"></div>
      
      {/* 구름 이미지 */}
      <img 
        src="/cloud.svg" 
        alt="구름 1" 
        className="absolute z-10"
        style={{ 
          left: '7%',
          top: '16%',
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
          top: '10%',
          width: '25%'
        }}
      />
      
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[12px] left-4 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      <div className="relative z-20 w-full h-full flex flex-col items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* SVG 이미지 */}
          <div className="relative w-full max-w-md">
            <img 
              src="/new_family_tree.svg" 
              alt="가족 트리" 
              className="w-full"
              style={{ maxHeight: '85vh', objectFit: 'contain' }}
            />
            
            {/* 1행: 양경희, 이정길, 김시은, 홍성면 */}
            <button 
              onClick={() => setSelectedMember(familyMembers[0])} 
              className="absolute"
              style={{ left: '4%', top: '1%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[1])} 
              className="absolute"
              style={{ left: '30%', top: '1%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[4])} 
              className="absolute"
              style={{ left: '53%', top: '1%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[5])} 
              className="absolute"
              style={{ left: '79%', top: '1%', width: '17%', height: '8%' }}
            />
            
            {/* 2행: 이은지, 이영건, 홍세인, 홍세영 */}
            <button 
              onClick={() => setSelectedMember(familyMembers[2])} 
              className="absolute"
              style={{ left: '7%', top: '44%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[3])} 
              className="absolute"
              style={{ left: '27%', top: '44%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[6])} 
              className="absolute"
              style={{ left: '56%', top: '44%', width: '17%', height: '8%' }}
            />
            
            <button 
              onClick={() => setSelectedMember(familyMembers[7])} 
              className="absolute"
              style={{ left: '77%', top: '44%', width: '17%', height: '8%' }}
            />
            
            {/* 3행: 밀레 */}
            <button 
              onClick={() => setSelectedMember(familyMembers[8])} 
              className="absolute"
              style={{ left: '41%', top: '55%', width: '17%', height: '8%' }}
            />
          </div>
        </div>
      </div>
      
      {/* 가족 구성원 정보 팝업 */}
      {selectedMember && selectedMember.id !== "mire" && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] bg-black/30">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-6 shadow-xl">
            {/* 닫기 버튼 - 연한 에메랄드색 원 */}
            <button 
              onClick={closePopup}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            {/* 가족 구성원 정보 */}
            <div className="text-center mt-4">
              <h3 className="text-2xl font-bold mb-4">{selectedMember.name}</h3>
              <p className="whitespace-pre-line mb-4">{selectedMember.relation}</p>
              
              {selectedMember.phone && !selectedMember.isChild && (
                <>
                  <p className="mb-6">{selectedMember.phone}</p>
                  <div className="flex space-x-4 justify-center">
                    <button 
                      onClick={() => makePhoneCall(selectedMember.phone || '')}
                      className="bg-[#6DC140] text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                    >
                      전화
                    </button>
                    <button 
                      onClick={() => sendSMS(selectedMember.phone || '')}
                      className="bg-[#6DC140] text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors"
                    >
                      문자
                    </button>
                  </div>
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
            />
            {/* 닫기 버튼 - 연한 에메랄드색 원 */}
            <button 
              onClick={closePopup}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-7 h-7 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
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