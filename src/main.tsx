import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Install fetch interceptor for Supabase proxy in development
import './lib/fetch-proxy';

createRoot(document.getElementById("root")!).render(<App />);

// Expose a global helper function to clear session in case of issues
(window as any).clearSession = () => {
  // Clear localStorage
  const storageKeys = Object.keys(localStorage);
  storageKeys.forEach(key => {
    if (key.includes('supabase') || key.includes('auth') || key.includes('session')) {
      localStorage.removeItem(key);
    }
  });
  // Clear sessionStorage
  sessionStorage.clear();
  console.log('✅ Session cleared. Please refresh the page (F5) to login again.');
};

console.log('💡 Tip: If you have session issues, run clearSession() in this console, then refresh the page.');
