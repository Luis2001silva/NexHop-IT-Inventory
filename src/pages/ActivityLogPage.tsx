import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft, Clock3, Copy, Play, Plus, RefreshCw, Square, Trash2, Pencil, X,
  CalendarDays, Timer, ClipboardList, CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";

const db = supabase as any;
const TIMER_PREFIX = "nexthop-activity-timer:";

type ActivityRow = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  entry_type: "timer" | "manual";
  work_date: string;
  started_at: string | null;
  ended_at: string | null;
  duration_minutes: number;
  created_at: string;
};

type ProfileRow = { id: string; full_name: string | null; email: string | null };
type RunningTimer = { startedAt: string; title: string; description: string; category: string };

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDuration = (minutes: number) => {
  const safe = Math.max(0, Math.round(minutes || 0));
  const hours = Math.floor(safe / 60);
  const mins = safe % 60;
  return hours ? `${hours}h ${String(mins).padStart(2, "0")}m` : `${mins} min`;
};

const formatTime = (value: string | null) => {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString("pt-PT", { hour: "2-digit", minute: "2-digit" });
};

const categories = [
  { value: "suporte", pt: "Suporte a utilizadores", en: "User support" },
  { value: "equipamentos", pt: "Equipamentos", en: "Equipment" },
  { value: "software", pt: "Software / aplicações", en: "Software / applications" },
  { value: "rede", pt: "Rede / acessos", en: "Network / access" },
  { value: "reuniao", pt: "Reuniões", en: "Meetings" },
  { value: "administrativo", pt: "Tarefas administrativas", en: "Administrative tasks" },
  { value: "projeto", pt: "Desenvolvimento / projeto", en: "Development / project" },
  { value: "outro", pt: "Outro", en: "Other" },
];

