import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useLanguage } from '@/context/LanguageContext';
import { useUserRole } from '@/hooks/useUserRole';
import NexaDatePicker from '@/components/ui/nexa-date-picker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

import { toast } from 'sonner';

import {
  ArrowLeft,
  Save,
  Trash2,
  Monitor,
  MonitorDown,
  Laptop,
  Headphones,
  Network,
  Printer,
  Server,
  Smartphone,
  Tablet,
  Tv,
  Users,
  CalendarDays,
  FileText,
  Plus,
  Package,
  CircleCheck,
  CirclePause,
  CircleX,
  Wrench,
  MapPin,
  Pencil,
  X,
} from 'lucide-react';

import { supabase } from '@/integrations/supabase/client';

interface Equipment {
  id?: number;
  name: string;
  model: string;
  serial_number: string;
  asset_tag: string;
  description: string;
  brand_id: number | null;
  equipment_type_id: number | null;
  assigned_user_id: string | null;
  department_id: number | null;
  location_id: number | null;
  supplier_id: number | null;
  invoice_id: number | null;
  purchase_date: string | null;
  warranty_end: string | null;
  status: string;
  condition: string;
  notes: string;
}

const EquipmentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { language } = useLanguage();
  // =======================================================
  // USER ROLE
  //
  // O role vem da tabela "profiles" através do hook
  // useUserRole(). Apenas o role "admin" pode criar,
  // editar ou eliminar equipamentos.
  // =======================================================

  const { role, loading: roleLoading } = useUserRole();

  const isAdmin = role === 'admin';

  const isNewEquipment = id === 'new';
  const isPT = language === 'pt';

  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [originalEquipment, setOriginalEquipment] =
    useState<Equipment | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  /*
   * NEW EQUIPMENT = EDIT MODE
   * EXISTING EQUIPMENT = VIEW MODE
   */
  const [isEditing, setIsEditing] = useState(isNewEquipment);

  const [users, setUsers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [equipmentTypes, setEquipmentTypes] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);

  /*
   * ---------------------------------------------------------
   * BRAND ICON
   * ---------------------------------------------------------
   */

  const getBrandIcon = (brandName: string) => {
    const name = brandName.toLowerCase();

    const base =
      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-white/[0.06] text-white/80';

    if (name.includes('apple')) {
      return (
        <span className={`${base} text-base`}>
          
        </span>
      );
    }

    if (name.includes('microsoft')) {
      return (
        <span className="grid h-7 w-7 shrink-0 grid-cols-2 gap-[2px] rounded-md p-1">
          <span className="rounded-[1px] bg-[#f25022]" />
          <span className="rounded-[1px] bg-[#7fba00]" />
          <span className="rounded-[1px] bg-[#00a4ef]" />
          <span className="rounded-[1px] bg-[#ffb900]" />
        </span>
      );
    }

    if (name.includes('dell')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-[8px] font-bold text-blue-400`}
        >
          DELL
        </span>
      );
    }

    if (name.includes('asus')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-[8px] font-bold text-blue-400`}
        >
          ASUS
        </span>
      );
    }

    if (name.includes('samsung')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-[7px] font-bold text-blue-400`}
        >
          SAM
        </span>
      );
    }

    if (name.includes('lenovo')) {
      return (
        <span
          className={`${base} bg-white/10 text-[8px] font-bold`}
        >
          LEN
        </span>
      );
    }

    if (name.includes('logitech')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-sm font-bold text-blue-400`}
        >
          G
        </span>
      );
    }

    if (name.includes('jabra')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-[10px] font-bold text-blue-400`}
        >
          J
        </span>
      );
    }

    if (name.includes('hp')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-sm font-bold text-blue-400`}
        >
          hp
        </span>
      );
    }

    if (name.includes('aoc')) {
      return (
        <span
          className={`${base} bg-blue-500/10 text-[8px] font-bold text-blue-400`}
        >
          AOC
        </span>
      );
    }

    return (
      <span className={base}>
        <Package className="h-4 w-4 text-white/40" />
      </span>
    );
  };

  /*
   * ---------------------------------------------------------
   * EQUIPMENT TYPE ICON
   * ---------------------------------------------------------
   */

  const getEquipmentTypeIcon = (typeName: string = '') => {
    const type = typeName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\\u0300-\\u036f]/g, '');

    if (
      type.includes('desktop') ||
      type.includes('pc')
    ) {
      return <Monitor className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('docking') ||
      type.includes('dock')
    ) {
      return <MonitorDown className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('headset') ||
      type.includes('headphone') ||
      type.includes('auscultador')
    ) {
      return <Headphones className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('laptop') ||
      type.includes('portatil') ||
      type.includes('notebook')
    ) {
      return <Laptop className="h-4 w-4 text-blue-400" />;
    }

    if (type === 'monitor' || type.includes('monitor')) {
      return <Monitor className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('network') ||
      type.includes('switch') ||
      type.includes('rede')
    ) {
      return <Network className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('printer') ||
      type.includes('impressora')
    ) {
      return <Printer className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('server') ||
      type.includes('servidor') ||
      type.includes('torre')
    ) {
      return <Server className="h-4 w-4 text-blue-400" />;
    }

    if (
      type.includes('smartphone') ||
      type.includes('mobile') ||
      type.includes('telemovel') ||
      type.includes('telefone')
    ) {
      return <Smartphone className="h-4 w-4 text-blue-400" />;
    }

    if (type.includes('tablet')) {
      return <Tablet className="h-4 w-4 text-blue-400" />;
    }

    if (
      type === 'tv' ||
      type.includes('televisao') ||
      type.includes('televis')
    ) {
      return <Tv className="h-4 w-4 text-blue-400" />;
    }

    return <Package className="h-4 w-4 text-white/40" />;
  };

  /*
   * ---------------------------------------------------------
   * STATUS
   * ---------------------------------------------------------
   */

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'active':
        return {
          label: isPT ? 'Ativo' : 'Active',
          icon: CircleCheck,
          className:
            'border-emerald-500/20 bg-emerald-500/10 text-emerald-400',
        };

      case 'maintenance':
        return {
          label: isPT ? 'Manutenção' : 'Maintenance',
          icon: Wrench,
          className:
            'border-amber-500/20 bg-amber-500/10 text-amber-400',
        };

      case 'inactive':
        return {
          label: isPT ? 'Inativo' : 'Inactive',
          icon: CirclePause,
          className:
            'border-white/10 bg-white/5 text-white/50',
        };

      case 'decommissioned':
        return {
          label: isPT ? 'Desativado' : 'Decommissioned',
          icon: CircleX,
          className:
            'border-red-500/20 bg-red-500/10 text-red-400',
        };

      default:
        return {
          label: status,
          icon: CirclePause,
          className:
            'border-white/10 bg-white/5 text-white/50',
        };
    }
  };

  /*
   * ---------------------------------------------------------
   * ROLE LOADING
   *
   * Esperamos pelo carregamento do role antes de apresentar
   * as ações administrativas.
   * ---------------------------------------------------------
   */

  if (roleLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center bg-[#080D1F] text-white">
        <div className="text-sm text-white/40">
          {isPT ? 'A carregar...' : 'Loading...'}
        </div>
      </div>
    );
  }

  /*
   * ---------------------------------------------------------
   * LOAD
   * ---------------------------------------------------------
   */

  useEffect(() => {
    loadLists();

    if (isNewEquipment) {
      const newEquipment: Equipment = {
        name: '',
        model: '',
        serial_number: '',
        asset_tag: '',
        description: '',
        brand_id: null,
        equipment_type_id: null,
        assigned_user_id: null,
        department_id: null,
        location_id: null,
        supplier_id: null,
        invoice_id: null,
        purchase_date: null,
        warranty_end: null,
        status: 'active',
        condition: 'good',
        notes: '',
      };

      setEquipment(newEquipment);
      setOriginalEquipment(newEquipment);
      setIsEditing(true);
      setLoading(false);
    } else if (id) {
      setIsEditing(false);
      loadEquipment();
      loadInvoices();
    }
  }, [id]);

  /*
   * ---------------------------------------------------------
   * LOAD LISTS
   * ---------------------------------------------------------
   */

  async function loadLists() {
    const [
      brandsRes,
      typesRes,
      locationsRes,
      usersRes,
    ] = await Promise.all([
      supabase
        .from('brands')
        .select('*')
        .order('name'),

      supabase
        .from('equipment_types')
        .select('*')
        .order('name'),

      supabase
        .from('locations')
        .select('*')
        .order('name'),

      supabase
        .from('profiles')
        .select('id, full_name')
        .order('full_name'),
    ]);

    setBrands(brandsRes.data ?? []);
    setEquipmentTypes(typesRes.data ?? []);
    setLocations(locationsRes.data ?? []);
    setUsers(usersRes.data ?? []);
  }

  /*
   * ---------------------------------------------------------
   * LOAD EQUIPMENT
   * ---------------------------------------------------------
   */

  async function loadEquipment() {
    if (!id) return;

    setLoading(true);

    const { data, error } = await supabase
      .from('equipment')
      .select('*')
      .eq('id', Number(id))
      .single();

    if (error) {
      toast.error(error.message);
      navigate('/equipment');
      return;
    }

    const loadedEquipment: Equipment = {
      id: data.id,
      name: data.name ?? '',
      model: data.model ?? '',
      serial_number: data.serial_number ?? '',
      asset_tag: data.asset_tag ?? '',
      description: data.notes ?? '',
      brand_id: data.brand_id ?? null,
      equipment_type_id: data.equipment_type_id ?? null,
      assigned_user_id: data.assigned_user ?? null,
      department_id: data.department_id ?? null,
      location_id: data.location_id ?? null,
      supplier_id: data.supplier_id ?? null,
      invoice_id: null,
      purchase_date: data.purchase_date ?? null,
      warranty_end: data.warranty_end ?? null,
      status: data.status ?? 'active',
      condition: 'good',
      notes: data.notes ?? '',
    };

    setEquipment(loadedEquipment);
    setOriginalEquipment(loadedEquipment);

    setLoading(false);
  }

  /*
   * ---------------------------------------------------------
   * LOAD INVOICES
   * ---------------------------------------------------------
   */

  async function loadInvoices() {
    if (!id) return;

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('equipment_id', Number(id))
      .order('invoice_date', {
        ascending: false,
      });

    if (error) {
      console.error('ERRO INVOICES:', error);
      return;
    }

    setInvoices(data ?? []);
  }

  /*
   * ---------------------------------------------------------
   * INPUT CHANGE
   * ---------------------------------------------------------
   */

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    if (!equipment || !isEditing) return;

    const { name, value } = e.target;

    setEquipment({
      ...equipment,
      [name]: value,
    });
  };

  /*
   * ---------------------------------------------------------
   * EDIT
   * ---------------------------------------------------------
   */

  const handleEdit = () => {
    if (!isAdmin) return;

    setIsEditing(true);
  };

  /*
   * ---------------------------------------------------------
   * CANCEL EDIT
   * ---------------------------------------------------------
   */

  const handleCancel = () => {
    if (isNewEquipment) {
      navigate('/equipment');
      return;
    }

    if (originalEquipment) {
      setEquipment({
        ...originalEquipment,
      });
    }

    setIsEditing(false);
  };

  /*
   * ---------------------------------------------------------
   * SAVE
   * ---------------------------------------------------------
   */

  // =======================================================
  // SAVE EQUIPMENT
  //
  // Apenas Admin pode criar ou editar equipamentos.
  // =======================================================

  const handleSave = async () => {
    if (!isAdmin || !equipment) return;

    if (!equipment.name.trim()) {
      toast.error(
        isPT
          ? 'O nome do equipamento é obrigatório.'
          : 'Equipment name is required.'
      );

      return;
    }

    setSaving(true);

    try {
      const payload = {
        name: equipment.name,
        model: equipment.model,
        serial_number: equipment.serial_number,
        asset_tag: equipment.asset_tag,
        notes:
          equipment.notes ||
          equipment.description ||
          null,
        brand_id: equipment.brand_id,
        equipment_type_id:
          equipment.equipment_type_id,
        assigned_user:
          equipment.assigned_user_id,
        department_id:
          equipment.department_id,
        location_id:
          equipment.location_id,
        supplier_id:
          equipment.supplier_id,
        purchase_date:
          equipment.purchase_date,
        warranty_end:
          equipment.warranty_end,
        status: equipment.status,
      };

      let error;

      /*
       * NEW
       */

      if (isNewEquipment) {
        ({ error } = await supabase
          .from('equipment')
          .insert(payload));
      }

      /*
       * UPDATE
       */

      else {
        ({ error } = await supabase
          .from('equipment')
          .update(payload)
          .eq('id', equipment.id));
      }

      if (error) {
        throw error;
      }

      /*
       * NEW EQUIPMENT
       */

      if (isNewEquipment) {
        toast.success(
          isPT
            ? 'Equipamento criado com sucesso!'
            : 'Equipment created successfully!'
        );

        navigate('/equipment');
        return;
      }

      /*
       * EXISTING EQUIPMENT
       */

      const updatedEquipment = {
        ...equipment,
      };

      setEquipment(updatedEquipment);
      setOriginalEquipment(updatedEquipment);
      setIsEditing(false);

      toast.success(
        isPT
          ? 'Equipamento atualizado com sucesso!'
          : 'Equipment updated successfully!'
      );
    } catch (error: any) {
      toast.error(
        error.message ||
          (isPT
            ? 'Erro ao guardar equipamento.'
            : 'Error saving equipment.')
      );
    } finally {
      setSaving(false);
    }
  };

  /*
   * ---------------------------------------------------------
   * DELETE
   * ---------------------------------------------------------
   */

  // =======================================================
  // DELETE EQUIPMENT
  //
  // Apenas Admin pode eliminar equipamentos.
  // A proteção visual do botão existe na interface, mas esta
  // verificação também impede a execução pelo handler.
  // =======================================================

  const handleDelete = async () => {
    if (!isAdmin || !equipment?.id) return;

    try {
      const { error } = await supabase
        .from('equipment')
        .delete()
        .eq('id', equipment.id);

      if (error) {
        throw error;
      }

      toast.success(
        isPT
          ? 'Equipamento eliminado com sucesso!'
          : 'Equipment deleted successfully!'
      );

      navigate('/equipment');
    } catch (error: any) {
      toast.error(
        error.message ||
          (isPT
            ? 'Erro ao eliminar equipamento.'
            : 'Error deleting equipment.')
      );
    }
  };

  /*
   * ---------------------------------------------------------
   * LOADING
   * ---------------------------------------------------------
   */

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-white/50">
          {isPT
            ? 'A carregar...'
            : 'Loading...'}
        </div>
      </div>
    );
  }

  if (!equipment) {
    return null;
  }

  /*
   * ---------------------------------------------------------
   * STYLES
   * ---------------------------------------------------------
   */

  const sectionClass =
    'relative rounded-xl border border-blue-500/20 bg-[#0D1730] shadow-[0_8px_30px_rgba(0,0,0,0.15)]';

  const inputClass =
    'border-white/10 bg-[#0A1328] text-white placeholder:text-white/30 focus:border-blue-500/50 focus:ring-blue-500/20 disabled:cursor-default disabled:opacity-100 disabled:text-white/80';

  const labelClass =
    'mb-2 block text-[13px] font-medium text-white/80';

  const selectItemClass = `
    cursor-pointer
    rounded-lg
    py-2.5
    outline-none
    transition-all
    duration-150
    focus:bg-blue-500/15
    focus:text-white
    data-[highlighted]:bg-blue-500/15
    data-[highlighted]:text-white
  `;

  const statusInfo = getStatusInfo(equipment.status);
  const StatusIcon = statusInfo.icon;

  const selectedBrand = brands.find(
    (brand) => brand.id === equipment.brand_id
  );

  const selectedType = equipmentTypes.find(
    (type) => type.id === equipment.equipment_type_id
  );

  const selectedUser = users.find(
    (user) => user.id === equipment.assigned_user_id
  );

  const selectedLocation = locations.find(
    (location) => location.id === equipment.location_id
  );

  /*
   * ---------------------------------------------------------
   * PAGE
   * ---------------------------------------------------------
   */

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white">

      <div className="space-y-5">

        {/* =====================================================
            TOP
        ===================================================== */}

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">

          <div className="min-w-0">

            <button
              type="button"
              onClick={() =>
                navigate('/equipment')
              }
              className="mb-3 flex items-center gap-2 text-sm text-blue-400 transition hover:text-blue-300"
            >
              <ArrowLeft className="h-4 w-4" />

              {isPT
                ? 'Voltar aos equipamentos'
                : 'Back to equipment'}
            </button>

            {/* EXISTING EQUIPMENT */}

            {!isNewEquipment && !isEditing ? (
              <>
                <div className="flex flex-wrap items-center gap-3">

                  <h1 className="text-3xl font-bold tracking-tight text-white">
                    {equipment.name}
                  </h1>

                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      border
                      px-2.5
                      py-1
                      text-xs
                      font-medium
                      ${statusInfo.className}
                    `}
                  >
                    <StatusIcon className="h-3.5 w-3.5" />

                    {statusInfo.label}
                  </span>

                </div>

                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-white/40">

                  {equipment.model && (
                    <span>
                      {equipment.model}
                    </span>
                  )}

                  {equipment.model &&
                    equipment.asset_tag && (
                      <span className="text-white/15">
                        •
                      </span>
                    )}

                  {equipment.asset_tag && (
                    <span>
                      {equipment.asset_tag}
                    </span>
                  )}

                  {equipment.serial_number && (
                    <>
                      <span className="text-white/15">
                        •
                      </span>

                      <span>
                        S/N {equipment.serial_number}
                      </span>
                    </>
                  )}

                </div>

                <p className="mt-2 text-sm text-white/45">
                  {isPT
                    ? 'Consulta a informação e configuração deste equipamento.'
                    : 'View the information and configuration of this equipment.'}
                </p>
              </>
            ) : (
              <>
                <h1 className="text-3xl font-bold tracking-tight text-white">

                  {isNewEquipment
                    ? isPT
                      ? 'Adicionar Equipamento'
                      : 'Add Equipment'
                    : isPT
                      ? 'Editar Equipamento'
                      : 'Edit Equipment'}

                </h1>

                <p className="mt-1 text-sm text-white/45">

                  {isNewEquipment
                    ? isPT
                      ? 'Regista um novo equipamento no inventário da organização.'
                      : 'Register a new piece of equipment in the organization inventory.'
                    : isPT
                      ? 'Atualiza a informação deste equipamento.'
                      : 'Update the information for this equipment.'}

                </p>
              </>
            )}

          </div>

          {/* ACTIONS */}

          <div className="flex shrink-0 items-center gap-3">

            {/* DELETE */}

            {!isNewEquipment && isAdmin && (

              <AlertDialog>

                <AlertDialogTrigger asChild>

                  <Button
                    variant="outline"
                    className="border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                  >

                    <Trash2 className="mr-2 h-4 w-4" />

                    {isPT
                      ? 'Eliminar'
                      : 'Delete'}

                  </Button>

                </AlertDialogTrigger>

                <AlertDialogContent className="border-white/10 bg-[#0D1730] text-white">

                  <AlertDialogHeader>

                    <AlertDialogTitle>

                      {isPT
                        ? 'Eliminar equipamento?'
                        : 'Delete equipment?'}

                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-white/50">

                      {isPT
                        ? 'Esta ação não pode ser anulada.'
                        : 'This action cannot be undone.'}

                    </AlertDialogDescription>

                  </AlertDialogHeader>

                  <AlertDialogFooter>

                    <AlertDialogCancel
                      className="border-white/10 bg-white/5 text-white hover:bg-white/10"
                    >
                      {isPT
                        ? 'Cancelar'
                        : 'Cancel'}
                    </AlertDialogCancel>

                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-500 text-white hover:bg-red-600"
                    >
                      {isPT
                        ? 'Eliminar'
                        : 'Delete'}
                    </AlertDialogAction>

                  </AlertDialogFooter>

                </AlertDialogContent>

              </AlertDialog>

            )}

            {/* VIEW MODE → EDIT */}

            {!isNewEquipment &&
              !isEditing &&
              isAdmin && (

                <Button
                  onClick={handleEdit}
                  className="h-10 bg-blue-600 px-5 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
                >

                  <Pencil className="mr-2 h-4 w-4" />

                  {isPT
                    ? 'Editar equipamento'
                    : 'Edit equipment'}

                </Button>
              )}

            {/* EDIT MODE → SAVE */}

            {isEditing && isAdmin && (

              <Button
                onClick={handleSave}
                disabled={saving}
                className="h-10 bg-blue-600 px-5 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
              >

                <Save className="mr-2 h-4 w-4" />

                {saving
                  ? isPT
                    ? 'A guardar...'
                    : 'Saving...'
                  : isPT
                    ? 'Guardar alterações'
                    : 'Save changes'}

              </Button>

            )}

          </div>

        </div>

        {/* =====================================================
            INFORMATION
        ===================================================== */}

        <section className={sectionClass}>

          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <Monitor className="h-5 w-5" />
            </div>

            <div>

              <h2 className="font-semibold text-white">

                {isPT
                  ? 'Informação do Equipamento'
                  : 'Equipment Information'}

              </h2>

              <p className="text-xs text-white/40">

                {isEditing
                  ? isPT
                    ? 'Preenche os dados principais do equipamento.'
                    : 'Enter the main equipment information.'
                  : isPT
                    ? 'Informação principal do equipamento.'
                    : 'Main equipment information.'}

              </p>

            </div>

          </div>

          <div className="grid gap-5 p-5 lg:grid-cols-2">

            {/* LEFT */}

            <div className="space-y-5">

              {/* NAME */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Nome'
                    : 'Name'}

                  {isEditing && (
                    <span className="ml-1 text-blue-400">
                      *
                    </span>
                  )}

                </label>

                <Input
                  name="name"
                  value={equipment.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={
                    isPT
                      ? 'Ex: Portátil Dell Latitude 5450'
                      : 'Ex: Dell Latitude 5450 Laptop'
                  }
                  className={`${inputClass} h-11`}
                />

              </div>

              {/* BRAND */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Marca'
                    : 'Brand'}

                  {isEditing && (
                    <span className="ml-1 text-blue-400">
                      *
                    </span>
                  )}

                </label>

                <Select
                  value={
                    equipment.brand_id?.toString() ?? ''
                  }
                  onValueChange={(value) =>
                    setEquipment({
                      ...equipment,
                      brand_id: Number(value),
                    })
                  }
                  disabled={!isEditing}
                >

                  <SelectTrigger
                    className={`h-11 ${inputClass}`}
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Selecionar marca'
                          : 'Select brand'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
                  >

                    {brands.map((brand) => (

                      <SelectItem
                        key={brand.id}
                        value={brand.id.toString()}
                        className={selectItemClass}
                      >

                        <div className="flex items-center gap-3">

                          {getBrandIcon(
                            brand.name
                          )}

                          <span>
                            {brand.name}
                          </span>

                        </div>

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              {/* MODEL */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Modelo'
                    : 'Model'}

                </label>

                <Input
                  name="model"
                  value={equipment.model}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={
                    isPT
                      ? 'Ex: Latitude 5450'
                      : 'Ex: Latitude 5450'
                  }
                  className={`${inputClass} h-11`}
                />

              </div>

              {/* SERIAL */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Número de Série'
                    : 'Serial Number'}

                </label>

                <Input
                  name="serial_number"
                  value={equipment.serial_number}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Ex: ABC123XYZ"
                  className={`${inputClass} h-11`}
                />

              </div>

            </div>

            {/* RIGHT */}

            <div className="space-y-5">

              {/* TYPE */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Tipo de Equipamento'
                    : 'Equipment Type'}

                  {isEditing && (
                    <span className="ml-1 text-blue-400">
                      *
                    </span>
                  )}

                </label>

                <Select
                  value={
                    equipment.equipment_type_id?.toString() ?? ''
                  }
                  onValueChange={(value) =>
                    setEquipment({
                      ...equipment,
                      equipment_type_id:
                        Number(value),
                    })
                  }
                  disabled={!isEditing}
                >

                  <SelectTrigger
                    className={`h-11 ${inputClass}`}
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Selecionar tipo'
                          : 'Select type'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
                  >

                    {equipmentTypes.map((type) => (

                      <SelectItem
                        key={type.id}
                        value={type.id.toString()}
                        className={selectItemClass}
                      >

                        <div className="flex items-center gap-3">

                          {getEquipmentTypeIcon(type.name)}

                          <span>
                            {type.name}
                          </span>

                        </div>

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              {/* ASSET TAG */}

              <div>

                <label className={labelClass}>
                  Asset Tag
                </label>

                <Input
                  name="asset_tag"
                  value={equipment.asset_tag}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Ex: IT-0001"
                  className={`${inputClass} h-11`}
                />

              </div>

              {/* DESCRIPTION */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Descrição'
                    : 'Description'}

                </label>

                <Textarea
                  name="description"
                  value={equipment.description}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder={
                    isPT
                      ? 'Descrição do equipamento...'
                      : 'Equipment description...'
                  }
                  rows={5}
                  className={`${inputClass} resize-none`}
                />

              </div>

            </div>

          </div>

        </section>

        {/* =====================================================
            ASSIGNMENT + STATUS
        ===================================================== */}

        <div className="grid gap-5 lg:grid-cols-2">

          {/* ASSIGNMENT */}

          <section className={sectionClass}>

            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <Users className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-semibold text-white">

                  {isPT
                    ? 'Atribuição e Localização'
                    : 'Assignment & Location'}

                </h2>

                <p className="text-xs text-white/40">

                  {isPT
                    ? 'Define a quem o equipamento está atribuído e onde se encontra.'
                    : 'Define who the equipment is assigned to and where it is located.'}

                </p>

              </div>

            </div>

            <div className="space-y-5 p-5">

              {/* USER */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Utilizador Atribuído'
                    : 'Assigned User'}

                </label>

                <Select
                  value={
                    equipment.assigned_user_id ||
                    '__none__'
                  }
                  onValueChange={(value) =>
                    setEquipment({
                      ...equipment,
                      assigned_user_id:
                        value === '__none__'
                          ? null
                          : value,
                    })
                  }
                  disabled={!isEditing}
                >

                  <SelectTrigger
                    className={`h-11 ${inputClass}`}
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Selecionar utilizador'
                          : 'Select user'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
                  >

                    <SelectItem
                      value="__none__"
                      className={selectItemClass}
                    >

                      <div className="flex items-center gap-3">

                        <Users className="h-4 w-4 text-white/40" />

                        <span>
                          {isPT
                            ? 'Nenhum'
                            : 'None'}
                        </span>

                      </div>

                    </SelectItem>

                    {users.map((user) => (

                      <SelectItem
                        key={user.id}
                        value={user.id}
                        className={selectItemClass}
                      >

                        <div className="flex items-center gap-3">

                          <Users className="h-4 w-4 text-blue-400/70" />

                          <span>
                            {user.full_name ||
                              user.id}
                          </span>

                        </div>

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

              {/* LOCATION */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Localização'
                    : 'Location'}

                </label>

                <Select
                  value={
                    equipment.location_id?.toString() ?? ''
                  }
                  onValueChange={(value) =>
                    setEquipment({
                      ...equipment,
                      location_id:
                        Number(value),
                    })
                  }
                  disabled={!isEditing}
                >

                  <SelectTrigger
                    className={`h-11 ${inputClass}`}
                  >
                    <SelectValue
                      placeholder={
                        isPT
                          ? 'Selecionar localização'
                          : 'Select location'
                      }
                    />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
                  >

                    {locations.map((location) => (

                      <SelectItem
                        key={location.id}
                        value={location.id.toString()}
                        className={selectItemClass}
                      >

                        <div className="flex items-center gap-3">

                          <MapPin className="h-4 w-4 text-blue-400/70" />

                          <span>
                            {location.name}
                          </span>

                        </div>

                      </SelectItem>

                    ))}

                  </SelectContent>

                </Select>

              </div>

            </div>

          </section>

          {/* STATUS */}

          <section className={`${sectionClass} z-30`}>

            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">

              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                <CalendarDays className="h-5 w-5" />
              </div>

              <div>

                <h2 className="font-semibold text-white">

                  {isPT
                    ? 'Estado e Datas'
                    : 'Status & Dates'}

                </h2>

                <p className="text-xs text-white/40">

                  {isPT
                    ? 'Define o estado atual e datas relevantes.'
                    : 'Define the current status and relevant dates.'}

                </p>

              </div>

            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2">

              {/* STATUS */}

              <div>

                <label className={labelClass}>

                  {isPT
                    ? 'Estado'
                    : 'Status'}

                  {isEditing && (
                    <span className="ml-1 text-blue-400">
                      *
                    </span>
                  )}

                </label>

                <Select
                  value={equipment.status}
                  onValueChange={(value) =>
                    setEquipment({
                      ...equipment,
                      status: value,
                    })
                  }
                  disabled={!isEditing}
                >

                  <SelectTrigger
                    className={`h-11 ${inputClass}`}
                  >
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent
                    className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
                  >

                    <SelectItem
                      value="active"
                      className={selectItemClass}
                    >
                      <div className="flex items-center gap-3">
                        <CircleCheck className="h-4 w-4 text-emerald-400" />
                        <span>
                          {isPT ? 'Ativo' : 'Active'}
                        </span>
                      </div>
                    </SelectItem>

                    <SelectItem
                      value="maintenance"
                      className={selectItemClass}
                    >
                      <div className="flex items-center gap-3">
                        <Wrench className="h-4 w-4 text-amber-400" />
                        <span>
                          {isPT
                            ? 'Manutenção'
                            : 'Maintenance'}
                        </span>
                      </div>
                    </SelectItem>

                    <SelectItem
                      value="inactive"
                      className={selectItemClass}
                    >
                      <div className="flex items-center gap-3">
                        <CirclePause className="h-4 w-4 text-white/40" />
                        <span>
                          {isPT
                            ? 'Inativo'
                            : 'Inactive'}
                        </span>
                      </div>
                    </SelectItem>

                    <SelectItem
                      value="decommissioned"
                      className={selectItemClass}
                    >
                      <div className="flex items-center gap-3">
                        <CircleX className="h-4 w-4 text-red-400" />
                        <span>
                          {isPT
                            ? 'Desativado'
                            : 'Decommissioned'}
                        </span>
                      </div>
                    </SelectItem>

                  </SelectContent>

                </Select>

              </div>

              {/* DATES */}

              <div className="space-y-5">

                {/* PURCHASE DATE */}

                <div>

                  <label className={labelClass}>

                    {isPT
                      ? 'Data de Aquisição'
                      : 'Purchase Date'}

                  </label>

                  <NexaDatePicker
                    value={equipment.purchase_date}
                    onChange={(value) =>
                      setEquipment({
                        ...equipment,
                        purchase_date: value,
                      })
                    }
                    disabled={!isEditing}
                  />

                </div>

                {/* WARRANTY */}

                <div>

                  <label className={labelClass}>

                    {isPT
                      ? 'Data de Fim de Garantia'
                      : 'Warranty End Date'}

                  </label>

                  <NexaDatePicker
                    value={equipment.warranty_end}
                    onChange={(value) =>
                      setEquipment({
                        ...equipment,
                        warranty_end: value,
                      })
                    }
                    disabled={!isEditing}
                  />

                </div>

              </div>

            </div>

          </section>

        </div>

        {/* =====================================================
            QUICK SUMMARY - VIEW MODE
        ===================================================== */}

        {!isNewEquipment && !isEditing && (

          <section className={sectionClass}>

            <div className="border-b border-white/[0.07] px-5 py-4">

              <h2 className="font-semibold text-white">

                {isPT
                  ? 'Resumo'
                  : 'Summary'}

              </h2>

              <p className="text-xs text-white/40">

                {isPT
                  ? 'Informação associada ao equipamento.'
                  : 'Information associated with this equipment.'}

              </p>

            </div>

            <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4">

                <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
                  <Package className="h-4 w-4" />
                  {isPT ? 'Marca' : 'Brand'}
                </div>

                <div className="flex items-center gap-2 font-medium text-white">

                  {selectedBrand &&
                    getBrandIcon(
                      selectedBrand.name
                    )}

                  <span>
                    {selectedBrand?.name ||
                      '—'}
                  </span>

                </div>

              </div>

              <div className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4">

                <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
                  {getEquipmentTypeIcon(selectedType?.name)}
                  {isPT ? 'Tipo' : 'Type'}
                </div>

                <p className="font-medium text-white">
                  {selectedType?.name || '—'}
                </p>

              </div>

              <div className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4">

                <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
                  <Users className="h-4 w-4" />
                  {isPT
                    ? 'Utilizador'
                    : 'User'}
                </div>

                <p className="font-medium text-white">
                  {selectedUser?.full_name ||
                    (isPT
                      ? 'Não atribuído'
                      : 'Unassigned')}
                </p>

              </div>

              <div className="rounded-lg border border-white/[0.07] bg-[#0A1328] p-4">

                <div className="mb-2 flex items-center gap-2 text-xs text-white/40">
                  <MapPin className="h-4 w-4" />
                  {isPT
                    ? 'Localização'
                    : 'Location'}
                </div>

                <p className="font-medium text-white">
                  {selectedLocation?.name ||
                    '—'}
                </p>

              </div>

            </div>

          </section>

        )}

        {/* =====================================================
            NOTES
        ===================================================== */}

        <section className={sectionClass}>

          <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
              <FileText className="h-5 w-5" />
            </div>

            <div>

              <h2 className="font-semibold text-white">

                {isPT
                  ? 'Notas Adicionais'
                  : 'Additional Notes'}

              </h2>

              <p className="text-xs text-white/40">

                {isPT
                  ? 'Informações adicionais sobre o equipamento.'
                  : 'Additional information about the equipment.'}

              </p>

            </div>

          </div>

          <div className="p-5">

            <Textarea
              name="notes"
              value={equipment.notes}
              onChange={handleChange}
              disabled={!isEditing}
              placeholder={
                isPT
                  ? 'Notas adicionais...'
                  : 'Additional notes...'
              }
              rows={4}
              className={`${inputClass} resize-none`}
            />

          </div>

        </section>

        {/* =====================================================
            INVOICES
        ===================================================== */}

        {!isNewEquipment && (

          <section className={sectionClass}>

            <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-4">

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/15 text-blue-400">
                  <Package className="h-5 w-5" />
                </div>

                <div>

                  <h2 className="font-semibold text-white">

                    {isPT
                      ? 'Faturas do Equipamento'
                      : 'Equipment Invoices'}

                  </h2>

                  <p className="text-xs text-white/40">

                    {isPT
                      ? 'Faturas associadas a este equipamento.'
                      : 'Invoices associated with this equipment.'}

                  </p>

                </div>

              </div>

              {isAdmin && (

                <Button
                  variant="outline"
                  asChild
                  className="border-white/10 bg-white/[0.03] text-white hover:bg-blue-500/10 hover:text-blue-400"
                >

                  <a
                    href={`/invoices/new?equipmentId=${id}`}
                  >

                    <Plus className="mr-2 h-4 w-4" />

                    {isPT
                      ? 'Adicionar'
                      : 'Add'}

                  </a>

                </Button>

              )}

            </div>

            <div className="p-5">

              {invoices.length > 0 ? (

                <div className="space-y-2">

                  {invoices.map((invoice) => (

                    <div
                      key={invoice.id}
                      className="flex flex-col gap-3 rounded-lg border border-white/[0.07] bg-[#0A1328] p-4 transition hover:border-blue-500/20 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="flex items-center gap-3">

                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5">
                          <FileText className="h-4 w-4 text-white/50" />
                        </div>

                        <div>

                          <p className="font-medium text-white">
                            {invoice.invoice_number}
                          </p>

                          <p className="text-xs text-white/40">
                            {invoice.invoice_date}
                          </p>

                        </div>

                      </div>

                      <div className="flex items-center gap-4">

                        <span className="font-semibold text-white">

                          {new Intl.NumberFormat(
                            'pt-PT',
                            {
                              style: 'currency',
                              currency: 'EUR',
                            }
                          ).format(
                            invoice.total ?? 0
                          )}

                        </span>

                        <Button
                          size="sm"
                          variant="outline"
                          asChild
                          className="border-white/10 bg-white/[0.03] text-white hover:bg-blue-500/10 hover:text-blue-400"
                        >

                          <a
                            href={`/invoices/${invoice.id}`}
                          >
                            {isPT
                              ? 'Ver'
                              : 'View'}
                          </a>

                        </Button>

                      </div>

                    </div>

                  ))}

                </div>

              ) : (

                <div className="rounded-lg border border-dashed border-white/10 py-10 text-center">

                  <FileText className="mx-auto mb-3 h-8 w-8 text-white/20" />

                  <p className="text-sm text-white/40">

                    {isPT
                      ? 'Nenhuma fatura associada.'
                      : 'No invoices associated.'}

                  </p>

                  {isAdmin && (

                    <Button
                      variant="link"
                      asChild
                      className="mt-2 text-blue-400"
                    >

                      <a
                        href={`/invoices/new?equipmentId=${id}`}
                      >

                        {isPT
                          ? 'Adicionar fatura'
                          : 'Add invoice'}

                      </a>

                    </Button>

                  )}

                </div>

              )}

            </div>

          </section>

        )}

        {/* =====================================================
            BOTTOM ACTIONS
        ===================================================== */}

        {isEditing && isAdmin && (

          <div className="flex items-center justify-end gap-3 border-t border-white/[0.07] pt-5">

            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="border-white/10 bg-white/[0.03] text-white hover:bg-blue-500/10 hover:text-blue-400"
            >

              <X className="mr-2 h-4 w-4" />

              {isNewEquipment
                ? isPT
                  ? 'Cancelar'
                  : 'Cancel'
                : isPT
                  ? 'Cancelar alterações'
                  : 'Cancel changes'}

            </Button>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 px-6 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
            >

              <Save className="mr-2 h-4 w-4" />

              {saving
                ? isPT
                  ? 'A guardar...'
                  : 'Saving...'
                : isPT
                  ? 'Guardar equipamento'
                  : 'Save equipment'}

            </Button>

          </div>

        )}

      </div>

    </div>
  );
};

export default EquipmentDetail;