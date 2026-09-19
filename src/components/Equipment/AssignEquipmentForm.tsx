import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Box,
  Check,
  Monitor,
  User,
  Search,
} from 'lucide-react';

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

  const [availableEquipment, setAvailableEquipment] =
    useState<any[]>([]);

  const [users, setUsers] =
    useState<any[]>([]);

  const [selectedUserId, setSelectedUserId] =
    useState(preselectedUserId || '');

  const [userSearch, setUserSearch] =
    useState('');

  useEffect(() => {
    setSelectedUserId(preselectedUserId || '');
  }, [preselectedUserId]);

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

  const filteredUsers = users.filter((user) => {
    const search = userSearch.trim().toLowerCase();

    if (!search) {
      return true;
    }

    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.sap_number?.toLowerCase().includes(search)
    );
  });

  // =========================================================
  // ASSIGN EXISTING EQUIPMENT
  // =========================================================

  const assignExisting =
    async (
      equipmentId: number
    ) => {
      if (!selectedUserId) {
        return;
      }

      try {
        setIsSubmitting(true);

        const {
          data,
          error,
        } = await supabase
          .from('equipment')
          .update({
            assigned_user:
              selectedUserId,
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
      } finally {
        setIsSubmitting(false);
      }
    };

  return (
    <div
      className="space-y-5 text-white overflow-visible"
    >
      {/* =====================================================
          USER
      ===================================================== */}

      <div
        className="relative z-20 rounded-xl border border-blue-500/20 bg-[#0A1328] p-4"
      >
        <div className="mb-3 flex items-center gap-2">
          <User
            className="h-4 w-4 text-blue-400"
          />

          <span className="text-sm font-semibold text-white">
            Utilizador a atribuir
          </span>
        </div>

        {/* SEARCH */}

        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30"
          />

          <Input
            value={userSearch}
            onChange={(event) =>
              setUserSearch(event.target.value)
            }
            placeholder="Pesquisar por nome, email ou n.º de colaborador..."
            className="h-11 border-white/10 bg-[#0D1730] pl-10 text-white placeholder:text-white/25 focus:border-blue-500/40 focus:ring-blue-500/20"
          />
        </div>

        {/* SELECTED USER */}

        {selectedUserId && (
          <div className="mt-3 rounded-lg border border-blue-500/20 bg-blue-500/[0.06] px-3 py-2.5">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-400" />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {users.find(
                    (user) =>
                      user.id === selectedUserId
                  )?.full_name || 'Utilizador selecionado'}
                </p>

                <p className="text-xs text-blue-400/70">
                  Utilizador selecionado
                </p>
              </div>
            </div>
          </div>
        )}

        {/* USER RESULTS - FLOATING SEARCH DROPDOWN */}

        {userSearch.trim() && (
          <div className="relative z-50">
            <div className="absolute left-0 right-0 top-2 max-h-60 overflow-y-auto rounded-xl border border-blue-500/20 bg-[#0D1730] p-1.5 shadow-2xl shadow-black/50">
              {filteredUsers.length === 0 ? (
                <div className="px-3 py-5 text-center">
                  <User className="mx-auto mb-2 h-6 w-6 text-white/15" />

                  <p className="text-xs text-white/40">
                    Nenhum utilizador encontrado.
                  </p>
                </div>
              ) : (
                filteredUsers.map((user) => {
                  const isSelected =
                    selectedUserId === user.id;

                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setUserSearch(user.full_name || '');
                      }}
                      className={`
                        flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-all
                        ${
                          isSelected
                            ? 'border-blue-500/30 bg-blue-500/10'
                            : 'border-transparent hover:border-blue-500/20 hover:bg-blue-500/[0.05]'
                        }
                      `}
                    >
                      <div
                        className={`
                          flex h-9 w-9 shrink-0 items-center justify-center rounded-full
                          ${
                            isSelected
                              ? 'bg-blue-500/15'
                              : 'bg-white/[0.04]'
                          }
                        `}
                      >
                        <User
                          className={`
                            h-4 w-4
                            ${
                              isSelected
                                ? 'text-blue-400'
                                : 'text-white/35'
                            }
                          `}
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-white">
                          {user.full_name || 'Sem nome'}
                        </p>

                        {user.email && (
                          <p className="truncate text-xs text-white/35">
                            {user.email}
                          </p>
                        )}

                        {user.sap_number && (
                          <p className="mt-0.5 text-[11px] text-white/25">
                            N.º de colaborador: {user.sap_number}
                          </p>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="h-4 w-4 shrink-0 text-blue-400" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}

        {!selectedUserId && (
          <p className="mt-2 text-xs text-amber-400">
            Seleciona um utilizador antes de atribuir o equipamento.
          </p>
        )}
      </div>

      {/* =====================================================
          EXISTING EQUIPMENT
      ===================================================== */}

      <div
        className="rounded-xl border border-blue-500/20 bg-[#0A1328] p-4"
      >
        <div
          className="mb-4 flex items-center justify-between"
        >
          <div>
            <p
              className="text-sm font-semibold text-white"
            >
              Selecionar equipamento
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
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-500/10"
                  >
                    <Monitor
                      className="h-5 w-5 text-blue-400"
                    />
                  </div>

                  <div
                    className="min-w-0 flex-1"
                  >
                    <p
                      className="truncate text-sm font-medium text-white"
                    >
                      {equipment.name ||
                        equipment.asset_tag ||
                        'Equipamento'}
                    </p>

                    <p
                      className="mt-1 truncate text-xs text-white/40"
                    >
                      {equipment.asset_tag
                        ? `Asset Tag: ${equipment.asset_tag}`
                        : ''}

                      {equipment.model
                        ? `${equipment.asset_tag ? ' • ' : ''}${equipment.model}`
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

                  <Button
                    type="button"
                    size="sm"
                    disabled={
                      isSubmitting ||
                      !selectedUserId
                    }
                    onClick={() =>
                      assignExisting(
                        equipment.id
                      )
                    }
                    className="shrink-0 border border-amber-500/25 bg-amber-500/10 text-amber-400 shadow-none transition-all hover:border-amber-500/40 hover:bg-amber-500/15 hover:text-amber-300 disabled:cursor-not-allowed disabled:opacity-40"
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
    </div>
  );
}
