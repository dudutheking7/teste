/**
 * Módulo de Planilhas:
 * Faz upload de .xlsx, converte para JSON com xlsx, permite edição inline
 * dos campos Status/Data de Contato e exporta novamente para Excel.
 */
import { Download, Upload } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { exportExcel, parseExcel } from '../hooks/useSpreadsheet';

export default function SpreadsheetModule() {
  const { companies, setCompanies } = useAppContext();

  function handleUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    parseExcel(file, (json) => setCompanies(json));
  }

  function updateField(index, key, value) {
    setCompanies((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return { ...item, [key]: value };
      })
    );
  }

  return (
    <section className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold">Módulo de Planilhas</h2>
        <div className="flex gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium hover:bg-sky-500">
            <Upload size={16} />
            Upload .xlsx
            <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
          </label>
          <button
            type="button"
            onClick={() => exportExcel(companies)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium hover:bg-emerald-500"
          >
            <Download size={16} />
            Exportar
          </button>
        </div>
      </div>

      <div className="overflow-auto">
        <table className="min-w-full divide-y divide-slate-800 text-sm">
          <thead>
            <tr className="text-left text-slate-400">
              <th className="py-2 pr-4">Empresa</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Data de Contato</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {companies.map((company, index) => (
              <tr key={`${company.CNPJ || company.Empresa || 'row'}-${index}`}>
                <td className="py-2 pr-4">{company.Empresa || company.RazaoSocial || '-'}</td>
                <td className="py-2 pr-4">
                  <select
                    className="rounded bg-slate-800 px-2 py-1"
                    value={company.Status || 'Inativo'}
                    onChange={(event) => updateField(index, 'Status', event.target.value)}
                  >
                    <option>Inativo</option>
                    <option>Nova</option>
                    <option>Reativada</option>
                    <option>Concorrência</option>
                  </select>
                </td>
                <td className="py-2 pr-4">
                  <input
                    type="date"
                    className="rounded bg-slate-800 px-2 py-1"
                    value={company['Data de Contato'] || ''}
                    onChange={(event) => updateField(index, 'Data de Contato', event.target.value)}
                  />
                </td>
              </tr>
            ))}
            {!companies.length && (
              <tr>
                <td colSpan={3} className="py-6 text-center text-slate-500">
                  Faça upload de uma planilha para iniciar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
