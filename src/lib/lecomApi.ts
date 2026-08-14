import type { FormSchema } from '../types/form';
import { FormRuntime } from '../utils/formRuntime';

/**
 * API JS do Lecom (Javascript_Formulario_API_JS_API_JS_550_v1.04)
 *
 * Expõe os objetos globais usados pelos scripts de formulário:
 *  - ProcessData  -> dados do processo (id, versão, instância, etapa, ciclo)
 *  - Form         -> acesso a campos e grids (value/visible/disabled/subscribe)
 *  - JSPadrao     -> utilitários de validação (adicionaErro)
 *
 * A implementação roda sobre o FormRuntime (proxy) para funcionar no preview,
 * mas mantém a MESMA assinatura da API real do Lecom.
 */

export interface LecomProcessData {
  processId: string | number;
  version: string | number;
  processInstanceId: string | number;
  activityInstanceId: string | number;
  cycle: string | number;
}

export interface LecomFieldHandle {
  value(val?: unknown): unknown;
  visible(vis?: boolean): LecomFieldHandle;
  disabled(dis?: boolean): LecomFieldHandle;
  label(lab?: string): LecomFieldHandle;
  apply(): Promise<void>;
  subscribe(event: string, cb: (...args: unknown[]) => void): void;
  onChange(cb: (...args: unknown[]) => void): void;
  onBlur(cb: (...args: unknown[]) => void): void;
  setRequired(required: boolean): LecomFieldHandle;
  setVisible(vis: boolean): LecomFieldHandle;
}

export interface LecomGridHandle {
  visible(vis?: boolean): LecomGridHandle;
  fields(campoId?: string): unknown;
  apply(): Promise<void>;
}

export interface LecomForm {
  fields(idOrName?: string): unknown;
  grids(nome?: string): unknown;
  subscribe(event: string, cb: (...args: unknown[]) => void): void;
  apply(): Promise<void>;
}

export interface JSPadraoErrorOptions {
  campo?: { id: string; technicalName?: string };
  [key: string]: any;
}

export interface LecomGlobals {
  Form: LecomForm;
  ProcessData: LecomProcessData;
  JSPadrao: {
    adicionaErro(campo: JSPadraoErrorOptions | any, mensagem: string, exibir?: boolean): void;
    removeErro(campo: any): void;
    validaCNPJ(config: { campo: string; grid?: string; mensagem?: string }): boolean;
  };
}

/** Nome lógico do campo referenciado (config.campo ou o objeto do campo). */
function campoKey(campo: any): string {
  if (!campo) return '';
  if (typeof campo === 'string') return campo;
  return campo.campo ?? campo.id ?? campo.technicalName ?? '';
}

/** Preenche os globais com os metadados do schema (quando o runtime não informa valores reais). */
export function buildProcessData(schema: FormSchema, overrides: Partial<LecomProcessData> = {}): LecomProcessData {
  // activityInstanceId é usado pelos scripts como codEtapa em switch com constantes numéricas
  // (ex.: Etapa.SOLICITAR_ANALISE_DO_FORNECEDOR = 1). No Lecom real o valor é numérico.
  const activityInstanceId =
    overrides.activityInstanceId === undefined || overrides.activityInstanceId === ''
      ? ''
      : Number(overrides.activityInstanceId);
  return {
    processId: overrides.processId ?? schema.id ?? '131',
    version: overrides.version ?? 1,
    processInstanceId: overrides.processInstanceId ?? 0,
    cycle: overrides.cycle ?? 0,
    ...overrides,
    activityInstanceId,
  };
}

/**
 * Monta o objeto de globals do Lecom que os scripts enxergam.
 * O `Form` é um proxy sobre o FormRuntime; o `JSPadrao` registra erros
 * através do callback `onError` (ex.: para exibir na validação do preview).
 */
