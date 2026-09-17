import { ShieldX } from "lucide-react";
import { Link } from "react-router-dom";

const Forbidden = () => {
  return (
    <div className="min-h-screen bg-[#080D1F] flex items-center justify-center px-6">
      <div className="text-center">
        <ShieldX className="mx-auto mb-5 h-14 w-14 text-red-400" />
        <h1 className="text-4xl font-bold text-white">403</h1>
        <p className="mt-3 text-slate-400">Acesso não autorizado.</p>

        <Link
          to="/"
          className="mt-6 inline-flex rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-500"
        >
          Voltar
        </Link>
      </div>
    </div>
  );
};

export default Forbidden;