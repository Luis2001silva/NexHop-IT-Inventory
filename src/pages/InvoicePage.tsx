import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowLeft,
  ChevronRight,
  FileText,
  Loader2,
  Plus,
  Search,
  Trash2,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
 
type Invoice = {
  id: number;
  equipment_id: number | null;
  invoice_number: string | null;
  supplier: string | null;
  invoice_date: string | null;
  total: number | null;
  file_url: string | null;
  created_at: string | null;
};

type Equipment = {
  id: number;
  name: string | null;
  model: string | null;
  serial_number: string;
  asset_tag: string | null;
};

const wrapper = "min-h-full bg-[#080D1F] px-6 py-7 lg:px-8 text-white";
const card = "rounded-xl border border-white/[0.06] bg-[#0D1730]";
const input =
  "h-10 rounded-lg border border-white/[0.06] bg-[#0A1328] text-white placeholder:text-slate-500 focus:border-blue-500/40";

export default function InvoicePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const { language } = useLanguage();
  const isPT = language === "pt";
  const tr = (pt: string, en: string) => (isPT ? pt : en);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");

  const isNew = id === "new";
  const isList = !id;

  const [form, setForm] = useState({
    equipment_id: searchParams.get("equipmentId") || "",
    invoice_number: "",
    supplier: "",
    invoice_date: new Date().toISOString().slice(0, 10),
    total: "",
    file_url: "",
  });

  const equipmentMap = useMemo(
    () => new Map(equipment.map((item) => [item.id, item])),
    [equipment]
  );

  const loadData = async () => {
    setLoading(true);

    const [invoiceResult, equipmentResult] = await Promise.all([
      supabase
        .from("invoices")
        .select(
          "id, equipment_id, invoice_number, supplier, invoice_date, total, file_url, created_at"
        )
        .order("invoice_date", { ascending: false }),
      supabase
        .from("equipment")
        .select("id, name, model, serial_number, asset_tag")
        .order("id", { ascending: false }),
    ]);

    if (invoiceResult.error) {
      console.error(invoiceResult.error);
      toast.error(tr("Não foi possível carregar as faturas.", "Could not load invoices."));
    } else {
      setInvoices((invoiceResult.data || []) as Invoice[]);
    }

    if (equipmentResult.error) {
      console.error(equipmentResult.error);
      toast.error(tr("Não foi possível carregar os equipamentos.", "Could not load equipment."));
    } else {
      setEquipment((equipmentResult.data || []) as Equipment[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (id && !isNew && invoices.length > 0) {
      const found = invoices.find((item) => String(item.id) === id);

      if (!found) {
        toast.error(tr("Fatura não encontrada.", "Invoice not found."));
        navigate("/invoices", { replace: true });
        return;
      }

      setForm({
        equipment_id: found.equipment_id ? String(found.equipment_id) : "",
        invoice_number: found.invoice_number || "",
        supplier: found.supplier || "",
        invoice_date:
          found.invoice_date || new Date().toISOString().slice(0, 10),
        total: found.total != null ? String(found.total) : "",
        file_url: found.file_url || "",
      });
    }
  }, [id, isNew, invoices, navigate]);

  const filteredInvoices = useMemo(() => {
    const term = search.toLowerCase().trim();

    if (!term) return invoices;

    return invoices.filter((invoice) => {
      const item = invoice.equipment_id
        ? equipmentMap.get(invoice.equipment_id)
        : undefined;

      return [
        invoice.invoice_number,
        invoice.supplier,
        item?.name,
        item?.model,
        item?.serial_number,
        item?.asset_tag,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term));
    });
  }, [invoices, equipmentMap, search]);

  const openNew = () => navigate("/invoices/new");

  const handleSave = async () => {
    if (!isAdmin) return;

    if (!form.equipment_id) {
      toast.error(tr("Seleciona um equipamento.", "Select an equipment item."));
      return;
    }

    setSaving(true);

    const payload = {
      equipment_id: Number(form.equipment_id),
      invoice_number: form.invoice_number.trim() || null,
      supplier: form.supplier.trim() || null,
      invoice_date: form.invoice_date || null,
      total: form.total === "" ? null : Number(form.total),
      file_url: form.file_url.trim() || null,
    };

    const result = isNew
      ? await supabase.from("invoices").insert(payload).select().single()
      : await supabase
          .from("invoices")
          .update(payload)
          .eq("id", Number(id))
          .select()
          .single();

    setSaving(false);

    if (result.error) {
      console.error(result.error);
      toast.error(tr("Não foi possível guardar a fatura.", "Could not save the invoice."));
      return;
    }

    toast.success(isNew ? tr("Fatura criada.", "Invoice created.") : tr("Fatura atualizada.", "Invoice updated."));
    await loadData();
    navigate("/invoices");
  };

  const handleDelete = async () => {
    if (!isAdmin || !id || isNew) return;

    const confirmed = window.confirm(
      "Tens a certeza que queres eliminar esta fatura?"
    );
    if (!confirmed) return;

    const { error } = await supabase
      .from("invoices")
      .delete()
      .eq("id", Number(id));

    if (error) {
      console.error(error);
      toast.error(tr("Não foi possível eliminar a fatura.", "Could not delete the invoice."));
      return;
    }

    toast.success(tr("Fatura eliminada.", "Invoice deleted."));
    navigate("/invoices");
  };

  if (loading) {
    return (
      <div className={`${wrapper} flex min-h-[60vh] items-center justify-center`}>
        <div className="flex items-center gap-3 text-sm text-slate-400">
          <Loader2 className="animate-spin" size={18} />
          A carregar faturas...
        </div>
      </div>
    );
  }

  if (isList) {
    return (
      <div className={wrapper}>
        <div className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {tr("Faturas", "Invoices")}
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Registo das faturas associadas aos equipamentos.
              </p>
            </div>

            {isAdmin && (
              <Button
                onClick={openNew}
                className="bg-blue-600 text-white hover:bg-blue-500"
              >
                <Plus className="mr-2" size={17} />
                Nova fatura
              </Button>
            )}
          </div>

          <div className={`${card} p-4`}>
            <div className="relative">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tr("Pesquisar por número, fornecedor, equipamento ou número de série...", "Search by invoice number, supplier, equipment or serial number...")}
                className={`${input} w-full pl-10`}
              />
            </div>
          </div>

          <div className={`${card} overflow-hidden`}>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-[#0A1328] text-left">
                    {[
                      tr("Fatura", "Invoice"),
                      tr("Equipamento", "Equipment"),
                      tr("Número de série", "Serial number"),
                      tr("Fornecedor", "Supplier"),
                      tr("Data", "Date"),
                      tr("Total", "Total"),
                      "",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-5 py-4 text-xs font-medium uppercase tracking-wide text-slate-500"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredInvoices.map((invoice) => {
                    const item = invoice.equipment_id
                      ? equipmentMap.get(invoice.equipment_id)
                      : undefined;

                    return (
                      <tr
                        key={invoice.id}
                        onClick={() => navigate(`/invoices/${invoice.id}`)}
                        className="cursor-pointer border-b border-white/[0.05] transition hover:bg-[#101B36]"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                              <FileText size={17} />
                            </div>
                            <span className="text-sm font-medium text-slate-200">
                              {invoice.invoice_number || `#${invoice.id}`}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-300">
                          {item?.model || item?.name || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {item?.serial_number || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {invoice.supplier || "—"}
                        </td>
                        <td className="px-5 py-4 text-sm text-slate-400">
                          {formatDate(invoice.invoice_date, language)}
                        </td>
                        <td className="px-5 py-4 text-sm font-medium text-slate-200">
                          {formatMoney(invoice.total)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          <ChevronRight
                            size={17}
                            className="ml-auto text-slate-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredInvoices.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <AlertCircle
                    className="mx-auto text-slate-600"
                    size={30}
                  />
                  <p className="mt-3 text-sm font-medium text-slate-300">
                    Nenhuma fatura encontrada
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {search
                      ? tr("Experimenta alterar a pesquisa.", "Try changing your search.")
                      : tr("Ainda não existem faturas registadas.", "No invoices have been registered yet.")}
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-500">
            {filteredInvoices.length} de {invoices.length} faturas
          </p>
        </div>
      </div>
    );
  }

  const selectedEquipment = form.equipment_id
    ? equipmentMap.get(Number(form.equipment_id))
    : undefined;

  return (
    <div className={wrapper}>
      <div className="mx-auto max-w-5xl space-y-6">
        <button
          onClick={() => navigate("/invoices")}
          className="inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={16} />
          tr("Voltar às faturas", "Back to invoices")
        </button>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-blue-400">{tr("Gestão", "Management")}</p>
            <h1 className="mt-1 text-2xl font-semibold">
              {isNew ? tr("Nova fatura", "New invoice") : tr("Detalhes da fatura", "Invoice details")}
            </h1>
          </div>

          <div className="flex gap-2">
            {!isNew && isAdmin && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                className="bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                <Trash2 className="mr-2" size={16} />
                Eliminar
              </Button>
            )}

            {isAdmin && (
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-500"
              >
                {saving ? (
                  <Loader2 className="mr-2 animate-spin" size={16} />
                ) : (
                  <FileText className="mr-2" size={16} />
                )}
                {saving ? tr("A guardar...", "Saving...") : tr("Guardar", "Save")}
              </Button>
            )}
          </div>
        </div>

        <div className={`${card} p-6`}>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label={tr("Equipamento", "Equipment")}>
              <Select
                value={form.equipment_id}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, equipment_id: value }))
                }
                disabled={!isAdmin}
              >
                <SelectTrigger className="border-white/[0.06] bg-[#0A1328] text-slate-200">
                  <SelectValue placeholder={tr("Selecionar equipamento", "Select equipment")} />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map((item) => (
                    <SelectItem key={item.id} value={String(item.id)}>
                      {(item.model || item.name || tr("Equipamento", "Equipment")) +
                        " · " +
                        item.serial_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedEquipment && (
                <p className="mt-2 text-xs text-slate-500">
                  {selectedEquipment.asset_tag || tr("Sem número de inventário", "No asset tag")}
                </p>
              )}
            </Field>

            <Field label={tr("Número da fatura", "Invoice number")}>
              <Input
                value={form.invoice_number}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    invoice_number: e.target.value,
                  }))
                }
                disabled={!isAdmin}
                placeholder={tr("Ex.: FT 2026/001", "E.g. INV 2026/001")}
                className={input}
              />
            </Field>

            <Field label={tr("Data da fatura", "Invoice date")}>
              <Input
                type="date"
                value={form.invoice_date}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    invoice_date: e.target.value,
                  }))
                }
                disabled={!isAdmin}
                className={input}
              />
            </Field>

            <Field label={tr("Fornecedor", "Supplier")}>
              <Input
                value={form.supplier}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, supplier: e.target.value }))
                }
                disabled={!isAdmin}
                placeholder={tr("Nome do fornecedor", "Supplier name")}
                className={input}
              />
            </Field>

            <Field label={tr("Total", "Total")}>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                  €
                </span>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.total}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, total: e.target.value }))
                  }
                  disabled={!isAdmin}
                  placeholder="0,00"
                  className={`${input} pl-8`}
                />
              </div>
            </Field>

            <Field label={tr("Ficheiro", "File")}>
              <div className="flex gap-2">
                <Input
                  value={form.file_url}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      file_url: e.target.value,
                    }))
                  }
                  disabled={!isAdmin}
                  placeholder={tr("URL do ficheiro (Storage)", "File URL (Storage)")}
                  className={input}
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled
                  title={tr("Upload para Storage será ligado posteriormente", "Storage upload will be connected later")}
                >
                  <Upload size={16} />
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                tr("O Storage de faturas fica para a próxima fase.", "Invoice Storage will be connected in the next phase.")
              </p>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-slate-300">{label}</label>
      {children}
    </div>
  );
}

function formatDate(value: string | null, language: string) {
  if (!value) return "—";
  const date = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat(language === "pt" ? "pt-PT" : "en-GB").format(date);
}

function formatMoney(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}
