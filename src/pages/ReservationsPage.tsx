import { useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import {
  Wrench,
  RefreshCw,
  Laptop,
  Package,
  Settings2,
  Plus,
  Search,
  CalendarDays,
  Clock3,
  UserRound,
  Building2,
  MapPin,
  X,
  Check,
  ChevronDown,
} from "lucide-react";

type ReservationType =
  | "Troca de equipamento"
  | "Assistência / Fornecedor"
  | "Preparação de equipamento"
  | "Receção / Entrega"
  | "Manutenção";

type ReservationStatus =
  | "Agendada"
  | "Em preparação"
  | "Em curso"
  | "Concluída"
  | "Cancelada";
 
interface Reservation {
  id: number;
  type: ReservationType;
  title: string;
  date: string;
  time: string;
  equipment: string;
  user: string;
  supplier: string;
  location: string;
  description: string;
  status: ReservationStatus;
  notes: string;
}

const typeOptions: ReservationType[] = [
  "Troca de equipamento",
  "Assistência / Fornecedor",
  "Preparação de equipamento",
  "Receção / Entrega",
  "Manutenção",
];

const statusOptions: ReservationStatus[] = [
  "Agendada",
  "Em preparação",
  "Em curso",
  "Concluída",
  "Cancelada",
];

const typeIcon = (type: ReservationType) => {
  switch (type) {
    case "Troca de equipamento":
      return RefreshCw;
    case "Assistência / Fornecedor":
      return Wrench;
    case "Preparação de equipamento":
      return Laptop;
    case "Receção / Entrega":
      return Package;
    case "Manutenção":
      return Settings2;
  }
};

const typeLabel = (type: ReservationType, isPT: boolean) => {
  if (isPT) return type;
  const labels: Record<ReservationType, string> = {
    "Troca de equipamento": "Equipment replacement",
    "Assistência / Fornecedor": "Support / Supplier",
    "Preparação de equipamento": "Equipment preparation",
    "Receção / Entrega": "Reception / Delivery",
    "Manutenção": "Maintenance",
  };
  return labels[type];
};

const statusLabel = (status: ReservationStatus, isPT: boolean) => {
  if (isPT) return status;
  const labels: Record<ReservationStatus, string> = {
    Agendada: "Scheduled",
    "Em preparação": "Preparing",
    "Em curso": "In progress",
    Concluída: "Completed",
    Cancelada: "Cancelled",
  };
  return labels[status];
};

const statusClass = (status: ReservationStatus) => {
  switch (status) {
    case "Concluída":
      return "border-emerald-500/20 bg-emerald-500/10 text-emerald-400";
    case "Em curso":
      return "border-blue-500/20 bg-blue-500/10 text-blue-400";
    case "Em preparação":
      return "border-violet-500/20 bg-violet-500/10 text-violet-400";
    case "Cancelada":
      return "border-red-500/20 bg-red-500/10 text-red-400";
    default:
      return "border-amber-500/20 bg-amber-500/10 text-amber-400";
  }
};

const emptyForm = {
  type: "Preparação de equipamento" as ReservationType,
  title: "",
  date: "",
  time: "",
  equipment: "",
  user: "",
  supplier: "",
  location: "",
  description: "",
  status: "Agendada" as ReservationStatus,
  notes: "",
};

const initialReservations: Reservation[] = [];

const ReservationsPage = () => {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [reservations, setReservations] =
    useState<Reservation[]>(initialReservations);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"Todas" | ReservationStatus>("Todas");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const getMonday = (date: Date) => {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);
    const day = result.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    result.setDate(result.getDate() + diff);
    return result;
  };

  const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [weekStart, setWeekStart] = useState(() => getMonday(new Date()));

  const weekDays = useMemo(() =>
    Array.from({ length: 7 }, (_, index) => {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + index);
      return date;
    }), [weekStart]
  );

  const weekReservations = useMemo(() => {
    const startKey = toDateKey(weekDays[0]);
    const endKey = toDateKey(weekDays[6]);
    return reservations.filter((item) => item.date >= startKey && item.date <= endKey);
  }, [reservations, weekDays]);

  const filteredReservations = useMemo(() => {
    const term = search.trim().toLowerCase();

    return reservations
      .filter((item) => filter === "Todas" || item.status === filter)
      .filter((item) => {
        if (!term) return true;
        return [
          item.title,
          item.type,
          item.equipment,
          item.user,
          item.supplier,
          item.location,
          item.description,
        ]
          .join(" ")
          .toLowerCase()
          .includes(term);
      })
      .sort((a, b) =>
        `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
      );
  }, [reservations, search, filter]);

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = filteredReservations.filter(
    (item) => item.date >= today && item.status !== "Concluída" && item.status !== "Cancelada"
  );

  const other = filteredReservations.filter(
    (item) => !upcoming.some((entry) => entry.id === item.id)
  );

  const openModal = () => {
    setForm(emptyForm);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm(emptyForm);
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!form.title.trim() || !form.date) return;

    setReservations((current) => [
      ...current,
      {
        ...form,
        id: Date.now(),
      },
    ]);

    closeModal();
  };

  const formatDate = (date: string) => {
    if (!date) return "—";
    return new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(`${date}T00:00:00`));
  };

  const weekLabel = `${new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", { day: "2-digit", month: "short" }).format(weekDays[0])} — ${new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(weekDays[6])}`;

  const renderReservation = (item: Reservation) => {
    const Icon = typeIcon(item.type);

    return (
      <div
        key={item.id}
        className="group flex flex-col gap-4 border-b border-white/[0.06] px-5 py-5 last:border-b-0 hover:bg-[#101B36]/60 lg:flex-row lg:items-center"
      >
        <div className="flex min-w-0 flex-1 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
            <Icon size={20} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="truncate text-sm font-semibold text-white">
                {item.title}
              </h3>
              <span className="rounded-full border border-white/[0.07] bg-[#0A1328] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                {typeLabel(item.type, isPT)}
              </span>
            </div>

            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <CalendarDays size={13} />
                {formatDate(item.date)}
              </span>

              {item.time && (
                <span className="inline-flex items-center gap-1.5">
                  <Clock3 size={13} />
                  {item.time}
                </span>
              )}

              {item.user && (
                <span className="inline-flex items-center gap-1.5">
                  <UserRound size={13} />
                  {item.user}
                </span>
              )}

              {item.supplier && (
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={13} />
                  {item.supplier}
                </span>
              )}

              {item.location && (
                <span className="inline-flex items-center gap-1.5">
                  <MapPin size={13} />
                  {item.location}
                </span>
              )}
            </div>

            {item.equipment && (
              <p className="mt-2 text-xs text-slate-400">
                Equipamento: <span className="text-slate-300">{item.equipment}</span>
              </p>
            )}

            {item.description && (
              <p className="mt-1 max-w-3xl text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3 lg:justify-end">
          <span
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${statusClass(
              item.status
            )}`}
          >
            {item.status}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 text-white lg:px-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT ? "Reservas" : "Reservations"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isPT ? "Agenda e tarefas futuras do departamento de TI." : "IT department schedule and upcoming tasks."}
          </p>
        </div>

        <button
          type="button"
          onClick={openModal}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus size={17} />
          {isPT ? "Nova reserva" : "New reservation"}
        </button>
      </div>

      <section className="mb-5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
        <div className="flex flex-col gap-3 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white">{isPT ? "Reservas da semana" : "Weekly reservations"}</h2>
            <p className="mt-1 text-xs text-slate-500">{weekLabel}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() - 7); return next; })}
              className="h-8 rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-xs text-slate-400 transition hover:bg-[#101B36] hover:text-white"
            >
              {isPT ? "Anterior" : "Previous"}
            </button>
            <button
              type="button"
              onClick={() => setWeekStart(getMonday(new Date()))}
              className="h-8 rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-xs text-slate-400 transition hover:bg-[#101B36] hover:text-white"
            >
              {isPT ? "Esta semana" : "This week"}
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((current) => { const next = new Date(current); next.setDate(next.getDate() + 7); return next; })}
              className="h-8 rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-xs text-slate-400 transition hover:bg-[#101B36] hover:text-white"
            >
              {isPT ? "Próxima" : "Next"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 divide-x divide-white/[0.06] overflow-x-auto">
          {weekDays.map((day) => {
            const key = toDateKey(day);
            const dayReservations = weekReservations.filter((item) => item.date === key);
            const isToday = key === toDateKey(new Date());
            const dayName = new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", { weekday: "short" }).format(day);

            return (
              <div key={key} className="min-h-[155px] min-w-[125px] bg-[#0A1328]/40">
                <div className={`border-b border-white/[0.06] px-3 py-3 ${isToday ? "bg-blue-500/5" : ""}`}>
                  <p className={`text-[10px] font-medium uppercase ${isToday ? "text-blue-400" : "text-slate-600"}`}>
                    {dayName}
                  </p>
                  <p className={`mt-1 text-lg font-semibold ${isToday ? "text-blue-300" : "text-white"}`}>
                    {day.getDate()}
                  </p>
                </div>

                <div className="space-y-2 p-2">
                  {dayReservations.length === 0 ? (
                    <p className="px-1 pt-2 text-[10px] text-slate-700">{isPT ? "Sem reservas" : "No reservations"}</p>
                  ) : (
                    dayReservations.slice(0, 3).map((item) => {
                      const Icon = typeIcon(item.type);
                      return (
                        <div key={item.id} className="rounded-lg border border-white/[0.06] bg-[#0D1730] p-2.5">
                          <div className="flex items-start gap-2">
                            <Icon size={13} className="mt-0.5 shrink-0 text-blue-400" />
                            <div className="min-w-0">
                              <p className="truncate text-[11px] font-medium text-slate-200">{item.title}</p>
                              <p className="mt-1 text-[10px] text-slate-600">{item.time || (isPT ? "Sem hora" : "No time")}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  {dayReservations.length > 3 && (
                    <p className="px-1 text-[10px] text-blue-400">+{dayReservations.length - 3} {isPT ? "mais" : "more"}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0D1730] p-3">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={isPT ? "Pesquisar por título, equipamento, utilizador ou fornecedor..." : "Search by title, equipment, user or supplier..."}
              className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] pl-9 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
            />
          </div>

          <div className="relative">
            <select
              value={filter}
              onChange={(event) => setFilter(event.target.value as "Todas" | ReservationStatus)}
              className="h-10 min-w-[170px] appearance-none rounded-lg border border-white/[0.06] bg-[#0A1328] pl-3 pr-9 text-sm text-slate-300 outline-none focus:border-blue-500/40"
            >
              <option value="Todas">{isPT ? "Todos os estados" : "All statuses"}</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>{statusLabel(status, isPT)}</option>
              ))}
            </select>
            <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-600" />
          </div>
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [isPT ? "Total" : "Total", reservations.length, "text-white"],
          [isPT ? "Agendadas" : "Scheduled", reservations.filter((item) => item.status === "Agendada").length, "text-amber-400"],
          [isPT ? "Em curso" : "In progress", reservations.filter((item) => item.status === "Em curso").length, "text-blue-400"],
          [isPT ? "Concluídas" : "Completed", reservations.filter((item) => item.status === "Concluída").length, "text-emerald-400"],
        ].map(([label, value, color]) => (
          <div key={String(label)} className="rounded-xl border border-white/[0.06] bg-[#0D1730] px-4 py-4">
            <p className="text-xs text-slate-500">{label}</p>
            <p className={`mt-2 text-xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">{isPT ? "Próximas" : "Upcoming"}</h2>
              <p className="mt-1 text-xs text-slate-500">
                {isPT ? "Trabalhos e intervenções agendados." : "Scheduled work and interventions."}
              </p>
            </div>
            <span className="text-xs text-slate-600">
              {upcoming.length} {upcoming.length === 1 ? (isPT ? "reserva" : "reservation") : (isPT ? "reservas" : "reservations")}
            </span>
          </div>
        </div>

        {upcoming.length > 0 ? (
          upcoming.map(renderReservation)
        ) : (
          <div className="flex min-h-[180px] flex-col items-center justify-center px-5 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A1328] text-slate-600">
              <CalendarDays size={21} />
            </div>
            <p className="text-sm font-medium text-slate-400">
              {isPT ? "Nenhuma reserva agendada" : "No reservations scheduled"}
            </p>
            <p className="mt-1 max-w-md text-xs text-slate-600">
              {isPT ? "Adiciona uma troca de equipamento, visita de fornecedor ou preparação" : "Add an equipment replacement, supplier visit or equipment preparation"}
              {isPT ? "de equipamento para começar a utilizar esta agenda." : "of equipment to start using this schedule."}
            </p>
            <button
              type="button"
              onClick={openModal}
              className="mt-4 text-xs font-medium text-blue-400 hover:text-blue-300"
            >
              + {isPT ? "Criar primeira reserva" : "Create first reservation"}
            </button>
          </div>
        )}
      </section>

      {other.length > 0 && (
        <section className="mt-5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white">{isPT ? "Histórico" : "History"}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {isPT ? "Reservas concluídas ou anteriores." : "Completed or previous reservations."}
            </p>
          </div>
          {other.map(renderReservation)}
        </section>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-2xl border border-white/[0.08] bg-[#0D1730] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {isPT ? "Nova reserva" : "New reservation"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {isPT ? "Regista uma tarefa ou intervenção futura de TI." : "Register a future IT task or intervention."}
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-[#101B36] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {isPT ? "Tipo" : "Type"}
                </label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {typeOptions.map((type) => {
                    const Icon = typeIcon(type);
                    const selected = form.type === type;

                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, type }))}
                        className={`flex items-center gap-3 rounded-lg border px-3 py-3 text-left text-xs transition ${
                          selected
                            ? "border-blue-500/40 bg-blue-500/10 text-blue-300"
                            : "border-white/[0.06] bg-[#0A1328] text-slate-400 hover:bg-[#101B36]"
                        }`}
                      >
                        <Icon size={17} />
                        {type}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Título *" : "Title *"}
                  </label>
                  <input
                    required
                    value={form.title}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, title: event.target.value }))
                    }
                    placeholder={isPT ? "Ex.: Preparar portátil para novo colaborador" : "E.g. Prepare laptop for a new employee"}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Data *" : "Date *"}
                  </label>
                  <input
                    required
                    type="date"
                    value={form.date}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, date: event.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Hora" : "Time"}
                  </label>
                  <input
                    type="time"
                    value={form.time}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, time: event.target.value }))
                    }
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Equipamento" : "Equipment"}
                  </label>
                  <input
                    value={form.equipment}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        equipment: event.target.value,
                      }))
                    }
                    placeholder={isPT ? "Ex.: Dell Latitude 5450" : "E.g. Dell Latitude 5450"}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Utilizador" : "User"}
                  </label>
                  <input
                    value={form.user}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, user: event.target.value }))
                    }
                    placeholder={isPT ? "Ex.: João Silva" : "E.g. John Smith"}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Fornecedor" : "Supplier"}
                  </label>
                  <input
                    value={form.supplier}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        supplier: event.target.value,
                      }))
                    }
                    placeholder={isPT ? "Ex.: Dell / fornecedor externo" : "E.g. Dell / external supplier"}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Local" : "Location"}
                  </label>
                  <input
                    value={form.location}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        location: event.target.value,
                      }))
                    }
                    placeholder={isPT ? "Ex.: Escritório / Sala de TI" : "E.g. Office / IT room"}
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    {isPT ? "Estado" : "Status"}
                  </label>
                  <select
                    value={form.status}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        status: event.target.value as ReservationStatus,
                      }))
                    }
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-slate-300 outline-none focus:border-blue-500/40"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {isPT ? "Descrição" : "Description"}
                </label>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description: event.target.value,
                    }))
                  }
                  rows={3}
                  placeholder={isPT ? "Descreve o que é necessário fazer..." : "Describe what needs to be done..."}
                  className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {isPT ? "Notas" : "Notes"}
                </label>
                <textarea
                  value={form.notes}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, notes: event.target.value }))
                  }
                  rows={2}
                  placeholder={isPT ? "Notas internas..." : "Internal notes..."}
                  className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-500/40"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="h-10 rounded-lg border border-white/[0.07] px-4 text-sm font-medium text-slate-400 transition hover:bg-[#101B36] hover:text-white"
                >
                  {isPT ? "Cancelar" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
                >
                  <Check size={16} />
                  {isPT ? "Criar reserva" : "Create reservation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationsPage;
