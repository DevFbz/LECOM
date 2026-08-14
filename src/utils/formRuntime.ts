import type { FormField, FormSchema } from '../types/form';

export class FormRuntime {
  private schema: FormSchema;
  private values: Record<string, any>;
  private visibility: Record<string, boolean>;
  private disabled: Record<string, boolean>;
  private labels: Record<string, string>;
  private required: Record<string, boolean> = {};
  private listeners: Record<string, Function[]>;
  private onStateChange: (state: any) => void;
  private nameToIdMap: Record<string, string> = {};

  constructor(schema: FormSchema, initialValues: Record<string, any>, onStateChange: (state: any) => void) {
    this.schema = schema;
    this.values = { ...initialValues };
    this.visibility = {};
    this.disabled = {};
    this.labels = {};
    this.listeners = {};
    this.onStateChange = onStateChange;

    // Initialize state from schema
    this.initRecursive(this.schema.steps.flatMap(s => s.fields));
  }

  private initRecursive(fields: FormField[]) {
    fields.forEach(f => {
      this.visibility[f.id] = f.visible !== false;
      this.disabled[f.id] = f.disabled === true;
      this.labels[f.id] = f.label;
      if (f.technicalName) {
        this.nameToIdMap[f.technicalName] = f.id;
      }
      if (f.children) this.initRecursive(f.children);
    });
  }

  private resolveId(idOrName: string): string {
    return this.nameToIdMap[idOrName] || idOrName;
  }

  public getProxy() {
    const self = this;
    return {
      fields: (idOrName?: string) => {
        if (!idOrName) {
          return self.schema.steps.flatMap(s => s.fields.map(f => f.id));
        }
        
        const id = self.resolveId(idOrName);

        return {
          value: (val?: any) => {
            if (val === undefined) return self.values[id];
            self.values[id] = val;
            return self.getProxy().fields(idOrName);
          },
          visible: (vis?: boolean) => {
            if (vis === undefined) return self.visibility[id];
            self.visibility[id] = vis;
            return self.getProxy().fields(idOrName);
          },
          disabled: (dis?: boolean) => {
            if (dis === undefined) return self.disabled[id];
            self.disabled[id] = dis;
            return self.getProxy().fields(idOrName);
          },
          label: (lab?: string) => {
            if (lab === undefined) return self.labels[id];
            self.labels[id] = lab || '';
            return self.getProxy().fields(idOrName);
          },
          readOnly: (ro?: boolean) => {
            if (ro === undefined) return self.disabled[id];
            self.disabled[id] = ro === true;
            return self.getProxy().fields(idOrName);
          },
          setVisible: (vis: boolean) => {
            self.setVisibility(id, vis);
            return self.getProxy().fields(idOrName);
          },
          setRequired: (typeOrRequired: any, required?: any) => {
            const req = typeof required === 'boolean' ? required : !!typeOrRequired;
            self.setRequired(id, req);
            return self.getProxy().fields(idOrName);
          },
          apply: () => {
            self.onStateChange({
              values: { ...self.values },
              visibility: { ...self.visibility },
              disabled: { ...self.disabled },
              labels: { ...self.labels }
            });
            return Promise.resolve();
          },
          subscribe: (event: string, cb: Function) => {
            const key = `field:${id}:${event}`;
            if (!self.listeners[key]) self.listeners[key] = [];
            self.listeners[key].push(cb);
          }
        };
      },
      subscribe: (event: string, cb: Function) => {
        if (!self.listeners[event]) self.listeners[event] = [];
        self.listeners[event].push(cb);
      },
      apply: () => {
        self.onStateChange({
          values: { ...self.values },
          visibility: { ...self.visibility },
          disabled: { ...self.disabled },
          labels: { ...self.labels }
        });
        return Promise.resolve();
      }
    };
  }

  public triggerEvent(event: string, ...args: any[]) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(...args));
    }
  }

  public triggerFieldEvent(idOrName: string, event: string, ...args: any[]) {
    const id = this.resolveId(idOrName);
    const key = `field:${id}:${event}`;
    if (this.listeners[key]) {
      this.listeners[key].forEach(cb => cb(...args));
    }
  }

  // ---- Métodos de suporte à API JS do Lecom (usados pelo lecomApi.ts) ----

  public getValue(idOrName: string): any {
    return this.values[this.resolveId(idOrName)];
  }

  public getFieldHandle(idOrName: string) {
    const proxy = this.getProxy();
    return proxy.fields(idOrName);
  }

  public setVisibility(idOrName: string, vis: boolean) {
    this.visibility[this.resolveId(idOrName)] = vis;
  }

  public setRequired(idOrName: string, required: boolean) {
    const id = this.resolveId(idOrName);
    // Marca a exigência no próprio schema quando possível
    const field = this.findField(id);
    if (field) field.required = required;
    this.required = { ...(this.required || {}), [id]: required };
  }

  public apply() {
    this.onStateChange({
      values: { ...this.values },
      visibility: { ...this.visibility },
      disabled: { ...this.disabled },
      labels: { ...this.labels },
      required: { ...(this.required || {}) },
    });
    return Promise.resolve();
  }

  public getGridFields(gridId: string): FormField[] {
    const all = this.schema.steps.flatMap(s => s.fields);
    return all.filter(f => f.meta?.gridId === gridId);
  }

  private findField(id: string): FormField | null {
    const walk = (fields: FormField[]): FormField | null => {
      for (const f of fields) {
        if (f.id === id) return f;
        if (f.children) {
          const found = walk(f.children);
          if (found) return found;
        }
      }
      return null;
    };
    for (const step of this.schema.steps) {
      const found = walk(step.fields);
      if (found) return found;
    }
    return null;
  }
}
