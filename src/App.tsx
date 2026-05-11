import { useState, useEffect, useRef } from 'react';
import LZString from 'lz-string';
import { useDispatch, useSelector } from 'react-redux';
import { SidebarRight } from './components/builder/SidebarRight';
import { CamposView } from './components/builder/CamposView';
import { AtividadesView } from './components/builder/AtividadesView';
import { FullscreenPreview } from './components/preview/FullscreenPreview';
import { FieldPropertiesModal } from './components/builder/FieldPropertiesModal';
import { 
  ListTodo,
  Download,
  Upload,
  Share2
} from 'lucide-react';
import type { RootState } from './store';
import { cn } from './utils/lib';
import { 
  setSelectedFieldId, 
  setSelectedGroupId,
  updateField, 
  removeField,
  updateGroup,
  removeGroup,
  setSchema
} from './store/slices/formSlice';

type Tab = 'Propriedades' | 'Diagrama' | 'Atividades' | 'Campos' | 'Regras' | 'Publicar';

function App() {
  const dispatch = useDispatch();
  const { schema, selectedFieldId, selectedGroupId } = useSelector((state: RootState) => state.form);
  const [activeTab, setActiveTab] = useState<Tab>('Campos');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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
    const params = new URLSearchParams(window.location.search);
    const encodedData = params.get('data');
    if (encodedData) {
      try {
        const jsonStr = LZString.decompressFromEncodedURIComponent(encodedData);
        if (jsonStr) {
          const parsed = JSON.parse(jsonStr);
          if (parsed && parsed.steps) {
            dispatch(setSchema(parsed));
          }
        }
      } catch (e) {
        console.error('Error parsing schema from URL');
      }
    }
  }, [dispatch]);

  useEffect(() => {
    localStorage.setItem('lecom_preview_schema', JSON.stringify(schema));
  }, [schema]);

  const handleExportSchema = () => {
    const jsonString = JSON.stringify(schema, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `form-schema-${new Date().getTime()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSchema = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsedSchema = JSON.parse(content);
          if (parsedSchema && parsedSchema.steps) {
            dispatch(setSchema(parsedSchema));
          } else {
            alert("O arquivo selecionado não contém um formato válido de formulário.");
          }
        } catch (error) {
          alert("Erro ao importar arquivo. Certifique-se de que é um JSON válido.");
        }
      };
      reader.readAsText(file);
    }
    if (event.target) event.target.value = ''; // Reset input
  };

  const handleShareLink = () => {
    const jsonString = JSON.stringify(schema);
    const compressed = LZString.compressToEncodedURIComponent(jsonString);
    const url = `${window.location.origin}${window.location.pathname}?preview=true&data=${compressed}`;
    
    navigator.clipboard.writeText(url).then(() => {
      alert('Link de teste copiado para a área de transferência!');
    }).catch(() => {
      prompt('Copie o link abaixo:', url);
    });
  };

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

        <div className="ml-auto flex items-center gap-2 pr-4">
           {activeTab === 'Publicar' && (
             <button 
               onClick={handleShareLink}
               className="flex items-center gap-1.5 px-3 py-1.5 bg-[#10b981] hover:bg-[#059669] text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors mr-2 shadow-sm"
             >
               <Share2 size={12} /> Gerar Link de Teste
             </button>
           )}
           <input 
              type="file" 
              accept=".json" 
              ref={fileInputRef} 
              style={{ display: 'none' }} 
              onChange={handleImportSchema} 
           />
           <button 
             onClick={() => fileInputRef.current?.click()}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#d8d8d8] hover:bg-[#c8c8c8] text-slate-700 text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
           >
             <Upload size={12} /> Importar
           </button>
           <button 
             onClick={handleExportSchema}
             className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0056b3] hover:bg-[#004494] text-white text-[10px] font-bold uppercase tracking-wider rounded transition-colors"
           >
             <Download size={12} /> Exportar
           </button>
        </div>
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