export default function ActivityLogPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const { role } = useUserRole();
  const isPT = language === "pt";
  const isAdmin = role === "admin";

  const [date, setDate] = useState(localDate());
  const [entries, setEntries] = useState<ActivityRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [running, setRunning] = useState<RunningTimer | null>(null);
  const [timerTitle, setTimerTitle] = useState("");
  const [timerDescription, setTimerDescription] = useState("");
  const [timerCategory, setTimerCategory] = useState("suporte");
  const [manualTitle, setManualTitle] = useState("");
  const [manualDescription, setManualDescription] = useState("");
  const [manualCategory, setManualCategory] = useState("suporte");
  const [manualDate, setManualDate] = useState(localDate());
  const [manualDuration, setManualDuration] = useState("15");
  const [manualStart, setManualStart] = useState("");
  const [manualEnd, setManualEnd] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ActivityRow | null>(null);
  const manualSectionRef = useRef<HTMLElement | null>(null);

  const timerStorageKey = user?.id ? `${TIMER_PREFIX}${user.id}` : null;

  useEffect(() => {
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!timerStorageKey) return;
    try {
      const stored = localStorage.getItem(timerStorageKey);
      setRunning(stored ? (JSON.parse(stored) as RunningTimer) : null);
    } catch {
      localStorage.removeItem(timerStorageKey);
      setRunning(null);
    }
  }, [timerStorageKey]);

  const loadEntries = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      let query = db.from("activity_entries").select("*").eq("work_date", date).order("created_at", { ascending: false });
      if (isAdmin && userFilter !== "all") query = query.eq("user_id", userFilter);
      const { data, error } = await query;
      if (error) throw error;
      setEntries((data ?? []) as ActivityRow[]);

      if (isAdmin) {
        const { data: people, error: peopleError } = await db
          .from("profiles").select("id, full_name, email").order("full_name");
        if (!peopleError) setProfiles((people ?? []) as ProfileRow[]);
      }
    } catch (error: any) {
      console.error("Activity log load failed", error);
      toast.error(isPT ? "Não foi possível carregar as atividades. Confirma se executaste o SQL do módulo." : "Could not load activities. Check that the module SQL has been applied.");
    } finally {
      setLoading(false);
    }
  }, [user?.id, date, isAdmin, userFilter, isPT]);

  useEffect(() => { void loadEntries(); }, [loadEntries]);

  const startTimer = () => {
    if (!user?.id || !timerStorageKey) return;
    if (!timerTitle.trim()) {
      toast.error(isPT ? "Indica o que vais fazer antes de iniciar." : "Enter an activity before starting the timer.");
      return;
    }
    const value: RunningTimer = {
      startedAt: new Date().toISOString(),
      title: timerTitle.trim(),
      description: timerDescription.trim(),
      category: timerCategory,
    };
    localStorage.setItem(timerStorageKey, JSON.stringify(value));
    setRunning(value);
    toast.success(isPT ? "Cronómetro iniciado." : "Timer started.");
  };

  const stopTimer = async () => {
    if (!running || !user?.id || !timerStorageKey) return;
    const endedAt = new Date();
    const startedAt = new Date(running.startedAt);
    const duration = Math.max(1, Math.round((endedAt.getTime() - startedAt.getTime()) / 60000));
    setSaving(true);
    try {
      const { error } = await db.from("activity_entries").insert({
        user_id: user.id,
        title: running.title,
        description: running.description || null,
        category: running.category,
        entry_type: "timer",
        work_date: localDate(startedAt),
        started_at: running.startedAt,
        ended_at: endedAt.toISOString(),
        duration_minutes: duration,
      });
      if (error) throw error;
      localStorage.removeItem(timerStorageKey);
      setRunning(null);
      setTimerTitle("");
      setTimerDescription("");
      toast.success(isPT ? `Atividade registada: ${formatDuration(duration)}.` : `Activity saved: ${formatDuration(duration)}.`);
      await loadEntries();
    } catch (error: any) {
      toast.error(error.message || (isPT ? "Não foi possível guardar a atividade." : "Could not save activity."));
    } finally {
      setSaving(false);
    }
  };

  const saveManual = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?.id) return;
    if (!manualTitle.trim()) {
      toast.error(isPT ? "Indica a atividade." : "Enter an activity.");
      return;
    }
    let duration = Number(manualDuration);
    let startIso: string | null = null;
    let endIso: string | null = null;
    if (manualStart && manualEnd) {
      const start = new Date(manualStart);
      const end = new Date(manualEnd);
      if (end <= start) {
        toast.error(isPT ? "A hora de fim tem de ser posterior à hora de início." : "End time must be after start time.");
        return;
      }
      duration = Math.max(1, Math.round((end.getTime() - start.getTime()) / 60000));
      startIso = start.toISOString();
      endIso = end.toISOString();
    }
    if (!Number.isFinite(duration) || duration < 1) {
      toast.error(isPT ? "Indica uma duração válida em minutos." : "Enter a valid duration in minutes.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: manualTitle.trim(),
        description: manualDescription.trim() || null,
        category: manualCategory,
        work_date: manualDate,
        started_at: startIso,
        ended_at: endIso,
        duration_minutes: duration,
      };
      if (editingEntryId) {
        let updateQuery = db.from("activity_entries").update(payload).eq("id", editingEntryId);
        const { error } = await updateQuery;
        if (error) throw error;
        toast.success(isPT ? "Registo atualizado." : "Entry updated.");
      } else {
        const { error } = await db.from("activity_entries").insert({
          user_id: user.id,
          ...payload,
          entry_type: "manual",
        });
        if (error) throw error;
        toast.success(isPT ? "Atividade registada." : "Activity saved.");
      }
      setEditingEntryId(null);
      setManualTitle("");
      setManualDescription("");
      setManualCategory("suporte");
      setManualDuration("15");
      setManualStart("");
      setManualEnd("");
      setDate(manualDate);
      await loadEntries();
    } catch (error: any) {
      toast.error(error.message || (isPT ? "Não foi possível guardar a atividade." : "Could not save activity."));
    } finally {
      setSaving(false);
    }
  };

  const toDateTimeLocal = (value: string | null) => {
    if (!value) return "";
    const d = new Date(value);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const editEntry = (entry: ActivityRow) => {
    if (!isAdmin && entry.user_id !== user?.id) return;
    setEditingEntryId(entry.id);
    setManualTitle(entry.title);
    setManualDescription(entry.description || "");
    setManualCategory(entry.category || "outro");
    setManualDate(entry.work_date);
    setManualDuration(String(entry.duration_minutes || 15));
    setManualStart(toDateTimeLocal(entry.started_at));
    setManualEnd(toDateTimeLocal(entry.ended_at));
    window.setTimeout(() => manualSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  const cancelEdit = () => {
    setEditingEntryId(null);
    setManualTitle("");
    setManualDescription("");
    setManualCategory("suporte");
    setManualDate(localDate());
    setManualDuration("15");
    setManualStart("");
    setManualEnd("");
  };

  const deleteEntry = (entry: ActivityRow) => {
    if (!isAdmin && entry.user_id !== user?.id) return;
    setDeleteTarget(entry);
  };

  const confirmDeleteEntry = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      const { error } = await db.from("activity_entries").delete().eq("id", deleteTarget.id);
      if (error) throw error;
      toast.success(isPT ? "Registo eliminado." : "Entry deleted.");
      setDeleteTarget(null);
      if (editingEntryId === deleteTarget.id) cancelEdit();
      await loadEntries();
    } catch (error: any) {
      toast.error(error.message || (isPT ? "Não foi possível eliminar o registo." : "Could not delete entry."));
    } finally {
      setSaving(false);
    }
  };

  const totalMinutes = useMemo(() => entries.reduce((total, entry) => total + (entry.duration_minutes || 0), 0), [entries]);
  const elapsedSeconds = running ? Math.max(0, Math.floor((now - new Date(running.startedAt).getTime()) / 1000)) : 0;
  const timerDisplay = `${String(Math.floor(elapsedSeconds / 3600)).padStart(2, "0")}:${String(Math.floor((elapsedSeconds % 3600) / 60)).padStart(2, "0")}:${String(elapsedSeconds % 60).padStart(2, "0")}`;

  const dailyReport = useMemo(() => {
    const person = (id: string) => profiles.find((p) => p.id === id)?.full_name || profiles.find((p) => p.id === id)?.email || (isPT ? "Utilizador" : "User");
    const lines = entries.slice().sort((a, b) => (a.started_at || a.created_at).localeCompare(b.started_at || b.created_at)).map((entry) => {
      const category = categories.find((item) => item.value === entry.category);
      const time = entry.started_at ? `${formatTime(entry.started_at)}–${formatTime(entry.ended_at)}` : formatDuration(entry.duration_minutes);
      const owner = isAdmin ? `${person(entry.user_id)} — ` : "";
      return `• ${time} | ${entry.title} (${category ? (isPT ? category.pt : category.en) : entry.category}) — ${formatDuration(entry.duration_minutes)}${owner ? `\n  ${owner.trim()}` : ""}${entry.description ? `\n  ${entry.description}` : ""}`;
    });
    return `${isPT ? "REGISTO DIÁRIO DE ATIVIDADE" : "DAILY ACTIVITY REPORT"}\n${isPT ? "Data" : "Date"}: ${date}\n${isPT ? "Tempo total" : "Total time"}: ${formatDuration(totalMinutes)}\n\n${lines.length ? lines.join("\n\n") : (isPT ? "Sem atividades registadas." : "No activities recorded.")}\n`;
  }, [entries, date, totalMinutes, profiles, isAdmin, isPT]);

  const copyReport = async () => {
    try {
      await navigator.clipboard.writeText(dailyReport);
      toast.success(isPT ? "Relatório copiado. Já podes colar no email ou Teams." : "Report copied. Paste it into email or Teams.");
    } catch {
      toast.error(isPT ? "Não foi possível copiar automaticamente." : "Could not copy automatically.");
    }
  };

  const card = "rounded-2xl border border-white/10 bg-[#0D1730] p-5 shadow-lg shadow-black/10";
  const field = "w-full rounded-lg border border-white/10 bg-[#080D1F] px-3 py-2.5 text-sm text-white outline-none focus:border-blue-400/70";
  const label = "mb-1.5 block text-xs font-medium text-white/65";

  return (
    <div className="min-h-full bg-[#080D1F] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to={isAdmin ? "/dashboard" : "/portal"} className="mb-3 inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300"><ArrowLeft size={16} />{isPT ? (isAdmin ? "Voltar ao painel" : "Voltar ao portal") : (isAdmin ? "Back to dashboard" : "Back to portal")}</Link>
            <div className="flex items-center gap-3"><span className="rounded-xl bg-blue-500/15 p-3 text-blue-300"><Clock3 size={24} /></span><div><h1 className="text-2xl font-bold sm:text-3xl">{isPT ? "Registo de atividade" : "Activity log"}</h1><p className="mt-1 text-sm text-white/50">{isPT ? "Regista o trabalho feito e prepara o resumo diário para enviar." : "Track your work and prepare a daily summary to send."}</p></div></div>
          </div>
          <button onClick={() => void loadEntries()} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/5"><RefreshCw size={15} />{isPT ? "Atualizar" : "Refresh"}</button>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <section className={card}>
            <div className="mb-4 flex items-center gap-2"><Timer className="text-blue-300" size={19} /><h2 className="font-semibold">{isPT ? "Cronómetro" : "Timer"}</h2><span className="ml-auto rounded-full bg-blue-500/10 px-2 py-1 text-xs text-blue-300">{isPT ? "Tempo real" : "Live"}</span></div>
            {running ? <>
              <p className="text-sm font-medium">{running.title}</p><p className="mt-1 min-h-5 text-sm text-white/45">{running.description || (isPT ? "Sem descrição" : "No description")}</p>
              <div className="my-5 font-mono text-4xl font-semibold tracking-wider text-blue-300 sm:text-5xl">{timerDisplay}</div>
              <button disabled={saving} onClick={() => void stopTimer()} className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50"><Square size={15} fill="currentColor" />{isPT ? "Parar e guardar" : "Stop and save"}</button>
            </> : <>
              <div className="grid gap-3 sm:grid-cols-2"><div><label className={label}>{isPT ? "O que vais fazer? *" : "Activity *"}</label><input className={field} value={timerTitle} onChange={(e) => setTimerTitle(e.target.value)} placeholder={isPT ? "Ex.: Preparar portátil para colaborador" : "e.g. Prepare employee laptop"} /></div><div><label className={label}>{isPT ? "Categoria" : "Category"}</label><select className={field} value={timerCategory} onChange={(e) => setTimerCategory(e.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{isPT ? item.pt : item.en}</option>)}</select></div></div>
              <div className="mt-3"><label className={label}>{isPT ? "Descrição (opcional)" : "Description (optional)"}</label><textarea className={field} rows={2} value={timerDescription} onChange={(e) => setTimerDescription(e.target.value)} placeholder={isPT ? "Detalhes, utilizador/equipamento, resultado..." : "Details, user/equipment, outcome..."} /></div>
              <button onClick={startTimer} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-400"><Play size={16} fill="currentColor" />{isPT ? "Iniciar cronómetro" : "Start timer"}</button>
            </>}
          </section>

          <section ref={manualSectionRef} className={card}>
            <div className="mb-4 flex items-center gap-2"><Plus className="text-emerald-300" size={19} /><h2 className="font-semibold">{editingEntryId ? (isPT ? "Editar registo" : "Edit entry") : (isPT ? "Registo manual" : "Manual entry")}</h2></div>
            <form onSubmit={saveManual} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2"><div><label className={label}>{isPT ? "Atividade *" : "Activity *"}</label><input className={field} value={manualTitle} onChange={(e) => setManualTitle(e.target.value)} placeholder={isPT ? "Ex.: Apoio na instalação do Teams" : "e.g. Teams installation support"} required /></div><div><label className={label}>{isPT ? "Categoria" : "Category"}</label><select className={field} value={manualCategory} onChange={(e) => setManualCategory(e.target.value)}>{categories.map((item) => <option key={item.value} value={item.value}>{isPT ? item.pt : item.en}</option>)}</select></div></div>
              <div><label className={label}>{isPT ? "Descrição / resultado" : "Description / outcome"}</label><textarea className={field} rows={2} value={manualDescription} onChange={(e) => setManualDescription(e.target.value)} placeholder={isPT ? "O que fizeste e qual foi o resultado?" : "What did you do and what was the outcome?"} /></div>
              <div className="grid gap-3 sm:grid-cols-3"><div><label className={label}>{isPT ? "Data" : "Date"}</label><input type="date" className={field} value={manualDate} onChange={(e) => setManualDate(e.target.value)} required /></div><div><label className={label}>{isPT ? "Início (opcional)" : "Start (optional)"}</label><input type="datetime-local" className={field} value={manualStart} onChange={(e) => setManualStart(e.target.value)} /></div><div><label className={label}>{isPT ? "Fim (opcional)" : "End (optional)"}</label><input type="datetime-local" className={field} value={manualEnd} onChange={(e) => setManualEnd(e.target.value)} /></div></div>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="w-full sm:max-w-48"><label className={label}>{isPT ? "Duração em minutos (se não indicares início/fim)" : "Duration in minutes (if no start/end)"}</label><input type="number" min="1" step="1" className={field} value={manualDuration} onChange={(e) => setManualDuration(e.target.value)} /></div><button disabled={saving} type="submit" className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-400 disabled:opacity-50"><Plus size={16} />{editingEntryId ? (isPT ? "Guardar alterações" : "Save changes") : (isPT ? "Guardar atividade" : "Save activity")}</button>{editingEntryId && <button type="button" onClick={cancelEdit} className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 px-4 py-2.5 text-sm text-white/70 hover:bg-white/5"><X size={16} />{isPT ? "Cancelar" : "Cancel"}</button>}</div>
            </form>
          </section>
        </div>

        <section className={card}>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><div className="mb-1 flex items-center gap-2"><CalendarDays size={18} className="text-blue-300" /><h2 className="font-semibold">{isPT ? "Relatório diário" : "Daily report"}</h2></div><p className="text-sm text-white/45">{isPT ? "Escolhe o dia, revê os registos e copia o texto para email ou Teams." : "Choose a day, review entries and copy the report to email or Teams."}</p></div><div className="flex flex-col gap-2 sm:flex-row sm:items-end"><div><label className={label}>{isPT ? "Dia do relatório" : "Report date"}</label><input type="date" className={field} value={date} onChange={(e) => setDate(e.target.value)} /></div>{isAdmin && <div><label className={label}>{isPT ? "Utilizador" : "User"}</label><select className={field} value={userFilter} onChange={(e) => setUserFilter(e.target.value)}><option value="all">{isPT ? "Todos" : "All users"}</option>{profiles.map((person) => <option key={person.id} value={person.id}>{person.full_name || person.email || person.id}</option>)}</select></div>}<button onClick={() => void copyReport()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold hover:bg-blue-400"><Copy size={16} />{isPT ? "Copiar relatório" : "Copy report"}</button></div></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-white/5 bg-white/[0.025] p-4"><p className="text-xs text-white/45">{isPT ? "Atividades" : "Activities"}</p><p className="mt-1 text-2xl font-bold">{entries.length}</p></div><div className="rounded-xl border border-white/5 bg-white/[0.025] p-4"><p className="text-xs text-white/45">{isPT ? "Tempo total" : "Total time"}</p><p className="mt-1 text-2xl font-bold text-blue-300">{formatDuration(totalMinutes)}</p></div><div className="rounded-xl border border-white/5 bg-white/[0.025] p-4"><p className="text-xs text-white/45">{isPT ? "Estado" : "Status"}</p><p className="mt-1 flex items-center gap-2 text-sm font-medium text-emerald-300"><CheckCircle2 size={16} />{isPT ? "Pronto a copiar/enviar" : "Ready to copy/send"}</p></div></div>
          <div className="mt-5 space-y-3">{loading ? <p className="py-8 text-center text-sm text-white/45">{isPT ? "A carregar atividades..." : "Loading activities..."}</p> : entries.length === 0 ? <div className="rounded-xl border border-dashed border-white/10 py-10 text-center"><ClipboardList className="mx-auto mb-2 text-white/25" size={28} /><p className="text-sm text-white/55">{isPT ? "Ainda não há atividades registadas para este dia." : "No activities recorded for this day yet."}</p></div> : entries.map((entry) => { const owner = profiles.find((p) => p.id === entry.user_id); const category = categories.find((item) => item.value === entry.category); return <div key={entry.id} className="flex flex-col gap-3 rounded-xl border border-white/8 bg-white/[0.025] p-4 sm:flex-row sm:items-start"><div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-400" /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="font-medium">{entry.title}</h3><span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] text-white/50">{category ? (isPT ? category.pt : category.en) : entry.category}</span><span className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-white/45">{entry.entry_type === "timer" ? (isPT ? "Cronómetro" : "Timer") : (isPT ? "Manual" : "Manual")}</span></div>{entry.description && <p className="mt-1 whitespace-pre-wrap text-sm text-white/55">{entry.description}</p>}<p className="mt-2 text-xs text-white/40">{formatTime(entry.started_at)}{entry.ended_at ? ` – ${formatTime(entry.ended_at)}` : ""}{isAdmin && owner ? ` · ${owner.full_name || owner.email || ""}` : ""}</p></div><div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end"><span className="whitespace-nowrap font-semibold text-blue-300">{formatDuration(entry.duration_minutes)}</span><div className="flex items-center gap-1"><button title={isPT ? "Editar registo" : "Edit entry"} onClick={() => editEntry(entry)} className="rounded-lg p-2 text-white/35 hover:bg-blue-500/10 hover:text-blue-300"><Pencil size={15} /></button><button title={isPT ? "Eliminar registo" : "Delete entry"} onClick={() => void deleteEntry(entry)} className="rounded-lg p-2 text-white/35 hover:bg-red-500/10 hover:text-red-300"><Trash2 size={15} /></button></div></div></div>; })}</div>
          <div className="mt-5"><label className={label}>{isPT ? "Pré-visualização do texto a copiar" : "Preview of report to copy"}</label><textarea readOnly className={`${field} font-mono text-xs leading-5`} rows={Math.min(12, Math.max(5, entries.length * 2 + 3))} value={dailyReport} /></div>
        </section>
        <p className="text-xs leading-5 text-white/35">{isPT ? "Privacidade: cada utilizador só consulta os seus próprios registos. Os administradores podem consultar todos. A proteção é aplicada também na base de dados (RLS)." : "Privacy: users can only view their own entries. Administrators can view all entries. Database Row Level Security enforces access."}</p>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !saving) setDeleteTarget(null); }}>
          <div role="dialog" aria-modal="true" aria-labelledby="delete-activity-title" className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0D1730] p-6 shadow-2xl shadow-black/40">
            <div className="mb-4 flex items-start gap-3">
              <span className="rounded-xl bg-red-500/15 p-3 text-red-300"><Trash2 size={21} /></span>
              <div>
                <h2 id="delete-activity-title" className="text-lg font-semibold">{isPT ? "Eliminar atividade" : "Delete activity"}</h2>
                <p className="mt-1 text-sm text-white/60">{isPT ? "Tens a certeza de que queres eliminar este registo? Esta ação não pode ser anulada." : "Are you sure you want to delete this entry? This action cannot be undone."}</p>
              </div>
            </div>
            <div className="mb-5 rounded-lg border border-white/8 bg-white/[0.03] p-3">
              <p className="font-medium">{deleteTarget.title}</p>
              <p className="mt-1 text-xs text-white/45">{formatDuration(deleteTarget.duration_minutes)} · {deleteTarget.work_date}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button type="button" disabled={saving} onClick={() => setDeleteTarget(null)} className="rounded-lg border border-white/10 px-4 py-2.5 text-sm font-medium text-white/75 hover:bg-white/5 disabled:opacity-50">{isPT ? "Cancelar" : "Cancel"}</button>
              <button type="button" disabled={saving} onClick={() => void confirmDeleteEntry()} className="inline-flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-400 disabled:opacity-50">{saving ? <RefreshCw size={15} className="animate-spin" /> : <Trash2 size={15} />}{isPT ? "Eliminar registo" : "Delete entry"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
