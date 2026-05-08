import { useState } from 'react';
import type { FormField, FieldType } from '../../types/form';
import { 
  X, 
  ChevronDown, 
  Menu,
  Plus,
  Type, 
  AlignLeft,
  Hash, 
  Calendar, 
  DollarSign,
  List,
  BarChart2,
  ExternalLink,
  FileText,
  Tag,
  CircleDot, 
  CheckSquare,
  Binary,
  MinusSquare,
  PlusSquare
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { moveFieldBetweenSteps, setSchema, moveFieldToIndex } from '../../store/slices/formSlice';
import type { RootState } from '../../store';
import { cn } from '../../utils/lib';

interface SidebarRightProps {
  selectedField: FormField | null;
  onUpdateField: (updates: Partial<FormField>) => void;
  onRemoveField: (id: string) => void;
}

const FieldTypeIcon = ({ type, size = 14 }: { type: FieldType; size?: number }) => {
  switch (type) {
    case 'text': return <Type size={size} />;
    case 'textarea': return <AlignLeft size={size} />;
    case 'integer': return <Hash size={size} />;
    case 'decimal': return <Binary size={size} />;
    case 'currency': return <DollarSign size={size} />;
    case 'date': return <Calendar size={size} />;
    case 'list': return <List size={size} />;
    case 'icon_button': return <BarChart2 size={size} />;
    case 'app_button': return <ExternalLink size={size} />;
    case 'template': return <FileText size={size} />;
    case 'label': return <Tag size={size} />;
    case 'radio': return <CircleDot size={size} />;
    case 'checkbox': return <CheckSquare size={size} />;
    default: return <Type size={size} />;
  }
};

const FieldTypeLabel = (type: FieldType) => {
  switch (type) {
    case 'text': return 'Linha de texto';
    case 'textarea': return 'Caixa de texto';
    case 'integer': return 'Inteiro';
    case 'decimal': return 'Número decimal';
    case 'currency': return 'Monetário';
    case 'date': return 'Data';
    case 'list': return 'Lista';
    case 'icon_button': return 'Botão gráfico';
    case 'app_button': return 'Botão de aplicação';
    case 'template': return 'Template';
    case 'label': return 'Label';
    case 'radio': return 'Radio button';
    case 'checkbox': return 'Checkbox';
    default: return type;
  }
};

export const SidebarRight = ({ selectedField, onUpdateField, onRemoveField }: SidebarRightProps) => {
  const dispatch = useDispatch();
  const { schema, activeStepId } = useSelector((state: RootState) => state.form);
  const [activeTab, setActiveTab] = useState<'geral' | 'estilo' | 'scripts'>('geral');
  const [showTypeSelect, setShowTypeSelect] = useState(false);

  if (!selectedField && activeTab !== 'scripts') {
    return (
      <aside className="w-96 bg-[#f4f4f4] border-l border-[#d1d1d1] flex flex-col items-center justify-center p-10 text-center">
        <div className="w-16 h-16 bg-white rounded-lg border border-[#e0e0e0] shadow-sm flex items-center justify-center mb-4 cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setActiveTab('scripts')}>
          <Binary size={32} className="text-[#999999]" />
        </div>
        <p className="text-sm text-[#666666] font-medium uppercase tracking-widest text-[10px]">Editor de Propriedades</p>
        <p className="text-xs text-[#999999] mt-2 mb-4">Selecione um ativo no canvas ou acesse os scripts globais.</p>
        <button 
          onClick={() => setActiveTab('scripts')}
          className="px-4 py-2 bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 transition-all"
        >
          Editar Scripts do Form
        </button>
      </aside>
    );
  }

  const fieldTypes: FieldType[] = [
    'text', 'textarea', 'integer', 'decimal', 'currency', 'date', 
    'list', 'icon_button', 'app_button', 'template', 'label', 'radio', 'checkbox'
  ];

  return (
    <aside className="w-96 bg-white border-l border-[#d1d1d1] flex flex-col h-full overflow-hidden text-[#333333] font-sans">
      {/* Tabs Header */}
      <div className="flex border-b border-[#d1d1d1] bg-[#f8f8f8]">
        {[
          { id: 'geral', label: 'Geral' },
          { id: 'estilo', label: 'Estilo' },
          { id: 'scripts', label: 'Scripts' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex-1 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2",
              activeTab === tab.id 
                ? "bg-white border-[#0078d4] text-[#0078d4]" 
                : "text-[#999999] border-transparent hover:text-[#666666] hover:bg-[#f0f0f0]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {activeTab === 'geral' && selectedField && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-2 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900">
                <div className="p-1.5 bg-slate-100 rounded-lg">
                  <FieldTypeIcon type={selectedField.type} size={16} />
                </div>
                <span className="text-xs font-black uppercase tracking-tight">{FieldTypeLabel(selectedField.type)}</span>
              </div>
              <button onClick={() => onRemoveField(selectedField.id)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={18} />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agrupadores:</label>
              <div className="relative">
                <select 
                  value={selectedField.group || ''}
                  onChange={(e) => onUpdateField({ group: e.target.value })}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 pr-8 transition-all"
                >
                  <option value="">Sem Agrupador</option>
                  {schema.groups?.map(group => (
                    <option key={group.id} value={group.id}>{group.name}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mover para Container:</label>
              <div className="relative">
                <select 
                  onChange={(e) => {
                    dispatch(moveFieldToContainer({ 
                      fieldId: selectedField.id, 
                      targetContainerId: e.target.value || null 
                    }));
                  }}
                  value={(() => {
                    const step = schema.steps.find(s => s.id === activeStepId);
                    const findParentId = (fields: FormField[], parentId: string | null): string | null => {
                      if (fields.some(f => f.id === selectedField.id)) return parentId;
                      for (const f of fields) {
                        if (f.children) {
                          const res = findParentId(f.children, f.id);
                          if (res !== undefined) return res;
                        }
                      }
                      return undefined as any;
                    };
                    const res = step ? findParentId(step.fields, null) : null;
                    return res === undefined ? '' : (res || '');
                  })()}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 pr-8 transition-all"
                >
                  <option value="">Raiz da Etapa (Nível 0)</option>
                  {(() => {
                    const step = schema.steps.find(s => s.id === activeStepId);
                    const containers: { id: string, label: string }[] = [];
                    const findContainers = (fields: FormField[]) => {
                      fields.forEach(f => {
                        if (f.type === 'group' || f.type === 'grid') {
                          if (f.id !== selectedField.id) {
                            containers.push({ id: f.id, label: `${f.type === 'grid' ? '[GRID]' : '[GRUPO]'} ${f.label}` });
                          }
                        }
                        if (f.children) findContainers(f.children);
                      });
                    };
                    if (step) findContainers(step.fields);
                    return containers.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ));
                  })()}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Mover para Etapa:</label>
              <div className="relative">
                <select 
                  value={activeStepId}
                  onChange={(e) => {
                    if (selectedField) {
                      dispatch(moveFieldBetweenSteps({ 
                        fieldId: selectedField.id, 
                        targetStepId: e.target.value 
                      }));
                    }
                  }}
                  className="w-full appearance-none bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 pr-8 transition-all"
                >
                  {schema.steps.map(step => (
                    <option key={step.id} value={step.id}>{step.title}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                <span className="text-red-500 font-bold">*</span> Tipo:
              </label>
              <div className="relative">
                <button 
                  onClick={() => setShowTypeSelect(!showTypeSelect)}
                  className="w-full flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-left focus:outline-none focus:border-slate-900 transition-all"
                >
                  <div className="text-slate-400">
                    <FieldTypeIcon type={selectedField.type} />
                  </div>
                  <span className="flex-1 text-slate-900 font-medium">{FieldTypeLabel(selectedField.type)}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>
                
                {showTypeSelect && (
                  <div className="absolute top-full left-0 w-full bg-white border border-slate-200 shadow-xl z-50 max-h-80 overflow-y-auto mt-1 rounded-xl py-1 border-t-4 border-t-slate-900 animate-in slide-in-from-top-2 duration-200">
                    {fieldTypes.map(type => (
                      <button
                        key={type}
                        onClick={() => {
                          onUpdateField({ type });
                          setShowTypeSelect(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-[13px] hover:bg-slate-50 transition-colors text-left group"
                      >
                        <div className="text-slate-400 group-hover:text-slate-900 transition-colors">
                          <FieldTypeIcon type={type} />
                        </div>
                        <span className="text-slate-600 font-medium group-hover:text-slate-900 transition-colors">{FieldTypeLabel(type)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-0.5">
                <span className="text-red-500 font-bold">*</span> Nome Técnico:
              </label>
              <input 
                type="text" 
                value={selectedField.technicalName || ''}
                onChange={(e) => onUpdateField({ technicalName: e.target.value })}
                placeholder="EX: NOME_CLIENTE"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-slate-900 placeholder:text-slate-300 uppercase transition-all"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Rótulo (Label):</label>
              <input 
                type="text" 
                value={selectedField.label}
                onChange={(e) => onUpdateField({ label: e.target.value })}
                placeholder="Rótulo visual"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 placeholder:text-slate-300 transition-all"
              />
            </div>

            {(() => {
              const findSiblings = (fields: FormField[]): FormField[] | null => {
                if (fields.some(f => f.id === selectedField.id)) return fields;
                for (const f of fields) {
                  if (f.children) {
                    const found = findSiblings(f.children);
                    if (found) return found;
                  }
                }
                return null;
              };

              const step = schema.steps.find(s => s.id === activeStepId);
              const siblings = step ? findSiblings(step.fields) : null;
              const currentIndex = siblings ? siblings.findIndex(f => f.id === selectedField.id) : -1;
              const totalSiblings = siblings ? siblings.length : 0;

              if (currentIndex === -1) return null;

              return (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Posição na Sequência (1-{totalSiblings}):
                  </label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="number" 
                      min="1" 
                      max={totalSiblings}
                      value={currentIndex + 1}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val)) {
                          dispatch(moveFieldToIndex({ 
                            fieldId: selectedField.id, 
                            newIndex: val - 1 
                          }));
                        }
                      }}
                      className="w-20 border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 transition-all"
                    />
                    <span className="text-[10px] text-slate-400 italic">
                      Muda a ordem entre vizinhos
                    </span>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {activeTab === 'estilo' && selectedField && (
          <div className="p-5 space-y-5 animate-in fade-in duration-200">
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Largura da Coluna (1-12):</label>
              <input 
                type="number" 
                min="1" 
                max="12"
                value={selectedField.columnWidth}
                onChange={(e) => onUpdateField({ columnWidth: parseInt(e.target.value) })}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] focus:outline-none focus:border-slate-900 transition-all"
              />
            </div>

            {selectedField.type === 'grid' && (
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Configurações de Grid</h4>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ID da Grid:</label>
                  <input 
                    type="text" 
                    value={selectedField.meta?.gridId || ''}
                    onChange={(e) => onUpdateField({ meta: { ...selectedField.meta, gridId: e.target.value } })}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2 text-[13px] font-mono focus:outline-none focus:border-slate-900 uppercase transition-all"
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="flex flex-col h-full animate-in fade-in duration-200 bg-[#1e1e1e]">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <Binary size={16} className="text-slate-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">JavaScript API Engine</span>
              </div>
              <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-white/50 font-mono">v1.04</span>
            </div>
            
            <div className="flex-1 relative">
              <textarea 
                value={schema.script || ''}
                onChange={(e) => dispatch(setSchema({ ...schema, script: e.target.value }))}
                placeholder="// Use a API Form para manipular os campos"
                className="w-full h-full bg-transparent text-[#d4d4d4] font-mono text-[12px] p-6 outline-none resize-none custom-scrollbar leading-relaxed"
                spellCheck={false}
              />
            </div>

            <div className="p-4 bg-slate-900/50 border-t border-white/5">
              <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">Snippets Rápidos</h5>
              <div className="grid grid-cols-1 gap-2">
                {[
                  { label: 'Ocultar Campo', code: "Form.fields('ID').visible(false).apply();" },
                  { label: 'Validar Submit', code: "Form.subscribe('SUBMIT', (id, act, reject) => { \n  if(!Form.fields('F1').value()) reject(); \n});" }
                ].map((snip, i) => (
                  <button 
                    key={i}
                    onClick={() => {
                      const current = schema.script || '';
                      dispatch(setSchema({ ...schema, script: current + '\n' + snip.code }));
                    }}
                    className="text-left p-2.5 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all group"
                  >
                    <div className="text-[9px] font-bold text-slate-400 group-hover:text-slate-200 mb-0.5">{snip.label}</div>
                    <code className="text-[10px] text-slate-500 block truncate">{snip.code}</code>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {activeTab !== 'scripts' && (
        <div className="p-5 bg-white border-t border-slate-100 grid grid-cols-2 gap-3">
          <button 
            onClick={() => onRemoveField(selectedField!.id)}
            className="py-3 border border-red-100 text-red-500 text-[12px] font-bold rounded-xl hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Remover
          </button>
          <button 
            onClick={() => setActiveTab('scripts')}
            className="py-3 bg-slate-900 text-white text-[12px] font-bold rounded-xl hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            Lógica
          </button>
        </div>
      )}
    </aside>
  );
};
