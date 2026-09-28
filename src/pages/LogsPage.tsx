import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Info,
  RefreshCw,
  Search,
  ShieldAlert,
  XCircle,
} from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useTheme } from "@/context/ThemeContext";

type LogLevel = "info" | "success" | "warning" | "critical";

interface LogRow {
  id: number;
  user_id: string | null;
  action: string;
  module: string;
  description: string;
  level: LogLevel;
  entity_type: string | null;
  entity_id: string | null;
  old_data: unknown;
  new_data: unknown;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string | null;
  email: string | null;
  sap_number: string | null;
}

type LevelFilter = "all" | LogLevel;

const PAGE_SIZE = 50;

const formatDate = (value: string, isPT: boolean) => {
  return new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", {
    dateStyle: "short",
    timeStyle: "medium",
  }).format(new Date(value));
};

const formatJson = (value: unknown) => {
  if (value === null || value === undefined) return "—";

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
};

const getLevelInfo = (level: LogLevel, isPT: boolean) => {
  switch (level) {
    case "success":
      return {
        label: isPT ? "Sucesso" : "Success",
        icon: CheckCircle2,
        className:
          "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
      };

    case "warning":
      return {
        label: isPT ? "Aviso" : "Warning",
        icon: AlertTriangle,
        className: "border-amber-500/20 bg-amber-500/10 text-amber-400",
      };

    case "critical":
      return {
        label: isPT ? "Crítico" : "Critical",
        icon: XCircle,
        className: "border-red-500/20 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: isPT ? "Informação" : "Info",
        icon: Info,
        className: "border-blue-500/20 bg-blue-500/10 text-blue-400",
      };
  }
};

const getActionLabel = (action: string, isPT: boolean) => {
  const normalized = action.toUpperCase();

  const labels: Record<string, [string, string]> = {
    CREATE: ["Criar", "Create"],
    UPDATE: ["Atualizar", "Update"],
    DELETE: ["Eliminar", "Delete"],
    LOGIN: ["Login", "Login"],
    LOGOUT: ["Logout", "Logout"],
    ASSIGN: ["Atribuir", "Assign"],
    UNASSIGN: ["Desatribuir", "Unassign"],
    APPROVE: ["Aprovar", "Approve"],
    REJECT: ["Recusar", "Reject"],
    RESET: ["Reposição", "Reset"],
  };

  return labels[normalized]?.[isPT ? 0 : 1] ?? action;
};

const getModuleLabel = (module: string, isPT: boolean) => {
  const normalized = module.toLowerCase();

  const labels: Record<string, [string, string]> = {
    equipment: ["Equipamentos", "Equipment"],
    users: ["Utilizadores", "Users"],
    invoices: ["Faturas", "Invoices"],
    reservations: ["Reservas", "Reservations"],
    documents: ["Documentos", "Documents"],
    warranties: ["Garantias", "Warranties"],
    hierarchy: ["Hierarquia", "Hierarchy"],
    auth: ["Autenticação", "Authentication"],
    settings: ["Definições", "Settings"],
    password_reset: ["Recuperação", "Password recovery"],
  };

  return labels[normalized]?.[isPT ? 0 : 1] ?? module;
};

