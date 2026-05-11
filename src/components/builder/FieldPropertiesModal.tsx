import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { setFieldPropertiesModalFieldId, updateField } from '../../store/slices/formSlice';
import { X, Save, HelpCircle, ChevronDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const PRESENTATION_OPTIONS = [
  'Normal',
  'Somente leitura',
  'Invisível',
  'Bloqueado',
  'Bloqueado - Obrigatório',
  'Obrigatório',
  'Oculto'
];

const INITIALIZATION_OPTIONS = [
  'Com valor inicial',
  'Sem valor inicial'
];

export const FieldPropertiesModal = () => {
  const dispatch = useDispatch();
  const { schema, fieldPropertiesModalFieldId } = useSelector((state: RootState) => state.form);
  
  let activeField: any = null;
  if (fieldPropertiesModalFieldId) {
    for (const step of schema.steps) {
      const field = step.fields.find(f => f.id === fieldPropertiesModalFieldId);
      if (field) {
        activeField = field;
        break;
      }
    }
  }

  const [groupPresentation, setGroupPresentation] = useState(PRESENTATION_OPTIONS[0]);
  const [stepPresentations, setStepPresentations] = useState<Record<string, string>>({});
  
  useEffect(() => {
    if (activeField && activeField.stepProperties) {
      const initialPresentations: Record<string, string> = {};
      Object.keys(activeField.stepProperties).forEach(stepId => {
        initialPresentations[stepId] = activeField.stepProperties[stepId].presentation;
      });
      setStepPresentations(initialPresentations);
    } else {
      setStepPresentations({});
    }
  }, [activeField?.id]); // Only re-run if active field ID changes

  if (!fieldPropertiesModalFieldId || !activeField) return null;

  const technicalName = activeField.technicalName || '';

  const onClose = () => dispatch(setFieldPropertiesModalFieldId(null));

  const handleSave = () => {
    if (!activeField) return;
    
    const newStepProperties = { ...(activeField.stepProperties || {}) };
    schema.steps.forEach(step => {
       const presentation = stepPresentations[step.id] || PRESENTATION_OPTIONS[0];
       newStepProperties[step.id] = {
           ...(newStepProperties[step.id] || { initialization: INITIALIZATION_OPTIONS[0], initialValue: '' }),
           presentation
       };
    });

    dispatch(updateField({
       fieldId: activeField.id,
       updates: { stepProperties: newStepProperties }
    }));

    dispatch(setFieldPropertiesModalFieldId(null));
  };

  const handleApplyToAll = () => {
    const newPresentations = {} as Record<string, string>;
    schema.steps.forEach(step => {
      newPresentations[step.id] = groupPresentation;
    });
    setStepPresentations(prev => ({ ...prev, ...newPresentations }));
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-[90vw] max-w-5xl h-[85vh] shadow-2xl flex flex-col border border-slate-300 rounded-sm overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#f4f4f4] border-b border-slate-300 h-10 flex items-center justify-between px-4">
          <h2 className="text-[#0056b3] text-sm font-bold truncate">
            Propriedades do campo {technicalName.toUpperCase()} na atividade
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>

        {/* Toolbar */}
        <div className="bg-[#e9e9e9] border-b border-slate-300 h-9 flex items-center px-4 gap-4 shadow-inner">
           <button onClick={handleSave} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors">
              <Save size={14} className="text-slate-500" /> Salvar
           </button>
           <button className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-slate-900 transition-colors border-l border-slate-300 pl-4">
              <HelpCircle size={14} className="text-[#0056b3]" /> Ajuda
           </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white custom-scrollbar">
          
          {/* Edição em grupo section */}
          <div className="bg-[#f0f0f0] border-b border-slate-300">
            <div className="px-4 py-1.5 flex items-center justify-between cursor-pointer hover:bg-slate-200 transition-colors">
               <span className="text-[11px] font-bold text-slate-700">Edição em grupo</span>
               <ChevronDown size={14} className="text-slate-400" />
            </div>
            <div className="px-6 py-2 pb-3 border-t border-slate-200 bg-[#f8f8f8] flex items-center gap-4">
               <span className="text-[11px] text-slate-600">Apresentação</span>
               <div className="relative w-48">
                  <select 
                    value={groupPresentation}
                    onChange={(e) => setGroupPresentation(e.target.value)}
                    className="w-full bg-white text-slate-700 border border-slate-300 p-1 text-[11px] outline-none appearance-none pr-6 rounded-sm"
                  >
                    {PRESENTATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                  <ChevronDown size={14} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
               </div>
               <button 
                 onClick={handleApplyToAll}
                 className="bg-gradient-to-b from-white to-slate-100 border border-slate-300 px-3 py-1 text-[10px] font-bold text-slate-700 rounded hover:shadow-sm"
               >
                 Aplicar a todos
               </button>
            </div>
          </div>

          {/* Main Properties Table */}
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#4fb1f1] text-white">
                <th className="px-4 py-1 text-[11px] font-normal text-left border-r border-white/20 w-[20%]">Apresentação</th>
                <th className="px-4 py-1 text-[11px] font-normal text-left border-r border-white/20 w-[15%]">Inicialização</th>
                <th className="px-4 py-1 text-[11px] font-normal text-left border-r border-white/20">Valor inicial</th>
                <th className="px-4 py-1 text-[11px] font-normal text-left border-r border-white/20 w-[10%]">Base de Dados</th>
                <th className="px-4 py-1 text-[11px] font-normal text-left border-r border-white/20 w-[5%]">Cíclico</th>
                <th className="px-4 py-1 text-[11px] font-normal text-left">Prop. adicionais</th>
              </tr>
            </thead>
            <tbody>
              {schema.steps.map((step) => (
                <tr key={step.id} className="border-b border-slate-200">
                   <td colSpan={6} className="p-0">
                      <div className="bg-[#f0f0f0] px-4 py-1 text-[11px] font-bold text-slate-700 border-b border-slate-200">
                        {step.title}
                      </div>
                      <div className="flex bg-[#f8f8f8]">
                        {/* Apresentação */}
                        <div className="w-[20%] p-4 border-r border-slate-200">
                           <div className="relative">
                              <select 
                                value={stepPresentations[step.id] || PRESENTATION_OPTIONS[0]}
                                onChange={(e) => setStepPresentations(prev => ({ ...prev, [step.id]: e.target.value }))}
                                className="w-full bg-white text-slate-700 border border-slate-300 p-1.5 text-[11px] outline-none appearance-none pr-8 rounded-sm"
                              >
                                {PRESENTATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>

                        {/* Inicialização */}
                        <div className="w-[15%] p-4 border-r border-slate-200">
                           <div className="relative">
                              <select className="w-full bg-white text-slate-700 border border-slate-300 p-1.5 text-[11px] outline-none appearance-none pr-8 rounded-sm">
                                {INITIALIZATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                              </select>
                              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>

                        {/* Valor Inicial */}
                        <div className="flex-1 p-4 border-r border-slate-200">
                           <textarea 
                             className="w-full h-24 border border-slate-300 text-slate-700 p-2 text-xs font-mono outline-none focus:border-[#4fb1f1] rounded-sm bg-white" 
                             defaultValue={step.id === 'step-1' ? '#NOME_USUARIO' : ''}
                           />
                        </div>

                        {/* Base de Dados */}
                        <div className="w-[10%] p-4 border-r border-slate-200 flex items-center justify-center">
                           <div className="relative w-full opacity-50">
                              <select disabled className="w-full bg-[#f4f4f4] text-slate-700 border border-slate-300 p-1 text-[10px] outline-none appearance-none pr-6 rounded-sm">
                                <option>WorkFlow</option>
                              </select>
                              <ChevronDown size={12} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                           </div>
                        </div>

                        {/* Cíclico */}
                        <div className="w-[5%] p-4 border-r border-slate-200 flex items-center justify-center">
                           <div className="w-4 h-4 bg-emerald-600 border border-emerald-700 rounded-sm flex items-center justify-center text-white cursor-pointer shadow-sm">
                              <div className="w-2.5 h-1.5 border-l-2 border-b-2 border-white -rotate-45 mb-1" />
                           </div>
                        </div>

                        {/* Prop. adicionais */}
                        <div className="flex-1 p-4"></div>
                      </div>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="bg-[#e9e9e9] border-t border-slate-300 h-10 flex items-center justify-end px-4 gap-2">
           <button 
             onClick={handleSave}
             className="flex items-center gap-2 bg-[#f4f4f4] hover:bg-white border border-slate-300 px-4 py-1 rounded shadow-sm text-xs font-bold text-slate-700 transition-all active:translate-y-0.5"
           >
             <Save size={14} className="text-slate-500" /> Salvar
           </button>
        </div>
      </div>
    </div>
  );
};
