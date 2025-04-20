import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Firebase 구성 - 콘솔에서 복사한 값으로 대체
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB06pvaAXgDPFmpO474dKzsLj2IbDOqFZ8",
    authDomain: "sy-wed-guestbook.firebaseapp.com",
    projectId: "sy-wed-guestbook",
    storageBucket: "sy-wed-guestbook.appspot.com", // 올바른 형식: project-id.appspot.com
    messagingSenderId: "177303815222",
    appId: "1:177303815222:web:8dbce07ac5052d4ed38497"
};

console.log("Firebase 설정 초기화:", firebaseConfig);

// Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Firebase 연결 테스트
const testFirebaseConnection = async () => {
  try {
    console.log("Firebase 연결 테스트 시작...");
    
    // Firestore 연결 테스트
    try {
      // 오프라인 지원 활성화
      await enableIndexedDbPersistence(db)
        .catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('Firestore 다중 탭 오류:', err);
          } else if (err.code === 'unimplemented') {
            console.warn('브라우저가 오프라인 저장소를 지원하지 않습니다:', err);
          }
        });
      
      console.log("Firestore 연결 성공");
    } catch (error) {
      console.error("Firestore 연결 테스트 실패:", error);
    }
    
    console.log("Firebase 연결 테스트 완료");
  } catch (error) {
    console.error("Firebase 연결 테스트 중 오류 발생:", error);
  }
};

// 연결 테스트 실행
testFirebaseConnection();

// Firebase 연결 상태 확인
console.log("Firebase 앱 초기화 완료:", app.name);
console.log("Firestore 초기화 완료");
console.log("Storage 초기화 완료");