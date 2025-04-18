import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Firebase 구성 - 콘솔에서 복사한 값으로 대체
// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyB06pvaAXgDPFmpO474dKzsLj2IbDOqFZ8",
    authDomain: "sy-wed-guestbook.firebaseapp.com",
    projectId: "sy-wed-guestbook",
    storageBucket: "sy-wed-guestbook.firebasestorage.app",
    messagingSenderId: "177303815222",
    appId: "1:177303815222:web:8dbce07ac5052d4ed38497"
  };

  // Firebase 초기화
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);