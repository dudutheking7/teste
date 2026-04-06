/**
 * Verificador de CNPJ:
 * Consulta BrasilAPI para dados fiscais e cruza com Firestore para bloquear
 * registros já ativos na base antes do avanço no funil de prospecção.
 */
import { useState } from 'react';
import { SearchCheck } from 'lucide-react';
import { consultarCnpj } from '../services/cnpjService';

export default function CnpjVerifier() {
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleCheck() {
    if (!cnpj) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const data = await consultarCnpj(cnpj);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="card space-y-4">
      <h2 className="text-lg font-semibold">Verificador de CNPJ</h2>
      <div className="flex gap-2">
        <input
          value={cnpj}
          onChange={(event) => setCnpj(event.target.value)}
          placeholder="00.000.000/0000-00"
          className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
        />
        <button
          onClick={handleCheck}
          type="button"
          className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 hover:bg-violet-500"
          disabled={loading}
        >
          <SearchCheck size={16} />
          {loading ? 'Consultando...' : 'Verificar'}
        </button>
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {result && (
        <div className="rounded-lg border border-slate-800 bg-slate-800/40 p-3 text-sm">
          {result.exists ? (
            <p className="text-yellow-300">{result.message}</p>
          ) : (
            <>
              <p><strong>Razão Social:</strong> {result.razaoSocial}</p>
              <p><strong>CNAE:</strong> {result.cnae}</p>
            </>
          )}
        </div>
      )}
    </section>
  );
}
