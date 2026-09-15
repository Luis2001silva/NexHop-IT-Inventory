import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleUserRound,
  Eye,
  FileText,
  Filter,
  Info,
  Search,
  ShieldCheck,
  Trash2,
  UserPlus,
  Wrench,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type LogAction =
  | "Criado"
  | "Alterado"
  | "Eliminado"
  | "Atribuído"
  | "Login"
  | "Logout"
  | "Concluído";

type LogLevel = "info" | "success" | "warning" | "critical";

type Log = {
  id: number;
  date: string;
  time: string;
  user: string;
  action: LogAction;
  module: string;
  description: string;
  level: LogLevel;
  details: string;
};

const initialLogs: Log[] = [
  {
    id: 1,
    date: "14/09/2026",
    time: "14:32",
    user: "Administrador",
    action: "Criado",
    module: "Equipamento",
    description: "Novo equipamento Dell Latitude 5450 criado",
    level: "success",
    details:
      "Foi criado o equipamento com o número de inventário INV-024.",
  },
  {
    id: 2,
    date: "14/09/2026",
    time: "13:18",
    user: "João Silva",
    action: "Alterado",
    module: "Utilizador",
    description: "Dados do utilizador atualizados",
    level: "info",
    details:
      "Foi atualizado o departamento e a função do utilizador.",
  },
  {
    id: 3,
    date: "14/09/2026",
    time: "11:05",
    user: "Administrador",
    action: "Eliminado",
    module: "Equipamento",
    description: "Equipamento INV-023 removido",
    level: "critical",
    details:
      "O equipamento foi removido do inventário.",
  },
  {
    id: 4,
    date: "14/09/2026",
    time: "10:42",
    user: "Maria Costa",
    action: "Atribuído",
    module: "Equipamento",
    description: "Monitor atribuído ao utilizador",
    level: "info",
    details:
      "Monitor Dell P2422H atribuído ao utilizador Maria Costa.",
  },
  {
    id: 5,
    date: "14/09/2026",
    time: "09:16",
    user: "Administrador",
    action: "Login",
    module: "Autenticação",
    description: "Login efetuado com sucesso",
    level: "success",
    details:
      "Sessão iniciada através da autenticação do sistema.",
  },
  {
    id: 6,
    date: "13/09/2026",
    time: "17:42",
    user: "Pedro Martins",
    action: "Concluído",
    module: "Reserva",
    description: "Manutenção de equipamento concluída",
    level: "success",
    details:
      "A intervenção de manutenção foi marcada como concluída.",
  },
  {
    id: 7,
    date: "13/09/2026",
    time: "16:28",
    user: "Administrador",
    action: "Alterado",
    module: "Definições",
    description: "Definição do sistema alterada",
    level: "warning",
    details:
      "Foi alterada uma definição geral do sistema.",
  },
  {
    id: 8,
    date: "13/09/2026",
    time: "15:03",
    user: "Ana Rodrigues",
    action: "Logout",
    module: "Autenticação",
    description: "Sessão terminada",
    level: "info",
    details:
      "O utilizador terminou a sessão.",
  },
];

const actionIcons: Record<LogAction, typeof Activity> = {
  Criado: FileText,
  Alterado: Wrench,
  Eliminado: Trash2,
  Atribuído: UserPlus,
  Login: ShieldCheck,
  Logout: CircleUserRound,
  Concluído: CheckCircle2,
};

const levelStyles: Record<
  LogLevel,
  {
    icon: typeof Info;
    className: string;
  }
