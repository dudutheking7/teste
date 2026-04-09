import { createContext, useContext, useMemo, useState } from 'react';

const AppContext = createContext(null);

const initialKanban = {
  baseInativa: [],
  rastreioConcorrencia: [],
  primeiroContato: [],
  emNegociacao: [],
  concluido: [],
};

export function AppProvider({ children }) {
  const [companies, setCompanies] = useState([]);
  const [kanbanData, setKanbanData] = useState(initialKanban);

  const metrics = useMemo(() => {
    const inativas = companies.filter((item) => item.Status === 'Inativo').length;
    const novas = companies.filter((item) => item.Status === 'Nova').length;
    const reativadas = companies.filter((item) => item.Status === 'Reativada').length;
    return { inativas, novas, reativadas };
  }, [companies]);

  const value = {
    companies,
    setCompanies,
    metrics,
    kanbanData,
    setKanbanData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext deve ser usado dentro de AppProvider');
  }
  return ctx;
}
