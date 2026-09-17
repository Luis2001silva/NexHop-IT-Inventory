import { useEffect, useRef, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
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

/* =========================================================
   APP LAYOUT
   Estrutura principal da aplicação depois do login.

   Aqui controlamos:
   - Utilizador autenticado
   - Role do utilizador
   - Sidebar
   - Header
   - Perfil
   - Tema
   - Idioma
   - Logout
   ========================================================= */

const AppLayout = () => {
  /* =======================================================
     AUTHENTICATION

     O AuthContext fornece o utilizador autenticado.
     O role é obtido separadamente através de profiles.
     ======================================================= */

  const { user, loading, signOut } = useAuth();

  const { role, loading: roleLoading } = useUserRole();

  /* =======================================================
     LANGUAGE / THEME

     Estes contextos controlam o idioma e o tema global.
     ======================================================= */

  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  /* =======================================================
     LOCAL UI STATE

     sidebarCollapsed -> sidebar aberta/fechada
     profileOpen -> menu do utilizador aberto/fechado
     ======================================================= */

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  /* =======================================================
     PROFILE MENU REF

     Usamos esta referência para conseguir fechar o menu
     quando o utilizador clica fora dele.
     ======================================================= */

  const profileMenuRef = useRef<HTMLDivElement>(null);

  /* =======================================================
     CLOSE PROFILE MENU WHEN CLICKING OUTSIDE
     ======================================================= */

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

  /* =======================================================
     SIDEBAR TOGGLE
     ======================================================= */

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => !prev);
  };

  /* =======================================================
     LANGUAGE TOGGLE

     Alterna entre:
     PT -> EN
     EN -> PT
     ======================================================= */

  const toggleLanguage = () => {
    setLanguage(language === "pt" ? "en" : "pt");
  };

  /* =======================================================
     THEME TOGGLE

     Alterna entre:
     Light -> Dark
     Dark -> Light
     ======================================================= */

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  /* =======================================================
     AUTH / ROLE LOADING

     Primeiro esperamos pelo Auth.
     Depois esperamos pelo role existente em profiles.

     Isto evita mostrar temporariamente o utilizador como
     Viewer enquanto ainda estamos a descobrir o role real.
     ======================================================= */

  if (loading || roleLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#080D1F] text-white">
        <div className="animate-pulse text-sm">
          {language === "pt" ? "A carregar..." : "Loading..."}
        </div>
      </div>
    );
  }

  /* =======================================================
     NO AUTHENTICATED USER

     Se não existir sessão válida, voltamos para o login.
     ======================================================= */

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  /* =======================================================
     USER NAME

     O objeto User do Supabase não possui diretamente
     "name".

     O nome pode estar nos metadados criados durante o
     registo/login.

     Se não existir nome, usamos o email como fallback.
     ======================================================= */

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email ||
    "User";

  /* =======================================================
     USER INITIALS

     Criamos as iniciais para o avatar.

     Exemplo:
     "Luís Miguel Silva" -> "LM"
     "Administrador" -> "AD"
     ======================================================= */

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((name) => name[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  /* =======================================================
     USER ROLE

     IMPORTANTE:
     O role NÃO vem do Auth User.

     Vem da tabela:
     profiles.role

     através do hook useUserRole().
     ======================================================= */

  const userRole =
    role === "admin"
      ? language === "pt"
        ? "Administrador"
        : "Administrator"
      : role === "viewer"
        ? language === "pt"
          ? "Visualizador"
          : "Viewer"
        : language === "pt"
          ? "Utilizador"
          : "User";

  /* =========================================================
     MAIN APPLICATION LAYOUT
     ========================================================= */

  return (
    <div className="h-screen flex overflow-hidden bg-[#080D1F] text-white">
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* =====================================================
          MAIN CONTENT AREA
          ===================================================== */}

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* ===================================================
            HEADER
            =================================================== */}

        <header className="h-[72px] shrink-0 flex items-center justify-between px-6 border-b border-white/[0.06] bg-[#080D1F]">
          {/* =================================================
              GLOBAL SEARCH
              ================================================= */}

          <div className="relative w-full max-w-[360px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/35"
            />

            <input
              type="text"
              placeholder={
                language === "pt" ? "Pesquisar..." : "Search..."
              }
              className="w-full h-9 rounded-lg border border-white/[0.07] bg-white/[0.025] pl-9 pr-3 text-xs text-white placeholder:text-white/30 outline-none transition focus:border-blue-500/40 focus:bg-white/[0.04]"
            />
          </div>

          {/* =================================================
              HEADER ACTIONS
              ================================================= */}

          <div className="flex items-center gap-3 ml-4">
            {/* ===============================================
                NOTIFICATIONS
                =============================================== */}

            <button
              type="button"
              className="h-9 w-9 rounded-lg flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.05] transition"
            >
              <Bell size={17} />
            </button>

            {/* ===============================================
                USER PROFILE MENU
                =============================================== */}

            <div ref={profileMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setProfileOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-white/[0.04] transition"
              >
                {/* ===========================================
                    USER AVATAR
                    =========================================== */}

                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-[11px] font-semibold text-white">
                  {initials}
                </div>

                {/* ===========================================
                    USER INFORMATION
                    =========================================== */}

                <div className="hidden sm:block text-left leading-tight">
                  <div className="text-[12px] font-medium text-white">
                    {userName}
                  </div>

                  <div className="text-[10px] text-white/40">
                    {userRole}
                  </div>
                </div>

                {/* ===========================================
                    DROPDOWN ARROW
                    =========================================== */}

                <ChevronDown
                  size={14}
                  className={`text-white/40 transition-transform ${
                    profileOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* =================================================
                  PROFILE DROPDOWN
                  ================================================= */}

              {profileOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl border border-white/[0.08] bg-[#11182B] shadow-2xl p-2 z-50">
                  {/* =============================================
                      PROFILE HEADER
                      ============================================= */}

                  <div className="px-3 py-2.5 border-b border-white/[0.06] mb-1">
                    <div className="text-sm font-medium text-white">
                      {userName}
                    </div>

                    <div className="text-[11px] text-white/40 mt-0.5">
                      {userRole}
                    </div>
                  </div>

                  {/* =============================================
                      THEME BUTTON
                      ============================================= */}

                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    {theme === "light" ? (
                      <Moon size={17} />
                    ) : (
                      <Sun size={17} />
                    )}

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

                  {/* =============================================
                      LANGUAGE BUTTON
                      ============================================= */}

                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/70 hover:bg-white/5 hover:text-white transition"
                  >
                    <Globe size={17} />

                    <span>
                      {language === "pt" ? "English" : "Português"}
                    </span>
                  </button>

                  {/* =============================================
                      LOGOUT BUTTON
                      ============================================= */}

                  <button
                    type="button"
                    onClick={signOut}
                    className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={17} />

                    <span>
                      {language === "pt"
                        ? "Terminar sessão"
                        : "Logout"}
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main
          className="flex-1 min-h-0 overflow-y-auto nexa-main-scroll"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="min-h-full flex flex-col">
            {/* ===============================================
                ROUTED PAGE
                =============================================== */}

            <div className="flex-1 px-6 lg:px-8">
              <Outlet />
            </div>

            {/* ===============================================
                FOOTER
                =============================================== */}

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

      {/* =====================================================
          TOAST NOTIFICATIONS
          ===================================================== */}

      <Toaster position="top-right" />
    </div>
  );
};

export default AppLayout;