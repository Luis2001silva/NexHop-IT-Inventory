import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { AddUserForm } from '@/components/Users/AddUserForm';
import { AssignEquipmentForm } from '@/components/Equipment/AssignEquipmentForm';

import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import {
  Search,
  UserPlus,
  Users,
  Monitor,
  Smartphone,
  Headset,
  Tablet,
  Package,
  MapPin,
  ShieldCheck,
  Eye,
  Pencil,
  ChevronLeft,
  ChevronRight,
  CircleCheck,
  CirclePause,
  Wrench,
} from 'lucide-react';

const UsersPage = () => {
  const { language } = useLanguage();
  const { isAdmin } = useAuth();

  const isPT = language === 'pt';

  // =========================================================
  // FILTERS
  // =========================================================

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');


  // =========================================================
  // DIALOGS
  // =========================================================

  const [isAddUserDialogOpen, setIsAddUserDialogOpen] =
    useState(false);

  const [isEditUserDialogOpen, setIsEditUserDialogOpen] =
    useState(false);

  const [
    isAssignEquipmentDialogOpen,
    setIsAssignEquipmentDialogOpen,
  ] = useState(false);

  const [userDetailsOpen, setUserDetailsOpen] =
    useState(false);

  // =========================================================
  // SELECTED USER
  // =========================================================

  const [selectedUserId, setSelectedUserId] =
    useState<string | null>(null);

  const [selectedUser, setSelectedUser] =
    useState<any | null>(null);

  const [editUserForm, setEditUserForm] = useState({
    full_name: '',
    department: '',
    position: '',
    sap_number: '',
    role: 'viewer',
    manager_id: '',
  });

  const [savingUser, setSavingUser] = useState(false);

  // =========================================================
  // DATA
  // =========================================================

  const [users, setUsers] = useState<any[]>([]);

  const [equipmentAssignments, setEquipmentAssignments] =
    useState<any[]>([]);

  const [
    unassignedEquipmentCount,
    setUnassignedEquipmentCount,
  ] = useState(0);

  const [loading, setLoading] = useState(true);

  // =========================================================
  // PAGINATION
  // =========================================================

  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 8;

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);

    try {
      // -----------------------------------------------------
      // USERS
      // -----------------------------------------------------

      const usersRes = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        department,
        position,
        sap_number,
        manager_id,
        created_at
      `)
      .order('full_name');

      if (usersRes.error) {
        console.error(
          'Users error:',
          usersRes.error
        );

        toast.error(
          isPT
            ? 'Erro ao carregar utilizadores.'
            : 'Error loading users.'
        );
      }

      setUsers(usersRes.data ?? []);

      // -----------------------------------------------------
      // EQUIPMENT - MINIMAL QUERY
      //
      // Esta query é usada para os números.
      // Não depende de relações.
      // -----------------------------------------------------

      const equipmentCountRes = await supabase
        .from('equipment')
        .select('id, assigned_user');

      if (equipmentCountRes.error) {
        console.error(
          'Equipment count error:',
          equipmentCountRes.error
        );

        toast.error(
          isPT
            ? 'Erro ao carregar equipamentos.'
            : 'Error loading equipment.'
        );

        setEquipmentAssignments([]);
        setUnassignedEquipmentCount(0);
        return;
      }

      const allEquipment =
        equipmentCountRes.data ?? [];

      // -----------------------------------------------------
      // ASSIGNED / UNASSIGNED
      //
      // Consideramos null, undefined e string vazia
      // como equipamento não atribuído.
      // -----------------------------------------------------

      const assignedIds = new Set(
        allEquipment
          .filter((equipment) => {
            const value =
              equipment.assigned_user;

            return (
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ''
            );
          })
          .map((equipment) => equipment.id)
      );

      const assignedCount =
        assignedIds.size;

      const unassignedCount =
        allEquipment.length -
        assignedCount;

      setUnassignedEquipmentCount(
        unassignedCount
      );

      // -----------------------------------------------------
      // EQUIPMENT - FULL QUERY
      //
      // Esta query é apenas para mostrar os dados na tabela.
      // -----------------------------------------------------

      const equipmentDetailsRes =
        await supabase
          .from('equipment')
          .select(`
            id,
            name,
            model,
            serial_number,
            asset_tag,
            status,
            location_id,
            assigned_user,
            equipment_type_id,
            brands!equipment_brand_id_fkey(name),
            locations(name),
            equipment_types(name)
          `);

      if (equipmentDetailsRes.error) {
        console.error(
          'Equipment details error:',
          equipmentDetailsRes.error
        );

        // Se as relações falharem, usamos a query simples.
        const fallbackAssigned =
          allEquipment.filter((equipment) => {
            const value =
              equipment.assigned_user;

            return (
              value !== null &&
              value !== undefined &&
              String(value).trim() !== ''
            );
          });

        setEquipmentAssignments(
          fallbackAssigned
        );
      } else {
        const detailedEquipment =
          equipmentDetailsRes.data ?? [];

        const assignedEquipment =
          detailedEquipment.filter(
            (equipment) => {
              const value =
                equipment.assigned_user;

              return (
                value !== null &&
                value !== undefined &&
                String(value).trim() !== ''
              );
            }
          );

        setEquipmentAssignments(
          assignedEquipment
        );
      }
    } catch (error) {
      console.error(
        'UsersPage load error:',
        error
      );

      toast.error(
        isPT
          ? 'Ocorreu um erro ao carregar os dados.'
          : 'An error occurred while loading the data.'
      );
    } finally {
      setLoading(false);
    }
  }

  // =========================================================
  // DEPARTMENTS
  // =========================================================

  const departments = useMemo(() => {
    return Array.from(
      new Set(
        users
          .map((user) => user.department)
          .filter(Boolean)
      )
    ).sort();
  }, [users]);

  // =========================================================
  // FILTER USERS
  // =========================================================

  const filteredUsers = useMemo(() => {
    const search =
      searchTerm
        .toLowerCase()
        .trim();

    return users.filter((user) => {
      const matchesSearch =
        !search ||
        user.full_name
          ?.toLowerCase()
          .includes(search) ||
        user.email
          ?.toLowerCase()
          .includes(search) ||
        user.sap_number
          ?.toLowerCase()
          .includes(search) ||
        user.position
          ?.toLowerCase()
          .includes(search);

      const matchesRole =
        roleFilter === 'all' ||
        user.role === roleFilter;

      const matchesDepartment =
        departmentFilter === 'all' ||
        user.department ===
          departmentFilter;

      return (
        matchesSearch &&
        matchesRole &&
        matchesDepartment
      );
    });
  }, [
    users,
    searchTerm,
    roleFilter,
    departmentFilter,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================

  const totalPages = Math.max(
    1,
    Math.ceil(
      filteredUsers.length /
        itemsPerPage
    )
  );

  const paginatedUsers =
    filteredUsers.slice(
      (currentPage - 1) *
        itemsPerPage,
      currentPage *
        itemsPerPage
    );

  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchTerm,
    roleFilter,
    departmentFilter,
  ]);

  // =========================================================
  // STATS
  // =========================================================

  const adminCount =
    users.filter(
      (user) =>
        user.role === 'admin'
    ).length;

  const viewerCount =
    users.filter(
      (user) =>
        user.role !== 'admin'
    ).length;

  const assignedEquipmentCount =
    equipmentAssignments.length;

      // =========================================================
  // EQUIPMENT COUNT PER USER
  // =========================================================

  const getUserEquipmentCount = (userId: string) => {
    return equipmentAssignments.filter(
      (equipment) =>
        String(equipment.assigned_user) === String(userId)
    ).length;
  };

  const getEquipmentCountStyle = (count: number) => {
    if (count === 0) {
      return {
        wrapper:
          'border-white/10 bg-white/[0.04] text-white/40',
      };
    }

    if (count <= 3) {
      return {
        wrapper:
          'border-blue-500/20 bg-blue-500/10 text-blue-400',
      };
    }

    return {
      wrapper:
        'border-blue-500/40 bg-blue-500/20 text-blue-300 shadow-[0_0_12px_rgba(59,130,246,0.12)]',
      };
  };

  // =========================================================
  // INITIALS
  // =========================================================

  const getInitials = (
    name?: string
  ) => {
    if (!name) return 'U';

    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) =>
        part
          .charAt(0)
          .toUpperCase()
      )
      .join('');
  };

  // =========================================================
  // EQUIPMENT ICON
  // =========================================================

  const getEquipmentIcon = (
    equipment: any
  ) => {
    const type =
      equipment
        .equipment_types
        ?.name
        ?.toLowerCase() ?? '';

    if (
      type.includes('smartphone') ||
      type.includes('telefone') ||
      type.includes('mobile')
    ) {
      return Smartphone;
    }

    if (
      type.includes('headset') ||
      type.includes('auscult')
    ) {
      return Headset;
    }

    if (
      type.includes('tablet')
    ) {
      return Tablet;
    }

    return Monitor;
  };

  // =========================================================
  // STATUS
  // =========================================================

  const getStatus = (
    status: string
  ) => {
    switch (status) {
      case 'active':
        return {
          label: isPT
            ? 'Ativo'
            : 'Active',
          icon: CircleCheck,
          className:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        };

      case 'maintenance':
        return {
          label: isPT
            ? 'Manutenção'
            : 'Maintenance',
          icon: Wrench,
          className:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        };

      case 'inactive':
        return {
          label: isPT
            ? 'Inativo'
            : 'Inactive',
          icon: CirclePause,
          className:
            'border-white/10 bg-white/5 text-white/50',
        };

      case 'decommissioned':
        return {
          label: isPT
            ? 'Desativado'
            : 'Decommissioned',
          icon: CirclePause,
          className:
            'border-red-500/20 bg-red-500/10 text-red-400',
        };

      default:
        return {
          label: status || '—',
          icon: CirclePause,
          className:
            'border-white/10 bg-white/5 text-white/50',
        };
    }
  };

  // =========================================================
  // ADD USER
  // =========================================================

  const handleAddUserSuccess = (
    newUser: any
  ) => {
    toast.success(
      isPT
        ? 'Utilizador criado com sucesso!'
        : 'User created successfully!'
    );

    setIsAddUserDialogOpen(false);

    loadData();
  };

  // =========================================================
  // EDIT USER
  // =========================================================

  const openEditUserDialog = (user: any) => {
    if (!isAdmin) return;

    setSelectedUser(user);

    setEditUserForm({
      full_name: user.full_name ?? '',
      department: user.department ?? '',
      position: user.position ?? '',
      sap_number: user.sap_number ?? '',
      role: user.role ?? 'viewer',
      manager_id: user.manager_id ?? '',
    });

    setIsEditUserDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!isAdmin || !selectedUser) return;

    if (!editUserForm.full_name.trim()) {
      toast.error(
        isPT
          ? 'O nome é obrigatório.'
          : 'Name is required.'
      );
      return;
    }

    setSavingUser(true);

    try {
      const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: editUserForm.full_name.trim(),
        department:
          editUserForm.department.trim() || null,
        position:
          editUserForm.position.trim() || null,
        sap_number:
          editUserForm.sap_number.trim() || null,
        role: editUserForm.role,
        manager_id:
          editUserForm.manager_id || null,
      })
      .eq('id', selectedUser.id);

      if (error) throw error;

      toast.success(
        isPT
          ? 'Utilizador atualizado com sucesso!'
          : 'User updated successfully!'
      );

      setIsEditUserDialogOpen(false);
      setSelectedUser(null);
      await loadData();
    } catch (error: any) {
      console.error('Edit user error:', error);

      toast.error(
        error?.message ||
          (isPT
            ? 'Não foi possível atualizar o utilizador.'
            : 'Could not update the user.')
      );
    } finally {
      setSavingUser(false);
    }
  };

  // =========================================================
  // ASSIGN EQUIPMENT
  // =========================================================

  const openAssignEquipmentDialog = (
    userId?: string
  ) => {
    setSelectedUserId(
      userId ?? null
    );

    setIsAssignEquipmentDialogOpen(
      true
    );
  };

  const handleAssignEquipmentSuccess =
    () => {
      toast.success(
        isPT
          ? 'Equipamento atribuído com sucesso!'
          : 'Equipment assigned successfully!'
      );

      setIsAssignEquipmentDialogOpen(
        false
      );

      setSelectedUserId(null);

      loadData();
    };

  // =========================================================
  // USER DETAILS
  // =========================================================

  const openUserDetails = (
    user: any
  ) => {
    setSelectedUser(user);
    setUserDetailsOpen(true);
  };

  // =========================================================
  // SELECTED USER EQUIPMENT
  // =========================================================

  const selectedUserEquipment =
    selectedUser
      ? equipmentAssignments.filter(
          (equipment) =>
            String(
              equipment.assigned_user
            ) ===
            String(selectedUser.id)
        )
      : [];

  // =========================================================
  // PAGE
  // =========================================================

  return (
    <div
      className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white"
    >
      <div
        className="space-y-5"
      >

        {/* ===================================================
            HEADER
        =================================================== */}

        <div
          className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between"
        >
          <div>

            <h1 className="text-2xl font-bold tracking-tight text-white">
              {isPT ? 'Utilizadores' : 'Users'}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {isPT
                ? 'Gere utilizadores, permissões e equipamentos atribuídos.'
                : 'Manage users, permissions and assigned equipment.'}
            </p>
          </div>

          <div
            className="flex flex-wrap items-center gap-3"
          >

            {isAdmin && (
              <>
            {/* ASSIGN EQUIPMENT */}

            <Button
              variant="outline"
              onClick={() =>
                openAssignEquipmentDialog()
              }
              className="border-amber-500/20 bg-amber-500/5 text-amber-400 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
            >
              <Package className="mr-2 h-4 w-4" />

              {isPT
                ? 'Atribuir equipamento'
                : 'Assign equipment'}
            </Button>

            {/* ADD USER */}

            <Button
              onClick={() =>
                setIsAddUserDialogOpen(true)
              }
              className="bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500"
            >
              <UserPlus className="mr-2 h-4 w-4" />

              {isPT
                ? 'Adicionar utilizador'
                : 'Add user'}
            </Button>
              </>
            )}
          </div>
        </div>

        {/* ===================================================
            STATS
        =================================================== */}

        <div
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >

          {/* TOTAL */}

          <div
            className="rounded-xl border border-blue-500/20 bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/45">
                  {isPT
                    ? 'Total de utilizadores'
                    : 'Total users'}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {users.length}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10"
              >
                <Users className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          {/* ADMIN */}

          <div
            className="rounded-xl border border-violet-500/20 bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/45">
                  {isPT
                    ? 'Administradores'
                    : 'Administrators'}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {adminCount}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-500/10"
              >
                <ShieldCheck className="h-5 w-5 text-violet-400" />
              </div>
            </div>
          </div>

          {/* USERS */}

          <div
            className="rounded-xl border border-emerald-500/20 bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/45">
                  {isPT
                    ? 'Utilizadores'
                    : 'Users'}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {viewerCount}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10"
              >
                <Eye className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* ASSIGNED */}

          <div
            className="rounded-xl border border-amber-500/20 bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/45">
                  {isPT
                    ? 'Equipamentos atribuídos'
                    : 'Assigned equipment'}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {assignedEquipmentCount}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10"
              >
                <Monitor className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </div>

          {/* UNASSIGNED */}

          <div
            className="rounded-xl border border-orange-500/20 bg-[#0D1730] p-5"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/45">
                  {isPT
                    ? 'Equipamentos não atribuídos'
                    : 'Unassigned equipment'}
                </p>

                <p className="mt-2 text-2xl font-bold text-white">
                  {isAdmin ? unassignedEquipmentCount : '—'}
                </p>
              </div>

              <div
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10"
              >
                <Package className="h-5 w-5 text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* ===================================================
            USERS TAB
        =================================================== */}

            {/* FILTER BAR */}

            <div
              className="rounded-xl border border-blue-500/20 bg-[#0D1730] p-4"
            >
              <div
                className="flex flex-col gap-3 lg:flex-row"
              >

                {/* SEARCH */}

                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25"
                  />

                  <Input
                    value={searchTerm}
                    onChange={(event) =>
                      setSearchTerm(
                        event.target.value
                      )
                    }
                    placeholder={
                      isPT
                        ? 'Pesquisar utilizador, email, SAP...'
                        : 'Search user, email, SAP...'
                    }
                    className="h-11 border-white/10 bg-[#0A1328] pl-10 text-white placeholder:text-white/25 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                {/* ROLE */}

                <Select
                  value={roleFilter}
                  onValueChange={
                    setRoleFilter
                  }
                >
                  <SelectTrigger
                    className="h-11 w-full border-white/10 bg-[#0A1328] text-white sm:w-[180px]"
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Função'
                          : 'Role'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] text-white"
                  >
                    <SelectItem value="all">
                      {isPT
                        ? 'Todas as funções'
                        : 'All roles'}
                    </SelectItem>

                    <SelectItem value="admin">
                      {isPT
                        ? 'Administrador'
                        : 'Administrator'}
                    </SelectItem>

                    <SelectItem value="viewer">
                      {isPT
                        ? 'Utilizador'
                        : 'Viewer'}
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* DEPARTMENT */}

                <Select
                  value={departmentFilter}
                  onValueChange={
                    setDepartmentFilter
                  }
                >
                  <SelectTrigger
                    className="h-11 w-full border-white/10 bg-[#0A1328] text-white sm:w-[220px]"
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Departamento'
                          : 'Department'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="max-h-[280px] border-blue-500/20 bg-[#0D1730] text-white"
                  >
                    <SelectItem value="all">
                      {isPT
                        ? 'Todos os departamentos'
                        : 'All departments'}
                    </SelectItem>

                    {departments.map(
                      (department) => (
                        <SelectItem
                          key={department}
                          value={department}
                        >
                          {department}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* USERS TABLE */}

            <div
              className="overflow-hidden rounded-xl border border-blue-500/20 bg-[#0D1730]"
            >
              <div className="overflow-x-auto">
                <table
                  className="w-full min-w-[900px]"
                >
                  <thead>
                    <tr
                      className="border-b border-white/[0.07] bg-white/[0.015]"
                    >
                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Utilizador'
                          : 'User'}
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Departamento'
                          : 'Department'}
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Cargo'
                          : 'Position'}
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                        SAP
                      </th>
                      
                      <th className="px-5 py-4 text-center text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Equipamentos'
                          : 'Equipment'}
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Função'
                          : 'Role'}
                      </th>

                      <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/35">
                        {isPT
                          ? 'Ações'
                          : 'Actions'}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center text-sm text-white/35"
                        >
                          {isPT
                            ? 'A carregar utilizadores...'
                            : 'Loading users...'}
                        </td>
                      </tr>
                    ) : paginatedUsers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={7}
                          className="px-5 py-16 text-center"
                        >
                          <Users
                            className="mx-auto mb-3 h-9 w-9 text-white/15"
                          />

                          <p className="text-sm text-white/40">
                            {isPT
                              ? 'Nenhum utilizador encontrado.'
                              : 'No users found.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map(
                        (user) => (
                          <tr
                            key={user.id}
                            className="border-b border-white/[0.05] transition hover:bg-blue-500/[0.025]"
                          >
                            {/* USER */}

                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div
                                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10 text-sm font-semibold text-blue-400"
                                >
                                  {getInitials(
                                    user.full_name
                                  )}
                                </div>

                                <div className="min-w-0">
                                  <p
                                    className="truncate font-medium text-white"
                                  >
                                    {user.full_name ||
                                      (isPT
                                        ? 'Sem nome'
                                        : 'No name')}
                                  </p>

                                  <p
                                    className="truncate text-xs text-white/35"
                                  >
                                    {user.email || '—'}
                                  </p>
                                </div>
                              </div>
                            </td>

                            {/* DEPARTMENT */}

                            <td className="px-5 py-4">
                              <span className="text-sm text-white/65">
                                {user.department || '—'}
                              </span>
                            </td>

                            {/* POSITION */}

                            <td className="px-5 py-4">
                              <span className="text-sm text-white/65">
                                {user.position || '—'}
                              </span>
                            </td>

                            {/* SAP */}

                            <td className="px-5 py-4">
                              <span className="font-mono text-sm text-white/55">
                                {user.sap_number || '—'}
                              </span>
                            </td>

                            {/* EQUIPMENT COUNT */}

                            <td className="px-5 py-4 text-center">
                              {(() => {
                                const equipmentCount = getUserEquipmentCount(user.id);
                                const equipmentStyle = getEquipmentCountStyle(equipmentCount);

                                return (
                                  <div className="flex items-center justify-center">
                                    <span
                                      className={`
                                        inline-flex
                                        h-8
                                        min-w-8
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        px-2.5
                                        text-sm
                                        font-semibold
                                        ${equipmentStyle.wrapper}
                                      `}
                                    >
                                      {equipmentCount}
                                    </span>
                                  </div>
                                );
                              })()}
                            </td>

                            {/* ROLE */}

                            <td className="px-5 py-4">
                              {user.role === 'admin' ? (
                                <Badge
                                  className="border border-violet-500/20 bg-violet-500/10 text-violet-400"
                                >
                                  <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />

                                  {isPT
                                    ? 'Administrador'
                                    : 'Administrator'}
                                </Badge>
                              ) : (
                                <Badge
                                  className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                >
                                  <Eye className="mr-1.5 h-3.5 w-3.5" />

                                  {isPT
                                    ? 'Utilizador'
                                    : 'Viewer'}
                                </Badge>
                              )}
                            </td>

                            {/* ACTIONS */}

                            <td className="px-5 py-4">
                              <div className="flex justify-end gap-2">

                                {/* VIEW USER */}

                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    openUserDetails(
                                      user
                                    )
                                  }
                                  className="h-9 w-9 border-emerald-500/20 bg-emerald-500/5 text-emerald-400 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/10 hover:text-emerald-300"
                                  title={
                                    isPT
                                      ? 'Ver utilizador'
                                      : 'View user'
                                  }
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>

                                {isAdmin && (
                                  <>
                                {/* EDIT */}

                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    openEditUserDialog(user)
                                  }
                                  className="h-9 w-9 border-blue-500/20 bg-blue-500/5 text-blue-400 transition-all hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                                  title={
                                    isPT
                                      ? 'Editar utilizador'
                                      : 'Edit user'
                                  }
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                  </>
                                )}

                                {isAdmin && (
                                  <>
                                {/* ASSIGN EQUIPMENT */}

                                <Button
                                  size="icon"
                                  variant="outline"
                                  onClick={() =>
                                    openAssignEquipmentDialog(
                                      user.id
                                    )
                                  }
                                  className="h-9 w-9 border-amber-500/20 bg-amber-500/5 text-amber-400 transition-all hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
                                  title={
                                    isPT
                                      ? 'Atribuir equipamento'
                                      : 'Assign equipment'
                                  }
                                >
                                  <Monitor className="h-4 w-4" />
                                </Button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* PAGINATION */}

              <div
                className="flex flex-col gap-3 border-t border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <p className="text-xs text-white/35">
                  {filteredUsers.length === 0
                    ? '0'
                    : `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                        currentPage * itemsPerPage,
                        filteredUsers.length
                      )}`}{' '}

                  {isPT
                    ? `de ${filteredUsers.length} utilizadores`
                    : `of ${filteredUsers.length} users`}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    disabled={
                      currentPage <= 1
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page - 1
                      )
                    }
                    className="h-8 w-8 border-white/10 bg-white/[0.03] text-white/50 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <span
                    className="min-w-[70px] text-center text-xs text-white/45"
                  >
                    {currentPage} / {totalPages}
                  </span>

                  <Button
                    size="icon"
                    variant="outline"
                    disabled={
                      currentPage >=
                      totalPages
                    }
                    onClick={() =>
                      setCurrentPage(
                        (page) =>
                          page + 1
                      )
                    }
                    className="h-8 w-8 border-white/10 bg-white/[0.03] text-white/50 hover:bg-blue-500/10 hover:text-blue-400"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
      </div>

      {/* =====================================================
          EDIT USER DIALOG - ADMIN ONLY
      ===================================================== */}

      {isAdmin && selectedUser && (
        <Dialog
          open={isEditUserDialogOpen}
          onOpenChange={setIsEditUserDialogOpen}
        >
          <DialogContent
            className="max-h-[90vh] overflow-y-auto border-blue-500/20 bg-[#0D1730] text-white shadow-2xl sm:max-w-[700px]"
          >
            <DialogHeader>
              <DialogTitle className="text-white">
                {isPT ? 'Editar utilizador' : 'Edit user'}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-white/50">
                    {isPT ? 'Nome completo' : 'Full name'}
                  </label>

                  <Input
                    value={editUserForm.full_name}
                    onChange={(event) =>
                      setEditUserForm((current) => ({
                        ...current,
                        full_name: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-[#0A1328] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">
                    {isPT ? 'Departamento' : 'Department'}
                  </label>

                  <Input
                    value={editUserForm.department}
                    onChange={(event) =>
                      setEditUserForm((current) => ({
                        ...current,
                        department: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-[#0A1328] text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">
                    {isPT ? 'Cargo' : 'Position'}
                  </label>

                  <Input
                    value={editUserForm.position}
                    onChange={(event) =>
                      setEditUserForm((current) => ({
                        ...current,
                        position: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-[#0A1328] text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">
                    SAP
                  </label>

                  <Input
                    value={editUserForm.sap_number}
                    onChange={(event) =>
                      setEditUserForm((current) => ({
                        ...current,
                        sap_number: event.target.value,
                      }))
                    }
                    className="border-white/10 bg-[#0A1328] font-mono text-white focus:border-blue-500/50 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-white/50">
                    {isPT ? 'Função' : 'Role'}
                  </label>

                  <Select
                    value={editUserForm.role}
                    onValueChange={(value) =>
                      setEditUserForm((current) => ({
                        ...current,
                        role: value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className="border-white/10 bg-[#0A1328] text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent
                      className="border-blue-500/20 bg-[#0D1730] text-white"
                    >
                      <SelectItem value="viewer">
                        {isPT ? 'Utilizador' : 'Viewer'}
                      </SelectItem>

                      <SelectItem value="admin">
                        {isPT
                          ? 'Administrador'
                          : 'Administrator'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <label className="text-xs font-medium text-white/50">
                    {isPT ? 'Superior' : 'Manager'}
                  </label>

                  <Select
                    value={editUserForm.manager_id || 'none'}
                    onValueChange={(value) =>
                      setEditUserForm((current) => ({
                        ...current,
                        manager_id:
                          value === 'none' ? '' : value,
                      }))
                    }
                  >
                    <SelectTrigger
                      className="border-white/10 bg-[#0A1328] text-white"
                    >
                      <SelectValue
                        placeholder={
                          isPT
                            ? 'Selecionar superior'
                            : 'Select manager'
                        }
                      />
                    </SelectTrigger>

                    <SelectContent
                      className="max-h-[280px] border-blue-500/20 bg-[#0D1730] text-white"
                    >
                      <SelectItem value="none">
                        {isPT
                          ? 'Sem superior'
                          : 'No manager'}
                      </SelectItem>

                      {users
                        .filter(
                          (user) =>
                            user.id !== selectedUser?.id
                        )
                        .map((user) => (
                          <SelectItem
                            key={user.id}
                            value={user.id}
                          >
                            {user.full_name ||
                              user.email ||
                              user.id}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div
                className="flex justify-end gap-2 border-t border-white/[0.07] pt-4"
              >
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    setIsEditUserDialogOpen(false)
                  }
                  disabled={savingUser}
                  className="border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.06] hover:text-white"
                >
                  {isPT ? 'Cancelar' : 'Cancel'}
                </Button>

                <Button
                  type="button"
                  onClick={handleEditUser}
                  disabled={savingUser}
                  className="bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                >
                  {savingUser
                    ? isPT
                      ? 'A guardar...'
                      : 'Saving...'
                    : isPT
                      ? 'Guardar alterações'
                      : 'Save changes'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* =====================================================
          ADD USER DIALOG
      ===================================================== */}

      <Dialog
        open={isAddUserDialogOpen}
        onOpenChange={
          setIsAddUserDialogOpen
        }
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-blue-500/20 bg-[#0D1730] text-white shadow-2xl sm:max-w-[650px]"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {isPT
                ? 'Adicionar novo utilizador'
                : 'Add new user'}
            </DialogTitle>
          </DialogHeader>

          <AddUserForm
            onSuccess={
              handleAddUserSuccess
            }
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          ASSIGN EQUIPMENT DIALOG
      ===================================================== */}

      <Dialog
        open={
          isAssignEquipmentDialogOpen
        }
        onOpenChange={
          setIsAssignEquipmentDialogOpen
        }
      >
        <DialogContent
          className="max-h-[90vh] overflow-y-auto border-amber-500/20 bg-[#0D1730] text-white shadow-2xl sm:max-w-[650px]"
        >
          <DialogHeader>
            <DialogTitle className="text-white">
              {isPT
                ? 'Atribuir equipamento'
                : 'Assign equipment'}
            </DialogTitle>
          </DialogHeader>

          <AssignEquipmentForm
            onSuccess={
              handleAssignEquipmentSuccess
            }
            preselectedUserId={
              selectedUserId ||
              undefined
            }
          />
        </DialogContent>
      </Dialog>

      {/* =====================================================
          USER DETAILS DIALOG
      ===================================================== */}

      <Dialog
        open={userDetailsOpen}
        onOpenChange={
          setUserDetailsOpen
        }
      >
        <DialogContent
          className="max-h-[85vh] overflow-y-auto border-emerald-500/20 bg-[#0D1730] text-white shadow-2xl sm:max-w-[750px]"
        >
          {selectedUser && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">
                  {isPT
                    ? 'Detalhes do utilizador'
                    : 'User details'}
                </DialogTitle>
              </DialogHeader>

              {/* USER HEADER */}

              <div
                className="rounded-xl border border-white/[0.07] bg-[#0A1328] p-5"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-lg font-bold text-emerald-400"
                  >
                    {getInitials(
                      selectedUser.full_name
                    )}
                  </div>

                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-white">
                      {selectedUser.full_name ||
                        (isPT
                          ? 'Sem nome'
                          : 'No name')}
                    </h2>

                    <p className="truncate text-sm text-white/40">
                      {selectedUser.email ||
                        '—'}
                    </p>
                  </div>

                  <div className="ml-auto">
                    {selectedUser.role ===
                    'admin' ? (
                      <Badge
                        className="border border-violet-500/20 bg-violet-500/10 text-violet-400"
                      >
                        <ShieldCheck className="mr-1.5 h-3.5 w-3.5" />

                        {isPT
                          ? 'Administrador'
                          : 'Administrator'}
                      </Badge>
                    ) : (
                      <Badge
                        className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      >
                        <Eye className="mr-1.5 h-3.5 w-3.5" />

                        {isPT
                          ? 'Utilizador'
                          : 'Viewer'}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* USER INFO */}

              <div
                className="mt-5 grid gap-3 sm:grid-cols-2"
              >
                <div
                  className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4"
                >
                  <p className="text-xs text-white/35">
                    {isPT
                      ? 'Departamento'
                      : 'Department'}
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {selectedUser.department ||
                      '—'}
                  </p>
                </div>

                <div
                  className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4"
                >
                  <p className="text-xs text-white/35">
                    {isPT
                      ? 'Cargo'
                      : 'Position'}
                  </p>

                  <p className="mt-1 text-sm text-white">
                    {selectedUser.position ||
                      '—'}
                  </p>
                </div>

                <div
                  className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4"
                >
                  <p className="text-xs text-white/35">
                    SAP
                  </p>

                  <p className="mt-1 font-mono text-sm text-white">
                    {selectedUser.sap_number ||
                      '—'}
                  </p>
                </div>

                <div
                  className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4"
                >
                  <p className="text-xs text-white/35">
                    ID
                  </p>

                  <p className="mt-1 truncate font-mono text-xs text-white/45">
                    {selectedUser.id}
                  </p>
                </div>
              </div>

              {/* EQUIPMENT */}

              <div className="mt-6">
                <div
                  className="mb-3 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold text-white">
                      {isPT
                        ? 'Equipamentos atribuídos'
                        : 'Assigned equipment'}
                    </h3>

                    <p className="mt-1 text-xs text-white/35">
                      {isPT
                        ? 'Equipamentos atualmente associados a este utilizador.'
                        : 'Equipment currently assigned to this user.'}
                    </p>
                  </div>

                  <span
                    className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400"
                  >
                    {
                      selectedUserEquipment.length
                    }
                  </span>
                </div>

                {selectedUserEquipment.length ===
                0 ? (
                  <div
                    className="rounded-lg border border-dashed border-white/10 bg-[#0A1328] py-10 text-center"
                  >
                    <Package
                      className="mx-auto mb-3 h-8 w-8 text-white/15"
                    />

                    <p className="text-sm text-white/35">
                      {isPT
                        ? 'Nenhum equipamento atribuído.'
                        : 'No equipment assigned.'}
                    </p>

                    {isAdmin && (
                      <Button
                        variant="outline"
                        onClick={() =>
                          openAssignEquipmentDialog(
                            selectedUser.id
                          )
                        }
                      className="mt-4 border-amber-500/20 bg-amber-500/5 text-amber-400 hover:border-amber-500/30 hover:bg-amber-500/10 hover:text-amber-300"
                    >
                      <Monitor className="mr-2 h-4 w-4" />

                      {isPT
                        ? 'Atribuir equipamento'
                        : 'Assign equipment'}
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedUserEquipment.map(
                      (equipment) => {
                        const EquipmentIcon =
                          getEquipmentIcon(
                            equipment
                          );

                        const statusInfo =
                          getStatus(
                            equipment.status
                          );

                        const StatusIcon =
                          statusInfo.icon;

                        return (
                          <div
                            key={equipment.id}
                            className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0A1328] p-3 transition hover:border-blue-500/20"
                          >
                            <div
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
                            >
                              <EquipmentIcon className="h-5 w-5 text-blue-400" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-white">
                                {equipment.brands?.name
                                  ? `${equipment.brands.name} `
                                  : ''}
                                {equipment.model ||
                                  equipment.name ||
                                  '—'}
                              </p>

                              <div
                                className="mt-1 flex flex-wrap items-center gap-2 text-xs text-white/35"
                              >
                                <span>
                                  S/N:{' '}
                                  {equipment.serial_number ||
                                    '—'}
                                </span>

                                {equipment.asset_tag && (
                                  <>
                                    <span>•</span>

                                    <span>
                                      {
                                        equipment.asset_tag
                                      }
                                    </span>
                                  </>
                                )}

                                {equipment.locations?.name && (
                                  <>
                                    <span>•</span>

                                    <span className="flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />

                                      {
                                        equipment
                                          .locations
                                          .name
                                      }
                                    </span>
                                  </>
                                )}
                              </div>
                            </div>

                            <Badge
                              className={`
                                hidden
                                border
                                sm:flex
                                ${statusInfo.className}
                              `}
                            >
                              <StatusIcon className="mr-1.5 h-3.5 w-3.5" />

                              {statusInfo.label}
                            </Badge>

                            <Button
                              size="icon"
                              variant="outline"
                              asChild
                              className="h-9 w-9 shrink-0 border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                              title={
                                isPT
                                  ? 'Ver equipamento'
                                  : 'View equipment'
                              }
                            >
                              <Link
                                to={`/equipment/${equipment.id}`}
                              >
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>

                            {isAdmin && (
                              <Button
                                size="icon"
                                variant="outline"
                                asChild
                                className="h-9 w-9 shrink-0 border-blue-500/20 bg-blue-500/5 text-blue-400 hover:border-blue-500/30 hover:bg-blue-500/10 hover:text-blue-300"
                                title={
                                  isPT
                                    ? 'Editar equipamento'
                                    : 'Edit equipment'
                                }
                              >
                                <Link
                                  to={`/equipment/${equipment.id}`}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Link>
                              </Button>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;