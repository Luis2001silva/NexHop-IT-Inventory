import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { useUserRole } from "@/hooks/useUserRole";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  LayoutDashboard,
  Monitor,
  Users,
  Network,
  FileText,
  ShieldCheck,
  CalendarDays,
  FolderOpen,
  TriangleAlert,
  ChartNoAxesCombined,
  ScrollText,
  Settings,
  UserCircle,
  CircleHelp,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";

/* =========================================================
   SIDEBAR PROPS
   ========================================================= */

interface SidebarProps {
  collapsed: boolean;
  toggleSidebar: () => void;
}

/* =========================================================
   NAVIGATION ITEM
   ========================================================= */

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  updating?: boolean;
}

/* =========================================================
   NAVIGATION SECTION
   ========================================================= */

interface NavSection {
  title: string;
  items: NavItem[];
}

/* =========================================================
   LOADING CIRCLE
   Mostra que uma determinada área ainda está em
   desenvolvimento.
   ========================================================= */

const LoadingCircle = ({
  size = 16,
  isLight,
}: {
  size?: number;
  isLight: boolean;
}) => {
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        borderRadius: "50%",
        border: `${Math.max(2, size * 0.15)}px solid ${
          isLight ? "#B8C0C9" : "#707070"
        }`,
        borderLeftColor: isLight ? "#64748B" : "#FFFFFF",
        animation: "sidebarCircleRotate 1.2s linear infinite",
        flexShrink: 0,
      }}
    />
  );
};

/* =========================================================
   SIDEBAR
   ========================================================= */

