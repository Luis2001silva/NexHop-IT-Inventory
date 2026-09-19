import { useEffect, useRef, useState } from "react";
import {
  Navigate,
  Outlet,
  useNavigate,
} from "react-router-dom";
import {
  Search,
  Bell,
  Sun,
  Moon,
  LogOut,
  ChevronDown,
  Check,
  X,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
import { useUserRole } from "@/hooks/useUserRole";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";

import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

/* =========================================================
   TIPOS
   ========================================================= */

type Notification = {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

type Profile = {
  full_name: string | null;
  email: string | null;
  role: string | null;
};

/* =========================================================
   APP LAYOUT
   ========================================================= */

const AppLayout = () => {
  /* =======================================================
     AUTH
     ======================================================= */

  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const { role, loading: roleLoading } = useUserRole();

  /* =======================================================
     LANGUAGE / THEME
     ======================================================= */

  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const isPT = language === "pt";
  const isLight = theme === "light";

  /* =======================================================
     UI STATE
     ======================================================= */

  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  /* =======================================================
     PROFILE / NOTIFICATIONS
     ======================================================= */

  const [profile, setProfile] =
    useState<Profile | null>(null);

  const [notifications, setNotifications] =
    useState<Notification[]>([]);

  const [notificationsLoading, setNotificationsLoading] =
    useState(false);

  /* =======================================================
     REFS
     ======================================================= */

  const profileMenuRef =
    useRef<HTMLDivElement>(null);

  const notificationsRef =
    useRef<HTMLDivElement>(null);

  /* =======================================================
     CARREGAR PERFIL
     ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      return;
    }

    loadProfile();
  }, [user?.id]);

  async function loadProfile() {
    if (!user?.id) return;

    const { data, error } = await (supabase as any)
      .from("profiles")
      .select("full_name, email, role")
      .eq("id", user.id)
      .maybeSingle();

    if (error) {
      console.error(
        "Erro ao carregar perfil:",
        error
      );
      return;
    }

    setProfile(
      (data as Profile | null) ?? null
    );
  }

  /* =======================================================
     CARREGAR NOTIFICAÇÕES
     ======================================================= */

  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      return;
    }

    loadNotifications();
  }, [user?.id]);

  async function loadNotifications() {
    if (!user?.id) return;

    setNotificationsLoading(true);

    const { data, error } = await (supabase as any)
      .from("notifications")
      .select(
        "id, user_id, title, message, type, read, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      })
      .limit(20);

    setNotificationsLoading(false);

    if (error) {
      console.error(
        "Erro ao carregar notificações:",
        error
      );
      return;
    }

    setNotifications(
      (data ?? []) as Notification[]
    );
  }

  /* =======================================================
     REALTIME
     ======================================================= */

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(
        `app-layout-notifications-${user.id}`
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  /* =======================================================
     FECHAR POPUPS AO CLICAR FORA
     ======================================================= */

  useEffect(() => {
    const handleClickOutside = (
      event: MouseEvent
    ) => {
      const target = event.target as Node;

      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }

      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =======================================================
     SIDEBAR
     ======================================================= */

  const toggleSidebar = () => {
    setSidebarCollapsed(
      (current) => !current
    );
  };

  /* =======================================================
     USER NAME
     ======================================================= */

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    (isPT ? "Utilizador" : "User");

  /* =======================================================
     INITIALS
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
     ROLE LABEL
     ======================================================= */

  const userRole =
    role === "admin"
      ? isPT
        ? "Administrador"
        : "Administrator"
      : role === "viewer"
        ? isPT
          ? "Visualizador"
          : "Viewer"
        : isPT
          ? "Utilizador"
          : "User";

  /* =======================================================
     NOTIFICAÇÕES NÃO LIDAS
     ======================================================= */

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.read
    ).length;

  /* =======================================================
     ABRIR PERFIL
     ======================================================= */

  const toggleProfile = () => {
    setProfileOpen(
      (current) => !current
    );

    setNotificationsOpen(false);
  };

  /* =======================================================
     ABRIR NOTIFICAÇÕES
     ======================================================= */

  const toggleNotifications = () => {
    setNotificationsOpen(
      (current) => !current
    );

    setProfileOpen(false);
  };

  /* =======================================================
     MARCAR NOTIFICAÇÃO COMO LIDA
     ======================================================= */

  const markNotificationAsRead = async (
    notificationId: number
  ) => {
    if (!user?.id) return;

    const notification =
      notifications.find(
        (item) =>
          item.id === notificationId
      );

    if (
      !notification ||
      notification.read
    ) {
      return;
    }

    const { error } =
      await (supabase as any)
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId)
        .eq("user_id", user.id);

    if (error) {
      console.error(
        "Erro ao marcar notificação:",
        error
      );
      return;
    }

    setNotifications(
      (current) =>
        current.map((item) =>
          item.id === notificationId
            ? {
                ...item,
                read: true,
              }
            : item
        )
    );
  };

  /* =======================================================
     MARCAR TODAS COMO LIDAS
     ======================================================= */

  const markAllNotificationsAsRead =
    async () => {
      if (
        !user?.id ||
        unreadNotifications === 0
      ) {
        return;
      }

      const { error } =
        await (supabase as any)
          .from("notifications")
          .update({ read: true })
          .eq("user_id", user.id)
          .eq("read", false);

      if (error) {
        console.error(
          "Erro ao marcar notificações:",
          error
        );
        return;
      }

      setNotifications(
        (current) =>
          current.map((item) => ({
            ...item,
            read: true,
          }))
      );
    };

  /* =======================================================
     FORMATAÇÃO DATA
     ======================================================= */

  const formatNotificationDate = (
    date: string
  ) => {
    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return "—";
    }

    return parsedDate.toLocaleString(
      isPT ? "pt-PT" : "en-GB",
      {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  /* =======================================================
     LOADING
     ======================================================= */

  if (
    loading ||
    roleLoading
  ) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#080D1F] text-white">
        <div className="animate-pulse text-sm">
          {isPT
            ? "A carregar..."
            : "Loading..."}
        </div>
      </div>
    );
  }

  /* =======================================================
     AUTH
     ======================================================= */

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  /* =======================================================
     TEMA
     ======================================================= */

  const pageBackground =
    isLight
      ? "bg-[#E5E7EB]"
      : "bg-[#080D1F]";

  const headerBackground =
    isLight
      ? "bg-[#E5E7EB]"
      : "bg-[#080D1F]";

  const popupBackground =
    isLight
      ? "bg-[#F8FAFC]"
      : "bg-[#0D1730]";

  const popupBorder =
    isLight
      ? "border-slate-200"
      : "border-white/[0.08]";

  /* =======================================================
     MAIN
     ======================================================= */

  return (
    <div
      className={`flex h-screen overflow-hidden ${pageBackground} ${
        isLight
          ? "text-slate-900"
          : "text-white"
      }`}
    >
      {/* ===================================================
          SIDEBAR
          =================================================== */}

      <Sidebar
        collapsed={sidebarCollapsed}
        toggleSidebar={toggleSidebar}
      />

      {/* ===================================================
          MAIN CONTENT
          =================================================== */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

        {/* =================================================
            HEADER
            ================================================= */}

        <header
          className={`flex h-[72px] shrink-0 items-center justify-between border-b px-6 ${
            isLight
              ? "border-slate-200"
              : "border-white/[0.06]"
          } ${headerBackground}`}
        >

          {/* SEARCH */}

          <div className="relative w-full max-w-[360px]">
            <Search
              size={15}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isLight
                  ? "text-slate-400"
                  : "text-white/35"
              }`}
            />

            <input
              type="text"
              placeholder={
                isPT
                  ? "Pesquisar..."
                  : "Search..."
              }
              className={`h-9 w-full rounded-lg border pl-9 pr-3 text-xs outline-none transition ${
                isLight
                  ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-blue-500/40"
                  : "border-white/[0.07] bg-white/[0.025] text-white placeholder:text-white/30 focus:border-blue-500/40"
              }`}
            />
          </div>

          {/* HEADER RIGHT */}

          <div className="ml-4 flex items-center gap-2">

            {/* =================================================
                NOTIFICATIONS
                ================================================= */}

            <div
              ref={notificationsRef}
              className="relative"
            >
              <button
                type="button"
                onClick={
                  toggleNotifications
                }
                aria-label={
                  isPT
                    ? "Notificações"
                    : "Notifications"
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
                  isLight
                    ? "border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    : "border-white/[0.07] text-white/55 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <Bell size={17} />

                {unreadNotifications >
                  0 && (
                  <span
                    className={`absolute right-[6px] top-[5px] h-2.5 w-2.5 rounded-full border-2 ${
                      isLight
                        ? "border-[#E5E7EB] bg-blue-500"
                        : "border-[#080D1F] bg-blue-500"
                    }`}
                  />
                )}
              </button>

              {/* NOTIFICATIONS POPUP */}

              {notificationsOpen && (
                <div
                  className={`absolute right-0 top-full z-50 mt-2 w-[360px] overflow-hidden rounded-2xl border ${popupBorder} ${popupBackground} shadow-2xl`}
                >

                  {/* POPUP HEADER */}

                  <div
                    className={`flex items-center justify-between border-b px-4 py-3.5 ${
                      isLight
                        ? "border-slate-200"
                        : "border-white/[0.06]"
                    }`}
                  >
                    <div>

                      <div
                        className={`text-sm font-semibold ${
                          isLight
                            ? "text-slate-900"
                            : "text-white"
                        }`}
                      >
                        {isPT
                          ? "Notificações"
                          : "Notifications"}
                      </div>

                      <div
                        className={`mt-0.5 text-[10px] ${
                          isLight
                            ? "text-slate-400"
                            : "text-white/35"
                        }`}
                      >
                        {unreadNotifications >
                        0
                          ? isPT
                            ? `${unreadNotifications} por ler`
                            : `${unreadNotifications} unread`
                          : isPT
                            ? "Tudo lido"
                            : "All caught up"}
                      </div>

                    </div>

                    <div className="flex items-center gap-2">

                      {unreadNotifications >
                        0 && (
                        <button
                          type="button"
                          onClick={
                            markAllNotificationsAsRead
                          }
                          className="text-[10px] font-medium text-blue-400 hover:text-blue-300"
                        >
                          {isPT
                            ? "Marcar tudo como lido"
                            : "Mark all as read"}
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() =>
                          setNotificationsOpen(
                            false
                          )
                        }
                        className={`rounded-lg p-1 transition ${
                          isLight
                            ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            : "text-white/35 hover:bg-white/[0.05] hover:text-white"
                        }`}
                      >
                        <X size={15} />
                      </button>

                    </div>
                  </div>

                  {/* NOTIFICATIONS */}

                  <div className="max-h-[390px] overflow-y-auto">

                    {notificationsLoading ? (
                      <div className="flex items-center justify-center px-6 py-10">

                        <span
                          className={`h-5 w-5 animate-spin rounded-full border-2 ${
                            isLight
                              ? "border-slate-200 border-t-slate-600"
                              : "border-white/10 border-t-blue-400"
                          }`}
                        />

                      </div>
                    ) : notifications.length ===
                      0 ? (
                      <div className="px-6 py-12 text-center">

                        <div
                          className={`mx-auto flex h-11 w-11 items-center justify-center rounded-full ${
                            isLight
                              ? "bg-slate-100 text-slate-400"
                              : "bg-white/[0.04] text-white/25"
                          }`}
                        >
                          <Bell size={18} />
                        </div>

                        <p
                          className={`mt-3 text-xs font-medium ${
                            isLight
                              ? "text-slate-600"
                              : "text-white/55"
                          }`}
                        >
                          {isPT
                            ? "Sem notificações"
                            : "No notifications"}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${
                            isLight
                              ? "text-slate-400"
                              : "text-white/25"
                          }`}
                        >
                          {isPT
                            ? "Quando houver novidades, aparecem aqui."
                            : "New updates will appear here."}
                        </p>

                      </div>
                    ) : (
                      notifications.map(
                        (
                          notification
                        ) => (
                          <button
                            key={
                              notification.id
                            }
                            type="button"
                            onClick={() =>
                              markNotificationAsRead(
                                notification.id
                              )
                            }
                            className={`flex w-full gap-3 border-b px-4 py-3.5 text-left transition ${
                              isLight
                                ? "border-slate-100 hover:bg-slate-50"
                                : "border-white/[0.04] hover:bg-white/[0.025]"
                            } ${
                              !notification.read
                                ? isLight
                                  ? "bg-blue-50/60"
                                  : "bg-blue-500/[0.035]"
                                : ""
                            }`}
                          >

                            <div
                              className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                                notification.type ===
                                "success"
                                  ? "bg-emerald-500/10 text-emerald-500"
                                  : notification.type ===
                                      "warning"
                                    ? "bg-amber-500/10 text-amber-500"
                                    : notification.type ===
                                        "error"
                                      ? "bg-red-500/10 text-red-500"
                                      : "bg-blue-500/10 text-blue-500"
                              }`}
                            >
                              <Bell size={15} />
                            </div>

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start gap-2">

                                <p
                                  className={`flex-1 text-xs font-semibold ${
                                    isLight
                                      ? "text-slate-900"
                                      : "text-white"
                                  }`}
                                >
                                  {
                                    notification.title
                                  }
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                )}

                              </div>

                              <p
                                className={`mt-1 text-[10px] leading-4 ${
                                  isLight
                                    ? "text-slate-500"
                                    : "text-white/45"
                                }`}
                              >
                                {
                                  notification.message
                                }
                              </p>

                              <p
                                className={`mt-1.5 text-[9px] ${
                                  isLight
                                    ? "text-slate-400"
                                    : "text-white/25"
                                }`}
                              >
                                {formatNotificationDate(
                                  notification.created_at
                                )}
                              </p>

                            </div>

                          </button>
                        )
                      )
                    )}

                  </div>

                  {/* FOOTER */}

                  {notifications.length >
                    0 && (
                    <div
                      className={`border-t p-2 ${
                        isLight
                          ? "border-slate-200"
                          : "border-white/[0.06]"
                      }`}
                    >
                      <div
                        className={`flex items-center justify-center gap-2 py-2 text-[9px] ${
                          isLight
                            ? "text-slate-400"
                            : "text-white/25"
                        }`}
                      >
                        <Check size={12} />

                        {isPT
                          ? "As notificações são atualizadas automaticamente"
                          : "Notifications update automatically"}
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* =================================================
                PROFILE
                ================================================= */}

            <div
              ref={profileMenuRef}
              className={`relative border-l pl-2 sm:pl-3 ${
                isLight
                  ? "border-slate-200"
                  : "border-white/[0.06]"
              }`}
            >

              <button
                type="button"
                onClick={toggleProfile}
                className={`flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition ${
                  isLight
                    ? "hover:bg-slate-100"
                    : "hover:bg-white/[0.04]"
                }`}
              >

                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#263A5C] text-[11px] font-semibold text-white">
                  {initials}
                </div>

                <div className="hidden text-left leading-tight sm:block">

                  <div
                    className={`text-[11px] font-semibold ${
                      isLight
                        ? "text-slate-900"
                        : "text-white"
                    }`}
                  >
                    {userName}
                  </div>

                  <div
                    className={`mt-1 text-[9px] ${
                      isLight
                        ? "text-slate-400"
                        : "text-white/35"
                    }`}
                  >
                    {userRole}
                  </div>

                </div>

                <ChevronDown
                  size={14}
                  className={`transition-transform ${
                    profileOpen
                      ? "rotate-180"
                      : ""
                  } ${
                    isLight
                      ? "text-slate-400"
                      : "text-white/40"
                  }`}
                />

              </button>

              {/* PROFILE POPUP */}

              {profileOpen && (
                <div
                  className={`absolute right-0 top-full z-50 mt-2 w-[260px] overflow-hidden rounded-2xl border ${popupBorder} ${popupBackground} p-2 shadow-2xl`}
                >

                  {/* USER INFO */}

                  <div
                    className={`border-b px-3 py-3 ${
                      isLight
                        ? "border-slate-200"
                        : "border-white/[0.06]"
                    }`}
                  >

                    <div
                      className={`text-xs font-semibold ${
                        isLight
                          ? "text-slate-900"
                          : "text-white"
                      }`}
                    >
                      {userName}
                    </div>

                    <div
                      className={`mt-1 text-[10px] ${
                        isLight
                          ? "text-slate-400"
                          : "text-white/35"
                      }`}
                    >
                      {user.email ||
                        profile?.email ||
                        "—"}
                    </div>

                    <div
                      className={`mt-1 text-[10px] ${
                        isLight
                          ? "text-slate-400"
                          : "text-white/25"
                      }`}
                    >
                      {userRole}
                    </div>

                  </div>

                  {/* LANGUAGE */}

                  <div
                    className={`border-b px-2 py-3 ${
                      isLight
                        ? "border-slate-200"
                        : "border-white/[0.06]"
                    }`}
                  >

                    <p
                      className={`mb-2 px-1 text-[9px] font-semibold uppercase tracking-wider ${
                        isLight
                          ? "text-slate-400"
                          : "text-white/30"
                      }`}
                    >
                      {isPT
                        ? "Idioma"
                        : "Language"}
                    </p>

                    <div className="grid grid-cols-2 gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          setLanguage("pt")
                        }
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[10px] transition ${
                          language === "pt"
                            ? "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        Português

                        {language ===
                          "pt" && (
                          <Check size={12} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setLanguage("en")
                        }
                        className={`flex items-center justify-between rounded-lg px-3 py-2.5 text-[10px] transition ${
                          language === "en"
                            ? "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        English

                        {language ===
                          "en" && (
                          <Check size={12} />
                        )}
                      </button>

                    </div>
                  </div>

                  {/* THEME */}

                  <div
                    className={`border-b px-2 py-3 ${
                      isLight
                        ? "border-slate-200"
                        : "border-white/[0.06]"
                    }`}
                  >

                    <p
                      className={`mb-2 px-1 text-[9px] font-semibold uppercase tracking-wider ${
                        isLight
                          ? "text-slate-400"
                          : "text-white/30"
                      }`}
                    >
                      {isPT
                        ? "Tema"
                        : "Theme"}
                    </p>

                    <div className="grid grid-cols-2 gap-1">

                      <button
                        type="button"
                        onClick={() =>
                          setTheme("dark")
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] transition ${
                          theme === "dark"
                            ? "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Moon size={13} />

                        {isPT
                          ? "Escuro"
                          : "Dark"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setTheme("light")
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-[10px] transition ${
                          theme === "light"
                            ? "bg-blue-500/10 text-blue-600"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        <Sun size={13} />

                        {isPT
                          ? "Claro"
                          : "Light"}
                      </button>

                    </div>
                  </div>

                  {/* =================================================
                      LOGOUT
                      ================================================= */}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut();

                        setProfileOpen(
                          false
                        );

                        setNotificationsOpen(
                          false
                        );

                        navigate(
                          "/login",
                          {
                            replace: true,
                          }
                        );
                      } catch (error) {
                        console.error(
                          "Erro ao terminar sessão:",
                          error
                        );
                      }
                    }}
                    className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs transition ${
                      isLight
                        ? "text-slate-600 hover:bg-slate-100 hover:text-red-600"
                        : "text-white/60 hover:bg-white/[0.04] hover:text-red-400"
                    }`}
                  >
                    <LogOut size={15} />

                    {isPT
                      ? "Terminar sessão"
                      : "Sign out"}
                  </button>

                </div>
              )}

            </div>
          </div>
        </header>

        {/* ===================================================
            CONTENT
            =================================================== */}

        <main
          className="nexa-main-scroll min-h-0 flex-1 overflow-y-auto"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          <div className="flex min-h-full flex-col">

            <div className="flex-1 px-6 lg:px-8">
              <Outlet />
            </div>

            {/* FOOTER */}

            <footer
              className={`flex h-12 shrink-0 items-center justify-between border-t px-6 text-[10px] ${
                isLight
                  ? "border-slate-200 text-slate-400"
                  : "border-white/[0.06] text-white/35"
              }`}
            >
              <span>
                NexHop © 2026
              </span>

              <span className="flex items-center gap-1.5 text-emerald-400">

                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                <span>
                  {isPT
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