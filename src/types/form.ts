export type FieldType =
  | 'text'          // Linha de texto
  | 'textarea'      // Caixa de texto
  | 'integer'       // Inteiro
  | 'decimal'       // Número decimal
  | 'currency'      // Monetário
  | 'date'          // Data
  | 'list'          // Lista
  | 'icon_button'   // Botão gráfico
  | 'app_button'    // Botão de aplicação
  | 'template'      // Template
  | 'label'         // Label
  | 'radio'         // Radio button
  | 'checkbox'      // Checkbox
  | 'number'        // (Legacy)
  | 'email'         // (Legacy)
  | 'select'        // (Legacy/Mapped to list)
  | 'grid'          // Grid container
  | 'upload'        // File upload
  | 'autocomplete'  // Autocomplete
  | 'divider'       // Divider
  | 'title'         // Title
  | 'group';        // Group container

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  technicalName?: string; // Nome []
  placeholder?: string;
  required: boolean;
  disabled: boolean;
  visible: boolean;
  columnWidth: number;
  position?: number;
  group?: string; // Agrupadores
  children?: FormField[];
  meta: {
    scripts?: string;
    options?: { label: string; value: string }[];
    apiEndpoint?: string;
    helperText?: string;
    min?: number;
    max?: number;
    displayType?: 'normal' | 'repetition' | 'grid';
    gridId?: string;
    mask?: string;
    showInSearch?: boolean;
    isPersonalSensitive?: boolean;
    accessRestricted?: boolean;
    lineBreak?: string;
    size?: number;
  };
}

export interface FormStep {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormGroup {
  id: string;
  name: string;
}

export interface FormSchema {
  id: string;
  title: string;
  steps: FormStep[];
  script?: string; // JavaScript custom scripts
  groups?: FormGroup[]; // Agrupadores de campos
}