export function buildLecomGlobals(
  runtime: FormRuntime,
  schema: FormSchema,
  opts: {
    processData?: Partial<LecomProcessData>;
    onError?: (mensagem: string, campoId?: string) => void;
  } = {}
): LecomGlobals {
  const base = runtime.getProxy();

  const errors: JSPadraoErrorOptions[] = [];

  const JSPadrao = {
    adicionaErro(campo: JSPadraoErrorOptions | any, mensagem: string, exibir?: boolean) {
      const entry = { campo, mensagem, exibir };
      errors.push(entry);
      opts.onError?.(mensagem, campoKey(campo));
    },
    removeErro(campo: any) {
      const key = campoKey(campo);
      const idx = errors.findIndex(e => campoKey(e.campo) === key);
      if (idx >= 0) errors.splice(idx, 1);
    },
    validaCNPJ(config: { campo: string; grid?: string; mensagem?: string }): boolean {
      const campo = config?.campo;
      if (!campo) return true;

      const valor = (runtime.getValue(campo) ?? '').toString();
      if (valor === '') {
        JSPadrao.removeErro(config);
        return true;
      }

      const cnpj = valor.replace(/[.\-\/]/g, '');
      let erro = false;

      if (isNaN(Number(cnpj)) || cnpj.length !== 14) {
        erro = true;
      } else {
        const c = cnpj.substr(0, 12);
        const dv = cnpj.substr(12, 2);
        let d1 = 0;

        for (let i = 0; i < 12; i++) {
          d1 += Number(c.charAt(11 - i)) * (2 + (i % 8));
        }

        if (d1 === 0) {
          erro = true;
        } else {
          d1 = 11 - (d1 % 11);
          if (d1 > 9) d1 = 0;

          if (Number(dv.charAt(0)) !== d1) {
            erro = true;
          } else {
            d1 *= 2;
            for (let i = 0; i < 12; i++) {
              d1 += Number(c.charAt(11 - i)) * (2 + ((i + 1) % 8));
            }
            d1 = 11 - (d1 % 11);
            if (d1 > 9) d1 = 0;

            if (Number(dv.charAt(1)) !== d1) {
              erro = true;
            }
          }
        }
      }

      if (erro) {
        const mensagem = config?.mensagem && config.mensagem !== '' ? config.mensagem : 'CNPJ Inválido';
        JSPadrao.adicionaErro(config, mensagem, true);
        return false;
      }

      JSPadrao.removeErro(config);
      return true;
    },
    getErrors: () => [...errors],
  };

  const Form: LecomForm = {
    fields: base.fields,
    grids: (nome?: string) => {
      if (!nome) return base.fields();
      // No runtime os campos de grid são identificados por meta.gridId.
      // Retorna um handle compatível com Form.grids(nome) do Lecom.
      const gridHandle: LecomGridHandle = {
        visible: (vis?: boolean) => {
          const campos = runtime.getGridFields(nome);
          campos.forEach(c => {
            if (vis === undefined) return;
            runtime.setVisibility(c.id, vis);
          });
          if (vis !== undefined) runtime.apply();
          return gridHandle;
        },
        fields: (campoId?: string) => {
          const campos = runtime.getGridFields(nome);
          if (!campoId) {
            return campos.map(c => ({ id: c.id, get value() { return runtime.getValue(c.id); } }));
          }
          return {
            id: campoId,
            setRequired: (required: boolean) => {
              runtime.setRequired(campoId, required);
              return runtime.getFieldHandle(campoId);
            },
            visible: (vis: boolean) => {
              runtime.setVisibility(campoId, vis);
              return runtime.getFieldHandle(campoId);
            },
          };
        },
        apply: () => runtime.apply(),
      };
      return gridHandle;
    },
    subscribe: base.subscribe,
    apply: base.apply,
  };

  return {
    Form,
    ProcessData: buildProcessData(schema, opts.processData),
    JSPadrao,
  };
}

/**
 * Executa um script de formulário com os globals do Lecom disponíveis.
 * Retorna o resultado (ex.: o objeto definido pelo script, se houver).
 */
export function runFormScript(script: string, globals: LecomGlobals): any {
  // O script referencia os globals por nome (Form, ProcessData, JSPadrao, $)
  const sandbox = `
    var Form = arguments[0];
    var ProcessData = arguments[1];
    var JSPadrao = arguments[2];
    var $ = arguments[3];
    return (function() { ${script} })();
  `;
  const fn = new Function(sandbox);
  const jqueryShim = (() => {
    const ready = (cb: Function) => cb();
    const shim = (target: unknown) => {
      void target;
      return { ready };
    };
    shim.ready = ready;
    return shim;
  })();
  return fn(globals.Form, globals.ProcessData, globals.JSPadrao, jqueryShim);
}