/**
 * Verificador de CNPJ (Enriquecimento de Decisores):
 * Consulta BrasilAPI, cruza CNPJ ativo no Firestore, exibe QSA com atalhos LinkedIn,
 * e permite adicionar empresa ao rastreio (coleção prospects) com coordenadas geográficas.
 */
import { useState } from 'react';
import { SearchCheck, UserRoundSearch } from 'lucide-react';
import { adicionarProspectAoRastreio, consultarCnpj } from '../services/cnpjService';

export default function CnpjVerifier() {
  const [cnpj, setCnpj] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');

  async function handleCheck() {
    if (!cnpj) return;
    setLoading(true);
    setError('');
    setSaveMessage('');
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

  async function handleAddProspect() {
    if (!result || result.exists) return;
    setSaving(true);
    setSaveMessage('');
    try {
      const saved = await adicionarProspectAoRastreio(result);
      setSaveMessage(`Prospect salvo com sucesso (ID: ${saved.id}).`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
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
      {saveMessage && <p className="text-sm text-emerald-400">{saveMessage}</p>}

      {result && (
        <div className="space-y-3 rounded-lg border border-slate-800 bg-slate-800/40 p-3 text-sm">
          {result.exists ? (
            <p className="text-yellow-300">{result.message}</p>
          ) : (
            <>
              <p><strong>Razão Social:</strong> {result.razaoSocial}</p>
              <p><strong>CNAE:</strong> {result.cnae}</p>
              <p><strong>Município/UF:</strong> {result.municipio} - {result.uf}</p>

              <div className="flex flex-wrap gap-2">
                <a
                  href={result.linkedinRhUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-sky-700 px-3 py-1.5 hover:bg-sky-600"
                >
                  <UserRoundSearch size={14} />
                  Busca Rápida no LinkedIn (RH)
                </a>

                <button
                  type="button"
                  onClick={handleAddProspect}
                  disabled={saving}
                  className="rounded-lg bg-emerald-700 px-3 py-1.5 hover:bg-emerald-600 disabled:opacity-60"
                >
                  {saving ? 'Salvando...' : 'Adicionar ao Rastreio'}
                </button>
              </div>

              <div>
                <h3 className="mb-2 font-semibold text-slate-200">Quadro de Sócios (QSA)</h3>
                {!result.qsa?.length && <p className="text-slate-400">Não há sócios retornados para este CNPJ.</p>}
                <ul className="space-y-2">
                  {result.qsa?.map((socio) => (
                    <li key={socio.id} className="rounded border border-slate-700 bg-slate-900/60 p-2">
                      <p className="font-medium">{socio.nome}</p>
                      <p className="text-xs text-slate-400">Qualificação: {socio.qualificacao}</p>
                      <a
                        href={socio.linkedinUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-block text-xs text-sky-300 hover:text-sky-200"
                      >
                        Busca Rápida no LinkedIn
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
