import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { cn } from '../../utils/lib';
import { 
  Save, 
  Info, 
  HelpCircle, 
  Download, 
  ChevronRight, 
  ChevronDown,
  CheckCircle2, 
  Plus
} from 'lucide-react';
import { 
  setActiveStep, 
  addStep, 
  updateStep 
} from '../../store/slices/formSlice';
import { v4 as uuidv4 } from 'uuid';

export const AtividadesView = () => {
  const dispatch = useDispatch();
  const { schema, activeStepId } = useSelector((state: RootState) => state.form);
  const activeStep = schema.steps.find(s => s.id === activeStepId) || schema.steps[0];
  

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleAddActivity = () => {
      const newStep = {
          id: uuidv4(),
          title: 'Nova Atividade',
          fields: []
      };
      dispatch(addStep(newStep));
  };

  const handleSave = () => {
      setIsSaving(true);
      setTimeout(() => {
          setIsSaving(false);
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
      }, 800);
  };


  return (
    <div className="flex h-full bg-[#e9e9e9] overflow-hidden">
      {/* Sidebar List */}
      <div className="w-64 bg-white border-r border-slate-300 flex flex-col shrink-0">
        <div className="p-3 bg-[#f4f4f4] border-b border-slate-300 flex items-center justify-between">
           <span className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wider">Atividades</span>
           <button onClick={handleAddActivity} className="p-1 hover:bg-slate-200 rounded text-[#007bff]">
              <Plus size={16} />
           </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {schema.steps.map((step) => {
            const isActive = step.id === activeStepId;
            return (
              <div 
                key={step.id}
                onClick={() => dispatch(setActiveStep(step.id))}
                className={cn(
                  "px-3 py-2.5 border-b border-slate-100 cursor-pointer flex items-center gap-2 group transition-all",
                  isActive ? "bg-[#007bff] text-white shadow-md z-10" : "hover:bg-slate-50 text-slate-600"
                )}
              >
                <div className={cn(
                   "w-2 h-2 rounded-full shrink-0",
                   isActive ? "bg-white animate-pulse" : "bg-emerald-500"
                )} />
                <span className="text-[11px] font-bold truncate flex-1 uppercase tracking-tight">{step.title}</span>
                {isActive && <ChevronRight size={14} className="text-white opacity-70" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="h-8 bg-[#f4f4f4] border-b border-slate-300 flex items-center px-4 gap-4 shadow-sm shrink-0">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 disabled:opacity-50 transition-colors"
          >
             <Save size={12} className={cn("text-slate-400", isSaving && "animate-spin")} /> {isSaving ? 'Salvando...' : 'Salvar'}
          </button>
          <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
             <Info size={12} className="text-slate-400" /> Informações nessa atividade
          </button>
          <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
             <HelpCircle size={12} className="text-slate-400" /> Ajuda
          </button>
          <button className="flex items-center gap-1 text-[10px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
             <Download size={12} className="text-slate-400" /> Importar
          </button>
          
          {saveSuccess && (
              <div className="ml-auto flex items-center gap-2 text-emerald-600 text-[10px] font-bold animate-in fade-in slide-in-from-right-4">
                  <CheckCircle2 size={12} /> Alterações salvas com sucesso!
              </div>
          )}
        </div>

        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[#f8f8f8]">
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            {/* Header Title */}
            <div className="border-b border-slate-200 pb-2">
               <h1 className="text-lg font-bold text-[#0056b3] uppercase tracking-tight">{activeStep.title}</h1>
            </div>

            {/* Dados Básicos */}
            <Section title="Dados básicos">
              <div className="grid grid-cols-12 gap-5 p-5">
                <div className="col-span-12">
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Referência da atividade</label>
                   <input 
                    type="text" 
                    readOnly 
                    value={activeStep.title.toUpperCase().replace(/\s+/g, '_')}
                    className="w-full bg-[#f4f4f4] border border-slate-200 p-2 text-xs font-mono text-slate-500 rounded-sm" 
                   />
                </div>
                <div className="col-span-12">
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Título da atividade *</label>
                   <input 
                    type="text" 
                    value={activeStep.title}
                    onChange={(e) => dispatch(updateStep({ stepId: activeStep.id, updates: { title: e.target.value } }))}
                    className="w-full border border-slate-300 p-2 text-xs rounded-sm focus:border-[#007bff] outline-none transition-all shadow-sm text-slate-800" 
                   />
                </div>
                <div className="col-span-12">
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Descrição</label>
                   <textarea className="w-full border border-slate-300 p-2 text-xs rounded-sm min-h-[80px] outline-none focus:border-[#007bff] transition-all text-slate-800" />
                </div>
                <div className="col-span-6">
                   <label className="text-[10px] text-slate-500 font-bold uppercase mb-1 block">Responsável pela atividade</label>
                   <div className="relative">
                      <select className="w-full appearance-none border border-slate-300 p-2 text-xs rounded-sm outline-none focus:border-[#007bff] transition-all bg-white text-slate-800">
                         <option>Usuário iniciador</option>
                         <option>Grupo específico</option>
                         <option>Usuário específico</option>
                      </select>
                      <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                   </div>
                </div>
              </div>
            </Section>

          </div>
        </div>
      </div>
    </div>
  );
};

const Section = ({ title, icon, children }: { title: string, icon?: any, children: React.ReactNode }) => {
    return (
        <div className="border border-slate-300 shadow-sm rounded overflow-hidden">
            <div className="bg-[#f4f4f4] border-b border-slate-200 px-4 py-2 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700 uppercase">{title}</span>
                {icon}
            </div>
            <div className="bg-white">
                {children}
            </div>
        </div>
    );
}