export default function LogsPage() {
  const { language } = useLanguage();
  const { theme } = useTheme();

  const isPT = language === "pt";
  const isLight = theme === "light";

  const [logs, setLogs] = useState<LogRow[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileRow>>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<LogRow | null>(null);

  const loadLogs = async (showRefresh = false) => {
    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError(null);

    try {
      const { data, error: logsError } = await supabase
        .from("logs")
        .select(
          "id, user_id, action, module, description, level, entity_type, entity_id, old_data, new_data, created_at"
        )
        .order("created_at", { ascending: false })
        .limit(500);

      if (logsError) {
        throw logsError;
      }

      const rows = (data ?? []) as LogRow[];
      setLogs(rows);

      const userIds = [
        ...new Set(
          rows
            .map((row) => row.user_id)
            .filter((id): id is string => Boolean(id))
        ),
      ];

      if (userIds.length === 0) {
        setProfiles({});
        return;
      }

      const { data: profileData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name, email, sap_number")
        .in("id", userIds);

      if (profilesError) {
        console.warn("Não foi possível carregar os utilizadores dos logs.", profilesError);
      } else {
        const profileMap: Record<string, ProfileRow> = {};

        for (const profile of (profileData ?? []) as ProfileRow[]) {
          profileMap[profile.id] = profile;
        }

        setProfiles(profileMap);
      }
    } catch (err) {
      console.error("Erro ao carregar logs:", err);

      setError(
        isPT
          ? "Não foi possível carregar os logs."
          : "Unable to load logs."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("logs-page-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "logs",
        },
        () => {
          loadLogs(true);
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const modules = useMemo(() => {
    return [
      "all",
      ...Array.from(
        new Set(
          logs
            .map((log) => log.module)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        )
      ),
    ];
  }, [logs]);

  const filteredLogs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return logs.filter((log) => {
      if (levelFilter !== "all" && log.level !== levelFilter) {
        return false;
      }

      if (moduleFilter !== "all" && log.module !== moduleFilter) {
        return false;
      }

      if (!query) {
        return true;
      }

      const profile = log.user_id ? profiles[log.user_id] : undefined;

      const searchable = [
        log.action,
        log.module,
        log.description,
        log.entity_type ?? "",
        log.entity_id ?? "",
        profile?.full_name ?? "",
        profile?.email ?? "",
        profile?.sap_number ?? "",
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [logs, profiles, search, levelFilter, moduleFilter]);

  const stats = useMemo(() => {
    return {
      total: logs.length,
      success: logs.filter((log) => log.level === "success").length,
      warning: logs.filter((log) => log.level === "warning").length,
      critical: logs.filter((log) => log.level === "critical").length,
    };
  }, [logs]);

  const border = isLight ? "border-slate-200" : "border-white/[0.07]";
  const cardBg = isLight ? "bg-white" : "bg-[#0D1426]";
  const pageBg = isLight ? "bg-slate-50" : "bg-[#080D1F]";
  const mainText = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-white/45";
  const softText = isLight ? "text-slate-600" : "text-white/65";
  const inputBg = isLight ? "bg-white" : "bg-white/[0.025]";

  return (
    <div className={`min-h-full ${pageBg} ${mainText}`}>
      <div className="mx-auto w-full max-w-[1600px] px-5 py-6 sm:px-7 lg:px-8">
        {/* HEADER */}
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                  isLight
                    ? "bg-blue-50 text-blue-600"
                    : "bg-blue-500/10 text-blue-400"
                }`}
              >
                <Activity size={18} />
              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Logs
              </h1>
            </div>

            <p className={`mt-2 text-sm ${mutedText}`}>
              {isPT
                ? "Registo de atividade e alterações do sistema."
                : "System activity and change history."}
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadLogs(true)}
            disabled={refreshing}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl border px-4 text-xs font-semibold transition ${
              isLight
                ? "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                : "border-white/[0.08] bg-white/[0.025] text-white/75 hover:bg-white/[0.05]"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <RefreshCw
              size={14}
              className={refreshing ? "animate-spin" : ""}
            />
            {isPT ? "Atualizar" : "Refresh"}
          </button>
        </div>

        {/* STATS */}
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: isPT ? "Total de eventos" : "Total events",
              value: stats.total,
              icon: Activity,
              className: "text-blue-400 bg-blue-500/10",
            },
            {
              label: isPT ? "Sucessos" : "Successes",
              value: stats.success,
              icon: CheckCircle2,
              className: "text-emerald-400 bg-emerald-500/10",
            },
            {
              label: isPT ? "Avisos" : "Warnings",
              value: stats.warning,
              icon: AlertTriangle,
              className: "text-amber-400 bg-amber-500/10",
            },
            {
              label: isPT ? "Críticos" : "Critical",
              value: stats.critical,
              icon: ShieldAlert,
              className: "text-red-400 bg-red-500/10",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.label}
                className={`rounded-2xl border ${border} ${cardBg} p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-[11px] font-medium ${mutedText}`}>
                      {stat.label}
                    </p>
                    <p className="mt-1 text-2xl font-bold">{stat.value}</p>
                  </div>

                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.className}`}
                  >
                    <Icon size={18} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FILTERS */}
        <div className={`mb-4 rounded-2xl border ${border} ${cardBg} p-4`}>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search
                size={16}
                className={`absolute left-3 top-1/2 -translate-y-1/2 ${mutedText}`}
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={
                  isPT
                    ? "Pesquisar por utilizador, ação, módulo..."
                    : "Search by user, action, module..."
                }
                className={`h-10 w-full rounded-xl border ${border} ${inputBg} pl-9 pr-3 text-xs outline-none transition ${
                  isLight
                    ? "text-slate-900 placeholder:text-slate-400 focus:border-blue-400"
                    : "text-white placeholder:text-white/25 focus:border-blue-500/50"
                }`}
              />
            </div>

            <select
              value={levelFilter}
              onChange={(event) =>
                setLevelFilter(event.target.value as LevelFilter)
              }
              className={`h-10 rounded-xl border ${border} ${inputBg} px-3 text-xs outline-none ${
                isLight ? "text-slate-700" : "text-white/75"
              }`}
            >
              <option value="all">
                {isPT ? "Todos os níveis" : "All levels"}
              </option>
              <option value="info">
                {isPT ? "Informação" : "Info"}
              </option>
              <option value="success">
                {isPT ? "Sucesso" : "Success"}
              </option>
              <option value="warning">
                {isPT ? "Aviso" : "Warning"}
              </option>
              <option value="critical">
                {isPT ? "Crítico" : "Critical"}
              </option>
            </select>

            <select
              value={moduleFilter}
              onChange={(event) => setModuleFilter(event.target.value)}
              className={`h-10 rounded-xl border ${border} ${inputBg} px-3 text-xs outline-none ${
                isLight ? "text-slate-700" : "text-white/75"
              }`}
            >
              <option value="all">
                {isPT ? "Todos os módulos" : "All modules"}
              </option>

              {modules
                .filter((module) => module !== "all")
                .map((module) => (
                  <option key={module} value={module}>
                    {getModuleLabel(module, isPT)}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className={`overflow-hidden rounded-2xl border ${border} ${cardBg}`}>
          {loading ? (
            <div className="flex min-h-[420px] items-center justify-center">
              <div className="flex items-center gap-3">
                <RefreshCw
                  size={18}
                  className="animate-spin text-blue-400"
                />
                <span className={`text-sm ${mutedText}`}>
                  {isPT ? "A carregar logs..." : "Loading logs..."}
                </span>
              </div>
            </div>
          ) : error ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <XCircle className="text-red-400" size={28} />
              <p className="mt-3 text-sm font-semibold">
                {isPT ? "Erro ao carregar" : "Loading error"}
              </p>
              <p className={`mt-1 text-xs ${mutedText}`}>{error}</p>

              <button
                type="button"
                onClick={() => loadLogs()}
                className="mt-4 rounded-xl bg-blue-500 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-400"
              >
                {isPT ? "Tentar novamente" : "Try again"}
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <Clock3 className={mutedText} size={28} />
              <p className="mt-3 text-sm font-semibold">
                {isPT ? "Sem registos" : "No records"}
              </p>
              <p className={`mt-1 text-xs ${mutedText}`}>
                {search || levelFilter !== "all" || moduleFilter !== "all"
                  ? isPT
                    ? "Não existem logs com estes filtros."
                    : "No logs match these filters."
                  : isPT
                    ? "Ainda não existem atividades registadas."
                    : "There are no recorded activities yet."}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead>
                    <tr
                      className={`border-b ${border} ${
                        isLight ? "bg-slate-50" : "bg-white/[0.015]"
                      }`}
                    >
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Data" : "Date"}
                      </th>
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Utilizador" : "User"}
                      </th>
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Ação" : "Action"}
                      </th>
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Módulo" : "Module"}
                      </th>
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Descrição" : "Description"}
                      </th>
                      <th className={`px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Nível" : "Level"}
                      </th>
                      <th className={`px-5 py-3 text-right text-[10px] font-semibold uppercase tracking-wider ${mutedText}`}>
                        {isPT ? "Detalhes" : "Details"}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredLogs.slice(0, PAGE_SIZE).map((log) => {
                      const levelInfo = getLevelInfo(log.level, isPT);
                      const LevelIcon = levelInfo.icon;
                      const profile = log.user_id
                        ? profiles[log.user_id]
                        : undefined;

                      return (
                        <tr
                          key={log.id}
                          className={`border-b ${border} last:border-0 transition ${
                            isLight
                              ? "hover:bg-slate-50"
                              : "hover:bg-white/[0.02]"
                          }`}
                        >
                          <td className="whitespace-nowrap px-5 py-4">
                            <div className={`text-xs ${softText}`}>
                              {formatDate(log.created_at, isPT)}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <div className="max-w-[190px]">
                              <p className="truncate text-xs font-semibold">
                                {profile?.full_name ??
                                  profile?.email ??
                                  (isPT ? "Sistema" : "System")}
                              </p>

                              {profile?.sap_number && (
                                <p className={`mt-0.5 text-[10px] ${mutedText}`}>
                                  {profile.sap_number}
                                </p>
                              )}
                            </div>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-semibold ${levelInfo.className}`}
                            >
                              {getActionLabel(log.action, isPT)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-lg border px-2.5 py-1 text-[10px] font-medium ${
                                isLight
                                  ? "border-slate-200 bg-slate-50 text-slate-600"
                                  : "border-white/[0.07] bg-white/[0.025] text-white/55"
                              }`}
                            >
                              {getModuleLabel(log.module, isPT)}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <p
                              className={`max-w-[360px] truncate text-xs ${softText}`}
                              title={log.description}
                            >
                              {log.description}
                            </p>

                            {log.entity_type && (
                              <p className={`mt-1 text-[10px] ${mutedText}`}>
                                {log.entity_type}
                                {log.entity_id ? ` #${log.entity_id}` : ""}
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[10px] font-medium ${levelInfo.className}`}
                            >
                              <LevelIcon size={12} />
                              {levelInfo.label}
                            </span>
                          </td>

                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLog(log)}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition ${
                                isLight
                                  ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                                  : "text-white/35 hover:bg-white/[0.05] hover:text-white"
                              }`}
                              title={isPT ? "Ver detalhes" : "View details"}
                            >
                              <Eye size={15} />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredLogs.length > PAGE_SIZE && (
                <div className={`border-t ${border} px-5 py-3`}>
                  <p className={`text-[11px] ${mutedText}`}>
                    {isPT
                      ? `A mostrar ${PAGE_SIZE} de ${filteredLogs.length} resultados.`
                      : `Showing ${PAGE_SIZE} of ${filteredLogs.length} results.`}
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* DETAIL DIALOG */}
      {selectedLog && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedLog(null);
            }
          }}
        >
          <div
            className={`max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-2xl border ${border} ${
              isLight ? "bg-white" : "bg-[#0B1120]"
            } shadow-2xl`}
          >
            <div className={`flex items-center justify-between border-b ${border} px-5 py-4`}>
              <div>
                <h2 className="text-sm font-semibold">
                  {isPT ? "Detalhes do evento" : "Event details"}
                </h2>

                <p className={`mt-1 text-[10px] ${mutedText}`}>
                  #{selectedLog.id} ·{" "}
                  {formatDate(selectedLog.created_at, isPT)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className={`rounded-lg p-2 transition ${
                  isLight
                    ? "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                    : "text-white/40 hover:bg-white/[0.05] hover:text-white"
                }`}
              >
                <XCircle size={17} />
              </button>
            </div>

            <div className="max-h-[calc(90vh-80px)] overflow-y-auto p-5">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className={`rounded-xl border ${border} p-4`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                    {isPT ? "Ação" : "Action"}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {getActionLabel(selectedLog.action, isPT)}
                  </p>
                </div>

                <div className={`rounded-xl border ${border} p-4`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                    {isPT ? "Módulo" : "Module"}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {getModuleLabel(selectedLog.module, isPT)}
                  </p>
                </div>

                <div className={`rounded-xl border ${border} p-4`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                    {isPT ? "Utilizador" : "User"}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {selectedLog.user_id
                      ? profiles[selectedLog.user_id]?.full_name ??
                        profiles[selectedLog.user_id]?.email ??
                        selectedLog.user_id
                      : isPT
                        ? "Sistema"
                        : "System"}
                  </p>
                </div>

                <div className={`rounded-xl border ${border} p-4`}>
                  <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                    {isPT ? "Entidade" : "Entity"}
                  </p>
                  <p className="mt-1 text-sm font-semibold">
                    {selectedLog.entity_type ?? "—"}
                    {selectedLog.entity_id
                      ? ` #${selectedLog.entity_id}`
                      : ""}
                  </p>
                </div>
              </div>

              <div className={`mt-3 rounded-xl border ${border} p-4`}>
                <p className={`text-[10px] uppercase tracking-wider ${mutedText}`}>
                  {isPT ? "Descrição" : "Description"}
                </p>
                <p className={`mt-2 text-sm ${softText}`}>
                  {selectedLog.description}
                </p>
              </div>

              {(selectedLog.old_data !== null ||
                selectedLog.new_data !== null) && (
                <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                  <div className={`rounded-xl border ${border} p-4`}>
                    <p className={`mb-2 text-[10px] uppercase tracking-wider ${mutedText}`}>
                      {isPT ? "Dados anteriores" : "Previous data"}
                    </p>
                    <pre
                      className={`max-h-72 overflow-auto rounded-lg p-3 text-[10px] leading-5 ${
                        isLight
                          ? "bg-slate-50 text-slate-600"
                          : "bg-black/20 text-white/55"
                      }`}
                    >
                      {formatJson(selectedLog.old_data)}
                    </pre>
                  </div>

                  <div className={`rounded-xl border ${border} p-4`}>
                    <p className={`mb-2 text-[10px] uppercase tracking-wider ${mutedText}`}>
                      {isPT ? "Dados novos" : "New data"}
                    </p>
                    <pre
                      className={`max-h-72 overflow-auto rounded-lg p-3 text-[10px] leading-5 ${
                        isLight
                          ? "bg-slate-50 text-slate-600"
                          : "bg-black/20 text-white/55"
                      }`}
                    >
                      {formatJson(selectedLog.new_data)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
