import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

import { toast } from "sonner";

import {
  Search,
  RefreshCw,
  Check,
  X,
  Eye,
  Clock3,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KeyRound,
  UserRound,
  CalendarDays,
  ShieldCheck,
  Copy,
  Timer,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type RequestStatus =
  | "pending"
  | "approved"
  | "used"
  | "expired"
  | "rejected";

type ResetRequest = {
  id: string;
  user_id: string | null;
  email: string;
  status: RequestStatus;
  code_hash: string | null;
  code_plaintext: string | null;
  requested_at: string;
  approved_at: string | null;
  approved_by: string | null;
  expires_at: string | null;
  used_at: string | null;
  rejected_at: string | null;
  rejected_by: string | null;
  created_at: string;
  code_view_count: number;
};

type ProfileInfo = {
  id: string;
  full_name: string | null;
  email: string | null;
  sap_number: string | null;
};

/* =========================================================
   PAGE
========================================================= */

const PasswordResetRequestsPage = () => {
  const { language } = useLanguage();

  const isPT = language === "pt";

  /* =======================================================
     THEME
  ======================================================= */

  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const checkTheme = () => {
      setIsLight(
        document.documentElement.classList.contains("light")
      );
    };

    checkTheme();

    const observer = new MutationObserver(checkTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* =======================================================
     DATA
  ======================================================= */

  const [requests, setRequests] = useState<ResetRequest[]>([]);
  const [profiles, setProfiles] = useState<
    Record<string, ProfileInfo>
  >({});

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* =======================================================
     FILTERS
  ======================================================= */

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | RequestStatus>("all");

  /* =======================================================
     DIALOGS
  ======================================================= */

  const [selectedRequest, setSelectedRequest] =
    useState<ResetRequest | null>(null);

  const [showApproveDialog, setShowApproveDialog] =
    useState(false);

  const [showRejectDialog, setShowRejectDialog] =
    useState(false);

  const [showCodeDialog, setShowCodeDialog] =
    useState(false);

  /* =======================================================
     CODE
  ======================================================= */

  const [visibleCode, setVisibleCode] =
    useState<string | null>(null);

  const [codeViewCount, setCodeViewCount] =
    useState(0);

  const [codeExpiresAt, setCodeExpiresAt] =
    useState<string | null>(null);

  const [codeStatus, setCodeStatus] =
    useState<RequestStatus | null>(null);

  /* =======================================================
     ACTION LOADING
  ======================================================= */

  const [actionLoading, setActionLoading] =
    useState(false);

  /* =======================================================
     LOAD REQUESTS
  ======================================================= */

  const loadRequests = useCallback(
    async (showRefresh = false) => {
      try {
        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const { data, error } = await (supabase as any)
          .from("password_reset_requests")
          .select("*")
          .order("requested_at", {
            ascending: false,
          });

        if (error) {
          console.error(
            "Erro ao carregar pedidos:",
            error
          );

          toast.error(
            isPT
              ? "Não foi possível carregar os pedidos."
              : "Unable to load recovery requests."
          );

          return;
        }

        const rows = (data ?? []) as ResetRequest[];

        setRequests(rows);

        /* -----------------------------------------------
           LOAD PROFILES
        ----------------------------------------------- */

        const userIds = Array.from(
          new Set(
            rows
              .map((item) => item.user_id)
              .filter(
                (id): id is string =>
                  Boolean(id)
              )
          )
        );

        if (userIds.length > 0) {
          const { data: profileData, error: profileError } =
            await (supabase as any)
              .from("profiles")
              .select(
                "id, full_name, email, sap_number"
              )
              .in("id", userIds);

          if (!profileError && profileData) {
            const profileMap: Record<
              string,
              ProfileInfo
            > = {};

            profileData.forEach(
              (profile: ProfileInfo) => {
                profileMap[profile.id] = profile;
              }
            );

            setProfiles(profileMap);
          }
        }
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isPT]
  );

  /* =======================================================
     INITIAL LOAD
  ======================================================= */

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  /* =======================================================
     REALTIME
  ======================================================= */

  useEffect(() => {
    const channel = supabase
      .channel(
        "password-reset-requests-page"
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "password_reset_requests",
        },
        () => {
          loadRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadRequests]);

  /* =======================================================
     AUTO EXPIRE DISPLAY
  ======================================================= */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRequests((current) =>
        current.map((request) => {
          if (
            request.status === "approved" &&
            request.expires_at &&
            new Date(request.expires_at).getTime() <=
              Date.now()
          ) {
            return {
              ...request,
              status: "expired",
            };
          }

          return request;
        })
      );
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  /* =======================================================
     HELPERS
  ======================================================= */

  const getProfile = (
    request: ResetRequest
  ) => {
    if (!request.user_id) return null;

    return profiles[request.user_id] ?? null;
  };

  const getUserName = (
    request: ResetRequest
  ) => {
    const profile = getProfile(request);

    return (
      profile?.full_name ||
      request.email ||
      (isPT
        ? "Utilizador desconhecido"
        : "Unknown user")
    );
  };

  const getEmployeeNumber = (
    request: ResetRequest
  ) => {
    const profile = getProfile(request);

    return (
      profile?.sap_number ||
      "—"
    );
  };

  /* =======================================================
     STATUS
  ======================================================= */

  const getStatusLabel = (
    status: RequestStatus
  ) => {
    switch (status) {
      case "pending":
        return isPT
          ? "Pendente"
          : "Pending";

      case "approved":
        return isPT
          ? "Aprovado"
          : "Approved";

      case "used":
        return isPT
          ? "Concluído"
          : "Completed";

      case "expired":
        return isPT
          ? "Expirado"
          : "Expired";

      case "rejected":
        return isPT
          ? "Recusado"
          : "Rejected";

      default:
        return status;
    }
  };

  const getStatusIcon = (
    status: RequestStatus
  ) => {
    switch (status) {
      case "pending":
        return (
          <Clock3 size={14} />
        );

      case "approved":
        return (
          <KeyRound size={14} />
        );

      case "used":
        return (
          <CheckCircle2 size={14} />
        );

      case "expired":
        return (
          <AlertTriangle size={14} />
        );

      case "rejected":
        return (
          <XCircle size={14} />
        );
    }
  };

  const getStatusClass = (
    status: RequestStatus
  ) => {
    switch (status) {
      case "pending":
        return isLight
          ? "bg-amber-50 text-amber-700 border-amber-200"
          : "bg-amber-500/10 text-amber-300 border-amber-500/20";

      case "approved":
        return isLight
          ? "bg-blue-50 text-blue-700 border-blue-200"
          : "bg-blue-500/10 text-blue-300 border-blue-500/20";

      case "used":
        return isLight
          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
          : "bg-emerald-500/10 text-emerald-300 border-emerald-500/20";

      case "expired":
        return isLight
          ? "bg-slate-100 text-slate-600 border-slate-200"
          : "bg-white/[0.04] text-white/50 border-white/[0.08]";

      case "rejected":
        return isLight
          ? "bg-red-50 text-red-700 border-red-200"
          : "bg-red-500/10 text-red-300 border-red-500/20";
    }
  };

  /* =======================================================
     FORMAT DATE
  ======================================================= */

  const formatDate = (
    value: string | null
  ) => {
    if (!value) return "—";

    return new Intl.DateTimeFormat(
      isPT ? "pt-PT" : "en-GB",
      {
        dateStyle: "short",
        timeStyle: "short",
      }
    ).format(new Date(value));
  };

  /* =======================================================
     REMAINING TIME
  ======================================================= */

  const getRemainingTime = (
    expiresAt: string | null
  ) => {
    if (!expiresAt) return null;

    const difference =
      new Date(expiresAt).getTime() -
      Date.now();

    if (difference <= 0) {
      return "00:00";
    }

    const totalSeconds = Math.floor(
      difference / 1000
    );

    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds =
      totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  };

  /* =======================================================
     FILTERED REQUESTS
  ======================================================= */

  const filteredRequests = useMemo(() => {
    const search = searchTerm
      .trim()
      .toLowerCase();

    return requests.filter(
      (request) => {
        const profile = getProfile(request);

        const matchesStatus =
          statusFilter === "all" ||
          request.status === statusFilter;

        if (!matchesStatus) {
          return false;
        }

        if (!search) {
          return true;
        }

        return (
          request.email
            .toLowerCase()
            .includes(search) ||
          (profile?.full_name ?? "")
            .toLowerCase()
            .includes(search) ||
          (profile?.sap_number ?? "")
            .toLowerCase()
            .includes(search)
        );
      }
    );
  }, [
    requests,
    searchTerm,
    statusFilter,
    profiles,
  ]);

  /* =======================================================
     COUNTS
  ======================================================= */

  const counts = useMemo(() => {
    return {
      all: requests.length,

      pending: requests.filter(
        (item) =>
          item.status === "pending"
      ).length,

      approved: requests.filter(
        (item) =>
          item.status === "approved"
      ).length,

      used: requests.filter(
        (item) =>
          item.status === "used"
      ).length,

      expired: requests.filter(
        (item) =>
          item.status === "expired"
      ).length,

      rejected: requests.filter(
        (item) =>
          item.status === "rejected"
      ).length,
    };
  }, [requests]);

  /* =======================================================
     APPROVE
  ======================================================= */

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);

      const { data, error } =
        await (supabase as any).rpc(
          "approve_password_reset_request",
          {
            p_request_id:
              selectedRequest.id,
          }
        );

      if (error) {
        console.error(
          "Erro ao aprovar pedido:",
          error
        );

        toast.error(
          error.message ||
            (isPT
              ? "Não foi possível aprovar o pedido."
              : "Unable to approve the request.")
        );

        return;
      }

      const result =
        Array.isArray(data)
          ? data[0]
          : data;

      if (!result?.code) {
        toast.error(
          isPT
            ? "O pedido foi aprovado, mas o código não foi devolvido."
            : "The request was approved, but no code was returned."
        );

        await loadRequests();
        return;
      }

      setVisibleCode(
        String(result.code)
      );

      setCodeViewCount(0);

      setCodeExpiresAt(
        result.expires_at
          ? String(result.expires_at)
          : null
      );

      setCodeStatus("approved");

      setShowApproveDialog(false);
      setShowCodeDialog(true);

      toast.success(
        isPT
          ? "Pedido aprovado."
          : "Request approved."
      );

      await loadRequests();
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Ocorreu um erro ao aprovar o pedido."
          : "An error occurred while approving the request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     REJECT
  ======================================================= */

  const handleReject = async () => {
    if (!selectedRequest) return;

    try {
      setActionLoading(true);

      const { error } =
        await (supabase as any).rpc(
          "reject_password_reset_request",
          {
            p_request_id:
              selectedRequest.id,
          }
        );

      if (error) {
        console.error(
          "Erro ao recusar pedido:",
          error
        );

        toast.error(
          error.message ||
            (isPT
              ? "Não foi possível recusar o pedido."
              : "Unable to reject the request.")
        );

        return;
      }

      toast.success(
        isPT
          ? "Pedido recusado."
          : "Request rejected."
      );

      setShowRejectDialog(false);
      setSelectedRequest(null);

      await loadRequests();
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Ocorreu um erro ao recusar o pedido."
          : "An error occurred while rejecting the request."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     VIEW CODE
  ======================================================= */

  const handleViewCode = async (
    request: ResetRequest
  ) => {
    try {
      setActionLoading(true);

      const { data, error } =
        await (supabase as any).rpc(
          "view_password_reset_code",
          {
            p_request_id:
              request.id,
          }
        );

      if (error) {
        console.error(
          "Erro ao visualizar código:",
          error
        );

        toast.error(
          error.message ||
            (isPT
              ? "Não foi possível visualizar o código."
              : "Unable to view the code.")
        );

        await loadRequests();

        return;
      }

      const result =
        Array.isArray(data)
          ? data[0]
          : data;

      if (!result?.code) {
        toast.error(
          isPT
            ? "O código já não está disponível."
            : "The code is no longer available."
        );

        await loadRequests();

        return;
      }

      setSelectedRequest(request);

      setVisibleCode(
        String(result.code)
      );

      setCodeViewCount(
        Number(
          result.view_count ?? 0
        )
      );

      setCodeExpiresAt(
        result.expires_at
          ? String(result.expires_at)
          : null
      );

      setCodeStatus(
        result.status as RequestStatus
      );

      setShowCodeDialog(true);

      await loadRequests();
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Ocorreu um erro ao visualizar o código."
          : "An error occurred while viewing the code."
      );
    } finally {
      setActionLoading(false);
    }
  };

  /* =======================================================
     COPY CODE
  ======================================================= */

  const handleCopyCode = async () => {
    if (!visibleCode) return;

    try {
      await navigator.clipboard.writeText(
        visibleCode
      );

      toast.success(
        isPT
          ? "Código copiado."
          : "Code copied."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        isPT
          ? "Não foi possível copiar o código."
          : "Unable to copy the code."
      );
    }
  };

  /* =======================================================
     OPEN APPROVE
  ======================================================= */

  const openApprove = (
    request: ResetRequest
  ) => {
    setSelectedRequest(request);
    setShowApproveDialog(true);
  };

  /* =======================================================
     OPEN REJECT
  ======================================================= */

  const openReject = (
    request: ResetRequest
  ) => {
    setSelectedRequest(request);
    setShowRejectDialog(true);
  };

  /* =======================================================
     COLORS
  ======================================================= */

  const pageBg = isLight
    ? "bg-[#F6F8FB]"
    : "bg-[#080D1F]";

  const cardBg = isLight
    ? "bg-white"
    : "bg-[#0D1528]";

  const border = isLight
    ? "border-slate-200"
    : "border-white/[0.07]";

  const mainText = isLight
    ? "text-slate-900"
    : "text-white";

  const mutedText = isLight
    ? "text-slate-500"
    : "text-white/45";

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <div
      className={`min-h-full ${pageBg} ${mainText}`}
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="mb-7">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <div
                className="
                  flex
                  h-9
                  w-9
                  items-center
                  justify-center
                  rounded-xl
                  bg-blue-500/10
                  text-blue-400
                "
              >
                <KeyRound size={18} />
              </div>

              <span
                className={`text-xs font-medium uppercase tracking-[0.12em] ${mutedText}`}
              >
                {isPT
                  ? "Segurança"
                  : "Security"}
              </span>
            </div>

            <h1
              className={`text-2xl font-semibold tracking-tight ${mainText}`}
            >
              {isPT
                ? "Pedidos de recuperação"
                : "Recovery requests"}
            </h1>

            <p
              className={`mt-1 text-sm ${mutedText}`}
            >
              {isPT
                ? "Gere os pedidos de recuperação de palavra-passe dos utilizadores."
                : "Manage user password recovery requests."}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadRequests(true)
            }
            disabled={refreshing}
            className={`
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              px-4
              text-xs
              font-medium
              transition
              disabled:cursor-not-allowed
              disabled:opacity-50
              ${
                isLight
                  ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  : "border-white/[0.08] bg-white/[0.03] text-white/70 hover:bg-white/[0.06] hover:text-white"
              }
            `}
          >
            <RefreshCw
              size={15}
              className={
                refreshing
                  ? "animate-spin"
                  : ""
              }
            />

            {isPT
              ? "Atualizar"
              : "Refresh"}
          </button>
        </div>
      </div>

      {/* ===================================================
          STATS
      =================================================== */}

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        {[
          {
            key: "pending",
            label: isPT
              ? "Pendentes"
              : "Pending",
            value: counts.pending,
            icon: Clock3,
            className:
              "text-amber-400 bg-amber-500/10",
          },
          {
            key: "approved",
            label: isPT
              ? "Aprovados"
              : "Approved",
            value: counts.approved,
            icon: KeyRound,
            className:
              "text-blue-400 bg-blue-500/10",
          },
          {
            key: "used",
            label: isPT
              ? "Concluídos"
              : "Completed",
            value: counts.used,
            icon: CheckCircle2,
            className:
              "text-emerald-400 bg-emerald-500/10",
          },
          {
            key: "expired",
            label: isPT
              ? "Expirados"
              : "Expired",
            value: counts.expired,
            icon: AlertTriangle,
            className:
              "text-slate-400 bg-white/[0.04]",
          },
          {
            key: "rejected",
            label: isPT
              ? "Recusados"
              : "Rejected",
            value: counts.rejected,
            icon: XCircle,
            className:
              "text-red-400 bg-red-500/10",
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <button
              key={stat.key}
              type="button"
              onClick={() =>
                setStatusFilter(
                  stat.key as RequestStatus
                )
              }
              className={`
                rounded-2xl
                border
                p-4
                text-left
                transition
                ${
                  isLight
                    ? "border-slate-200 bg-white hover:border-slate-300"
                    : "border-white/[0.07] bg-[#0D1528] hover:border-white/[0.12]"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.className}`}
                >
                  <Icon size={17} />
                </div>

                <span
                  className={`text-xl font-semibold ${mainText}`}
                >
                  {stat.value}
                </span>
              </div>

              <p
                className={`mt-3 text-xs ${mutedText}`}
              >
                {stat.label}
              </p>
            </button>
          );
        })}
      </div>

      {/* ===================================================
          FILTERS
      =================================================== */}

      <div
        className={`
          mb-5
          rounded-2xl
          border
          p-3
          ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-white/[0.07] bg-[#0D1528]"
          }
        `}
      >
        <div className="flex flex-col gap-3 lg:flex-row">
          {/* SEARCH */}

          <div className="relative flex-1">
            <Search
              size={16}
              className={`
                pointer-events-none
                absolute
                left-3
                top-1/2
                -translate-y-1/2
                ${mutedText}
              `}
            />

            <input
              type="text"
              value={searchTerm}
              onChange={(e) =>
                setSearchTerm(
                  e.target.value
                )
              }
              placeholder={
                isPT
                  ? "Pesquisar por nome, email ou n.º de colaborador..."
                  : "Search by name, email or employee number..."
              }
              className={`
                h-10
                w-full
                rounded-xl
                border
                pl-9
                pr-3
                text-sm
                outline-none
                transition
                ${
                  isLight
                    ? "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                    : "border-white/[0.07] bg-white/[0.025] text-white placeholder:text-white/25 focus:border-blue-500/50"
                }
              `}
            />
          </div>

          {/* STATUS FILTER */}

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as
                  | "all"
                  | RequestStatus
              )
            }
            className={`
              h-10
              rounded-xl
              border
              px-3
              text-sm
              outline-none
              ${
                isLight
                  ? "border-slate-200 bg-slate-50 text-slate-700"
                  : "border-white/[0.07] bg-white/[0.025] text-white/70"
              }
            `}
          >
            <option value="all">
              {isPT
                ? "Todos os estados"
                : "All statuses"}
            </option>

            <option value="pending">
              {isPT
                ? "Pendentes"
                : "Pending"}
            </option>

            <option value="approved">
              {isPT
                ? "Aprovados"
                : "Approved"}
            </option>

            <option value="used">
              {isPT
                ? "Concluídos"
                : "Completed"}
            </option>

            <option value="expired">
              {isPT
                ? "Expirados"
                : "Expired"}
            </option>

            <option value="rejected">
              {isPT
                ? "Recusados"
                : "Rejected"}
            </option>
          </select>
        </div>
      </div>

      {/* ===================================================
          TABLE
      =================================================== */}

      <div
        className={`
          overflow-hidden
          rounded-2xl
          border
          ${
            isLight
              ? "border-slate-200 bg-white"
              : "border-white/[0.07] bg-[#0D1528]"
          }
        `}
      >
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center">
            <RefreshCw
              size={22}
              className="animate-spin text-blue-400"
            />
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex min-h-[350px] flex-col items-center justify-center px-6 text-center">
            <div
              className={`
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                ${
                  isLight
                    ? "bg-slate-100 text-slate-400"
                    : "bg-white/[0.04] text-white/30"
                }
              `}
            >
              <KeyRound size={22} />
            </div>

            <p
              className={`mt-4 text-sm font-medium ${mainText}`}
            >
              {isPT
                ? "Nenhum pedido encontrado"
                : "No requests found"}
            </p>

            <p
              className={`mt-1 max-w-md text-xs ${mutedText}`}
            >
              {isPT
                ? "Não existem pedidos que correspondam aos filtros selecionados."
                : "There are no requests matching the selected filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px]">
              <thead>
                <tr
                  className={`border-b ${border}`}
                >
                  <th
                    className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "Utilizador"
                      : "User"}
                  </th>

                  <th
                    className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "N.º Colaborador"
                      : "Employee No."}
                  </th>

                  <th
                    className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "Pedido"
                      : "Requested"}
                  </th>

                  <th
                    className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "Estado"
                      : "Status"}
                  </th>

                  <th
                    className={`px-5 py-4 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "Código"
                      : "Code"}
                  </th>

                  <th
                    className={`px-5 py-4 text-right text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}
                  >
                    {isPT
                      ? "Ações"
                      : "Actions"}
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredRequests.map(
                  (request) => {
                    const profile =
                      getProfile(
                        request
                      );

                    const remaining =
                      request.status ===
                        "approved"
                        ? getRemainingTime(
                            request.expires_at
                          )
                        : null;

                    return (
                      <tr
                        key={request.id}
                        className={`border-b last:border-b-0 ${border} transition ${
                          isLight
                            ? "hover:bg-slate-50"
                            : "hover:bg-white/[0.02]"
                        }`}
                      >
                        {/* USER */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                ${
                                  isLight
                                    ? "bg-slate-100 text-slate-500"
                                    : "bg-white/[0.05] text-white/50"
                                }
                              `}
                            >
                              <UserRound
                                size={16}
                              />
                            </div>

                            <div className="min-w-0">
                              <p
                                className={`truncate text-sm font-medium ${mainText}`}
                              >
                                {getUserName(
                                  request
                                )}
                              </p>

                              <p
                                className={`truncate text-xs ${mutedText}`}
                              >
                                {profile?.email ||
                                  request.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* EMPLOYEE NUMBER */}

                        <td className="px-5 py-4">
                          <span
                            className={`text-sm ${mainText}`}
                          >
                            {getEmployeeNumber(
                              request
                            )}
                          </span>
                        </td>

                        {/* DATE */}

                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <CalendarDays
                              size={14}
                              className={mutedText}
                            />

                            <span
                              className={`text-xs ${mutedText}`}
                            >
                              {formatDate(
                                request.requested_at
                              )}
                            </span>
                          </div>
                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">
                          <span
                            className={`
                              inline-flex
                              items-center
                              gap-1.5
                              rounded-full
                              border
                              px-2.5
                              py-1
                              text-[10px]
                              font-medium
                              ${getStatusClass(
                                request.status
                              )}
                            `}
                          >
                            {getStatusIcon(
                              request.status
                            )}

                            {getStatusLabel(
                              request.status
                            )}
                          </span>
                        </td>

                        {/* CODE */}

                        <td className="px-5 py-4">
                          {request.status ===
                          "approved" ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleViewCode(
                                      request
                                    )
                                  }
                                  disabled={
                                    actionLoading
                                  }
                                  className="
                                    inline-flex
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-blue-500/20
                                    bg-blue-500/10
                                    px-2.5
                                    py-1.5
                                    text-[10px]
                                    font-medium
                                    text-blue-400
                                    transition
                                    hover:bg-blue-500/15
                                    disabled:opacity-50
                                  "
                                >
                                  <Eye
                                    size={13}
                                  />

                                  {isPT
                                    ? "Ver código"
                                    : "View code"}
                                </button>

                                <span
                                  className={`text-[10px] ${mutedText}`}
                                >
                                  {
                                    request.code_view_count
                                  }
                                  /3
                                </span>
                              </div>

                              {remaining && (
                                <div
                                  className={`flex items-center gap-1 text-[10px] ${
                                    remaining ===
                                    "00:00"
                                      ? "text-red-400"
                                      : "text-amber-400"
                                  }`}
                                >
                                  <Timer
                                    size={12}
                                  />

                                  {remaining}
                                </div>
                              )}
                            </div>
                          ) : request.status ===
                            "used" ? (
                            <span
                              className={`text-xs ${mutedText}`}
                            >
                              {isPT
                                ? "Utilizado"
                                : "Used"}
                            </span>
                          ) : request.status ===
                            "expired" ? (
                            <span
                              className={`text-xs ${mutedText}`}
                            >
                              {isPT
                                ? "Indisponível"
                                : "Unavailable"}
                            </span>
                          ) : (
                            <span
                              className={`text-xs ${mutedText}`}
                            >
                              —
                            </span>
                          )}
                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            {request.status ===
                              "pending" && (
                              <>
                                <button
                                  type="button"
                                  onClick={() =>
                                    openApprove(
                                      request
                                    )
                                  }
                                  className="
                                    inline-flex
                                    h-8
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    bg-blue-500
                                    px-3
                                    text-[10px]
                                    font-semibold
                                    text-white
                                    transition
                                    hover:bg-blue-400
                                  "
                                >
                                  <Check
                                    size={13}
                                  />

                                  {isPT
                                    ? "Aprovar"
                                    : "Approve"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    openReject(
                                      request
                                    )
                                  }
                                  className="
                                    inline-flex
                                    h-8
                                    items-center
                                    gap-1.5
                                    rounded-lg
                                    border
                                    border-red-500/20
                                    bg-red-500/10
                                    px-3
                                    text-[10px]
                                    font-semibold
                                    text-red-400
                                    transition
                                    hover:bg-red-500/15
                                  "
                                >
                                  <X
                                    size={13}
                                  />

                                  {isPT
                                    ? "Recusar"
                                    : "Reject"}
                                </button>
                              </>
                            )}

                            {request.status ===
                              "approved" && (
                              <button
                                type="button"
                                onClick={() =>
                                  handleViewCode(
                                    request
                                  )
                                }
                                className="
                                  inline-flex
                                  h-8
                                  items-center
                                  gap-1.5
                                  rounded-lg
                                  border
                                  border-blue-500/20
                                  bg-blue-500/10
                                  px-3
                                  text-[10px]
                                  font-semibold
                                  text-blue-400
                                  transition
                                  hover:bg-blue-500/15
                                "
                              >
                                <Eye
                                  size={13}
                                />

                                {isPT
                                  ? "Ver"
                                  : "View"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ===================================================
          APPROVE DIALOG
      =================================================== */}

      {showApproveDialog &&
        selectedRequest && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/60
              p-4
              backdrop-blur-sm
            "
          >
            <div
              className={`
                w-full
                max-w-md
                rounded-2xl
                border
                p-6
                shadow-2xl
                ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-white/[0.08] bg-[#0D1528]"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-blue-500/10
                    text-blue-400
                  "
                >
                  <ShieldCheck
                    size={19}
                  />
                </div>

                <div>
                  <h2
                    className={`text-base font-semibold ${mainText}`}
                  >
                    {isPT
                      ? "Aprovar pedido"
                      : "Approve request"}
                  </h2>

                  <p
                    className={`mt-1 text-xs leading-5 ${mutedText}`}
                  >
                    {isPT
                      ? "Será gerado um código de 6 dígitos válido durante 5 minutos."
                      : "A 6-digit code valid for 5 minutes will be generated."}
                  </p>
                </div>
              </div>

              <div
                className={`
                  mt-5
                  rounded-xl
                  border
                  p-4
                  ${
                    isLight
                      ? "border-slate-200 bg-slate-50"
                      : "border-white/[0.06] bg-white/[0.025]"
                  }
                `}
              >
                <p
                  className={`text-sm font-medium ${mainText}`}
                >
                  {getUserName(
                    selectedRequest
                  )}
                </p>

                <p
                  className={`mt-1 text-xs ${mutedText}`}
                >
                  {selectedRequest.email}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowApproveDialog(
                      false
                    )
                  }
                  disabled={actionLoading}
                  className={`
                    h-10
                    rounded-xl
                    border
                    px-4
                    text-xs
                    font-medium
                    ${
                      isLight
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "border-white/[0.08] text-white/60 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {isPT
                    ? "Cancelar"
                    : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleApprove
                  }
                  disabled={actionLoading}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    bg-blue-500
                    px-5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-blue-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {actionLoading && (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  <Check size={14} />

                  {isPT
                    ? "Aprovar pedido"
                    : "Approve request"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ===================================================
          REJECT DIALOG
      =================================================== */}

      {showRejectDialog &&
        selectedRequest && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/60
              p-4
              backdrop-blur-sm
            "
          >
            <div
              className={`
                w-full
                max-w-md
                rounded-2xl
                border
                p-6
                shadow-2xl
                ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-white/[0.08] bg-[#0D1528]"
                }
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className="
                    flex
                    h-10
                    w-10
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-500/10
                    text-red-400
                  "
                >
                  <XCircle
                    size={19}
                  />
                </div>

                <div>
                  <h2
                    className={`text-base font-semibold ${mainText}`}
                  >
                    {isPT
                      ? "Recusar pedido"
                      : "Reject request"}
                  </h2>

                  <p
                    className={`mt-1 text-xs leading-5 ${mutedText}`}
                  >
                    {isPT
                      ? "O pedido será marcado como recusado e ficará registado no histórico."
                      : "The request will be marked as rejected and kept in the history."}
                  </p>
                </div>
              </div>

              <div
                className={`
                  mt-5
                  rounded-xl
                  border
                  p-4
                  ${
                    isLight
                      ? "border-slate-200 bg-slate-50"
                      : "border-white/[0.06] bg-white/[0.025]"
                  }
                `}
              >
                <p
                  className={`text-sm font-medium ${mainText}`}
                >
                  {getUserName(
                    selectedRequest
                  )}
                </p>

                <p
                  className={`mt-1 text-xs ${mutedText}`}
                >
                  {selectedRequest.email}
                </p>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setShowRejectDialog(
                      false
                    )
                  }
                  disabled={actionLoading}
                  className={`
                    h-10
                    rounded-xl
                    border
                    px-4
                    text-xs
                    font-medium
                    ${
                      isLight
                        ? "border-slate-200 text-slate-600 hover:bg-slate-50"
                        : "border-white/[0.08] text-white/60 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {isPT
                    ? "Cancelar"
                    : "Cancel"}
                </button>

                <button
                  type="button"
                  onClick={
                    handleReject
                  }
                  disabled={actionLoading}
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2
                    rounded-xl
                    bg-red-500
                    px-5
                    text-xs
                    font-semibold
                    text-white
                    transition
                    hover:bg-red-400
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {actionLoading && (
                    <RefreshCw
                      size={14}
                      className="animate-spin"
                    />
                  )}

                  <X size={14} />

                  {isPT
                    ? "Recusar pedido"
                    : "Reject request"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* ===================================================
          CODE DIALOG
      =================================================== */}

      {showCodeDialog &&
        visibleCode && (
          <div
            className="
              fixed
              inset-0
              z-[100]
              flex
              items-center
              justify-center
              bg-black/70
              p-4
              backdrop-blur-md
            "
          >
            <div
              className={`
                w-full
                max-w-md
                rounded-2xl
                border
                p-6
                shadow-2xl
                ${
                  isLight
                    ? "border-slate-200 bg-white"
                    : "border-blue-500/20 bg-[#0B1325]"
                }
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      bg-blue-500/10
                      text-blue-400
                    "
                  >
                    <KeyRound
                      size={19}
                    />
                  </div>

                  <div>
                    <h2
                      className={`text-base font-semibold ${mainText}`}
                    >
                      {isPT
                        ? "Código de recuperação"
                        : "Recovery code"}
                    </h2>

                    <p
                      className={`mt-0.5 text-[11px] ${mutedText}`}
                    >
                      {isPT
                        ? "Visualização protegida"
                        : "Protected view"}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowCodeDialog(
                      false
                    )
                  }
                  className={`
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-lg
                    ${
                      isLight
                        ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                        : "text-white/40 hover:bg-white/[0.05] hover:text-white"
                    }
                  `}
                >
                  <X size={17} />
                </button>
              </div>

              <div
                className="
                  mt-6
                  rounded-2xl
                  border
                  border-blue-500/20
                  bg-blue-500/[0.04]
                  p-6
                  text-center
                "
              >
                <p
                  className={`text-[10px] font-medium uppercase tracking-[0.15em] ${mutedText}`}
                >
                  {isPT
                    ? "Código"
                    : "Code"}
                </p>

                <div className="mt-4 flex items-center justify-center gap-3">
                  {visibleCode
                    .split("")
                    .map(
                      (
                        digit,
                        index
                      ) => (
                        <div
                          key={`${digit}-${index}`}
                          className="
                            flex
                            h-14
                            w-11
                            items-center
                            justify-center
                            rounded-xl
                            border
                            border-blue-400/20
                            bg-[#07101F]
                            text-2xl
                            font-semibold
                            tracking-wider
                            text-white
                            shadow-[0_0_25px_rgba(37,99,235,0.08)]
                          "
                        >
                          {digit}
                        </div>
                      )
                    )}
                </div>

                <div className="mt-5 flex items-center justify-center gap-4">
                  <div
                    className={`flex items-center gap-1.5 text-xs ${
                      codeViewCount >= 3
                        ? "text-red-400"
                        : "text-blue-400"
                    }`}
                  >
                    <Eye size={14} />

                    {codeViewCount}/3
                  </div>

                  {codeExpiresAt && (
                    <div
                      className={`flex items-center gap-1.5 text-xs ${
                        getRemainingTime(
                          codeExpiresAt
                        ) === "00:00"
                          ? "text-red-400"
                          : "text-amber-400"
                      }`}
                    >
                      <Timer
                        size={14}
                      />

                      {getRemainingTime(
                        codeExpiresAt
                      )}
                    </div>
                  )}
                </div>
              </div>

              {codeStatus ===
                "expired" && (
                <div
                  className="
                    mt-4
                    rounded-xl
                    border
                    border-red-500/20
                    bg-red-500/[0.06]
                    p-3
                    text-center
                    text-xs
                    text-red-400
                  "
                >
                  {isPT
                    ? "Esta foi a última visualização. O código está agora expirado."
                    : "This was the final view. The code is now expired."}
                </div>
              )}

              <button
                type="button"
                onClick={
                  handleCopyCode
                }
                className="
                  mt-5
                  flex
                  h-11
                  w-full
                  items-center
                  justify-center
                  gap-2
                  rounded-xl
                  border
                  border-blue-500/20
                  bg-blue-500/10
                  text-xs
                  font-semibold
                  text-blue-400
                  transition
                  hover:bg-blue-500/15
                "
              >
                <Copy size={15} />

                {isPT
                  ? "Copiar código"
                  : "Copy code"}
              </button>

              <p
                className={`mt-4 text-center text-[10px] leading-5 ${mutedText}`}
              >
                {isPT
                  ? "O código é válido durante 5 minutos e pode ser visualizado no máximo 3 vezes."
                  : "The code is valid for 5 minutes and can be viewed a maximum of 3 times."}
              </p>
            </div>
          </div>
        )}
    </div>
  );
};

export default PasswordResetRequestsPage;