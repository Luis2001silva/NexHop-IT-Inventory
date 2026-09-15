import { useMemo, useState } from "react";
import {
  Bell,
  ShieldAlert,
  Clock3,
  Wrench,
  CalendarDays,
  PackageX,
  Search,
  Check,
  CheckCheck,
  Filter,
  X,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type AlertType =
  | "Garantia"
  | "Equipamento"
  | "Manutenção"
  | "Reserva"
  | "Inventário";

type AlertLevel = "Crítico" | "Atenção" | "Informação";
type AlertStatus = "Pendente" | "Resolvido";

interface AlertItem {
  id: number;
  type: AlertType;
  level: AlertLevel;
  title: string;
  description: string;
  date: string;
  status: AlertStatus;
}

const initialAlerts: AlertItem[] = [
  {
    id: 1,
    type: "Garantia",
    level: "Atenção",
    title: "Garantia a terminar",
    description:
      "Existem equipamentos com garantia a terminar nos próximos 90 dias.",
    date: "Hoje",
    status: "Pendente",
  },
  {
    id: 2,
    type: "Equipamento",
    level: "Crítico",
    title: "Equipamento sem localização",
    description:
      "Existem equipamentos sem localização atribuída no inventário.",
    date: "Hoje",
    status: "Pendente",
  },
  {
    id: 3,
    type: "Manutenção",
    level: "Atenção",
    title: "Manutenção pendente",
    description: "Existem equipamentos que precisam de manutenção.",
    date: "Ontem",
    status: "Pendente",
  },
  {
    id: 4,
    type: "Reserva",
    level: "Informação",
    title: "Reserva próxima",
    description: "Existe uma intervenção de TI agendada para os próximos dias.",
    date: "12 Set",
    status: "Pendente",
  },
];

const typeIcon = (type: AlertType) => {
  switch (type) {
    case "Garantia":
      return Clock3;
    case "Equipamento":
      return ShieldAlert;
    case "Manutenção":
      return Wrench;
    case "Reserva":
      return CalendarDays;
    case "Inventário":
      return PackageX;
    default:
      return Bell;
  }
};

const levelClass = (level: AlertLevel) => {
  switch (level) {
    case "Crítico":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    case "Atenção":
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
    default:
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
  }
};

const translateType = (type: AlertType, isPT: boolean) => {
  if (isPT) return type;

  const map: Record<AlertType, string> = {
    Garantia: "Warranty",
    Equipamento: "Equipment",
    Manutenção: "Maintenance",
    Reserva: "Reservation",
    Inventário: "Inventory",
  };

  return map[type];
};

const translateLevel = (level: AlertLevel, isPT: boolean) => {
  if (isPT) return level;

  const map: Record<AlertLevel, string> = {
    Crítico: "Critical",
    Atenção: "Attention",
    Informação: "Information",
  };

  return map[level];
};

const translateStatus = (status: AlertStatus, isPT: boolean) => {
  if (isPT) return status;

  return status === "Pendente" ? "Pending" : "Resolved";
};

const translateAlert = (alert: AlertItem, isPT: boolean) => {
  if (isPT) return alert;

  const translations: Record<
    number,
    { title: string; description: string; date: string }
  > = {
    1: {
      title: "Warranty expiring",
      description:
        "Some equipment has warranties expiring within the next 90 days.",
      date: "Today",
    },
    2: {
      title: "Equipment without location",
      description: "Some equipment has no location assigned in the inventory.",
      date: "Today",
    },
    3: {
      title: "Maintenance pending",
      description: "Some equipment requires maintenance.",
      date: "Yesterday",
    },
    4: {
      title: "Upcoming reservation",
      description: "There is an IT intervention scheduled for the coming days.",
      date: "12 Sep",
    },
  };

  return {
    ...alert,
    ...translations[alert.id],
  };
};

const AlertsPage = () => {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [alerts, setAlerts] = useState<AlertItem[]>(initialAlerts);

  const [search, setSearch] = useState("");

  const [level, setLevel] = useState<"Todos" | AlertLevel>("Todos");

  const [status, setStatus] = useState<"Todos" | AlertStatus>("Todos");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return alerts.filter((alert) => {
      const translated = translateAlert(alert, isPT);

      const matchesSearch =
        !term ||
        [
          translated.title,
          translated.description,
          translateType(alert.type, isPT),
          translateLevel(alert.level, isPT),
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);

      const matchesLevel = level === "Todos" || alert.level === level;

      const matchesStatus = status === "Todos" || alert.status === status;

      return matchesSearch && matchesLevel && matchesStatus;
    });
  }, [alerts, search, level, status, isPT]);

  const resolveAlert = (id: number) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, status: "Resolvido" } : alert,
      ),
    );
  };

  const reopenAlert = (id: number) => {
    setAlerts((current) =>
      current.map((alert) =>
        alert.id === id ? { ...alert, status: "Pendente" } : alert,
      ),
    );
  };

  const resolveAll = () => {
    setAlerts((current) =>
      current.map((alert) => ({
        ...alert,
        status: "Resolvido",
      })),
    );
  };

  const pending = alerts.filter((alert) => alert.status === "Pendente").length;

  const critical = alerts.filter(
    (alert) => alert.level === "Crítico" && alert.status === "Pendente",
  ).length;

  const attention = alerts.filter(
    (alert) => alert.level === "Atenção" && alert.status === "Pendente",
  ).length;

  const resolved = alerts.filter(
    (alert) => alert.status === "Resolvido",
  ).length;

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 text-white lg:px-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isPT ? "Alertas" : "Alerts"}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {isPT
                ? "Avisos e situações que precisam da atenção da equipa de TI."
                : "Warnings and situations that require the IT team's attention."}
            </p>
          </div>

          <button
            type="button"
            onClick={resolveAll}
            disabled={pending === 0}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-[#0D1730] px-4 text-sm font-medium text-slate-300 transition hover:bg-[#101B36] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCheck size={17} />

            {isPT ? "Marcar todos como resolvidos" : "Mark all as resolved"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat
            icon={Bell}
            label={isPT ? "Pendentes" : "Pending"}
            value={pending}
          />

          <Stat
            icon={ShieldAlert}
            label={isPT ? "Críticos" : "Critical"}
            value={critical}
            valueClass="text-red-400"
          />

          <Stat
            icon={Clock3}
            label={isPT ? "Atenção" : "Attention"}
            value={attention}
            valueClass="text-amber-400"
          />

          <Stat
            icon={CheckCheck}
            label={isPT ? "Resolvidos" : "Resolved"}
            value={resolved}
            valueClass="text-emerald-400"
          />
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="flex flex-col gap-3 xl:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
              />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={isPT ? "Pesquisar alertas..." : "Search alerts..."}
                className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
              />
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <Filter
                  size={14}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <select
                  value={level}
                  onChange={(e) =>
                    setLevel(e.target.value as "Todos" | AlertLevel)
                  }
                  className="h-10 min-w-[160px] appearance-none rounded-lg border border-white/[0.06] bg-[#0A1328] pl-9 pr-8 text-sm text-slate-300 outline-none focus:border-blue-500/40"
                >
                  <option value="Todos">
                    {isPT ? "Todos os níveis" : "All levels"}
                  </option>

                  <option value="Crítico">
                    {isPT ? "Crítico" : "Critical"}
                  </option>

                  <option value="Atenção">
                    {isPT ? "Atenção" : "Attention"}
                  </option>

                  <option value="Informação">
                    {isPT ? "Informação" : "Information"}
                  </option>
                </select>
              </div>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as "Todos" | AlertStatus)
                }
                className="h-10 min-w-[160px] rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-slate-300 outline-none focus:border-blue-500/40"
              >
                <option value="Todos">
                  {isPT ? "Todos os estados" : "All statuses"}
                </option>

                <option value="Pendente">
                  {isPT ? "Pendentes" : "Pending"}
                </option>

                <option value="Resolvido">
                  {isPT ? "Resolvidos" : "Resolved"}
                </option>
              </select>
            </div>
          </div>
        </div>

        <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold">
              {isPT ? "Alertas" : "Alerts"}
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              {filtered.length}{" "}
              {isPT
                ? filtered.length === 1
                  ? "alerta"
                  : "alertas"
                : filtered.length === 1
                  ? "alert"
                  : "alerts"}
            </p>
          </div>

          {filtered.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <Check size={22} />
              </div>

              <p className="text-sm font-medium text-slate-300">
                {isPT ? "Não existem alertas" : "No alerts"}
              </p>

              <p className="mt-1 text-xs text-slate-600">
                {isPT
                  ? "Está tudo tratado de momento."
                  : "Everything is handled for now."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {filtered.map((alert) => {
                const Icon = typeIcon(alert.type);
                const resolved = alert.status === "Resolvido";

                const translated = translateAlert(alert, isPT);

                return (
                  <div
                    key={alert.id}
                    className={`flex flex-col gap-4 px-5 py-5 transition hover:bg-[#101B36]/50 lg:flex-row lg:items-center ${
                      resolved ? "opacity-55" : ""
                    }`}
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          resolved
                            ? "bg-[#0A1328] text-slate-600"
                            : "bg-blue-500/10 text-blue-400"
                        }`}
                      >
                        <Icon size={20} strokeWidth={1.8} />
                      </div>

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-semibold text-white">
                            {translated.title}
                          </h3>

                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${levelClass(
                              alert.level,
                            )}`}
                          >
                            {translateLevel(alert.level, isPT)}
                          </span>

                          <span className="rounded-full border border-white/[0.07] bg-[#0A1328] px-2 py-0.5 text-[10px] text-slate-500">
                            {translateType(alert.type, isPT)}
                          </span>
                        </div>

                        <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                          {translated.description}
                        </p>

                        <p className="mt-2 text-[11px] text-slate-600">
                          {translated.date}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2 lg:justify-end">
                      <span
                        className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
                          resolved
                            ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                            : "border-white/[0.07] bg-[#0A1328] text-slate-500"
                        }`}
                      >
                        {translateStatus(alert.status, isPT)}
                      </span>

                      {!resolved && (
                        <button
                          type="button"
                          onClick={() => resolveAlert(alert.id)}
                          title={
                            isPT ? "Marcar como resolvido" : "Mark as resolved"
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-emerald-500/10 hover:text-emerald-400"
                        >
                          <Check size={17} />
                        </button>
                      )}

                      {resolved && (
                        <button
                          type="button"
                          onClick={() => reopenAlert(alert.id)}
                          title={isPT ? "Reabrir alerta" : "Reopen alert"}
                          className="rounded-lg p-2 text-slate-600 transition hover:bg-[#101B36] hover:text-slate-300"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

function Stat({
  icon: Icon,
  label,
  value,
  valueClass = "text-white",
}: {
  icon: typeof Bell;
  label: string;
  value: number;
  valueClass?: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon size={18} />
        </div>

        <span className={`text-2xl font-semibold ${valueClass}`}>{value}</span>
      </div>

      <p className="mt-4 text-sm text-slate-400">{label}</p>
    </div>
  );
}

export default AlertsPage;
