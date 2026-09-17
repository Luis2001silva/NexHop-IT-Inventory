import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useLanguage } from "@/context/LanguageContext";
import { useUserRole } from "@/hooks/useUserRole";

import {
  Search,
  Plus,
  SlidersHorizontal,
  Monitor,
  Smartphone,
  Tablet,
  Headphones,
  ChevronLeft,
  ChevronRight,
  Pencil,
  Package,
} from "lucide-react";

/* =========================================================
   EQUIPMENT TYPE

   Estrutura utilizada para representar um equipamento
   recebido do Supabase.
   ========================================================= */

interface Equipment {
  id: number;
  asset_tag: string | null;
  serial_number: string | null;
  name: string;
  model: string | null;
  status: string;
  purchase_date?: string | null;
  assigned_user?: string | null;

  brands?: {
    name: string;
  } | null;
}

/* =========================================================
   PROFILE TYPE

   Informação mínima necessária para descobrir o nome do
   utilizador ao qual um equipamento está atribuído.
   ========================================================= */

interface Profile {
  id: string;
  full_name: string | null;
}

/* =========================================================
   PAGINATION
   ========================================================= */

const ITEMS_PER_PAGE = 10;

/* =========================================================
   EQUIPMENT LIST
   ========================================================= */

export default function EquipmentList() {
  const { language } = useLanguage();

  /* =======================================================
     USER ROLE

     O role é obtido através de:

     Supabase Auth
          ↓
     profiles
          ↓
     profiles.role
          ↓
     useUserRole()

     Não usamos mais isAdmin vindo do AuthContext.
     ======================================================= */

  const {
    role,
    loading: roleLoading,
  } = useUserRole();

  /* =======================================================
     ADMIN PERMISSION

     Apenas "admin" pode adicionar/editar equipamento.

     Viewer:
     - pode consultar

     User:
     - será tratado posteriormente através do My Portal
     ======================================================= */

  const isAdmin = role === "admin";

  const isPT = language === "pt";

  /* =======================================================
     DATA STATE
     ======================================================= */

  const [equipment, setEquipment] =
    useState<Equipment[]>([]);

  const [profiles, setProfiles] =
    useState<Profile[]>([]);

  /* =======================================================
     FILTER STATE
     ======================================================= */

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [brandFilter, setBrandFilter] =
    useState("all");

  /* =======================================================
     PAGINATION STATE
     ======================================================= */

  const [currentPage, setCurrentPage] =
    useState(1);

  /* =======================================================
     LOADING STATE
     ======================================================= */

  const [isLoading, setIsLoading] =
    useState(true);

  /* =========================================================
     LOAD EQUIPMENT

     Carrega:
     - equipamentos
     - utilizadores/perfis

     Os perfis são necessários para apresentar o nome do
     utilizador atribuído a cada equipamento.
     ========================================================= */

  useEffect(() => {
    loadEquipment();
  }, []);

  async function loadEquipment() {
    setIsLoading(true);

    try {
      /* =====================================================
         EQUIPMENT + PROFILES

         Fazemos as duas queries em paralelo para tornar o
         carregamento mais rápido.
         ===================================================== */

      const [
        equipmentResult,
        profilesResult,
      ] = await Promise.all([
        supabase
          .from("equipment")
          .select(
            `
            id,
            asset_tag,
            serial_number,
            name,
            model,
            status,
            purchase_date,
            assigned_user,
            brands!equipment_brand_id_fkey(name)
          `,
          )
          .order("id", {
            ascending: false,
          }),

        supabase
          .from("profiles")
          .select(
            "id, full_name",
          )
          .order(
            "full_name",
          ),
      ]);

      /* =====================================================
         EQUIPMENT RESULT
         ===================================================== */

      if (equipmentResult.error) {
        console.error(
          "Erro ao carregar equipamentos:",
          equipmentResult.error,
        );
      } else {
        setEquipment(
          (equipmentResult.data ??
            []) as Equipment[],
        );
      }

      /* =====================================================
         PROFILES RESULT
         ===================================================== */

      if (profilesResult.error) {
        console.error(
          "Erro ao carregar utilizadores:",
          profilesResult.error,
        );
      } else {
        setProfiles(
          profilesResult.data ?? [],
        );
      }
    } catch (error) {
      console.error(
        "Erro inesperado ao carregar equipamentos:",
        error,
      );
    } finally {
      setIsLoading(false);
    }
  }

  /* =========================================================
     HELPERS
     ========================================================= */

  /* =========================================================
     GET PROFILE NAME

     Converte o UUID do assigned_user no nome real do
     utilizador.
     ========================================================= */

  const getProfileName = (
    userId: string | null | undefined,
  ) => {
    if (!userId) {
      return "—";
    }

    const profile = profiles.find(
      (item) => item.id === userId,
    );

    return profile?.full_name || "—";
  };

  /* =========================================================
     GET EQUIPMENT TYPE

     Determina o tipo através do nome/modelo.

     Esta função mantém a lógica atual da aplicação.
     ========================================================= */

  const getEquipmentType = (
    item: Equipment,
  ) => {
    const value =
      `${item.name} ${item.model ?? ""}`.toLowerCase();

    if (
      value.includes("iphone") ||
      value.includes("samsung") ||
      value.includes("phone") ||
      value.includes("smartphone") ||
      value.includes("mobile")
    ) {
      return "smartphone";
    }

    if (
      value.includes("ipad") ||
      value.includes("tablet")
    ) {
      return "tablet";
    }

    if (
      value.includes("headset") ||
      value.includes("headphone") ||
      value.includes("headphones")
    ) {
      return "headset";
    }

    return "computer";
  };

  /* =========================================================
     GET TYPE ICON
     ========================================================= */

  const getTypeIcon = (
    item: Equipment,
  ) => {
    const type =
      getEquipmentType(item);

    if (type === "smartphone") {
      return (
        <Smartphone size={14} />
      );
    }

    if (type === "tablet") {
      return (
        <Tablet size={14} />
      );
    }

    if (type === "headset") {
      return (
        <Headphones size={14} />
      );
    }

    return (
      <Monitor size={16} />
    );
  };

  /* =========================================================
     GET TYPE LABEL
     ========================================================= */

  const getTypeLabel = (
    type: string,
  ) => {
    if (type === "smartphone") {
      return "Smartphone";
    }

    if (type === "tablet") {
      return "Tablet";
    }

    if (type === "headset") {
      return "Headset";
    }

    return isPT
      ? "Computador"
      : "Computer";
  };

  /* =========================================================
     GET STATUS LABEL
     ========================================================= */

  const getStatusLabel = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return isPT
          ? "Ativo"
          : "Active";

      case "maintenance":
        return isPT
          ? "Manutenção"
          : "Maintenance";

      case "inactive":
        return isPT
          ? "Inativo"
          : "Inactive";

      case "decommissioned":
        return isPT
          ? "Descontinuado"
          : "Decommissioned";

      default:
        return status;
    }
  };

  /* =========================================================
     GET STATUS CSS
     ========================================================= */

  const getStatusClasses = (
    status: string,
  ) => {
    switch (status) {
      case "active":
        return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

      case "maintenance":
        return "border-amber-400/20 bg-amber-400/10 text-amber-400";

      case "inactive":
        return "border-slate-400/20 bg-slate-400/10 text-slate-400";

      case "decommissioned":
        return "border-red-400/20 bg-red-400/10 text-red-400";

      default:
        return "border-white/10 bg-white/[0.04] text-white/50";
    }
  };

  /* =========================================================
     FORMAT DATE
     ========================================================= */

  const formatDate = (
    date: string | null | undefined,
  ) => {
    if (!date) {
      return "—";
    }

    const parsed =
      new Date(date);

    if (
      Number.isNaN(
        parsed.getTime(),
      )
    ) {
      return "—";
    }

    return parsed.toLocaleDateString(
      isPT
        ? "pt-PT"
        : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );
  };

  /* =========================================================
     FILTER OPTIONS - BRANDS
     ========================================================= */

  const brands = useMemo(() => {
    return Array.from(
      new Set(
        equipment
          .map(
            (item) =>
              item.brands?.name,
          )
          .filter(Boolean),
      ),
    ).sort();
  }, [equipment]);

  /* =========================================================
     FILTER OPTIONS - TYPES
     ========================================================= */

  const types = useMemo(() => {
    return Array.from(
      new Set(
        equipment.map(
          (item) =>
            getEquipmentType(item),
        ),
      ),
    );
  }, [equipment]);

  /* =========================================================
     FILTERING

     Aplica:
     - pesquisa
     - estado
     - tipo
     - marca
     ========================================================= */

  const filteredEquipment =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return equipment.filter(
        (item) => {
          const matchesSearch =
            !normalizedSearch ||
            item.name
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.model
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.serial_number
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.asset_tag
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            item.brands?.name
              ?.toLowerCase()
              .includes(
                normalizedSearch,
              ) ||
            getProfileName(
              item.assigned_user,
            )
              .toLowerCase()
              .includes(
                normalizedSearch,
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            item.status ===
              statusFilter;

          const matchesType =
            typeFilter ===
              "all" ||
            getEquipmentType(
              item,
            ) === typeFilter;

          const matchesBrand =
            brandFilter ===
              "all" ||
            item.brands?.name ===
              brandFilter;

          return (
            matchesSearch &&
            matchesStatus &&
            matchesType &&
            matchesBrand
          );
        },
      );
    }, [
      equipment,
      search,
      statusFilter,
      typeFilter,
      brandFilter,
      profiles,
    ]);

  /* =========================================================
     STATS
     ========================================================= */

  const totalEquipment =
    equipment.length;

  const activeEquipment =
    equipment.filter(
      (item) =>
        item.status ===
        "active",
    ).length;

  const maintenanceEquipment =
    equipment.filter(
      (item) =>
        item.status ===
        "maintenance",
    ).length;

  const criticalEquipment =
    equipment.filter(
      (item) =>
        item.status ===
        "decommissioned",
    ).length;

  /* =========================================================
     PAGINATION
     ========================================================= */

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredEquipment.length /
        ITEMS_PER_PAGE,
    ),
  );

  const safeCurrentPage =
    Math.min(
      currentPage,
      totalPages,
    );

  const paginatedEquipment =
    filteredEquipment.slice(
      (safeCurrentPage - 1) *
        ITEMS_PER_PAGE,
      safeCurrentPage *
        ITEMS_PER_PAGE,
    );

  /* =========================================================
     CLEAR FILTERS
     ========================================================= */

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setTypeFilter("all");
    setBrandFilter("all");
    setCurrentPage(1);
  };

  /* =========================================================
     ROLE LOADING

     Esperamos até sabermos se o utilizador é Admin, Viewer
     ou User.

     Isto evita mostrar temporariamente uma interface
     errada.
     ========================================================= */

  if (roleLoading) {
    return (
      <div className="min-h-full bg-[#080D1F] flex items-center justify-center text-white">
        <div className="text-sm text-white/40">
          {isPT
            ? "A carregar..."
            : "Loading..."}
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white">

      {/* =====================================================
          HEADER
          ===================================================== */}

      <div className="mb-5 flex items-start justify-between gap-4">

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT
              ? "Equipamentos"
              : "Equipment"}
          </h1>

          <p className="mt-1 text-sm text-slate-400">
            {isPT
              ? "Gira, consulta e acompanha todos os equipamentos da organização."
              : "Manage, view and track all equipment across the organization."}
          </p>
        </div>

        {/* ===================================================
            ADMIN ACTION

            O botão só aparece para:
            profiles.role = admin
            =================================================== */}

        {isAdmin && (
          <Link
            to="/equipment/new"
            className="flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Plus size={16} />

            {isPT
              ? "Adicionar equipamento"
              : "Add equipment"}
          </Link>
        )}
      </div>

      {/* =====================================================
          STATS
          ===================================================== */}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* TOTAL */}

        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-center justify-between">

            <span className="text-sm text-white/45">
              {isPT
                ? "Equipamentos"
                : "Equipment"}
            </span>

            <Package
              size={16}
              className="text-blue-400/70"
            />
          </div>

          <div className="mt-2 text-2xl font-bold">
            {totalEquipment}
          </div>

          <div className="mt-1 text-xs text-emerald-400">
            {isPT
              ? "Total registado"
              : "Total registered"}
          </div>
        </div>

        {/* ACTIVE */}

        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-center justify-between">

            <span className="text-sm text-white/45">
              {isPT
                ? "Ativos"
                : "Active"}
            </span>

            <span className="text-emerald-400">
              <Monitor size={16} />
            </span>
          </div>

          <div className="mt-2 text-2xl font-bold">
            {activeEquipment}
          </div>

          <div className="mt-1 text-xs text-emerald-400">
            {totalEquipment > 0
              ? `${Math.round(
                  (activeEquipment /
                    totalEquipment) *
                    100,
                )}% ${
                  isPT
                    ? "do total"
                    : "of total"
                }`
              : "—"}
          </div>
        </div>

        {/* MAINTENANCE */}

        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-center justify-between">

            <span className="text-sm text-white/45">
              {isPT
                ? "Manutenção"
                : "Maintenance"}
            </span>

            <span className="text-amber-400">
              <Monitor size={16} />
            </span>
          </div>

          <div className="mt-2 text-2xl font-bold">
            {maintenanceEquipment}
          </div>

          <div className="mt-1 text-xs text-amber-400">
            {isPT
              ? "Requer atenção"
              : "Requires attention"}
          </div>
        </div>

        {/* CRITICAL */}

        <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">
          <div className="flex items-center justify-between">

            <span className="text-sm text-white/45">
              {isPT
                ? "Críticos"
                : "Critical"}
            </span>

            <span className="text-red-400">
              <Package size={14} />
            </span>
          </div>

          <div className="mt-2 text-2xl font-bold">
            {criticalEquipment}
          </div>

          <div className="mt-1 text-xs text-red-400">
            {isPT
              ? "Descontinuados"
              : "Decommissioned"}
          </div>
        </div>
      </div>

      {/* =====================================================
          FILTER BAR
          ===================================================== */}

      <div className="mb-4 rounded-xl border border-white/[0.06] bg-[#0D1730] p-4">

        <div className="flex flex-col gap-2 xl:flex-row">

          {/* SEARCH */}

          <div className="relative flex-1">

            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-white/25"
            />

            <input
              value={search}
              onChange={(e) => {
                setSearch(
                  e.target.value,
                );

                setCurrentPage(1);
              }}
              placeholder={
                isPT
                  ? "Pesquisar equipamento..."
                  : "Search equipment..."
              }
              className="h-11 w-full rounded-lg border border-white/[0.07] bg-[#080D1F] pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/40"
            />
          </div>

          {/* STATUS */}

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(
                e.target.value,
              );

              setCurrentPage(1);
            }}
            className="h-11 rounded-lg border border-white/[0.07] bg-[#080D1F] px-3 text-sm text-white/60 outline-none focus:border-blue-500/40"
          >
            <option value="all">
              {isPT
                ? "Estado"
                : "Status"}
            </option>

            <option value="active">
              {isPT
                ? "Ativo"
                : "Active"}
            </option>

            <option value="maintenance">
              {isPT
                ? "Manutenção"
                : "Maintenance"}
            </option>

            <option value="inactive">
              {isPT
                ? "Inativo"
                : "Inactive"}
            </option>

            <option value="decommissioned">
              {isPT
                ? "Descontinuado"
                : "Decommissioned"}
            </option>
          </select>

          {/* TYPE */}

          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(
                e.target.value,
              );

              setCurrentPage(1);
            }}
            className="h-11 rounded-lg border border-white/[0.07] bg-[#080D1F] px-3 text-sm text-white/60 outline-none focus:border-blue-500/40"
          >
            <option value="all">
              {isPT
                ? "Tipo"
                : "Type"}
            </option>

            {types.map(
              (type) => (
                <option
                  key={type}
                  value={type}
                >
                  {getTypeLabel(
                    type,
                  )}
                </option>
              ),
            )}
          </select>

          {/* BRAND */}

          <select
            value={brandFilter}
            onChange={(e) => {
              setBrandFilter(
                e.target.value,
              );

              setCurrentPage(1);
            }}
            className="h-11 rounded-lg border border-white/[0.07] bg-[#080D1F] px-3 text-sm text-white/60 outline-none focus:border-blue-500/40"
          >
            <option value="all">
              {isPT
                ? "Marca"
                : "Brand"}
            </option>

            {brands.map(
              (brand) => (
                <option
                  key={brand}
                  value={brand}
                >
                  {brand}
                </option>
              ),
            )}
          </select>

          {/* CLEAR */}

          {(search ||
            statusFilter !==
              "all" ||
            typeFilter !==
              "all" ||
            brandFilter !==
              "all") && (
            <button
              type="button"
              onClick={
                clearFilters
              }
              className="flex h-11 items-center justify-center gap-2 rounded-lg border border-white/[0.07] px-3 text-sm text-white/45 transition hover:bg-white/[0.04] hover:text-white"
            >
              <SlidersHorizontal
                size={14}
              />

              {isPT
                ? "Limpar"
                : "Clear"}
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
          TABLE
          ===================================================== */}

      <div className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">

        {/* TABLE HEADER */}

        <div className="border-b border-white/[0.06] px-5 py-4">

          <div className="flex items-center justify-between">

            <div>
              <h2 className="text-sm font-semibold text-white">
                {isPT
                  ? "Lista de equipamentos"
                  : "Equipment list"}
              </h2>

              <p className="mt-0.5 text-xs text-white/35">
                {filteredEquipment.length}{" "}
                {isPT
                  ? "equipamentos encontrados"
                  : "equipment found"}
              </p>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-white/35">
              <SlidersHorizontal
                size={14}
              />

              {isPT
                ? "Filtros aplicados"
                : "Filters available"}
            </div>
          </div>
        </div>

        {/* ===================================================
            LOADING
            =================================================== */}

        {isLoading ? (
          <div className="flex min-h-[300px] items-center justify-center text-sm text-white/35">
            {isPT
              ? "A carregar equipamentos..."
              : "Loading equipment..."}
          </div>
        ) : filteredEquipment.length ===
          0 ? (

          /* =================================================
             EMPTY STATE
             ================================================= */

          <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-white/25">
              <Package size={18} />
            </div>

            <h3 className="text-sm font-semibold text-white/70">
              {isPT
                ? "Não existem equipamentos"
                : "No equipment found"}
            </h3>

            <p className="mt-1 max-w-sm text-xs text-white/35">
              {isPT
                ? "Não foram encontrados equipamentos com os filtros selecionados."
                : "No equipment matches the selected filters."}
            </p>

            {/* ------------------------------------------------
                Se for Admin, permitimos criar equipamento
                mesmo quando a lista está vazia.
                ------------------------------------------------ */}

            {isAdmin && (
              <Link
                to="/equipment/new"
                className="mt-5 inline-flex h-9 items-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-500"
              >
                <Plus size={14} />

                {isPT
                  ? "Adicionar equipamento"
                  : "Add equipment"}
              </Link>
            )}
          </div>
        ) : (

          /* =================================================
             EQUIPMENT TABLE
             ================================================= */

          <>
            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead>
                  <tr className="border-b border-white/[0.05] text-left">

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Equipamento"
                        : "Equipment"}
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      ID
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Modelo"
                        : "Model"}
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Utilizador"
                        : "User"}
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Estado"
                        : "Status"}
                    </th>

                    <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Aquisição"
                        : "Acquisition"}
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/35">
                      {isPT
                        ? "Ações"
                        : "Actions"}
                    </th>
                  </tr>
                </thead>

                <tbody>

                  {paginatedEquipment.map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-white/[0.04] transition hover:bg-white/[0.025]"
                      >

                        {/* EQUIPMENT */}

                        <td className="px-5 py-4">

                          <div className="flex items-center gap-3">

                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-500/[0.08] text-blue-400">
                              {getTypeIcon(
                                item,
                              )}
                            </div>

                            <div className="min-w-0">

                              <div className="truncate text-sm font-medium text-white/85">
                                {item.name}
                              </div>

                              <div className="mt-0.5 truncate text-xs text-white/35">
                                {item.brands
                                  ?.name ??
                                  "—"}
                              </div>

                            </div>
                          </div>
                        </td>

                        {/* ID */}

                        <td className="px-5 py-4">

                          <span className="text-sm font-mono text-white/45">
                            {item.asset_tag ??
                              `IT-${item.id}`}
                          </span>

                        </td>

                        {/* MODEL */}

                        <td className="px-5 py-4">

                          <div className="text-sm text-white/65">
                            {item.model ??
                              "—"}
                          </div>

                          <div className="mt-0.5 text-xs text-white/35">
                            {item.serial_number ??
                              "—"}
                          </div>

                        </td>

                        {/* USER */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-white/65">
                            {getProfileName(
                              item.assigned_user,
                            )}
                          </span>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              item.status,
                            )}`}
                          >
                            {getStatusLabel(
                              item.status,
                            )}
                          </span>

                        </td>

                        {/* ACQUISITION */}

                        <td className="px-5 py-4">

                          <span className="text-sm text-white/55">
                            {formatDate(
                              item.purchase_date,
                            )}
                          </span>

                        </td>

                        {/* ACTIONS */}

                        <td className="px-5 py-4 text-right">

                          <div className="flex justify-end gap-2">

                            {/* --------------------------------
                                VIEW / OPEN EQUIPMENT
                                -------------------------------- */}

                            <Link
                              to={`/equipment/${item.id}`}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white/35 transition hover:bg-white/[0.05] hover:text-white"
                              title={
                                isPT
                                  ? "Ver equipamento"
                                  : "View equipment"
                              }
                            >
                              <Pencil
                                size={16}
                              />
                            </Link>

                            {/* --------------------------------
                                Nota:

                                A página de detalhe será
                                responsável por esconder as
                                ações de edição quando o
                                utilizador não for Admin.

                                Aqui mantemos o acesso à
                                página do equipamento.
                                -------------------------------- */}
                          </div>
                        </td>
                      </tr>
                    ),
                  )}

                </tbody>
              </table>
            </div>

            {/* =================================================
                PAGINATION
                ================================================= */}

            <div className="flex items-center justify-between border-t border-white/[0.05] px-5 py-4">

              <span className="text-xs text-white/35">
                {isPT
                  ? `A mostrar ${paginatedEquipment.length} de ${filteredEquipment.length}`
                  : `Showing ${paginatedEquipment.length} of ${filteredEquipment.length}`}
              </span>

              <div className="flex items-center gap-1">

                {/* PREVIOUS */}

                <button
                  type="button"
                  disabled={
                    safeCurrentPage ===
                    1
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.max(
                          1,
                          page - 1,
                        ),
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] text-white/35 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronLeft
                    size={16}
                  />
                </button>

                {/* CURRENT PAGE */}

                <div className="flex h-8 min-w-8 items-center justify-center rounded-md bg-blue-600 px-2 text-xs font-medium text-white">
                  {safeCurrentPage}
                </div>

                {/* NEXT */}

                <button
                  type="button"
                  disabled={
                    safeCurrentPage >=
                    totalPages
                  }
                  onClick={() =>
                    setCurrentPage(
                      (page) =>
                        Math.min(
                          totalPages,
                          page + 1,
                        ),
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-md border border-white/[0.06] text-white/35 transition hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <ChevronRight
                    size={16}
                  />
                </button>

              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}