import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { Timer, LayoutDashboard, ScrollText, User } from 'lucide-react';
import { FocusPage } from './pages/FocusPage';
import { PoliciesPage } from './pages/PoliciesPage';
import { SystemPage } from './pages/SystemPage';
import { ProfilePage } from './pages/ProfilePage';
import { cn } from './components/DelayDrawer';
import { ThemeProvider } from './components/ThemeProvider';
import { useNotifications } from './hooks/useNotifications';

// Placeholder pages for other tabs
const PlaceholderPage = ({ title }: { title: string }) => (
  <div className="flex-1 flex items-center justify-center text-zinc-500">
    <div className="text-center">
      <div className="text-2xl font-light mb-2">{title}</div>
      <div className="text-sm">建设中...</div>
    </div>
  </div>
);

const Navigation = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-900 pb-safe z-30 transition-colors">
      <div className="flex justify-around items-center h-16 px-6 max-w-md mx-auto">
        <NavLink
          to="/"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <Timer size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">专注</span>
        </NavLink>
        
        <NavLink
          to="/system"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <LayoutDashboard size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">体系</span>
        </NavLink>

        <NavLink
          to="/policies"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <ScrollText size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">国策</span>
        </NavLink>

        <NavLink
          to="/profile"
          className={({ isActive }) => cn(
            "flex flex-col items-center justify-center w-16 h-full space-y-1 transition-colors",
            isActive ? "text-zinc-900 dark:text-zinc-100" : "text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400"
          )}
        >
          <User size={24} strokeWidth={1.5} />
          <span className="text-[10px] font-medium">我的</span>
        </NavLink>
      </div>
    </div>
  );
};

const AppContent = () => {
  useNotifications();
  
  return (
    <Router>
      <div className="bg-zinc-50 dark:bg-black min-h-[100dvh] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans antialiased selection:bg-zinc-200 dark:selection:bg-zinc-800 transition-colors">
        <Routes>
          <Route path="/" element={<FocusPage />} />
          <Route path="/system" element={<SystemPage />} />
          <Route path="/policies" element={<PoliciesPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
