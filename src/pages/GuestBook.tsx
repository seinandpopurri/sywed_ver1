import React, { useState, useEffect } from 'react';
import { collection, addDoc, query, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

interface GuestBookProps {
  onBack: () => void;
}

interface GuestMessage {
  id: string;
  name: string;
  message: string;
  password: string;
  timestamp: Date;
}

const GuestBook: React.FC<GuestBookProps> = ({ onBack }) => {
  // 입력 상태
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [messages, setMessages] = useState<GuestMessage[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deletePassword, setDeletePassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // 메시지 불러오기
  const loadMessages = async () => {
    try {
      const q = query(collection(db, "guestMessages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);
      const loadedMessages: GuestMessage[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        loadedMessages.push({
          id: doc.id,
          name: data.name,
          message: data.message,
          password: data.password,
          timestamp: data.timestamp.toDate()
        });
      });
      
      setMessages(loadedMessages);
    } catch (error) {
      console.error("메시지 불러오기 오류:", error);
    }
  };
  
  // 컴포넌트 마운트 시 메시지 불러오기
  useEffect(() => {
    loadMessages();
  }, []);
  
  // 유효성 검사 및 에러 표시
  const showErrorPopup = (message: string) => {
    setErrorMessage(message);
    setShowError(true);
  };
  
  const validateForm = () => {
    if (!name.trim()) {
      showErrorPopup("이름을 입력해 주세요.");
      return false;
    }
    
    if (!password.trim() || password.length !== 4) {
      showErrorPopup("비밀번호 네 자리를 입력해 주세요.");
      return false;
    }
    
    if (!message.trim()) {
      showErrorPopup("메시지를 입력해 주세요.");
      return false;
    }
    
    return true;
  };
  
  // 메시지 추가
  const addMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      await addDoc(collection(db, "guestMessages"), {
        name,
        password,
        message,
        timestamp: new Date()
      });
      
      // 입력 필드 초기화
      setName("");
      setPassword("");
      setMessage("");
      
      // 메시지 다시 불러오기
      loadMessages();
    } catch (error) {
      console.error("메시지 추가 오류:", error);
      showErrorPopup("메시지를 저장하는 동안 오류가 발생했습니다.");
    }
  };
  
  // 삭제 모달 열기
  const openDeleteModal = (id: string) => {
    setDeleteId(id);
    setDeletePassword("");
    setIsDeleting(true);
  };
  
  // 메시지 삭제
  const deleteMessage = async () => {
    if (!deleteId) return;
    
    try {
      const messageToDelete = messages.find(msg => msg.id === deleteId);
      
      if (!messageToDelete) {
        showErrorPopup("메시지를 찾을 수 없습니다.");
        return;
      }
      
      // 비밀번호 확인 (일반 비밀번호 또는 마스터 비밀번호)
      if (deletePassword !== messageToDelete.password && deletePassword !== "5678") {
        showErrorPopup("비밀번호가 일치하지 않습니다.");
        return;
      }
      
      // 메시지 삭제
      await deleteDoc(doc(db, "guestMessages", deleteId));
      
      // 삭제 모달 닫기
      setIsDeleting(false);
      setDeleteId(null);
      setDeletePassword("");
      
      // 메시지 다시 불러오기
      loadMessages();
    } catch (error) {
      console.error("메시지 삭제 오류:", error);
      showErrorPopup("메시지를 삭제하는 동안 오류가 발생했습니다.");
    }
  };
  
  // 입력 필드 핸들러
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하고 4자리로 제한
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setPassword(value);
  };
  
  const handleDeletePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // 숫자만 입력 가능하고 4자리로 제한
    const value = e.target.value.replace(/[^0-9]/g, '').slice(0, 4);
    setDeletePassword(value);
  };
  
  return (
    <div className="relative w-full h-full flex flex-col items-center bg-pink-300 py-16 px-4">
      {/* 뒤로 가기 버튼 */}
      <button
        onClick={onBack}
        className="absolute top-[12px] left-4 z-[110] flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 18l-6-6 6-6"/>
        </svg>
      </button>
      
      {/* 메시지 입력 폼 */}
      <form className="w-full max-w-md mb-8">
        <div className="flex justify-between mb-4">
          <div className="w-[48%]">
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border-b border-gray-800 focus:outline-none px-0 py-1 bg-transparent appearance-none rounded-none"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
          <div className="w-[48%]">
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="text"
              inputMode="numeric"
              placeholder="숫자 4자리"
              value={password}
              onChange={handlePasswordChange}
              className="w-full border-b border-gray-800 focus:outline-none px-0 py-1 bg-transparent appearance-none rounded-none"
              style={{ WebkitAppearance: 'none' }}
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            placeholder="메시지"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border-b border-gray-800 focus:outline-none px-0 py-1 bg-transparent resize-none appearance-none rounded-none"
            style={{ WebkitAppearance: 'none' }}
            rows={2}
          />
        </div>
        
        <div className="flex justify-center">
          <button
            type="submit"
            onClick={addMessage}
            className="w-14 h-14 flex items-center justify-center focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#FFD700" className="w-12 h-12">
              <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
            </svg>
            <span className="absolute text-white text-sm font-bold">OK</span>
          </button>
        </div>
      </form>
      
      {/* 메시지 목록 */}
      <div className="w-full max-w-md">
        <div className="divide-y divide-gray-800">
          {messages.map((msg) => (
            <div key={msg.id} className="py-2 flex items-start">
              <div className="min-w-0 flex-1 flex">
                <div className="w-20 min-w-[5rem] font-medium text-sm overflow-hidden break-words mr-3">
                  {msg.name}
                </div>
                <div className="flex-1 text-sm overflow-hidden break-words">
                  {msg.message}
                </div>
              </div>
              <button 
                onClick={() => openDeleteModal(msg.id)}
                className="text-gray-800 hover:text-black ml-2 mt-0.5 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>
      
      {/* 삭제 모달 */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-4 shadow-xl">
            <button 
              onClick={() => {
                setIsDeleting(false);
                setDeleteId(null);
              }}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center mt-1">
              <p className="text-sm font-medium mb-2">메시지 삭제</p>
              <p className="text-xs mb-2">삭제하려면 비밀번호를 입력하세요.</p>
              
              <input
                type="text"
                value={deletePassword}
                onChange={handleDeletePasswordChange}
                className="w-full px-3 py-1 border-b border-gray-800 bg-transparent mb-3 text-center focus:outline-none text-sm"
                placeholder="비밀번호 입력"
                maxLength={4}
              />
              
              <button
                onClick={deleteMessage}
                className="bg-[#ff96d6] text-white px-3 py-1 rounded-md hover:bg-pink-500 transition-colors text-xs"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* 에러 팝업 */}
      {showError && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-[60]">
          <div className="relative bg-[#fffff8]/80 backdrop-blur-sm w-[60%] max-w-xs rounded-lg p-4 shadow-xl">
            <button 
              onClick={() => setShowError(false)}
              className="absolute top-2 left-2 bg-[#8acad9]/50 hover:bg-[#8acad9]/80 w-6 h-6 flex items-center justify-center rounded-full transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            
            <div className="text-center mt-1 mb-1">
              <p className="text-sm">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GuestBook;