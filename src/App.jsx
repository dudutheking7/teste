import Dashboard from './components/Dashboard';
import SpreadsheetModule from './components/SpreadsheetModule';
import CnpjVerifier from './components/CnpjVerifier';
import CepSearchForm from './components/CepSearchForm';
import GeomarketingMap from './components/GeomarketingMap';
import SalesKanban from './components/SalesKanban';

export default function App() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="card">
          <h1 className="text-2xl font-bold">BI de Prospecção e Reativação</h1>
          <p className="text-slate-400">
            Painel integrado para gestão de base inativa, concorrência e conversão comercial.
          </p>
        </header>

        <Dashboard />
        <SpreadsheetModule />

        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CnpjVerifier />
          <CepSearchForm />
        </section>

        <GeomarketingMap />
        <SalesKanban />
      </div>
    </main>
  );
}
