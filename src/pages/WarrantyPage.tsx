import { useEffect, useMemo, useState } from "react";
import {
  Search,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Monitor,
  MonitorDown,
  Server,
  Smartphone,
  Network,
  Printer,
  Tablet,
  Headphones,
  Laptop,
  Tv,
  Package,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

interface Equipment {
  id: number;
  serial_number: string | null;
  model: string | null;
  warranty_end: string | null;
  brands?: {
    name: string;
  } | null;
}

type WarrantyState = "active" | "ending" | "expired" | "none";

const ENDING_DAYS = 90;

export default function WarrantyPage() {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from("equipment")
        .select(
          `
          id,
          serial_number,
          model,
          warranty_end,
          brands!equipment_brand_id_fkey(name)
        `,
        )
        .order("id", { ascending: false });

      if (error) {
        console.error("Erro ao carregar garantias:", error);
        return;
      }

      setEquipment((data ?? []) as Equipment[]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  const getEquipmentIcon = (_item: Equipment) => {
    // Por agora, todos os equipamentos usam o ícone genérico de caixa.
    // A lógica por tipo fica para uma fase posterior.
    return <Package size={17} />;
  };

  const getWarrantyState = (item: Equipment): WarrantyState => {
    if (!item.warranty_end) return "none";

    const end = new Date(item.warranty_end);
    if (Number.isNaN(end.getTime())) return "none";

    const days = Math.ceil((end.getTime() - new Date().getTime()) / 86400000);

    if (days < 0) return "expired";
    if (days <= ENDING_DAYS) return "ending";
    return "active";
  };

  const getDaysRemaining = (item: Equipment) => {
    if (!item.warranty_end) return null;

    const end = new Date(item.warranty_end);
    if (Number.isNaN(end.getTime())) return null;

    return Math.ceil((end.getTime() - new Date().getTime()) / 86400000);
  };

  const formatDate = (date: string | null) => {
    if (!date) return "—";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";

    return parsed.toLocaleDateString(isPT ? "pt-PT" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredEquipment = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return equipment;

    return equipment.filter((item) =>
      [item.brands?.name, item.model, item.serial_number]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(value)),
    );
  }, [equipment, search]);

  const stats = useMemo(
    () => ({
      active: equipment.filter((item) => getWarrantyState(item) === "active")
        .length,
      ending: equipment.filter((item) => getWarrantyState(item) === "ending")
        .length,
      expired: equipment.filter((item) => getWarrantyState(item) === "expired")
        .length,
      none: equipment.filter((item) => getWarrantyState(item) === "none")
        .length,
    }),
    [equipment],
  );

  const getStateLabel = (state: WarrantyState) => {
    if (state === "active") return isPT ? "Ativa" : "Active";

    if (state === "ending") return isPT ? "A terminar" : "Ending soon";

    if (state === "expired") return isPT ? "Expirada" : "Expired";

    return isPT ? "Sem garantia" : "No warranty";
  };

  const getStateClasses = (state: WarrantyState) => {
    if (state === "active")
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    if (state === "ending")
      return "border-amber-400/20 bg-amber-400/10 text-amber-400";

    if (state === "expired")
      return "border-red-400/20 bg-red-400/10 text-red-400";

    return "border-white/10 bg-white/[0.04] text-white/40";
  };

  const getStateIcon = (state: WarrantyState) => {
    if (state === "active") return <ShieldCheck size={13} />;

    if (state === "ending") return <ShieldAlert size={13} />;

    if (state === "expired") return <ShieldX size={13} />;

    return null;
  };

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white">
      <div className="space-y-5">
        {/* HEADER */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT ? "Garantias" : "Warranties"}
          </h1>

          <p className="mt-1 text-sm text-white/35">
            {isPT
              ? "Consulte o estado das garantias dos equipamentos."
              : "Check the warranty status of your equipment."}
          </p>
        </div>

        {/* STATS */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
            <div className="text-sm text-emerald-400">
              {isPT ? "Ativas" : "Active"}
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {stats.active}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
            <div className="text-sm text-amber-400">
              {isPT ? "A terminar" : "Ending soon"}
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {stats.ending}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
            <div className="text-sm text-red-400">
              {isPT ? "Expiradas" : "Expired"}
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {stats.expired}
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
            <div className="text-sm text-white/45">
              {isPT ? "Sem garantia" : "No warranty"}
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {stats.none}
            </div>
          </div>
        </div>

        {/* SEARCH */}
        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
            />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isPT
                  ? "Pesquisar por marca, modelo ou número de série..."
                  : "Search by brand, model or serial number..."
              }
              className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#0A1328] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/40"
            />
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <div className="text-sm font-semibold text-white">
              {isPT ? "Equipamentos" : "Equipment"}
            </div>

            <div className="mt-1 text-xs text-white/35">
              {filteredEquipment.length} {isPT ? "equipamentos" : "equipment"}
            </div>
          </div>

          {isLoading ? (
            <div className="flex min-h-[300px] items-center justify-center text-sm text-white/35">
              {isPT ? "A carregar equipamentos..." : "Loading equipment..."}
            </div>
          ) : filteredEquipment.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-6 text-center text-sm text-white/35">
              {isPT ? "Nenhum equipamento encontrado." : "No equipment found."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <colgroup>
                  <col className="w-[168px]" />
                  <col />
                  <col />
                  <col />
                  <col />
                </colgroup>
                <thead>
                  <tr className="border-b border-white/[0.05] text-left">
                    {/* Espaço reservado para o ícone — sem cabeçalho */}
                    <th
                      className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35"
                      aria-hidden="true"
                    />

                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT ? "Marca" : "Brand"}
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT ? "Modelo" : "Model"}
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT ? "Número de série" : "Serial number"}
                    </th>

                    <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT ? "Garantia" : "Warranty"}
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEquipment.map((item) => {
                    const state = getWarrantyState(item);
                    const days = getDaysRemaining(item);

                    return (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.05] transition hover:bg-blue-500/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                            {getEquipmentIcon(item)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm font-medium text-white">
                            {item.brands?.name ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-white/65">
                            {item.model ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-sm text-white/55">
                            {item.serial_number ?? "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex flex-col items-start gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStateClasses(state)}`}
                            >
                              {getStateIcon(state)}
                              {getStateLabel(state)}
                            </span>

                            {item.warranty_end && (
                              <span className="text-xs text-white/35">
                                {formatDate(item.warranty_end)}
                                {" · "}
                                {days !== null && days >= 0
                                  ? isPT
                                    ? `${days} ${days === 1 ? "dia" : "dias"} restantes`
                                    : `${days} ${days === 1 ? "day" : "days"} remaining`
                                  : days !== null
                                    ? isPT
                                      ? `terminou há ${Math.abs(days)} ${Math.abs(days) === 1 ? "dia" : "dias"}`
                                      : `expired ${Math.abs(days)} ${Math.abs(days) === 1 ? "day" : "days"} ago`
                                    : ""}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
