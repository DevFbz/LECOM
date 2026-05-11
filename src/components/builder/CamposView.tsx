import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { 
  ChevronDown, 
  ChevronUp, 
  Pencil, 
  Layers, 
  X, 
  List, 
  Plus,
  Table as TableIcon,
  Eye,
  FileCode,
  Link2,
  CheckSquare,
  Type,
  Calendar,
  Hash,
  Box
} from 'lucide-react';
import { 
  setSelectedFieldId, 
  setSelectedGroupId,
  addGroup, 
  addField,
  removeField,
  setFieldPropertiesModalFieldId
} from '../../store/slices/formSlice';
import { v4 as uuidv4 } from 'uuid';
import { useState } from 'react';

const FieldTypeIcon = ({ type }: { type: string }) => {
  switch (type) {
    case 'text': return <Type size={14} className="text-slate-400" />;
    case 'textarea': return <List size={14} className="text-slate-400" />;
    case 'checkbox': return <CheckSquare size={14} className="text-slate-400" />;
    case 'select':
    case 'list': return <div className="w-4 h-4 rounded-full border-2 border-slate-400 flex items-center justify-center"><div className="w-1.5 h-1.5 rounded-full bg-slate-400" /></div>;
    case 'date': return <Calendar size={14} className="text-slate-400" />;
    case 'integer':
    case 'decimal': return <Hash size={14} className="text-slate-400" />;
    case 'grid': return <div className="bg-[#007bff] text-white text-[8px] font-bold px-1 py-0.5 rounded">GRID..</div>;
    case 'upload': return <Box size={14} className="text-slate-400" />;
    default: return <Type size={14} className="text-slate-400" />;
  }
};

const FieldTypeName = ({ type }: { type: string }) => {
  switch (type) {
    case 'text': return "Linha de texto";
    case 'textarea': return "Caixa de texto";
    case 'checkbox': return "Checkbox";
    case 'select':
    case 'list': return "Lista";
    case 'date': return "Data";
    case 'integer': return "Inteiro";
    case 'decimal': return "Decimal";
    case 'grid': return "Grid";
    case 'upload': return "Upload de arquivo";
    default: return type;
  }
};

