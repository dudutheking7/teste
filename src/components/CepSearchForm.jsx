/**
 * Buscador de CEP:
 * Preenche automaticamente endereço de cadastro utilizando ViaCEP,
 * reduzindo tempo operacional na inclusão de novas empresas.
 */
import { useState } from 'react';
import { MapPinned } from 'lucide-react';
import { buscarCep } from '../services/cepService';

export default function CepSearchForm() {
  const [form, setForm] = useState({
    cep: '',
    logradouro: '',
    bairro: '',
    cidade: '',
    uf: '',
  });
  const [error, setError] = useState('');

  async function handleCepBlur() {
    if (!form.cep) return;
    try {
      setError('');
      const data = await buscarCep(form.cep);
      setForm((prev) => ({
        ...prev,
        logradouro: data.logradouro,
        bairro: data.bairro,
        cidade: data.localidade,
        uf: data.uf,
      }));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center gap-2">
        <MapPinned size={18} className="text-sky-300" />
        <h2 className="text-lg font-semibold">Buscador de CEP</h2>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <input
          placeholder="CEP"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          value={form.cep}
          onChange={(event) => setForm({ ...form, cep: event.target.value })}
          onBlur={handleCepBlur}
        />
        <input
          placeholder="Logradouro"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          value={form.logradouro}
          onChange={(event) => setForm({ ...form, logradouro: event.target.value })}
        />
        <input
          placeholder="Bairro"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          value={form.bairro}
          onChange={(event) => setForm({ ...form, bairro: event.target.value })}
        />
        <input
          placeholder="Cidade"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          value={form.cidade}
          onChange={(event) => setForm({ ...form, cidade: event.target.value })}
        />
        <input
          placeholder="UF"
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2"
          value={form.uf}
          onChange={(event) => setForm({ ...form, uf: event.target.value })}
        />
      </div>
      {error && <p className="text-sm text-red-400">{error}</p>}
    </section>
  );
}
