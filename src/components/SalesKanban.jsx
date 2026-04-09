/**
 * Kanban de Vendas (Validação + Fluxo):
 * Permite validar vagas na fonte e persistir mudanças de estágio no Firestore
 * em tempo real ao arrastar cards entre as colunas do funil.
 */
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { ExternalLink } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { atualizarStatusLead, ensureLeadDocument } from '../services/kanbanService';

const columns = [
  { id: 'baseInativa', title: 'Base Inativa' },
  { id: 'rastreioConcorrencia', title: 'Rastreio Concorrência' },
  { id: 'primeiroContato', title: 'Primeiro Contato' },
  { id: 'emNegociacao', title: 'Em Negociação' },
  { id: 'concluido', title: 'Concluído' },
];

const statusByColumn = {
  baseInativa: 'Base Inativa',
  rastreioConcorrencia: 'Rastreio Concorrência',
  primeiroContato: 'Primeiro Contato',
  emNegociacao: 'Em Negociação',
  concluido: 'Concluído',
};

export default function SalesKanban() {
  const { kanbanData, setKanbanData, companies } = useAppContext();

  function handleSeed() {
    const seeds = companies.slice(0, 10).map((c, index) => ({
      id: `lead-${index}`,
      nome: c.Empresa || c.RazaoSocial || `Lead ${index + 1}`,
      url: c.URL || c.Link || c.Site || '',
      status: 'Base Inativa',
      firestoreId: null,
    }));

    setKanbanData((prev) => ({ ...prev, baseInativa: seeds }));
  }

  async function persistLeadStatus(lead, destinationColumn) {
    const firestoreId = await ensureLeadDocument(lead);
    await atualizarStatusLead(firestoreId, statusByColumn[destinationColumn]);
    return firestoreId;
  }

  async function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    const sourceItems = [...kanbanData[source.droppableId]];
    const [moved] = sourceItems.splice(source.index, 1);

    const destItems = [...kanbanData[destination.droppableId]];
    destItems.splice(destination.index, 0, moved);

    setKanbanData((prev) => ({
      ...prev,
      [source.droppableId]: sourceItems,
      [destination.droppableId]: destItems,
    }));

    try {
      const firestoreId = await persistLeadStatus(moved, destination.droppableId);
      setKanbanData((prev) => {
        const updatedDest = prev[destination.droppableId].map((item, idx) => {
          if (idx !== destination.index) return item;
          return { ...item, firestoreId, status: statusByColumn[destination.droppableId] };
        });
        return { ...prev, [destination.droppableId]: updatedDest };
      });
    } catch (error) {
      console.error('Erro ao persistir mudança no Firestore:', error);
    }
  }

  return (
    <section className="card space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Kanban de Vendas</h2>
        <button className="rounded-lg bg-indigo-600 px-3 py-2 text-sm hover:bg-indigo-500" type="button" onClick={handleSeed}>
          Popular da Planilha
        </button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 gap-3 xl:grid-cols-5">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps} className="rounded-lg border border-slate-800 bg-slate-900 p-2">
                  <h3 className="mb-2 text-sm font-semibold text-slate-300">{column.title}</h3>
                  <div className="space-y-2">
                    {kanbanData[column.id].map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(dragProvided) => (
                          <div
                            ref={dragProvided.innerRef}
                            {...dragProvided.draggableProps}
                            {...dragProvided.dragHandleProps}
                            className="space-y-2 rounded-md border border-slate-700 bg-slate-800 p-2 text-sm"
                          >
                            <p>{item.nome}</p>

                            {item.url && (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 rounded bg-slate-700 px-2 py-1 text-xs hover:bg-slate-600"
                              >
                                <ExternalLink size={12} />
                                Validar Vaga na Fonte
                              </a>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}
