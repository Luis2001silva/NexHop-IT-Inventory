import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

import {
  Search,
  Bell,
  Sun,
  Moon,
  Globe,
  LogOut,
  ChevronDown,
} from "lucide-react";

const AppLayout = () => {
  const { user, isLoading, logout } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target as Node)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#080D1F] text-white">
        <div className="animate-pulse text-sm">Loading...</div>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  const initials =
    user.name
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const userRole =
    user.role === "admin"
      ? language === "pt"
        ? "Administrador"
        : "Administrator"
      : language === "pt"
        ? "Visualizador"
        : "Viewer";

  return (
    <div className="h-screen flex overflow-hidden bg-[#080D1F] text-white">
      <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <header className="h-[72px] shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#080D1F]">
          <div className="relative w-full max-w-[360px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
            />

            <input
              type="text"
              placeholder={language === "pt" ? "Pesquisar..." : "Search..."}
              className="w-full h-9 rounded-lg border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.04]"
            />
          </div>

          <div className="flex items-center gap-3 ml-4">
            <button
              type="button"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.05] transition"
            >
              <Bell size={17} />
            </button>

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition"
              >
                {/* AVATAR */}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-semibold text-white">
                  {initials}
                </div>

                {/* USER NAME */}
                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-[12px] font-medium text-white">
                    {user.name}
                  </div>
                  <div className="text-[10px] text-white/40">{userRole}</div>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#11182B] shadow-2xl p-2 z-50">
                  <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                    <div className="text-sm font-medium text-white">
                      {user.name}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">
                      {userRole}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}

                    <span>
                      {theme === "light"
                        ? language === "pt"
                          ? "Modo escuro"
                          : "Dark mode"
                        : language === "pt"
                          ? "Modo claro"
                          : "Light mode"}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    <Globe size={17} />

                    <span>{language === "pt" ? "English" : "Português"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={logout}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={17} />

                    <span>
                      {language === "pt" ? "Terminar sessão" : "Logout"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main
          className="flex-1 min-h-0 overflow-y-auto nexa-main-scroll"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="min-h-full flex flex-col">
            <div className="flex-1 px-6 lg:px-8">
              <Outlet />
            </div>

            <footer className="shrink-0 h-12 border-t border-white/[0.06] px-6 lg:px-7 flex items-center justify-between text-[10px] text-white/35">
              <span>NexHop © 2026</span>

              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                <span>
                  {language === "pt"
                    ? "Estado do sistema: operacional"
                    : "System status: operational"}
                </span>
              </span>
            </footer>
          </div>
        </main>
      </div>

      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;
