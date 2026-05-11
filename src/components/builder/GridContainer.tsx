import { useState } from 'react';
import { 
  SortableContext, 
  rectSortingStrategy 
} from '@dnd-kit/sortable';
import { 
  Table as TableIcon, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { FormField } from '../../types/form';
import { SortableField } from './SortableField';
import { cn } from '../../utils/lib';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { addField } from '../../store/slices/formSlice';
import { v4 as uuidv4 } from 'uuid';

interface GridContainerProps {
  field: FormField;
  isOver: boolean;
  selectedFieldId: string | null;
  setDroppableRef: (node: HTMLElement | null) => void;
}

export const GridContainer = ({ field, isOver, selectedFieldId, setDroppableRef }: GridContainerProps) => {
  const dispatch = useDispatch();
  const activeStepId = useSelector((state: RootState) => state.form.activeStepId);
  const [tableData, setTableData] = useState<any[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const handleAddRow = () => {
    if (Object.keys(formValues).length === 0) return;
    setTableData([...tableData, { ...formValues, id: Date.now() }]);
    setFormValues({});
  };

  const handleRemoveRow = (id: number) => {
    setTableData(tableData.filter(row => row.id !== id));
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleAddColumn = () => {
    dispatch(addField({
      field: {
        id: uuidv4(),
        type: 'text',
        label: `NOVA COLUNA ${field.children ? field.children.length + 1 : 1}`,
        required: false,
        disabled: false,
        visible: true,
        columnWidth: 12,
        meta: {}
      },
      stepId: activeStepId as string,
      parentId: field.id
    }));
  };

  return (
    <div 
      ref={setDroppableRef}
      className={cn(
        "w-full bg-white dark:bg-slate-900 border rounded-[2rem] overflow-hidden transition-all duration-500",
        isOver 
          ? "border-primary-500 ring-4 ring-primary-500/10 shadow-2xl scale-[1.01]" 
          : "border-slate-200 dark:border-slate-800 shadow-xl shadow-black/5"
      )}
    >
      {/* Grid Header */}
      <div className="bg-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center border border-primary-500/20">
            <TableIcon size={20} className="text-primary-400" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{field.label}</h3>
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] opacity-60">Engine de Dados Dinâmicos</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleAddColumn}
            className="px-3 py-1.5 rounded-xl bg-primary-600 hover:bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest transition-all shadow-md active:scale-95 flex items-center gap-1"
          >
            <Plus size={12} strokeWidth={3} /> Nova Coluna
          </button>
          <div className="px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Grid Ativo
          </div>
        </div>
      </div>

      {/* Grid Content / Form Area */}
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-200 dark:border-slate-800 pb-3">
            <LayoutGrid size={14} className="text-slate-400" />
            <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Definição de Colunas</span>
          </div>
          
          <div className={cn(
            "min-h-[160px] rounded-3xl transition-all p-6 relative",
            (!field.children || field.children.length === 0) 
              ? "border-2 border-dashed border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex flex-col items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" 
              : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-inner"
          )}
          onClick={() => { if (!field.children || field.children.length === 0) handleAddColumn() }}
          >
            <SortableContext 
              items={field.children?.map(c => c.id) || []} 
              strategy={rectSortingStrategy}
            >
              {field.children && field.children.length > 0 ? (
                <div className="grid grid-cols-12 gap-6">
                  {field.children.map(child => (
                    <div key={child.id} className="col-span-3 space-y-3">
                      <SortableField 
                        field={child} 
                        isSelected={child.id === selectedFieldId} 
                        isNested
                      />
                      <input 
                        type="text"
                        value={formValues[child.id] || ''}
                        onChange={(e) => handleInputChange(child.id, e.target.value)}
                        placeholder={`Valor...`}
                        className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-[13px] text-slate-900 dark:text-slate-100 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all placeholder:text-slate-400 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center space-y-4 pointer-events-none">
                  <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto shadow-xl border border-slate-200 dark:border-slate-700 text-slate-400 group-hover:text-primary-500 transition-colors">
                    <Plus size={24} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-[12px] text-slate-700 dark:text-slate-300 font-bold uppercase tracking-tight">Adicionar Primeira Coluna</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest opacity-80">Clique aqui para criar uma coluna</p>
                  </div>
                </div>
              )}
            </SortableContext>

            {field.children && field.children.length > 0 && (
              <div className="mt-10 flex justify-end">
                <button 
                  onClick={handleAddRow}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-8 py-3 rounded-2xl text-[12px] font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl active:scale-95"
                >
                  Adicionar na Tabela <Plus size={16} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Table Area */}
        <div className="mt-10 overflow-hidden border border-slate-200 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-2xl shadow-black/5">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px] border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
                  {field.children && field.children.length > 0 ? (
                    <>
                      {field.children.map(child => (
                        <th key={child.id} className="px-6 py-4 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                          {child.label}
                        </th>
                      ))}
                      <th className="px-6 py-4 text-slate-700 dark:text-slate-300 font-black uppercase tracking-widest w-24 text-center">Ações</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-4 text-slate-400 font-black uppercase tracking-widest border-r border-slate-200 dark:border-slate-800 opacity-50">Coluna A</th>
                      <th className="px-6 py-4 text-slate-400 font-black uppercase tracking-widest border-r border-slate-200 dark:border-slate-800 opacity-50">Coluna B</th>
                      <th className="px-6 py-4 text-slate-400 font-black uppercase tracking-widest w-24 text-center opacity-50">Ações</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tableData.length > 0 ? (
                  tableData.map((row) => (
                    <tr key={row.id} className="hover:bg-primary-500/5 transition-all group/row">
                      {field.children?.map(child => (
                        <td key={child.id} className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium border-r border-slate-200 dark:border-slate-800 last:border-r-0">
                          {row[child.id] || '-'}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <button 
                          onClick={() => handleRemoveRow(row.id)}
                          className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all opacity-0 group-hover/row:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={(field.children?.length || 2) + 1} className="px-6 py-16 text-center text-slate-400 font-bold bg-slate-50/50 dark:bg-slate-800/10">
                      <div className="flex flex-col items-center gap-3 opacity-30">
                        <TableIcon size={32} />
                        <span className="uppercase tracking-[0.3em] text-[10px]">Tabela Vazia</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer / Pagination */}
          <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between text-[11px] text-slate-500">
            <div className="flex items-center gap-4">
               <div className="flex items-center gap-2">
                <span className="font-bold opacity-60">Visualizar:</span>
                <select className="bg-transparent border-none focus:ring-0 font-black uppercase text-[10px] cursor-pointer outline-none dark:text-slate-300">
                  <option>10 linhas</option>
                  <option>20 linhas</option>
                  <option>50 linhas</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-8">
              <div className="font-black uppercase tracking-widest opacity-60">
                {tableData.length > 0 ? `Exibindo 1-${tableData.length} de ${tableData.length}` : 'Nenhum registro'}
              </div>
              <div className="flex items-center gap-2">
                <button disabled className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl opacity-30 cursor-not-allowed"><ChevronLeft size={16} /></button>
                <button disabled className="p-2 border border-slate-200 dark:border-slate-700 rounded-xl opacity-30 cursor-not-allowed"><ChevronRight size={16} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