> = {
  info: {
    icon: Info,
    className:
      "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  success: {
    icon: CheckCircle2,
    className:
      "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  warning: {
    icon: AlertTriangle,
    className:
      "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  critical: {
    icon: AlertTriangle,
    className:
      "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const translateAction = (
  action: LogAction,
  isPT: boolean
) => {
  if (isPT) return action;

  switch (action) {
    case "Criado":
      return "Created";
    case "Alterado":
      return "Updated";
    case "Eliminado":
      return "Deleted";
    case "Atribuído":
      return "Assigned";
    case "Login":
      return "Login";
    case "Logout":
      return "Logout";
    case "Concluído":
      return "Completed";
    default:
      return action;
  }
};

const translateModule = (
  module: string,
  isPT: boolean
) => {
  if (isPT) return module;

  switch (module) {
    case "Equipamento":
      return "Equipment";
    case "Utilizador":
      return "User";
    case "Autenticação":
      return "Authentication";
    case "Reserva":
      return "Reservation";
    case "Definições":
      return "Settings";
    default:
      return module;
  }
};

const translateLevel = (
  level: LogLevel,
  isPT: boolean
) => {
  if (isPT) {
    switch (level) {
      case "info":
        return "Informação";
      case "success":
        return "Sucesso";
      case "warning":
        return "Aviso";
      case "critical":
        return "Crítico";
    }
  }

  switch (level) {
    case "info":
      return "Information";
    case "success":
      return "Success";
    case "warning":
      return "Warning";
    case "critical":
      return "Critical";
  }
};

const translateLog = (
  log: Log,
  isPT: boolean
) => {
  if (isPT) return log;

  const translations: Record<
    number,
    {
      description: string;
      details: string;
    }
  > = {
    1: {
      description:
        "New Dell Latitude 5450 equipment created",
      details:
        "Equipment with inventory number INV-024 was created.",
    },
    2: {
      description:
        "User information updated",
      details:
        "The user's department and position were updated.",
    },
    3: {
      description:
        "Equipment INV-023 removed",
      details:
        "The equipment was removed from the inventory.",
    },
    4: {
      description:
        "Monitor assigned to user",
      details:
        "Dell P2422H monitor assigned to user Maria Costa.",
    },
    5: {
      description:
        "Login completed successfully",
      details:
        "Session started through system authentication.",
    },
    6: {
      description:
        "Equipment maintenance completed",
      details:
        "The maintenance intervention was marked as completed.",
    },
    7: {
      description:
        "System setting updated",
      details:
        "A general system setting was changed.",
    },
    8: {
      description:
        "Session ended",
      details:
        "The user ended the session.",
    },
  };

  return {
    ...log,
    description:
      translations[log.id]?.description ||
      log.description,
    details:
      translations[log.id]?.details ||
      log.details,
  };
};

export default function LogsPage() {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [logs, setLogs] =
    useState<Log[]>(initialLogs);

  const [search, setSearch] =
    useState("");

  const [actionFilter, setActionFilter] =
    useState("Todos");

  const [moduleFilter, setModuleFilter] =
    useState("Todos");

  const [levelFilter, setLevelFilter] =
    useState("Todos");

  const [selectedLog, setSelectedLog] =
    useState<Log | null>(null);

  const filteredLogs = useMemo(() => {
    const term = search.toLowerCase().trim();

    return logs.filter((log) => {
      const translated = translateLog(log, isPT);

      const matchesSearch =
        !term ||
        log.user.toLowerCase().includes(term) ||
        translateAction(
          log.action,
          isPT
        )
          .toLowerCase()
          .includes(term) ||
        translateModule(
          log.module,
          isPT
        )
          .toLowerCase()
          .includes(term) ||
        translated.description
          .toLowerCase()
          .includes(term);

      const matchesAction =
        actionFilter === "Todos" ||
        translateAction(
          log.action,
          isPT
        ) === actionFilter;

      const matchesModule =
        moduleFilter === "Todos" ||
        translateModule(
          log.module,
          isPT
        ) === moduleFilter;

      const matchesLevel =
        levelFilter === "Todos" ||
        translateLevel(
          log.level,
          isPT
        ) === levelFilter;

      return (
        matchesSearch &&
        matchesAction &&
        matchesModule &&
        matchesLevel
      );
    });
  }, [
    logs,
    search,
    actionFilter,
    moduleFilter,
    levelFilter,
    isPT,
  ]);

  const todayCount = logs.filter(
    (log) => log.date === "14/09/2026"
  ).length;

  const changesCount = logs.filter((log) =>
    [
      "Criado",
      "Alterado",
      "Eliminado",
      "Atribuído",
    ].includes(log.action)
  ).length;

  const criticalCount = logs.filter(
    (log) => log.level === "critical"
  ).length;

  const actionOptions = [
    "Todos",
    ...(isPT
      ? [
          "Criado",
          "Alterado",
          "Eliminado",
          "Atribuído",
          "Login",
          "Logout",
          "Concluído",
        ]
      : [
          "Created",
          "Updated",
          "Deleted",
          "Assigned",
          "Login",
          "Logout",
          "Completed",
        ]),
  ];

  const moduleOptions = [
    "Todos",
    ...(isPT
      ? [
          "Equipamento",
          "Utilizador",
          "Autenticação",
          "Reserva",
          "Definições",
        ]
      : [
          "Equipment",
          "User",
          "Authentication",
          "Reservation",
          "Settings",
        ]),
  ];

  const levelOptions = [
    "Todos",
    ...(isPT
      ? [
          "Informação",
          "Sucesso",
          "Aviso",
          "Crítico",
        ]
      : [
          "Information",
          "Success",
          "Warning",
          "Critical",
        ]),
  ];

  const selectedTranslatedLog = selectedLog
    ? translateLog(selectedLog, isPT)
    : null;

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 text-white lg:px-8">
      <div className="space-y-6">

        {/* HEADER */}
        <div>

          <h1 className="text-2xl font-bold tracking-tight text-white">
            Logs
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {isPT
              ? "Histórico de atividades e eventos registados no sistema."
              : "History of activities and events recorded in the system."}
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: isPT
                ? "Total de eventos"
                : "Total events",
              value: logs.length,
              icon: Activity,
            },
            {
              label: isPT
                ? "Eventos hoje"
                : "Events today",
              value: todayCount,
              icon: CalendarDays,
            },
            {
              label: isPT
                ? "Alterações"
                : "Changes",
              value: changesCount,
              icon: Wrench,
            },
            {
              label: isPT
                ? "Críticos"
                : "Critical",
              value: criticalCount,
              icon: AlertTriangle,
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <item.icon size={19} />
                </div>

                <span className="text-2xl font-semibold">
                  {item.value}
                </span>
              </div>

              <p className="mt-4 text-sm text-slate-400">
                {item.label}
              </p>
            </div>
          ))}
        </div>

        {/* FILTERS */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">

            {/* SEARCH */}
            <div className="relative flex-1">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder={
                  isPT
                    ? "Pesquisar logs..."
                    : "Search logs..."
                }
                className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              />
            </div>

            {/* ACTION */}
            <FilterSelect
              value={actionFilter}
              onChange={setActionFilter}
              options={actionOptions}
              label={
                isPT
                  ? "Todas as ações"
                  : "All actions"
              }
            />

            {/* MODULE */}
            <FilterSelect
              value={moduleFilter}
              onChange={setModuleFilter}
              options={moduleOptions}
              label={
                isPT
                  ? "Todos os módulos"
                  : "All modules"
              }
            />

            {/* LEVEL */}
            <FilterSelect
              value={levelFilter}
              onChange={setLevelFilter}
              options={levelOptions}
              label={
                isPT
                  ? "Todos os níveis"
                  : "All levels"
              }
            />
          </div>
        </div>

        {/* LOG TABLE */}
        <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">

          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="flex items-center justify-between">

              <div>
                <h2 className="text-sm font-semibold">
                  {isPT
                    ? "Registos"
                    : "Activity logs"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {filteredLogs.length}{" "}
                  {isPT
                    ? filteredLogs.length === 1
                      ? "registo"
                      : "registos"
                    : filteredLogs.length === 1
                    ? "record"
                    : "records"}
                </p>
              </div>

              <Activity
                size={18}
                className="text-slate-600"
              />
            </div>
          </div>

          {filteredLogs.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                <Search size={21} />
              </div>

              <p className="text-sm font-medium text-slate-300">
                {isPT
                  ? "Nenhum registo encontrado"
                  : "No records found"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {isPT
                  ? "Experimenta alterar os filtros ou a pesquisa."
                  : "Try changing the filters or search term."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">

              {filteredLogs.map((log) => {
                const Icon =
                  actionIcons[log.action];

                const LevelIcon =
                  levelStyles[log.level].icon;

                const translated =
                  translateLog(log, isPT);

                return (
                  <div
                    key={log.id}
                    className="flex flex-col gap-4 px-5 py-5 transition hover:bg-[#101B36]/50 lg:flex-row lg:items-center"
                  >

                    {/* ICON */}
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon
                        size={19}
                        strokeWidth={1.8}
                      />
                    </div>

                    {/* CONTENT */}
                    <div className="min-w-0 flex-1">

                      <div className="flex flex-wrap items-center gap-2">

                        <h3 className="text-sm font-semibold text-white">
                          {translated.description}
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium ${
                            levelStyles[
                              log.level
                            ].className
                          }`}
                        >
                          <LevelIcon size={10} />
                          {translateLevel(
                            log.level,
                            isPT
                          )}
                        </span>

                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500">

                        <span>
                          {log.user}
                        </span>

                        <span className="text-slate-700">
                          •
                        </span>

                        <span>
                          {translateAction(
                            log.action,
                            isPT
                          )}
                        </span>

                        <span className="text-slate-700">
                          •
                        </span>

                        <span>
                          {translateModule(
                            log.module,
                            isPT
                          )}
                        </span>

                        <span className="text-slate-700">
                          •
                        </span>

                        <span>
                          {log.date} {log.time}
                        </span>
                      </div>

                    </div>

                    {/* VIEW */}
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedLog(log)
                      }
                      className="flex shrink-0 items-center gap-2 rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 py-2 text-xs text-slate-400 transition hover:bg-[#101B36] hover:text-white"
                    >
                      <Eye size={15} />

                      {isPT
                        ? "Ver detalhes"
                        : "View details"}
                    </button>

                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* DETAIL MODAL */}
        {selectedTranslatedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">

            <div className="w-full max-w-xl rounded-2xl border border-white/[0.08] bg-[#0D1730] shadow-2xl">

              <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">

                <div>
                  <p className="text-xs font-medium text-blue-400">
                    {isPT
                      ? "Detalhes do log"
                      : "Log details"}
                  </p>

                  <h2 className="mt-1 text-lg font-semibold">
                    {selectedTranslatedLog.description}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                  className="rounded-lg p-2 text-slate-500 transition hover:bg-[#101B36] hover:text-white"
                >
                  <X size={18} />
                </button>

              </div>

              <div className="space-y-5 p-6">

                <div className="grid grid-cols-2 gap-4">

                  <Detail
                    label={
                      isPT
                        ? "Utilizador"
                        : "User"
                    }
                    value={
                      selectedTranslatedLog.user
                    }
                  />

                  <Detail
                    label={
                      isPT
                        ? "Ação"
                        : "Action"
                    }
                    value={translateAction(
                      selectedTranslatedLog.action,
                      isPT
                    )}
                  />

                  <Detail
                    label={
                      isPT
                        ? "Módulo"
                        : "Module"
                    }
                    value={translateModule(
                      selectedTranslatedLog.module,
                      isPT
                    )}
                  />

                  <Detail
                    label={
                      isPT
                        ? "Data e hora"
                        : "Date and time"
                    }
                    value={`${selectedTranslatedLog.date} ${selectedTranslatedLog.time}`}
                  />

                </div>

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
                    {isPT
                      ? "Detalhes"
                      : "Details"}
                  </p>

                  <div className="mt-2 rounded-lg border border-white/[0.06] bg-[#0A1328] p-4 text-sm leading-6 text-slate-400">
                    {selectedTranslatedLog.details}
                  </div>
                </div>

                <div className="flex justify-end border-t border-white/[0.06] pt-4">

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedLog(null)
                    }
                    className="h-10 rounded-lg border border-white/[0.07] px-4 text-sm text-slate-400 transition hover:bg-[#101B36] hover:text-white"
                  >
                    {isPT
                      ? "Fechar"
                      : "Close"}
                  </button>

                </div>

              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  label: string;
}) {
  return (
    <div className="relative">
      <Filter
        size={14}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
      />

      <select
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        className="h-10 min-w-[155px] appearance-none rounded-lg border border-white/[0.06] bg-[#0A1328] pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-blue-500/40"
      >
        <option value="Todos">
          {label}
        </option>

        {options
          .filter((option) => option !== "Todos")
          .map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
      </select>

      <ChevronDown
        size={14}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600"
      />
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-[#0A1328] p-4">
      <p className="text-xs text-slate-600">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-slate-200">
        {value}
      </p>
    </div>
  );
}