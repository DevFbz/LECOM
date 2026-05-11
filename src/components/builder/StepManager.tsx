import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Plus, 
  Settings2, 
  Trash2, 
  ChevronRight
} from 'lucide-react';
import type { RootState } from '../../store';
import { 
  setActiveStep, 
  addStep, 
  removeStep, 
  updateStep 
} from '../../store/slices/formSlice';
import { cn } from '../../utils/lib';
import { v4 as uuidv4 } from 'uuid';

export const StepManager = () => {
  const dispatch = useDispatch();
  const { schema, activeStepId } = useSelector((state: RootState) => state.form);

  const handleAddStep = () => {
    const newStep = {
      id: uuidv4(),
      title: `Etapa ${schema.steps.length + 1}`,
      fields: []
    };
    dispatch(addStep(newStep));
  };

  const handleRemoveStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Tem certeza que deseja remover esta etapa e todos os seus campos?')) {
      dispatch(removeStep(id));
    }
  };

  const handleRenameStep = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newTitle = window.prompt('Novo nome para a etapa:', currentTitle);
    if (newTitle) {
      dispatch(updateStep({ stepId: id, updates: { title: newTitle } }));
    }
  };

  return (
    <div className="mb-8 bg-white/5 border border-white/10 rounded-2xl p-2 flex items-center gap-2 overflow-x-auto custom-scrollbar no-scrollbar">
      {schema.steps.map((step, index) => (
        <div
          key={step.id}
          onClick={() => dispatch(setActiveStep(step.id))}
          className={cn(
            "group relative flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all duration-300 whitespace-nowrap",
            activeStepId === step.id 
              ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20" 
              : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
          )}
        >
          <div className={cn(
            "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border",
            activeStepId === step.id ? "bg-white/20 border-white/30" : "bg-slate-800 border-white/5"
          )}>
            {index + 1}
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">{step.title}</span>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button 
              onClick={(e) => handleRenameStep(step.id, step.title, e)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Settings2 size={12} />
            </button>
            {schema.steps.length > 1 && (
              <button 
                onClick={(e) => handleRemoveStep(step.id, e)}
                className="p-1 hover:bg-red-500/20 hover:text-red-400 rounded"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>

          {index < schema.steps.length - 1 && (
            <div className="absolute -right-1 top-1/2 -translate-y-1/2 z-10 opacity-30">
              <ChevronRight size={14} className={activeStepId === step.id ? "text-white" : "text-slate-600"} />
            </div>
          )}
        </div>
      ))}

      <button
        onClick={handleAddStep}
        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 hover:bg-primary-500/20 transition-all text-xs font-bold uppercase tracking-widest ml-auto"
      >
        <Plus size={14} /> Nova Etapa
      </button>
    </div>
  );
};
