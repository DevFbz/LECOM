import type { FieldType, FormField, FormGroup, FormSchema, FormStep } from '../types/form';

/**
 * Processo 131 v1 — "Entrada de Nova Indústria"
 * Fonte: processo131v1.atos (nova configuração) + entradanovaindustria.js
 *
 * Modelo do projeto: um campo é definido UMA vez e sua visibilidade/estado
 * por etapa é controlada via stepProperties (equivalente ao EtapaCampoVO do Lecom).
 *
 * 102 campos · 28 etapas · 4 grupos exibidos (Informações de referência do chamado,
 * Informações da Solicitação, Ações e Observações, Avaliação).
 * O grupo "CAMPOS OCULTOS" (GRUPO_OCULTO) não é exibido no formulário.
 *
 * 'default' = apresentação padrão do campo em todas as etapas; 'on' = exceções por etapa.
 */

type Presentation = 'Normal' | 'Obrigatório' | 'Somente leitura' | 'Bloqueado' | 'Bloqueado - Obrigatório' | 'Invisível' | 'Oculto';

interface CampoDef {
  technicalName: string;
  label: string;
  type: FieldType;
  required?: boolean;
  group?: string;
  columnWidth?: number;
  mask?: string;
  options?: { label: string; value: string }[];
  helperText?: string;
  default?: Presentation;
  on?: Record<string, Presentation>;
}

const ETAPAS: { codEtapa: string; alias: string; title: string }[] = [
  { codEtapa: '1', alias: 'SOLICITAR_ANALISE_DO_FORNECEDOR', title: 'Solicitar análise do Fornecedor' },
  { codEtapa: '2', alias: 'CONFIRMAR_CANCELAMENTO', title: 'Confirmar cancelamento' },
  { codEtapa: '3', alias: 'AVALIAR_ATENDIMENTO', title: 'Avaliar Atendimento' },
  { codEtapa: '5', alias: 'ENVIAR_ANALISE_PARA_A_DIRETORIA', title: 'Enviar análise para a diretoria' },
  { codEtapa: '6', alias: 'REALIZAR_ANALISE_DE_MERCADO', title: 'Realizar análise de mercado' },
  { codEtapa: '7', alias: 'COMPLEMENTAR_INFORMACOES', title: 'Complementar Informações' },
  { codEtapa: '8', alias: 'CONSOLIDAR_MATERIAL_E_ENVIAR_PARA_TOMADA_DE_DECISAO', title: 'Consolidar material e enviar para tomada de decisão' },
  { codEtapa: '9', alias: 'REALIZAR_O_PRIMEIRO_PEDIDO', title: 'Realizar o primeiro pedido' },
  { codEtapa: '10', alias: 'CRIAR_PAINEL_NO_BI', title: 'Criar painél no BI' },
  { codEtapa: '11', alias: 'CADASTRAR_TRIBUTACAO_DOS_PRODUTOS', title: 'Cadastrar tributação dos produtos' },
  { codEtapa: '12', alias: 'REALIZAR_ANALISE_DE_TRIBUTOS', title: 'Realizar análise de tributos' },
  { codEtapa: '13', alias: 'TOMAR_CIENCIA_DA_MARGEM_A_SER_PRATICADA', title: 'Tomar ciência da margem a ser praticada' },
  { codEtapa: '14', alias: 'CADASTRAR_PMC_E_PF', title: 'Cadastrar PMC e PF' },
  { codEtapa: '15', alias: 'REALIZAR_ANALISE_DE_MARGEM', title: 'Realizar análise de margem' },
  { codEtapa: '16', alias: 'REALIZAR_QUALIFICACAO_DOS_DOCUMENTOS', title: 'Realizar qualificação dos documentos' },
  { codEtapa: '17', alias: 'CADASTRAR_INDUSTRIA_E_PRODUTOS', title: 'Cadastrar Indústria e Produtos' },
  { codEtapa: '18', alias: 'FINALIZAR_CADASTRO_DA_INDUSTRIA_E_PRODUTOS', title: 'Finalizar cadastro da Indústria e Produtos' },
  { codEtapa: '19', alias: 'TOMAR_CIENCIA_DA_ENTRADA_DE_NOVA_INDUSTRIA', title: 'Tomar ciência da entrada de Nova Indústria' },
  { codEtapa: '20', alias: 'TOMAR_CIENCIA_DA_COMISSAO_A_SER_PRATICADA', title: 'Tomar ciência da comissão a ser praticada' },
  { codEtapa: '21', alias: 'DEFINIR_PLANEJAMENTO_ESTRATEGICO_COMERCIAL_E_PROMOCIONAL', title: 'Definir Planejamento Estratégico, Comercial e Promocional' },
  { codEtapa: '22', alias: 'VALIDAR_MATERIAIS_E_APROVAR_LANCAMENTO', title: 'Validar Materiais e Aprovar Lançamento' },
  { codEtapa: '23', alias: 'PLANEJAR_ACOES_PARA_REDES_SOCIAIS', title: 'Planejar Ações para Redes Sociais' },
  { codEtapa: '24', alias: 'PLANEJAR_ACOES_DE_APOIO_COMERCIAL', title: 'Planejar Ações de Apoio Comercial' },
  { codEtapa: '25', alias: 'PLANEJAR_ACOES_PARA_CANAIS_DIGITAIS', title: 'Planejar Ações para Canais Digitais' },
  { codEtapa: '26', alias: 'DESENVOLVER_MATERIAIS_DE_LANCAMENTO', title: 'Desenvolver Materiais de Lançamento' },
  { codEtapa: '27', alias: 'FINALIZAR', title: 'Finalizar' },
  { codEtapa: '28', alias: 'CONCENTRAR', title: 'Concentrar' },
  { codEtapa: '29', alias: 'CONCENTRAR_ATIVIDADES_DO_MKT', title: 'Concentrar atividades do MKT' },
];

