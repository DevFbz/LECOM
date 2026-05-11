import { useState } from 'react';
import type { FormField, FormGroup } from '../../types/form';
import { 
  X, 
  ChevronDown, 
  ChevronUp,
  HelpCircle,
  Trash2,
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { moveFieldToIndex } from '../../store/slices/formSlice';
import type { RootState } from '../../store';

interface SidebarRightProps {
  selectedField: FormField | null;
  selectedGroup?: FormGroup | null;
  isOpen: boolean;
  onUpdateField: (updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
  onUpdateGroup?: (id: string, updates: Partial<FormGroup>) => void;
  onRemoveGroup?: (id: string) => void;
  onClose: () => void;
}

const FieldTypeLabel = (type: string) => {
  switch (type) {
    case 'text': return 'Linha de texto';
    case 'textarea': return 'Caixa de texto';
    case 'checkbox': return 'Checkbox';
    case 'select':
    case 'list': return 'Lista';
    case 'date': return 'Data';
    case 'integer': return 'Inteiro';
    case 'decimal': return 'Decimal';
    case 'grid': return 'Grid';
    case 'upload': return 'Upload de arquivo';
    case 'label': return 'Label';
    default: return type;
  }
};

export const SidebarRight = ({ 
    selectedField, 
    selectedGroup,
    isOpen, 
    onUpdateField, 
    onRemoveField, 
    onUpdateGroup,
    onRemoveGroup,
    onClose 
}: SidebarRightProps) => {
  const dispatch = useDispatch();
  const { schema, activeStepId } = useSelector((state: RootState) => state.form);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
      'geral': true,
      'avancadas': true
  });

  if (!isOpen) return null;

  const toggleSection = (id: string) => {
      setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const fieldTypes = [
      'text', 'textarea', 'checkbox', 'list', 'date', 'integer', 'decimal', 'grid', 'upload', 'label'
  ];

  let currentPosition = 1;
  const currentStep = schema.steps.find(s => s.id === activeStepId);
  if (currentStep && selectedField) {
      const idx = currentStep.fields.findIndex(f => f.id === selectedField.id);
      if (idx !== -1) currentPosition = idx + 1;
  }

  return (
    <aside className="w-[320px] bg-[#f8f8f8] border-l border-slate-300 flex flex-col h-full overflow-hidden text-[#333] shadow-xl z-50 fixed right-0 top-0 bottom-0 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="p-4 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center justify-between mb-1">
           <h2 className="text-xs font-bold text-slate-500 uppercase">{selectedGroup ? 'Configurações do Agrupador' : 'Configurações do campo'}</h2>
           <X size={18} className="text-slate-400 cursor-pointer hover:text-slate-600" onClick={onClose} />
        </div>
        <h1 className="text-sm font-bold text-[#333] font-mono">
            {selectedGroup ? selectedGroup.name : (selectedField?.technicalName || 'CAMPO_SEM_NOME')}
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2 bg-[#e9e9e9]">
        
        {/* AGROUPADOR CONFIG */}
        {selectedGroup && (
            <div className="bg-white border border-slate-200 shadow-sm rounded">
                <div 
                    className="p-2 flex items-center gap-2 cursor-pointer select-none"
                    onClick={() => toggleSection('geral')}
                >
                    {expandedSections['geral'] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                    <span className="text-[11px] font-bold text-slate-700 uppercase">Geral</span>
                </div>
                {expandedSections['geral'] && (
                    <div className="p-3 border-t border-slate-100 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase block">Nome do Agrupador *</label>
                            <input 
                                type="text" 
                                value={selectedGroup.name}
                                onChange={(e) => onUpdateGroup?.(selectedGroup.id, { name: e.target.value })}
                                className="w-full border border-slate-300 p-2 text-xs rounded-sm outline-none focus:border-[#007bff] transition-all" 
                            />
                        </div>
                        
                        <div className="pt-2 mt-2 border-t border-slate-100">
                           <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">Visibilidade por Etapa</label>
                           <p className="text-[9px] text-slate-400 leading-tight mb-3">
                              Selecione as etapas onde este agrupador deve ficar <b>oculto</b>.
                           </p>
                           <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar">
                              {schema.steps.map(step => (
                                  <label key={step.id} className="flex items-center gap-2 cursor-pointer p-1.5 hover:bg-slate-50 rounded">
                                      <input 
                                          type="checkbox" 
                                          checked={selectedGroup.stepVisibility?.[step.id] === true}
                                          onChange={(e) => {
                                              const newVisibility = { ...(selectedGroup.stepVisibility || {}) };
                                              newVisibility[step.id] = e.target.checked;
                                              onUpdateGroup?.(selectedGroup.id, { stepVisibility: newVisibility });
                                          }}
                                          className="w-3 h-3 rounded border-slate-300 text-[#0056b3]" 
                                      />
                                      <span className="text-[11px] text-slate-600 truncate flex-1" title={step.title}>
                                         Ocultar na etapa: <b>{step.title}</b>
                                      </span>
                                  </label>
                              ))}
                           </div>
                        </div>
                    </div>
                )}
            </div>
        )}

        {/* FIELD CONFIG */}
        {selectedField && (
            <>
                {/* Geral Section */}
                <div className="bg-white border border-slate-200 shadow-sm rounded">
                    <div 
                        className="p-2 flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => toggleSection('geral')}
                    >
                        {expandedSections['geral'] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        <span className="text-[11px] font-bold text-slate-700 uppercase">Geral</span>
                    </div>
                    
                    {expandedSections['geral'] && (
                        <div className="p-3 border-t border-slate-100 space-y-4">
                            {/* Agrupadores */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Agrupador:</label>
                                <select 
                                    value={selectedField.group || ''}
                                    onChange={(e) => onUpdateField({ group: e.target.value })}
                                    className="w-full bg-white border border-slate-300 p-1.5 text-xs rounded outline-none"
                                >
                                    <option value="">Selecione um agrupador</option>
                                    {schema.groups?.map(g => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Tipo */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-0.5">
                                    <span className="text-red-500">*</span> Tipo:
                                </label>
                                <div className="relative">
                                    <select 
                                        value={selectedField.type}
                                        onChange={(e) => onUpdateField({ type: e.target.value as any })}
                                        className="w-full bg-white border border-slate-300 p-1.5 text-xs rounded outline-none appearance-none"
                                    >
                                        {fieldTypes.map(t => (
                                            <option key={t} value={t}>{FieldTypeLabel(t)}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                </div>
                            </div>

                            {/* Nome técnico */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-0.5">
                                    <span className="text-red-500">*</span> Nome técnico <HelpCircle size={10} className="text-[#0056b3]" />:
                                </label>
                                <input 
                                    type="text" 
                                    value={selectedField.technicalName || ''}
                                    onChange={(e) => onUpdateField({ technicalName: e.target.value.toUpperCase() })}
                                    className="w-full bg-[#f4f4f4] border border-slate-300 p-1.5 text-xs rounded outline-none font-mono text-slate-500" 
                                />
                            </div>

                            {/* Label */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Rótulo / Label:</label>
                                <input 
                                    type="text" 
                                    value={selectedField.label}
                                    onChange={(e) => onUpdateField({ label: e.target.value })}
                                    className="w-full border border-slate-300 p-1.5 text-xs rounded outline-none" 
                                />
                            </div>

                            {/* Tamanho */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-0.5">
                                    <span className="text-red-500">*</span> Tamanho:
                                </label>
                                <div className="flex items-center gap-2">
                                    <input 
                                        type="number" 
                                        defaultValue={Math.round((selectedField.columnWidth || 12) * 8.333)}
                                        key={selectedField.id + (selectedField.columnWidth || 12)}
                                        onBlur={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (!isNaN(val)) {
                                                const gridWidth = Math.max(1, Math.min(12, Math.round(val / 8.333)));
                                                onUpdateField({ columnWidth: gridWidth });
                                            }
                                        }}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                const val = parseInt((e.target as HTMLInputElement).value);
                                                if (!isNaN(val)) {
                                                    const gridWidth = Math.max(1, Math.min(12, Math.round(val / 8.333)));
                                                    onUpdateField({ columnWidth: gridWidth });
                                                }
                                            }
                                        }}
                                        className="w-16 border border-slate-300 p-1.5 text-xs rounded outline-none focus:border-[#007bff]" 
                                    />
                                    <span className="text-[10px] text-slate-400 font-bold">%</span>
                                </div>
                            </div>

                            {/* Posição */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Posição:</label>
                                <input 
                                    type="number" 
                                    min="1"
                                    max={currentStep?.fields.length || 1}
                                    defaultValue={currentPosition}
                                    key={selectedField.id + currentPosition}
                                    onBlur={(e) => {
                                        const val = parseInt(e.target.value);
                                        if (!isNaN(val) && val > 0) {
                                            dispatch(moveFieldToIndex({ fieldId: selectedField.id, newIndex: val - 1 }));
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            const val = parseInt((e.target as HTMLInputElement).value);
                                            if (!isNaN(val) && val > 0) {
                                                dispatch(moveFieldToIndex({ fieldId: selectedField.id, newIndex: val - 1 }));
                                            }
                                        }
                                    }}
                                    className="w-full border border-slate-300 p-1.5 text-xs rounded outline-none focus:border-[#007bff]" 
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Opções avançadas Section */}
                <div className="bg-white border border-slate-200 shadow-sm rounded">
                    <div 
                        className="p-2 flex items-center gap-2 cursor-pointer select-none"
                        onClick={() => toggleSection('avancadas')}
                    >
                        {expandedSections['avancadas'] ? <ChevronUp size={14} className="text-slate-400" /> : <ChevronDown size={14} className="text-slate-400" />}
                        <span className="text-[11px] font-bold text-slate-700 uppercase">Opções avançadas</span>
                    </div>
                    
                    {expandedSections['avancadas'] && (
                        <div className="p-3 border-t border-slate-100 space-y-4">
                            {/* Exibição */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block">Exibição:</label>
                                <div className="flex items-center gap-4">
                                    {[
                                        { id: 'normal' as const, label: 'Normal' },
                                        { id: 'repetition' as const, label: 'Repetição' },
                                        { id: 'grid' as const, label: 'Grid' }
                                    ].map(opt => (
                                        <label key={opt.id} className="flex items-center gap-1.5 cursor-pointer">
                                            <input 
                                                type="radio" 
                                                name="display" 
                                                checked={(selectedField.meta?.displayType || 'normal') === opt.id}
                                                onChange={() => onUpdateField({ meta: { ...selectedField.meta, displayType: opt.id } })}
                                                className="w-3 h-3 text-[#0056b3]" 
                                            />
                                            <span className="text-[11px] text-slate-600">{opt.label}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Seleção de Grid */}
                            {selectedField.meta?.displayType === 'grid' && (
                                <div className="space-y-1 bg-blue-50 p-2 rounded border border-blue-100">
                                    <label className="text-[10px] font-bold text-[#0056b3] uppercase block">
                                        Identificador da Grid:
                                    </label>
                                    <input 
                                        type="text" 
                                        value={selectedField.meta?.gridId || ''}
                                        onChange={(e) => onUpdateField({ meta: { ...selectedField.meta, gridId: e.target.value.toUpperCase() } })}
                                        placeholder="Ex: MINHA_GRID"
                                        className="w-full border border-[#0056b3]/30 p-1.5 text-xs rounded outline-none text-[#0056b3] font-bold font-mono uppercase" 
                                    />
                                    <p className="text-[9px] text-[#0056b3]/70 mt-1">
                                        Campos com o mesmo Identificador serão agrupados na mesma tabela.
                                    </p>
                                </div>
                            )}

                            {/* Máscara */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase block flex items-center gap-0.5">
                                    Máscara <HelpCircle size={10} className="text-[#0056b3]" />:
                                </label>
                                <input 
                                    type="text" 
                                    value={selectedField.meta?.mask || ''}
                                    onChange={(e) => onUpdateField({ meta: { ...selectedField.meta, mask: e.target.value } })}
                                    placeholder="Ex: 99.999.999-99"
                                    className="w-full border border-slate-300 p-1.5 text-xs rounded outline-none" 
                                />
                            </div>

                            {/* Exibir na pesquisa */}
                            <label className="flex items-center gap-2 cursor-pointer pt-2">
                                <input type="checkbox" className="w-3 h-3 rounded border-slate-300 text-[#0056b3]" />
                                <span className="text-[11px] text-slate-600">Exibir na pesquisa</span>
                            </label>
                        </div>
                    )}
                </div>
            </>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-300 bg-white space-y-2 shrink-0">
          {selectedGroup && (
              <button 
                onClick={() => {
                    if (confirm(`Deseja realmente excluir o agrupador "${selectedGroup.name}"?`)) {
                        onRemoveGroup?.(selectedGroup.id);
                        onClose();
                    }
                }}
                className="w-full py-2 bg-white border border-red-200 text-red-500 text-[10px] font-bold uppercase rounded shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                  <Trash2 size={14} /> EXCLUIR AGRUPADOR
              </button>
          )}
          
          {selectedField && (
              <button 
                onClick={() => {
                    if (confirm(`Deseja realmente excluir o campo "${selectedField.technicalName}"?`)) {
                        onRemoveField(selectedField.id);
                        onClose();
                    }
                }}
                className="w-full py-2 bg-white border border-red-200 text-red-500 text-[10px] font-bold uppercase rounded shadow-sm hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
              >
                  <Trash2 size={14} /> EXCLUIR CAMPO
              </button>
          )}

          <button 
            onClick={onClose}
            className="w-full py-2 bg-[#007bff] text-white text-[10px] font-bold uppercase rounded shadow-sm hover:bg-[#0069d9] transition-all"
          >
            SALVAR CONFIGURAÇÕES
          </button>
      </div>
    </aside>
  );
};
