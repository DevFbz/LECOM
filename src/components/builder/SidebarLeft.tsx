import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { 
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
  Table, 
  Upload, 
  Search, 
  Minus, 
  Type as TitleIcon, 
  Layout,
  Binary,
  Trash2,
  FolderPlus,
  Settings2
} from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store';
import { addGroup, removeGroup, updateGroup } from '../../store/slices/formSlice';
import { v4 as uuidv4 } from 'uuid';
import type { FieldType } from '../../types/form';
import { cn } from '../../utils/lib';

interface ToolItemProps {
  type: FieldType;
  label: string;
  icon: React.ReactNode;
}

const DraggableToolItem = ({ type, label, icon }: ToolItemProps) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `tool-${type}`,
    data: {
      type,
      isNew: true
    }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "group flex items-center gap-3 p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] hover:bg-[var(--input-bg)] hover:border-primary-500/50 cursor-grab active:cursor-grabbing transition-all duration-300",
        isDragging && "opacity-50 ring-2 ring-primary-500 scale-95 shadow-2xl shadow-primary-500/20 z-50"
      )}
    >
      <div className="w-9 h-9 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)] group-hover:text-primary-500 group-hover:bg-primary-500/10 group-hover:scale-110 transition-all duration-300 shadow-sm border border-[var(--border-color)]">
        {icon}
      </div>
      <span className="text-[11px] font-bold text-[var(--text-muted)] group-hover:text-[var(--text-main)] uppercase tracking-wider transition-colors">{label}</span>
    </div>
  );
};

export const SidebarLeft = () => {
  const dispatch = useDispatch();
  const { schema } = useSelector((state: RootState) => state.form);
  const [newGroupName, setNewGroupName] = useState('');

  const categories = [
    {
      title: 'Estrutura & Layout',
      items: [
        { type: 'group', label: 'Agrupador de Campos', icon: <Layout size={18} /> },
        { type: 'grid', label: 'Grid Dinâmico (Tabela)', icon: <Table size={18} /> },
        { type: 'title', label: 'Título de Seção', icon: <TitleIcon size={18} /> },
        { type: 'divider', label: 'Divisor de Área', icon: <Minus size={18} /> },
        { type: 'template', label: 'Template', icon: <FileText size={18} /> },
        { type: 'label', label: 'Label', icon: <Tag size={18} /> },
      ]
    },
    {
      title: 'Campos de Texto',
      items: [
        { type: 'text', label: 'Linha de texto', icon: <Type size={18} /> },
        { type: 'textarea', label: 'Caixa de texto', icon: <AlignLeft size={18} /> },
      ]
    },
    {
      title: 'Dados & Números',
      items: [
        { type: 'integer', label: 'Inteiro', icon: <Hash size={18} /> },
        { type: 'decimal', label: 'Número decimal', icon: <Binary size={18} /> },
        { type: 'currency', label: 'Monetário', icon: <DollarSign size={18} /> },
        { type: 'date', label: 'Data', icon: <Calendar size={18} /> },
      ]
    },
    {
      title: 'Seleção & Ação',
      items: [
        { type: 'list', label: 'Lista', icon: <List size={18} /> },
        { type: 'radio', label: 'Radio button', icon: <CircleDot size={18} /> },
        { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={18} /> },
        { type: 'icon_button', label: 'Botão gráfico', icon: <BarChart2 size={18} /> },
        { type: 'app_button', label: 'Botão de aplicação', icon: <ExternalLink size={18} /> },
      ]
    },
    {
      title: 'Avançados',
      items: [
        { type: 'upload', label: 'Anexos / Documentos', icon: <Upload size={18} /> },
        { type: 'autocomplete', label: 'Busca Inteligente', icon: <Search size={18} /> },
      ]
    }
  ];

  const handleAddGroup = () => {
    if (newGroupName.trim()) {
      dispatch(addGroup({ id: uuidv4(), name: newGroupName.trim() }));
      setNewGroupName('');
    }
  };

  return (
    <aside className="w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border-color)] flex flex-col h-full overflow-hidden z-20">
      <div className="p-5 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-primary-500 shadow-lg shadow-primary-500/20" />
          <h2 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Biblioteca de Ativos</h2>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-5 space-y-8 custom-scrollbar">
        {categories.map((cat, idx) => (
          <div key={idx} className="space-y-3">
            <h3 className="text-[10px] font-black text-[var(--text-muted)] opacity-50 px-1 uppercase tracking-widest flex items-center justify-between">
              {cat.title}
              <span className="w-12 h-px bg-[var(--border-color)]" />
            </h3>
            <div className="grid gap-2.5">
              {cat.items.map((item) => (
                <DraggableToolItem key={item.type} type={item.type as FieldType} label={item.label} icon={item.icon} />
              ))}
            </div>
          </div>
        ))}

        {/* Group Manager Section */}
        <div className="pt-6 border-t border-[var(--border-color)]">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
             <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Gerenciador de Agrupadores</h3>
          </div>
          
          <div className="flex gap-2 mb-4">
            <input 
              type="text" 
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              placeholder="Nome do grupo..."
              className="flex-1 bg-[var(--input-bg)] border border-[var(--border-color)] rounded-xl px-4 py-2.5 text-[11px] text-[var(--text-main)] focus:outline-none focus:border-primary-500 transition-all shadow-sm placeholder:text-[var(--text-muted)]/50"
              onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            />
            <button 
              onClick={handleAddGroup}
              className="w-10 h-10 bg-slate-900 text-white dark:bg-primary-600 rounded-xl flex items-center justify-center transition-all shadow-lg active:scale-95"
            >
              <FolderPlus size={18} />
            </button>
          </div>

          <div className="space-y-2">
            {schema.groups?.map((group) => (
              <div key={group.id} className="group flex items-center justify-between p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] hover:border-primary-500/30 transition-all">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[var(--bg-main)] flex items-center justify-center text-[var(--text-muted)] border border-[var(--border-color)] shadow-sm">
                    <Settings2 size={14} />
                  </div>
                  <input 
                    type="text" 
                    value={group.name}
                    onChange={(e) => dispatch(updateGroup({ id: group.id, name: e.target.value }))}
                    className="bg-transparent border-none text-[11px] font-bold text-[var(--text-muted)] focus:text-[var(--text-main)] focus:outline-none w-32 transition-colors"
                  />
                </div>
                <button 
                  onClick={() => dispatch(removeGroup(group.id))}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/10 rounded-lg text-[var(--text-muted)] hover:text-red-500 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {(!schema.groups || schema.groups.length === 0) && (
              <div className="text-center py-6 text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest bg-[var(--bg-card)] rounded-xl border border-dashed border-[var(--border-color)] opacity-50">
                Nenhum agrupador criado
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="p-4 rounded-2xl bg-primary-500/5 border border-primary-500/10">
          <p className="text-[10px] text-[var(--text-muted)] leading-relaxed font-medium">
            <strong className="text-primary-600">Dica:</strong> Arraste elementos para o canvas ou use agrupadores para organizar os campos.
          </p>
        </div>
      </div>
    </aside>
  );
};
