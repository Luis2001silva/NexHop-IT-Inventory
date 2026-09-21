import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Bell,
  Box,
  CalendarDays,
  CheckCircle2,
  CircleAlert,
  Laptop,
  Monitor,
  Package,
  ShieldCheck,
  Wrench,
} from "lucide-react";

type EquipmentRow = {
  id: number;
  name: string | null;
  serial_number: string | null;
  brand_id: number | null;
  equipment_type_id: number | null;
  assigned_user: string | null;
  department_id: number | null;
  purchase_date: string | null;
  warranty_end: string | null;
  status: string | null;
  purchase_price: number | string | null;
  created_at: string | null;
};

type LookupRow = {
  id: number;
  name: string;
};

type ActivityRow = {
  id: string;
  description: string | null;
  action: string | null;
  created_at: string;
};

const Dashboard = () => {
  const { language } = useLanguage();
  const [period, setPeriod] = useState("year");

  const [equipmentRows, setEquipmentRows] = useState<EquipmentRow[]>([]);
  const [brands, setBrands] = useState<LookupRow[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<LookupRow[]>([]);
  const [departments, setDepartments] = useState<LookupRow[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const isPT = language === "pt";

  const text = {
    dashboard: "Dashboard",
    subtitle: isPT
      ? "Visão geral do departamento de IT"
      : "IT department overview",
    today: isPT ? "Hoje" : "Today",
    sevenDays: isPT ? "7 dias" : "7 days",
    fourteenDays: isPT ? "14 dias" : "14 days",
    thirtyDays: isPT ? "1 mês" : "1 month",
    threeMonths: isPT ? "3 meses" : "3 months",
    sixMonths: isPT ? "6 meses" : "6 months",
    year: isPT ? "Este ano" : "This year",
    equipment: isPT ? "Equipamentos" : "Equipment",
    assigned: isPT ? "Atribuídos" : "Assigned",
    available: isPT ? "Disponíveis" : "Available",
    maintenance: isPT ? "Em manutenção" : "In maintenance",
    inUse: isPT ? "Em uso" : "In use",
    other: isPT ? "Outros" : "Other",
    equipmentByType: isPT ? "Equipamentos por tipo" : "Equipment by type",
    equipmentByBrand: isPT ? "Equipamentos por marca" : "Equipment by brand",
    equipmentByDepartment: isPT
      ? "Equipamentos por departamento"
      : "Equipment by department",
    equipmentStatus: isPT ? "Estado dos equipamentos" : "Equipment status",
    itHealth: "IT Health",
    warranties: isPT ? "Garantias" : "Warranties",
    purchases: isPT ? "Equipamentos adquiridos" : "Equipment acquired",
    purchaseValue: isPT ? "Valor das compras" : "Purchase value",
    recentAlerts: isPT ? "Alertas recentes" : "Recent alerts",
    viewAll: isPT ? "Ver todos" : "View all",
    total: isPT ? "Total" : "Total",
    operational: isPT ? "Equipamento operacional" : "Operational equipment",
    assignedOf: isPT ? "equipamentos atribuídos" : "equipment assigned",
    warrantiesSoon: isPT
      ? "garantias a expirar (< 30 dias)"
      : "warranties expiring (< 30 days)",
    equipmentMaintenance: isPT
      ? "equipamentos em manutenção"
      : "equipment in maintenance",
    criticalRequests: isPT
      ? "pedidos críticos"
      : "critical requests",
    moreThan90: isPT ? "+90 dias" : "+90 days",
    from30to90: isPT ? "30 – 90 dias" : "30 – 90 days",
    lessThan30: isPT ? "< 30 dias" : "< 30 days",
    expired: isPT ? "Expirada" : "Expired",
    noAlerts: isPT ? "Sem alertas recentes" : "No recent alerts",
    loading: isPT ? "A carregar dados..." : "Loading data...",
    noData: isPT ? "Sem dados disponíveis" : "No data available",
    error: isPT
      ? "Não foi possível carregar os dados do Dashboard."
      : "Could not load Dashboard data.",
    jan: "Jan",
    feb: "Fev",
    mar: "Mar",
    apr: "Abr",
    may: "Mai",
    jun: "Jun",
    jul: "Jul",
    aug: "Ago",
    sep: "Set",
    oct: "Out",
    nov: "Nov",
    dec: "Dez",
  };

  const formatCurrency = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const readNumber = (value: number | string | null | undefined) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string" && value.trim()) {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }
    return 0;
  };

  const loadDashboard = async () => {
    setLoading(true);
    setLoadError("");

    const [
      equipmentResult,
      brandsResult,
      typesResult,
      departmentsResult,
      activityResult,
    ] = await Promise.all([
      (supabase as any)
        .from("equipment")
        .select(
          "id,name,serial_number,brand_id,equipment_type_id,assigned_user,department_id,purchase_date,warranty_end,status,purchase_price,created_at",
        )
        .order("created_at", { ascending: false }),
      (supabase as any)
        .from("brands")
        .select("id,name")
        .order("name"),
      (supabase as any)
        .from("equipment_types")
        .select("id,name")
        .order("name"),
      (supabase as any)
        .from("departments")
        .select("id,name")
        .order("name"),
      (supabase as any)
        .from("activity_logs")
        .select("id,description,action,created_at")
        .order("created_at", { ascending: false })
        .limit(8),
    ]);

    const firstError =
      equipmentResult.error ||
      brandsResult.error ||
      typesResult.error ||
      departmentsResult.error ||
      activityResult.error;

    if (firstError) {
      console.error("Dashboard load error:", firstError);
      setLoadError(firstError.message);
      setLoading(false);
      return;
    }

    setEquipmentRows((equipmentResult.data ?? []) as EquipmentRow[]);
    setBrands((brandsResult.data ?? []) as LookupRow[]);
    setEquipmentTypes((typesResult.data ?? []) as LookupRow[]);
    setDepartments((departmentsResult.data ?? []) as LookupRow[]);
    setActivityLogs((activityResult.data ?? []) as ActivityRow[]);
    setLoading(false);
  };

  useEffect(() => {
    void loadDashboard();

    const channel = supabase
      .channel("dashboard-equipment-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment" },
        () => {
          void loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "brands" },
        () => {
          void loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "equipment_types" },
        () => {
          void loadDashboard();
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "departments" },
        () => {
          void loadDashboard();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const equipmentStats = useMemo(() => {
    const total = equipmentRows.length;

    const maintenance = equipmentRows.filter(
      (equipment) =>
        equipment.status?.toLowerCase() === "maintenance",
    ).length;

    const assigned = equipmentRows.filter((equipment) => {
      const status = equipment.status?.toLowerCase();
      return Boolean(equipment.assigned_user) &&
        status !== "maintenance" &&
        status !== "decommissioned";
    }).length;

    const available = equipmentRows.filter((equipment) => {
      const status = equipment.status?.toLowerCase();
      return !equipment.assigned_user && status !== "maintenance" &&
        status !== "decommissioned";
    }).length;

    const other = Math.max(
      total - assigned - available - maintenance,
      0,
    );

    return { total, assigned, maintenance, available, other };
  }, [equipmentRows]);

  const brandMap = useMemo(
    () => new Map(brands.map((item) => [item.id, item.name])),
    [brands],
  );

  const typeMap = useMemo(
    () => new Map(equipmentTypes.map((item) => [item.id, item.name])),
    [equipmentTypes],
  );

  const departmentMap = useMemo(
    () => new Map(departments.map((item) => [item.id, item.name])),
    [departments],
  );

  const buildGroupedData = (
    rows: EquipmentRow[],
    getName: (equipment: EquipmentRow) => string,
    fallback: string,
  ) => {
    const counts: Record<string, number> = {};

    rows.forEach((equipment) => {
      const name = getName(equipment) || fallback;
      counts[name] = (counts[name] ?? 0) + 1;
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  };

  const typeData = useMemo(
    () =>
      buildGroupedData(
        equipmentRows,
        (equipment) =>
          equipment.equipment_type_id
            ? typeMap.get(equipment.equipment_type_id) ?? ""
            : "",
        isPT ? "Sem tipo" : "No type",
      ),
    [equipmentRows, typeMap, isPT],
  );

  const brandData = useMemo(
    () =>
      buildGroupedData(
        equipmentRows,
        (equipment) =>
          equipment.brand_id
            ? brandMap.get(equipment.brand_id) ?? ""
            : "",
        isPT ? "Sem marca" : "No brand",
      ),
    [equipmentRows, brandMap, isPT],
  );

  const departmentData = useMemo(
    () =>
      buildGroupedData(
        equipmentRows,
        (equipment) =>
          equipment.department_id
            ? departmentMap.get(equipment.department_id) ?? ""
            : "",
        isPT ? "Sem departamento" : "No department",
      ),
    [equipmentRows, departmentMap, isPT],
  );

  const warrantyStats = useMemo(() => {
    const now = new Date();

    let over90 = 0;
    let from30To90 = 0;
    let lessThan30 = 0;
    let expired = 0;

    equipmentRows.forEach((equipment) => {
      if (!equipment.warranty_end) return;

      const date = new Date(`${equipment.warranty_end}T23:59:59`);

      if (Number.isNaN(date.getTime())) return;

      const days =
        (date.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24);

      if (days < 0) expired += 1;
      else if (days < 30) lessThan30 += 1;
      else if (days <= 90) from30To90 += 1;
      else over90 += 1;
    });

    return {
      over90,
      from30To90,
      lessThan30,
      expired,
    };
  }, [equipmentRows]);

  const selectedYear = new Date().getFullYear();

  const monthLabels = [
    text.jan,
    text.feb,
    text.mar,
    text.apr,
    text.may,
    text.jun,
    text.jul,
    text.aug,
    text.sep,
    text.oct,
    text.nov,
    text.dec,
  ];

  const periodStart = useMemo(() => {
    const now = new Date();
    const start = new Date(now);

    if (period === "today") {
      start.setHours(0, 0, 0, 0);
    } else if (period === "7days") {
      start.setDate(start.getDate() - 6);
      start.setHours(0, 0, 0, 0);
    } else if (period === "14days") {
      start.setDate(start.getDate() - 13);
      start.setHours(0, 0, 0, 0);
    } else if (period === "30days") {
      // 1 mês = mês civil atual: 28/29/30/31 dias.
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (period === "3months") {
      start.setMonth(start.getMonth() - 2);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else if (period === "6months") {
      start.setMonth(start.getMonth() - 5);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
    } else {
      start.setMonth(0, 1);
      start.setHours(0, 0, 0, 0);
    }

    return start;
  }, [period]);

  const periodEquipment = useMemo(
    () =>
      equipmentRows.filter((equipment) => {
        if (!equipment.purchase_date) return false;

        const purchaseDate = new Date(
          `${equipment.purchase_date}T00:00:00`,
        );

        return purchaseDate >= periodStart;
      }),
    [equipmentRows, periodStart],
  );

  const acquiredChartData = useMemo(() => {
    const monthData = (months: number) =>
      Array.from({ length: months }, (_, index) => {
        const date = new Date(periodStart);
        date.setMonth(periodStart.getMonth() + index);
        date.setDate(1);

        return {
          month: date.toLocaleDateString(isPT ? "pt-PT" : "en-US", {
            month: "short",
          }),
          value: periodEquipment.filter((equipment) => {
            const purchaseDate = new Date(
              `${equipment.purchase_date as string}T00:00:00`,
            );

            return (
              purchaseDate.getFullYear() === date.getFullYear() &&
              purchaseDate.getMonth() === date.getMonth()
            );
          }).length,
        };
      });

    const dayData = (days: number) =>
      Array.from({ length: days }, (_, index) => {
        const date = new Date(periodStart);
        date.setDate(periodStart.getDate() + index);

        return {
          month: `${date.getDate().toString().padStart(2, "0")}/${(
            date.getMonth() + 1
          )
            .toString()
            .padStart(2, "0")}`,
          value: periodEquipment.filter((equipment) => {
            const purchaseDate = new Date(
              `${equipment.purchase_date as string}T00:00:00`,
            );

            return purchaseDate.toDateString() === date.toDateString();
          }).length,
        };
      });

    if (period === "year") return monthData(12);
    if (period === "6months") return monthData(6);
    if (period === "3months") return monthData(3);

    if (period === "30days") {
      const daysInMonth = new Date(
        periodStart.getFullYear(),
        periodStart.getMonth() + 1,
        0,
      ).getDate();

      return dayData(daysInMonth);
    }

    if (period === "14days") return dayData(14);
    if (period === "7days") return dayData(7);
    return dayData(1);
  }, [isPT, period, periodEquipment, periodStart]);

  const assignedPercentage =
    equipmentStats.total > 0
      ? Math.round(
          (equipmentStats.assigned / equipmentStats.total) * 100,
        )
      : 0;

  const operationalPercentage =
    equipmentStats.total > 0
      ? Math.round(
          ((equipmentStats.assigned + equipmentStats.available) /
            equipmentStats.total) *
            100,
        )
      : 0;

  const maxType = Math.max(...typeData.map((item) => item.value), 1);
  const maxBrand = Math.max(...brandData.map((item) => item.value), 1);
  const maxDepartment = Math.max(
    ...departmentData.map((item) => item.value),
    1,
  );

  const currentDate = new Intl.DateTimeFormat(
    isPT ? "pt-PT" : "en-GB",
    {
      weekday: "long",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    },
  ).format(new Date());

  const formatAlertTime = (date: string) =>
    new Intl.DateTimeFormat(isPT ? "pt-PT" : "en-GB", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));

  const alertItems = useMemo(() => {
    const items: {
      icon: typeof CircleAlert;
      title: string;
      time: string;
      type: "danger" | "warning" | "info";
    }[] = [];

    if (warrantyStats.lessThan30 > 0) {
      items.push({
        icon: CircleAlert,
        title: isPT
          ? `${warrantyStats.lessThan30} equipamento(s) com garantia a terminar nos próximos 30 dias`
          : `${warrantyStats.lessThan30} equipment warranty/warranties ending within 30 days`,
        time: isPT ? "Agora" : "Now",
        type: "danger",
      });
    }

    if (equipmentStats.maintenance > 0) {
      items.push({
        icon: Wrench,
        title: isPT
          ? `${equipmentStats.maintenance} equipamento(s) em manutenção`
          : `${equipmentStats.maintenance} equipment in maintenance`,
        time: isPT ? "Agora" : "Now",
        type: "warning",
      });
    }

    activityLogs.slice(0, 8 - items.length).forEach((activity) => {
      items.push({
        icon:
          activity.action?.toLowerCase().includes("delete") ||
          activity.action?.toLowerCase().includes("remove")
            ? CircleAlert
            : CheckCircle2,
        title:
          activity.description ||
          activity.action ||
          (isPT ? "Atividade registada" : "Recorded activity"),
        time: formatAlertTime(activity.created_at),
        type: "info",
      });
    });

    return items.slice(0, 8);
  }, [
    activityLogs,
    equipmentStats.maintenance,
    isPT,
    warrantyStats.lessThan30,
  ]);

  const periodButtons = [
    ["today", text.today],
    ["7days", text.sevenDays],
    ["14days", text.fourteenDays],
    ["30days", text.thirtyDays],
    ["3months", text.threeMonths],
    ["6months", text.sixMonths],
    ["year", text.year],
  ] as const;

  if (loading) {
    return (
      <div className="flex min-h-full items-center justify-center bg-transparent text-sm text-slate-500 dark:text-white/40">
        {text.loading}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="flex min-h-full items-center justify-center bg-transparent px-6 text-center text-sm text-red-300">
        <div>
          <CircleAlert className="mx-auto mb-3" size={24} />
          <p>{text.error}</p>
          <p className="mt-2 text-xs text-slate-500 dark:text-white/40">{loadError}</p>
          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-xs text-slate-900 dark:text-white hover:bg-blue-400"
          >
            {isPT ? "Tentar novamente" : "Try again"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full min-w-0 bg-transparent px-4 py-5 text-slate-900 dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1700px] space-y-4">
        {/* HEADER */}
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              {text.dashboard}
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-white/40">
              {text.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="hidden items-center gap-2 text-[11px] text-slate-500 dark:text-white/40 md:flex">
              <CalendarDays size={14} />
              <span className="capitalize">
                {currentDate}
              </span>
            </div>

            <div className="flex max-w-full overflow-x-auto rounded-lg border border-slate-300 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B1429]">
              {periodButtons.map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPeriod(key)}
                  className={`px-3 py-2 text-[11px] transition sm:px-4 ${
                    period === key
                      ? "bg-slate-200 text-slate-700 dark:bg-blue-500 dark:text-white"
                      : "text-slate-900 dark:text-white/45 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* KPI CARDS */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={Monitor}
            iconClass="bg-blue-500/10 text-blue-400"
            label={text.equipment}
            value={equipmentStats.total}
            footer={
              isPT
                ? "Total no inventário"
                : "Total in inventory"
            }
          />

          <StatCard
            icon={Laptop}
            iconClass="bg-blue-500/10 text-blue-400"
            label={text.assigned}
            value={equipmentStats.assigned}
            footer={
              isPT
                ? "Em utilização"
                : "In use"
            }
          />

          <StatCard
            icon={Package}
            iconClass="bg-emerald-500/10 text-emerald-400"
            label={text.available}
            value={equipmentStats.available}
            footer={
              isPT
                ? "Prontos a atribuir"
                : "Ready to assign"
            }
          />

          <StatCard
            icon={Wrench}
            iconClass="bg-red-500/10 text-red-400"
            label={text.maintenance}
            value={equipmentStats.maintenance}
            footer={
              isPT
                ? "Em reparação"
                : "Under repair"
            }
          />
        </div>

        {/* MAIN ROW */}
        <div className="grid gap-3 xl:grid-cols-3">
          {/* STATUS */}
          <DashboardCard title={text.equipmentStatus}>
            <div className="grid min-h-[205px] grid-cols-[145px_1fr] items-center gap-5">
              <Donut
                percentage={assignedPercentage}
                total={equipmentStats.total}
                centerLabel={text.total}
              />

              <div className="space-y-4">
                <LegendRow
                  label={text.inUse}
                  value={equipmentStats.assigned}
                  percentage={
                    equipmentStats.total
                      ? Math.round(
                          (equipmentStats.assigned /
                            equipmentStats.total) *
                            100,
                        )
                      : 0
                  }
                  dot="bg-blue-500"
                />

                <LegendRow
                  label={text.available}
                  value={equipmentStats.available}
                  percentage={
                    equipmentStats.total
                      ? Math.round(
                          (equipmentStats.available /
                            equipmentStats.total) *
                            100,
                        )
                      : 0
                  }
                  dot="bg-emerald-400"
                />

                <LegendRow
                  label={text.maintenance}
                  value={equipmentStats.maintenance}
                  percentage={
                    equipmentStats.total
                      ? Math.round(
                          (equipmentStats.maintenance /
                            equipmentStats.total) *
                            100,
                        )
                      : 0
                  }
                  dot="bg-amber-400"
                />

                <LegendRow
                  label={text.other}
                  value={equipmentStats.other}
                  percentage={
                    equipmentStats.total
                      ? Math.round(
                          (equipmentStats.other /
                            equipmentStats.total) *
                            100,
                        )
                      : 0
                  }
                  dot="bg-slate-400"
                />
              </div>
            </div>
          </DashboardCard>

          {/* ALERTS */}
          <DashboardCard
            title={text.recentAlerts}
            icon={Bell}
            iconClass="text-blue-400"
            right={
              <button
                type="button"
                onClick={() => {
                  window.location.href = "/logs";
                }}
                className="text-[11px] text-blue-400 transition hover:text-blue-300"
              >
                {text.viewAll} →
              </button>
            }
          >
            <div className="space-y-3">
              {alertItems.map((item) => {
                const Icon = item.icon;

                const iconClass =
                  item.type === "danger"
                    ? "text-red-400"
                    : item.type === "warning"
                      ? "text-amber-400"
                      : "text-blue-400";

                return (
                  <div
                    key={item.title}
                    className="flex items-center gap-2.5"
                  >
                    <Icon
                      size={15}
                      className={`shrink-0 ${iconClass}`}
                    />

                    <p className="min-w-0 flex-1 truncate text-[10px] text-slate-900 dark:text-white/65">
                      {item.title}
                    </p>

                    <span className="shrink-0 text-[9px] text-slate-900 dark:text-white/25">
                      {item.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </DashboardCard>
          {/* IT HEALTH */}
          <DashboardCard
            title={text.itHealth}
            icon={ShieldCheck}
            iconClass="text-emerald-400"
          >
            <div className="grid min-h-[205px] grid-cols-[130px_1fr] items-center gap-5">
              <Donut
                percentage={operationalPercentage}
                total={operationalPercentage}
                centerLabel={isPT ? "Operacional" : "Operational"}
                green
              />

              <div className="space-y-4">
                <HealthRow
                  icon={CheckCircle2}
                  iconClass="text-emerald-400"
                  text={`${equipmentStats.assigned} / ${equipmentStats.total} ${text.assignedOf}`}
                />

                <HealthRow
                  icon={CircleAlert}
                  iconClass="text-amber-400"
                  text={`${warrantyStats.lessThan30} ${text.warrantiesSoon}`}
                />

                <HealthRow
                  icon={Wrench}
                  iconClass="text-amber-400"
                  text={`${equipmentStats.maintenance} ${text.equipmentMaintenance}`}
                />

                <HealthRow
                  icon={CheckCircle2}
                  iconClass="text-emerald-400"
                  text={`0 ${text.criticalRequests}`}
                />
              </div>
            </div>
          </DashboardCard>
        </div>

        {/* SECOND ROW */}
        <div className="grid gap-3 xl:grid-cols-3">
          <DashboardCard title={text.equipmentByBrand}>
            <div className="space-y-3">
              {brandData.length === 0 ? (
                <EmptyState isPT={isPT} />
              ) : (
                brandData.map((item) => (
                  <HorizontalBar
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    max={maxBrand}
                  />
                ))
              )}
            </div>
          </DashboardCard>

          <DashboardCard title={text.equipmentByDepartment}>
            <div className="space-y-3">
              {departmentData.length === 0 ? (
                <EmptyState isPT={isPT} />
              ) : (
                departmentData.map((item) => (
                  <HorizontalBar
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    max={maxDepartment}
                    purple
                  />
                ))
              )}
            </div>
          </DashboardCard>

          {/* EQUIPMENT TYPE */}
          <DashboardCard
            title={isPT ? "Tipo de equipamento" : "Equipment type"}
            icon={Box}
            iconClass="text-blue-400"
          >
            <div className="space-y-3">
              {typeData.length === 0 ? (
                <EmptyState isPT={isPT} />
              ) : (
                typeData.map((item) => (
                  <HorizontalBar
                    key={item.name}
                    name={item.name}
                    value={item.value}
                    max={maxType}
                  />
                ))
              )}
            </div>
          </DashboardCard>

        </div>

        {/* BOTTOM ROW */}
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          {/* ACQUIRED */}
          <DashboardCard
            title={text.purchases}
            right={
              <span className="text-[11px] text-slate-900 dark:text-white/35">
                {isPT ? "Total" : "Total"}:{" "}
                <span className="text-slate-900 dark:text-white/70">
                  {acquiredChartData.reduce(
                    (sum, item) => sum + item.value,
                    0,
                  )}
                </span>
              </span>
            }
          >
            <MiniLineChart
              data={acquiredChartData}
            />
          </DashboardCard>

          {/* PURCHASE VALUE */}


          <DashboardCard
            title={text.warranties}
            icon={ShieldCheck}
            iconClass="text-emerald-400"
          >
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4">
              <WarrantyCard
                label={text.moreThan90}
                value={warrantyStats.over90}
                className="border-emerald-400/30 bg-emerald-500/[0.06] text-emerald-400"
              />

              <WarrantyCard
                label={text.from30to90}
                value={warrantyStats.from30To90}
                className="border-amber-400/30 bg-amber-500/[0.06] text-amber-400"
              />

              <WarrantyCard
                label={text.lessThan30}
                value={warrantyStats.lessThan30}
                className="border-red-400/30 bg-red-500/[0.06] text-red-400"
              />

              <WarrantyCard
                label={text.expired}
                value={warrantyStats.expired}
                className="border-slate-400/20 bg-slate-500/[0.06] text-slate-300"
              />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   COMPONENTS
========================================================= */

type StatCardProps = {
  icon: typeof Monitor;
  iconClass: string;
  label: string;
  value: number | string;
  footer: string;
 };

const StatCard = ({
  icon: Icon,
  iconClass,
  label,
  value,
  footer,
}: StatCardProps) => {
  return (
    <div className="rounded-xl border border-slate-300 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B1429] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] text-slate-900 dark:text-white/45">
            {label}
          </p>

          <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
            {value}
          </p>

          <div className="mt-1 flex items-center gap-2">
            <p className="text-[9px] text-slate-500 dark:text-white/40">
              {footer}
            </p>


          </div>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconClass}`}
        >
          <Icon size={17} />
        </div>
      </div>
    </div>
  );
};

type DashboardCardProps = {
  title: string;
  children: React.ReactNode;
  icon?: typeof ShieldCheck;
  iconClass?: string;
  right?: React.ReactNode;
};

const DashboardCard = ({
  title,
  children,
  icon: Icon,
  iconClass = "text-blue-400",
  right,
}: DashboardCardProps) => {
  return (
    <section className="rounded-xl border border-slate-300 dark:border-white/[0.08] bg-[#F8FAFC] dark:bg-[#0B1429] p-4 shadow-[0_4px_16px_rgba(15,23,42,0.06)] dark:shadow-[0_12px_40px_rgba(0,0,0,0.18)]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && (
            <Icon
              size={15}
              className={`shrink-0 ${iconClass}`}
            />
          )}

          <h2 className="truncate text-[12px] font-semibold text-slate-900 dark:text-white/85">
            {title}
          </h2>
        </div>

        {right}
      </div>

      {children}
    </section>
  );
};

const Ring = ({
  percentage,
  small = false,
  green = false,
}: {
  percentage: number;
  small?: boolean;
  green?: boolean;
}) => {
  const size = small ? 48 : 125;
  const stroke = small ? 4 : 7;
  const radius = (size - stroke) / 2;
  const circumference =
    2 * Math.PI * radius;
  const offset =
    circumference -
    (Math.min(Math.max(percentage, 0), 100) /
      100) *
      circumference;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="rgba(255,255,255,0.07)"
        strokeWidth={stroke}
      />

      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke={green ? "#34D399" : "#3B82F6"}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
};

const Donut = ({
  percentage,
  total,
  centerLabel,
  green = false,
}: {
  percentage: number;
  total: number;
  centerLabel: string;
  green?: boolean;
}) => {
  return (
    <div className="relative mx-auto h-[125px] w-[125px]">
      <Ring
        percentage={percentage}
        green={green}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-xl font-semibold text-slate-900 dark:text-white">
          {green ? `${percentage}%` : total}
        </span>

        <span className="text-[8px] uppercase tracking-wider text-slate-500 dark:text-white/40">
          {centerLabel}
        </span>
      </div>
    </div>
  );
};

const LegendRow = ({
  label,
  value,
  percentage,
  dot,
}: {
  label: string;
  value: number;
  percentage: number;
  dot: string;
}) => {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`h-2 w-2 shrink-0 rounded-full ${dot}`}
      />

      <span className="min-w-0 flex-1 truncate text-[10px] text-slate-900 dark:text-white/55">
        {label}
      </span>

      <span className="text-[10px] font-medium text-slate-900 dark:text-white/75">
        {value}
      </span>

      <span className="w-7 text-right text-[9px] text-slate-900 dark:text-white/25">
        {percentage}%
      </span>
    </div>
  );
};

const HealthRow = ({
  icon: Icon,
  iconClass,
  text,
}: {
  icon: typeof CheckCircle2;
  iconClass: string;
  text: string;
}) => {
  return (
    <div className="flex items-start gap-2">
      <Icon
        size={14}
        className={`mt-0.5 shrink-0 ${iconClass}`}
      />

      <span className="text-[10px] leading-4 text-slate-900 dark:text-white/55">
        {text}
      </span>
    </div>
  );
};

const HorizontalBar = ({
  name,
  value,
  max,
  purple = false,
}: {
  name: string;
  value: number;
  max: number;
  purple?: boolean;
}) => {
  const width =
    max > 0 ? Math.max((value / max) * 100, 4) : 0;

  return (
    <div className="flex items-center gap-2">
      <span className="w-[72px] shrink-0 truncate text-[10px] text-slate-900 dark:text-white/55">
        {name}
      </span>

      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
          style={{
            width: `${width}%`,
          }}
          title={`${name}: ${value} ${
            value === 1
              ? "equipamento"
              : "equipamentos"
          }`}
        />
      </div>

      <span className="w-7 text-right text-[10px] text-slate-900 dark:text-white/60">
        {value}
      </span>
    </div>
  );
};

const WarrantyCard = ({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className: string;
}) => {
  return (
    <div
      className={`rounded-lg border p-3 ${className}`}
    >
      <div className="text-[9px] text-slate-900 dark:text-white/60">
        {label}
      </div>

      <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
};

const MiniLineChart = ({
  data,
}: {
  data: { month: string; value: number }[];
}) => {
  const width = 520;
  const height = 125;
  const paddingX = 10;
  const paddingY = 10;

  const max = Math.max(
    ...data.map((item) => item.value),
    1,
  );

  const min = Math.min(
    ...data.map((item) => item.value),
    0,
  );

  const range = Math.max(max - min, 1);

  const points = data
    .map((item, index) => {
      const x =
        paddingX +
        (index / Math.max(data.length - 1, 1)) *
          (width - paddingX * 2);

      const y =
        height -
        paddingY -
        ((item.value - min) / range) *
          (height - paddingY * 2);

      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="space-y-2">
      <div className="h-[135px] w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          className="h-full w-full"
        >
          <defs>
            <linearGradient
              id="dashboard-line-fill"
              x1="0"
              x2="0"
              y1="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="#3B82F6"
                stopOpacity="0.28"
              />
              <stop
                offset="100%"
                stopColor="#3B82F6"
                stopOpacity="0"
              />
            </linearGradient>
          </defs>

          <polygon
            points={`${paddingX},${height - paddingY} ${points} ${
              width - paddingX
            },${height - paddingY}`}
            fill="url(#dashboard-line-fill)"
          />

          <polyline
            points={points}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {data.map((item, index) => {
            const x =
              paddingX +
              (index / Math.max(data.length - 1, 1)) *
                (width - paddingX * 2);

            const y =
              height -
              paddingY -
              ((item.value - min) / range) *
                (height - paddingY * 2);

            return (
              <circle
                key={`${item.month}-${index}`}
                cx={x}
                cy={y}
                r="3"
                fill="#3B82F6"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex justify-between px-1">
        {data.map((item) => (
          <span
            key={item.month}
            className="text-[8px] text-slate-900 dark:text-white/25"
          >
            {item.month}
          </span>
        ))}
      </div>
    </div>
  );
};

const EmptyState = ({
  isPT,
}: {
  isPT: boolean;
}) => {
  return (
    <div className="flex min-h-[170px] items-center justify-center text-center">
      <div>
        <Box
          size={22}
          className="mx-auto text-slate-400 dark:text-white/30"
        />

        <p className="mt-2 text-[10px] text-slate-500 dark:text-white/40">
          {isPT
            ? "Sem dados disponíveis"
            : "No data available"}
        </p>
      </div>
    </div>
  );
};

export default Dashboard;