const GRUPOS: FormGroup[] = [
  { id: 'GROUP5', name: 'Informações de referência do chamado' },
  { id: 'GROUP1', name: 'Informações da Solicitação' },
  { id: 'GROUP4', name: 'Ações e Observações' },
  { id: 'GRUPO_AVALIACAO', name: 'Avaliação' },
];

const INVISIVEL: Presentation = 'Invisível';

const CAMPOS: CampoDef[] = [
  {
    technicalName: 'ETAPA_ORIGEM', label: 'ETAPA ORIGEM', type: 'text',
    columnWidth: 6,
    default: 'Normal',
    on: { '5': 'Invisível', '6': 'Invisível' },
  },
  {
    technicalName: 'MSG_ATEND', label: 'Mensagens para atendimento', type: 'label',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'OBSERVACOES', label: 'Observações', type: 'textarea',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CONVERSA_ATEND', label: 'Mensagens internas entre atendentes', type: 'label',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'OBS_INTERNAS', label: 'Observações internas para equipe de atendimento', type: 'textarea',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'LABEL_ACAO', label: 'Qual ação deseja tomar a seguir', type: 'label',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'ACAO', label: 'Ação', type: 'list',
    group: 'GROUP4',
    columnWidth: 6,
    options: [
      { label: 'Avaliar e finalizar chamado', value: 'Avaliar e finalizar chamado' },
      { label: 'Devolver para atendente - Solicitação não atendida', value: 'Devolver para atendente - Solicitação não atendida' },
      { label: 'Devolver ao solicitante para ajustes', value: 'Devolver ao solicitante para ajustes' },
      { label: 'Assumir atendimento', value: 'Assumir atendimento' },
      { label: 'Enviar para nível 2', value: 'Enviar para nível 2' },
      { label: 'Atendimento realizado', value: 'Atendimento realizado' },
      { label: 'Cancelar solicitação', value: 'Cancelar solicitação' },
    ],
    default: 'Normal',
    on: { '3': 'Invisível', '6': 'Invisível' },
  },
  {
    technicalName: 'TIPO_USUARIO_N1', label: 'Transferir para:', type: 'list',
    group: 'GROUP4',
    columnWidth: 6,
    options: [
      { label: 'Meu usuário', value: 'Meu usuário' },
      { label: 'Outro usuário', value: 'Outro usuário' },
    ],
    default: 'Normal',
    on: { '6': 'Invisível' },
  },
  {
    technicalName: 'USUARIO_RESP_N2', label: 'Usuário', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Normal',
    on: { '6': 'Somente leitura' },
  },
  {
    technicalName: 'USUARIO_RESP', label: 'Usuário', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'COD_USUARIO_RESP_N2', label: '', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Invisível',
    on: { '2': 'Normal', '3': 'Normal', '5': 'Normal', '7': 'Normal', '8': 'Normal', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'COD_USUARIO_RESP', label: 'Código Usuário Resp', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Normal',
    on: { '6': 'Invisível' },
  },
  {
    technicalName: 'AVALIACAO', label: 'Dê uma nota para o atendimento da nossa equipe:', type: 'list',
    group: 'GRUPO_AVALIACAO',
    columnWidth: 6,
    options: [
      { label: '1 - MUITO RUIM', value: '1 - MUITO RUIM' },
      { label: '2 - RUIM', value: '2 - RUIM' },
      { label: '3 - REGULAR', value: '3 - REGULAR' },
      { label: '4 - BOM', value: '4 - BOM' },
      { label: '5 - MUITO BOM', value: '5 - MUITO BOM' },
    ],
    default: 'Normal',
    on: { '2': 'Invisível', '3': 'Invisível' },
  },
  {
    technicalName: 'JUSTIFICATIVA_EQUIPE', label: 'Justifique:', type: 'textarea',
    group: 'GRUPO_AVALIACAO',
    columnWidth: 12,
    default: 'Normal',
    on: { '2': 'Invisível', '3': 'Invisível' },
  },
  {
    technicalName: 'AVALIACAO_ATENDIMENTO', label: 'Qual sua avaliação do atendimento:', type: 'list',
    group: 'GRUPO_AVALIACAO',
    columnWidth: 6,
    options: [
      { label: '1 - MUITO RUIM', value: '1 - MUITO RUIM' },
      { label: '2 - RUIM', value: '2 - RUIM' },
      { label: '3 - REGULAR', value: '3 - REGULAR' },
      { label: '4 - BOM', value: '4 - BOM' },
      { label: '5 - MUITO BOM', value: '5 - MUITO BOM' },
    ],
    default: 'Normal',
    on: { '2': 'Invisível', '3': 'Invisível' },
  },
  {
    technicalName: 'JUSTIFICATIVA_ATEND', label: 'Justifique:', type: 'textarea',
    group: 'GRUPO_AVALIACAO',
    columnWidth: 12,
    default: 'Normal',
    on: { '2': 'Invisível', '3': 'Invisível' },
  },
  {
    technicalName: 'LBL_ANEXOS', label: 'Anexos', type: 'label',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'DESCR_ANEXO', label: 'Descrição do anexo', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Invisível',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '8': 'Normal', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'ANEXO', label: 'Anexo', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '5': 'Somente leitura', '6': 'Somente leitura', '7': 'Invisível' },
  },
  {
    technicalName: 'NOME_SOLICITANTE', label: 'Nome do Solicitante', type: 'text',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Somente leitura',
    on: { '8': 'Normal', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'USUARIO_SOLICITANTE', label: 'Usuário do solicitante', type: 'text',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Somente leitura',
    on: { '2': 'Invisível', '3': 'Invisível', '5': 'Invisível', '6': 'Invisível', '8': 'Normal', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'TIPO_CHAMADO', label: 'Tipo de Chamado', type: 'list',
    group: 'GROUP5',
    columnWidth: 6,
    options: [
      { label: 'teste', value: 'teste' },
    ],
    default: 'Normal',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '5': 'Somente leitura', '6': 'Invisível', '7': 'Invisível' },
  },
  {
    technicalName: 'PRIORIDADE_ATENDIMENTO', label: 'Prioridade para atendimento', type: 'list',
    group: 'GROUP5',
    columnWidth: 6,
    options: [
      { label: 'Baixa', value: 'Baixa' },
      { label: 'Média', value: 'Média' },
      { label: 'Alta', value: 'Alta' },
      { label: 'Urgente', value: 'Urgente' },
    ],
    default: 'Normal',
    on: { '5': 'Invisível', '6': 'Invisível' },
  },
  {
    technicalName: 'URGENCIA', label: 'Urgência do solicitante', type: 'list',
    group: 'GROUP5',
    columnWidth: 6,
    options: [
      { label: 'Baixa', value: 'Baixa' },
      { label: 'Média', value: 'Média' },
      { label: 'Alta', value: 'Alta' },
      { label: 'Urgente', value: 'Urgente' },
    ],
    default: 'Normal',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '5': 'Somente leitura', '6': 'Somente leitura', '7': 'Invisível' },
  },
  {
    technicalName: 'DESCR_DETALHADA', label: 'Descrição detalhada do problema', type: 'textarea',
    group: 'GROUP5',
    columnWidth: 12,
    default: 'Normal',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '5': 'Somente leitura', '6': 'Somente leitura', '7': 'Invisível' },
  },
  {
    technicalName: 'CHAMADOS_RELACIONADOS', label: 'Chamados Relacionados', type: 'text',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'DET_ATENDIMENTO', label: 'Assunto do atendimento', type: 'list',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'USUARIO_REAL', label: 'Outros colaboradores envolvidos no chamado:', type: 'text',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'COD_LIDER_INICIADOR', label: '', type: 'integer',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Invisível',
    on: { '2': 'Normal', '5': 'Normal', '6': 'Normal', '7': 'Normal', '8': 'Normal', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'EMAIL_PARA', label: 'Destinatário', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Normal',
    on: { '3': 'Invisível' },
  },
  {
    technicalName: 'ASSUNTO_EMAIL', label: 'Assunto email', type: 'text',
    group: 'GROUP4',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'TEXTO_EMAIL', label: 'Texto do email', type: 'textarea',
    group: 'GROUP4',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CHAMADOS_RELACIONADOS_G', label: 'Chamados relacionados', type: 'text',
    group: 'GROUP5',
    columnWidth: 6,
    default: 'Normal',
    on: { '2': 'Somente leitura', '3': 'Somente leitura', '5': 'Somente leitura', '6': 'Somente leitura', '7': 'Somente leitura' },
  },
  {
    technicalName: 'COD_PROCESSO_ORIGEM', label: 'Código do Processo de Origem', type: 'text',
    columnWidth: 6,
    default: 'Somente leitura',
    on: { '2': 'Invisível', '3': 'Invisível', '5': 'Invisível', '6': 'Invisível', '7': 'Invisível', '8': 'Invisível', '9': 'Normal', '10': 'Normal', '11': 'Normal', '12': 'Normal', '13': 'Normal', '14': 'Normal', '15': 'Normal', '16': 'Normal', '17': 'Normal', '18': 'Normal', '19': 'Normal', '20': 'Normal', '21': 'Normal', '22': 'Normal', '23': 'Normal', '24': 'Normal', '25': 'Normal', '26': 'Normal', '27': 'Normal', '28': 'Normal', '29': 'Normal' },
  },
  {
    technicalName: 'EMPRESA_REFERENCIA', label: 'Empresa a que se refere', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'CNPJ', label: 'CNPJ', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    mask: '99.999.999/9999-99',
    default: 'Normal'
  },
  {
    technicalName: 'NOME_COMERCIAL_MARCA', label: 'Nome Comercial/Marca', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'COMPRADOR_RESPONSAVEL', label: 'Comprador responsável', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'SIMULADOR_MARGEM', label: 'Simulador de Margem', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'ORIGEM_PROSPECCAO', label: 'Origem da prospecção', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'Planejamento estratégico', value: 'Planejamento estratégico' },
      { label: 'Prospecção de Compras', value: 'Prospecção de Compras' },
      { label: 'Diretoria Emefarma', value: 'Diretoria Emefarma' },
      { label: 'Indicação de fornecedor', value: 'Indicação de fornecedor' },
      { label: 'Indicação do Comercial', value: 'Indicação do Comercial' },
      { label: 'Demanda comercial', value: 'Demanda comercial' },
      { label: 'Oportunidade de mercado', value: 'Oportunidade de mercado' },
      { label: 'Outro', value: 'Outro' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'DESCREVA_ORIGEM', label: 'Descreva', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'OBSERV_MERCADO', label: 'Observações da análise de mercado', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'OBSERV_TRIBUTOS', label: 'Observações da análise de tributos', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'OBSERV_CONSOLIDACAO', label: 'Observações da consolidação', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'DECISAO_DIRETORIA', label: 'Decisão da Diretoria', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'GO', value: 'GO' },
      { label: 'NO GO', value: 'NO GO' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'JUSTIFICATIVA_DECISAO', label: 'Justificativa da decisão', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CONTATO_INDUSTRIA', label: 'Contato da indústria', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'EMAIL_ENVIO_DOCUMENTACA', label: 'E-mail para envio da documentação Emefarma', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'TELEFONE', label: 'Telefone', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'POTENCIAL_MERCADO', label: 'Potencial de mercado', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'MARGEM_PRATICADA', label: 'Margem que será praticada', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'RAZAO_SOCIAL', label: 'Razão Social', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'FILIAL_VENDIDA', label: 'Qual filial será vendido?', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: '1', value: '1' },
      { label: '3', value: '3' },
      { label: '4', value: '4' },
      { label: '6', value: '6' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'LBL_CADASTRO_PRODUTOS', label: 'Cadastro de Produtos', type: 'label',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'FICHA_TECNICA', label: 'Ficha Técnica', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'TEMPLATE_CADASTRO_PRODU', label: 'Template Cadastro de Produtos', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'TIPO_PRODUTO', label: 'Tipo de Produto', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'Ético', value: 'Ético' },
      { label: 'Genérico', value: 'Genérico' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'LBL_CADASTRO_INDUSTRIA', label: 'Cadastro da Indústria', type: 'label',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CONTRATO_SOCIAL_ATA_CON', label: 'Contrato Social,ATA ou Última alteração contratual', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'INSCRICAO_ESTADUAL', label: 'Inscrição Estadual', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CERTIDAO_DE_REGULARIDAD', label: 'Certidão de Regularidade Técnica', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'LICENCA_SANITARIA', label: 'Licença Sanitária', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'AFE', label: 'AFE', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CARTA_DE_CREDENCIAMENTO', label: 'Carta de Credenciamento', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'POLITICA_DE_DEVOLUCAO', label: 'Política de Devolução', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'GERAR_VERBA', label: 'Gerar verba?', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'FLAG_DOC_EMEFARMA_ENVIA', label: 'Documentos Emefarma enviados para a Indústria', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'FLAG_FEITA_QUALIFICACAO', label: 'Feita a Qualificação dos documentos', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'QUAL_PRECO_CADASTRADO', label: 'Qual preço cadastrado?', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'ORIGEM_DOS_PRODUTOS', label: 'Qual a origem dos produtos?', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'Nacional', value: 'Nacional' },
      { label: 'Importado', value: 'Importado' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CUBAGEM', label: 'Cubagem', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'CURVA_DE_GIRO', label: 'Curva de Giro', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'DATA_PREVISTA_CHEGADA_P', label: 'Data prevista para a chegada dos produtos', type: 'date',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'DATA_INICIO_DAS_VENDAS', label: 'Data do início das Vendas', type: 'date',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'NOME_DO_PAINEL', label: 'Nome do painel', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'LOGO_INDUSTRIA', label: 'Logo da indústria', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'FORMATO_LOGO', label: 'Formato do logo', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'Alta', value: 'Alta' },
      { label: 'Vetor', value: 'Vetor' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'PLANEJAMENTO_ESTRATEGIC', label: 'Planejamento estratégico', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'PLANEJAMENTO_COMERCIAL', label: 'Planejamento Comercial e Promocional', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'DESCRICAO_PRODUTO', label: 'Descrição dos produtos', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'CODIGO_PRODUTO', label: 'Código', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'EAN', label: 'EAN', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'COMISSAO_PRATICADA', label: 'Comissão que será praticada', type: 'text',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'DATA_TREINAMENTO', label: 'Data do treinamento', type: 'date',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'CHK_CATALOGO_FISICO', label: 'Catálogo físico', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_CATALOGO_DIGITAL', label: 'Catálogo digital', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_TREINAMENTO_INDUSTR', label: 'Treinamento com a indústria', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_COMUNICACAO_TIME_IN', label: 'Comunicação Time Interno', type: 'list',
    group: 'GROUP1',
    columnWidth: 6,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'PERIODO_DE', label: 'Período de', type: 'date',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'PERIODO_ATE', label: 'Período até', type: 'date',
    group: 'GROUP1',
    columnWidth: 6,
    default: 'Normal'
  },
  {
    technicalName: 'ANEXO_APOIO_COMERCIAL', label: 'Anexo', type: 'upload',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'BRIEFING_CANAIS_DIGITAI', label: 'Briefing Canais Digitais', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CHK_BANNER_CARROSSEL', label: 'Banner Carrossel', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_BANNER_PE', label: 'Banner PE', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_BANNER_ECOMMERCE', label: 'Banner E-commerce', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_BANNER_PEQUENO', label: 'Banner Pequeno', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_EMAIL_MARKETING', label: 'E-mail Marketing', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_POPUP', label: 'Pop-up', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'BRIEFING_REDES_SOCIAIS', label: 'Briefing Redes sociais', type: 'textarea',
    group: 'GROUP1',
    columnWidth: 12,
    default: 'Normal'
  },
  {
    technicalName: 'CHK_CAPA_DE_REELS', label: 'Capa de reels', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_FEED', label: 'Feed', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
  {
    technicalName: 'CHK_STORY', label: 'Story', type: 'list',
    group: 'GROUP1',
    columnWidth: 4,
    options: [
      { label: 'SIM', value: 'Sim' },
      { label: 'NÃO', value: 'Nao' },
    ],
    default: 'Normal'
  },
];

function buildStepProperties(campo: CampoDef): FormField['stepProperties'] {
  const props: NonNullable<FormField['stepProperties']> = {};
  for (const etapa of ETAPAS) {
    props[etapa.codEtapa] = {
      presentation: campo.on?.[etapa.codEtapa] ?? campo.default ?? INVISIVEL,
      initialization: '',
      initialValue: '',
    };
  }
  return props;
}

function toField(campo: CampoDef): FormField {
  const field: FormField = {
    id: campo.technicalName,
    type: campo.type,
    label: campo.label,
    technicalName: campo.technicalName,
    required: campo.required ?? false,
    disabled: false,
    visible: true,
    columnWidth: campo.columnWidth ?? 12,
    meta: {},
    stepProperties: buildStepProperties(campo),
  };
  if (campo.group) field.group = campo.group;
  if (campo.options) field.meta.options = campo.options;
  if (campo.mask) field.meta.mask = campo.mask;
  if (campo.helperText) field.meta.helperText = campo.helperText;
  return field;
}

function buildSteps(): FormStep[] {
  const allFields = CAMPOS.map(toField);
  return ETAPAS.map(etapa => ({
    id: etapa.codEtapa,
    title: etapa.title,
    fields: allFields.filter(campo => campo.stepProperties?.[etapa.codEtapa]?.presentation !== INVISIVEL),
  }));
}

export const ENTRADA_NOVA_INDUSTRIA_SCHEMA: FormSchema = {
  id: '131',
  title: 'Entrada de Nova Indústria',
  groups: GRUPOS,
  steps: buildSteps(),
  script: `/*   arquivo: entradanovaindustria.js
 *   processo: Entrada de Nova Indústria
 *   Data: 13/08/2026
 *
 *   Formulário dinâmico do processo de entrada de nova indústria.
 *   Regras implementadas:
 *    - Origem da prospecção: quando "Outro", exige o campo "Descreva" (máx. 30 caracteres)
 *    - Decisão da Diretoria (GO/NO GO): NO GO exige justificativa; GO exige dados da indústria
 *    - Ciência da margem: campos pré-preenchidos ficam bloqueados (somente leitura)
 *    - Etapas de ajuste (MKT): justificativa obrigatória quando a ação é "solicitar ajuste"
 *    - Checklists com validação de pelo menos um item marcado
 *    - Campos/Grids exibidos apenas na etapa correspondente
 *
 *   Estrutura: o initForm chama as funções normais de configuração de cada etapa
 *   e o setForm chama as funções que registram os eventos (CHANGE) de cada etapa.
 *
 *   IMPORTANTE: os IDs de etapas e campos devem corresponder aos definidos no processo.
 */

/* Etapas */
var Etapa = Object.freeze({
    SOLICITAR_ANALISE_DO_FORNECEDOR: 1,
    CONFIRMAR_CANCELAMENTO: 2,
    AVALIAR_ATENDIMENTO: 3,
    ENVIAR_ANALISE_PARA_A_DIRETORIA: 5,
    REALIZAR_ANALISE_DE_MERCADO: 6,
    COMPLEMENTAR_INFORMACOES: 7,
    CONSOLIDAR_MATERIAL_E_ENVIAR_PARA_TOMADA_DE_DECISAO: 8,
    REALIZAR_O_PRIMEIRO_PEDIDO: 9,
    CRIAR_PAINEL_NO_BI: 10,
    CADASTRAR_TRIBUTACAO_DOS_PRODUTOS: 11,
    REALIZAR_ANALISE_DE_TRIBUTOS: 12,
    TOMAR_CIENCIA_DA_MARGEM_A_SER_PRATICADA: 13,
    CADASTRAR_PMC_E_PF: 14,
    REALIZAR_ANALISE_DE_MARGEM: 15,
    REALIZAR_QUALIFICACAO_DOS_DOCUMENTOS: 16,
    CADASTRAR_INDUSTRIA_E_PRODUTOS: 17,
    FINALIZAR_CADASTRO_DA_INDUSTRIA_E_PRODUTOS: 18,
    TOMAR_CIENCIA_DA_ENTRADA_DE_NOVA_INDUSTRIA: 19,
    TOMAR_CIENCIA_DA_COMISSAO_A_SER_PRATICADA: 20,
    DEFINIR_PLANEJAMENTO_ESTRATEGICO_COMERCIAL_PROMOCIONAL: 21,
    VALIDAR_MATERIAIS_E_APROVAR_LANCAMENTO: 22,
    PLANEJAR_ACOES_PARA_REDES_SOCIAIS: 23,
    PLANEJAR_ACOES_DE_APOIO_COMERCIAL: 24,
    PLANEJAR_ACOES_PARA_CANAIS_DIGITAIS: 25,
    DESENVOLVER_MATERIAIS_DE_LANCAMENTO: 26,
    FINALIZAR: 27,
    CONCENTRAR: 28,
    CONCENTRAR_ATIVIDADES_DO_MKT: 29
});

/* Decisão da diretoria */
var Decisao = Object.freeze({
    GO: "GO",
    NO_GO: "NO GO"
});

/* Ações de rota que representam "solicitar ajuste" nas etapas de MKT.
   Ajustar conforme as opções de rota configuradas no processo (approveRoute). */
var ACAO_AJUSTE = ["Solicitar ajuste", "Solicitar ajuste de material", "Voltar para ajuste", "Rejeitar"];

/* Ações de rota padrão (aprovação) — usadas para esconder a justificativa de ajuste */
var ACAO_APROVACAO = ["Aprovar", "Aprovar lançamento", "Validar e aprovar lançamento", "Aprovar materiais", "Finalizar"];

/* Globais Auxiliares */
const codForm = ProcessData.processId;
const codVersao = ProcessData.version;
const codProcesso = ProcessData.processInstanceId;
const codEtapa = ProcessData.activityInstanceId;
const codCiclo = ProcessData.cycle;

/* Campos informados na Diretoria (GO) e reutilizados nas etapas seguintes */
var CAMPOS_DECISAO_GO = [
    "CONTATO_INDUSTRIA", "EMAIL_ENVIO_DOCUMENTACA", "TELEFONE",
    "POTENCIAL_MERCADO", "MARGEM_PRATICADA", "CNPJ",
    "RAZAO_SOCIAL", "NOME_COMERCIAL_MARCA", "FILIAL_VENDIDA"
];

/* Campos bloqueados (somente leitura) na etapa "Tomar ciência da margem a ser praticada" */
var CAMPOS_MARGEM_BLOQUEADOS = [
    "POTENCIAL_MERCADO", "MARGEM_PRATICADA", "CNPJ",
    "RAZAO_SOCIAL", "FILIAL_VENDIDA", "NOME_COMERCIAL_MARCA"
];

/* Carregamento do Formulario */
$(document).ready(function () {
    console.clear();
    initForm();
    setForm();
});

/* initForm: funções normais — configura os campos, grids e regras da etapa atual */
function initForm() {
    switch (codEtapa) {
        case Etapa.SOLICITAR_ANALISE_DO_FORNECEDOR:
            configuraEtapaSolicitarAnaliseDoFornecedor();
            break;

        case Etapa.ENVIAR_ANALISE_PARA_A_DIRETORIA:
            configuraEtapaEnviarAnaliseParaADiretoria();
            break;

        case Etapa.REALIZAR_ANALISE_DE_MERCADO:
            configuraEtapaRealizarAnaliseDeMercado();
            break;

        case Etapa.REALIZAR_ANALISE_DE_TRIBUTOS:
            configuraEtapaRealizarAnaliseDeTributos();
            break;

        case Etapa.REALIZAR_ANALISE_DE_MARGEM:
            configuraEtapaRealizarAnaliseDeMargem();
            break;

        case Etapa.CONSOLIDAR_MATERIAL_E_ENVIAR_PARA_TOMADA_DE_DECISAO:
            configuraEtapaConsolidarMaterial();
            break;

        case Etapa.REALIZAR_O_PRIMEIRO_PEDIDO:
            configuraEtapaRealizarOPrimeiroPedido();
            break;

        case Etapa.CRIAR_PAINEL_NO_BI:
            configuraEtapaCriarPainelNoBi();
            break;

        case Etapa.CADASTRAR_TRIBUTACAO_DOS_PRODUTOS:
            configuraEtapaCadastrarTributacaoDosProdutos();
            break;

        case Etapa.TOMAR_CIENCIA_DA_MARGEM_A_SER_PRATICADA:
            configuraEtapaTomarCienciaDaMargem();
            break;

        case Etapa.CADASTRAR_PMC_E_PF:
            configuraEtapaCadastrarPmcEPf();
            break;

        case Etapa.REALIZAR_QUALIFICACAO_DOS_DOCUMENTOS:
            configuraEtapaRealizarQualificacaoDosDocumentos();
            break;

        case Etapa.CADASTRAR_INDUSTRIA_E_PRODUTOS:
            configuraEtapaCadastrarIndustriaEProdutos();
            break;

        case Etapa.TOMAR_CIENCIA_DA_COMISSAO_A_SER_PRATICADA:
            configuraEtapaTomarCienciaDaComissao();
            break;

        case Etapa.DEFINIR_PLANEJAMENTO_ESTRATEGICO_COMERCIAL_PROMOCIONAL:
            configuraEtapaDefinirPlanejamento();
            break;

        case Etapa.VALIDAR_MATERIAIS_E_APROVAR_LANCAMENTO:
            
            break;

        case Etapa.PLANEJAR_ACOES_PARA_REDES_SOCIAIS:
            configuraEtapaPlanejarAcoesParaRedesSociais();
            break;

        case Etapa.PLANEJAR_ACOES_DE_APOIO_COMERCIAL:
            configuraEtapaPlanejarAcoesDeApoioComercial();
            break;

        case Etapa.PLANEJAR_ACOES_PARA_CANAIS_DIGITAIS:
            configuraEtapaPlanejarAcoesParaCanaisDigitais();
            break;

        case Etapa.DESENVOLVER_MATERIAIS_DE_LANCAMENTO:
            
            break;
    }
    Form.apply();
}

/* setForm: funções com eventos — registra os CHANGE de cada etapa */
function setForm() {
    switch (codEtapa) {
        case Etapa.SOLICITAR_ANALISE_DO_FORNECEDOR:
            addEventOrigemProspeccao();
            addEventValidacaoCNPJ();
            break;

        case Etapa.ENVIAR_ANALISE_PARA_A_DIRETORIA:
            addEventDecisaoDiretoria();
            addEventValidacaoCNPJ();
            break;

        case Etapa.VALIDAR_MATERIAIS_E_APROVAR_LANCAMENTO:
        case Etapa.DESENVOLVER_MATERIAIS_DE_LANCAMENTO:
           
            break;

        case Etapa.PLANEJAR_ACOES_PARA_REDES_SOCIAIS:
            addValidacaoChecklist([
                "CHK_CAPA_DE_REELS", "CHK_FEED", "CHK_STORY", "CHK_VIDEO"
            ]);
            break;

        case Etapa.PLANEJAR_ACOES_DE_APOIO_COMERCIAL:
            addValidacaoChecklist([
                "CHK_CATALOGO_FISICO", "CHK_CATALOGO_DIGITAL",
                "CHK_TREINAMENTO_INDUSTR", "CHK_COMUNICACAO_TIME_IN"
            ]);
            break;

        case Etapa.PLANEJAR_ACOES_PARA_CANAIS_DIGITAIS:
            addValidacaoChecklist([
                "CHK_BANNER_CARROSSEL", "CHK_BANNER_PE", "CHK_BANNER_ECOMMERCE",
                "CHK_BANNER_PEQUENO", "CHK_EMAIL_MARKETING", "CHK_POPUP"
            ]);
            break;
    }
}

/* ============ Configuração de cada etapa (initForm) ============ */

function configuraEtapaSolicitarAnaliseDoFornecedor() {
    exibeCamposObrigatorios([
        "EMPRESA_REFERENCIA", "CNPJ", "NOME_COMERCIAL_MARCA",
        "COMPRADOR_RESPONSAVEL", "SIMULADOR_MARGEM", "ORIGEM_PROSPECCAO"
    ]);
    trataOrigemProspeccao();
}

function configuraEtapaEnviarAnaliseParaADiretoria() {
    exibeCamposObrigatorios(["DECISAO_DIRETORIA"]);
    trataDecisaoDiretoria();
}

function configuraEtapaRealizarAnaliseDeMercado() {
    exibeCamposObrigatorios(["OBSERV_MERCADO"]);
    exibeGridObrigatorio("GRID_ANEXO");
}

function configuraEtapaRealizarAnaliseDeTributos() {
    exibeCamposObrigatorios(["OBSERV_TRIBUTOS"]);
    exibeGridObrigatorio("GRID_ANEXO");
}

function configuraEtapaRealizarAnaliseDeMargem() {
    exibeCamposObrigatorios(["OBSERV_MARGEM"]);
    exibeGridObrigatorio("GRID_ANEXO");
}

function configuraEtapaConsolidarMaterial() {
    exibeCamposObrigatorios(["OBSERV_CONSOLIDACAO"]);
    exibeGridObrigatorio("GRID_ANEXO");
}

function configuraEtapaRealizarOPrimeiroPedido() {
    exibeCamposObrigatorios([
        "CUBAGEM", "CURVA_DE_GIRO",
        "DATA_PREVISTA_CHEGADA_P", "DATA_INICIO_DAS_VENDAS"
    ]);
}

function configuraEtapaCriarPainelNoBi() {
    exibeCamposObrigatorios(["NOME_DO_PAINEL"]);
}

function configuraEtapaCadastrarTributacaoDosProdutos() {
    exibeCamposObrigatorios(["ORIGEM_DOS_PRODUTOS"]);
}

function configuraEtapaTomarCienciaDaMargem() {
    exibeCampos(CAMPOS_MARGEM_BLOQUEADOS);
    bloqueiaCampos(CAMPOS_MARGEM_BLOQUEADOS);
}

function configuraEtapaCadastrarPmcEPf() {
    exibeCamposObrigatorios(["QUAL_PRECO_CADASTRADO"]);
}

function configuraEtapaRealizarQualificacaoDosDocumentos() {
    exibeCamposObrigatorios(["FLAG_DOC_EMEFARMA_ENVIA", "FLAG_FEITA_QUALIFICACAO"]);
}

function configuraEtapaCadastrarIndustriaEProdutos() {
    exibeCamposObrigatorios([
        "FICHA_TECNICA", "TEMPLATE_CADASTRO_PRODU", "TIPO_PRODUTO", "GERAR_VERBA"
    ]);
    exibeGridObrigatorio("GRID_ANEXOS_INDUSTRIA");
}

function configuraEtapaTomarCienciaDaComissao() {
    exibeCampos(["COMISSAO_PRATICADA"]);
    bloqueiaCampos(["COMISSAO_PRATICADA"]);
}

function configuraEtapaDefinirPlanejamento() {
    exibeCamposObrigatorios([
        "LOGO_INDUSTRIA", "FORMATO_LOGO", "PLANEJAMENTO_ESTRATEGIC",
        "PLANEJAMENTO_COMERCIAL", "DATA_INICIO_DAS_VENDAS", "COMISSAO_PRATICADA"
    ]);
    exibeGridObrigatorio("GRID_PRODUTOS_PLANEJAMENTO");
}




function configuraEtapaPlanejarAcoesParaRedesSociais() {
    exibeCamposObrigatorios(["BRIEFING_REDES_SOCIAIS", "ANEXO_REDES_SOCIAIS"]);
    exibeCampos(["CHK_CAPA_DE_REELS", "CHK_FEED", "CHK_STORY", "CHK_VIDEO"]);
}

function configuraEtapaPlanejarAcoesDeApoioComercial() {
    exibeCamposObrigatorios(["DATA_TREINAMENTO", "PERIODO_DE", "PERIODO_ATE", "ANEXO_APOIO_COMERCIAL"]);
    exibeCampos([
        "CHK_CATALOGO_FISICO", "CHK_CATALOGO_DIGITAL",
        "CHK_TREINAMENTO_INDUSTR", "CHK_COMUNICACAO_TIME_IN"
    ]);
}

function configuraEtapaPlanejarAcoesParaCanaisDigitais() {
    exibeCamposObrigatorios(["BRIEFING_CANAIS_DIGITAI", "ANEXO_CANAIS_DIGITAIS"]);
    exibeCampos([
        "CHK_BANNER_CARROSSEL", "CHK_BANNER_PE", "CHK_BANNER_ECOMMERCE",
        "CHK_BANNER_PEQUENO", "CHK_EMAIL_MARKETING", "CHK_POPUP"
    ]);
}



/* ============ Utilitários ============ */

function existeCampo(nome) {
    try { return !!Form.fields(nome); } catch (e) { return false; }
}

function existeGrid(nome) {
    try { return !!Form.grids(nome); } catch (e) { return false; }
}

/* Retorna o valor de um campo normalizado (lista pode vir como array) */
function valorCampo(nome) {
    if (!existeCampo(nome)) return "";
    var v = Form.fields(nome).value();
    if (Array.isArray(v)) return (v[0] || "");
    return (v || "");
}

function exibeCampos(campos) {
    campos.forEach(function (campo) {
        if (existeCampo(campo)) {
            Form.fields(campo).visible(true);
        }
    });
    Form.apply();
}

function ocultaCampos(campos) {
    campos.forEach(function (campo) {
        if (existeCampo(campo)) {
            Form.fields(campo).visible(false);
            Form.fields(campo).setRequired("aprovar", false);
        }
    });
    Form.apply();
}

function exibeCamposObrigatorios(campos) {
    campos.forEach(function (campo) {
        if (existeCampo(campo)) {
            Form.fields(campo).visible(true);
            Form.fields(campo).setRequired("aprovar", true);
        }
    });
    Form.apply();
}

function bloqueiaCampos(campos) {
    campos.forEach(function (campo) {
        if (existeCampo(campo)) {
            Form.fields(campo).disabled(true).readOnly(true).setRequired("aprovar", false);
        }
    });
    Form.apply();
}

/* Exibe um grid na etapa atual */
function exibeGrid(nomeDoGrid) {
    if (existeGrid(nomeDoGrid)) {
        Form.grids(nomeDoGrid).visible(true);
    }
    Form.apply();
}

/* Exibe um grid e torna obrigatórios todos os campos internos dele */
function exibeGridObrigatorio(nomeDoGrid) {
    if (existeGrid(nomeDoGrid)) {
        Form.grids(nomeDoGrid).visible(true);
        Form.grids(nomeDoGrid).fields().forEach(function (campo) {
            try {
                Form.grids(nomeDoGrid).fields(campo.id).setRequired(true);
                Form.grids(nomeDoGrid).fields(campo.id).visible(true);
            } catch (e) {
                console.error("Erro ao tornar obrigatório campo do grid: " + campo.id, e);
            }
        });
    }
    Form.apply();
}

/* ============ Validação de CNPJ ============ */

/* Valida o CNPJ do campo quando o usuário termina de digitar (BLUR) */
function validaCNPJNoBlur() {
    if (JSPadrao && JSPadrao.validaCNPJ) {
        JSPadrao.validaCNPJ({ campo: "CNPJ" });
    }
}

/* Valida o CNPJ no submit; se inválido, impede o envio do formulário */
function validaCNPJNoSubmit(formId, actionId, reject) {
    var valido = true;

    if (JSPadrao && JSPadrao.validaCNPJ) {
        valido = JSPadrao.validaCNPJ({ campo: "CNPJ" });
    }

    if (!valido && reject) {
        reject();
    }
}

/* Registra a validação do CNPJ (BLUR + SUBMIT) */
function addEventValidacaoCNPJ() {
    if (!existeCampo("CNPJ")) return;

    Form.fields("CNPJ").subscribe("BLUR", function (formId, fieldId, resposta) {
        validaCNPJNoBlur();
    });

    Form.subscribe("SUBMIT", function (formId, actionId, reject) {
        validaCNPJNoSubmit(formId, actionId, reject);
    });
}

/* ============ Origem da prospecção ============ */

function trataOrigemProspeccao() {
    var origem = valorCampo("ORIGEM_PROSPECCAO");

    if (origem == "Outro") {
        if (existeCampo("DESCREVA_ORIGEM")) {
            Form.fields("DESCREVA_ORIGEM").visible(true).setRequired("aprovar", true);
            limitaTamanho("DESCREVA_ORIGEM", 30);
        }
    } else {
        if (existeCampo("DESCREVA_ORIGEM")) {
            Form.fields("DESCREVA_ORIGEM").visible(false).setRequired("aprovar", false);
        }
    }
    Form.apply();
}

function addEventOrigemProspeccao() {
    Form.fields("ORIGEM_PROSPECCAO").subscribe("CHANGE", function (formId, fieldId, resposta) {
        trataOrigemProspeccao();
        Form.apply();
    });
}

/* Limita a quantidade de caracteres de um campo de texto */
function limitaTamanho(campo, max) {
    Form.fields(campo).subscribe("CHANGE", function (formId, fieldId, resposta) {
        var v = valorCampo(campo);
        if (v.length > max) {
            Form.fields(campo).value(v.substring(0, max)).apply();
            if (JSPadrao && JSPadrao.adicionaErro) {
                JSPadrao.adicionaErro({ campo: campo }, "Máximo de " + max + " caracteres", false);
            }
        }
    });
    Form.fields(campo).subscribe("BLUR", function (formId, fieldId, resposta) {
        var v = valorCampo(campo);
        if (v.length > max) {
            Form.fields(campo).value(v.substring(0, max)).apply();
        }
    });
}

/* ============ Decisão da Diretoria (GO / NO GO) ============ */

function trataDecisaoDiretoria() {
    var decisao = valorCampo("DECISAO_DIRETORIA");

    if (decisao == Decisao.NO_GO) {
        if (existeCampo("JUSTIFICATIVA_DECISAO")) {
            Form.fields("JUSTIFICATIVA_DECISAO").visible(true).setRequired("aprovar", true);
        }
        ocultaCampos(CAMPOS_DECISAO_GO);
    } else if (decisao == Decisao.GO) {
        if (existeCampo("JUSTIFICATIVA_DECISAO")) {
            Form.fields("JUSTIFICATIVA_DECISAO").visible(false).setRequired("aprovar", false);
        }
        exibeCamposObrigatorios(CAMPOS_DECISAO_GO);
    } else {
        if (existeCampo("JUSTIFICATIVA_DECISAO")) {
            Form.fields("JUSTIFICATIVA_DECISAO").visible(false).setRequired("aprovar", false);
        }
        ocultaCampos(CAMPOS_DECISAO_GO);
    }
    Form.apply();
}

function addEventDecisaoDiretoria() {
    Form.fields("DECISAO_DIRETORIA").subscribe("CHANGE", function (formId, fieldId, resposta) {
        trataDecisaoDiretoria();
        Form.apply();
    });
}



/* ============ Checklists (pelo menos um item marcado) ============ */

function peloMenosUmMarcado(camposChecklist) {
    var marcados = camposChecklist.filter(function (campo) {
        return valorCampo(campo) == "Sim";
    });
    return marcados.length > 0;
}

function validaChecklist(camposChecklist) {
    if (!peloMenosUmMarcado(camposChecklist)) {
        if (JSPadrao && JSPadrao.adicionaErro) {
            JSPadrao.adicionaErro(
                { campo: camposChecklist[0] },
                "Marque pelo menos um item do checklist",
                false
            );
        }
        formInvalido = true;
        return false;
    }
    return true;
}

function addValidacaoChecklist(camposChecklist) {
    if (existeCampo("ACAO")) {
        Form.fields("ACAO").subscribe("CHANGE", function (formId, fieldId, resposta) {
            if (ACAO_APROVACAO.indexOf(valorCampo("ACAO")) !== -1) {
                validaChecklist(camposChecklist);
            }
        });
    }
}

/* Verifica se cada campo da lista possui algum valor preenchido.
   Se possuir, o campo fica visível e desabilitado (disabled = true). */
function bloqueiaCamposPreenchidos() {
    var camposParaVerificar = [
        /* lista de nomes de campos */
    ];

    camposParaVerificar.forEach(function (nomeDoCampo) {
        var valorDoCampo = valorCampo(nomeDoCampo);

        if (valorDoCampo != "") {
            Form.fields(nomeDoCampo).visible(true);
            Form.fields(nomeDoCampo).disabled(true);
        }
    });

    Form.apply();
}
`,
};
