import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접속 허용
    hmr: {
      overlay: true, // 오류가 발생할 때 화면에 오버레이 표시
    },
    watch: {
      usePolling: true, // 폴링 방식으로 파일 변경 감지 (특정 환경에서 필요할 수 있음)
    }
  },
  preview: {
    host: '0.0.0.0' // 프리뷰 서버도 모든 네트워크 인터페이스에서 접속 허용
  }
});
