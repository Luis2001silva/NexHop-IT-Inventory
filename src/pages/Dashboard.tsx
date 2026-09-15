import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { mockEquipment, mockInvoices } from "@/utils/mockData";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

import {
  Monitor,
  Box,
  Activity,
  Bell,
  Zap,
  ShieldCheck,
  LockKeyhole,
  Radio,
} from "lucide-react";

const Dashboard = () => {
  const { language } = useLanguage();
  const { user } = useAuth();

  const [equipmentStats, setEquipmentStats] = useState({
    total: 0,
    active: 0,
    maintenance: 0,
    inactive: 0,
  });

  useEffect(() => {
    const stats = {
      total: mockEquipment.length,
      active: mockEquipment.filter((e) => e.status === "active").length,
      maintenance: mockEquipment.filter((e) => e.status === "maintenance")
        .length,
      inactive:
        mockEquipment.filter((e) => e.status === "inactive").length +
        mockEquipment.filter((e) => e.status === "decommissioned").length,
    };

    setEquipmentStats(stats);
  }, []);

  const equipmentStatusData = [
    {
      name: language === "pt" ? "Ativo" : "Active",
      value: equipmentStats.active,
    },
    {
      name: language === "pt" ? "Manutenção" : "Maintenance",
      value: equipmentStats.maintenance,
    },
    {
      name: language === "pt" ? "Inativo" : "Inactive",
      value: equipmentStats.inactive,
    },
  ];

  const equipmentByBrand = mockEquipment.reduce(
    (acc, curr) => {
      if (acc[curr.brand]) {
        acc[curr.brand] += 1;
      } else {
        acc[curr.brand] = 1;
      }

      return acc;
    },
    {} as Record<string, number>,
  );

  const brandChartData = Object.entries(equipmentByBrand).map(
    ([brand, count]) => ({
      name: brand,
      count,
    }),
  );

  const totalInvestment = mockInvoices.reduce(
    (sum, invoice) => sum + invoice.totalAmount,
    0,
  );

  const COLORS = ["#2563EB", "#8B5CF6", "#64748B"];

  const formatCurrency = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  });

  const recentActivity =
    language === "pt"
      ? [
          {
            icon: Monitor,
            title: "MacBook Pro registado",
            time: "2 min atrás",
            type: "blue",
          },
          {
            icon: ShieldCheck,
            title: "Garantia atualizada",
            time: "18 min atrás",
            type: "green",
          },
          {
            icon: Bell,
            title: "Alerta de rede resolvido",
            time: "1 h atrás",
            type: "purple",
          },
        ]
      : [
          {
            icon: Monitor,
            title: "MacBook Pro enrolled",
            time: "2 min ago",
            type: "blue",
          },
          {
            icon: ShieldCheck,
            title: "Security baseline updated",
            time: "18 min ago",
            type: "green",
          },
          {
            icon: Bell,
            title: "Network alert resolved",
            time: "1h ago",
            type: "purple",
          },
        ];

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8">
      <div className="space-y-6">
        {/* PAGE HEADER */}

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              {language === "pt"
                ? "Visão geral das operações"
                : "Operations overview"}
            </h1>

            <p className="mt-1 text-sm text-white/45">
              {language === "pt"
                ? "Visibilidade em tempo real sobre todo o teu ambiente IT."
                : "Real-time visibility across your IT estate."}
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1.5 text-[11px] text-blue-400">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            {language === "pt" ? "Sistema operacional" : "Live system status"}
          </div>
        </div>

        {/* STAT CARDS */}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* MANAGED ENDPOINTS */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/45">
                  {language === "pt"
                    ? "Equipamentos geridos"
                    : "Managed endpoints"}
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {equipmentStats.total}
                </p>

                <p className="mt-1 text-[11px] text-emerald-400">
                  +12.5% {language === "pt" ? "este mês" : "this month"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
              >
                <Monitor size={16} />
              </div>
            </div>
          </div>

          {/* TRACKED ASSETS */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/45">
                  {language === "pt"
                    ? "Ativos monitorizados"
                    : "Tracked assets"}
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  {equipmentStats.total}
                </p>

                <p className="mt-1 text-[11px] text-emerald-400">
                  +8.2% {language === "pt" ? "este mês" : "this month"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
              >
                <Box size={16} />
              </div>
            </div>
          </div>

          {/* UPTIME */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/45">
                  {language === "pt" ? "Disponibilidade" : "Service uptime"}
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">99.98%</p>

                <p className="mt-1 text-[11px] text-emerald-400">
                  +0.14% {language === "pt" ? "este mês" : "this month"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
              >
                <Activity size={16} />
              </div>
            </div>
          </div>

          {/* OPEN CLIENTS */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-white/45">
                  {language === "pt" ? "Pedidos abertos" : "Open clients"}
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">18</p>

                <p className="mt-1 text-[11px] text-emerald-400">
                  ↓ 23% {language === "pt" ? "desde ontem" : "from yesterday"}
                </p>
              </div>

              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400"
              >
                <Bell size={16} />
              </div>
            </div>
          </div>
        </div>

        {/* CHARTS */}

        <div className="grid gap-4 xl:grid-cols-2">
          {/* ASSET DISTRIBUTION */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {language === "pt"
                    ? "Distribuição de ativos"
                    : "Asset distribution"}
                </h2>

                <p className="mt-1 text-[11px] text-white/35">
                  {language === "pt" ? "Este mês" : "This month"}
                </p>
              </div>
            </div>

            <div className="relative h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={equipmentStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {equipmentStatusData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div
                className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
              >
                <div className="text-xl font-semibold text-white">
                  {equipmentStats.total}
                </div>

                <div className="text-[9px] uppercase tracking-wide text-white/35">
                  {language === "pt" ? "ativos" : "assets"}
                </div>
              </div>
            </div>

            {/* LEGEND */}

            <div className="grid grid-cols-3 gap-3">
              {equipmentStatusData.map((item, index) => (
                <div key={item.name} className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />

                  <div>
                    <div className="text-[11px] text-white/60">{item.name}</div>

                    <div className="text-[10px] text-white/30">
                      {equipmentStats.total > 0
                        ? Math.round((item.value / equipmentStats.total) * 100)
                        : 0}
                      %
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* INFRASTRUCTURE SPEND */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  {language === "pt"
                    ? "Investimento mensal em infraestrutura"
                    : "Monthly infrastructure spend"}
                </h2>

                <div className="mt-1 text-2xl font-semibold text-white">
                  {formatCurrency.format(totalInvestment)}
                </div>
              </div>

              <div
                className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] text-emerald-400"
              >
                +8.4%
              </div>
            </div>

            <div className="mt-4 h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    {
                      month: "Jan",
                      value: 32000,
                    },
                    {
                      month: "Fev",
                      value: 41000,
                    },
                    {
                      month: "Mar",
                      value: 35000,
                    },
                    {
                      month: "Abr",
                      value: 48000,
                    },
                    {
                      month: "Mai",
                      value: 44000,
                    },
                    {
                      month: "Jun",
                      value: 52000,
                    },
                  ]}
                  barCategoryGap="25%"
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{
                      fill: "rgba(255,255,255,0.35)",
                      fontSize: 10,
                    }}
                  />

                  <YAxis hide />

                  <Tooltip
                    cursor={{
                      fill: "rgba(255,255,255,0.03)",
                    }}
                    contentStyle={{
                      backgroundColor: "#111827",
                      border: "1px solid rgba(255,255,255,0.08)",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: "12px",
                    }}
                    formatter={(value: number) => formatCurrency.format(value)}
                  />

                  <Bar dataKey="value" fill="#2563EB" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}

        <div className="grid gap-4 xl:grid-cols-2">
          {/* RECENT ACTIVITY */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {language === "pt" ? "Atividade recente" : "Recent activity"}
              </h2>

              <button className="text-[11px] text-blue-400 hover:text-blue-300">
                {language === "pt" ? "Ver tudo" : "View all"}
              </button>
            </div>

            <div className="space-y-4">
              {recentActivity.map((activity) => {
                const Icon = activity.icon;

                return (
                  <div key={activity.title} className="flex items-center gap-3">
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        activity.type === "blue"
                          ? "bg-blue-500/10 text-blue-400"
                          : activity.type === "green"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-purple-500/10 text-purple-400"
                      }`}
                    >
                      <Icon size={15} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-white/75">{activity.title}</p>
                    </div>

                    <span className="text-[10px] text-white/30">
                      {activity.time}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TEAM ACHIEVEMENTS */}

          <div
            className="rounded-xl border border-white/[0.07] bg-[#0D1730] p-5"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                {language === "pt"
                  ? "Conquistas da equipa"
                  : "Team achievements"}
              </h2>

              <span className="text-[11px] text-blue-400">
                4 {language === "pt" ? "desbloqueadas" : "unlocked"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {/* AUTOMATED */}

              <div className="text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white"
                >
                  <Zap size={18} />
                </div>

                <p className="mt-2 text-[10px] text-white/50">
                  {language === "pt" ? "Automatizado" : "Automated"}
                </p>
              </div>

              {/* SECURE */}

              <div className="text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500 text-white"
                >
                  <ShieldCheck size={18} />
                </div>

                <p className="mt-2 text-[10px] text-white/50">
                  {language === "pt" ? "Seguro" : "Secure"}
                </p>
              </div>

              {/* RELIABLE */}

              <div className="text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500 text-white"
                >
                  <LockKeyhole size={18} />
                </div>

                <p className="mt-2 text-[10px] text-white/50">
                  {language === "pt" ? "Fiável" : "Reliable"}
                </p>
              </div>

              {/* RESPONSIVE */}

              <div className="text-center">
                <div
                  className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500 text-white"
                >
                  <Radio size={18} />
                </div>

                <p className="mt-2 text-[10px] text-white/50">
                  {language === "pt" ? "Responsivo" : "Responsive"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
