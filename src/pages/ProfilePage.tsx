import { useEffect, useMemo, useState } from 'react';
import {
  UserRound,
  Mail,
  BriefcaseBusiness,
  Building2,
  ShieldCheck,
  Pencil,
  LockKeyhole,
  CheckCircle2,
  Monitor,
  MapPin,
  Package,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface ProfileData {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  department: string | null;
  position: string | null;
  manager_id: string | null;
}

interface EquipmentData {
  id: string;
  name: string | null;
  model: string | null;
  serial_number: string | null;
  asset_tag: string | null;
  status: string | null;
  assigned_user: string | null;
  location_id: string | null;
}

const ProfilePage = () => {
  const { user } = useAuth();
  const { language } = useLanguage();

  const isPT = language === 'pt';

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [manager, setManager] = useState<ProfileData | null>(null);
  const [equipment, setEquipment] = useState<EquipmentData[]>([]);
  const [locations, setLocations] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');

  const loadProfile = async () => {
    if (!user?.id) return;

    setLoading(true);

    const { data: profileData, error: profileError } = await (
      supabase as any
    )
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        role,
        department,
        position,
        manager_id
      `)
      .eq('id', user.id)
      .maybeSingle();

    if (!profileError && profileData) {
      setProfile(profileData);
      setName(profileData.full_name || '');

      if (profileData.manager_id) {
        const { data: managerData } = await (
          supabase as any
        )
          .from('profiles')
          .select(`
            id,
            full_name,
            email,
            role,
            department,
            position,
            manager_id
          `)
          .eq('id', profileData.manager_id)
          .maybeSingle();

        if (managerData) {
          setManager(managerData);
        }
      }

      const { data: equipmentData } = await (
        supabase as any
      )
        .from('equipment')
        .select(`
          id,
          name,
          model,
          serial_number,
          asset_tag,
          status,
          assigned_user,
          location_id
        `)
        .eq('assigned_user', user.id);

      if (equipmentData) {
        setEquipment(equipmentData);

        const locationIds = equipmentData
          .map((item: EquipmentData) => item.location_id)
          .filter(Boolean);

        if (locationIds.length > 0) {
          const { data: locationData } = await (
            supabase as any
          )
            .from('locations')
            .select('id, name')
            .in('id', locationIds);

          if (locationData) {
            const locationMap: Record<string, string> = {};

            locationData.forEach(
              (location: { id: string; name: string }) => {
                locationMap[location.id] = location.name;
              }
            );

            setLocations(locationMap);
          }
        }
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const initials = useMemo(() => {
    const fullName = profile?.full_name || user?.name || 'User';

    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase();
  }, [profile, user]);

  const roleLabel =
    profile?.role === 'admin'
      ? isPT
        ? 'Administrador'
        : 'Administrator'
      : isPT
        ? 'Visualizador'
        : 'Viewer';

  const handleSave = async () => {
    if (!profile?.id) return;

    const trimmedName = name.trim();

    if (!trimmedName) return;

    const { error } = await (supabase as any)
      .from('profiles')
      .update({
        full_name: trimmedName,
      })
      .eq('id', profile.id);

    if (!error) {
      setProfile((current) =>
        current
          ? {
              ...current,
              full_name: trimmedName,
            }
          : current
      );

      setEditing(false);
    }
  };

  const getEquipmentStatus = (status: string | null) => {
    switch (status) {
      case 'active':
        return isPT ? 'Ativo' : 'Active';

      case 'maintenance':
        return isPT ? 'Manutenção' : 'Maintenance';

      case 'inactive':
        return isPT ? 'Inativo' : 'Inactive';

      case 'decommissioned':
        return isPT ? 'Desativado' : 'Decommissioned';

      default:
        return status || '—';
    }
  };

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8">

      {/* HEADER */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight text-white">
          {isPT ? 'Perfil' : 'Profile'}
        </h1>

        <p className="mt-1.5 text-sm text-white/35">
          {isPT
            ? 'Consulta e gere as informações da tua conta.'
            : 'View and manage your account information.'}
        </p>

      </div>

      {loading ? (
        <div className="flex min-h-[400px] items-center justify-center rounded-xl border border-white/[0.06] bg-[#0D1730]">
          <div className="flex items-center gap-2 text-xs text-white/35">

            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/10 border-t-blue-400" />

            {isPT ? 'A carregar perfil...' : 'Loading profile...'}

          </div>
        </div>
      ) : (
        <>

          {/* PROFILE HERO */}
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0D1730] p-6">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div className="flex items-center gap-5">

                {/* AVATAR */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-blue-500/20 bg-blue-500/10 text-xl font-semibold text-blue-400">
                  {initials}
                </div>

                {/* NAME */}
                <div className="min-w-0">

                  {editing ? (
                    <input
                      value={name}
                      onChange={(event) =>
                        setName(event.target.value)
                      }
                      className="h-10 w-full max-w-sm rounded-lg border border-blue-500/30 bg-[#0A1328] px-3 text-lg font-semibold text-white outline-none placeholder:text-white/20"
                    />
                  ) : (
                    <h2 className="truncate text-xl font-semibold tracking-tight text-white">
                      {profile?.full_name || 'Sem nome'}
                    </h2>
                  )}

                  <p className="mt-1 text-sm text-white/35">
                    {profile?.position || '—'}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-2">

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-[10px] font-medium text-blue-400">
                      <ShieldCheck className="h-3 w-3" />
                      {roleLabel}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-500/15 bg-emerald-500/[0.05] px-2.5 py-1 text-[10px] font-medium text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      {isPT ? 'Conta ativa' : 'Active account'}
                    </span>

                  </div>

                </div>

              </div>

              {/* ACTION */}
              <div className="flex gap-2">

                {editing ? (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setName(profile?.full_name || '');
                        setEditing(false);
                      }}
                      className="inline-flex h-9 items-center justify-center rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-xs font-medium text-white/50 transition hover:bg-white/[0.05] hover:text-white"
                    >
                      {isPT ? 'Cancelar' : 'Cancel'}
                    </button>

                    <button
                      type="button"
                      onClick={handleSave}
                      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-xs font-medium text-white transition hover:bg-blue-500"
                    >
                      {isPT ? 'Guardar' : 'Save'}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-xs font-medium text-white/55 transition hover:bg-white/[0.05] hover:text-white"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    {isPT ? 'Editar perfil' : 'Edit profile'}
                  </button>
                )}

              </div>

            </div>

          </div>

          {/* INFORMATION */}
          <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-2">

            {/* CONTACT */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Mail className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isPT ? 'Informação de contacto' : 'Contact information'}
                  </h3>

                  <p className="mt-1 text-[11px] text-white/30">
                    {isPT
                      ? 'Dados associados à tua conta.'
                      : 'Information associated with your account.'}
                  </p>
                </div>

              </div>

              <div className="space-y-3">

                <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
                  <Mail className="h-4 w-4 text-white/25" />

                  <div className="min-w-0">
                    <p className="text-[10px] text-white/25">
                      Email
                    </p>

                    <p className="mt-0.5 truncate text-xs text-white/60">
                      {profile?.email || user?.email || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
                  <BriefcaseBusiness className="h-4 w-4 text-white/25" />

                  <div>
                    <p className="text-[10px] text-white/25">
                      {isPT ? 'Cargo' : 'Position'}
                    </p>

                    <p className="mt-0.5 text-xs text-white/60">
                      {profile?.position || '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
                  <Building2 className="h-4 w-4 text-white/25" />

                  <div>
                    <p className="text-[10px] text-white/25">
                      {isPT ? 'Departamento' : 'Department'}
                    </p>

                    <p className="mt-0.5 text-xs text-white/60">
                      {profile?.department || '—'}
                    </p>
                  </div>
                </div>

              </div>

            </div>

            {/* ORGANIZATION */}
            <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <BriefcaseBusiness className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isPT ? 'Organização' : 'Organization'}
                  </h3>

                  <p className="mt-1 text-[11px] text-white/30">
                    {isPT
                      ? 'Relação dentro da estrutura da empresa.'
                      : 'Your position within the company structure.'}
                  </p>
                </div>

              </div>

              <div className="space-y-3">

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
                  <p className="text-[10px] text-white/25">
                    {isPT ? 'Responsável direto' : 'Direct manager'}
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    {manager?.full_name || '—'}
                  </p>

                  {manager?.position && (
                    <p className="mt-0.5 text-[10px] text-white/25">
                      {manager.position}
                    </p>
                  )}
                </div>

                <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] px-3 py-3">
                  <p className="text-[10px] text-white/25">
                    {isPT ? 'Função no sistema' : 'System role'}
                  </p>

                  <p className="mt-1 text-xs text-white/60">
                    {roleLabel}
                  </p>
                </div>

              </div>

            </div>

          </div>

          {/* SECURITY */}
          <div className="mb-5 rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <LockKeyhole className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isPT ? 'Segurança da conta' : 'Account security'}
                  </h3>

                  <p className="mt-1 text-[11px] text-white/30">
                    {isPT
                      ? 'Gere as opções de segurança da tua conta.'
                      : 'Manage your account security options.'}
                  </p>
                </div>

              </div>

              <button
                type="button"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.025] px-4 text-xs font-medium text-white/45 transition hover:bg-white/[0.05] hover:text-white"
              >
                <LockKeyhole className="h-3.5 w-3.5" />
                {isPT
                  ? 'Alterar palavra-passe'
                  : 'Change password'}
              </button>

            </div>

          </div>

          {/* EQUIPMENT */}
          <div className="rounded-xl border border-white/[0.06] bg-[#0D1730] p-5">

            <div className="mb-5 flex items-center justify-between gap-3">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <Monitor className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {isPT
                      ? 'Equipamentos atribuídos'
                      : 'Assigned equipment'}
                  </h3>

                  <p className="mt-1 text-[11px] text-white/30">
                    {isPT
                      ? 'Equipamento atualmente associado à tua conta.'
                      : 'Equipment currently assigned to your account.'}
                  </p>
                </div>

              </div>

              <span className="inline-flex min-w-7 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-[10px] font-semibold text-blue-400">
                {equipment.length}
              </span>

            </div>

            {equipment.length === 0 ? (
              <div className="flex min-h-[130px] flex-col items-center justify-center rounded-lg border border-dashed border-white/[0.07] bg-white/[0.015] text-center">

                <Package className="mb-2 h-6 w-6 text-white/15" />

                <p className="text-xs text-white/35">
                  {isPT
                    ? 'Nenhum equipamento atribuído.'
                    : 'No equipment assigned.'}
                </p>

              </div>
            ) : (
              <div className="space-y-2">

                {equipment.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 rounded-lg border border-white/[0.05] bg-white/[0.02] p-3 sm:flex-row sm:items-center"
                  >

                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.04] text-white/40">
                      <Monitor className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">

                      <p className="truncate text-xs font-medium text-white/70">
                        {item.name || item.model || 'Equipamento'}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">

                        {item.model && (
                          <span className="text-[10px] text-white/30">
                            {item.model}
                          </span>
                        )}

                        {item.asset_tag && (
                          <>
                            <span className="text-[10px] text-white/15">
                              •
                            </span>

                            <span className="text-[10px] text-white/30">
                              {item.asset_tag}
                            </span>
                          </>
                        )}

                        {item.serial_number && (
                          <>
                            <span className="text-[10px] text-white/15">
                              •
                            </span>

                            <span className="text-[10px] text-white/25">
                              {item.serial_number}
                            </span>
                          </>
                        )}

                      </div>

                    </div>

                    <div className="flex items-center gap-3">

                      {item.location_id && locations[item.location_id] && (
                        <span className="hidden items-center gap-1.5 text-[10px] text-white/30 md:inline-flex">
                          <MapPin className="h-3 w-3" />
                          {locations[item.location_id]}
                        </span>
                      )}

                      <span className="rounded-md border border-emerald-500/15 bg-emerald-500/[0.05] px-2 py-1 text-[9px] font-medium text-emerald-400">
                        {getEquipmentStatus(item.status)}
                      </span>

                    </div>

                  </div>
                ))}

              </div>
            )}

          </div>

        </>
      )}

    </div>
  );
};

export default ProfilePage;