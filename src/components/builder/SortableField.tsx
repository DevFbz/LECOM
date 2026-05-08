import { useSortable } from '@dnd-kit/sortable';
import { useDroppable } from '@dnd-kit/core';
import { 
  SortableContext, 
  rectSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { FormField } from '../../types/form';
import { cn } from '../../utils/lib';
import { Trash2, GripVertical, Settings2, ChevronDown, Table, Upload, ExternalLink, Layout, Plus } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedFieldId, removeField } from '../../store/slices/formSlice';
import type { RootState } from '../../store';
import { GridContainer } from './GridContainer';

interface SortableFieldProps {
  field: FormField;
  isSelected: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  isNested?: boolean;
}

export function SortableField({ field, isSelected, onSelect, onRemove, isNested }: SortableFieldProps) {
  const dispatch = useDispatch();
  const selectedFieldId = useSelector((state: RootState) => state.form.selectedFieldId);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: field.id });

  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: `droppable-${field.id}`,
    disabled: field.type !== 'group' && field.type !== 'grid',
    data: {
      type: field.type,
      accepts: true,
      originalId: field.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    gridColumn: `span ${field.columnWidth} / span ${field.columnWidth}`
  };

  const handleSelect = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(setSelectedFieldId(field.id));
    if (onSelect) onSelect();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch(removeField(field.id));
    if (onRemove) onRemove();
  };

  const renderFieldInput = () => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'date':
      case 'autocomplete':
      case 'integer':
      case 'decimal':
      case 'template':
        return (
          <input type="text" placeholder={field.placeholder || '...'} disabled className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 cursor-default shadow-sm" />
        );
      case 'textarea':
        return (
          <textarea disabled rows={3} placeholder={field.placeholder || '...'} className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 cursor-default resize-none shadow-sm" />
        );
      case 'currency':
      case 'number':
        return (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-xs font-bold">{field.type === 'currency' ? 'R$' : '#'}</span>
            <input type="text" placeholder={field.placeholder || "0,00"} disabled className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg pl-9 pr-4 py-2.5 text-sm text-[var(--text-main)] placeholder:text-[var(--text-muted)]/40 cursor-default text-right shadow-sm" />
          </div>
        );
      case 'list':
      case 'select':
        return (
          <div className="relative">
            <select disabled className="w-full bg-[var(--bg-main)] border border-[var(--border-color)] rounded-lg px-4 py-2.5 text-sm text-[var(--text-main)] cursor-default appearance-none shadow-sm">
              <option>{field.placeholder || 'Selecione uma opção'}</option>
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
              <ChevronDown size={16} />
            </div>
          </div>
        );
      case 'icon_button':
      case 'app_button':
        return (
          <button disabled className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-primary-900/20">
            {field.type === 'icon_button' ? <Table size={14} /> : <ExternalLink size={14} />}
            {field.label}
          </button>
        );
      case 'label':
        return (
          <div className="py-2">
            <span className="text-sm text-[var(--text-muted)] font-medium italic">{field.label}</span>
          </div>
        );
      case 'radio':
      case 'checkbox':
        return (
          <div className="flex flex-wrap gap-4 p-3 bg-[var(--bg-main)] rounded-lg border border-[var(--border-color)] border-dashed">
            {[1, 2].map(i => (
              <label key={i} className="flex items-center gap-2 opacity-50 cursor-default">
                <div className={cn(
                  "w-4 h-4 border border-[var(--border-color)]",
                  field.type === 'radio' ? "rounded-full" : "rounded"
                )} />
                <span className="text-xs text-[var(--text-muted)]">Opção {i}</span>
              </label>
            ))}
          </div>
        );
      case 'title':
        return (
          <div className="w-full border-b-2 border-primary-500 pb-2 mb-2">
            <h3 className="text-base font-black text-[var(--text-main)] uppercase tracking-tight">{field.label}</h3>
          </div>
        );
      case 'group':
        return (
          <div 
            ref={setDroppableRef}
            className={cn(
              "w-full border rounded-[1.5rem] overflow-hidden transition-all duration-300",
              isOver 
                ? "border-primary-500 ring-4 ring-primary-500/10 bg-primary-500/5 shadow-2xl" 
                : "border-[var(--border-color)] bg-[var(--bg-main)] shadow-sm"
            )}
          >
            <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layout size={14} className="text-primary-400" />
                <h3 className="text-[11px] font-black uppercase tracking-widest">{field.label}</h3>
              </div>
              <ChevronDown size={14} className="opacity-50" />
            </div>
            <div className={cn(
              "p-6 min-h-[100px] transition-all", 
              (!field.children || field.children.length === 0) && "flex flex-col items-center justify-center border-2 border-dashed border-[var(--border-color)] m-4 rounded-2xl bg-[var(--bg-card)]/50"
            )}>
              <SortableContext 
                items={field.children?.map(c => c.id) || []} 
                strategy={rectSortingStrategy}
              >
                {field.children && field.children.length > 0 ? (
                  <div className="grid grid-cols-12 gap-4">
                    {field.children.map(child => (
                      <SortableField 
                        key={child.id} 
                        field={child} 
                        isSelected={child.id === selectedFieldId} 
                        isNested
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center space-y-2 pointer-events-none">
                    <div className="w-10 h-10 rounded-xl bg-[var(--bg-main)] flex items-center justify-center mx-auto text-[var(--text-muted)] opacity-30 border border-[var(--border-color)]">
                      <Plus size={16} />
                    </div>
                    <span className="text-[9px] text-[var(--text-muted)] uppercase font-black tracking-widest block">Área de Agrupamento</span>
                    <p className="text-[8px] text-[var(--text-muted)] opacity-50">Solte campos aqui dentro</p>
                  </div>
                )}
              </SortableContext>
            </div>
          </div>
        );
      case 'grid':
        return (
          <GridContainer 
            field={field}
            isOver={isOver}
            selectedFieldId={selectedFieldId}
            setDroppableRef={setDroppableRef}
          />
        );
      case 'upload':
        return (
          <div className="w-full border-2 border-dashed border-[var(--border-color)] rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-[var(--bg-card)]/50 group/upload hover:bg-white transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)] group-hover/upload:text-primary-600 group-hover/upload:scale-110 transition-all shadow-sm border border-[var(--border-color)]">
              <Upload size={22} />
            </div>
            <div className="text-center">
              <div className="text-[var(--text-main)] text-xs font-bold uppercase tracking-wide">Anexar Documentos</div>
              <p className="text-[var(--text-muted)] text-[9px] mt-1 uppercase tracking-tighter font-medium">PDF, JPG, PNG até 10MB</p>
            </div>
          </div>
        );
      default:
        return <div className="p-3 text-[10px] text-[var(--text-muted)] italic bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)]">Componente em desenvolvimento: {field.type}</div>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-2xl transition-all duration-300 border border-transparent min-w-0",
        isNested ? "p-2" : "p-4",
        isSelected 
          ? "bg-white dark:bg-slate-800 border-primary-500/50 shadow-2xl shadow-primary-900/10 ring-1 ring-primary-500/20" 
          : "hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:shadow-xl hover:shadow-black/5 hover:border-[var(--border-color)]",
        isDragging && "opacity-30 grayscale scale-95 z-[100]",
        (field.type === 'title' || field.type === 'divider') && !isNested ? 'mt-6' : ''
      )}
      onClick={handleSelect}
    >
      <div className={cn("flex items-center justify-between mb-3 gap-2", isNested && "mb-1")}>
        <div className="flex items-center gap-2 min-w-0">
          <div {...listeners} {...attributes} className="shrink-0 p-1.5 hover:bg-slate-100 rounded-lg cursor-grab active:cursor-grabbing text-[var(--text-muted)] group-hover:text-primary-500 transition-all shadow-sm border border-transparent hover:border-slate-200">
            <GripVertical size={14} />
          </div>
          {field.type !== 'title' && field.type !== 'divider' && (
            <div className="flex flex-col min-w-0">
              <label className={cn(
                "font-black text-[var(--text-muted)] uppercase tracking-[0.1em] truncate", 
                isNested ? "text-[8px]" : "text-[10px]"
              )}>
                {field.label} {field.required && <span className="text-red-500">*</span>}
              </label>
              <span className="text-[8px] font-mono text-[var(--text-muted)] opacity-30 truncate uppercase">{field.technicalName || field.id.slice(0, 8)}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
          <button onClick={handleSelect} className="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-400 shadow-sm transition-all">
            <Settings2 size={isNested ? 10 : 12} />
          </button>
          <button onClick={handleRemove} className="p-1.5 bg-white dark:bg-slate-800 border border-red-100 dark:border-red-900/30 rounded-lg text-red-300 dark:text-red-400 hover:text-red-600 dark:hover:text-red-500 hover:border-red-200 dark:hover:border-red-800 shadow-sm transition-all">
            <Trash2 size={isNested ? 10 : 12} />
          </button>
        </div>
      </div>
      <div className="min-w-0">{renderFieldInput()}</div>
      
      {!isNested && !isSelected && (
        <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/10 rounded-2xl pointer-events-none transition-all" />
      )}
    </div>
  );
}
