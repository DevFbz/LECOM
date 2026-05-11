import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { FormField, FormSchema, FormStep, FormGroup } from '../../types/form';

interface FormState {
  schema: FormSchema;
  activeStepId: string;
  selectedFieldId: string | null;
  selectedGroupId: string | null;
  fieldPropertiesModalFieldId: string | null;
}

const INITIAL_SCHEMA: FormSchema = {
  id: 'lecom-test',
  title: 'Teste Automatizado - Formulário Completo',
  groups: [
    { id: 'g1', name: 'Dados Pessoais' },
    { id: 'g2', name: 'Endereço e Contato' },
    { id: 'g3', name: 'Detalhes da Solicitação' },
    { id: 'g4', name: 'Produtos (Grid de Itens)' }
  ],
  steps: [
    {
      id: 'step-1',
      title: 'Etapa 1: Início',
      fields: [
        { id: 'f1', type: 'text', label: 'Nome Completo', technicalName: 'NOME', group: 'g1', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
        { id: 'f2', type: 'text', label: 'CPF', technicalName: 'CPF', group: 'g1', columnWidth: 6, required: true, disabled: false, visible: true, meta: { mask: '999.999.999-99' } },
        { id: 'f3', type: 'date', label: 'Data Nasc.', technicalName: 'NASC', group: 'g1', columnWidth: 6, required: false, disabled: false, visible: true, meta: {} },
      ]
    },
    {
      id: 'step-2',
      title: 'Etapa 2: Contato',
      fields: [
        { id: 'f4', type: 'text', label: 'Email', technicalName: 'EMAIL', group: 'g2', columnWidth: 8, required: true, disabled: false, visible: true, meta: {} },
        { id: 'f5', type: 'text', label: 'Telefone', technicalName: 'TEL', group: 'g2', columnWidth: 4, required: true, disabled: false, visible: true, meta: { mask: '(99) 99999-9999' } },
      ]
    },
    {
      id: 'step-3',
      title: 'Etapa 3: Informações Gerais',
      fields: [
        { id: 'f6', type: 'textarea', label: 'Motivo da Solicitação', technicalName: 'MOTIVO', group: 'g3', columnWidth: 12, required: true, disabled: false, visible: true, meta: {} },
      ]
    },
    {
      id: 'step-4',
      title: 'Etapa 4: Grid de Produtos',
      fields: [
        { id: 'c1', type: 'text', label: 'Código do Produto', technicalName: 'CODIGO', group: 'g4', columnWidth: 4, required: true, disabled: false, visible: true, meta: { displayType: 'grid', gridId: 'PRODUTOS_GRID' } },
        { id: 'c2', type: 'text', label: 'Descrição', technicalName: 'DESC_PROD', group: 'g4', columnWidth: 4, required: true, disabled: false, visible: true, meta: { displayType: 'grid', gridId: 'PRODUTOS_GRID' } },
        { id: 'c3', type: 'currency', label: 'Preço', technicalName: 'PRECO', group: 'g4', columnWidth: 4, required: true, disabled: false, visible: true, meta: { displayType: 'grid', gridId: 'PRODUTOS_GRID' } },
      ]
    },
    { id: 'step-5', title: 'Etapa 5: Revisão Interna', fields: [] },
    { id: 'step-6', title: 'Etapa 6: Aprovação Gerencial', fields: [] },
    { id: 'step-7', title: 'Etapa 7: Orçamento Final', fields: [] },
    { id: 'step-8', title: 'Etapa 8: Faturamento', fields: [] }
  ]
};

const initialState: FormState = {
  schema: INITIAL_SCHEMA,
  activeStepId: 'step-1',
  selectedFieldId: null,
  selectedGroupId: null,
  fieldPropertiesModalFieldId: null,
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
      state.selectedGroupId = null;
    },
    addStep: (state, action: PayloadAction<FormStep>) => {
      state.schema.steps.push(action.payload);
      state.activeStepId = action.payload.id;
    },
    updateStep: (state, action: PayloadAction<{ stepId: string; updates: Partial<FormStep> }>) => {
      const step = state.schema.steps.find(s => s.id === action.payload.stepId);
      if (step) {
        Object.assign(step, action.payload.updates);
      }
    },
    removeStep: (state, action: PayloadAction<string>) => {
      state.schema.steps = state.schema.steps.filter(s => s.id !== action.payload);
      if (state.activeStepId === action.payload) {
        state.activeStepId = state.schema.steps[0]?.id || '';
      }
    },
    setSelectedFieldId: (state, action: PayloadAction<string | null>) => {
      state.selectedFieldId = action.payload;
      if (action.payload) state.selectedGroupId = null;
    },
    setSelectedGroupId: (state, action: PayloadAction<string | null>) => {
        state.selectedGroupId = action.payload;
        if (action.payload) {
          state.selectedFieldId = null;
          state.fieldPropertiesModalFieldId = null;
        }
    },
    setFieldPropertiesModalFieldId: (state, action: PayloadAction<string | null>) => {
      state.fieldPropertiesModalFieldId = action.payload;
    },
    updateField: (state, action: PayloadAction<{ fieldId: string; updates: Partial<FormField> }>) => {
      const { fieldId, updates } = action.payload;
      
      const updateRecursive = (fields: FormField[]) => {
        for (let i = 0; i < fields.length; i++) {
          if (fields[i].id === fieldId) {
            fields[i] = { ...fields[i], ...updates };
            return true;
          }
          if (fields[i].children && updateRecursive(fields[i].children!)) {
            return true;
          }
        }
        return false;
      };

      for (const step of state.schema.steps) {
        if (updateRecursive(step.fields)) break;
      }
    },
    removeField: (state, action: PayloadAction<string>) => {
      const fieldId = action.payload;
      
      const removeRecursive = (fields: FormField[]) => {
        return fields.filter(f => {
          if (f.id === fieldId) return false;
          if (f.children) f.children = removeRecursive(f.children);
          return true;
        });
      };

      for (const step of state.schema.steps) {
        step.fields = removeRecursive(step.fields);
      }
      
      if (state.selectedFieldId === fieldId) {
        state.selectedFieldId = null;
      }
    },
    addField: (state, action: PayloadAction<{ stepId: string; field: FormField; parentId?: string }>) => {
      const { stepId, field, parentId } = action.payload;
      const step = state.schema.steps.find(s => s.id === stepId);
      if (!step) return;

      if (parentId) {
        const findAndAdd = (fields: FormField[]) => {
          for (const f of fields) {
            if (f.id === parentId) {
              if (!f.children) f.children = [];
              f.children.push(field);
              return true;
            }
            if (f.children && findAndAdd(f.children)) return true;
          }
          return false;
        };
        findAndAdd(step.fields);
      } else {
        step.fields.push(field);
      }
    },
    duplicateField: (state, action: PayloadAction<{ fieldId: string }>) => {
      const fieldId = action.payload.fieldId;
      let fieldToDuplicate: FormField | null = null;
      let stepOfField: FormStep | null = null;

      const findRecursive = (fields: FormField[], step: FormStep) => {
        for (const f of fields) {
          if (f.id === fieldId) {
            fieldToDuplicate = JSON.parse(JSON.stringify(f));
            stepOfField = step;
            return true;
          }
          if (f.children && findRecursive(f.children, step)) return true;
        }
        return false;
      };

      for (const step of state.schema.steps) {
        if (findRecursive(step.fields, step)) break;
      }

      if (fieldToDuplicate && stepOfField) {
        const newField = { 
          ...(fieldToDuplicate as FormField), 
          id: `f-${Date.now()}`,
          technicalName: `${(fieldToDuplicate as FormField).technicalName}_COPY`
        };
        (stepOfField as FormStep).fields.push(newField);
      }
    },
    addGroup: (state, action: PayloadAction<FormGroup>) => {
        if (!state.schema.groups) state.schema.groups = [];
        state.schema.groups.push(action.payload);
        state.selectedGroupId = action.payload.id;
        state.selectedFieldId = null;
    },
    updateGroup: (state, action: PayloadAction<{ id: string; updates: Partial<FormGroup> }>) => {
        const group = state.schema.groups?.find(g => g.id === action.payload.id);
        if (group) {
          Object.assign(group, action.payload.updates);
        }
    },
    removeGroup: (state, action: PayloadAction<string>) => {
        const groupId = action.payload;
        // 1. Remove the group itself
        state.schema.groups = state.schema.groups?.filter(g => g.id !== groupId) || [];
        
        // 2. Remove all fields associated with this group across all steps
        for (const step of state.schema.steps) {
          step.fields = step.fields.filter(f => f.group !== groupId);
        }

        // 3. Cleanup selections
        if (state.selectedGroupId === groupId) {
          state.selectedGroupId = null;
        }
    },
    moveFieldToIndex: (state, action: PayloadAction<{ fieldId: string; newIndex: number }>) => {
      const { fieldId, newIndex } = action.payload;
      const step = state.schema.steps.find(s => s.id === state.activeStepId);
      if (!step) return;

      let activeField: FormField | null = null;
      const removeRecursive = (fields: FormField[]): FormField[] => {
        return fields.filter(f => {
          if (f.id === fieldId) {
            activeField = f;
            return false;
          }
          if (f.children) f.children = removeRecursive(f.children);
          return true;
        });
      };

      const newFields = removeRecursive(step.fields);
      if (!activeField) return;

      newFields.splice(newIndex, 0, activeField);
      step.fields = newFields;
    }
  }
});

export const { 
  setSchema, 
  setActiveStep, 
  addStep, 
  updateStep,
  removeStep,
  setSelectedFieldId, 
  setSelectedGroupId,
  setFieldPropertiesModalFieldId,
  updateField, 
  removeField, 
  addField, 
  duplicateField,
  addGroup,
  updateGroup,
  removeGroup,
  moveFieldToIndex
} = formSlice.actions;

export default formSlice.reducer;
