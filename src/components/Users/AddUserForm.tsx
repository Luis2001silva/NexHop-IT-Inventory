import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/context/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { toast } from 'sonner';
import { Save, RotateCcw } from 'lucide-react';

const userFormSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  department: z.string().optional(),
  position: z.string().optional(),
  sapNumber: z.string().optional(),
  role: z.enum(['admin', 'viewer']),
  managerId: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface AddUserFormProps {
  onSuccess: (user: any) => void;
  initialUser?: any;
}

export function AddUserForm({ onSuccess, initialUser }: AddUserFormProps) {
  const { language } = useLanguage();
  const isPT = language === 'pt';
  const isEdit = Boolean(initialUser?.id);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [managers, setManagers] = useState<any[]>([]);

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: initialUser?.full_name ?? '',
      email: initialUser?.email ?? '',
      department: initialUser?.department ?? '',
      position: initialUser?.position ?? '',
      sapNumber: initialUser?.sap_number ?? '',
      role: initialUser?.role === 'admin' ? 'admin' : 'viewer',
      managerId: initialUser?.manager_id ?? '',
    },
  });

  useEffect(() => {
    form.reset({
      name: initialUser?.full_name ?? '',
      email: initialUser?.email ?? '',
      department: initialUser?.department ?? '',
      position: initialUser?.position ?? '',
      sapNumber: initialUser?.sap_number ?? '',
      role: initialUser?.role === 'admin' ? 'admin' : 'viewer',
      managerId: initialUser?.manager_id ?? '',
    });
  }, [initialUser, form]);

  useEffect(() => {
    async function loadManagers() {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .order('full_name');

      if (error) {
        console.error('Managers error:', error);
        return;
      }

      setManagers(
        (data ?? []).filter(
          (user) => String(user.id) !== String(initialUser?.id)
        )
      );
    }

    loadManagers();
  }, [initialUser?.id]);

  const onSubmit = async (values: UserFormValues) => {
    setIsSubmitting(true);

    try {
      if (isEdit) {
        const { data, error } = await supabase
          .from('profiles')
          .update({
            full_name: values.name,
            email: values.email,
            department: values.department || null,
            position: values.position || null,
            sap_number: values.sapNumber || null,
            role: values.role,
            manager_id: values.managerId || null,
          })
          .eq('id', initialUser.id)
          .select()
          .single();

        if (error) throw error;

        onSuccess(data);
        return;
      }

      // A criação de contas continua a usar o fluxo existente.
      // A integração Auth/AD pode ser ligada aqui posteriormente.
      const newUser = {
        id: `${Date.now()}`,
        full_name: values.name,
        email: values.email,
        department: values.department ?? '',
        position: values.position ?? '',
        sap_number: values.sapNumber ?? '',
        role: values.role,
        manager_id: values.managerId || null,
      };

      onSuccess(newUser);
    } catch (error: any) {
      console.error('User save error:', error);
      toast.error(
        error?.message ||
          (isPT
            ? 'Erro ao guardar utilizador.'
            : 'Error saving user.')
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const labelClass = 'text-[13px] font-medium text-white/80';
  const inputClass =
    'border-white/10 bg-[#0A1328] text-white placeholder:text-white/25 focus:border-blue-500/50 focus:ring-blue-500/20';
  const selectClass =
    'border-white/10 bg-[#0A1328] text-white focus:border-blue-500/50';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        <div className="rounded-xl border border-blue-500/15 bg-[#0A1328] p-4">
          <p className="text-sm font-medium text-white">
            {isEdit
              ? isPT ? 'Informação do utilizador' : 'User information'
              : isPT ? 'Novo utilizador' : 'New user'}
          </p>
          <p className="mt-1 text-xs text-white/35">
            {isEdit
              ? isPT
                ? 'Atualiza os dados e a posição na hierarquia.'
                : 'Update the user details and hierarchy position.'
              : isPT
                ? 'Preenche os dados do utilizador.'
                : 'Fill in the user information.'}
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField control={form.control} name="name" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{isPT ? 'Nome completo' : 'Full name'}</FormLabel>
              <FormControl><Input className={inputClass} placeholder="João Silva" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Email</FormLabel>
              <FormControl><Input className={inputClass} placeholder="joao.silva@example.com" type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{isPT ? 'Departamento' : 'Department'}</FormLabel>
              <FormControl><Input className={inputClass} placeholder="IT, RH, Financeiro..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{isPT ? 'Cargo' : 'Position'}</FormLabel>
              <FormControl><Input className={inputClass} placeholder="IT Specialist..." {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="sapNumber" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>SAP</FormLabel>
              <FormControl><Input className={inputClass} placeholder="SAP001" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="role" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{isPT ? 'Função' : 'Role'}</FormLabel>
              <Select value={field.value} onValueChange={field.onChange}>
                <FormControl><SelectTrigger className={selectClass}><SelectValue /></SelectTrigger></FormControl>
                <SelectContent className="border-blue-500/20 bg-[#0D1730] text-white">
                  <SelectItem className="data-[highlighted]:bg-blue-500/15" value="viewer">{isPT ? 'Utilizador' : 'Viewer'}</SelectItem>
                  <SelectItem className="data-[highlighted]:bg-violet-500/15" value="admin">{isPT ? 'Administrador' : 'Administrator'}</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="managerId" render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>{isPT ? 'Superior' : 'Manager'}</FormLabel>
              <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}>
                <FormControl><SelectTrigger className={selectClass}><SelectValue placeholder={isPT ? 'Sem superior' : 'No manager'} /></SelectTrigger></FormControl>
                <SelectContent className="border-blue-500/20 bg-[#0D1730] text-white">
                  <SelectItem className="data-[highlighted]:bg-blue-500/15" value="none">{isPT ? 'Sem superior' : 'No manager'}</SelectItem>
                  {managers.map((manager) => (
                    <SelectItem key={manager.id} value={manager.id} className="data-[highlighted]:bg-blue-500/15">
                      {manager.full_name || '—'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <div className="flex justify-end gap-2 border-t border-white/[0.07] pt-4">
          <Button
            variant="outline"
            type="button"
            onClick={() => form.reset()}
            className="border-white/10 bg-white/[0.03] text-white/60 hover:bg-white/[0.07] hover:text-white"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            {isPT ? 'Repor' : 'Reset'}
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500"
          >
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting
              ? isPT ? 'A guardar...' : 'Saving...'
              : isEdit
                ? isPT ? 'Guardar alterações' : 'Save changes'
                : isPT ? 'Adicionar utilizador' : 'Add user'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