export const CamposView = () => {
  const dispatch = useDispatch();
  const { schema } = useSelector((state: RootState) => state.form);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
      'all': true
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddField = (groupId: string) => {
    const newField = {
      id: uuidv4(),
      type: 'text' as any,
      label: 'Novo Campo',
      technicalName: 'CAMPO_' + Math.floor(Math.random() * 1000),
      required: false,
      disabled: false,
      visible: true,
      columnWidth: 12,
      group: groupId,
      meta: {}
    };
    dispatch(addField({ stepId: schema.steps[0]?.id, field: newField }));
    dispatch(setSelectedFieldId(newField.id));
  };

  const handleAddGroup = () => {
      const newGroup = {
          id: uuidv4(),
          name: 'Novo Agrupador'
      };
      dispatch(addGroup(newGroup));
  };

  const fieldsByGroup: Record<string, any[]> = {};
  (schema.groups || []).forEach(g => fieldsByGroup[g.id] = []);
  schema.steps.forEach(step => {
      step.fields.forEach(field => {
          const groupId = field.group || 'default';
          if (!fieldsByGroup[groupId]) fieldsByGroup[groupId] = [];
          
          // Previne duplicados se o campo já existe por algum motivo
          if (!fieldsByGroup[groupId].find(f => f.id === field.id)) {
             fieldsByGroup[groupId].push(field);
          }
      });
  });

  return (
    <div className="flex flex-col h-full bg-[#e9e9e9]">
      <div className="h-8 bg-[#f4f4f4] border-b border-slate-300 flex items-center px-4 gap-4 shadow-sm z-10 shrink-0">
        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
           <TableIcon size={12} className="text-[#0056b3]" /> Gerar tabela
        </button>
        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
           <Eye size={12} className="text-red-500" /> Mostrar campos inativos
        </button>
        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
           <FileCode size={12} className="text-yellow-600" /> Scripts
        </button>
        <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
           <Link2 size={12} className="text-slate-500" /> Integrações de API
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {(schema.groups || []).map((group) => {
          const isOpen = expandedGroups[group.id] !== false;
          const fields = fieldsByGroup[group.id] || [];

          return (
            <div key={group.id} className="bg-[#fdfdfd] border border-slate-300 shadow-sm rounded-sm">
              <div 
                className="h-8 bg-[#f4f4f4] border-b border-slate-200 flex items-center justify-between px-3 cursor-pointer select-none hover:bg-slate-100 transition-colors"
                onClick={() => toggleGroup(group.id)}
              >
                <div className="flex items-center gap-2">
                  {isOpen ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                  <span className="text-xs font-bold text-slate-700">{group.name}</span>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      dispatch(setSelectedGroupId(group.id));
                    }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-[#0056b3] transition-colors"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
                <div className="text-[10px] text-slate-400 font-bold uppercase">
                   {fields.length} ativos / 0 inativos
                </div>
              </div>

              {isOpen && (
                <div className="bg-white">
                  {fields.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <tbody className="divide-y divide-slate-100">
                          {fields.map((field, fIdx) => (
                            <tr key={field.id} className="group/row hover:bg-slate-50 transition-colors border-l-2 border-l-transparent hover:border-l-[#007bff]">
                              <td className="w-10 px-3 py-2 text-[10px] text-slate-400 font-bold border-r border-slate-100 text-center">{fIdx + 1}</td>
                              <td className="w-10 px-3 py-2 border-r border-slate-100 text-center">
                                 <FieldTypeIcon type={field.type} />
                              </td>
                              <td className="w-32 px-4 py-2 text-[11px] text-slate-600 font-medium border-r border-slate-100">
                                 <FieldTypeName type={field.type} />
                              </td>
                              <td className="w-48 px-4 py-2 text-[11px] text-slate-600 font-bold font-mono border-r border-slate-100 truncate">
                                 {field.technicalName?.toUpperCase() || 'CAMPO_SEM_NOME'}
                              </td>
                               <td className="px-4 py-2 text-[11px] text-slate-500 italic border-r border-slate-100 truncate">
                                 {field.label}
                              </td>
                              <td className="w-24 px-4 py-2">
                                 <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => dispatch(setSelectedFieldId(field.id))}
                                      title="Editar configurações"
                                      className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600"
                                    >
                                      <Pencil size={14} />
                                    </button>
                                     <button 
                                      onClick={() => dispatch(setFieldPropertiesModalFieldId(field.id))}
                                      title="Propriedades do campo na atividade"
                                      className="p-1 hover:bg-slate-100 rounded transition-colors text-slate-600"
                                    >
                                      <Layers size={14} className="text-[#0056b3]" />
                                    </button>
                                    <button 
                                      onClick={() => dispatch(removeField(field.id))}
                                      title="Excluir campo"
                                      className="p-1 hover:bg-red-50 rounded transition-colors text-slate-400 hover:text-red-500"
                                    >
                                      <X size={14} />
                                    </button>
                                 </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-[11px] italic">
                      Agrupador sem campos
                    </div>
                  )}
                  <div className="p-3 border-t border-slate-100 bg-slate-50/30">
                    <button 
                      onClick={() => handleAddField(group.id)}
                      className="text-[#0056b3] text-xs font-bold flex items-center gap-1 hover:underline"
                    >
                      <Plus size={14} /> Novo campo
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        <div className="pt-4 flex items-center gap-4">
           <button 
            onClick={handleAddGroup}
            className="bg-[#007bff] text-white px-4 py-2 rounded-sm text-xs font-bold flex items-center gap-2 shadow-sm hover:bg-[#0069d9] transition-all active:scale-95"
           >
              <Plus size={16} /> Criar novo agrupador
           </button>
           
           <div className="text-[10px] text-slate-400 font-bold uppercase italic">
              * Dica: Clique no lápis para editar as propriedades do campo
           </div>
        </div>
      </div>
    </div>
  );
};
