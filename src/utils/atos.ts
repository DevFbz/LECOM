import JSZip from 'jszip';
import type { FieldType, FormField, FormGroup, FormSchema, FormStep } from '../types/form';

/**
 * Utilitários de importação/exportação do formato .atos do Lecom Studio.
 *
 * O .atos é um arquivo ZIP contendo XMLs com prefixo "modelo_<uuid>_0_".
 * Principais arquivos:
 *  - F.xml                    : FormDTO (metadados do formulário + diagrama)
 *  - C.xml                    : lista de CampoVO (campos)
 *  - E.xml                    : lista de PhaseDTO (etapas)
 *  - EC__1.xml / EC__2.xml    : lista de EtapaCampoVO (campo x etapa)
 *  - Fields_Groupings.xml     : agrupadores (groups)
 *  - ProcessDefinitions_Importer_List.xml : referência do processo
 *  - demais XMLs de apoio (PLATFORM, Banco, Phases, FD, FG, FU, ECL, Tem, AccProfile, LF, RC, EtapaJavascripts)
 */

export interface AtosMeta {
  codForm: number;
  codVersao: number;
  title: string;
  tableName: string;
  uuid: string;
}

const IDETIPO_TO_FIELDTYPE: Record<string, FieldType> = {
  S: 'text',
  T: 'textarea',
  I: 'integer',
  M: 'currency',
  D: 'date',
  L: 'list',
  C: 'checkbox',
  E: 'label',
  F: 'upload',
};

const FIELDTYPE_TO_IDETIPO: Record<string, string> = {
  text: 'S',
  textarea: 'T',
  integer: 'I',
  decimal: 'M',
  currency: 'M',
  date: 'D',
  list: 'L',
  select: 'L',
  radio: 'L',
  checkbox: 'C',
  label: 'E',
  upload: 'F',
  template: 'F',
};

