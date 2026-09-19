import { supabase } from '@/integrations/supabase/client';

type ActivityLogParams = {
  action: string;
  module: string;
  description: string;

  level?: 'info' | 'warning' | 'error' | 'success';

  entityType?: string | null;
  entityId?: string | number | null;

  oldData?: Record<string, unknown> | null;
  newData?: Record<string, unknown> | null;
};

/**
 * Cria um registo no sistema de Logs.
 *
 * Exemplo:
 *
 * await createActivityLog({
 *   action: 'CREATE',
 *   module: 'equipment',
 *   description: 'Criou o equipamento "PC-001".',
 *   entityType: 'equipment',
 *   entityId: equipment.id,
 *   newData: {
 *     name: equipment.name,
 *     status: equipment.status,
 *   },
 * });
 */
export async function createActivityLog({
  action,
  module,
  description,
  level = 'info',
  entityType = null,
  entityId = null,
  oldData = null,
  newData = null,
}: ActivityLogParams): Promise<boolean> {
  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error(
        'Não foi possível obter o utilizador para criar o log:',
        userError
      );

      return false;
    }

    const { error } = await (supabase as any)
      .from('logs')
      .insert({
        user_id: user.id,
        action,
        module,
        description,
        level,
        entity_type: entityType,
        entity_id:
          entityId !== null && entityId !== undefined
            ? String(entityId)
            : null,
        old_data: oldData,
        new_data: newData,
      });

    if (error) {
      console.error('Erro ao criar activity log:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(
      'Erro inesperado ao criar activity log:',
      error
    );

    return false;
  }
}