import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  FileText,
  Headphones,
  Laptop,
  LifeBuoy,
  LogOut,
  Menu,
  Moon,
  Search,
  Sun,
  UserRound,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";


/* =========================================================
   TIPOS
   ========================================================= */

type Equipment = {
  id: number;
  name: string | null;
  model: string | null;
  serial_number: string | null;
  asset_tag: string | null;
  status: string | null;
  purchase_date: string | null;
  warranty_end: string | null;
  assigned_user: string | null;
  image_url: string | null;
};

type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  department: string | null;
  position: string | null;
  sap_number: string | null;
  avatar_url: string | null;
};

type Reservation = {
  id: number;
  user_id: string;
  title: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  location: string | null;
  status: string;
  notes: string | null;
  response_note: string | null;
  original_date: string | null;
  original_start_time: string | null;
  original_end_time: string | null;
  created_at: string;
};

type Notification = {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  created_at: string;
};

type SupportTicket = {
  id: number;
  user_id: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
};

/* =========================================================
   PORTAL
   ========================================================= */

const MyPortal = () => {
  const { user, signOut } = useAuth();

  const db = supabase as any;
  const { language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();

  const location = useLocation();
  const navigate = useNavigate();

  const isPT = language === "pt";
  const isLight = theme === "light";

  const toggleSidebar = () => {
    setCollapsed((current) => !current);
  };

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [documentViewer, setDocumentViewer] = useState<{
    title: string;
    content: string;
  } | null>(null);

  async function openDocument(
    title: string,
    ptFile: string,
    enFile: string
  ) {
    try {
      const fileName = isPT ? ptFile : enFile;
      const response = await fetch(
        `/NexHop%20-%20Documentos/${encodeURIComponent(fileName)}`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to load document: ${response.status}`
        );
      }

      const content = await response.text();

      setDocumentViewer({
        title,
        content,
      });
    } catch (error) {
      console.error("Erro ao carregar documento:", error);

      toast.error(
        isPT
          ? "Não foi possível abrir o documento."
          : "Could not open the document."
      );
    }
  }

  const [profile, setProfile] = useState<Profile | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const [loading, setLoading] = useState(true);
  const [reservationDialogOpen, setReservationDialogOpen] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);
  const [savingReservation, setSavingReservation] = useState(false);
  const [savingTicket, setSavingTicket] = useState(false);

  const [reservationForm, setReservationForm] = useState({
    title: "",
    reservation_date: "",
    start_time: "",
    end_time: "",
    location: "",
    notes: "",
  });

  const [ticketForm, setTicketForm] = useState({
    subject: "",
    description: "",
    priority: "normal",
  });

  /* =========================================================
     NOME
     ========================================================= */

  const userName =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email ||
    (isPT ? "Utilizador" : "User");

  const firstName = userName.split(" ")[0];

  const initials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((item) => item[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "U";

  const unreadNotifications = notifications.filter(
    (item) => !item.read
  ).length;

  /* =========================================================
     ROTA ATUAL
     ========================================================= */

  const currentPage = location.pathname.replace("/portal", "") || "/";

  const pageTitle =
    currentPage === "/equipment"
      ? isPT
        ? "Os meus equipamentos"
        : "My equipment"
      : currentPage === "/support"
        ? isPT
          ? "Suporte"
          : "Support"
        : currentPage === "/reservations"
          ? isPT
            ? "Reservas"
            : "Reservations"
          : currentPage === "/profile"
            ? isPT
              ? "Perfil"
              : "Profile"
            : isPT
              ? "Início"
              : "Home";

  /* =========================================================
     CARREGAR DADOS
     ========================================================= */

  useEffect(() => {
    if (!user?.id) return;

    loadPortalData();
  }, [user?.id]);

  async function loadPortalData() {
    if (!user?.id) return;

    setLoading(true);

    try {
      const [
        profileResult,
        equipmentResult,
        reservationResult,
        notificationResult,
        ticketResult,
      ] = await Promise.all([
        db
          .from("profiles")
          .select(
            "id, email, full_name, role, department, position, sap_number, avatar_url"
          )
          .eq("id", user.id)
          .maybeSingle(),

        db
          .from("equipment")
          .select(
            "id, name, model, serial_number, asset_tag, status, purchase_date, warranty_end, assigned_user, image_url"
          )
          .eq("assigned_user", user.id)
          .order("id", { ascending: false }),

        (supabase as any)
          .from("reservations")
          .select(
            "id, user_id, title, reservation_date, start_time, end_time, location, status, notes, response_note, original_date, original_start_time, original_end_time, created_at"
          )
          .eq("user_id", user.id)
          .order("reservation_date", { ascending: true }),

        (supabase as any)
          .from("notifications")
          .select(
            "id, user_id, title, message, type, read, created_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(20),

        (supabase as any)
          .from("support_tickets")
          .select(
            "id, user_id, subject, description, priority, status, created_at, updated_at"
          )
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
      ]);

      if (profileResult.error) {
        console.error("Erro ao carregar perfil:", profileResult.error);
      } else {
        setProfile((profileResult.data as Profile | null) ?? null);
      }

      if (equipmentResult.error) {
        console.error(
          "Erro ao carregar equipamentos:",
          equipmentResult.error
        );
      } else {
        setEquipment((equipmentResult.data ?? []) as Equipment[]);
      }

      if (reservationResult.error) {
        console.error(
          "Erro ao carregar reservas:",
          reservationResult.error
        );
      } else {
        setReservations(
          (reservationResult.data ?? []) as Reservation[]
        );
      }

      if (notificationResult.error) {
        console.error(
          "Erro ao carregar notificações:",
          notificationResult.error
        );
      } else {
        setNotifications(
          (notificationResult.data ?? []) as Notification[]
        );
      }

      if (ticketResult.error) {
        console.error(
          "Erro ao carregar pedidos de suporte:",
          ticketResult.error
        );
        setTickets([]);
      } else {
        setTickets((ticketResult.data ?? []) as SupportTicket[]);
      }
    } finally {
      setLoading(false);
    }
  }

  /* =========================================================
     REALTIME DAS NOTIFICAÇÕES
     ========================================================= */

  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`portal-notifications-${user.id}`)
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

  async function loadNotifications() {
    if (!user?.id) return;

    const { data, error } = await (supabase as any)
      .from("notifications")
      .select(
        "id, user_id, title, message, type, read, created_at"
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!error) {
      setNotifications((data ?? []) as Notification[]);
    }
  }

  /* =========================================================
     NOTIFICAÇÕES
     ========================================================= */

  async function markNotificationAsRead(id: number) {
    if (!user?.id) return;

    const { error } = await (supabase as any)
      .from("notifications")
      .update({ read: true })
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error(
        isPT
          ? "Não foi possível marcar a notificação."
          : "Could not mark notification."
      );
      return;
    }

    setNotifications((current) =>
      current.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );
  }

  async function markAllNotificationsAsRead() {
    if (!user?.id || unreadNotifications === 0) return;

    const { error } = await (supabase as any)
      .from("notifications")
      .update({ read: true })
      .eq("user_id", user.id)
      .eq("read", false);

    if (error) {
      toast.error(
        isPT
          ? "Não foi possível marcar as notificações."
          : "Could not mark notifications."
      );
      return;
    }

    setNotifications((current) =>
      current.map((item) => ({ ...item, read: true }))
    );
  }

  /* =========================================================
     RESERVAS
     ========================================================= */

  async function createReservation(event: FormEvent) {
    event.preventDefault();

    if (!user?.id) return;

    if (
      !reservationForm.title.trim() ||
      !reservationForm.reservation_date ||
      !reservationForm.start_time ||
      !reservationForm.end_time
    ) {
      toast.error(
        isPT
          ? "Preenche os campos obrigatórios."
          : "Fill in the required fields."
      );
      return;
    }

    if (reservationForm.end_time <= reservationForm.start_time) {
      toast.error(
        isPT
          ? "A hora final tem de ser posterior à hora inicial."
          : "End time must be after start time."
      );
      return;
    }

    setSavingReservation(true);

    const { data, error } = await (supabase as any)
      .from("reservations")
      .insert({
        user_id: user.id,
        title: reservationForm.title.trim(),
        reservation_date: reservationForm.reservation_date,
        start_time: reservationForm.start_time,
        end_time: reservationForm.end_time,
        location: reservationForm.location.trim() || null,
        notes: reservationForm.notes.trim() || null,
        status: "pending",
      })
      .select(
        "id, user_id, title, reservation_date, start_time, end_time, location, status, notes, response_note, original_date, original_start_time, original_end_time, created_at"
      )
      .single();

    setSavingReservation(false);

    if (error) {
      console.error(error);
      toast.error(
        isPT
          ? "Não foi possível criar a reserva."
          : "Could not create reservation."
      );
      return;
    }

    setReservations((current) =>
      [...current, data as Reservation].sort((a, b) =>
        `${a.reservation_date} ${a.start_time}`.localeCompare(
          `${b.reservation_date} ${b.start_time}`
        )
      )
    );

    setReservationDialogOpen(false);

    setReservationForm({
      title: "",
      reservation_date: "",
      start_time: "",
      end_time: "",
      location: "",
      notes: "",
    });

    toast.success(
      isPT
        ? "Reserva enviada para aprovação do IT."
        : "Reservation sent for IT approval."
    );
  }

  async function cancelReservation(id: number) {
    if (!user?.id) return;

    const reservation = reservations.find(
      (item) => item.id === id
    );

    if (!reservation) return;

    if (reservation.status !== "pending") {
      toast.error(
        isPT
          ? "Só podes cancelar reservas pendentes."
          : "Only pending reservations can be cancelled."
      );
      return;
    }

    const { error } = await (supabase as any)
      .from("reservations")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      toast.error(
        isPT
          ? "Não foi possível cancelar a reserva."
          : "Could not cancel reservation."
      );
      return;
    }

    setReservations((current) =>
      current.filter((item) => item.id !== id)
    );

    toast.success(
      isPT ? "Reserva cancelada." : "Reservation cancelled."
    );
  }

  /* =========================================================
     SUPORTE
     ========================================================= */

  async function createSupportTicket(event: FormEvent) {
    event.preventDefault();

    if (!user?.id) return;

    if (
      !ticketForm.subject.trim() ||
      !ticketForm.description.trim()
    ) {
      toast.error(
        isPT
          ? "Preenche o assunto e a descrição."
          : "Fill in the subject and description."
      );
      return;
    }

    setSavingTicket(true);

    const { data, error } = await (supabase as any)
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
        priority: ticketForm.priority,
        status: "open",
      })
      .select(
        "id, user_id, subject, description, priority, status, created_at, updated_at"
      )
      .single();

    setSavingTicket(false);

    if (error) {
      console.error(error);
      toast.error(
        isPT
          ? "Não foi possível criar o pedido."
          : "Could not create request."
      );
      return;
    }

    setTickets((current) => [
      data as SupportTicket,
      ...current,
    ]);

    setSupportDialogOpen(false);

    setTicketForm({
      subject: "",
      description: "",
      priority: "normal",
    });

    toast.success(
      isPT
        ? "Pedido enviado para a equipa de IT."
        : "Request sent to the IT team."
    );
  }

  /* =========================================================
     FORMATAÇÃO
     ========================================================= */

  const formatDate = (value: string | null) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString(
      isPT ? "pt-PT" : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (value: string | null) => {
    if (!value) return "—";
    return value.slice(0, 5);
  };

  const getEquipmentStatus = (status: string | null) => {
    switch (status) {
      case "active":
        return isPT ? "Ativo" : "Active";
      case "maintenance":
        return isPT ? "Manutenção" : "Maintenance";
      case "inactive":
        return isPT ? "Inativo" : "Inactive";
      case "decommissioned":
        return isPT ? "Descontinuado" : "Decommissioned";
      default:
        return status || "—";
    }
  };

  const getReservationStatus = (status: string) => {
    switch (status) {
      case "pending":
        return {
          label: isPT
            ? "A aguardar aprovação"
            : "Awaiting approval",
          className:
            "bg-amber-500/10 text-amber-400",
        };

      case "approved":
        return {
          label: isPT ? "Aprovada" : "Approved",
          className:
            "bg-emerald-500/10 text-emerald-400",
        };

      case "rejected":
        return {
          label: isPT ? "Recusada" : "Rejected",
          className:
            "bg-red-500/10 text-red-400",
        };

      case "rescheduled":
        return {
          label: isPT ? "Reagendada" : "Rescheduled",
          className:
            "bg-blue-500/10 text-blue-400",
        };

      case "cancelled":
        return {
          label: isPT ? "Cancelada" : "Cancelled",
          className:
            "bg-white/[0.06] text-white/45",
        };

      default:
        return {
          label: status,
          className:
            "bg-white/[0.06] text-white/45",
        };
    }
  };

  const getTicketStatus = (status: string) => {
    switch (status) {
      case "open":
        return isPT ? "Aberto" : "Open";
      case "in_progress":
        return isPT ? "Em análise" : "In progress";
      case "resolved":
        return isPT ? "Resolvido" : "Resolved";
      case "closed":
        return isPT ? "Fechado" : "Closed";
      default:
        return status;
    }
  };

  const upcomingReservations = useMemo(() => {
    const today = new Date()
      .toISOString()
      .slice(0, 10);

    return reservations
      .filter(
        (item) =>
          item.reservation_date >= today &&
          item.status !== "cancelled" &&
          item.status !== "rejected"
      )
      .slice(0, 3);
  }, [reservations]);

  /* =========================================================
     NAVEGAÇÃO
     ========================================================= */

  const navigation = [
    {
      label: isPT ? "Início" : "Home",
      icon: Laptop,
      path: "/portal",
      exact: true,
    },
    {
      label: isPT
        ? "Os meus equipamentos"
        : "My equipment",
      icon: Laptop,
      path: "/portal/equipment",
    },
    {
      label: isPT ? "Suporte" : "Support",
      icon: Headphones,
      path: "/portal/support",
    },
    {
      label: isPT ? "Reservas" : "Reservations",
      icon: CalendarDays,
      path: "/portal/reservations",
    },
    {
      label: isPT ? "Perfil" : "Profile",
      icon: UserRound,
      path: "/portal/profile",
    },
  ];

  const isActive = (
    path: string,
    exact?: boolean
  ) =>
    exact
      ? location.pathname === path
      : location.pathname.startsWith(path);

  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div
        className={`flex min-h-screen items-center justify-center ${
          isLight
            ? "bg-[#E5E7EB] text-slate-900"
            : "bg-[#080D1F] text-white"
        }`}
      >
        <div className="flex items-center gap-3 text-sm">
          <span
            className={`h-5 w-5 animate-spin rounded-full border-2 ${
              isLight
                ? "border-slate-300 border-t-slate-700"
                : "border-white/15 border-t-blue-400"
            }`}
          />
          {isPT ? "A carregar..." : "Loading..."}
        </div>
      </div>
    );
  }

  /* =========================================================
     CLASSES DE TEMA
     ========================================================= */

  const pageBg = isLight
    ? "bg-[#E5E7EB]"
    : "bg-[#080D1F]";

  const sidebarBg = isLight
    ? "bg-[#F8FAFC]"
    : "bg-[#07101F]";

  const cardBg = isLight
    ? "bg-[#F8FAFC]"
    : "bg-[#0D1730]";

  const innerBg = isLight
    ? "bg-[#EEF1F4]"
    : "bg-[#0B162A]";

  const mainText = isLight
    ? "text-slate-900"
    : "text-white";

  const mutedText = isLight
    ? "text-slate-500"
    : "text-white/40";

  const softText = isLight
    ? "text-slate-600"
    : "text-white/55";

  const border = isLight
    ? "border-slate-200"
    : "border-white/[0.06]";

  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div
      className={`min-h-screen ${pageBg} ${mainText}`}
    >
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      {sidebarOpen && (
        <button
          type="button"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex ${collapsed ? "w-[76px]" : "w-[268px]"} flex-col border-r ${border} ${sidebarBg} transition-[width,transform] duration-200 lg:translate-x-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full"
        }`}
      >
        {/* ================================================= HEADER ================================================= */}

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

        {/* NAV + HELP */}

        <nav className="flex flex-1 flex-col px-4 py-7">
          <div className="space-y-1.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(
                item.path,
                item.exact
              );

              return (
                <button
                  key={item.path}
                  type="button"
                  onClick={() => {
                    navigate(item.path);
                    setSidebarOpen(false);
                  }}
                  className={`group flex h-11 w-full items-center gap-3 rounded-xl px-4 text-left text-sm transition ${collapsed ? "justify-center px-0" : ""} ${
                    active
                      ? isLight
                        ? "bg-blue-50 text-blue-600"
                        : "bg-blue-500/[0.14] text-blue-300"
                      : isLight
                        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        : "text-white/65 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  <Icon
                    size={22}
                    strokeWidth={1.9}
                    className={
                      active
                        ? "text-blue-500"
                        : isLight
                          ? "text-slate-500"
                          : "text-white/60"
                    }
                  />

                  {!collapsed && <span>{item.label}</span>}

                  {active && !collapsed && (
                    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* HELP */}

          {!collapsed && (
          <div
            className={`mt-auto rounded-xl border ${border} ${
              isLight
                ? "bg-[#EEF1F4]"
                : "bg-[#0B162A]"
            } p-4`}
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                <CircleHelp size={15} />
              </div>

              <span
                className={`text-xs font-semibold ${mainText}`}
              >
                {isPT
                  ? "Precisas de ajuda?"
                  : "Need help?"}
              </span>
            </div>

            <p
              className={`text-[11px] leading-5 ${mutedText}`}
            >
              {isPT
                ? "A nossa equipa de IT está aqui para te ajudar."
                : "Our IT team is here to help you."}
            </p>

            <button
              type="button"
              onClick={() => {
                navigate("/portal/support");
                setSidebarOpen(false);
              }}
              className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/[0.08] text-[11px] font-medium text-blue-400 transition hover:bg-blue-500/[0.14]"
            >
              {isPT
                ? "Abrir pedido"
                : "Open request"}
              <ChevronRight size={13} />
            </button>
          </div>
          )}
        </nav>

        {/* FOOTER */}

        {!collapsed && (
          <div
            className={`border-t ${border} px-7 py-5`}
          >
            <div
              className={`text-xs ${mutedText}`}
            >
              NexHop Employee
            </div>

            <div
              className={`mt-1 text-[10px] ${
                isLight
                  ? "text-slate-400"
                  : "text-white/20"
              }`}
            >
              v1.0.0
            </div>
          </div>
        )}
      </aside>

      {/* =====================================================
          MAIN
          ===================================================== */}

      <div className={`min-h-screen transition-[padding] duration-200 ${collapsed ? "lg:pl-[76px]" : "lg:pl-[268px]"}`}>
        {/* HEADER */}

        <header
          className={`sticky top-0 z-30 flex h-[84px] items-center justify-between border-b ${border} ${
            isLight
              ? "bg-[#E5E7EB]/95"
              : "bg-[#080D1F]/95"
          } px-5 backdrop-blur-xl sm:px-7`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <button
              type="button"
              onClick={() =>
                setSidebarOpen(true)
              }
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg lg:hidden ${
                isLight
                  ? "text-slate-500 hover:bg-slate-200"
                  : "text-white/60 hover:bg-white/[0.05]"
              }`}
            >
              <Menu size={20} />
            </button>

            <div className="relative hidden w-full max-w-[490px] sm:block">
              <Search
                size={17}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
                  isLight
                    ? "text-slate-400"
                    : "text-white/30"
                }`}
              />

              <input
                type="text"
                placeholder={
                  isPT
                    ? "Pesquisar..."
                    : "Search..."
                }
                className={`h-11 w-full rounded-xl border ${border} ${
                  isLight
                    ? "bg-[#F8FAFC]"
                    : "bg-[#0B1528]"
                } pl-11 pr-4 text-sm outline-none ${
                  isLight
                    ? "text-slate-900 placeholder:text-slate-400"
                    : "text-white placeholder:text-white/30"
                } focus:border-blue-500/40`}
              />
            </div>
          </div>

          {/* HEADER RIGHT */}

          <div className="ml-4 flex items-center gap-3">
            {/* NOTIFICATIONS */}

            <div className="relative">
              <button
                type="button"
                onClick={() =>
                  setNotificationsOpen(
                    (current) => !current
                  )
                }
                className={`relative flex h-10 w-10 items-center justify-center rounded-full border ${border} ${
                  isLight
                    ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <Bell size={18} />

                {unreadNotifications > 0 && (
                  <span className="absolute right-[7px] top-[6px] h-2.5 w-2.5 rounded-full border-2 border-[#080D1F] bg-blue-500" />
                )}
              </button>

              {notificationsOpen && (
                <div
                  className={`absolute right-0 top-[52px] z-50 w-[360px] overflow-hidden rounded-2xl border ${border} ${cardBg} shadow-2xl`}
                >
                  <div
                    className={`flex items-center justify-between border-b ${border} px-4 py-3.5`}
                  >
                    <div>
                      <h3
                        className={`text-sm font-semibold ${mainText}`}
                      >
                        {isPT
                          ? "Notificações"
                          : "Notifications"}
                      </h3>

                      <p
                        className={`mt-0.5 text-[10px] ${mutedText}`}
                      >
                        {unreadNotifications > 0
                          ? isPT
                            ? `${unreadNotifications} por ler`
                            : `${unreadNotifications} unread`
                          : isPT
                            ? "Tudo lido"
                            : "All caught up"}
                      </p>
                    </div>

                    {unreadNotifications > 0 && (
                      <button
                        type="button"
                        onClick={
                          markAllNotificationsAsRead
                        }
                        className="text-[10px] font-medium text-blue-400"
                      >
                        {isPT
                          ? "Marcar tudo como lido"
                          : "Mark all as read"}
                      </button>
                    )}
                  </div>

                  <div className="max-h-[390px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
                        <div
                          className={`flex h-11 w-11 items-center justify-center rounded-full ${
                            isLight
                              ? "bg-slate-100 text-slate-400"
                              : "bg-white/[0.04] text-white/30"
                          }`}
                        >
                          <Bell size={18} />
                        </div>

                        <p
                          className={`mt-3 text-xs font-medium ${softText}`}
                        >
                          {isPT
                            ? "Sem notificações"
                            : "No notifications"}
                        </p>

                        <p
                          className={`mt-1 text-[10px] ${mutedText}`}
                        >
                          {isPT
                            ? "Quando houver novidades, aparecem aqui."
                            : "New updates will appear here."}
                        </p>
                      </div>
                    ) : (
                      notifications.map(
                        (notification) => (
                          <button
                            key={notification.id}
                            type="button"
                            onClick={() =>
                              markNotificationAsRead(
                                notification.id
                              )
                            }
                            className={`flex w-full gap-3 border-b ${border} px-4 py-3.5 text-left transition ${
                              !notification.read
                                ? isLight
                                  ? "bg-blue-50"
                                  : "bg-blue-500/[0.035]"
                                : ""
                            } ${
                              isLight
                                ? "hover:bg-slate-50"
                                : "hover:bg-white/[0.035]"
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
                                  className={`flex-1 text-xs font-semibold ${mainText}`}
                                >
                                  {notification.title}
                                </p>

                                {!notification.read && (
                                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                )}
                              </div>

                              <p
                                className={`mt-1 text-[10px] leading-4 ${mutedText}`}
                              >
                                {notification.message}
                              </p>

                              <p
                                className={`mt-1.5 text-[9px] ${
                                  isLight
                                    ? "text-slate-400"
                                    : "text-white/25"
                                }`}
                              >
                                {new Date(
                                  notification.created_at
                                ).toLocaleString(
                                  isPT
                                    ? "pt-PT"
                                    : "en-GB",
                                  {
                                    day: "2-digit",
                                    month: "2-digit",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </p>
                            </div>
                          </button>
                        )
                      )
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* PROFILE MENU */}

            <div
              className={`relative border-l ${border} pl-3 sm:pl-4`}
            >
              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (current) => !current
                  )
                }
                className="flex items-center gap-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#263A5C] text-xs font-semibold text-white">
                  {initials}
                </div>

                <div className="hidden text-left leading-tight sm:block">
                  <div
                    className={`text-xs font-semibold ${mainText}`}
                  >
                    {userName}
                  </div>

                  <div
                    className={`mt-1 text-[10px] ${mutedText}`}
                  >
                    Employee
                  </div>
                </div>

                <ChevronDown
                  size={15}
                  className={mutedText}
                />
              </button>

              {profileOpen && (
                <div
                  className={`absolute right-0 top-[52px] z-50 w-60 rounded-2xl border ${border} ${cardBg} p-2 shadow-2xl`}
                >
                  {/* INFO */}

                  <div
                    className={`border-b ${border} px-3 py-3`}
                  >
                    <p
                      className={`text-xs font-semibold ${mainText}`}
                    >
                      {userName}
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${mutedText}`}
                    >
                      {user?.email ||
                        profile?.email ||
                        "—"}
                    </p>

                    <p
                      className={`mt-1 text-[10px] ${mutedText}`}
                    >
                      {profile?.department ||
                        "—"}
                      {profile?.position
                        ? ` · ${profile.position}`
                        : ""}
                    </p>
                  </div>

                  {/* LANGUAGE */}

                  <div className="px-2 py-2">
                    <p
                      className={`mb-2 px-1 text-[9px] font-semibold uppercase tracking-wider ${mutedText}`}
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
                        className={`rounded-lg px-2 py-2 text-[10px] ${
                          language === "pt"
                            ? "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        Português
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setLanguage("en")
                        }
                        className={`rounded-lg px-2 py-2 text-[10px] ${
                          language === "en"
                            ? "bg-blue-500/10 text-blue-400"
                            : isLight
                              ? "text-slate-500 hover:bg-slate-100"
                              : "text-white/50 hover:bg-white/[0.04]"
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  {/* THEME */}

                  <div
                    className={`border-t ${border} px-2 py-2`}
                  >
                    <p
                      className={`mb-2 px-1 text-[9px] font-semibold uppercase tracking-wider ${mutedText}`}
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
                        className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-[10px] ${
                          !isLight
                            ? "bg-blue-500/10 text-blue-400"
                            : "text-slate-500 hover:bg-slate-100"
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
                        className={`flex items-center justify-center gap-2 rounded-lg px-2 py-2 text-[10px] ${
                          isLight
                            ? "bg-blue-500/10 text-blue-600"
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
                      LOGOUT — CORRIGIDO
                      ================================================= */}

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await signOut();

                        setProfileOpen(false);
                        setNotificationsOpen(false);
                        setSidebarOpen(false);

                        navigate("/login", {
                          replace: true,
                        });
                      } catch (error) {
                        console.error(
                          "Erro ao terminar sessão:",
                          error
                        );

                        toast.error(
                          isPT
                            ? "Não foi possível terminar a sessão."
                            : "Could not sign out."
                        );
                      }
                    }}
                    className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs ${
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

        {/* =====================================================
            CONTENT
            ===================================================== */}

        <main className="px-5 py-7 sm:px-7 lg:px-9">
          {/* HOME */}

          {currentPage === "/" && (
            <>
              <section
                className={`relative mb-6 overflow-hidden rounded-2xl border ${border} ${cardBg}`}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_45%,rgba(37,99,235,0.13),transparent_34%)]" />

                <div className="relative grid min-h-[220px] items-center gap-8 px-6 py-7 lg:grid-cols-[1fr_330px] lg:px-8">
                  <div>
                    <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-blue-400/80">
                      {new Date().toLocaleDateString(
                        isPT
                          ? "pt-PT"
                          : "en-GB",
                        {
                          weekday: "long",
                          day: "2-digit",
                          month: "long",
                        }
                      )}
                    </p>

                    <h1
                      className={`mt-3 text-3xl font-bold tracking-tight sm:text-4xl ${mainText}`}
                    >
                      {isPT
                        ? "Olá"
                        : "Hello"}
                      , {firstName}! 👋
                    </h1>

                    <p
                      className={`mt-3 max-w-[590px] text-sm leading-6 ${mutedText}`}
                    >
                      {isPT
                        ? "Tudo o que precisas, num só lugar. Gere os teus equipamentos, pedidos de suporte e reservas de forma simples e rápida."
                        : "Everything you need, in one place. Manage your equipment, support requests and reservations quickly and easily."}
                    </p>
                  </div>

                  <div
                    className={`hidden h-[160px] overflow-hidden rounded-2xl border ${border} ${
                      isLight
                        ? "bg-[#EEF1F4]"
                        : "bg-[#101E35]"
                    } lg:block`}
                  >
                    <div className="flex h-full flex-col justify-center px-6">
                      <div
                        className={`text-sm ${mutedText}`}
                      >
                        Work
                      </div>

                      <div
                        className={`mt-1 text-3xl font-semibold leading-tight ${mainText}`}
                      >
                        Smarter
                        <br />
                        Together
                      </div>

                      <div className="mt-5 h-1 w-7 bg-blue-500" />
                    </div>
                  </div>
                </div>
              </section>

              <section className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
                <StatCard
                  icon={<Laptop size={20} />}
                  value={String(
                    equipment.length
                  )}
                  label={
                    isPT
                      ? "Equipamentos"
                      : "Equipment"
                  }
                  description={
                    isPT
                      ? "Atribuídos a ti"
                      : "Assigned to you"
                  }
                  light={isLight}
                />

                <StatCard
                  icon={<Headphones size={20} />}
                  value={String(tickets.length)}
                  label={
                    isPT
                      ? "Pedidos de suporte"
                      : "Support requests"
                  }
                  description={
                    tickets.filter(
                      (item) =>
                        item.status !==
                          "resolved" &&
                        item.status !==
                          "closed"
                    ).length
                      ? isPT
                        ? `${tickets.filter((item) => item.status !== "resolved" && item.status !== "closed").length} em aberto`
                        : `${tickets.filter((item) => item.status !== "resolved" && item.status !== "closed").length} open`
                      : isPT
                        ? "Sem pedidos em aberto"
                        : "No open requests"
                  }
                  light={isLight}
                />

                <StatCard
                  icon={
                    <CalendarDays size={20} />
                  }
                  value={String(
                    upcomingReservations.length
                  )}
                  label={
                    isPT
                      ? "Reservas"
                      : "Reservations"
                  }
                  description={
                    isPT
                      ? "Próximas reservas"
                      : "Upcoming reservations"
                  }
                  light={isLight}
                />

                <StatCard
                  icon={<Bell size={20} />}
                  value={String(
                    unreadNotifications
                  )}
                  label={
                    isPT
                      ? "Alertas"
                      : "Alerts"
                  }
                  description={
                    unreadNotifications
                      ? isPT
                        ? "Por ler"
                        : "Unread"
                      : isPT
                        ? "Tudo em dia"
                        : "Everything is up to date"
                  }
                  light={isLight}
                />
              </section>

              <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-6">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <PortalCard
                      title={
                        isPT
                          ? "Os meus equipamentos"
                          : "My equipment"
                      }
                      action={
                        isPT
                          ? "Ver todos"
                          : "View all"
                      }
                      onAction={() =>
                        navigate(
                          "/portal/equipment"
                        )
                      }
                      light={isLight}
                    >
                      {equipment.length === 0 ? (
                        <EmptyState
                          icon={<Laptop size={18} />}
                          text={
                            isPT
                              ? "Não tens equipamentos atribuídos."
                              : "You have no assigned equipment."
                          }
                          light={isLight}
                        />
                      ) : (
                        <div
                          className={`divide-y ${
                            isLight
                              ? "divide-slate-200"
                              : "divide-white/[0.05]"
                          }`}
                        >
                          {equipment
                            .slice(0, 3)
                            .map((item) => (
                              <EquipmentRow
                                key={item.id}
                                item={item}
                                isPT={isPT}
                                light={isLight}
                                getStatus={
                                  getEquipmentStatus
                                }
                              />
                            ))}
                        </div>
                      )}
                    </PortalCard>

                    <PortalCard
                      title={
                        isPT
                          ? "Pedidos de suporte"
                          : "Support requests"
                      }
                      action={
                        isPT
                          ? "Ver todos"
                          : "View all"
                      }
                      onAction={() =>
                        navigate(
                          "/portal/support"
                        )
                      }
                      light={isLight}
                    >
                      {tickets.length === 0 ? (
                        <EmptyState
                          icon={
                            <LifeBuoy size={18} />
                          }
                          text={
                            isPT
                              ? "Ainda não tens pedidos."
                              : "You have no requests yet."
                          }
                          light={isLight}
                        />
                      ) : (
                        <div className="space-y-2">
                          {tickets
                            .slice(0, 2)
                            .map((ticket) => (
                              <TicketRow
                                key={ticket.id}
                                ticket={ticket}
                                isPT={isPT}
                                light={isLight}
                                getStatus={
                                  getTicketStatus
                                }
                              />
                            ))}

                          <button
                            type="button"
                            onClick={() =>
                              setSupportDialogOpen(
                                true
                              )
                            }
                            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-500/40 bg-blue-500/[0.06] text-xs font-medium text-blue-400 hover:bg-blue-500/[0.12]"
                          >
                            <span className="text-base">
                              +
                            </span>
                            {isPT
                              ? "Abrir novo pedido"
                              : "Open new request"}
                          </button>
                        </div>
                      )}
                    </PortalCard>
                  </div>

                  <div
                    className={`relative overflow-hidden rounded-2xl border ${border} ${cardBg}`}
                  >
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(37,99,235,0.12),transparent_45%)]" />

                    <div className="relative px-6 py-7 sm:px-8">
                      <p className="text-xs font-medium text-blue-400">
                        NexHop Employee
                      </p>

                      <h2
                        className={`mt-2 text-2xl font-bold tracking-tight ${mainText}`}
                      >
                        {isPT
                          ? "A tecnologia ao teu lado."
                          : "Technology by your side."}
                      </h2>

                      <p
                        className={`mt-2 text-xs ${mutedText}`}
                      >
                        {isPT
                          ? "Pessoas. Equipamentos. Soluções."
                          : "People. Equipment. Solutions."}
                      </p>

                      <div className="mt-5 h-1 w-8 bg-blue-500" />
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <PortalCard
                    title={
                      isPT
                        ? "Próximas reservas"
                        : "Upcoming reservations"
                    }
                    action={
                      isPT
                        ? "Ver todas"
                        : "View all"
                    }
                    onAction={() =>
                      navigate(
                        "/portal/reservations"
                      )
                    }
                    light={isLight}
                  >
                    {upcomingReservations.length ===
                    0 ? (
                      <EmptyState
                        icon={
                          <CalendarDays size={18} />
                        }
                        text={
                          isPT
                            ? "Não tens reservas próximas."
                            : "You have no upcoming reservations."
                        }
                        light={isLight}
                      />
                    ) : (
                      <div className="space-y-2">
                        {upcomingReservations.map(
                          (reservation) => (
                            <ReservationMini
                              key={reservation.id}
                              reservation={
                                reservation
                              }
                              isPT={isPT}
                              light={isLight}
                              getStatus={
                                getReservationStatus
                              }
                            />
                          )
                        )}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        setReservationDialogOpen(
                          true
                        )
                      }
                      className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-lg border border-blue-500/50 bg-blue-500/[0.07] text-xs font-medium text-blue-400 hover:bg-blue-500/[0.14]"
                    >
                      <CalendarDays size={14} />
                      {isPT
                        ? "Nova reserva"
                        : "New reservation"}
                    </button>
                  </PortalCard>

                  <PortalCard
                    title={
                      isPT
                        ? "Links úteis"
                        : "Useful links"
                    }
                    light={isLight}
                  >
                    <div className="space-y-1">
                      <UsefulLink
                        icon={
                          <FileText size={17} />
                        }
                        label={
                          isPT
                            ? "Guias e manuais"
                            : "Guides and manuals"
                        }
                        light={isLight}
                        onClick={() =>
                          openDocument(
                            isPT
                              ? "Guias e manuais"
                              : "Guides and manuals",
                            "01_Guias_e_Manuais_IT.md",
                            "01_IT_Guides_and_Manuals_EN.md"
                          )
                        }
                      />

                      <UsefulLink
                        icon={
                          <LifeBuoy size={17} />
                        }
                        label={
                          isPT
                            ? "Políticas de IT"
                            : "IT policies"
                        }
                        light={isLight}
                        onClick={() =>
                          openDocument(
                            isPT
                              ? "Políticas de IT"
                              : "IT policies",
                            "02_Politicas_de_IT.md",
                            "02_IT_Policies_EN.md"
                          )
                        }
                      />

                      <UsefulLink
                        icon={
                          <Headphones size={17} />
                        }
                        label={
                          isPT
                            ? "Contactar IT"
                            : "Contact IT"
                        }
                        light={isLight}
                        onClick={() =>
                          navigate(
                            "/portal/support"
                          )
                        }
                      />

                      <UsefulLink
                        icon={
                          <CircleHelp size={17} />
                        }
                        label="FAQ"
                        light={isLight}
                        onClick={() =>
                          openDocument(
                            "FAQ",
                            "03_FAQ_IT.md",
                            "03_IT_FAQ_EN.md"
                          )
                        }
                      />
                    </div>
                  </PortalCard>
                </div>
              </section>
            </>
          )}

          {/* EQUIPMENT */}

          {currentPage === "/equipment" && (
            <PortalSectionHeader
              title={pageTitle}
              description={
                isPT
                  ? "Consulta apenas os equipamentos que estão atribuídos a ti."
                  : "View only the equipment assigned to you."
              }
              light={isLight}
            >
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {equipment.length === 0 ? (
                  <div
                    className={`md:col-span-2 xl:col-span-3 rounded-2xl border ${border} ${cardBg} p-10`}
                  >
                    <EmptyState
                      icon={<Laptop size={22} />}
                      text={
                        isPT
                          ? "Não tens equipamentos atribuídos."
                          : "You have no assigned equipment."
                      }
                      light={isLight}
                    />
                  </div>
                ) : (
                  equipment.map((item) => (
                    <EquipmentCard
                      key={item.id}
                      item={item}
                      isPT={isPT}
                      light={isLight}
                      getStatus={
                        getEquipmentStatus
                      }
                      formatDate={formatDate}
                    />
                  ))
                )}
              </div>
            </PortalSectionHeader>
          )}

          {/* SUPPORT */}

          {currentPage === "/support" && (
            <PortalSectionHeader
              title={pageTitle}
              description={
                isPT
                  ? "Cria pedidos e acompanha o estado dos pedidos enviados à equipa de IT."
                  : "Create requests and track requests sent to the IT team."
              }
              light={isLight}
            >
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-3">
                  {tickets.length === 0 ? (
                    <div
                      className={`rounded-2xl border ${border} ${cardBg} p-10`}
                    >
                      <EmptyState
                        icon={
                          <LifeBuoy size={22} />
                        }
                        text={
                          isPT
                            ? "Ainda não tens pedidos de suporte."
                            : "You have no support requests yet."
                        }
                        light={isLight}
                      />
                    </div>
                  ) : (
                    tickets.map((ticket) => (
                      <div
                        key={ticket.id}
                        className={`rounded-2xl border ${border} ${cardBg} p-5`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-center">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                            <Headphones size={19} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`text-sm font-semibold ${mainText}`}
                            >
                              {ticket.subject}
                            </p>

                            <p
                              className={`mt-1 text-xs ${mutedText}`}
                            >
                              #{ticket.id} ·{" "}
                              {formatDate(
                                ticket.created_at
                              )}
                            </p>

                            <p
                              className={`mt-3 text-xs leading-5 ${softText}`}
                            >
                              {ticket.description}
                            </p>
                          </div>

                          <span className="shrink-0 rounded-full bg-blue-500/10 px-3 py-1.5 text-[10px] font-medium text-blue-400">
                            {getTicketStatus(
                              ticket.status
                            )}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <SupportFormPanel
                  isPT={isPT}
                  isLight={isLight}
                  mainText={mainText}
                  mutedText={mutedText}
                  softText={softText}
                  border={border}
                  ticketForm={ticketForm}
                  setTicketForm={setTicketForm}
                  savingTicket={savingTicket}
                  onSubmit={createSupportTicket}
                />
              </div>
            </PortalSectionHeader>
          )}

          {/* RESERVATIONS */}

          {currentPage === "/reservations" && (
            <PortalSectionHeader
              title={pageTitle}
              description={
                isPT
                  ? "As tuas reservas precisam de aprovação da equipa de IT."
                  : "Your reservations require approval from the IT team."
              }
              light={isLight}
            >
              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-3">
                  {reservations.length === 0 ? (
                    <div
                      className={`rounded-2xl border ${border} ${cardBg} p-10`}
                    >
                      <EmptyState
                        icon={
                          <CalendarDays size={22} />
                        }
                        text={
                          isPT
                            ? "Ainda não tens reservas."
                            : "You have no reservations yet."
                        }
                        light={isLight}
                      />
                    </div>
                  ) : (
                    reservations.map(
                      (reservation) => {
                        const status =
                          getReservationStatus(
                            reservation.status
                          );

                        return (
                          <div
                            key={reservation.id}
                            className={`rounded-2xl border ${border} ${cardBg} p-5`}
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                                <Car size={19} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p
                                  className={`text-sm font-semibold ${mainText}`}
                                >
                                  {
                                    reservation.title
                                  }
                                </p>

                                <p
                                  className={`mt-1 text-xs ${mutedText}`}
                                >
                                  {formatDate(
                                    reservation.reservation_date
                                  )}{" "}
                                  ·{" "}
                                  {formatTime(
                                    reservation.start_time
                                  )}{" "}
                                  -{" "}
                                  {formatTime(
                                    reservation.end_time
                                  )}
                                </p>

                                {reservation.location && (
                                  <p
                                    className={`mt-1 text-[10px] ${mutedText}`}
                                  >
                                    {
                                      reservation.location
                                    }
                                  </p>
                                )}

                                {reservation.response_note && (
                                  <div
                                    className={`mt-3 rounded-lg border ${border} ${
                                      isLight
                                        ? "bg-[#EEF1F4]"
                                        : "bg-white/[0.02]"
                                    } px-3 py-2.5`}
                                  >
                                    <p
                                      className={`text-[10px] font-semibold ${softText}`}
                                    >
                                      {isPT
                                        ? "Resposta do IT"
                                        : "IT response"}
                                    </p>

                                    <p
                                      className={`mt-1 text-xs ${mutedText}`}
                                    >
                                      {
                                        reservation.response_note
                                      }
                                    </p>
                                  </div>
                                )}

                                {reservation.status ===
                                  "rescheduled" &&
                                  reservation.original_date && (
                                    <p
                                      className={`mt-2 text-[10px] ${mutedText}`}
                                    >
                                      {isPT
                                        ? "Data original:"
                                        : "Original date:"}{" "}
                                      {formatDate(
                                        reservation.original_date
                                      )}{" "}
                                      ·{" "}
                                      {formatTime(
                                        reservation.original_start_time
                                      )}{" "}
                                      -{" "}
                                      {formatTime(
                                        reservation.original_end_time
                                      )}
                                    </p>
                                  )}
                              </div>

                              <div className="flex shrink-0 flex-col items-start gap-2 lg:items-end">
                                <span
                                  className={`rounded-full px-3 py-1.5 text-[10px] font-medium ${status.className}`}
                                >
                                  {status.label}
                                </span>

                                {reservation.status ===
                                  "pending" && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      cancelReservation(
                                        reservation.id
                                      )
                                    }
                                    className={`text-[10px] ${
                                      isLight
                                        ? "text-slate-400 hover:text-red-600"
                                        : "text-white/30 hover:text-red-400"
                                    }`}
                                  >
                                    {isPT
                                      ? "Cancelar pedido"
                                      : "Cancel request"}
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )
                  )}
                </div>

                <ReservationFormPanel
                  isPT={isPT}
                  isLight={isLight}
                  mainText={mainText}
                  mutedText={mutedText}
                  softText={softText}
                  border={border}
                  reservationForm={reservationForm}
                  setReservationForm={
                    setReservationForm
                  }
                  savingReservation={
                    savingReservation
                  }
                  onSubmit={createReservation}
                />
              </div>
            </PortalSectionHeader>
          )}

          {/* PROFILE */}

          {currentPage === "/profile" && (
            <PortalSectionHeader
              title={pageTitle}
              description={
                isPT
                  ? "Os dados do teu perfil são geridos pela empresa."
                  : "Your profile data is managed by the company."
              }
              light={isLight}
            >
              <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
                <div
                  className={`rounded-2xl border ${border} ${cardBg} p-6`}
                >
                  <div className="mb-6 flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#263A5C] text-lg font-semibold text-white">
                      {initials}
                    </div>

                    <div>
                      <h2
                        className={`text-lg font-semibold ${mainText}`}
                      >
                        {userName}
                      </h2>

                      <p
                        className={`mt-1 text-xs ${mutedText}`}
                      >
                        {user?.email ||
                          profile?.email ||
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <ReadOnlyField
                      label={
                        isPT
                          ? "Nome"
                          : "Name"
                      }
                      value={
                        profile?.full_name ||
                        userName
                      }
                      light={isLight}
                    />

                    <ReadOnlyField
                      label="Email"
                      value={
                        user?.email ||
                        profile?.email ||
                        "—"
                      }
                      light={isLight}
                    />

                    <ReadOnlyField
                      label={
                        isPT
                          ? "Departamento"
                          : "Department"
                      }
                      value={
                        profile?.department ||
                        "—"
                      }
                      light={isLight}
                    />

                    <ReadOnlyField
                      label={
                        isPT
                          ? "Cargo"
                          : "Position"
                      }
                      value={
                        profile?.position ||
                        "—"
                      }
                      light={isLight}
                    />

                    <ReadOnlyField
                      label={
                        isPT
                          ? "Número de colaborador"
                          : "Employee number"
                      }
                      value={
                        profile?.sap_number ||
                        "—"
                      }
                      light={isLight}
                    />

                    <ReadOnlyField
                      label="Role"
                      value={
                        profile?.role ||
                        "user"
                      }
                      light={isLight}
                    />
                  </div>
                </div>

                <div
                  className={`rounded-2xl border ${border} ${cardBg} p-5`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <UserRound size={18} />
                    </div>

                    <div>
                      <h3
                        className={`text-sm font-semibold ${mainText}`}
                      >
                        {isPT
                          ? "Preferências"
                          : "Preferences"}
                      </h3>

                      <p
                        className={`mt-1 text-[10px] ${mutedText}`}
                      >
                        {isPT
                          ? "Estas opções podem ser alteradas por ti."
                          : "These options can be changed by you."}
                      </p>
                    </div>
                  </div>

                  <div
                    className={`mt-5 border-t ${border} pt-5`}
                  >
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                    >
                      {isPT
                        ? "Idioma"
                        : "Language"}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setLanguage("pt")
                        }
                        className={`rounded-lg border px-3 py-2.5 text-xs ${
                          language === "pt"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : `${border} ${mutedText}`
                        }`}
                      >
                        Português
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setLanguage("en")
                        }
                        className={`rounded-lg border px-3 py-2.5 text-xs ${
                          language === "en"
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : `${border} ${mutedText}`
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>

                  <div
                    className={`mt-5 border-t ${border} pt-5`}
                  >
                    <p
                      className={`text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                    >
                      {isPT
                        ? "Tema"
                        : "Theme"}
                    </p>

                    <div className="mt-2 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setTheme("dark")
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs ${
                          !isLight
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-400"
                            : `${border} ${mutedText}`
                        }`}
                      >
                        <Moon size={14} />

                        {isPT
                          ? "Escuro"
                          : "Dark"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setTheme("light")
                        }
                        className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-xs ${
                          isLight
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-600"
                            : `${border} ${mutedText}`
                        }`}
                      >
                        <Sun size={14} />

                        {isPT
                          ? "Claro"
                          : "Light"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </PortalSectionHeader>
          )}
        </main>

        {documentViewer && (
          <DocumentViewerModal
            title={documentViewer.title}
            content={documentViewer.content}
            light={isLight}
            onClose={() => setDocumentViewer(null)}
          />
        )}
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENTES
   ========================================================= */

const UsefulLink = ({
  icon,
  label,
  light,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  light: boolean;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-3 text-left text-xs ${
      light
        ? "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
        : "text-white/60 hover:bg-white/[0.035] hover:text-white"
    }`}
  >
    <span>{icon}</span>
    <span className="flex-1">{label}</span>
    <ChevronRight size={14} />
  </button>
);

const DocumentViewerModal = ({
  title,
  content,
  light,
  onClose,
}: {
  title: string;
  content: string;
  light: boolean;
  onClose: () => void;
}) => {
  const lines = content.split("\n");

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <section
        className={`flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border ${
          light
            ? "border-slate-200 bg-[#F8FAFC]"
            : "border-white/[0.06] bg-[#0D1730]"
        } shadow-2xl`}
      >
        <header
          className={`flex items-center justify-between border-b ${
            light
              ? "border-slate-200"
              : "border-white/[0.06]"
          } px-5 py-4`}
        >
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-500">
              NexHop Employee
            </p>
            <h2
              className={`mt-1 text-lg font-semibold ${
                light ? "text-slate-900" : "text-white"
              }`}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-9 w-9 items-center justify-center rounded-lg ${
              light
                ? "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                : "text-white/50 hover:bg-white/[0.05] hover:text-white"
            }`}
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </header>

        <div className="overflow-y-auto px-6 py-6 sm:px-8">
          <div className="space-y-3">
            {lines.map((line, index) => {
              const trimmed = line.trim();

              if (!trimmed) {
                return <div key={index} className="h-1" />;
              }

              if (trimmed === "---") {
                return (
                  <hr
                    key={index}
                    className={
                      light
                        ? "border-slate-200"
                        : "border-white/[0.06]"
                    }
                  />
                );
              }

              if (trimmed.startsWith("# ")) {
                return (
                  <h1
                    key={index}
                    className={`pt-2 text-2xl font-bold tracking-tight ${
                      light ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {trimmed.slice(2)}
                  </h1>
                );
              }

              if (trimmed.startsWith("## ")) {
                return (
                  <h2
                    key={index}
                    className={`pt-3 text-lg font-semibold ${
                      light ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {trimmed.slice(3)}
                  </h2>
                );
              }

              if (trimmed.startsWith("### ")) {
                return (
                  <h3
                    key={index}
                    className={`pt-2 text-sm font-semibold ${
                      light ? "text-slate-800" : "text-white/90"
                    }`}
                  >
                    {trimmed.slice(4)}
                  </h3>
                );
              }

              if (trimmed.startsWith("> ")) {
                return (
                  <div
                    key={index}
                    className={`rounded-lg border-l-2 border-blue-500 px-4 py-2 text-xs leading-5 ${
                      light
                        ? "bg-blue-50 text-slate-600"
                        : "bg-blue-500/[0.05] text-white/55"
                    }`}
                  >
                    {trimmed.slice(2)}
                  </div>
                );
              }

              if (trimmed.startsWith("- ")) {
                return (
                  <div
                    key={index}
                    className={`flex gap-3 pl-2 text-xs leading-6 ${
                      light ? "text-slate-600" : "text-white/60"
                    }`}
                  >
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                    <span>{formatInlineMarkdown(trimmed.slice(2))}</span>
                  </div>
                );
              }

              const numbered = trimmed.match(/^(\d+)\.\s+(.*)$/);

              if (numbered) {
                return (
                  <div
                    key={index}
                    className={`flex gap-3 pl-2 text-xs leading-6 ${
                      light ? "text-slate-600" : "text-white/60"
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-[9px] font-semibold text-blue-500">
                      {numbered[1]}
                    </span>
                    <span>{formatInlineMarkdown(numbered[2])}</span>
                  </div>
                );
              }

              return (
                <p
                  key={index}
                  className={`text-xs leading-6 ${
                    light ? "text-slate-600" : "text-white/60"
                  }`}
                >
                  {formatInlineMarkdown(trimmed)}
                </p>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

const formatInlineMarkdown = (value: string) => {
  const parts = value.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code
          key={index}
          className="rounded bg-blue-500/10 px-1.5 py-0.5 text-[10px] text-blue-400"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
};

const SupportFormPanel = ({
  isPT,
  isLight,
  mainText,
  mutedText,
  softText,
  border,
  ticketForm,
  setTicketForm,
  savingTicket,
  onSubmit,
}: {
  isPT: boolean;
  isLight: boolean;
  mainText: string;
  mutedText: string;
  softText: string;
  border: string;
  ticketForm: {
    subject: string;
    description: string;
    priority: string;
  };
  setTicketForm: React.Dispatch<
    React.SetStateAction<{
      subject: string;
      description: string;
      priority: string;
    }>
  >;
  savingTicket: boolean;
  onSubmit: (
    event: FormEvent
  ) => void;
}) => (
  <section
    className={`h-fit rounded-2xl border ${border} ${
      isLight
        ? "bg-[#F8FAFC]"
        : "bg-[#0D1730]"
    } p-5 xl:sticky xl:top-6`}
  >
    <div className="mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
        <Headphones size={18} />
      </div>

      <h2
        className={`mt-3 text-sm font-semibold ${mainText}`}
      >
        {isPT
          ? "Abrir pedido de suporte"
          : "Open support request"}
      </h2>

      <p
        className={`mt-1 text-[10px] leading-4 ${mutedText}`}
      >
        {isPT
          ? "Envia um pedido diretamente para a equipa de IT."
          : "Send a request directly to the IT team."}
      </p>
    </div>

    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <FormField
        label={
          isPT
            ? "Assunto"
            : "Subject"
        }
        value={ticketForm.subject}
        onChange={(value) =>
          setTicketForm((current) => ({
            ...current,
            subject: value,
          }))
        }
        placeholder={
          isPT
            ? "Ex.: Computador não liga"
            : "e.g. Computer won't start"
        }
        light={isLight}
      />

      <div>
        <label
          className={`mb-2 block text-[11px] font-semibold ${softText}`}
        >
          {isPT
            ? "Prioridade"
            : "Priority"}
        </label>

        <select
          value={ticketForm.priority}
          onChange={(event) =>
            setTicketForm((current) => ({
              ...current,
              priority:
                event.target.value,
            }))
          }
          className={`h-11 w-full rounded-xl border ${border} ${
            isLight
              ? "bg-white text-slate-900"
              : "bg-[#0A1328] text-white"
          } px-3 text-xs outline-none`}
        >
          <option value="low">
            {isPT ? "Baixa" : "Low"}
          </option>

          <option value="normal">
            Normal
          </option>

          <option value="high">
            {isPT ? "Alta" : "High"}
          </option>

          <option value="urgent">
            {isPT
              ? "Urgente"
              : "Urgent"}
          </option>
        </select>
      </div>

      <TextAreaField
        label={
          isPT
            ? "Descrição"
            : "Description"
        }
        value={ticketForm.description}
        onChange={(value) =>
          setTicketForm((current) => ({
            ...current,
            description: value,
          }))
        }
        placeholder={
          isPT
            ? "Explica o problema..."
            : "Describe the issue..."
        }
        light={isLight}
      />

      <button
        type="submit"
        disabled={savingTicket}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {savingTicket
          ? isPT
            ? "A enviar..."
            : "Sending..."
          : isPT
            ? "Enviar pedido"
            : "Send request"}
      </button>
    </form>
  </section>
);

const ReservationFormPanel = ({
  isPT,
  isLight,
  mainText,
  mutedText,
  softText,
  border,
  reservationForm,
  setReservationForm,
  savingReservation,
  onSubmit,
}: {
  isPT: boolean;
  isLight: boolean;
  mainText: string;
  mutedText: string;
  softText: string;
  border: string;
  reservationForm: {
    title: string;
    reservation_date: string;
    start_time: string;
    end_time: string;
    location: string;
    notes: string;
  };
  setReservationForm: React.Dispatch<
    React.SetStateAction<{
      title: string;
      reservation_date: string;
      start_time: string;
      end_time: string;
      location: string;
      notes: string;
    }>
  >;
  savingReservation: boolean;
  onSubmit: (
    event: FormEvent
  ) => void;
}) => (
  <section
    className={`h-fit rounded-2xl border ${border} ${
      isLight
        ? "bg-[#F8FAFC]"
        : "bg-[#0D1730]"
    } p-5 xl:sticky xl:top-6`}
  >
    <div className="mb-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
        <CalendarDays size={18} />
      </div>

      <h2
        className={`mt-3 text-sm font-semibold ${mainText}`}
      >
        {isPT
          ? "Nova reserva"
          : "New reservation"}
      </h2>

      <p
        className={`mt-1 text-[10px] leading-4 ${mutedText}`}
      >
        {isPT
          ? "Envia uma reserva para aprovação da equipa de IT."
          : "Send a reservation for IT team approval."}
      </p>
    </div>

    <form
      onSubmit={onSubmit}
      className="space-y-4"
    >
      <FormField
        label={
          isPT
            ? "Título"
            : "Title"
        }
        value={reservationForm.title}
        onChange={(value) =>
          setReservationForm((current) => ({
            ...current,
            title: value,
          }))
        }
        placeholder={
          isPT
            ? "Ex.: Viatura para visita"
            : "e.g. Vehicle for visit"
        }
        light={isLight}
      />

      <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        <FormField
          type="date"
          label={
            isPT
              ? "Data"
              : "Date"
          }
          value={
            reservationForm.reservation_date
          }
          onChange={(value) =>
            setReservationForm(
              (current) => ({
                ...current,
                reservation_date:
                  value,
              })
            )
          }
          light={isLight}
        />

        <FormField
          type="time"
          label={
            isPT
              ? "Início"
              : "Start"
          }
          value={
            reservationForm.start_time
          }
          onChange={(value) =>
            setReservationForm(
              (current) => ({
                ...current,
                start_time: value,
              })
            )
          }
          light={isLight}
        />

        <FormField
          type="time"
          label={
            isPT
              ? "Fim"
              : "End"
          }
          value={
            reservationForm.end_time
          }
          onChange={(value) =>
            setReservationForm(
              (current) => ({
                ...current,
                end_time: value,
              })
            )
          }
          light={isLight}
        />
      </div>

      <FormField
        label={
          isPT
            ? "Local"
            : "Location"
        }
        value={reservationForm.location}
        onChange={(value) =>
          setReservationForm((current) => ({
            ...current,
            location: value,
          }))
        }
        placeholder={
          isPT
            ? "Local da reserva"
            : "Reservation location"
        }
        light={isLight}
      />

      <TextAreaField
        label={
          isPT
            ? "Notas"
            : "Notes"
        }
        value={reservationForm.notes}
        onChange={(value) =>
          setReservationForm((current) => ({
            ...current,
            notes: value,
          }))
        }
        placeholder={
          isPT
            ? "Informação adicional..."
            : "Additional information..."
        }
        light={isLight}
      />

      <div
        className={`rounded-lg border ${border} ${
          isLight
            ? "bg-[#EEF1F4]"
            : "bg-white/[0.02]"
        } px-3 py-2.5`}
      >
        <p
          className={`text-[10px] font-semibold ${softText}`}
        >
          {isPT
            ? "Estado inicial"
            : "Initial status"}
        </p>

        <p
          className={`mt-1 text-xs ${mutedText}`}
        >
          {isPT
            ? "A aguardar aprovação do IT"
            : "Awaiting IT approval"}
        </p>
      </div>

      <button
        type="submit"
        disabled={savingReservation}
        className="flex h-10 w-full items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {savingReservation
          ? isPT
            ? "A enviar..."
            : "Sending..."
          : isPT
            ? "Enviar para aprovação"
            : "Send for approval"}
      </button>
    </form>
  </section>
);

const StatCard = ({
  icon,
  value,
  label,
  description,
  light,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
  light: boolean;
}) => (
  <div
    className={`group rounded-xl border ${
      light
        ? "border-slate-200 bg-[#F8FAFC]"
        : "border-white/[0.06] bg-[#0D1730]"
    } p-4 transition`}
  >
    <div className="flex items-center justify-between">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
        {icon}
      </div>

      <ChevronRight
        size={16}
        className={
          light
            ? "text-slate-300"
            : "text-white/20"
        }
      />
    </div>

    <div className="mt-4 flex items-end gap-2">
      <span
        className={`text-3xl font-bold tracking-tight ${
          light
            ? "text-slate-900"
            : "text-white"
        }`}
      >
        {value}
      </span>

      <span
        className={`mb-1 text-[10px] font-medium ${
          light
            ? "text-slate-600"
            : "text-white/55"
        }`}
      >
        {label}
      </span>
    </div>

    <p
      className={`mt-1 text-[10px] ${
        light
          ? "text-slate-400"
          : "text-white/30"
      }`}
    >
      {description}
    </p>
  </div>
);

const PortalCard = ({
  title,
  action,
  onAction,
  children,
  light,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
  light: boolean;
}) => (
  <section
    className={`rounded-2xl border ${
      light
        ? "border-slate-200 bg-[#F8FAFC]"
        : "border-white/[0.06] bg-[#0D1730]"
    } p-5`}
  >
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2
        className={`text-sm font-semibold ${
          light
            ? "text-slate-900"
            : "text-white"
        }`}
      >
        {title}
      </h2>

      {action && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="flex items-center gap-1 text-[10px] font-medium text-blue-500 hover:text-blue-400"
        >
          {action}
          <ChevronRight size={12} />
        </button>
      )}
    </div>

    {children}
  </section>
);

const EmptyState = ({
  icon,
  text,
  light,
}: {
  icon: React.ReactNode;
  text: string;
  light: boolean;
}) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div
      className={`flex h-11 w-11 items-center justify-center rounded-full ${
        light
          ? "bg-slate-100 text-slate-400"
          : "bg-white/[0.04] text-white/30"
      }`}
    >
      {icon}
    </div>

    <p
      className={`mt-3 text-xs ${
        light
          ? "text-slate-500"
          : "text-white/40"
      }`}
    >
      {text}
    </p>
  </div>
);

const EquipmentRow = ({
  item,
  isPT,
  light,
  getStatus,
}: {
  item: Equipment;
  isPT: boolean;
  light: boolean;
  getStatus: (
    status: string | null
  ) => string;
}) => (
  <div className="flex items-center gap-3 py-3.5">
    <div
      className={`flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg ${
        light
          ? "bg-slate-100"
          : "bg-[#101B30]"
      }`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={
            item.name ||
            "Equipment"
          }
          className="h-full w-full object-cover"
        />
      ) : (
        <Laptop
          size={20}
          className={
            light
              ? "text-slate-400"
              : "text-white/35"
          }
        />
      )}
    </div>

    <div className="min-w-0 flex-1">
      <p
        className={`truncate text-xs font-semibold ${
          light
            ? "text-slate-900"
            : "text-white"
        }`}
      >
        {item.name ||
          item.model ||
          (isPT
            ? "Equipamento"
            : "Equipment")}
      </p>

      <p
        className={`mt-1 text-[10px] ${
          light
            ? "text-slate-500"
            : "text-white/35"
        }`}
      >
        {item.model || "—"}
      </p>

      <p
        className={`mt-0.5 text-[9px] ${
          light
            ? "text-slate-400"
            : "text-white/25"
        }`}
      >
        SN:{" "}
        {item.serial_number ||
          "—"}
      </p>
    </div>

    <div className="hidden text-right sm:block">
      <span className="inline-flex rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-medium text-emerald-500">
        {getStatus(item.status)}
      </span>

      <p
        className={`mt-2 text-[9px] ${
          light
            ? "text-slate-400"
            : "text-white/30"
        }`}
      >
        Asset
      </p>

      <p
        className={`mt-0.5 text-[10px] font-medium ${
          light
            ? "text-slate-600"
            : "text-white/60"
        }`}
      >
        {item.asset_tag ||
          "—"}
      </p>
    </div>
  </div>
);

const EquipmentCard = ({
  item,
  isPT,
  light,
  getStatus,
  formatDate,
}: {
  item: Equipment;
  isPT: boolean;
  light: boolean;
  getStatus: (
    status: string | null
  ) => string;
  formatDate: (
    value: string | null
  ) => string;
}) => (
  <div
    className={`overflow-hidden rounded-2xl border ${
      light
        ? "border-slate-200 bg-[#F8FAFC]"
        : "border-white/[0.06] bg-[#0D1730]"
    }`}
  >
    <div
      className={`flex h-44 items-center justify-center ${
        light
          ? "bg-[#EEF1F4]"
          : "bg-[#0A1328]"
      }`}
    >
      {item.image_url ? (
        <img
          src={item.image_url}
          alt={
            item.name ||
            "Equipment"
          }
          className="h-full w-full object-contain p-5"
        />
      ) : (
        <Laptop
          size={54}
          className={
            light
              ? "text-slate-300"
              : "text-white/15"
          }
        />
      )}
    </div>

    <div className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3
            className={`truncate text-sm font-semibold ${
              light
                ? "text-slate-900"
                : "text-white"
            }`}
          >
            {item.name ||
              item.model ||
              (isPT
                ? "Equipamento"
                : "Equipment")}
          </h3>

          <p
            className={`mt-1 text-[10px] ${
              light
                ? "text-slate-500"
                : "text-white/35"
            }`}
          >
            {item.model || "—"}
          </p>
        </div>

        <span className="shrink-0 rounded-full bg-emerald-500/10 px-2 py-1 text-[9px] font-medium text-emerald-500">
          {getStatus(item.status)}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <InfoItem
          label="Serial"
          value={
            item.serial_number ||
            "—"
          }
          light={light}
        />

        <InfoItem
          label="Asset tag"
          value={
            item.asset_tag ||
            "—"
          }
          light={light}
        />

        <InfoItem
          label={
            isPT
              ? "Compra"
              : "Purchase"
          }
          value={formatDate(
            item.purchase_date
          )}
          light={light}
        />

        <InfoItem
          label={
            isPT
              ? "Garantia"
              : "Warranty"
          }
          value={formatDate(
            item.warranty_end
          )}
          light={light}
        />
      </div>
    </div>
  </div>
);

const TicketRow = ({
  ticket,
  isPT,
  light,
  getStatus,
}: {
  ticket: SupportTicket;
  isPT: boolean;
  light: boolean;
  getStatus: (
    status: string
  ) => string;
}) => (
  <div
    className={`flex items-center gap-3 rounded-xl border ${
      light
        ? "border-slate-200 bg-slate-50"
        : "border-white/[0.04] bg-white/[0.015]"
    } p-3`}
  >
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
      <LifeBuoy size={18} />
    </div>

    <div className="min-w-0 flex-1">
      <p
        className={`truncate text-xs font-semibold ${
          light
            ? "text-slate-900"
            : "text-white"
        }`}
      >
        {ticket.subject}
      </p>

      <p
        className={`mt-1 text-[9px] ${
          light
            ? "text-slate-400"
            : "text-white/30"
        }`}
      >
        #{ticket.id}
      </p>
    </div>

    <div className="text-right">
      <span className="inline-flex rounded-full bg-blue-500/10 px-2 py-1 text-[9px] font-medium text-blue-500">
        {getStatus(
          ticket.status
        )}
      </span>

      <p
        className={`mt-2 text-[9px] ${
          light
            ? "text-slate-400"
            : "text-white/25"
        }`}
      >
        {new Date(
          ticket.created_at
        ).toLocaleDateString(
          isPT
            ? "pt-PT"
            : "en-GB"
        )}
      </p>
    </div>
  </div>
);

const ReservationMini = ({
  reservation,
  isPT,
  light,
  getStatus,
}: {
  reservation: Reservation;
  isPT: boolean;
  light: boolean;
  getStatus: (
    status: string
  ) => {
    label: string;
    className: string;
  };
}) => {
  const status = getStatus(
    reservation.status
  );

  return (
    <div
      className={`rounded-xl border ${
        light
          ? "border-slate-200 bg-slate-50"
          : "border-white/[0.06] bg-[#0B162A]"
      } p-4`}
    >
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
          <Car size={19} />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`truncate text-xs font-semibold ${
              light
                ? "text-slate-900"
                : "text-white"
            }`}
          >
            {reservation.title}
          </p>

          <p
            className={`mt-1 text-[10px] ${
              light
                ? "text-slate-500"
                : "text-white/35"
            }`}
          >
            {new Date(
              reservation.reservation_date
            ).toLocaleDateString(
              isPT
                ? "pt-PT"
                : "en-GB"
            )}
          </p>

          <p
            className={`mt-0.5 text-[10px] ${
              light
                ? "text-slate-500"
                : "text-white/35"
            }`}
          >
            {reservation.start_time.slice(
              0,
              5
            )}{" "}
            -{" "}
            {reservation.end_time.slice(
              0,
              5
            )}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-1 text-[9px] font-medium ${status.className}`}
        >
          {status.label}
        </span>
      </div>
    </div>
  );
};

const PortalSectionHeader = ({
  title,
  description,
  actionLabel,
  onAction,
  children,
  light,
}: {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  children: React.ReactNode;
  light: boolean;
}) => (
  <div>
    <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-500">
          NexHop Employee
        </p>

        <h1
          className={`mt-2 text-2xl font-bold tracking-tight ${
            light
              ? "text-slate-900"
              : "text-white"
          }`}
        >
          {title}
        </h1>

        <p
          className={`mt-1.5 max-w-2xl text-sm ${
            light
              ? "text-slate-500"
              : "text-white/35"
          }`}
        >
          {description}
        </p>
      </div>

      {actionLabel &&
        onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-lg bg-blue-600 px-4 text-xs font-semibold text-white hover:bg-blue-500"
          >
            {actionLabel}
          </button>
        )}
    </div>

    {children}
  </div>
);

const ReadOnlyField = ({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light: boolean;
}) => (
  <div>
    <label
      className={`mb-2 block text-[10px] font-semibold uppercase tracking-wider ${
        light
          ? "text-slate-400"
          : "text-white/30"
      }`}
    >
      {label}
    </label>

    <div
      className={`flex min-h-11 items-center rounded-xl border ${
        light
          ? "border-slate-200 bg-[#EEF1F4] text-slate-700"
          : "border-white/[0.06] bg-[#0A1328] text-white/70"
      } px-3 text-xs`}
    >
      {value}
    </div>
  </div>
);

const InfoItem = ({
  label,
  value,
  light,
}: {
  label: string;
  value: string;
  light: boolean;
}) => (
  <div>
    <p
      className={`text-[9px] uppercase tracking-wider ${
        light
          ? "text-slate-400"
          : "text-white/25"
      }`}
    >
      {label}
    </p>

    <p
      className={`mt-1 truncate text-[10px] font-medium ${
        light
          ? "text-slate-600"
          : "text-white/60"
      }`}
    >
      {value}
    </p>
  </div>
);

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  light,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  type?: string;
  light: boolean;
}) => (
  <div>
    <label
      className={`mb-2 block text-[11px] font-semibold ${
        light
          ? "text-slate-700"
          : "text-white/75"
      }`}
    >
      {label}
    </label>

    <input
      type={type}
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      required={
        label !== "Local" &&
        label !== "Location"
      }
      className={`h-11 w-full rounded-xl border ${
        light
          ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          : "border-white/[0.08] bg-[#0A1328] text-white placeholder:text-white/25"
      } px-3 text-xs outline-none focus:border-blue-500/50`}
    />
  </div>
);

const TextAreaField = ({
  label,
  value,
  onChange,
  placeholder,
  light,
}: {
  label: string;
  value: string;
  onChange: (
    value: string
  ) => void;
  placeholder?: string;
  light: boolean;
}) => (
  <div>
    <label
      className={`mb-2 block text-[11px] font-semibold ${
        light
          ? "text-slate-700"
          : "text-white/75"
      }`}
    >
      {label}
    </label>

    <textarea
      value={value}
      onChange={(event) =>
        onChange(
          event.target.value
        )
      }
      placeholder={placeholder}
      rows={4}
      required
      className={`w-full resize-none rounded-xl border ${
        light
          ? "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
          : "border-white/[0.08] bg-[#0A1328] text-white placeholder:text-white/25"
      } px-3 py-3 text-xs outline-none focus:border-blue-500/50`}
    />
  </div>
);

const ModalOverlay = ({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div
    className="fixed inset-0 z-[100] flex items-stretch justify-end bg-black/65 backdrop-blur-sm sm:p-4"
    onMouseDown={(event) => {
      if (
        event.target ===
        event.currentTarget
      ) {
        onClose();
      }
    }}
  >
    {children}
  </div>
);

export default MyPortal;