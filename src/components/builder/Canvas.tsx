import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import type { FormField } from '../../types/form';
import { SortableField } from './SortableField.tsx';
import { cn } from '../../utils/lib';
import { LayoutGrid } from 'lucide-react';

interface CanvasProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  onRemoveField: (id: string) => void;
}

export const Canvas = ({ fields, selectedFieldId, onSelectField, onRemoveField }: CanvasProps) => {
  const { setNodeRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[600px] rounded-[2.5rem] p-10 transition-all duration-500",
        fields.length === 0 
          ? "border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center bg-[var(--bg-card)]/30" 
          : "bg-[var(--bg-card)] border border-[var(--border-color)] shadow-2xl shadow-black/5",
        isOver && "ring-4 ring-primary-500/10 bg-primary-500/5 border-primary-500/30 scale-[1.01]"
      )}
    >
      {fields.length === 0 ? (
        <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-700">
          <div className="w-20 h-20 bg-[var(--bg-main)] rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl border border-[var(--border-color)] text-slate-300">
            <LayoutGrid size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">Comece a construir seu formulário</h3>
            <p className="text-sm text-[var(--text-muted)] max-w-[280px] mx-auto leading-relaxed">
              Arraste componentes da biblioteca à esquerda e solte-os aqui para dar vida ao seu processo.
            </p>
          </div>
          <div className="pt-4">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-[10px] font-black text-primary-600 uppercase tracking-widest">
               <span className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />
               Aguardando Interação
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-12 gap-6 auto-rows-min">
          <SortableContext 
            items={fields.map(f => f.id)} 
            strategy={rectSortingStrategy}
          >
            {fields.map((field) => (
              <SortableField 
                key={field.id} 
                field={field} 
                isSelected={selectedFieldId === field.id}
                onSelect={() => onSelectField(field.id)}
                onRemove={() => onRemoveField(field.id)}
              />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
};
