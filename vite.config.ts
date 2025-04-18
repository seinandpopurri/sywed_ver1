import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      overlay: true, // 오류가 있을 때 오버레이 표시
      timeout: 1000, // HMR 연결 제한 시간 (밀리초)
    },
    watch: {
      usePolling: true, // 파일 변경 감지를 폴링 방식으로 사용 (더 안정적)
      interval: 100, // 폴링 간격 (밀리초)
    }
  },
});
