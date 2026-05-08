import { useState, useEffect, useRef } from 'react';
import type { FormSchema, FormField } from '../../types/form';
import { cn } from '../../utils/lib';
import { motion, AnimatePresence } from 'framer-motion';
import { FormRuntime } from '../../utils/formRuntime';
import { ChevronLeft, ChevronRight, Check, Send, ShieldCheck, Plus, Trash2 } from 'lucide-react';

export const FullscreenPreview = () => {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formState, setFormState] = useState({
    values: {} as Record<string, any>,
    visibility: {} as Record<string, boolean>,
    disabled: {} as Record<string, boolean>,
    labels: {} as Record<string, string>
  });
  const [isFinished, setIsFinished] = useState(false);
  
  const runtimeRef = useRef<FormRuntime | null>(null);

  useEffect(() => {
    const savedSchema = localStorage.getItem('lecom_preview_schema');
    if (savedSchema) {
      const parsed = JSON.parse(savedSchema);
      setSchema(parsed);
      
      const runtime = new FormRuntime(parsed, {}, (newState) => {
        setFormState(prev => ({ ...prev, ...newState }));
      });
      runtimeRef.current = runtime;

      if (parsed.script) {
        try {
          const Form = runtime.getProxy();
          const scriptFunc = new Function('Form', parsed.script);
          scriptFunc(Form);
        } catch (err) {
          console.error("Runtime Script Error:", err);
        }
      }
    }
  }, []);

  if (!schema) return (
    <div className="h-screen w-full flex items-center justify-center bg-slate-50 font-sans">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Carregando Instância do Processo...</p>
      </div>
    </div>
  );

  if (isFinished) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#f8fafc] font-sans p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-12 rounded-[2.5rem] shadow-2xl shadow-slate-200 border border-slate-100 max-w-xl w-full text-center"
        >
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
            <Check size={40} strokeWidth={3} />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Solicitação Concluída!</h1>
          <p className="text-slate-500 mb-8 leading-relaxed">
            Seu formulário foi processado pela Engine Lecom e o protocolo foi gerado com sucesso sob o ID <b>#{Math.floor(Math.random() * 1000000)}</b>.
          </p>
          <button 
            onClick={() => window.close()}
            className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
          >
            Fechar Visualização
          </button>
        </motion.div>
      </div>
    );
  }

  const currentStep = schema.steps[activeStepIndex];
  const totalSteps = schema.steps.length;

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] font-sans flex flex-col">
      {/* Top Navigation / Progress */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-8">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg">
              <ShieldCheck className="text-primary-400" size={24} />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-black text-slate-900 truncate tracking-tight">{schema.title}</h1>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Lecom BPM Engine • v5.50</p>
            </div>
          </div>

          <div className="hidden md:flex flex-1 max-w-2xl items-center gap-3">
            {schema.steps.map((step, idx) => (
              <div key={step.id} className="flex-1 flex flex-col gap-2">
                <div className={cn(
                  "h-1.5 rounded-full transition-all duration-700",
                  idx <= activeStepIndex ? "bg-primary-600" : "bg-slate-100"
                )} />
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-tighter truncate",
                  idx === activeStepIndex ? "text-primary-600" : "text-slate-300"
                )}>
                  {idx + 1}. {step.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
             <span className="text-[10px] bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-black uppercase">Homologação</span>
          </div>
        </div>
      </header>

      <main className="flex-1 p-6 md:p-12">
        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStepIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
            >
              <div className="p-8 md:p-12">
                <header className="mb-12 border-b border-slate-50 pb-8">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary-50 text-primary-600 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">Etapa Atual</span>
                    <div className="h-px flex-1 bg-slate-100" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">{currentStep.title}</h2>
                </header>

                <div className="grid grid-cols-12 gap-x-8 gap-y-10">
                  {currentStep.fields.map(field => (
                    <RenderFieldInstance 
                      key={field.id} 
                      field={field} 
                      formState={formState}
                      setFormState={setFormState}
                    />
                  ))}
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-slate-50/50 border-t border-slate-100 px-12 py-8 flex items-center justify-between">
                <button 
                  onClick={() => setActiveStepIndex(prev => prev - 1)}
                  disabled={activeStepIndex === 0}
                  className="flex items-center gap-2 px-8 py-3.5 text-slate-500 font-bold text-sm hover:bg-slate-200/50 rounded-2xl transition-all disabled:opacity-0 disabled:pointer-events-none"
                >
                  <ChevronLeft size={20} />
                  Voltar
                </button>

                <div className="flex items-center gap-4">
                   <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Progresso</p>
                      <p className="text-xs font-bold text-slate-900">{Math.round(((activeStepIndex + 1) / totalSteps) * 100)}% concluído</p>
                   </div>
                   
                   <button 
                    onClick={() => {
                      if (activeStepIndex < totalSteps - 1) {
                        setActiveStepIndex(prev => prev + 1);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      } else {
                        setIsFinished(true);
                      }
                    }}
                    className="flex items-center gap-3 px-10 py-4 bg-primary-600 hover:bg-primary-700 text-white font-black text-sm rounded-2xl shadow-xl shadow-primary-600/30 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    {activeStepIndex === totalSteps - 1 ? (
                      <>Enviar Formulário <Send size={18} /></>
                    ) : (
                      <>Próxima Etapa <ChevronRight size={20} /></>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
          
          <footer className="mt-12 text-center text-[10px] text-slate-400 font-bold uppercase tracking-[0.3em] pb-12">
            © 2026 LECOM BPM Engine • Todos os direitos reservados
          </footer>
        </div>
      </main>
    </div>
  );
};

const RenderFieldInstance = ({ 
  field, 
  formState, 
  setFormState 
}: { 
  field: FormField; 
  formState: any;
  setFormState: any;
}) => {
  const isVisible = formState.visibility[field.id] !== false;
  const isDisabled = formState.disabled[field.id] === true;
  const currentLabel = formState.labels[field.id] || field.label;

  if (!isVisible) return null;

  if (field.type === 'group') {
    return (
      <div className="col-span-12 mb-10 overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50">
        <div className="bg-slate-900 px-10 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-1.5 h-6 bg-primary-500 rounded-full" />
             <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-white">{currentLabel}</h3>
          </div>
        </div>
        <div className="p-10 md:p-12 bg-white grid grid-cols-12 gap-x-10 gap-y-12">
          {field.children?.map(child => (
            <RenderFieldInstance 
              key={child.id} 
              field={child} 
              formState={formState}
              setFormState={setFormState}
            />
          ))}
        </div>
      </div>
    );
  }

  if (field.type === 'grid') {
    const rows = formState.values[field.id] || [];
    
    return (
      <div className="col-span-12 mb-10 overflow-hidden rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/60">
        <div className="bg-slate-900 text-white px-10 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary-500/10 rounded-2xl flex items-center justify-center border border-primary-500/20">
              <Plus className="text-primary-400" size={24} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest">{currentLabel}</h3>
              <p className="text-[9px] text-primary-400 font-black uppercase mt-1 tracking-[0.2em]">Data Entry Engine</p>
            </div>
          </div>
          <button 
            onClick={() => {
              const newRow = {};
              field.children?.forEach(c => (newRow as any)[c.id] = '');
              setFormState((prev: any) => ({
                ...prev,
                values: { ...prev.values, [field.id]: [...rows, newRow] }
              }));
            }}
            className="px-8 py-3.5 bg-primary-600 hover:bg-primary-500 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-primary-900/40 flex items-center gap-3 active:scale-95"
          >
            Adicionar Registro <Plus size={16} strokeWidth={3} />
          </button>
        </div>
        
        <div className="overflow-x-auto bg-white p-2">
          <table className="w-full text-left border-collapse rounded-[2rem] overflow-hidden">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {field.children?.map(col => (
                  <th key={col.id} className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    {col.label}
                  </th>
                ))}
                <th className="px-8 py-5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {rows.length > 0 ? rows.map((row: any, rIdx: number) => (
                <tr key={rIdx} className="hover:bg-primary-500/5 transition-all group/row">
                  {field.children?.map(col => (
                    <td key={col.id} className="px-8 py-5">
                      <input 
                        type="text"
                        value={row[col.id] || ''}
                        onChange={(e) => {
                          const newRows = [...rows];
                          newRows[rIdx] = { ...row, [col.id]: e.target.value };
                          setFormState((prev: any) => ({
                            ...prev,
                            values: { ...prev.values, [field.id]: newRows }
                          }));
                        }}
                        className="w-full bg-white border border-slate-100 rounded-xl px-4 py-3 text-sm text-slate-700 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-slate-200"
                        placeholder={`Valor...`}
                      />
                    </td>
                  ))}
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => {
                        const newRows = rows.filter((_: any, i: number) => i !== rIdx);
                        setFormState((prev: any) => ({
                          ...prev,
                          values: { ...prev.values, [field.id]: newRows }
                        }));
                      }}
                      className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all opacity-0 group-hover/row:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={(field.children?.length || 0) + 1} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-4 opacity-20">
                       <Plus size={48} className="text-slate-400" />
                       <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-500">Nenhum registro encontrado</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-4 min-w-0 transition-all duration-500",
        isDisabled && "opacity-50 pointer-events-none grayscale"
      )}
      style={{ 
        gridColumn: `span ${field.columnWidth || 12} / span ${field.columnWidth || 12}`
      }}
    >
      <div className="flex items-center justify-between px-1">
        <label className="text-[11px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
          {currentLabel}
          {field.required && <span className="text-red-500 font-bold">*</span>}
        </label>
        {field.technicalName && (
           <span className="text-[9px] font-mono text-slate-300 uppercase tracking-tighter">{field.technicalName}</span>
        )}
      </div>
      
      <div className="w-full min-w-0 group/input">
        <FieldInput 
          field={field} 
          value={formState.values[field.id] || ''}
          onChange={(val: any) => setFormState((prev: any) => ({
            ...prev,
            values: { ...prev.values, [field.id]: val }
          }))}
        />
      </div>
      
      {field.meta.helperText && (
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1 px-1 opacity-60 italic">{field.meta.helperText}</span>
      )}
    </div>
  );
};

const FieldInput = ({ 
  field, 
  value, 
  onChange 
}: { 
  field: FormField; 
  value: any; 
  onChange: (val: any) => void;
}) => {
  const baseClasses = "w-full px-6 py-4.5 bg-slate-50/50 border border-slate-200 rounded-[1.25rem] text-slate-900 placeholder:text-slate-300 focus:ring-8 focus:ring-primary-500/5 focus:border-primary-500 focus:bg-white outline-none transition-all font-bold text-[15px] shadow-sm group-hover/input:border-slate-300";

  switch (field.type) {
    case 'textarea':
      return <textarea value={value} onChange={e => onChange(e.target.value)} rows={5} className={cn(baseClasses, "resize-none")} />;
    
    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={baseClasses} />;
    
    case 'integer':
    case 'decimal':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} className={baseClasses} />;

    default:
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={baseClasses} />;
  }
};
