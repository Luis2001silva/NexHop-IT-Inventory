import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { Textarea } from '@/components/ui/textarea';
import NexaDatePicker from '@/components/ui/nexa-date-picker';

import {
  Box,
  Plus,
  Monitor,
  Smartphone,
  Headphones,
  Tablet,
  User,
  MapPin,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';

const equipmentFormSchema = z.object({
  brand: z.string().min(1, {
    message: 'Brand is required',
  }),

  model: z.string().min(1, {
    message: 'Model is required',
  }),

  serialNumber: z.string().min(1, {
    message: 'Serial number is required',
  }),

  type: z.enum([
    'computer',
    'smartphone',
    'headset',
    'tablet',
  ]),

  status: z.enum([
    'active',
    'inactive',
    'maintenance',
    'decommissioned',
  ]),

  assignedUser: z.string(),

  location: z.string().min(1, {
    message: 'Location is required',
  }),

  acquisitionDate: z.string(),

  notes: z.string().optional(),
});

type EquipmentFormValues =
  z.infer<typeof equipmentFormSchema>;

interface AssignEquipmentFormProps {
  onSuccess: (equipment: any) => void;
  preselectedUserId?: string;
}

export function AssignEquipmentForm({
  onSuccess,
  preselectedUserId,
}: AssignEquipmentFormProps) {
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [mode, setMode] =
    useState<'existing' | 'new'>('existing');

  const [availableEquipment, setAvailableEquipment] =
    useState<any[]>([]);

  const [users, setUsers] =
    useState<any[]>([]);

  const form =
    useForm<EquipmentFormValues>({
      resolver:
        zodResolver(
          equipmentFormSchema
        ),

      defaultValues: {
        brand: '',
        model: '',
        serialNumber: '',
        type: 'computer',
        status: 'active',
        assignedUser:
          preselectedUserId || '',
        location: '',
        acquisitionDate:
          new Date()
            .toISOString()
            .split('T')[0],
        notes: '',
      },
    });

  // =========================================================
  // LOAD DATA
  // =========================================================

  useEffect(() => {
    async function loadData() {
      const [
        usersRes,
        equipmentRes,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select('id, full_name')
          .order('full_name'),

        supabase
          .from('equipment')
          .select(
            'id, asset_tag, name, model, serial_number'
          )
          .is(
            'assigned_user',
            null
          )
          .order('asset_tag'),
      ]);

      if (usersRes.error) {
        console.error(
          'Users error:',
          usersRes.error
        );
      }

      if (equipmentRes.error) {
        console.error(
          'Equipment error:',
          equipmentRes.error
        );
      }

      setUsers(
        usersRes.data ?? []
      );

      setAvailableEquipment(
        equipmentRes.data ?? []
      );
    }

    loadData();
  }, []);

  // =========================================================
  // ASSIGN EXISTING
  // =========================================================

  const assignExisting =
    async (
      equipmentId: number
    ) => {
      try {
        const userId =
          form.getValues(
            'assignedUser'
          );

        if (!userId) {
          alert(
            'Seleciona primeiro um utilizador'
          );

          return;
        }

        setIsSubmitting(true);

        const {
          data,
          error,
        } = await supabase
          .from('equipment')
          .update({
            assigned_user:
              userId,
          })
          .eq(
            'id',
            equipmentId
          )
          .select()
          .single();

        if (error) {
          throw error;
        }

        onSuccess(data);
      } catch (error) {
        console.error(
          'Assign equipment error:',
          error
        );

        alert(
          'Não foi possível atribuir o equipamento.'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =========================================================
  // CREATE NEW
  // =========================================================

  const onSubmit =
    async (
      values: EquipmentFormValues
    ) => {
      setIsSubmitting(true);

      try {
        const {
          data,
          error,
        } = await supabase
          .from('equipment')
          .insert({
            name:
              values.model,

            model:
              values.model,

            serial_number:
              values.serialNumber,

            asset_tag:
              `IT-${Date.now()}`,

            assigned_user:
              values.assignedUser || null,

            purchase_date:
              values.acquisitionDate,

            status:
              values.status,

            notes:
              values.notes || '',
          })
          .select()
          .single();

        if (error) {
          throw error;
        }

        onSuccess(data);
      } catch (error) {
        console.error(
          'Create equipment error:',
          error
        );

        alert(
          'Não foi possível criar o equipamento.'
        );
      } finally {
        setIsSubmitting(false);
      }
    };

  // =========================================================
  // RESET
  // =========================================================

  const handleReset =
    () => {
      form.reset({
        brand: '',
        model: '',
        serialNumber: '',
        type: 'computer',
        status: 'active',
        assignedUser:
          preselectedUserId || '',
        location: '',
        acquisitionDate:
          new Date()
            .toISOString()
            .split('T')[0],
        notes: '',
      });
    };

  // =========================================================
  // SELECT ITEM STYLE
  // =========================================================

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

  return (
    <div
      className="space-y-5 text-white overflow-visible"
    >

      {/* =====================================================
          MODE SWITCH
      ===================================================== */}

      <div
        className="grid grid-cols-2 gap-1 rounded-xl border border-blue-500/20 bg-[#0A1328] p-1"
      >

        {/* SELECT EXISTING */}

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setMode('existing')
          }
          className={`
            h-11
            w-full
            rounded-lg
            border
            transition-all
            ${
              mode === 'existing'
                ? `
                  border-blue-500/30
                  bg-blue-500/15
                  text-blue-400
                  hover:bg-blue-500/20
                  hover:text-blue-300
                `
                : `
                  border-transparent
                  text-white/40
                  hover:bg-white/[0.04]
                  hover:text-white
                `
            }
          `}
        >
          <Box className="mr-2 h-4 w-4" />

          Selecionar equipamento
        </Button>

        {/* CREATE NEW */}

        <Button
          type="button"
          variant="ghost"
          onClick={() =>
            setMode('new')
          }
          className={`
            h-11
            w-full
            rounded-lg
            border
            transition-all
            ${
              mode === 'new'
                ? `
                  border-blue-500/30
                  bg-blue-500/15
                  text-blue-400
                  hover:bg-blue-500/20
                  hover:text-blue-300
                `
                : `
                  border-transparent
                  text-white/40
                  hover:bg-white/[0.04]
                  hover:text-white
                `
            }
          `}
        >
          <Plus className="mr-2 h-4 w-4" />

          Criar novo
        </Button>
      </div>

      {/* =====================================================
          EXISTING EQUIPMENT
      ===================================================== */}

      {mode === 'existing' ? (
        <div
          className="rounded-xl border border-blue-500/20 bg-[#0A1328] p-4"
        >

          {/* HEADER */}

          <div
            className="mb-4 flex items-center justify-between"
          >
            <div>
              <p
                className="text-sm font-semibold text-white"
              >
                Equipamentos disponíveis
              </p>

              <p
                className="mt-1 text-xs text-white/35"
              >
                Seleciona um equipamento que ainda não esteja atribuído.
              </p>
            </div>

            <span
              className="rounded-full border border-blue-500/20 bg-blue-500/10 px-2.5 py-1 text-xs text-blue-400"
            >
              {availableEquipment.length}
            </span>
          </div>

          {/* USER */}

          <div
            className="mb-4 rounded-lg border border-white/[0.07] bg-[#0D1730] p-3"
          >
            <div
              className="mb-2 flex items-center gap-2"
            >
              <User
                className="h-4 w-4 text-blue-400"
              />

              <span
                className="text-xs text-white/45"
              >
                Utilizador a atribuir
              </span>
            </div>

            <Select
              value={
                form.watch(
                  'assignedUser'
                ) || '__none__'
              }
              onValueChange={(
                value
              ) =>
                form.setValue(
                  'assignedUser',
                  value === '__none__'
                    ? ''
                    : value
                )
              }
            >
              <SelectTrigger
                className="h-10 border-white/10 bg-[#0A1328] text-white"
              >
                <SelectValue
                  placeholder="Selecionar utilizador"
                />
              </SelectTrigger>

              <SelectContent
                className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl shadow-black/50"
              >

                <SelectItem
                  value="__none__"
                  className={
                    selectItemClass
                  }
                >
                  Sem atribuição
                </SelectItem>

                {users.map(
                  (user) => (
                    <SelectItem
                      key={
                        user.id
                      }
                      value={
                        user.id
                      }
                      className={
                        selectItemClass
                      }
                    >
                      {user.full_name}
                    </SelectItem>
                  )
                )}

              </SelectContent>
            </Select>
          </div>

          {/* EMPTY */}

          {availableEquipment.length ===
          0 ? (
            <div
              className="rounded-lg border border-dashed border-white/10 py-10 text-center"
            >
              <Box
                className="mx-auto mb-3 h-8 w-8 text-white/15"
              />

              <p
                className="text-sm text-white/40"
              >
                Não existem equipamentos disponíveis.
              </p>
            </div>
          ) : (
            <div
              className="space-y-2"
            >

              {availableEquipment.map(
                (equipment) => (
                  <div
                    key={
                      equipment.id
                    }
                    className="flex items-center gap-3 rounded-lg border border-white/[0.07] bg-[#0D1730] p-3 transition-all hover:border-blue-500/25 hover:bg-blue-500/[0.025]"
                  >

                    {/* ICON */}

                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
                    >
                      <Monitor
                        className="h-5 w-5 text-blue-400"
                      />
                    </div>

                    {/* INFO */}

                    <div
                      className="min-w-0 flex-1"
                    >
                      <p
                        className="truncate text-sm font-medium text-white"
                      >
                        {equipment.asset_tag ||
                          'Sem asset tag'}
                      </p>

                      <p
                        className="mt-1 truncate text-xs text-white/40"
                      >
                        {equipment.name ||
                          '—'}

                        {equipment.model
                          ? ` • ${equipment.model}`
                          : ''}
                      </p>

                      {equipment.serial_number && (
                        <p
                          className="mt-1 font-mono text-[11px] text-white/25"
                        >
                          S/N:{' '}
                          {
                            equipment.serial_number
                          }
                        </p>
                      )}
                    </div>

                    {/* ASSIGN */}

                    <Button
                      type="button"
                      size="sm"
                      disabled={
                        isSubmitting
                      }
                      onClick={() =>
                        assignExisting(
                          equipment.id
                        )
                      }
                      className="shrink-0 border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-none transition-all hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300"
                    >
                      <Check
                        className="mr-1.5 h-4 w-4"
                      />

                      Atribuir
                    </Button>

                  </div>
                )
              )}

            </div>
          )}
        </div>
      ) : (

        /* ===================================================
           CREATE NEW
        =================================================== */

        <Form {...form}>
          <form
            onSubmit={
              form.handleSubmit(
                onSubmit
              )
            }
            className="space-y-5"
          >

            <div
              className="rounded-xl border border-blue-500/20 bg-[#0A1328] p-4"
            >

              {/* HEADER */}

              <div
                className="mb-5 flex items-center gap-3"
              >
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10"
                >
                  <Plus
                    className="h-4 w-4 text-blue-400"
                  />
                </div>

                <div>
                  <p
                    className="text-sm font-semibold text-white"
                  >
                    Novo equipamento
                  </p>

                  <p
                    className="text-xs text-white/35"
                  >
                    Regista o equipamento no inventário.
                  </p>
                </div>
              </div>

              {/* FORM GRID */}

              <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
              >

                {/* TYPE */}

                <FormField
                  control={
                    form.control
                  }
                  name="type"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Tipo de equipamento
                      </FormLabel>

                      <Select
                        onValueChange={
                          field.onChange
                        }
                        value={
                          field.value
                        }
                      >
                        <FormControl>

                          <SelectTrigger
                            className="h-11 border-white/10 bg-[#0D1730] text-white"
                          >
                            <SelectValue placeholder="Selecionar tipo" />
                          </SelectTrigger>

                        </FormControl>

                        <SelectContent
                          className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl"
                        >

                          <SelectItem
                            value="computer"
                            className={
                              selectItemClass
                            }
                          >
                            <div
                              className="flex items-center gap-2"
                            >
                              <Monitor
                                className="h-4 w-4 text-blue-400"
                              />

                              Computador
                            </div>
                          </SelectItem>

                          <SelectItem
                            value="smartphone"
                            className={
                              selectItemClass
                            }
                          >
                            <div
                              className="flex items-center gap-2"
                            >
                              <Smartphone
                                className="h-4 w-4 text-blue-400"
                              />

                              Smartphone
                            </div>
                          </SelectItem>

                          <SelectItem
                            value="headset"
                            className={
                              selectItemClass
                            }
                          >
                            <div
                              className="flex items-center gap-2"
                            >
                              <Headphones
                                className="h-4 w-4 text-blue-400"
                              />

                              Headset
                            </div>
                          </SelectItem>

                          <SelectItem
                            value="tablet"
                            className={
                              selectItemClass
                            }
                          >
                            <div
                              className="flex items-center gap-2"
                            >
                              <Tablet
                                className="h-4 w-4 text-blue-400"
                              />

                              Tablet
                            </div>
                          </SelectItem>

                        </SelectContent>
                      </Select>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* USER */}

                <FormField
                  control={
                    form.control
                  }
                  name="assignedUser"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Utilizador atribuído
                      </FormLabel>

                      <Select
                        onValueChange={(
                          value
                        ) =>
                          field.onChange(
                            value ===
                            '__none__'
                              ? ''
                              : value
                          )
                        }
                        value={
                          field.value ||
                          '__none__'
                        }
                      >
                        <FormControl>

                          <SelectTrigger
                            className="h-11 border-white/10 bg-[#0D1730] text-white"
                          >
                            <SelectValue placeholder="Sem atribuição" />
                          </SelectTrigger>

                        </FormControl>

                        <SelectContent
                          className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl"
                        >

                          <SelectItem
                            value="__none__"
                            className={
                              selectItemClass
                            }
                          >
                            <div
                              className="flex items-center gap-2"
                            >
                              <User
                                className="h-4 w-4 text-white/30"
                              />

                              Sem atribuição
                            </div>
                          </SelectItem>

                          {users.map(
                            (user) => (
                              <SelectItem
                                key={
                                  user.id
                                }
                                value={
                                  user.id
                                }
                                className={
                                  selectItemClass
                                }
                              >
                                <div
                                  className="flex items-center gap-2"
                                >
                                  <User
                                    className="h-4 w-4 text-blue-400"
                                  />

                                  {user.full_name}
                                </div>
                              </SelectItem>
                            )
                          )}

                        </SelectContent>
                      </Select>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* BRAND */}

                <FormField
                  control={
                    form.control
                  }
                  name="brand"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Marca
                      </FormLabel>

                      <FormControl>

                        <Input
                          placeholder="Dell, Apple, Samsung..."
                          {...field}
                          className="h-11 border-white/10 bg-[#0D1730] text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* MODEL */}

                <FormField
                  control={
                    form.control
                  }
                  name="model"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Modelo
                      </FormLabel>

                      <FormControl>

                        <Input
                          placeholder="XPS 15, MacBook Pro..."
                          {...field}
                          className="h-11 border-white/10 bg-[#0D1730] text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* SERIAL */}

                <FormField
                  control={
                    form.control
                  }
                  name="serialNumber"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Número de série
                      </FormLabel>

                      <FormControl>

                        <Input
                          placeholder="ABC123XYZ"
                          {...field}
                          className="h-11 border-white/10 bg-[#0D1730] font-mono text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* STATUS */}

                <FormField
                  control={
                    form.control
                  }
                  name="status"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Estado
                      </FormLabel>

                      <Select
                        onValueChange={
                          field.onChange
                        }
                        value={
                          field.value
                        }
                      >
                        <FormControl>

                          <SelectTrigger
                            className="h-11 border-white/10 bg-[#0D1730] text-white"
                          >
                            <SelectValue />
                          </SelectTrigger>

                        </FormControl>

                        <SelectContent
                          className="border-blue-500/20 bg-[#0D1730] p-1 text-white shadow-2xl"
                        >

                          <SelectItem
                            value="active"
                            className={
                              selectItemClass
                            }
                          >
                            Ativo
                          </SelectItem>

                          <SelectItem
                            value="inactive"
                            className={
                              selectItemClass
                            }
                          >
                            Inativo
                          </SelectItem>

                          <SelectItem
                            value="maintenance"
                            className={
                              selectItemClass
                            }
                          >
                            Manutenção
                          </SelectItem>

                          <SelectItem
                            value="decommissioned"
                            className={
                              selectItemClass
                            }
                          >
                            Desativado
                          </SelectItem>

                        </SelectContent>
                      </Select>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* LOCATION */}

                <FormField
                  control={
                    form.control
                  }
                  name="location"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Localização
                      </FormLabel>

                      <FormControl>

                        <div
                          className="relative"
                        >
                          <MapPin
                            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-blue-400/70"
                          />

                          <Input
                            placeholder="Sede, Filial, Escritório..."
                            {...field}
                            className="h-11 border-white/10 bg-[#0D1730] pl-10 text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
                          />
                        </div>

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

                {/* DATE */}

                <FormField
                  control={
                    form.control
                  }
                  name="acquisitionDate"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Data de aquisição
                      </FormLabel>

                      <FormControl>

                        <NexaDatePicker
                          value={
                            field.value
                          }
                          onChange={
                            field.onChange
                          }
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />

              </div>

              {/* NOTES */}

              <div
                className="mt-4"
              >
                <FormField
                  control={
                    form.control
                  }
                  name="notes"
                  render={({
                    field,
                  }) => (
                    <FormItem>

                      <FormLabel
                        className="text-xs font-medium text-white/70"
                      >
                        Notas
                      </FormLabel>

                      <FormControl>

                        <Textarea
                          placeholder="Informação adicional sobre este equipamento..."
                          className="min-h-[100px] resize-none border-white/10 bg-[#0D1730] text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
                          {...field}
                        />

                      </FormControl>

                      <FormMessage />

                    </FormItem>
                  )}
                />
              </div>

            </div>

            {/* =================================================
                ACTIONS
            ================================================= */}

            <div
              className="flex justify-end gap-2 border-t border-white/[0.07] pt-4"
            >

              {/* RESET */}

              <Button
                type="button"
                variant="outline"
                onClick={
                  handleReset
                }
                disabled={
                  isSubmitting
                }
                className="border-white/10 bg-white/[0.03] text-white/50 hover:border-white/15 hover:bg-white/[0.06] hover:text-white"
              >
                <RotateCcw
                  className="mr-2 h-4 w-4"
                />

                Repor
              </Button>

              {/* CREATE */}

              <Button
                type="submit"
                disabled={
                  isSubmitting
                }
                className="border border-blue-400/20 bg-blue-600 text-white shadow-lg shadow-blue-600/20 transition-all hover:border-blue-300/30 hover:bg-blue-500"
              >
                <Save
                  className="mr-2 h-4 w-4"
                />

                {isSubmitting
                  ? 'A criar...'
                  : 'Criar equipamento'}
              </Button>

            </div>

          </form>
        </Form>
      )}
    </div>
  );
}