import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SidebarRight } from './components/builder/SidebarRight';
import { CamposView } from './components/builder/CamposView';
import { AtividadesView } from './components/builder/AtividadesView';
import { FullscreenPreview } from './components/preview/FullscreenPreview';
import { FieldPropertiesModal } from './components/builder/FieldPropertiesModal';
import { 
  FileText, 
  Eye, 
  LayoutGrid,
  ListTodo
} from 'lucide-react';
import type { RootState } from './store';
import { cn } from './utils/lib';
import { 
  setSelectedFieldId, 
  setSelectedGroupId,
  updateField, 
  removeField,
  updateGroup,
  removeGroup
} from './store/slices/formSlice';

type Tab = 'Propriedades' | 'Diagrama' | 'Atividades' | 'Campos' | 'Regras' | 'Publicar';

function App() {
  const dispatch = useDispatch();
  const { schema, selectedFieldId, selectedGroupId } = useSelector((state: RootState) => state.form);
  const [activeTab, setActiveTab] = useState<Tab>('Campos');
  
  // Check if we are in preview mode (new tab)
  const isFullscreenPreview = new URLSearchParams(window.location.search).get('preview') === 'true';

  if (isFullscreenPreview) {
    return <FullscreenPreview />;
  }



  const findFieldRecursive = (fields: any[], id: string | null): any | null => {
    if (!id || !fields) return null;
    for (const field of fields) {
      if (field.id === id) return field;
      if (field.children) {
        const found = findFieldRecursive(field.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  let selectedField: any = null;
  if (selectedFieldId) {
    for (const step of schema.steps) {
      const found = findFieldRecursive(step.fields, selectedFieldId);
      if (found) {
        selectedField = found;
        break;
      }
    }
  }
  const selectedGroup = schema.groups?.find(g => g.id === selectedGroupId) || null;

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'Atividades', label: 'Atividades', icon: ListTodo },
    { id: 'Campos', label: 'Campos do formulário', icon: LayoutGrid },
    { id: 'Publicar', label: 'Visualizar', icon: Eye },
  ];

  useEffect(() => {
    localStorage.setItem('lecom_preview_schema', JSON.stringify(schema));
  }, [schema]);

  return (
    <div className="h-screen w-full flex flex-col overflow-hidden bg-[#e9e9e9] font-sans theme-lecom">

      {/* Main Tab Navigation */}
      <nav className="h-12 bg-[#f4f4f4] border-b border-slate-300 flex items-center shrink-0">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <div 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "h-full px-8 flex items-center gap-2 cursor-pointer relative transition-all group",
                isActive 
                  ? "bg-gradient-to-b from-[#70b1e4] to-[#4c97d5] text-white shadow-inner" 
                  : "bg-[#e1e1e1] text-slate-600 hover:bg-[#d8d8d8] border-r border-slate-300"
              )}
            >
              {/* Beveled edge effect for tabs */}
              {isActive && (
                 <div className="absolute inset-y-0 -right-4 w-4 bg-[#e9e9e9]" style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 100%)' }} />
              )}
              
              <tab.icon size={16} className={cn(isActive ? "text-white" : "text-slate-500")} />
              <span className="text-xs font-bold whitespace-nowrap">{tab.label}</span>
              
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0056b3]" />
              )}
            </div>
          );
        })}
      </nav>

      {/* View Content */}
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-y-auto bg-[#e9e9e9]">
          {activeTab === 'Campos' && <CamposView />}
          {activeTab === 'Atividades' && <AtividadesView />}
          {activeTab === 'Publicar' && (
            <div className="h-full overflow-auto bg-white">
               <FullscreenPreview schema={schema} />
            </div>
          )}
          {activeTab !== 'Campos' && activeTab !== 'Atividades' && activeTab !== 'Publicar' && (
            <div className="h-full flex items-center justify-center text-slate-400">
              <div className="text-center">
                <FileText size={48} className="mx-auto mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">Módulo em Desenvolvimento</p>
              </div>
            </div>
          )}
        </main>

        <SidebarRight 
          selectedField={selectedField}
          selectedGroup={selectedGroup}
          isOpen={!!selectedFieldId || !!selectedGroupId}
          onUpdateField={(updates) => selectedFieldId && dispatch(updateField({ fieldId: selectedFieldId, updates }))}
          onRemoveField={(id) => dispatch(removeField(id))}
          onUpdateGroup={(id, updates) => dispatch(updateGroup({ id, updates }))}
          onRemoveGroup={(id) => dispatch(removeGroup(id))}
          onClose={() => {
            dispatch(setSelectedFieldId(null));
            dispatch(setSelectedGroupId(null));
          }}
        />
      </div>

      <FieldPropertiesModal />
    </div>
  );
}

export default App;
