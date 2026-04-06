/**
 * Dashboard Principal:
 * Consolida os principais KPIs da operação (Inativas, Novas e Reativadas)
 * e exibe um gráfico de barras simplificado para produtividade relativa.
 */
import { BarChart3, RefreshCw, Sparkles, Users } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

function MetricCard({ title, value, icon: Icon, color }) {
  return (
    <div className="card flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <div className={`rounded-full p-3 ${color}`}>
        <Icon size={18} />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { metrics } = useAppContext();
  const chartData = [
    { label: 'Inativas', value: metrics.inativas, className: 'bg-red-500' },
    { label: 'Novas', value: metrics.novas, className: 'bg-sky-500' },
    { label: 'Reativadas', value: metrics.reativadas, className: 'bg-emerald-500' },
  ];

  const max = Math.max(1, ...chartData.map((item) => item.value));

  return (
    <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:col-span-2">
        <MetricCard title="Empresas Inativas" value={metrics.inativas} icon={Users} color="bg-red-500/20 text-red-300" />
        <MetricCard title="Novas Entradas" value={metrics.novas} icon={Sparkles} color="bg-sky-500/20 text-sky-300" />
        <MetricCard title="Reativadas" value={metrics.reativadas} icon={RefreshCw} color="bg-emerald-500/20 text-emerald-300" />
      </div>

      <div className="card">
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="text-violet-300" size={18} />
          <h2 className="font-semibold">Produtividade</h2>
        </div>
        <div className="space-y-3">
          {chartData.map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex justify-between text-xs text-slate-400">
                <span>{item.label}</span>
                <span>{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-slate-800">
                <div
                  className={`h-full rounded-full ${item.className}`}
                  style={{ width: `${(item.value / max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
