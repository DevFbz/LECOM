import { useState, useEffect, useRef } from 'react';
import type { FormSchema, FormField } from '../../types/form';
import { X, Copy, Check, Eye, Code, Smartphone, Monitor, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../utils/lib';
import { motion, AnimatePresence } from 'framer-motion';
import { FormRuntime } from '../../utils/formRuntime';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  schema: FormSchema;
}

export const PreviewModal = ({ isOpen, onClose, schema }: PreviewModalProps) => {
  const [view, setView] = useState<'preview' | 'json'>('preview');
  const [device, setDevice] = useState<'mobile' | 'desktop'>('desktop');
  const [copied, setCopied] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [formState, setFormState] = useState({
    values: {} as Record<string, any>,
    visibility: {} as Record<string, boolean>,
    disabled: {} as Record<string, boolean>,
    labels: {} as Record<string, string>
  });
  
  const runtimeRef = useRef<FormRuntime | null>(null);

  useEffect(() => {
    if (isOpen && schema) {
      const runtime = new FormRuntime(schema, {}, (newState) => {
        setFormState(prev => ({ ...prev, ...newState }));
      });
      runtimeRef.current = runtime;

      if (schema.script) {
        try {
          const Form = runtime.getProxy();
          const scriptFunc = new Function('Form', schema.script);
          scriptFunc(Form);
        } catch (err) {
          console.error("Erro script:", err);
        }
      }
    }
  }, [isOpen, schema]);

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openFullView = () => {
    localStorage.setItem('lecom_preview_schema', JSON.stringify(schema));
    window.open('/?preview=true', '_blank');
  };

  if (!isOpen) return null;

  const currentStep = schema.steps[activeStepIndex];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" 
        onClick={onClose} 
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-7xl h-full bg-[#020617] rounded-[2.5rem] border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.8)] flex flex-col overflow-hidden glass-card"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.02]">
          <div className="flex items-center gap-8">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Preview Engine</h2>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">Real-time validation & layout test</p>
            </div>
            
            <div className="flex p-1 bg-slate-900/50 rounded-2xl border border-white/5">
              <button 
                onClick={() => setView('preview')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                  view === 'preview' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/40" : "text-slate-500 hover:text-slate-200"
                )}
              >
                <Eye size={14} />
                Visualização
              </button>
              <button 
                onClick={() => setView('json')}
                className={cn(
                  "flex items-center gap-2 px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300",
                  view === 'json' ? "bg-primary-600 text-white shadow-lg shadow-primary-900/40" : "text-slate-500 hover:text-slate-200"
                )}
              >
                <Code size={14} />
                Schema JSON
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={openFullView}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5"
            >
              <ExternalLink size={14} className="text-primary-400" />
              Ver em Tela Cheia
            </button>

            {view === 'preview' && (
              <div className="flex p-1 bg-slate-900/50 rounded-xl border border-white/5">
                <button 
                  onClick={() => setDevice('mobile')}
                  className={cn("p-2 rounded-lg transition-all duration-300", device === 'mobile' ? "bg-primary-500/10 text-primary-400" : "text-slate-600 hover:text-slate-400")}
                >
                  <Smartphone size={20} />
                </button>
                <button 
                  onClick={() => setDevice('desktop')}
                  className={cn("p-2 rounded-lg transition-all duration-300", device === 'desktop' ? "bg-primary-500/10 text-primary-400" : "text-slate-600 hover:text-slate-400")}
                >
                  <Monitor size={20} />
                </button>
              </div>
            )}
            
            <div className="w-px h-8 bg-white/5 mx-2" />
            
            <button 
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center hover:bg-red-500/10 rounded-full text-slate-500 hover:text-red-400 transition-all duration-300"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col relative">
          {view === 'preview' ? (
            <div className="flex-1 bg-[#020617] p-8 md:p-12 overflow-y-auto custom-scrollbar flex flex-col items-center bg-mesh">
              {/* Step indicator for preview */}
              <div className="mb-12 flex items-center gap-4">
                {schema.steps.map((step, idx) => (
                  <div key={step.id} className="flex items-center gap-4">
                    <div className={cn(
                      "flex flex-col items-center gap-2 px-4 py-2 rounded-xl transition-all",
                      activeStepIndex === idx ? "bg-primary-600/20 ring-1 ring-primary-500" : "opacity-30"
                    )}>
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black",
                        activeStepIndex === idx ? "bg-primary-500 text-white" : "bg-slate-800 text-slate-400"
                      )}>
                        {idx + 1}
                      </div>
                      <span className="text-[10px] font-bold text-white uppercase tracking-widest">{step.title}</span>
                    </div>
                    {idx < schema.steps.length - 1 && <div className="w-8 h-px bg-slate-800" />}
                  </div>
                ))}
              </div>

              <motion.div 
                layout
                className={cn(
                  "bg-white rounded-[2rem] shadow-[0_48px_96px_-12px_rgba(0,0,0,0.5)] transition-all duration-700 overflow-hidden relative",
                  device === 'mobile' ? "w-[375px]" : "w-full max-w-5xl"
                )}
              >
                {/* Simulated Phone Notch */}
                {device === 'mobile' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-b-2xl z-10" />}
                
                <div className={cn("p-10 md:p-16", device === 'mobile' ? "pt-12" : "")}>
                  <header className="mb-12">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-primary-600 text-[9px] font-black text-white rounded uppercase tracking-tighter">Etapa {activeStepIndex + 1} de {schema.steps.length}</span>
                      <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{currentStep.title}</h4>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">{schema.title}</h1>
                    <div className="flex items-center gap-4">
                      <div className="h-1.5 w-24 bg-primary-600 rounded-full" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Protocolo Automatizado</span>
                    </div>
                  </header>

                  <form className="grid grid-cols-12 gap-8" onSubmit={e => e.preventDefault()}>
                    <AnimatePresence mode="wait">
                      <motion.div 
                        key={activeStepIndex}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="col-span-12 grid grid-cols-12 gap-8"
                      >
                        {currentStep.fields.map((field) => (
                          <RenderFieldWrapper 
                            key={field.id} 
                            field={field} 
                            device={device} 
                            formState={formState}
                            setFormState={setFormState}
                          />
                        ))}
                      </motion.div>
                    </AnimatePresence>
                    
                    <footer className="col-span-12 pt-12 flex justify-between gap-5 border-t border-slate-100 mt-8">
                      <button 
                        disabled={activeStepIndex === 0}
                        onClick={() => setActiveStepIndex(prev => prev - 1)}
                        className={cn(
                          "px-10 py-4 text-xs font-black uppercase tracking-widest rounded-2xl transition-all active:scale-95 border flex items-center gap-2",
                          activeStepIndex === 0 ? "opacity-0 pointer-events-none" : "bg-slate-50 hover:bg-slate-100 text-slate-500 border-slate-200/50"
                        )}
                      >
                        <ChevronLeft size={16} />
                        Etapa Anterior
                      </button>
                      <button 
                        onClick={() => {
                          if (activeStepIndex < schema.steps.length - 1) {
                            setActiveStepIndex(prev => prev + 1);
                          } else {
                            alert('Formulário enviado com sucesso!');
                            onClose();
                          }
                        }}
                        className="px-10 py-4 bg-primary-600 hover:bg-primary-500 text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-[0_16px_32px_-8px_rgba(14,165,233,0.5)] transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2"
                      >
                        {activeStepIndex === schema.steps.length - 1 ? 'Finalizar e Enviar' : 'Próxima Etapa'}
                        <ChevronRight size={16} />
                      </button>
                    </footer>
                  </form>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="flex-1 bg-[#020617] p-0 overflow-hidden flex flex-col relative">
              <div className="absolute top-6 right-8 z-10">
                <button 
                  onClick={copyJson}
                  className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 rounded-xl text-[11px] font-black uppercase tracking-widest text-white transition-all shadow-xl shadow-primary-900/40"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copiado!' : 'Copiar Estrutura'}
                </button>
              </div>
              <div className="flex-1 p-10 overflow-auto custom-scrollbar bg-black/40">
                <pre className="text-sm font-mono text-primary-400/90 leading-relaxed selection:bg-primary-500/30">
                  <code>{JSON.stringify(schema, null, 2)}</code>
                </pre>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const RenderFieldWrapper = ({ 
  field, 
  device, 
  formState, 
  setFormState 
}: { 
  field: FormField; 
  device: 'mobile' | 'desktop';
  formState: any;
  setFormState: any;
}) => {
  const isVisible = formState.visibility[field.id] !== false;
  const isDisabled = formState.disabled[field.id] === true;
  const currentLabel = formState.labels[field.id] || field.label;

  if (!isVisible) return null;

  if (field.type === 'group') {
    return (
      <div className="col-span-12 mb-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="bg-primary-600 text-white px-8 py-4 rounded-t-[1.5rem] flex items-center justify-between shadow-2xl shadow-primary-900/20 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          <h3 className="text-[11px] font-black uppercase tracking-[0.2em] relative z-10">{currentLabel}</h3>
          <div className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-lg relative z-10">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
          </div>
        </div>
        <div className="p-8 md:p-10 border-2 border-t-0 border-slate-100 rounded-b-[1.5rem] bg-slate-50/50 grid grid-cols-12 gap-x-6 gap-y-8 shadow-inner">
          {field.children?.map(child => (
            <RenderFieldWrapper 
              key={child.id} 
              field={child} 
              device={device} 
              formState={formState}
              setFormState={setFormState}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={cn(
        "flex flex-col gap-2.5 min-w-0 transition-opacity duration-300",
        device === 'mobile' && "col-span-12",
        isDisabled && "opacity-50 pointer-events-none"
      )}
      style={{ 
        gridColumn: device === 'desktop' ? `span ${field.columnWidth} / span ${field.columnWidth}` : undefined
      }}
    >
      {field.type !== 'title' && field.type !== 'divider' && (
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] flex items-center gap-2 mb-1">
          {currentLabel}
          {field.required && <span className="text-red-500 text-xs">*</span>}
        </label>
      )}
      
      <div className="w-full min-w-0 group">
        <RenderField 
          field={field} 
          value={formState.values[field.id] || ''}
          onChange={(val: any) => setFormState((prev: any) => ({
            ...prev,
            values: { ...prev.values, [field.id]: val }
          }))}
        />
      </div>
      
      {field.meta.helperText && (
        <span className="text-[10px] text-slate-400 font-medium italic mt-1 pl-1 border-l-2 border-slate-100">{field.meta.helperText}</span>
      )}
    </div>
  );
};

const RenderField = ({ 
  field, 
  value, 
  onChange 
}: { 
  field: FormField; 
  value: any; 
  onChange: (val: any) => void;
}) => {
  const commonClasses = "w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-sm font-medium text-sm min-w-0";

  switch (field.type) {
    case 'text':
      return <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} className={commonClasses} />;
    
    case 'textarea':
      return <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder} rows={4} className={cn(commonClasses, "resize-none")} />;
    
    case 'integer':
    case 'decimal':
    case 'currency':
      return <input type="number" value={value} onChange={e => onChange(e.target.value)} placeholder={field.placeholder || '0,00'} className={cn(commonClasses, "text-right font-mono")} />;
    
    case 'date':
      return <input type="date" value={value} onChange={e => onChange(e.target.value)} className={commonClasses} />;
    
    case 'list':
    case 'select':
      return (
        <div className="relative">
          <select value={value} onChange={e => onChange(e.target.value)} className={cn(commonClasses, "appearance-none pr-10")}>
            <option value="">{field.placeholder || 'Selecione...'}</option>
            {field.meta.options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
          </div>
        </div>
      );
    
    case 'checkbox':
      return (
        <div className="flex flex-col gap-3 mt-1">
          {field.meta.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="checkbox" 
                className="hidden" 
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <div className={cn(
                "w-5 h-5 rounded border-2 transition-all flex items-center justify-center",
                value === opt.value ? "bg-primary-500 border-primary-500" : "border-slate-200 bg-white"
              )}>
                {value === opt.value && <Check size={12} className="text-white" strokeWidth={4} />}
              </div>
              <span className="text-sm text-slate-600 font-medium">{opt.label}</span>
            </label>
          )) || <span className="text-xs text-slate-400 italic">Sem opções configuradas</span>}
        </div>
      );

    case 'radio':
      return (
        <div className="flex flex-col gap-3 mt-1">
          {field.meta.options?.map((opt, i) => (
            <label key={i} className="flex items-center gap-3 cursor-pointer group">
              <input 
                type="radio" 
                className="hidden" 
                checked={value === opt.value}
                onChange={() => onChange(opt.value)}
              />
              <div className={cn(
                "w-5 h-5 rounded-full border-2 transition-all flex items-center justify-center",
                value === opt.value ? "border-primary-500" : "border-slate-200 bg-white"
              )}>
                {value === opt.value && <div className="w-2.5 h-2.5 rounded-full bg-primary-500" />}
              </div>
              <span className="text-sm text-slate-600 font-medium">{opt.label}</span>
            </label>
          )) || <span className="text-xs text-slate-400 italic">Sem opções configuradas</span>}
        </div>
      );

    case 'divider':
      return <div className="h-[1px] bg-slate-200 w-full my-4 shadow-inner" />;

    case 'title':
      return (
        <div className="mt-8 mb-4 col-span-12 w-full bg-primary-600/10 border-l-4 border-primary-600 px-5 py-2.5 rounded-r-lg">
          <h3 className="text-sm font-bold text-primary-900 uppercase tracking-widest">{field.label}</h3>
        </div>
      );

    case 'upload':
    case 'template':
      return (
        <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-slate-50/50 hover:bg-slate-50 hover:border-primary-300 transition-all cursor-pointer group shadow-inner">
          <div className="w-14 h-14 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 group-hover:scale-110 group-hover:bg-primary-100 transition-all shadow-sm">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Carregar múltiplos arquivos</p>
            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Máx 10MB)</p>
          </div>
        </div>
      );

    case 'grid':
      return (
        <div className="w-full border border-slate-200 rounded-2xl overflow-hidden shadow-xl bg-white">
          <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
             <div className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-primary-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
                <span className="text-xs font-bold text-slate-700 uppercase tracking-widest">{field.label}</span>
             </div>
             <button className="px-4 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-[10px] font-bold rounded-lg transition-all shadow-lg shadow-primary-600/20 uppercase">
                Adicionar Dados +
             </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-full">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-200">
                  {field.children && field.children.length > 0 ? (
                    <>
                      {field.children.map(child => (
                        <th key={child.id} className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {child.label}
                        </th>
                      ))}
                      <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center w-24">Ações</th>
                    </>
                  ) : (
                    <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Configure as colunas no builder</th>
                  )}
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="px-6 py-12 text-center text-xs text-slate-400 italic font-medium" colSpan={(field.children?.length || 0) + 1}>
                    <div className="flex flex-col items-center gap-2">
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-slate-200"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
                      Nenhum dado adicionado à tabela
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    default:
      return null;
  }
};
