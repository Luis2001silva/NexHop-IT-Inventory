import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Building2,
  CalendarDays,
  ChevronDown,
  Laptop,
  MapPin,
  Monitor,
  Package,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";

type Equipment = {
  id: number;
  model: string | null;
  name: string | null;
  status: string | null;
  assigned_user: string | null;
  department_id: number | null;
  location_id: number | null;
  brand_id: number | null;
  equipment_type_id: number | null;
  purchase_date: string | null;
  created_at: string | null;
};

type Maintenance = {
  id: number;
  equipment_id: number | null;
  maintenance_date: string | null;
  description: string | null;
  cost: number | null;
};

type Lookup = { id: number; name: string };

type Profile = {
  id: string;
  full_name: string | null;
  email: string;
};

const card = "rounded-xl border border-white/[0.06] bg-[#0D1730]";
const input =
  "h-10 rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-slate-300 outline-none focus:border-blue-500/40";

export default function ReportsPage() {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
  const [brands, setBrands] = useState<Lookup[]>([]);
  const [locations, setLocations] = useState<Lookup[]>([]);
  const [types, setTypes] = useState<Lookup[]>([]);
  const [departments, setDepartments] = useState<Lookup[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [period, setPeriod] = useState("all");
  const [department, setDepartment] = useState("all");
  const [location, setLocation] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState("");

  useEffect(() => {
    async function load() {
      setLoading(true);

      const [
        equipmentRes,
        maintenanceRes,
        brandsRes,
        locationsRes,
        typesRes,
        departmentsRes,
        profilesRes,
      ] = await Promise.all([
        supabase
          .from("equipment")
          .select(
            "id, model, name, status, assigned_user, department_id, location_id, brand_id, equipment_type_id, purchase_date, created_at"
          ),
        supabase
          .from("maintenance")
          .select("id, equipment_id, maintenance_date, description, cost"),
        supabase.from("brands").select("id, name").order("name"),
        supabase.from("locations").select("id, name").order("name"),
        supabase.from("equipment_types").select("id, name").order("name"),
        supabase.from("departments").select("id, name").order("name"),
        supabase
          .from("profiles")
          .select("id, full_name, email")
          .order("full_name"),
      ]);

      if (equipmentRes.data) setEquipment(equipmentRes.data as Equipment[]);
      if (maintenanceRes.data)
        setMaintenance(maintenanceRes.data as Maintenance[]);
      if (brandsRes.data) setBrands(brandsRes.data as Lookup[]);
      if (locationsRes.data) setLocations(locationsRes.data as Lookup[]);
      if (typesRes.data) setTypes(typesRes.data as Lookup[]);
      if (departmentsRes.data)
        setDepartments(departmentsRes.data as Lookup[]);
      if (profilesRes.data) setProfiles(profilesRes.data as Profile[]);

      setLoading(false);
    }

    load();
  }, []);

  const brandMap = useMemo(
    () => new Map(brands.map((x) => [x.id, x.name])),
    [brands]
  );
  const locationMap = useMemo(
    () => new Map(locations.map((x) => [x.id, x.name])),
    [locations]
  );
  const typeMap = useMemo(
    () => new Map(types.map((x) => [x.id, x.name])),
    [types]
  );
  const departmentMap = useMemo(
    () => new Map(departments.map((x) => [x.id, x.name])),
    [departments]
  );

  const filteredEquipment = useMemo(() => {
    const now = new Date();

    return equipment.filter((item) => {
      const matchesDepartment =
        department === "all" || String(item.department_id) === department;

      const matchesLocation =
        location === "all" || String(item.location_id) === location;

      let matchesPeriod = true;

      if (period !== "all" && item.created_at) {
        const created = new Date(item.created_at).getTime();
        const days = period === "7" ? 7 : period === "30" ? 30 : 365;
        matchesPeriod = now.getTime() - created <= days * 86400000;
      }

      return matchesDepartment && matchesLocation && matchesPeriod;
    });
  }, [equipment, department, location, period]);

  const countBy = (values: string[]) => {
    const counts = new Map<string, number>();
    values.forEach((value) => {
      counts.set(value, (counts.get(value) || 0) + 1);
    });
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
  };

  const byLocation = countBy(
    filteredEquipment.map(
      (x) =>
        locationMap.get(x.location_id ?? -1) ||
        (isPT ? "Sem localização" : "No location")
    )
  );

  const byDepartment = countBy(
    filteredEquipment.map(
      (x) =>
        departmentMap.get(x.department_id ?? -1) ||
        (isPT ? "Sem departamento" : "No department")
    )
  );

  const byModel = countBy(
    filteredEquipment.map(
      (x) => x.model || x.name || (isPT ? "Sem modelo" : "No model")
    )
  );

  const byBrand = countBy(
    filteredEquipment.map(
      (x) =>
        brandMap.get(x.brand_id ?? -1) ||
        (isPT ? "Sem marca" : "No brand")
    )
  );

  const byType = countBy(
    filteredEquipment.map(
      (x) =>
        typeMap.get(x.equipment_type_id ?? -1) ||
        (isPT ? "Sem tipo" : "No type")
    )
  );

  const byStatus = countBy(
    filteredEquipment.map(
      (x) => x.status || (isPT ? "Sem estado" : "No status")
    )
  );

  const totalEquipment = filteredEquipment.length;
  const assignedEquipment = filteredEquipment.filter(
    (x) => !!x.assigned_user
  ).length;
  const unassignedEquipment = totalEquipment - assignedEquipment;
  const totalMaintenance = maintenance.length;
  const maintenanceCost = maintenance.reduce(
    (sum, x) => sum + Number(x.cost || 0),
    0
  );

  const userResults = profiles.filter((profile) => {
    const term = userSearch.toLowerCase().trim();
    if (!term) return true;

    return (
      (profile.full_name || "").toLowerCase().includes(term) ||
      profile.email.toLowerCase().includes(term)
    );
  });

  const selectedProfile = profiles.find((x) => x.id === selectedUser);

  const userEquipment = selectedUser
    ? equipment.filter((x) => x.assigned_user === selectedUser)
    : [];

  const userMaintenance = selectedUser
    ? maintenance.filter((m) =>
        userEquipment.some((e) => e.id === m.equipment_id)
      )
    : [];

  const userDepartment =
    departmentMap.get(userEquipment[0]?.department_id ?? -1) || "—";

  const latestEquipment = [...userEquipment].sort((a, b) => {
    return (
      new Date(b.purchase_date || b.created_at || 0).getTime() -
      new Date(a.purchase_date || a.created_at || 0).getTime()
    );
  });

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 text-white lg:px-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT ? "Relatórios" : "Reports"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            {isPT
              ? "Dados e indicadores calculados diretamente a partir do inventário."
              : "Data and indicators calculated directly from the inventory."}
          </p>
        </div>

        <div className="flex flex-col gap-3 xl:flex-row">
          <FilterSelect
            icon={CalendarDays}
            value={period}
            onChange={setPeriod}
            options={[
              ["all", isPT ? "Todos" : "All"],
              ["7", isPT ? "7 dias" : "7 days"],
              ["30", isPT ? "30 dias" : "30 days"],
              ["365", isPT ? "1 ano" : "1 year"],
            ]}
          />

          <FilterSelect
            icon={Building2}
            value={department}
            onChange={setDepartment}
            options={[
              ["all", isPT ? "Todos" : "All"],
              ...departments.map((x) => [String(x.id), x.name] as [string, string]),
            ]}
          />

          <FilterSelect
            icon={MapPin}
            value={location}
            onChange={setLocation}
            options={[
              ["all", isPT ? "Todos" : "All"],
              ...locations.map((x) => [String(x.id), x.name] as [string, string]),
            ]}
          />
        </div>

        {loading ? (
          <div className={`${card} p-10 text-center text-sm text-slate-400`}>
            {isPT ? "A carregar dados..." : "Loading data..."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <Stat
                icon={Package}
                label={isPT ? "Equipamentos" : "Equipment"}
                value={totalEquipment}
              />
              <Stat
                icon={UserRound}
                label={isPT ? "Atribuídos" : "Assigned"}
                value={assignedEquipment}
              />
              <Stat
                icon={Laptop}
                label={isPT ? "Disponíveis" : "Available"}
                value={unassignedEquipment}
              />
              <Stat
                icon={Wrench}
                label={isPT ? "Manutenções" : "Maintenance"}
                value={totalMaintenance}
              />
            </div>

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <DistributionCard
                title={isPT ? "Equipamentos por localização" : "Equipment by location"}
                icon={MapPin}
                data={byLocation}
                empty={isPT ? "Sem dados." : "No data."}
              />
              <DistributionCard
                title={isPT ? "Equipamentos por departamento" : "Equipment by department"}
                icon={Building2}
                data={byDepartment}
                empty={isPT ? "Sem dados." : "No data."}
              />
              <DistributionCard
                title={isPT ? "Equipamentos por modelo" : "Equipment by model"}
                icon={Monitor}
                data={byModel}
                empty={isPT ? "Sem dados." : "No data."}
              />
              <DistributionCard
                title={isPT ? "Equipamentos por marca" : "Equipment by brand"}
                icon={BarChart3}
                data={byBrand}
                empty={isPT ? "Sem dados." : "No data."}
              />
              <DistributionCard
                title={isPT ? "Equipamentos por tipo" : "Equipment by type"}
                icon={Package}
                data={byType}
                empty={isPT ? "Sem dados." : "No data."}
              />
              <DistributionCard
                title={isPT ? "Equipamentos por estado" : "Equipment by status"}
                icon={BarChart3}
                data={byStatus}
                empty={isPT ? "Sem dados." : "No data."}
              />
            </div>

            <div className={`${card} p-5`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">
                    {isPT ? "Resumo de manutenção" : "Maintenance summary"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isPT
                      ? "Valores existentes na tabela de manutenção."
                      : "Values available in the maintenance table."}
                  </p>
                </div>
                <Wrench className="text-blue-400" size={20} />
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Mini
                  label={isPT ? "Registos" : "Records"}
                  value={maintenance.length}
                />
                <Mini
                  label={isPT ? "Custo total" : "Total cost"}
                  value={`${maintenanceCost.toFixed(2)} €`}
                />
                <Mini
                  label={isPT ? "Com equipamento associado" : "With linked equipment"}
                  value={maintenance.filter((x) => x.equipment_id).length}
                />
              </div>
            </div>

            <div className={`${card} p-5`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-semibold">
                    {isPT ? "Relatório por utilizador" : "User report"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {isPT
                      ? "Equipamento atualmente atribuído e histórico disponível."
                      : "Currently assigned equipment and available history."}
                  </p>
                </div>

                <div className="relative w-full lg:w-80">
                  <Search
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                  />
                  <input
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder={isPT ? "Pesquisar utilizador..." : "Search user..."}
                    className={`${input} w-full pl-9`}
                  />
                </div>
              </div>

              <div className="mt-4 grid gap-2">
                {userResults.slice(0, 5).map((profile) => (
                  <button
                    type="button"
                    key={profile.id}
                    onClick={() => setSelectedUser(profile.id)}
                    className={`flex items-center justify-between rounded-lg border px-4 py-3 text-left transition ${
                      selectedUser === profile.id
                        ? "border-blue-500/30 bg-blue-500/10"
                        : "border-white/[0.05] bg-[#0A1328] hover:bg-[#101B36]"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-200">
                        {profile.full_name || (isPT ? "Sem nome" : "No name")}
                      </p>
                      <p className="text-xs text-slate-500">{profile.email}</p>
                    </div>
                    <span className="text-xs text-slate-500">
                      {equipment.filter((x) => x.assigned_user === profile.id).length}{" "}
                      {isPT ? "equipamentos" : "equipment"}
                    </span>
                  </button>
                ))}
              </div>

              {selectedProfile && (
                <div className="mt-5 rounded-xl border border-white/[0.06] bg-[#0A1328] p-5">
                  <div>
                    <p className="text-lg font-semibold">
                      {selectedProfile.full_name || (isPT ? "Sem nome" : "No name")}
                    </p>
                    <p className="text-sm text-slate-500">{selectedProfile.email}</p>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4">
                    <Mini
                      label={isPT ? "Equipamento atual" : "Current equipment"}
                      value={userEquipment.length}
                    />
                    <Mini
                      label={isPT ? "Manutenções" : "Maintenance"}
                      value={userMaintenance.length}
                    />
                    <Mini
                      label={isPT ? "Departamento" : "Department"}
                      value={userDepartment}
                    />
                    <Mini
                      label={isPT ? "Último equipamento" : "Latest equipment"}
                      value={
                        latestEquipment[0]?.model ||
                        latestEquipment[0]?.name ||
                        "—"
                      }
                    />
                  </div>

                  <div className="mt-5">
                    <p className="mb-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                      {isPT ? "Equipamento atribuído" : "Assigned equipment"}
                    </p>
                    <div className="space-y-2">
                      {userEquipment.length === 0 ? (
                        <p className="text-sm text-slate-500">
                          {isPT
                            ? "Nenhum equipamento atribuído."
                            : "No equipment assigned."}
                        </p>
                      ) : (
                        userEquipment.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between rounded-lg border border-white/[0.05] bg-[#0D1730] px-4 py-3"
                          >
                            <div>
                              <p className="text-sm text-slate-200">
                                {item.model || item.name || (isPT ? "Equipamento" : "Equipment")}
                              </p>
                              <p className="text-xs text-slate-500">
                                {isPT ? "Atribuído desde" : "Assigned since"}{" "}
                                {item.purchase_date ||
                                  (isPT ? "data não disponível" : "date unavailable")}
                              </p>
                            </div>
                            <span className="text-xs text-slate-500">
                              {item.status || (isPT ? "Sem estado" : "No status")}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Package;
  label: string;
  value: number;
}) {
  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon size={19} />
        </div>
        <span className="text-2xl font-semibold">{value}</span>
      </div>
      <p className="mt-4 text-sm text-slate-400">{label}</p>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-[#0D1730] p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-200">{value}</p>
    </div>
  );
}

function DistributionCard({
  title,
  icon: Icon,
  data,
  empty,
}: {
  title: string;
  icon: typeof Package;
  data: [string, number][];
  empty: string;
}) {
  const max = Math.max(...data.map((x) => x[1]), 1);

  return (
    <div className={`${card} p-5`}>
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
          <Icon size={18} />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </div>

      <div className="mt-5 space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-slate-500">{empty}</p>
        ) : (
          data.map(([label, value]) => (
            <div key={label}>
              <div className="mb-1.5 flex justify-between gap-4 text-sm">
                <span className="truncate text-slate-300">{label}</span>
                <span className="font-medium text-slate-200">{value}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#0A1328]">
                <div
                  className="h-full rounded-full bg-blue-500 transition-all"
                  style={{ width: `${(value / max) * 100}%` }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function FilterSelect({
  icon: Icon,
  value,
  onChange,
  options,
}: {
  icon: typeof CalendarDays;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="relative">
      <Icon
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${input} min-w-[180px] appearance-none pl-9 pr-9`}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
      <ChevronDown
        size={15}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"
      />
    </div>
  );
}