function esc(s: string | number | boolean | undefined | null): string {
  return String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function newUuid(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const XSI_NIL = ' xsi:nil="true"';
void XSI_NIL;

function campoVOXml(field: FormField, codCampo: number, ordem: number, meta: AtosMeta): string {
  const tipo = FIELDTYPE_TO_IDETIPO[field.type] || 'S';
  const tamanho =
    field.type === 'text' ? 40
    : field.type === 'textarea' ? 4
    : field.type === 'integer' ? 5
    : field.type === 'currency' ? 10
    : 0;
  return [
    '<beans.CampoVO>',
    `<id><codCampo>${codCampo}</codCampo><codForm>${meta.codForm}</codForm><codVersao>${meta.codVersao}</codVersao></id>`,
    '<altura>0</altura>',
    '<codArquivo>0</codArquivo>',
    '<codCampoPai>0</codCampoPai>',
    `<desAjuda>${esc(field.meta.helperText || '')}</desAjuda>`,
    `<desLabel>${esc(field.label)}</desLabel>`,
    `<desNome>${esc(field.technicalName || field.id)}</desNome>`,
    `<idAgrupamentoGrid>${esc(field.meta.gridId || '')}</idAgrupamentoGrid>`,
    '<ideCampoEspecial>N</ideCampoEspecial>',
    '<ideCampoRepeticaoBloco>0</ideCampoRepeticaoBloco>',
    `<ideMascara>${field.meta.mask ? 'S' : 'N'}</ideMascara>`,
    '<idePesquisavel>N</idePesquisavel>',
    '<ideRepeticao>N</ideRepeticao>',
    '<ideResultado>N</ideResultado>',
    '<ideStatus>A</ideStatus>',
    `<ideTipo>${tipo}</ideTipo>`,
    '<largura>0</largura>',
    '<numColunas>0</numColunas>',
    '<numGrupo>0</numGrupo>',
    `<numIndice>${ordem}</numIndice>`,
    '<numLinhaGrupo>0</numLinhaGrupo>',
    `<numOrdem>${ordem}</numOrdem>`,
    '<numRepeticao>0</numRepeticao>',
    `<numTamanho>${tamanho}</numTamanho>`,
    '<prefixo></prefixo>',
    '<quebraLinha>N</quebraLinha>',
    '<fontColor>000000</fontColor>',
    '<backgroundColor>ffffff</backgroundColor>',
    field.meta.mask ? `<mask>${esc(field.meta.mask)}</mask>` : '',
    '<valueWhenChecked>[null]</valueWhenChecked>',
    '<history>false</history>',
    '<sensivel>false</sensivel>',
    '<allowsSummary>false</allowsSummary>',
    '</beans.CampoVO>',
  ].join('');
}

function buildCXml(fields: FormField[], meta: AtosMeta): string {
  const body = fields.map((f, i) => campoVOXml(f, i + 1, i + 1, meta)).join('');
  return `<list>${body}</list>`;
}

function listOptionsToVlrValor(options?: { label: string; value: string }[]): string {
  if (!options || options.length === 0) return '';
  return options.map(o => `;${o.value}`).join('\n');
}

function ideStatusFromPresentation(presentation: string | undefined): { ideStatus: string; ideObrigaAprovaRejeita: string } {
  switch (presentation) {
    case 'Somente leitura':
    case 'Bloqueado':
      return { ideStatus: 'B', ideObrigaAprovaRejeita: '' };
    case 'Bloqueado - Obrigatório':
      return { ideStatus: 'B', ideObrigaAprovaRejeita: 'A' };
    case 'Obrigatório':
      return { ideStatus: 'C', ideObrigaAprovaRejeita: 'A' };
    case 'Invisível':
    case 'Oculto':
      return { ideStatus: 'O', ideObrigaAprovaRejeita: '' };
    default:
      return { ideStatus: 'C', ideObrigaAprovaRejeita: '' };
  }
}

function buildECXml(steps: FormStep[], fields: FormField[], meta: AtosMeta): string {
  const rows: string[] = [];

  steps.forEach((step, stepIdx) => {
    const codEtapa = stepIdx + 1;
    step.fields.forEach(field => {
      const codCampo = fields.findIndex(f => f.id === field.id) + 1;
      if (codCampo <= 0) return;
      const presentation = field.stepProperties?.[step.id]?.presentation || 'Normal';
      if (presentation === 'Invisível' || presentation === 'Oculto') return;

      const { ideStatus, ideObrigaAprovaRejeita } = ideStatusFromPresentation(presentation);
      const vlrValor = field.type === 'list' || field.type === 'select' || field.type === 'radio'
        ? listOptionsToVlrValor(field.meta.options)
        : '';

      rows.push([
        '<beans.EtapaCampoVO>',
        `<id><codCampo>${codCampo}</codCampo><codEtapa>${codEtapa}</codEtapa><codForm>${meta.codForm}</codForm><codVersao>${meta.codVersao}</codVersao></id>`,
        '<codigoGrafico>0</codigoGrafico>',
        '<ideAplicacaoExterna>N</ideAplicacaoExterna>',
        '<ideInicializa>C</ideInicializa>',
        '<ideLupa>N</ideLupa>',
        `<ideObrigaAprovaRejeita>${ideObrigaAprovaRejeita}</ideObrigaAprovaRejeita>`,
        '<ideReexecutar>N</ideReexecutar>',
        '<ideRefresh>N</ideRefresh>',
        `<ideStatus>${ideStatus}</ideStatus>`,
        '<relacao></relacao>',
        vlrValor ? `<vlrValor>${esc(vlrValor)}</vlrValor>` : '',
        '<ideAssociar>N</ideAssociar>',
        '<sendByEmail>false</sendByEmail>',
        '<listaEtapaCampoLupa />',
        '<listaEtapaCampoRefresh />',
        '<documentSummaryEnabled>false</documentSummaryEnabled>',
        '</beans.EtapaCampoVO>',
      ].join(''));
    });
  });

  return `<list>${rows.join('')}</list>`;
}

function aliasFromTitle(title: string): string {
  return title.trim().toUpperCase().replace(/\s+/g, '_').replace(/[^A-Z0-9_]/g, '');
}

function phaseDTOXml(step: FormStep, stepIdx: number, total: number, meta: AtosMeta): string {
  const alias = aliasFromTitle(step.title);
  const nextAlias = stepIdx < total - 1 ? aliasFromTitle(meta.title) : '';
  const next = stepIdx < total - 1 ? meta.title : '';
  const diagramId = 100;
  const routing = JSON.stringify([
    {
      id: String(diagramId),
      nome: '',
      roteamentos: [
        {
          id: String(diagramId),
          etapas: nextAlias ? [{ id: String(diagramId), etapa: next, responsavel: '' }] : [],
        },
      ],
      tipo: 'TAREFA',
      acao: 'APROVACAO',
    },
  ]);

  return [
    '<br.com.lecom.workflow.exportacaoimportacao.phase.dto.PhaseDTO>',
    `<phaseId>${stepIdx + 1}</phaseId>`,
    `<formId>${meta.codForm}</formId>`,
    `<version>${meta.codVersao}</version>`,
    '<phaseTypeId>1</phaseTypeId>',
    '<rejectUrlId>0</rejectUrlId>',
    `<alias>${esc(alias)}</alias>`,
    '<approveLabel>Aprovar</approveLabel>',
    '<rejectLabel></rejectLabel>',
    `<approveRoute>${next ? `SEGUE_ETAPA(${esc(aliasFromTitle(next))})` : 'FINISH_PROCESS'}</approveRoute>`,
    '<warning>N</warning>',
    '<delayWarning>N</delayWarning>',
    '<leaderWarning>N</leaderWarning>',
    '<ideConcentrating>N</ideConcentrating>',
    '<mailFormat>H</mailFormat>',
    '<mailType>C</mailType>',
    `<phaseTitle>${esc(step.title)}</phaseTitle>`,
    '<alertValue>0</alertValue>',
    '<delayValue1>0</delayValue1>',
    '<delayValue2>0</delayValue2>',
    '<delayValueOwner>0</delayValueOwner>',
    '<hibernationValue>0</hibernationValue>',
    '<ownerTimeLimitValue>0</ownerTimeLimitValue>',
    `<diagramId>${diagramId}</diagramId>`,
    '<typeExecution>MANUAL</typeExecution>',
    '<loop>false</loop>',
    '<script>false</script>',
    '<listFunctionDTO />',
    '<listGroupDTO />',
    '<listDepartmentDTO />',
    '<routingType>I</routingType>',
    '<routingAlias></routingAlias>',
    '<warningTextFinalPhaseApproved></warningTextFinalPhaseApproved>',
    '<warningTextFinalPhaseRejected></warningTextFinalPhaseRejected>',
    '<warningTextPhaseExecutionApprove></warningTextPhaseExecutionApprove>',
    '<warningTextPhaseExecutionReject></warningTextPhaseExecutionReject>',
    '<idePDFApprove>N</idePDFApprove>',
    '<idePDFReject>N</idePDFReject>',
    '<ideMailLink>N</ideMailLink>',
    '<ideAttachGridMail>N</ideAttachGridMail>',
    '<typePhaseExecutionApprove>PADRAO</typePhaseExecutionApprove>',
    '<typePhaseExecutionReject>PADRAO</typePhaseExecutionReject>',
    `<routing>${esc(routing)}</routing>`,
    '<scalingType></scalingType>',
    '<codScaling></codScaling>',
    '<scalingValue>0</scalingValue>',
    '<listUsersDTO />',
    '</br.com.lecom.workflow.exportacaoimportacao.phase.dto.PhaseDTO>',
  ].join('');
}

function buildEXml(steps: FormStep[], meta: AtosMeta): string {
  const body = steps.map((s, i) => phaseDTOXml(s, i, steps.length, meta)).join('');
  return `<list>${body}</list>`;
}

function buildDiagram(steps: FormStep[], title: string): string {
  const height = Math.max(160, steps.length * 80 + 160);
  const cells: string[] = [
    '<mxCell id="0"/>',
    '<mxCell id="1" parent="0"/>',
    `<mxCell id="2" value="${esc(title)}" style="lane" parent="1" vertex="1"><mxGeometry x="50" y="32" width="1200" height="${height}" as="geometry"/></mxCell>`,
    `<mxCell id="3" value="Fluxo" style="lane" parent="2" vertex="1"><mxGeometry x="22" width="1178" height="${height - 60}" as="geometry"/></mxCell>`,
  ];

  // start event
  cells.push('<mxCell id="100" style="start-event" parent="3" vertex="1"><mxGeometry x="58" y="50" width="32" height="32" as="geometry"/></mxCell>');

  // tasks
  steps.forEach((s, i) => {
    cells.push(
      `<mxCell id="${200 + i}" value="${esc(s.title)}" style="task" parent="3" vertex="1"><mxGeometry x="${80 + i * 180}" y="50" width="160" height="60" as="geometry"/></mxCell>`
    );
  });

  // end event
  const lastX = 80 + steps.length * 180;
  cells.push(`<mxCell id="500" style="end-event" parent="3" vertex="1"><mxGeometry x="${lastX}" y="64" width="32" height="32" as="geometry"/></mxCell>`);

  // edges start->task1, taskN->taskN+1, lastTask->end
  if (steps.length > 0) {
    cells.push('<mxCell id="101" style="" parent="3" source="100" target="200" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>');
    for (let i = 0; i < steps.length - 1; i++) {
      cells.push(`<mxCell id="${300 + i}" style="" parent="3" source="${200 + i}" target="${201 + i}" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>`);
    }
    cells.push(`<mxCell id="501" style="" parent="3" source="${200 + steps.length - 1}" target="500" edge="1"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  }

  return `<mxGraphModel><root>${cells.join('')}</root></mxGraphModel>`;
}

function buildFXml(schema: FormSchema, meta: AtosMeta): string {
  const diagram = buildDiagram(schema.steps, meta.title);
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  return [
    '<br.com.lecom.workflow.exportacaoimportacao.form.dto.FormDTO>',
    '<managerUsers><string>adm</string></managerUsers>',
    `<diagramDTO><currentDiagram>${esc(diagram)}</currentDiagram></diagramDTO>`,
    `<codForm>${meta.codForm}</codForm>`,
    `<version>${meta.codVersao}</version>`,
    `<updateDate class="sql-timestamp">${now}</updateDate>`,
    '<help> </help>',
    '<file></file>',
    '<description></description>',
    `<tableName>${esc(meta.tableName)}</tableName>`,
    '<subheading></subheading>',
    `<title>${esc(meta.title)}</title>`,
    '<testEmail></testEmail>',
    '<ideModified> </ideModified>',
    '<idePresentation>E</idePresentation>',
    '<ideBetaTest>S</ideBetaTest>',
    '<ideStatus>R</ideStatus>',
    '<ideView> </ideView>',
    '<newForm>S</newForm>',
    '<requiredType>L</requiredType>',
    '<owner>adm</owner>',
    '<allowedUsers class="java.util.Arrays$ArrayList"><a class="string-array"><string>adm</string></a></allowedUsers>',
    '<favorite>false</favorite>',
    `<uuid>${meta.uuid}</uuid>`,
    '<modelType>DIAGRAMA_WEB_V1</modelType>',
    `<creationDate class="sql-timestamp">${now}</creationDate>`,
    '<listUserDTO>',
    '<br.com.lecom.workflow.exportacaoimportacao.user.dto.UserDTO>',
    '<login>adm</login>',
    '<name>Administrador</name>',
    `<locationDTO><place>FORM</place><detail>${esc(meta.title)}</detail></locationDTO>`,
    '</br.com.lecom.workflow.exportacaoimportacao.user.dto.UserDTO>',
    '</listUserDTO>',
    '</br.com.lecom.workflow.exportacaoimportacao.form.dto.FormDTO>',
  ].join('');
}

function buildFieldsGroupings(groups: FormGroup[] | undefined, fields: FormField[]): string {
  if (!groups || groups.length === 0) return '<linked-list></linked-list>';
  const maps = groups
    .map((g, idx) => {
      const fieldNames = fields.filter(f => f.group === g.id).map(f => f.technicalName || f.id);
      const entries = [
        '<entry><string>name</string><string>' + esc(g.name) + '</string></entry>',
        '<entry><string>identifier</string><string>' + esc(g.id) + '</string></entry>',
        '<entry><string>expansible</string><boolean>true</boolean></entry>',
        '<entry><string>position</string><long>' + (idx + 1) + '</long></entry>',
        '<entry><string>fields</string><set>' +
          fieldNames.map(n => '<string>' + esc(n) + '</string>').join('') +
          '</set></entry>',
      ];
      return '<linked-hash-map>' + entries.join('') + '</linked-hash-map>';
    })
    .join('');
  return '<linked-list>' + maps + '</linked-list>';
}

function buildProcessDefinitions(meta: AtosMeta): string {
  return [
    '<linked-list><map>',
    `<entry><string>processId</string><short>${meta.codForm}</short></entry>`,
    `<entry><string>title</string><string>${esc(meta.title)}</string></entry>`,
    `<entry><string>version</string><short>${meta.codVersao}</short></entry>`,
    `<entry><string>uuid</string><string>${meta.uuid}</string></entry>`,
    '<entry><string>order</string><int>0</int></entry>',
    `<entry><string>tableName</string><string>${esc(meta.tableName)}</string></entry>`,
    '</map></linked-list>',
  ].join('');
}

function buildSupportFiles(meta: AtosMeta): Record<string, string> {
  return {
    PLATFORM: '<br.com.lecom.workflow.exportacaoimportacao.dto.PlatformDTO>\n  <version>6.0</version>\n  <build>1.00</build>\n  <revision>6</revision>\n</br.com.lecom.workflow.exportacaoimportacao.dto.PlatformDTO>',
    Phases: '<list/>',
    ECL: '<list/>',
    Banco: '<list>\n  <br.com.lecom.workflow.exportacaoimportacao.database.dto.DatabaseDTO>\n    <databaseId>1</databaseId>\n    <fileName>encrypted</fileName>\n    <databaseName>WorkFlow</databaseName>\n    <databaseType>3</databaseType>\n    <query>SELECT * FROM INFO</query>\n    <exportOwnerUser>adm</exportOwnerUser>\n    <exportAllowedUsers></exportAllowedUsers>\n    <listUsersDTO>\n      <br.com.lecom.workflow.exportacaoimportacao.user.dto.UserDTO>\n        <login>adm</login>\n        <name>Administrador</name>\n        <locationDTO><place>DATABASE</place><detail>WorkFlow</detail></locationDTO>\n      </br.com.lecom.workflow.exportacaoimportacao.user.dto.UserDTO>\n    </listUsersDTO>\n  </br.com.lecom.workflow.exportacaoimportacao.database.dto.DatabaseDTO>\n</list>',
    FD: `<list>\n  <br.com.lecom.workflow.exportacaoimportacao.formdepartment.dto.FormDepartmentDTO>\n    <codDepartment>0</codDepartment>\n    <codForm>${meta.codForm}</codForm>\n    <version>${meta.codVersao}</version>\n  </br.com.lecom.workflow.exportacaoimportacao.formdepartment.dto.FormDepartmentDTO>\n</list>`,
    FG: `<list>\n  <br.com.lecom.workflow.exportacaoimportacao.formgroup.dto.FormGroupDTO>\n    <codForm>${meta.codForm}</codForm>\n    <version>${meta.codVersao}</version>\n    <alias>acesso_bpm_emefarma</alias>\n    <ideSpecialField>N</ideSpecialField>\n    <ideSearch>P</ideSearch>\n    <groupDTO>\n      <alias>acesso_bpm_emefarma</alias>\n      <description></description>\n      <name>Acesso BPM Emefarma</name>\n      <createFolder>N</createFolder>\n      <makeFolderPublic>N</makeFolderPublic>\n      <canView>false</canView>\n      <canEdit>false</canEdit>\n    </groupDTO>\n  </br.com.lecom.workflow.exportacaoimportacao.formgroup.dto.FormGroupDTO>\n</list>`,
    FU: `<list>\n  <br.com.lecom.workflow.exportacaoimportacao.formuser.dto.FormUserDTO>\n    <codForm>${meta.codForm}</codForm>\n    <version>${meta.codVersao}</version>\n    <login>adm</login>\n    <ideSpecialField>N</ideSpecialField>\n    <ideSearch>C</ideSearch>\n    <userDTO>\n      <login>adm</login>\n      <name>Administrador</name>\n      <locationDTO><place>FORM</place><detail>${esc(meta.title)}</detail></locationDTO>\n    </userDTO>\n  </br.com.lecom.workflow.exportacaoimportacao.formuser.dto.FormUserDTO>\n</list>`,
    Tem: '<list>\n  <br.com.docsys.ecm.client.dto.template.DocTemplate>\n    <id><id>1</id></id>\n    <name>Template Padrão</name>\n    <desc>Template Padrão criado pelo BPM</desc>\n    <identificador>TEMPLATE_0</identificador>\n    <fields/>\n    <categoria>\n      <br.com.docsys.ecm.client.dto.template.Categoria>\n        <id><id>1</id></id>\n        <nome>Categoria Padrão</nome>\n        <identificador>CATEGORIA_0</identificador>\n        <desc>Categoria Padrão criada pelo BPM</desc>\n        <root>true</root>\n      </br.com.docsys.ecm.client.dto.template.Categoria>\n    </categoria>\n    <pdfSignedEnabled>false</pdfSignedEnabled>\n    <allowedTypes/>\n    <maxFileSizeAllowed>50000</maxFileSizeAllowed>\n    <documentSummaryEnabled>false</documentSummaryEnabled>\n  </br.com.docsys.ecm.client.dto.template.DocTemplate>\n</list>',
    AccProfile: '<list/>',
    EtapaJavascripts: '<list/>',
    FTe: '<list/>',
    LF: '<list/>',
  };
}

function buildRC(steps: FormStep[], meta: AtosMeta): string {
  const configs = steps.map((step, i) => {
    const next = i < steps.length - 1 ? aliasFromTitle(steps[i + 1].title) : '';
    const flow = next
      ? `<flow class="br.com.lecom.processo.desenho.dominio.routing.ActivityFlowDTO"><diagramId>100</diagramId><activity class="br.com.lecom.processo.desenho.dominio.routing.ActivityDTO"><name>${esc(next)}</name><isParallel>false</isParallel><isLoop>false</isLoop><isScript>false</isScript><typeExecution>MANUAL</typeExecution></activity><valueParameterFromToDTOList /></flow>`
      : '';
    return [
      '<br.com.lecom.processo.desenho.dominio.routing.RoutingConfigDTO>',
      `<id>${i + 1}</id>`,
      '<activity class="br.com.lecom.processo.desenho.dominio.routing.ActivityDTO">',
      `<processId>${meta.codForm}</processId><activityId>${i + 1}</activityId><version>${meta.codVersao}</version>`,
      '<isParallel>false</isParallel><isLoop>false</isLoop><isScript>false</isScript><typeExecution>MANUAL</typeExecution>',
      `<title>${esc(step.title)}</title>`,
      '</activity>',
      '<name>APROVACAO</name>',
      flow,
      '<diagramId>100</diagramId>',
      '</br.com.lecom.processo.desenho.dominio.routing.RoutingConfigDTO>',
    ].join('');
  });
  return `<list>${configs.join('')}</list>`;
}

/** Monta o mapa de arquivos do .atos (nome -> conteúdo XML). */
export function buildAtosEntries(schema: FormSchema, metaOverride?: Partial<AtosMeta>): Record<string, string> {
  const resolvedCodForm = metaOverride?.codForm ?? (Number(schema.id) || 131);
  const meta: AtosMeta = {
    codForm: resolvedCodForm,
    codVersao: metaOverride?.codVersao ?? 1,
    title: metaOverride?.title ?? schema.title,
    tableName: metaOverride?.tableName ?? `f_${String(resolvedCodForm).toLowerCase()}`,
    uuid: metaOverride?.uuid ?? newUuid(),
  };

  const fields = schema.steps.flatMap(s => s.fields);
  const prefix = `modelo_${meta.uuid}_0_`;

  const files: Record<string, string> = {
    F: buildFXml(schema, meta),
    C: buildCXml(fields, meta),
    E: buildEXml(schema.steps, meta),
    'EC__1': buildECXml(schema.steps, fields, meta),
    Fields_Groupings: buildFieldsGroupings(schema.groups, fields),
    ProcessDefinitions_Importer_List: buildProcessDefinitions(meta),
    RC: buildRC(schema.steps, meta),
  };

  const support = buildSupportFiles(meta);
  for (const [name, content] of Object.entries(support)) {
    files[name] = content;
  }

  const out: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) {
    out[`${prefix}${name}.xml`] = content;
  }
  return out;
}

/** Gera um Blob .atos (ZIP) a partir de um FormSchema. */
export async function exportSchemaToAtos(schema: FormSchema, metaOverride?: Partial<AtosMeta>): Promise<Blob> {
  const entries = buildAtosEntries(schema, metaOverride);
  const zip = new JSZip();
  for (const [name, content] of Object.entries(entries)) {
    zip.file(name, content);
  }
  const blob = await zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
  return blob;
}

/* ---------------- Importação ---------------- */

interface ParsedCampo {
  codCampo: number;
  technicalName: string;
  label: string;
  tipo: string;
  mask?: string;
  helperText?: string;
  gridId?: string;
}

interface ParsedEtapa {
  phaseId: number;
  alias: string;
  title: string;
}

interface ParsedEC {
  codCampo: number;
  codEtapa: number;
  ideStatus: string;
  ideObrigaAprovaRejeita: string;
  vlrValor?: string;
}

function parseXmlText(xml: string, tag: string): string {
  const m = xml.match(new RegExp(`<${tag}>(.*?)</${tag}>`, 's'));
  return m ? m[1].trim() : '';
}

function parseECList(xml: string): ParsedEC[] {
  const items = xml.match(/<beans\.EtapaCampoVO>[\s\S]*?<\/beans\.EtapaCampoVO>/g) || [];
  return items.map(item => ({
    codCampo: Number(parseXmlText(item, 'codCampo')),
    codEtapa: Number(parseXmlText(item, 'codEtapa')),
    ideStatus: parseXmlText(item, 'ideStatus'),
    ideObrigaAprovaRejeita: parseXmlText(item, 'ideObrigaAprovaRejeita'),
    vlrValor: parseXmlText(item, 'vlrValor'),
  }));
}

function parseCampoList(xml: string): ParsedCampo[] {
  const items = xml.match(/<beans\.CampoVO>[\s\S]*?<\/beans\.CampoVO>/g) || [];
  return items.map(item => ({
    codCampo: Number(parseXmlText(item, 'codCampo')),
    technicalName: parseXmlText(item, 'desNome'),
    label: parseXmlText(item, 'desLabel'),
    tipo: parseXmlText(item, 'ideTipo'),
    mask: parseXmlText(item, 'mask') || undefined,
    helperText: parseXmlText(item, 'desAjuda') || undefined,
    gridId: parseXmlText(item, 'idAgrupamentoGrid') || undefined,
  }));
}

function parsePhaseList(xml: string): ParsedEtapa[] {
  const items = xml.match(/<br\.com\.lecom\.workflow\.exportacaoimportacao\.phase\.dto\.PhaseDTO>[\s\S]*?<\/br\.com\.lecom\.workflow\.exportacaoimportacao\.phase\.dto\.PhaseDTO>/g) || [];
  return items.map(item => ({
    phaseId: Number(parseXmlText(item, 'phaseId')),
    alias: parseXmlText(item, 'alias'),
    title: parseXmlText(item, 'phaseTitle'),
  }));
}

function parseFormXml(xml: string): { title: string; codForm: number; version: number; uuid: string; tableName: string } {
  return {
    title: parseXmlText(xml, 'title'),
    codForm: Number(parseXmlText(xml, 'codForm')),
    version: Number(parseXmlText(xml, 'version')),
    uuid: parseXmlText(xml, 'uuid'),
    tableName: parseXmlText(xml, 'tableName'),
  };
}

function vlrValorToOptions(vlrValor: string): { label: string; value: string }[] | undefined {
  if (!vlrValor) return undefined;
  return vlrValor
    .split('\n')
    .map(line => line.trim().replace(/^;/, ''))
    .filter(Boolean)
    .map(v => ({ label: v, value: v }));
}

/** Converte o conteúdo de um .atos (mapa de arquivos XML) em um FormSchema. */
export function parseAtosEntries(entries: Record<string, string>): FormSchema {
  const findFile = (suffix: string): string | undefined => {
    const key = Object.keys(entries).find(k => k.endsWith(`_${suffix}.xml`));
    return key ? entries[key] : undefined;
  };

  const fXml = findFile('F');
  const cXml = findFile('C');
  const eXml = findFile('E');
  const ec1Xml = findFile('EC__1');
  const ec2Xml = findFile('EC__2');
  const groupingsXml = findFile('Fields_Groupings');

  const formInfo = fXml ? parseFormXml(fXml) : { title: 'Processo Importado', codForm: 0, version: 1, uuid: '', tableName: '' };
  const campos = cXml ? parseCampoList(cXml) : [];
  const etapas = eXml ? parsePhaseList(eXml) : [];
  const ec = [...(ec1Xml ? parseECList(ec1Xml) : []), ...(ec2Xml ? parseECList(ec2Xml) : [])];

  // Grupos (Fields_Groupings) -> { id, name, fields[] }
  // Formato: <linked-hash-map><entry><string>name</string><string>Nome</string></entry>...
  const groups: FormGroup[] = [];
  const fieldToGroup: Record<string, string> = {};
  if (groupingsXml) {
    const maps = groupingsXml.match(/<linked-hash-map>[\s\S]*?<\/linked-hash-map>/g) || [];
    maps.forEach(m => {
      const entryKey = (key: string): string => {
        const re = new RegExp(`<entry>\\s*<string>${key}</string>\\s*<[^>]*>([\\s\\S]*?)<\\/[^>]+>\\s*</entry>`, 's');
        const mm = m.match(re);
        return mm ? mm[1].trim() : '';
      };
      const name = entryKey('name');
      const identifier = entryKey('identifier');
      const fieldsBlock = (m.match(/<entry>\s*<string>fields<\/string>\s*<set>([\s\S]*?)<\/set>\s*<\/entry>/) || [])[1] || '';
      const names = [...fieldsBlock.matchAll(/<string>(.*?)<\/string>/g)].map(x => x[1]);
      if (!name) return;
      groups.push({ id: identifier || `g${groups.length + 1}`, name });
      names.forEach(n => { fieldToGroup[n] = identifier; });
    });
  }

  const fieldsById = new Map<number, FormField>();
  campos.forEach(campo => {
    const type: FieldType = IDETIPO_TO_FIELDTYPE[campo.tipo] || 'text';
    const ecs = ec.filter(e => e.codCampo === campo.codCampo);
    const options = type === 'list' || type === 'select' || type === 'radio'
      ? vlrValorToOptions(ecs.map(e => e.vlrValor || '').join('\n'))
      : undefined;

    const field: FormField = {
      id: campo.technicalName,
      type,
      label: campo.label,
      technicalName: campo.technicalName,
      required: false,
      disabled: false,
      visible: true,
      columnWidth: 12,
      meta: {
        ...(campo.mask ? { mask: campo.mask } : {}),
        ...(campo.helperText ? { helperText: campo.helperText } : {}),
        ...(campo.gridId ? { gridId: campo.gridId, displayType: 'grid' as const } : {}),
        ...(options ? { options } : {}),
      },
    };
    const groupId = fieldToGroup[campo.technicalName];
    if (groupId) field.group = groupId;
    fieldsById.set(campo.codCampo, field);
  });

  // stepProperties por campo
  ec.forEach(e => {
    const field = fieldsById.get(e.codCampo);
    const etapa = etapas.find(ep => ep.phaseId === e.codEtapa);
    if (!field || !etapa) return;
    const stepId = String(e.codEtapa);

    let presentation = 'Normal';
    if (e.ideStatus === 'B') presentation = e.ideObrigaAprovaRejeita ? 'Bloqueado - Obrigatório' : 'Somente leitura';
    else if (e.ideStatus === 'O') presentation = 'Invisível';
    else if (e.ideObrigaAprovaRejeita === 'A') presentation = 'Obrigatório';

    if (e.ideStatus !== 'O') {
      field.required = field.required || presentation === 'Obrigatório' || presentation === 'Bloqueado - Obrigatório';
    }

    if (!field.stepProperties) field.stepProperties = {};
    field.stepProperties[stepId] = {
      presentation,
      initialization: '',
      initialValue: e.vlrValor && presentation === 'Obrigatório' ? '' : '',
    };
  });

  // Coloca cada campo na etapa em que é visível (primeira ocorrência) para o builder renderizar
  const steps: FormStep[] = etapas.map(etapa => {
    const stepId = String(etapa.phaseId);
    const visibleFields = ec.filter(e => e.codEtapa === etapa.phaseId && e.ideStatus !== 'O');
    const fieldObjs = visibleFields
      .map(e => fieldsById.get(e.codCampo))
      .filter((f): f is FormField => !!f);
    return {
      id: stepId,
      title: etapa.title,
      fields: fieldObjs,
    };
  });

  // Para cada campo, o builder espera ele instalado em pelo menos uma etapa;
  // campos sem associação são adicionados à primeira etapa.
  const installed = new Set<string>();
  steps.forEach(s => s.fields.forEach(f => installed.add(f.id)));
  const allFields = [...fieldsById.values()];
  const orphans = allFields.filter(f => !installed.has(f.id));
  if (orphans.length > 0 && steps.length > 0) {
    steps[0].fields = [...steps[0].fields, ...orphans];
  }

  return {
    id: String(formInfo.codForm || 131),
    title: formInfo.title || 'Processo Importado',
    groups: groups.length > 0 ? groups : undefined,
    steps,
    script: '',
  };
}

/** Lê um arquivo .atos (ZIP) e devolve o FormSchema correspondente. */
export async function importAtosFile(file: File): Promise<FormSchema> {
  const zip = await JSZip.loadAsync(file);
  const entries: Record<string, string> = {};
  const xmlFiles = Object.keys(zip.files).filter(k => k.endsWith('.xml') && !zip.files[k].dir);
  for (const key of xmlFiles) {
    entries[key] = await zip.files[key].async('string');
  }
  return parseAtosEntries(entries);
}

/** Aceita tanto .atos (ZIP) quanto JSON de schema. */
export async function importSchemaFile(file: File): Promise<FormSchema> {
  const name = (file.name || '').toLowerCase();
  if (name.endsWith('.atos') || name.endsWith('.zip')) {
    return importAtosFile(file);
  }
  const text = await file.text();
  const parsed = JSON.parse(text);
  if (parsed && parsed.steps) return parsed as FormSchema;
  throw new Error('Arquivo não contém um schema válido');
}