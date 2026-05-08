import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FormField, FormSchema, FormStep, FormGroup } from '../../types/form';

interface FormState {
  schema: FormSchema;
  activeStepId: string;
  selectedFieldId: string | null;
}

const INITIAL_SCHEMA: FormSchema = {
  id: 'lecom-demo',
  title: 'Portal de Suprimentos - Solicitação de Compra',
  groups: [
    { id: 'group-1', name: 'Dados Cadastrais' },
    { id: 'group-2', name: 'Endereço de Entrega' },
    { id: 'group-3', name: 'Itens da Solicitação' }
  ],
  steps: [
    {
      id: 'step-1',
      title: 'Identificação',
      fields: [
        {
          id: 'container-1',
          type: 'group',
          label: 'Informações Básicas do Solicitante',
          required: false,
          disabled: false,
          visible: true,
          columnWidth: 12,
          children: [
            { id: 'f1', type: 'text', label: 'Nome Completo', technicalName: 'NOME_SOLICITANTE', columnWidth: 8, required: true, disabled: false, visible: true, meta: {} },
            { id: 'f2', type: 'date', label: 'Data Desejada', technicalName: 'DATA_ENTREGA', columnWidth: 4, required: true, disabled: false, visible: true, meta: {} },
          ],
          meta: {}
        }
      ]
    },
    {
      id: 'step-2',
      title: 'Itens do Pedido',
      fields: [
        {
          id: 'grid-items',
          type: 'grid',
          label: 'Listagem de Produtos e Serviços',
          required: false,
          disabled: false,
          visible: true,
          columnWidth: 12,
          children: [
            { id: 'c1', type: 'text', label: 'SKU / Código', technicalName: 'SKU', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
            { id: 'c2', type: 'text', label: 'Descrição do Item', technicalName: 'DESCRICAO', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
            { id: 'c3', type: 'currency', label: 'Valor Estimado', technicalName: 'VALOR', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
            { id: 'c4', type: 'integer', label: 'Quantidade', technicalName: 'QTD', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
          ],
          meta: {
            displayType: 'grid',
            gridId: 'GRID_SUPRIMENTOS'
          }
        },
      ]
    }
  ]
};

const initialState: FormState = {
  schema: INITIAL_SCHEMA,
  activeStepId: 'step-1',
  selectedFieldId: null,
};

const formSlice = createSlice({
  name: 'form',
  initialState,
  reducers: {
    setSchema: (state, action: PayloadAction<FormSchema>) => {
      state.schema = action.payload;
    },
    setActiveStep: (state, action: PayloadAction<string>) => {
      state.activeStepId = action.payload;
      state.selectedFieldId = null;
    },
    addStep: (state, action: PayloadAction<FormStep>) => {
      state.schema.steps.push(action.payload);
      state.activeStepId = action.payload.id;
    },
    removeStep: (state, action: PayloadAction<string>) => {
      if (state.schema.steps.length > 1) {
        state.schema.steps = state.schema.steps.filter(s => s.id !== action.payload);
        if (state.activeStepId === action.payload) {
          state.activeStepId = state.schema.steps[0].id;
        }
      }
    },
    updateStep: (state, action: PayloadAction<{ stepId: string; updates: Partial<FormStep> }>) => {
      const step = state.schema.steps.find(s => s.id === action.payload.stepId);
      if (step) {
        Object.assign(step, action.payload.updates);
      }
    },
    setSelectedFieldId: (state, action: PayloadAction<string | null>) => {
      state.selectedFieldId = action.payload;
    },
    updateField: (state, action: PayloadAction<{ fieldId: string; updates: Partial<FormField> }>) => {
      const { fieldId, updates } = action.payload;
      for (const step of state.schema.steps) {
        const updateRecursive = (fields: FormField[]): FormField[] => {
          return fields.map(f => {
            if (f.id === fieldId) return { ...f, ...updates };
            if (f.children) return { ...f, children: updateRecursive(f.children) };
            return f;
          });
        };
        step.fields = updateRecursive(step.fields);
      }
    },
    removeField: (state, action: PayloadAction<string>) => {
      const fieldId = action.payload;
      for (const step of state.schema.steps) {
        const removeRecursive = (fields: FormField[]): FormField[] => {
          return fields
            .filter(f => f.id !== fieldId)
            .map(f => f.children ? { ...f, children: removeRecursive(f.children) } : f);
        };
        step.fields = removeRecursive(step.fields);
      }
      if (state.selectedFieldId === fieldId) state.selectedFieldId = null;
    },
    addField: (state, action: PayloadAction<{ field: FormField; overId: string | null }>) => {
      const { field, overId } = action.payload;
      const step = state.schema.steps.find(s => s.id === state.activeStepId);
      if (!step) return;
      
      if (!overId || overId === 'canvas-droppable') {
        step.fields.push(field);
        state.selectedFieldId = field.id;
        return;
      }

      const insertRecursive = (fields: FormField[]): boolean => {
        const index = fields.findIndex(f => f.id === overId);
        if (index !== -1) {
          fields.splice(index + 1, 0, field);
          return true;
        }

        for (const f of fields) {
          if ((f.type === 'group' || f.type === 'grid') && f.id === overId) {
            if (!f.children) f.children = [];
            f.children.push(field);
            return true;
          }
          if (f.children && insertRecursive(f.children)) {
            return true;
          }
        }
        return false;
      };

      insertRecursive(step.fields);
      state.selectedFieldId = field.id;
    },
    reorderFields: (state, action: PayloadAction<{ activeId: string; overId: string }>) => {
      const { activeId, overId } = action.payload;
      if (activeId === overId) return;

      const step = state.schema.steps.find(s => s.id === state.activeStepId);
      if (!step) return;

      let activeField: FormField | null = null;
      
      const removeRecursive = (fields: FormField[]): FormField[] => {
        const index = fields.findIndex(f => f.id === activeId);
        if (index !== -1) {
          activeField = fields[index];
          return fields.filter(f => f.id !== activeId);
        }
        return fields.map(f => f.children ? { ...f, children: removeRecursive(f.children) } : f);
      };

      const newFields = removeRecursive(step.fields);
      if (!activeField) return;

      const insertRecursive = (fields: FormField[]): boolean => {
        const index = fields.findIndex(f => f.id === overId);
        if (index !== -1) {
          fields.splice(index, 0, activeField!);
          return true;
        }

        for (const f of fields) {
          if ((f.type === 'group' || f.type === 'grid') && f.id === overId) {
            if (!f.children) f.children = [];
            f.children.push(activeField!);
            return true;
          }
          if (f.children && insertRecursive(f.children)) {
            return true;
          }
        }
        return false;
      };

      const fieldsClone = JSON.parse(JSON.stringify(newFields));
      if (insertRecursive(fieldsClone)) {
        step.fields = fieldsClone;
      } else {
        step.fields = [...newFields, activeField];
      }
    },
    moveFieldBetweenSteps: (state, action: PayloadAction<{ fieldId: string; targetStepId: string }>) => {
      const { fieldId, targetStepId } = action.payload;
      let fieldToMove: FormField | null = null;

      for (const step of state.schema.steps) {
        const removeRecursive = (fields: FormField[]): FormField[] => {
          const index = fields.findIndex(f => f.id === fieldId);
          if (index !== -1) {
            fieldToMove = fields[index];
            return fields.filter(f => f.id !== fieldId);
          }
          return fields.map(f => f.children ? { ...f, children: removeRecursive(f.children) } : f);
        };
        step.fields = removeRecursive(step.fields);
        if (fieldToMove) break;
      }

      if (fieldToMove) {
        const targetStep = state.schema.steps.find(s => s.id === targetStepId);
        if (targetStep) {
          targetStep.fields.push(fieldToMove);
          state.activeStepId = targetStepId;
        }
      }
    },
    addGroup: (state, action: PayloadAction<FormGroup>) => {
      if (!state.schema.groups) state.schema.groups = [];
      state.schema.groups.push(action.payload);
    },
    removeGroup: (state, action: PayloadAction<string>) => {
      if (state.schema.groups) {
        state.schema.groups = state.schema.groups.filter(g => g.id !== action.payload);
      }
    },
    updateGroup: (state, action: PayloadAction<{ id: string; name: string }>) => {
      const group = state.schema.groups?.find(g => g.id === action.payload.id);
      if (group) group.name = action.payload.name;
    },
    moveFieldToIndex: (state, action: PayloadAction<{ fieldId: string; newIndex: number }>) => {
      const { fieldId, newIndex } = action.payload;
      const step = state.schema.steps.find(s => s.id === state.activeStepId);
      if (!step) return;

      let fieldToMove: FormField | null = null;
      let parentArray: FormField[] | null = null;

      const findAndRemove = (fields: FormField[]): boolean => {
        const idx = fields.findIndex(f => f.id === fieldId);
        if (idx !== -1) {
          fieldToMove = fields.splice(idx, 1)[0];
          parentArray = fields;
          return true;
        }
        for (const f of fields) {
          if (f.children && findAndRemove(f.children)) return true;
        }
        return false;
      };

      if (findAndRemove(step.fields) && fieldToMove && parentArray) {
        const targetIndex = Math.max(0, Math.min(newIndex, parentArray.length));
        parentArray.splice(targetIndex, 0, fieldToMove);
      }
    },
    moveFieldToContainer: (state, action: PayloadAction<{ fieldId: string; targetContainerId: string | null }>) => {
      const { fieldId, targetContainerId } = action.payload;
      const step = state.schema.steps.find(s => s.id === state.activeStepId);
      if (!step) return;

      let fieldToMove: FormField | null = null;

      const findAndRemove = (fields: FormField[]): boolean => {
        const idx = fields.findIndex(f => f.id === fieldId);
        if (idx !== -1) {
          fieldToMove = fields.splice(idx, 1)[0];
          return true;
        }
        for (const f of fields) {
          if (f.children && findAndRemove(f.children)) return true;
        }
        return false;
      };

      if (findAndRemove(step.fields) && fieldToMove) {
        if (!targetContainerId) {
          step.fields.push(fieldToMove);
          return;
        }

        const findAndInsert = (fields: FormField[]): boolean => {
          for (const f of fields) {
            if (f.id === targetContainerId) {
              if (!f.children) f.children = [];
              f.children.push(fieldToMove!);
              return true;
            }
            if (f.children && findAndInsert(f.children)) return true;
          }
          return false;
        };

        if (!findAndInsert(step.fields)) {
          // If not found in step.fields, maybe it's the container itself? No.
          // Add back to root if target not found
          step.fields.push(fieldToMove);
        }
      }
    }
  },
});

export const { 
  setSchema, 
  setActiveStep, 
  addStep, 
  removeStep, 
  updateStep,
  setSelectedFieldId, 
  updateField, 
  removeField, 
  addField, 
  reorderFields,
  moveFieldBetweenSteps,
  addGroup,
  removeGroup,
  updateGroup,
  moveFieldToIndex,
  moveFieldToContainer
} = formSlice.actions;
export default formSlice.reducer;
