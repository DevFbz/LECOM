import { useState, useEffect, useRef } from 'react';
import type { FormSchema, FormField } from '../../types/form';
import { cn } from '../../utils/lib';
import { FormRuntime } from '../../utils/formRuntime';
import { buildLecomGlobals, runFormScript } from '../../lib/lecomApi';
import { ChevronUp, ChevronDown, Check, Send, Plus, Trash2, X, Search } from 'lucide-react';

export const FullscreenPreview = ({ schema: propSchema }: { schema?: FormSchema }) => {
  const [schema, setSchema] = useState<FormSchema | null>(propSchema || null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formState, setFormState] = useState({
    values: {} as Record<string, any>,
    visibility: {} as Record<string, boolean>,
    disabled: {} as Record<string, boolean>,
    labels: {} as Record<string, string>
  });
  const [isFinished, setIsFinished] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showNextStepModal, setShowNextStepModal] = useState(false);
  
  const runtimeRef = useRef<FormRuntime | null>(null);

  const runScriptForStep = (runtime: FormRuntime, sch: FormSchema, stepId: string) => {
    if (!sch.script) return;
    try {
      const globals = buildLecomGlobals(runtime, sch, {
        processData: { activityInstanceId: stepId, processId: sch.id, version: 1 },
        onError: (msg) => console.warn('[Lecom API] Erro de validação:', msg),
      });
      runFormScript(sch.script, globals);
    } catch (err) {
      console.error("Runtime Script Error:", err);
    }
  };

  // Update when propSchema changes (Real-time)
  useEffect(() => {
    if (propSchema) {
      setSchema(propSchema);
      
      const runtime = new FormRuntime(propSchema, {}, (newState) => {
        setFormState(prev => ({ ...prev, ...newState }));
      });
      runtimeRef.current = runtime;
      runScriptForStep(runtime, propSchema, propSchema.steps[activeStepIndex]?.id || '1');
    }
  }, [propSchema]);

  // Re-executa o script quando a etapa muda (ProcessData.activityInstanceId)
  useEffect(() => {
    if (runtimeRef.current && schema && schema.steps[activeStepIndex]) {
      runScriptForStep(runtimeRef.current, schema, schema.steps[activeStepIndex].id);
    }
  }, [activeStepIndex, schema]);

  // Fallback to localStorage if no propSchema
  useEffect(() => {
    if (!propSchema) {
        const savedSchema = localStorage.getItem('lecom_preview_schema');
        if (savedSchema) {
            const parsed = JSON.parse(savedSchema);
            setSchema(parsed);
            
            const runtime = new FormRuntime(parsed, {}, (newState) => {
                setFormState(prev => ({ ...prev, ...newState }));
            });
            runtimeRef.current = runtime;
            runScriptForStep(runtime, parsed, parsed.steps[activeStepIndex]?.id || '1');
        }
    }
  }, [propSchema]);

  if (!schema) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-[#0056b3] border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando...</p>
      </div>
    </div>
  );

  if (isFinished) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f4f4f4] font-sans p-6">
        <div className="bg-white p-12 rounded shadow-lg border border-slate-200 max-w-xl w-full text-center">
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check size={40} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Solicitação Concluída!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Seu formulário foi processado com sucesso. Protocolo: <b>#{Math.floor(Math.random() * 1000000)}</b>.
          </p>
          <button 
            onClick={() => window.close()}
            className="px-8 py-3 bg-[#007bff] text-white rounded font-semibold hover:bg-[#0069d9] transition-all"
          >
            Fechar Visualização
          </button>
        </div>
      </div>
    );
  }

  const currentStep = schema.steps[activeStepIndex];

  const validateStep = () => {
      const errors: string[] = [];
      const allFields = schema.steps.flatMap(s => s.fields);
      
      const isFieldVisible = (f: FormField) => {
          if (f.group) {
              const group = schema.groups?.find(g => g.id === f.group);
              if (group?.stepVisibility?.[currentStep.id] === true) return false;
          }
          const stepProps = f.stepProperties?.[currentStep.id];
          const presentation = stepProps?.presentation || 'Normal';
          if (presentation === 'Invisível' || presentation === 'Oculto') return false;
          if (formState.visibility[f.id] === false) return false;
          return true;
      };

      const isFieldRequired = (f: FormField) => {
          const stepProps = f.stepProperties?.[currentStep.id];
          const presentation = stepProps?.presentation || 'Normal';
          if (presentation === 'Obrigatório' || presentation === 'Bloqueado - Obrigatório') return true;
          return f.required;
      };

      const visibleFields = allFields.filter(isFieldVisible);
      const gridGroups = new Set<string>();

      for (const field of visibleFields) {
          if (field.meta?.displayType === 'grid' && field.meta?.gridId) {
              if (isFieldRequired(field)) {
                  gridGroups.add(field.meta.gridId);
              }
          } else {
              if (isFieldRequired(field)) {
                  const val = formState.values[field.id];
                  if (val === undefined || val === null || String(val).trim() === '') {
                      errors.push(`O campo "${field.label}" é obrigatório.`);
                  }
              }
          }
      }

      for (const gridId of gridGroups) {
          const rows = formState.values[gridId] || [];
          if (rows.length === 0) {
              errors.push(`A tabela (Grid) contendo campos obrigatórios precisa de pelo menos 1 linha.`);
          }
      }

      return Array.from(new Set(errors));
  };

  const handleNextClick = () => {
      const errors = validateStep();
      if (errors.length > 0) {
          setValidationErrors(errors);
          window.scrollTo({ top: 0, behavior: 'smooth' });
          return;
      }

      setValidationErrors([]);
      if (activeStepIndex < schema.steps.length - 1) {
          setShowNextStepModal(true);
      } else {
          setIsFinished(true);
      }
  };

  return (
    <div className="h-screen w-full bg-[#f4f4f4] flex flex-col font-sans overflow-hidden theme-lecom">
      <header className="bg-white border-b border-slate-200 px-6 py-2 flex justify-end gap-2">
         <div className="flex gap-1">
            <button className="p-1 border border-slate-300 rounded hover:bg-slate-50 shadow-sm"><div className="w-5 h-5 flex items-center justify-center"><Search size={14}/></div></button>
            <button className="p-1 border border-slate-300 rounded hover:bg-slate-50 shadow-sm"><div className="w-5 h-5 flex items-center justify-center"><Plus size={14}/></div></button>
         </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="max-w-5xl mx-auto">
          {validationErrors.length > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm shadow-sm animate-in slide-in-from-top-2">
                  <strong className="block mb-2 font-bold uppercase text-xs">Os seguintes erros foram encontrados:</strong>
                  <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                      ))}
                  </ul>
              </div>
          )}
        </div>

        <div className="max-w-5xl mx-auto bg-white shadow-md border border-slate-200 p-6">
          
          {/* Step Title */}
          <div className="mb-4 border-b border-slate-100 pb-2">
             <h2 className="text-xl font-bold text-[#0056b3] uppercase tracking-tight">{currentStep.title}</h2>
          </div>

          {/* Mandatory Indicator */}
          <div className="mb-6">
             <p className="text-red-500 text-xs italic">(*) Campos de preenchimento obrigatório.</p>
          </div>

          <div className="space-y-12">
            {/* Render fields without group first */}
            {(() => {
                const allFields = schema.steps.flatMap(s => s.fields);
                const uniqueFields: FormField[] = [];
                const seen = new Set();
                for (const f of allFields) {
                    if (!seen.has(f.id)) {
                        seen.add(f.id);
                        uniqueFields.push(f);
                    }
                }

                const ungroupedFields = uniqueFields.filter(f => !f.group);
                if (ungroupedFields.length === 0) return null;
                
                const clustered: any[] = [];
                const gridMap = new Map<string, FormField[]>();
                ungroupedFields.forEach(f => {
                    if (f.meta?.displayType === 'grid' && f.meta?.gridId) {
                        if (!gridMap.has(f.meta.gridId)) {
                            gridMap.set(f.meta.gridId, []);
                            clustered.push({ isGridCluster: true, gridId: f.meta.gridId, id: `grid-${f.meta.gridId}` });
                        }
                        gridMap.get(f.meta.gridId)!.push(f);
                    } else {
                        clustered.push(f);
                    }
                });

                return (
                    <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                        {clustered.map(item => {
                            if (item.isGridCluster) {
                                return <GridCluster 
                                    key={item.id} 
                                    gridId={item.gridId} 
                                    fields={gridMap.get(item.gridId)!} 
                                    formState={formState} 
                                    setFormState={setFormState} 
                                    activeStepId={currentStep.id} 
                                />;
                            }
                            return <RenderFieldInstance 
                                key={item.id} 
                                field={item as FormField} 
                                formState={formState}
                                setFormState={setFormState}
                                activeStepId={currentStep.id}
                                runtime={runtimeRef.current}
                            />
                        })}
                    </div>
                );
            })()}

            {/* Render fields by group */}
            {schema.groups?.map(group => {
                if (group.stepVisibility?.[currentStep.id] === true) return null;

                const allFields = schema.steps.flatMap(s => s.fields);
                const uniqueFields: FormField[] = [];
                const seen = new Set();
                for (const f of allFields) {
                    if (!seen.has(f.id)) {
                        seen.add(f.id);
                        uniqueFields.push(f);
                    }
                }

                const groupFields = uniqueFields.filter(f => f.group === group.id);
                if (groupFields.length === 0) return null;
                
                const clustered: any[] = [];
                const gridMap = new Map<string, FormField[]>();
                groupFields.forEach(f => {
                    if (f.meta?.displayType === 'grid' && f.meta?.gridId) {
                        if (!gridMap.has(f.meta.gridId)) {
                            gridMap.set(f.meta.gridId, []);
                            clustered.push({ isGridCluster: true, gridId: f.meta.gridId, id: `grid-${f.meta.gridId}` });
                        }
                        gridMap.get(f.meta.gridId)!.push(f);
                    } else {
                        clustered.push(f);
                    }
                });

                return (
                    <div key={group.id} className="lecom-section">
                        <div className="lecom-section-header mb-4">
                            <span>{group.name}</span>
                        </div>
                        <div className="grid grid-cols-12 gap-x-6 gap-y-4">
                            {clustered.map(item => {
                                if (item.isGridCluster) {
                                    return <GridCluster 
                                        key={item.id} 
                                        gridId={item.gridId} 
                                        fields={gridMap.get(item.gridId)!} 
                                        formState={formState} 
                                        setFormState={setFormState} 
                                        activeStepId={currentStep.id} 
                                    />;
                                }
                                return <RenderFieldInstance 
                                    key={item.id} 
                                    field={item as FormField} 
                                    formState={formState}
                                    setFormState={setFormState}
                                    activeStepId={currentStep.id}
                                    runtime={runtimeRef.current}
                                />
                            })}
                        </div>
                    </div>
                );
            })}
          </div>

          {/* Action Footer */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex items-center justify-end gap-3">
            <button 
              onClick={() => window.close()}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#f05050] hover:bg-[#eb2a2a] text-white font-bold text-xs rounded shadow-sm uppercase transition-colors"
            >
              CANCELAR <X size={16} />
            </button>

            <button 
              onClick={handleNextClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold text-xs rounded shadow-sm uppercase transition-colors"
            >
              {activeStepIndex === schema.steps.length - 1 ? (
                <>ENVIAR SOLICITAÇÃO <Check size={16} /></>
              ) : (
                <>PRÓXIMA ETAPA <Send size={16} /></>
              )}
            </button>
          </div>
        </div>
        
      </main>

      {/* Modal de Transição de Etapa */}
      {showNextStepModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[100] animate-in fade-in">
              <div className="bg-white rounded-lg shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in zoom-in-95">
                  <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <h3 className="font-bold text-slate-700 text-sm uppercase">Próxima Etapa</h3>
                      <button onClick={() => setShowNextStepModal(false)} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
                  </div>
                  <div className="p-6 text-center space-y-4">
                      <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                          <Send size={32} />
                      </div>
                      <h2 className="text-xl font-bold text-[#0056b3]">
                          {schema.steps[activeStepIndex + 1]?.title}
                      </h2>
                      <div className="bg-slate-50 border border-slate-200 rounded p-3 inline-block mx-auto text-left">
                          <span className="block text-[10px] text-slate-500 font-bold uppercase mb-1">Responsável pela atividade:</span>
                          <span className="block text-sm text-slate-700 font-medium flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-green-500"></span> 
                              Grupo Específico / Aprovadores
                          </span>
                      </div>
                  </div>
                  <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                      <button 
                          onClick={() => setShowNextStepModal(false)}
                          className="px-4 py-2 text-slate-600 hover:bg-slate-200 font-bold text-xs uppercase rounded transition-colors"
                      >
                          Cancelar
                      </button>
                      <button 
                          onClick={() => {
                              setShowNextStepModal(false);
                              setActiveStepIndex(prev => prev + 1);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-6 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold text-xs uppercase rounded shadow-sm transition-colors"
                      >
                          Continuar
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

const GridCluster = ({ gridId, fields, formState, setFormState, activeStepId }: { gridId: string, fields: FormField[], formState: any, setFormState: any, activeStepId: string }) => {
    const [draftRow, setDraftRow] = useState<Record<string, any>>({});
    
    const rows = formState.values[gridId] || [];

    return (
      <div className="col-span-12 mb-8 border border-slate-200 rounded shadow-sm bg-white p-4">
        {/* Formulário de inserção da Grid */}
        <div className="grid grid-cols-12 gap-x-4 gap-y-4 mb-4">
            {fields.map(field => {
                const stepProps = field.stepProperties?.[activeStepId];
                const presentation = stepProps?.presentation || 'Normal';
                if (presentation === 'Invisível' || presentation === 'Oculto') return null;
                
                let isRequired = field.required;
                if (presentation === 'Obrigatório' || presentation === 'Bloqueado - Obrigatório') isRequired = true;
                
                let isDisabled = formState.disabled[field.id] === true;
                if (presentation === 'Somente leitura' || presentation === 'Bloqueado' || presentation === 'Bloqueado - Obrigatório') isDisabled = true;

                return (
                    <div key={field.id} style={{ gridColumn: `span ${field.columnWidth || 12} / span ${field.columnWidth || 12}` }}>
                        <label className="text-[11px] text-slate-500 font-bold flex items-center gap-1 mb-1">
                            {field.label} {isRequired && <span className="text-red-500">*</span>}
                        </label>
                        <FieldInput 
                            field={field} 
                            value={draftRow[field.id] || ''} 
                            isDisabled={isDisabled}
                            onChange={(val: any) => setDraftRow(prev => ({ ...prev, [field.id]: val }))} 
                        />
                    </div>
                );
            })}
        </div>

        {/* Botão Adicionar */}
        <div className="flex justify-end mb-4 border-b border-slate-200 pb-4">
           <button 
              onClick={() => {
                setFormState((prev: any) => ({
                  ...prev,
                  values: { ...prev.values, [gridId]: [...rows, draftRow] }
                }));
                setDraftRow({});
              }}
              className="flex items-center gap-2 px-4 py-2 bg-[#007bff] hover:bg-[#0069d9] text-white font-bold text-[11px] rounded shadow-sm uppercase transition-colors"
            >
              ADICIONAR DADOS NA TABELA <Plus size={14} />
            </button>
        </div>

        {/* Tabela de Dados */}
        <div className="border border-slate-200 rounded overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {fields.map(col => (
                    <th key={col.id} className="px-4 py-2 text-[11px] font-bold text-slate-700 border-r border-slate-200 last:border-r-0">
                      {col.label}
                    </th>
                  ))}
                  <th className="px-4 py-2 w-16 text-center text-[11px] font-bold text-slate-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {rows.length > 0 ? rows.map((row: any, rIdx: number) => (
                  <tr key={rIdx} className="hover:bg-slate-50">
                    {fields.map(col => (
                      <td key={col.id} className="px-4 py-2 border-r border-slate-200 last:border-r-0 text-xs text-slate-600">
                        {row[col.id] || '-'}
                      </td>
                    ))}
                    <td className="px-4 py-2 text-center">
                      <button 
                        onClick={() => {
                          const newRows = rows.filter((_: any, i: number) => i !== rIdx);
                          setFormState((prev: any) => ({
                            ...prev,
                            values: { ...prev.values, [gridId]: newRows }
                          }));
                        }}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={fields.length + 1} className="px-4 py-4 text-center text-slate-400 italic text-sm">
                      Nenhum dado adicionado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-2 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-8 text-[10px] text-slate-400 font-bold">
              <div className="flex items-center gap-1"><span>20</span><ChevronDown size={10} /></div>
              <div>1 - {rows.length} de {rows.length}</div>
          </div>
        </div>
      </div>
    );
};

const RenderFieldInstance = ({ 
  field, 
  formState, 
  setFormState,
  activeStepId,
  runtime
}: { 
  field: FormField; 
  formState: any;
  setFormState: any;
  activeStepId: string;
  runtime?: FormRuntime | null;
}) => {
  const stepProps = field.stepProperties?.[activeStepId];
  const presentation = stepProps?.presentation || 'Normal';
  
  let isVisible = formState.visibility[field.id] !== false;
  if (presentation === 'Invisível' || presentation === 'Oculto') {
      isVisible = false;
  }
  
  let isDisabled = formState.disabled[field.id] === true;
  if (presentation === 'Somente leitura' || presentation === 'Bloqueado' || presentation === 'Bloqueado - Obrigatório') {
      isDisabled = true;
  }

  let isRequired = field.required;
  if (presentation === 'Obrigatório' || presentation === 'Bloqueado - Obrigatório') {
      isRequired = true;
  }

  const currentLabel = formState.labels[field.id] || field.label;
  const [isExpanded, setIsExpanded] = useState(true);

  if (!isVisible) return null;

  if (field.type === 'group') {
    return (
      <div className="mb-6">
        <div className="lecom-section-header">
          <span>{currentLabel}</span>
          <button onClick={() => setIsExpanded(!isExpanded)} className="text-[#0056b3]">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
        {isExpanded && (
          <div className="pt-4 grid grid-cols-12 gap-x-6 gap-y-4">
            {field.children?.map(child => (
              <RenderFieldInstance 
                key={child.id} 
                field={child} 
                formState={formState}
                setFormState={setFormState}
                activeStepId={activeStepId}
                runtime={runtime}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  if (field.type === 'label') {
      return (
          <div 
            className="bg-[#4c97d5] text-white px-4 py-2 text-sm font-medium w-full rounded-sm shadow-sm flex items-center"
            style={{ 
              gridColumn: `span ${field.columnWidth || 12} / span ${field.columnWidth || 12}`
            }}
          >
              {currentLabel}
          </div>
      );
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-1 min-w-0",
        isDisabled && "opacity-60 grayscale pointer-events-none"
      )}
      style={{ 
        gridColumn: `span ${field.columnWidth || 12} / span ${field.columnWidth || 12}`
      }}
    >
      <label className="text-[12px] text-slate-500 font-medium flex items-center gap-1">
        {currentLabel}
        {isRequired && <span className="text-red-500">*</span>}
        {field.type === 'textarea' && <div className="p-0.5 bg-slate-200 rounded text-slate-500"><Search size={10}/></div>}
      </label>
      
      <div className="relative group/input">
        <FieldInput 
          field={field} 
          value={formState.values[field.id] || ''}
          isDisabled={isDisabled}
          onChange={(val: any) => {
            setFormState((prev: any) => ({
              ...prev,
              values: { ...prev.values, [field.id]: val }
            }));
            runtime?.triggerFieldEvent(field.id, 'CHANGE', val);
          }}
          onBlur={() => {
            runtime?.triggerFieldEvent(field.id, 'BLUR', formState.values[field.id]);
          }}
        />
        {field.type === 'select' && (
           <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown size={14} className="text-slate-900" />
           </div>
        )}
      </div>
    </div>
  );
};

const FieldInput = ({ 
  field, 
  value, 
  isDisabled,
  onChange,
  onBlur,
}: { 
  field: FormField; 
  value: any; 
  isDisabled?: boolean;
  onChange: (val: any) => void;
  onBlur?: () => void;
}) => {
  const baseClasses = cn(
    "lecom-input w-full",
    isDisabled && "lecom-input-readonly"
  );

  switch (field.type) {
    case 'textarea':
      return <textarea value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} rows={3} className={cn(baseClasses, "resize-none")} />;
    
    case 'select':
      return (
        <select 
          value={value} 
          onChange={e => onChange(e.target.value)} 
          onBlur={onBlur}
          className={cn(baseClasses, "appearance-none bg-white")}
        >
          <option value="">Selecione</option>
          {field.meta.options?.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      );

    case 'radio':
      return (
        <div className="flex flex-col gap-2 pt-1">
          {field.meta.options?.map((opt: any) => (
            <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
              <div className={cn(
                "w-4 h-4 rounded-full border border-slate-400 flex items-center justify-center transition-all",
                value === opt.value ? "border-[#0056b3] bg-white" : "bg-white"
              )}>
                {value === opt.value && <div className="w-2 h-2 rounded-full bg-[#0056b3]" />}
              </div>
              <input 
                type="radio" 
                name={field.id} 
                value={opt.value} 
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
                onBlur={onBlur}
                className="hidden"
              />
              <span className="text-sm text-slate-600">{opt.label}</span>
            </label>
          ))}
        </div>
      );

    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} className={baseClasses} />;
    
    case 'integer':
    case 'decimal':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} onBlur={onBlur} className={baseClasses} />;

    default:
      return (
        <div className="relative flex items-center">
          <input 
            type="text" 
            value={value} 
            onChange={e => onChange(e.target.value)} 
            onBlur={onBlur}
            placeholder={field.placeholder} 
            className={baseClasses} 
          />
          {field.type === 'autocomplete' && (
             <div className="absolute right-2 px-2 py-1 border-l border-slate-200">
                <Search size={14} className="text-slate-500" />
             </div>
          )}
        </div>
      );
  }
};
