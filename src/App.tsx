import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core';
import type { 
  DragStartEvent, 
  DragEndEvent, 
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SidebarLeft } from './components/builder/SidebarLeft.tsx';
import { Canvas } from './components/builder/Canvas.tsx';
import { SidebarRight } from './components/builder/SidebarRight.tsx';
import { StepManager } from './components/builder/StepManager.tsx';
import type { FormField, FieldType } from './types/form';
import { v4 as uuidv4 } from 'uuid';
import { PreviewModal } from './components/preview/PreviewModal.tsx';
import { FullscreenPreview } from './components/preview/FullscreenPreview.tsx';
import { Code, Eye, Play, Save, Sun, Moon } from 'lucide-react';
import type { RootState } from './store';
import { cn } from './utils/lib';
import { 
  setSelectedFieldId, 
  updateField, 
  removeField, 
  addField, 
  reorderFields,
  setSchema
} from './store/slices/formSlice';

function App() {
  const dispatch = useDispatch();
  const { schema, selectedFieldId, activeStepId } = useSelector((state: RootState) => state.form);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light' | 'black'>('dark');

  // Check if we are in preview mode (new tab)
  const isFullscreenPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  if (isFullscreenPreview) {
    return <FullscreenPreview />;
  }

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeStep = schema.steps.find(s => s.id === activeStepId) || schema.steps[0];



  const findFieldRecursive = (fields: FormField[], id: string | null): FormField | null => {
    if (!id) return null;
    for (const field of fields) {
      if (field.id === id) return field;
      if (field.children) {
        const found = findFieldRecursive(field.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const selectedField = findFieldRecursive(activeStep.fields, selectedFieldId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over) {
      setActiveId(null);
      return;
    }

    const overId = over.id as string;
    const actualOverId = over.data.current?.originalId || overId;

    if (active.data.current?.isNew) {
      const type = active.data.current.type as FieldType;
      const newField: FormField = {
        id: uuidv4(),
        type,
        label: `Novo Campo ${type}`,
        required: false,
        disabled: false,
        visible: true,
        columnWidth: 12,
        children: (type === 'group' || type === 'grid') ? [] : undefined,
        meta: {}
      };
      dispatch(addField({ field: newField, overId: actualOverId }));
    } else if (active.id !== actualOverId) {
      dispatch(reorderFields({ activeId: active.id as string, overId: actualOverId }));
    }
    
    setActiveId(null);
  };

  return (
    <div className={cn("h-screen w-full flex flex-col overflow-hidden transition-all duration-500", 
      theme === 'light' ? 'bg-[#ffffff] text-slate-900' : 'dark bg-[#020617] text-white')}>
      <header className="h-16 border-b border-[var(--border-color)] flex items-center justify-between px-8 bg-[var(--bg-sidebar)] shrink-0 z-50">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary-600 to-slate-900 rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center border border-white/10 shadow-xl">
                <Code className="text-primary-400" size={22} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-black text-slate-900 dark:text-white tracking-tighter uppercase">LECOM <span className="text-primary-600">Builder</span></h1>
                <span className="text-[9px] bg-primary-600 text-white px-2 py-0.5 rounded-full font-bold shadow-lg shadow-primary-500/20">V5.0</span>
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[9px] text-slate-400 font-bold tracking-[0.3em] uppercase">Dynamic Form Engine</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
            <button 
              onClick={() => setTheme('light')}
              className={cn("p-2 rounded-lg transition-all", theme === 'light' ? "bg-white text-primary-600 shadow-md" : "text-slate-400 hover:text-slate-600")}
            >
              <Sun size={16} />
            </button>
            <button 
              onClick={() => setTheme('black')}
              className={cn("p-2 rounded-lg transition-all", theme === 'black' ? "bg-slate-900 text-white shadow-md" : "text-slate-400 hover:text-slate-300")}
            >
              <Moon size={16} />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />

          <button 
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-2.5 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <Eye size={14} /> Visualizar
          </button>
          
          <button className="relative group overflow-hidden px-6 py-2.5 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest transition-all hover:shadow-2xl hover:shadow-black/20 active:scale-95 border border-slate-800">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-transparent to-primary-600/20 translate-x-full group-hover:translate-x-0 transition-transform duration-700"></div>
            <div className="flex items-center gap-2 relative">
              <Save size={14} /> Salvar Formulário
            </div>
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SidebarLeft />
          <main className="flex-1 bg-[var(--bg-main)] relative overflow-y-auto custom-scrollbar p-12">
            <div className="max-w-6xl mx-auto">
              <div className="mb-16 relative">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-primary-500/10 text-[9px] font-black text-primary-600 uppercase tracking-widest border border-primary-500/20">Fluxo de Trabalho</span>
                    <span className="w-8 h-px bg-slate-200 dark:bg-slate-800" />
                  </div>
                  <input 
                    type="text" 
                    value={schema.title}
                    onChange={(e) => dispatch(setSchema({ ...schema, title: e.target.value }))}
                    className="bg-transparent border-none text-5xl font-black text-slate-900 dark:text-white focus:outline-none focus:ring-0 w-full placeholder:text-slate-200 dark:placeholder:text-slate-800 tracking-tighter"
                    placeholder="Título do Formulário..."
                  />
                  <div className="flex items-center gap-4 mt-2">
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Status: Em Edição
                    </p>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest border-l border-slate-200 dark:border-slate-800 pl-4">
                      {activeStep.fields.length} Componentes Ativos
                    </p>
                  </div>
                </div>
              </div>
              
              <StepManager />
              
              <div className="mt-8">
                <Canvas 
                  fields={activeStep.fields} 
                  selectedFieldId={selectedFieldId}
                  onSelectField={(id) => dispatch(setSelectedFieldId(id))}
                  onRemoveField={(id) => dispatch(removeField(id))}
                />
              </div>
            </div>
          </main>
          <SidebarRight 
            selectedField={selectedField}
            onUpdateField={(updates) => selectedFieldId && dispatch(updateField({ fieldId: selectedFieldId, updates }))}
            onRemoveField={(id) => dispatch(removeField(id))}
          />
          <DragOverlay dropAnimation={null}>
            {activeId ? (
              <div className="px-6 py-4 bg-white border border-slate-200 rounded-2xl shadow-2xl text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-4 ring-4 ring-primary-500/10">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                  <Play size={14} fill="white" />
                </div>
                Movendo Elemento...
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <PreviewModal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} schema={schema} />
    </div>
  );
}

export default App;
