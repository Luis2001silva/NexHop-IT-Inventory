import { useMemo, useState } from "react";
import {
  Search,
  Plus,
  FileText,
  File,
  FileSpreadsheet,
  FileImage,
  FileArchive,
  Download,
  Pencil,
  Trash2,
  X,
  Upload,
  FolderOpen,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

type Category =
  | "Procedimentos"
  | "Manuais"
  | "Políticas"
  | "Configurações"
  | "Licenças"
  | "Outros";

interface DocumentItem {
  id: number;
  name: string;
  category: Category;
  description: string;
  date: string;
  author: string;
  fileName: string;
  fileType: string;
}

const categories: Category[] = [
  "Procedimentos",
  "Manuais",
  "Políticas",
  "Configurações",
  "Licenças",
  "Outros",
];

const categoryEN: Record<Category, string> = {
  Procedimentos: "Procedures",
  Manuais: "Manuals",
  Políticas: "Policies",
  Configurações: "Configurations",
  Licenças: "Licenses",
  Outros: "Other",
};

const getFileIcon = (type: string) => {
  const t = type.toLowerCase();

  if (t.includes("pdf")) return FileText;
  if (
    t.includes("sheet") ||
    t.includes("excel") ||
    t.includes("csv")
  )
    return FileSpreadsheet;
  if (t.includes("image")) return FileImage;
  if (t.includes("zip") || t.includes("rar"))
    return FileArchive;

  return File;
};

export default function DocumentsPage() {
  const { language } = useLanguage();
  const isPT = language === "pt";

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] =
    useState<"Todas" | Category>("Todas");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] =
    useState<DocumentItem | null>(null);

  const [form, setForm] = useState({
    name: "",
    category: "Procedimentos" as Category,
    description: "",
    date: new Date().toISOString().slice(0, 10),
    author: "Administrador",
    fileName: "",
    fileType: "",
  });

  const filtered = useMemo(
    () =>
      documents.filter(
        (d) =>
          (category === "Todas" ||
            d.category === category) &&
          (!search.trim() ||
            [
              d.name,
              d.category,
              d.description,
              d.author,
              d.fileName,
            ]
              .join(" ")
              .toLowerCase()
              .includes(search.toLowerCase()))
      ),
    [documents, search, category]
  );

  const reset = () => {
    setEditing(null);

    setForm({
      name: "",
      category: "Procedimentos",
      description: "",
      date: new Date().toISOString().slice(0, 10),
      author: "Administrador",
      fileName: "",
      fileType: "",
    });

    setOpen(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) return;

    if (editing) {
      setDocuments((ds) =>
        ds.map((d) =>
          d.id === editing.id
            ? { ...editing, ...form }
            : d
        )
      );
    } else {
      setDocuments((ds) => [
        ...ds,
        {
          id: Date.now(),
          ...form,
        },
      ]);
    }

    reset();
  };

  const formatDate = (d: string) =>
    new Intl.DateTimeFormat(
      isPT ? "pt-PT" : "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(new Date(d + "T00:00:00"));

  const categoryLabel = (value: Category) =>
    isPT ? value : categoryEN[value];

  return (
    <div className="min-h-full bg-[#080D1F] px-6 py-7 text-white lg:px-8">
      <div className="mb-7 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            {isPT ? "Documentos" : "Documents"}
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            {isPT
              ? "Documentação interna e recursos do departamento de TI."
              : "Internal documentation and IT department resources."}
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setForm({
              ...form,
              name: "",
              description: "",
              fileName: "",
              fileType: "",
            });
            setOpen(true);
          }}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-semibold hover:bg-blue-500"
        >
          <Plus size={17} />
          {isPT ? "Novo documento" : "New document"}
        </button>
      </div>

      <div className="mb-5 flex flex-col gap-3 rounded-xl border border-white/[0.06] bg-[#0D1730] p-3 lg:flex-row">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isPT
                ? "Pesquisar por nome, categoria, descrição ou autor..."
                : "Search by name, category, description or author..."
            }
            className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] pl-9 pr-3 text-sm outline-none placeholder:text-slate-600 focus:border-blue-500/40"
          />
        </div>

        <select
          value={category}
          onChange={(e) =>
            setCategory(
              e.target.value as "Todas" | Category
            )
          }
          className="h-10 min-w-[180px] rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-slate-300 outline-none"
        >
          <option value="Todas">
            {isPT ? "Todas" : "All"}
          </option>

          {categories.map((c) => (
            <option key={c} value={c}>
              {categoryLabel(c)}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          [
            isPT ? "Total" : "Total",
            documents.length,
            "text-white",
          ],
          [
            isPT ? "Procedimentos" : "Procedures",
            documents.filter(
              (d) => d.category === "Procedimentos"
            ).length,
            "text-blue-400",
          ],
          [
            isPT ? "Manuais" : "Manuals",
            documents.filter(
              (d) => d.category === "Manuais"
            ).length,
            "text-violet-400",
          ],
          [
            isPT ? "Outros" : "Other",
            documents.filter(
              (d) => d.category === "Outros"
            ).length,
            "text-slate-300",
          ],
        ].map(([label, value, color]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-white/[0.06] bg-[#0D1730] px-4 py-4"
          >
            <p className="text-xs text-slate-500">
              {label}
            </p>

            <p
              className={`mt-2 text-xl font-semibold ${color}`}
            >
              {value}
            </p>
          </div>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-white/[0.06] bg-[#0D1730]">
        <div className="border-b border-white/[0.06] px-5 py-4">
          <h2 className="text-sm font-semibold">
            {isPT ? "Documentos" : "Documents"}
          </h2>

          <p className="mt-1 text-xs text-slate-500">
            {filtered.length}{" "}
            {filtered.length === 1
              ? isPT
                ? "documento"
                : "document"
              : isPT
              ? "documentos"
              : "documents"}
          </p>
        </div>

        {filtered.length === 0 ? (
          <div className="flex min-h-[260px] flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A1328] text-slate-600">
              <FolderOpen size={21} />
            </div>

            <p className="text-sm font-medium text-slate-400">
              {isPT
                ? "Nenhum documento encontrado"
                : "No documents found"}
            </p>

            <p className="mt-1 max-w-md text-xs text-slate-600">
              {isPT
                ? "Adiciona procedimentos, manuais, políticas ou outros documentos importantes para a equipa de TI."
                : "Add procedures, manuals, policies or other important documents for the IT team."}
            </p>

            <button
              onClick={() => setOpen(true)}
              className="mt-4 text-xs font-medium text-blue-400"
            >
              +{" "}
              {isPT
                ? "Adicionar primeiro documento"
                : "Add first document"}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((d) => {
              const Icon = getFileIcon(d.fileType);

              return (
                <div
                  key={d.id}
                  className="flex flex-col gap-4 px-5 py-5 hover:bg-[#101B36]/60 lg:flex-row lg:items-center"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Icon size={20} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {d.name}
                        </h3>

                        <span className="rounded-full border border-white/[0.07] bg-[#0A1328] px-2 py-0.5 text-[10px] text-slate-400">
                          {categoryLabel(d.category)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-slate-500">
                        {d.description ||
                          d.fileName ||
                          (isPT
                            ? "Sem descrição"
                            : "No description")}
                      </p>

                      <p className="mt-2 text-[11px] text-slate-600">
                        {formatDate(d.date)} · {d.author}
                        {d.fileName
                          ? ` · ${d.fileName}`
                          : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      className="rounded-lg p-2 text-slate-500 hover:bg-[#101B36] hover:text-white"
                      title={
                        isPT ? "Descarregar" : "Download"
                      }
                    >
                      <Download size={16} />
                    </button>

                    <button
                      onClick={() => {
                        setEditing(d);
                        setForm({ ...d });
                        setOpen(true);
                      }}
                      className="rounded-lg p-2 text-slate-500 hover:bg-[#101B36] hover:text-white"
                      title={isPT ? "Editar" : "Edit"}
                    >
                      <Pencil size={16} />
                    </button>

                    <button
                      onClick={() =>
                        setDocuments((ds) =>
                          ds.filter(
                            (x) => x.id !== d.id
                          )
                        )
                      }
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-500/10 hover:text-red-400"
                      title={isPT ? "Eliminar" : "Delete"}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6 backdrop-blur-sm">
          <div className="w-full max-w-2xl rounded-2xl border border-white/[0.08] bg-[#0D1730] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold">
                  {editing
                    ? isPT
                      ? "Editar documento"
                      : "Edit document"
                    : isPT
                    ? "Novo documento"
                    : "New document"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {isPT
                    ? "Adiciona documentação interna para a equipa de TI."
                    : "Add internal documentation for the IT team."}
                </p>
              </div>

              <button
                onClick={reset}
                className="rounded-lg p-2 text-slate-500 hover:bg-[#101B36] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={submit}
              className="space-y-5 p-6"
            >
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-400">
                  {isPT ? "Nome *" : "Name *"}
                </label>

                <input
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder={
                    isPT
                      ? "Ex.: Procedimento de preparação de computadores"
                      : "E.g.: Computer preparation procedure"
                  }
                  className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-xs text-slate-400">
                    {isPT ? "Categoria" : "Category"}
                  </label>

                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        category:
                          e.target.value as Category,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm text-slate-300"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {categoryLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs text-slate-400">
                    {isPT ? "Data" : "Date"}
                  </label>

                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        date: e.target.value,
                      })
                    }
                    className="h-10 w-full rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  {isPT ? "Ficheiro" : "File"}
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-white/[0.09] bg-[#0A1328] px-4 py-4">
                  <Upload
                    size={18}
                    className="text-blue-400"
                  />

                  <span className="text-xs text-slate-400">
                    {form.fileName ||
                      (isPT
                        ? "Selecionar ficheiro"
                        : "Select file")}
                  </span>

                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];

                      if (f) {
                        setForm({
                          ...form,
                          fileName: f.name,
                          fileType: f.type,
                        });
                      }
                    }}
                  />
                </label>
              </div>

              <div>
                <label className="mb-2 block text-xs text-slate-400">
                  {isPT
                    ? "Descrição"
                    : "Description"}
                </label>

                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      description: e.target.value,
                    })
                  }
                  placeholder={
                    isPT
                      ? "Descrição breve do documento..."
                      : "Brief document description..."
                  }
                  className="w-full resize-none rounded-lg border border-white/[0.06] bg-[#0A1328] px-3 py-2.5 text-sm outline-none placeholder:text-slate-600"
                />
              </div>

              <div className="flex justify-end gap-3 border-t border-white/[0.06] pt-5">
                <button
                  type="button"
                  onClick={reset}
                  className="h-10 rounded-lg border border-white/[0.07] px-4 text-sm text-slate-400"
                >
                  {isPT ? "Cancelar" : "Cancel"}
                </button>

                <button className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-semibold">
                  {editing
                    ? isPT
                      ? "Guardar alterações"
                      : "Save changes"
                    : isPT
                    ? "Criar documento"
                    : "Create document"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}