export const Sidebar = ({
  collapsed,
  toggleSidebar,
}: SidebarProps) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { role, loading: roleLoading } = useUserRole();
  const location = useLocation();

  const isLight = theme === "light";

  /* =======================================================
     ROLE PERMISSIONS

     O role vem diretamente de:

     profiles.role

     através do hook useUserRole().

     Possíveis valores:
     - admin
     - viewer
     - user
     ======================================================= */

  const isAdmin = role === "admin";
  const isViewer = role === "viewer";
  const isUser = role === "user";

  /* =======================================================
     NAVIGATION

     O menu é construído de acordo com o role.

     Neste momento:
     - Admin vê o menu completo.
     - Viewer vê o painel IT sem Users.
     - User ainda não tem o My Portal implementado.

     A parte de User será tratada mais à frente.
     ======================================================= */

  const sections: NavSection[] = [
    /* =====================================================
       PRINCIPAL
       ===================================================== */

    {
      title: language === "pt" ? "PRINCIPAL" : "MAIN",

      items: [
        {
          path: "/dashboard",
          label: language === "pt" ? "Painel" : "Dashboard",
          icon: <LayoutDashboard size={18} />,
          updating: true,
        },

        {
          path: "/equipment",
          label: language === "pt" ? "Equipamentos" : "Equipment",
          icon: <Monitor size={18} />,
        },

        /* -------------------------------------------------
           USERS

           Apenas Administradores podem gerir utilizadores.
           ------------------------------------------------- */

        ...(isAdmin
          ? [
              {
                path: "/users",
                label:
                  language === "pt"
                    ? "Utilizadores"
                    : "Users",
                icon: <Users size={18} />,
              },
            ]
          : []),
      ],
    },

    /* =====================================================
       GESTÃO
       ===================================================== */

    {
      title: language === "pt" ? "GESTÃO" : "MANAGEMENT",

      items: [
        {
          path: "/invoices",
          label: language === "pt" ? "Faturas" : "Invoices",
          icon: <FileText size={18} />,
          updating: true,
        },

        {
          path: "/warranties",
          label:
            language === "pt"
              ? "Garantias"
              : "Warranties",
          icon: <ShieldCheck size={18} />,
        },

        {
          path: "/reservations",
          label:
            language === "pt"
              ? "Reservas"
              : "Reservations",
          icon: <CalendarDays size={18} />,
        },

        {
          path: "/documents",
          label:
            language === "pt"
              ? "Documentos"
              : "Documents",
          icon: <FolderOpen size={18} />,
          updating: true,
        },

        {
          path: "/hierarchy",
          label:
            language === "pt"
              ? "Hierarquia"
              : "Hierarchy",
          icon: <Network size={18} />,
        },
      ],
    },

    /* =====================================================
       MONITORIZAÇÃO
       ===================================================== */

    {
      title:
        language === "pt"
          ? "MONITORIZAÇÃO"
          : "MONITORING",

      items: [
        {
          path: "/alerts",
          label:
            language === "pt"
              ? "Alertas"
              : "Alerts",
          icon: <TriangleAlert size={18} />,
          updating: true,
        },

        {
          path: "/reports",
          label:
            language === "pt"
              ? "Relatórios"
              : "Reports",
          icon: <ChartNoAxesCombined size={18} />,
          updating: true,
        },

        {
          path: "/logs",
          label: "Logs",
          icon: <ScrollText size={18} />,
          updating: true,
        },
      ],
    },

    /* =====================================================
       SISTEMA
       ===================================================== */

    {
      title:
        language === "pt"
          ? "SISTEMA"
          : "SYSTEM",

      items: [
        {
          path: "/settings",
          label:
            language === "pt"
              ? "Definições"
              : "Settings",
          icon: <Settings size={18} />,
        },

        {
          path: "/profile",
          label:
            language === "pt"
              ? "Perfil"
              : "Profile",
          icon: <UserCircle size={18} />,
        },

        {
          path: "/support",
          label:
            language === "pt"
              ? "Suporte"
              : "Support",
          icon: <CircleHelp size={18} />,
        },
      ],
    },
  ];

  /* =========================================================
     ACTIVE ROUTE

     Verifica qual é a página atualmente aberta.
     ========================================================= */

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  /* =========================================================
     ROLE LOADING

     Enquanto o role ainda está a ser carregado, não
     construímos o menu de permissões.

     Isto evita o problema:

     Admin -> aparece Viewer -> depois muda para Admin
     ========================================================= */

  if (roleLoading) {
    return (
      <aside
        className={cn(
          "h-screen flex flex-col shrink-0",
          isLight
            ? "bg-white text-slate-900 border-r border-slate-200"
            : "bg-[#0B1120] text-white border-r border-white/[0.06]",
          collapsed ? "w-[72px]" : "w-[250px]",
        )}
      >
        <div
          className={cn(
            "h-[72px] flex items-center border-b",
            isLight
              ? "border-slate-200"
              : "border-white/[0.06]",
            collapsed
              ? "justify-center px-2"
              : "justify-between px-5",
          )}
        />

        <div className="flex-1 flex items-center justify-center">
          <LoadingCircle size={18} isLight={isLight} />
        </div>
      </aside>
    );
  }

  /* =========================================================
     SIDEBAR UI
     ========================================================= */

  return (
    <>
      {/* ===================================================
          SIDEBAR SPINNER ANIMATION
          =================================================== */}

      <style>
        {`
          @keyframes sidebarCircleRotate {
            from {
              transform: rotate(0deg);
            }

            to {
              transform: rotate(360deg);
            }
          }
        `}
      </style>

      <aside
        className={cn(
          "h-screen flex flex-col shrink-0",
          isLight
            ? "bg-white text-slate-900 border-r border-slate-200"
            : "bg-[#0B1120] text-white border-r border-white/[0.06]",
          "transition-all duration-300 ease-in-out",
          collapsed ? "w-[72px]" : "w-[250px]",
        )}
      >
        {/* =================================================
            HEADER
            ================================================= */}

        <div
          className={cn(
            "h-[72px] flex items-center border-b",
            isLight
              ? "border-slate-200"
              : "border-white/[0.06]",
            collapsed
              ? "justify-center px-2"
              : "justify-between px-5",
          )}
        >
          {/* -------------------------------------------------
              LOGO SIDEBAR ABERTA
              ------------------------------------------------- */}

          {!collapsed && (
            <Link
              to="/dashboard"
              className="flex items-center min-w-0"
            >
              <img
                src={
                  isLight
                    ? "/nexhop/Light/NexHop_Icon_Light_64x64.png"
                    : "/nexhop/Dark/NexHop_Icon_Dark_64x64.png"
                }
                alt="NexHop"
                className="h-9 w-auto max-w-[155px] object-contain"
              />
            </Link>
          )}

          {/* -------------------------------------------------
              LOGO SIDEBAR FECHADA
              ------------------------------------------------- */}

          {collapsed && (
            <Link
              to="/dashboard"
              className="flex items-center justify-center"
            >
              <img
                src={
                  isLight
                    ? "/nexhop/Light/NexHop_Icon_Light_32x32.png"
                    : "/nexhop/Dark/NexHop_Icon_Dark_32x32.png"
                }
                alt="NexHop"
                className="h-9 w-9 rounded-lg object-contain"
              />
            </Link>
          )}

          {/* -------------------------------------------------
              BOTÃO ABRIR / FECHAR SIDEBAR
              ------------------------------------------------- */}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className={cn(
              "h-9 w-9 shrink-0",
              isLight
                ? "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                : "text-white/60 hover:text-white hover:bg-white/[0.05]",
            )}
          >
            {collapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </Button>
        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav
          className="nexa-sidebar-scroll flex-1 overflow-y-auto px-3 py-5"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="space-y-6">
            {sections.map((section) => (
              <div key={section.title}>
                {/* -------------------------------------------
                    SECTION TITLE
                    ------------------------------------------- */}

                {!collapsed && (
                  <div
                    className={cn(
                      "px-3 mb-2 text-[10px] font-semibold tracking-[0.12em]",
                      isLight
                        ? "text-slate-400"
                        : "text-white/35",
                    )}
                  >
                    {section.title}
                  </div>
                )}

                {/* -------------------------------------------
                    SECTION ITEMS
                    ------------------------------------------- */}

                <div className="space-y-1">
                  {section.items.map((item) => {
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={
                          collapsed
                            ? item.label
                            : undefined
                        }
                        className={cn(
                          "group relative flex items-center h-10 rounded-lg",
                          "transition-all duration-200",

                          collapsed
                            ? "justify-center px-0"
                            : "px-3 gap-3",

                          active
                            ? isLight
                              ? "bg-blue-500/10 text-blue-600"
                              : "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                              : "text-white/60 hover:text-white hover:bg-white/[0.04]",
                        )}
                      >
                        {/* -------------------------------------
                            ACTIVE INDICATOR
                            ------------------------------------- */}

                        {active && (
                          <span
                            className={cn(
                              "absolute left-0 top-1/2 -translate-y-1/2",
                              "w-[3px] h-5 rounded-r-full",
                              "bg-blue-500",
                            )}
                          />
                        )}

                        {/* -------------------------------------
                            ICON
                            ------------------------------------- */}

                        <span className="shrink-0">
                          {item.icon}
                        </span>

                        {/* -------------------------------------
                            LABEL
                            ------------------------------------- */}

                        {!collapsed && (
                          <span className="text-[13px] font-medium truncate">
                            {item.label}
                          </span>
                        )}

                        {/* -------------------------------------
                            DEVELOPMENT INDICATOR
                            ------------------------------------- */}

                        {!collapsed && item.updating && (
                          <span
                            className="ml-auto shrink-0 flex items-center justify-center"
                            title={
                              language === "pt"
                                ? "Em desenvolvimento"
                                : "In development"
                            }
                          >
                            <LoadingCircle
                              size={16}
                              isLight={isLight}
                            />
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;