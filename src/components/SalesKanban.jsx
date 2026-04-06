/**
 * Kanban de Vendas:
 * Organiza o pipeline comercial em colunas drag-and-drop para priorização
 * e acompanhamento visual do avanço das oportunidades.
 */
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { useAppContext } from '../context/AppContext';

const columns = [
  { id: 'baseInativa', title: 'Base Inativa' },
  { id: 'rastreioConcorrencia', title: 'Rastreio Concorrência' },
  { id: 'primeiroContato', title: 'Primeiro Contato' },
  { id: 'emNegociacao', title: 'Em Negociação' },
  { id: 'concluido', title: 'Concluído' },
];

export default function SalesKanban() {
  const { kanbanData, setKanbanData, companies } = useAppContext();

  function handleSeed() {
    const seeds = companies.slice(0, 10).map((c, index) => ({
      id: `lead-${index}`,
      nome: c.Empresa || c.RazaoSocial || `Lead ${index + 1}`,
    }));

    setKanbanData((prev) => ({ ...prev, baseInativa: seeds }));
  }

  function handleDragEnd(result) {
    if (!result.destination) return;

    const { source, destination } = result;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    setKanbanData((prev) => {
      const sourceItems = [...prev[source.droppableId]];
      const [moved] = sourceItems.splice(source.index, 1);

      if (source.droppableId === destination.droppableId) {
        sourceItems.splice(destination.index, 0, moved);
        return { ...prev, [source.droppableId]: sourceItems };
      }

      const destItems = [...prev[destination.droppableId]];
      destItems.splice(destination.index, 0, moved);

      return {
        ...prev,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destItems,
      };
    });
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
                            className="rounded-md border border-slate-700 bg-slate-800 p-2 text-sm"
                          >
                            {item.nome}
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
