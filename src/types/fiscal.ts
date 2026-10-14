// Definições de Tipos para o Sistema de Escrituração Fiscal e Auditoria Tributária Brasileira

export type TipoOperacao = 'ENTRADA' | 'SAIDA';
export type TipoDocumento = 'NFE' | 'NFCE' | 'CTE' | 'NFSE' | 'NF3E' | 'NFCOM';
export type RegimeTributario = 'SIMPLES_NACIONAL' | 'LUCRO_PRESUMIDO' | 'LUCRO_REAL';
export type SeveridadeAuditoria = 'OK' | 'ATENCAO' | 'DIVERGENCIA' | 'ERRO_PROVAVEL' | 'NECESSITA_REVISAO';
export type StatusDocumento = 'IMPORTADO' | 'EM_ANALISE' | 'COM_DIVERGENCIAS' | 'APROVADO' | 'ESCRITURADO' | 'REJEITADO';
export type GrauConfianca = 'ALTA' | 'MEDIA' | 'BAIXA' | 'REVISAO_OBRIGATORIA';

export interface Empresa {
  id: string;
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  inscricaoEstadual: string;
  inscricaoMunicipal?: string;
  uf: string;
  municipio: string;
  codigoMunicipioIBGE: string;
  regimeTributario: RegimeTributario;
  cnae: string;
  perfilSped: 'A' | 'B' | 'C';
  dataInicioAtividades: string;
  logotipoUrl?: string;
  emailContato?: string;
  telefoneContato?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cep?: string;
  aliquotaIcmsPadrao?: number;
  aproveitamentoCreditoInsumos?: number;
}

export type PerfilUsuarioApp =
  | 'ADMIN_MASTER'
  | 'ANALISTA_FISCAL'
  | 'AUDITOR_TRIBUTARIO'
  | 'OPERADOR_FISCAL';

export interface UsuarioApp {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  departamento: string;
  telefone?: string;
  perfil: PerfilUsuarioApp;
  ativo: boolean;
  dataCadastro: string;
  ultimoAcesso?: string;
  avatarUrl?: string;
}

export type TipoCertificado = 'A1' | 'A3';
export type StatusCertificado = 'NAO_CONFIGURADO' | 'VALIDO' | 'EXPIRADO' | 'SENHA_INCORRETA' | 'REVOGADO';

export interface CertificadoDigitalInfo {
  instalado: boolean;
  tipo: TipoCertificado;
  nomeArquivo?: string;
  titular: string;
  cnpjVinculado: string;
  autoridadeCertificadora: string;
  numeroSerie: string;
  dataEmissao: string;
  dataValidade: string;
  diasParaExpirar: number;
  status: StatusCertificado;
  senhaSalva?: boolean;
  senhaHash?: string;
  wsSefazStatus: 'ONLINE' | 'OFFLINE' | 'NAO_TESTADO';
  ultimoTesteSefaz?: string;
  tempoRespostaMs?: number;
  tamanhoBytes?: number;
}

export type TipoPlanoLicenca = 'VITALICIO_PREMIUM' | 'ENTERPRISE_LIFETIME' | 'TRIAL';

export interface LicencaComercial {
  ativa: boolean;
  plano: TipoPlanoLicenca;
  chaveLicenca: string;
  empresaLicenciada: string;
  cnpjLicenciado: string;
  emailTitular: string;
  dataAtivacao: string;
  validade: string;
  statusPagamento: 'PAGO_VITALICIO' | 'PENDENTE' | 'DEMO';
  valorPago?: number;
  formaPagamento?: string;
  idTransacao?: string;
  modulosHabilitados: string[];
  limiteNotasFiscais: string;
  suporteTecnico: string;
}

export interface Estabelecimento {
  id: string;
  empresaId: string;
  codigoFilial: string;
  cnpj: string;
  nome: string;
  uf: string;
  municipio: string;
  eMatriz: boolean;
}

export type SituacaoCadastralRFB =
  | 'ATIVA'
  | 'INAPTA'
  | 'BAIXADA'
  | 'SUSPENSA'
  | 'NULA'
  | 'REGULAR_CPF'
  | 'PENDENTE_REGULARIZACAO_CPF'
  | 'SUSPENSA_CPF'
  | 'CANCELADA_CPF'
  | 'NULA_CPF'
  | 'NAO_CONSULTADO';

export interface ConsultaCadastralReceita {
  documento: string; // 14 dígitos CNPJ ou 11 dígitos CPF
  documentoFormatado: string;
  tipoPessoa: 'PJ' | 'PF';
  validoMatematicamente: boolean; // Validação Módulo 11 ( dígitos verificadores )
  razaoSocialOficial: string;
  nomeFantasiaOficial?: string;
  situacaoCadastral: SituacaoCadastralRFB;
  dataSituacaoCadastral: string;
  motivoSituacaoCadastral?: string;
  codigoMotivoSituacao?: string;
  dataAbertura?: string;
  cnaePrincipal?: {
    codigo: string;
    descricao: string;
  };
  cnaesSecundarios?: {
    codigo: string;
    descricao: string;
  }[];
  naturezaJuridica?: string;
  porte?: string;
  capitalSocial?: number;
  ufOficial: string;
  municipioOficial: string;
  logradouroOficial?: string;
  cepOficial?: string;
  inscricaoEstadualStatus?: 'HABILITADA' | 'INABILITADA' | 'NAO_CONTRIBUINTE';
  opcaoSimplesNacional?: boolean;
  opcaoMei?: boolean;
  quadroSocietario?: { nome: string; qualificacao: string }[];
  fonteConsulta:
    | 'API_OFICIAL_RECEITA_BRASILAPI'
    | 'API_PUBLICA_CNPJ_WS'
    | 'BASE_CADASTRAL_RFB_CACHE'
    | 'SIMULACAO_AUDITORIA';
  dataHoraConsulta: string;
  protocoloConsulta: string;
  alertaCritico: boolean;
  motivoAlertaCritico?: string;
}

export interface Participante {
  cnpjCpf: string;
  razaoSocial: string;
  nomeFantasia?: string;
  uf: string;
  municipio: string;
  inscricaoEstadual?: string;
  regimeTributario?: RegimeTributario;
  indicadorContribuinte: '1' | '2' | '9'; // 1: Contribuinte ICMS, 2: Isento, 9: Não Contribuinte
  endereco?: string;
  cep?: string;
  validacaoReceita?: ConsultaCadastralReceita;
}

export interface NormaFiscal {
  id: string;
  hierarquia: number; // 1: CF, 2: LC, 3: LO, 4: Decreto, 5: Convênio CONFAZ, 6: RICMS Estadual, 7: IN/Ato
  tipoNorma: 'CONSTITUICAO' | 'LEI_COMPLEMENTAR' | 'LEI_ORDINARIA' | 'DECRETO' | 'CONVENIO_CONFAZ' | 'REGULAMENTO_ESTADUAL' | 'INSTRUCAO_NORMATIVA';
  identificacao: string; // Ex: "Lei Complementar nº 87/1996 (Lei Kandir)"
  artigo: string;
  paragrafo?: string;
  inciso?: string;
  alinea?: string;
  ementa: string;
  jurisdicao: 'FEDERAL' | 'ESTADUAL' | 'MUNICIPAL';
  uf?: string;
  dataInicioVigencia: string;
  dataFimVigencia?: string;
  linkOficial?: string;
  ativa: boolean;
}

export interface RegraTributaria {
  id: string;
  codigoRegra: string;
  descricao: string;
  tributo: 'ICMS' | 'ICMS_ST' | 'DIFAL' | 'FCP' | 'IPI' | 'PIS' | 'COFINS' | 'ISS' | 'IBS' | 'CBS' | 'IBS_CBS';
  tipoOperacao: TipoOperacao;
  ufOrigem?: string; // ou "TODAS"
  ufDestino?: string; // ou "TODAS"
  regimeTributario?: RegimeTributario;
  cfop?: string[];
  cstCsosn?: string[];
  ncm?: string[];
  aliquotaPadrao: number;
  aliquotaReduzida?: number;
  percentualReducaoBase?: number;
  percentualMva?: number;
  permiteCredito: boolean;
  monofasico?: boolean;
  aliquotaZero?: boolean;
  normaFundamento: NormaFiscal;
  grauConfianca: GrauConfianca;
  versao: number;
  vigenciaInicio: string;
  vigenciaFim?: string;
}

export interface ImpostoItem {
  // ICMS
  icmsCst: string;
  icmsBaseCalculo: number;
  icmsAliquota: number;
  icmsValor: number;
  icmsCalculado: number;
  icmsDiferenca: number;
  icmsCreditoAdmissivel: boolean;
  icmsValorCredito: number;

  // ICMS ST
  temSt: boolean;
  icmsStBaseCalculo: number;
  icmsStAliquota: number;
  icmsStMva: number;
  icmsStValor: number;
  icmsStCalculado: number;
  icmsStDiferenca: number;

  // DIFAL
  aplicaDifal: boolean;
  difalBaseCalculo?: number;
  difalAliquotaOrigem?: number;
  difalAliquotaDestino?: number;
  difalValor?: number;
  difalCalculado?: number;

  // FCP
  fcpAliquota: number;
  fcpValor: number;
  fcpCalculado: number;

  // IPI
  ipiCst: string;
  ipiBaseCalculo: number;
  ipiAliquota: number;
  ipiValor: number;
  ipiCalculado: number;
  ipiCreditoAdmissivel: boolean;

  // PIS
  pisCst: string;
  pisBaseCalculo: number;
  pisAliquota: number;
  pisValor: number;
  pisCalculado: number;
  pisCreditoAdmissivel: boolean;

  // COFINS
  cofinsCst: string;
  cofinsBaseCalculo: number;
  cofinsAliquota: number;
  cofinsValor: number;
  cofinsCalculado: number;
  cofinsCreditoAdmissivel: boolean;

  // IBS (Lei Complementar nº 214/2025)
  ibsCst: string;
  ibsBaseCalculo: number;
  ibsAliquota: number;
  ibsValor: number;
  ibsCalculado: number;
  ibsDiferenca: number;
  ibsCreditoAdmissivel: boolean;
  ibsValorCredito: number;

  // CBS (Lei Complementar nº 214/2025)
  cbsCst: string;
  cbsBaseCalculo: number;
  cbsAliquota: number;
  cbsValor: number;
  cbsCalculado: number;
  cbsDiferenca: number;
  cbsCreditoAdmissivel: boolean;
  cbsValorCredito: number;

  // FUST e FUNTTEL (Serviços de Telecomunicações / NFCom Modelo 62)
  fustAliquota?: number;
  fustValor?: number;
  funttelAliquota?: number;
  funttelValor?: number;

  // Retenções na Fonte & Tributos Federais (IR e CSLL)
  irAliquota?: number;
  irValor?: number;
  irBaseCalculo?: number;
  csllAliquota?: number;
  csllValor?: number;
  csllBaseCalculo?: number;
}

export interface FundamentacaoAnalise {
  tributo: string;
  regraCodigo: string;
  regraNome: string;
  hierarquiaNormativa: string;
  normaNome: string;
  artigo: string;
  paragrafo?: string;
  inciso?: string;
  vigencia: string;
  explicacao: string;
  fonteOficialUrl?: string;
  grauConfianca: GrauConfianca;
  acaoRecomendada: string;
}

export interface NcmSiscomexInfo {
  codigoNcm: string;
  codigoFormatado: string;
  descricaoOficial: string;
  capitulo: string;
  posicao: string;
  subposicao?: string;
  item?: string;
  subitem?: string;
  unidadeMedidaEstatistica?: string;
  dataInicioVigencia: string;
  dataFimVigencia?: string;
  situacaoVigencia: 'VIGENTE' | 'EXTINTA' | 'ALTERADA';
  aliquotaIpiTipiPadrao?: number;
  aliquotaIcmsPadraoReferencial?: number;
  aliquotaPisPadrao?: number;
  aliquotaCofinsPadrao?: number;
  aliquotaIbsTransicao?: number;
  aliquotaCbsTransicao?: number;
  regimeTributarioEspecial?: string;
  tratamentoAdministrativo?: string;
  urlSiscomexOficial: string;
  dataAtualizacaoSincronizacao: string;
}

export interface CnaeSecao {
  codigo: string; // Ex: "A", "C", "G", "J"
  titulo: string; // Ex: "INFORMAÇÃO E COMUNICAÇÃO"
  divisaoDe: string; // "58"
  divisaoAte: string; // "63"
  descricaoDetalhada?: string;
}

export interface CnaeInfo {
  codigo: string; // Formatado: "6201-5/01"
  codigoLimpo: string; // "6201501"
  descricao: string;
  secao: string;
  secaoCodigo: string;
  divisao: string;
  divisaoCodigo: string;
  grupo: string;
  grupoCodigo: string;
  classe: string;
  classeCodigo: string;
  subclasseCodigo: string;
  compreende?: string[];
  naoCompreende?: { descricao: string; cnaeAlternativo?: string }[];
  aliquotaRat: number; // 1, 2 ou 3 %
  grauRiscoTrabalho: 'LEVE (1%)' | 'MÉDIO (2%)' | 'GRAVE (3%)';
  fapSugerido: number;
  simplesNacional: {
    permitido: boolean;
    anexo: 'ANEXO_I' | 'ANEXO_II' | 'ANEXO_III' | 'ANEXO_IV' | 'ANEXO_V' | 'ANEXO_III_OU_V' | 'VEDADO';
    sujeitoFatorR: boolean;
    observacao: string;
  };
  desoneracaoFolhaCPRB: boolean;
  reformaTributaria: {
    regimeIbsCbs: 'PADRAO' | 'DIFERENCIADO' | 'REDUZIDO' | 'IMUNE_ISENTO' | 'MONOFASICO';
    descricao: string;
  };
  obrigacoesAcessorias: string[];
  urlConclaOficial: string;
  ultimaAtualizacao: string;
}

export interface ItemDocumentoFiscal {
  numeroItem: number;
  codigoProduto: string;
  descricao: string;
  ncm: string;
  ncmSiscomex?: NcmSiscomexInfo;
  cest?: string;
  cfop: string;
  uCom: string;
  qCom: number;
  vUnCom: number;
  vProd: number;
  vDesc: number;
  vFrete: number;
  vSeg: number;
  vOutro: number;
  origem: string;
  unidadeComercial?: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
  valorDesconto?: number;
  valorFrete?: number;
  valorSeguro?: number;
  valorOutrasDespesas?: number;
  impostos: ImpostoItem;
  ocorrencias: OcorrenciaAuditoria[];
  fundamentacoes: FundamentacaoAnalise[];
  statusAnalise: SeveridadeAuditoria;
}

export interface OcorrenciaAuditoria {
  id: string;
  itemNumero?: number;
  tributo: 'ICMS' | 'ICMS_ST' | 'DIFAL' | 'FCP' | 'IPI' | 'PIS' | 'COFINS' | 'IBS' | 'CBS' | 'IBS_CBS' | 'GERAL' | 'CADASTRO';
  tipo: string;
  severidade: SeveridadeAuditoria;
  descricao: string;
  valorInformado?: number;
  valorCalculado?: number;
  diferenca?: number;
  regraAplicada: string;
  fundamentacaoLegal: string;
  conclusao: string;
  acaoRecomendada: string;
  grauConfianca: GrauConfianca;
  resolvido: boolean;
  justificativaUsuario?: string;
}

export interface DocumentoFiscal {
  id: string;
  tipoDocumento: TipoDocumento;
  chaveAcesso: string;
  numero: string;
  serie: string;
  naturezaOperacao: string;
  dataEmissao: string;
  dataEntradaSaida?: string;
  tipoOperacao: TipoOperacao;
  finalidade: string;
  versaoSchema: string;

  emitente: Participante;
  destinatario: Participante;
  remetente?: Participante;
  expedidor?: Participante;
  recebedor?: Participante;
  tomador?: Participante;

  valorProdutos: number;
  valorFrete: number;
  valorSeguro: number;
  valorDesconto: number;
  valorOutrasDespesas: number;
  valorTotalDocumento: number;

  totalIcms: number;
  totalIcmsSt: number;
  totalIpi: number;
  totalPis: number;
  totalCofins: number;
  totalFust?: number;
  totalFunttel?: number;

  // Reforma Tributária (Lei Complementar nº 214/2025)
  totalIbs: number;
  totalCbs: number;
  totalCreditosIbsCbs: number;
  reformaTributariaLC214?: {
    faseTransicao2026: boolean;
    aliquotaIbsTeste: number; // 0.10%
    aliquotaCbsTeste: number; // 0.90%
    valorIbsApurado: number;
    valorCbsApurado: number;
    creditoIbsDisponivel: number;
    creditoCbsDisponivel: number;
    compensacaoPisCofins2026: boolean;
    naoCumulatividadePlena: boolean;
    fundamentacaoLC214: string;
  };

  totalCreditosApurados: number;
  totalDebitosApurados: number;
  totalDivergenciasValor: number;

  itens: ItemDocumentoFiscal[];
  ocorrencias: OcorrenciaAuditoria[];
  status: StatusDocumento;
  severidadeGeral: SeveridadeAuditoria;
  responsavelAprovacao?: string;
  dataAprovacao?: string;
  observacoes?: string;
  rawXml?: string;
  dadosEnergiaEletrica?: {
    idAcessoUC?: string;
    classeConsumo?: string;
    tipoFase?: string;
    tensaoFornecimento?: string;
    mesReferencia?: string;
    consumoKWh?: number;
    demandaKW?: number;
    tarifaTUSD?: number;
    tarifaTE?: number;
    laudoRateioIndustrialPercentual?: number;
  };
  dadosComunicacaoNFCom?: {
    idAssinante?: string;
    tipoAssinante?: string;
    tipoServico?: string;
    numeroContrato?: string;
    terminalOuCircuito?: string;
    periodoPrestacaoInicio?: string;
    periodoPrestacaoFim?: string;
    mesReferencia?: string;
    faturaNumero?: string;
    faturaVencimento?: string;
    valorFust?: number;
    valorFunttel?: number;
    aliquotaFust?: number;
    aliquotaFunttel?: number;
    laudoRateioUsoProdutivo?: number;
  };
  dadosTransporteCTe?: {
    modal?: 'RODOVIARIO' | 'AEREO' | 'AQUAVIARIO' | 'FERROVIARIO' | 'DUTOVIARIO' | 'MULTIMODAL';
    tipoServico?: 'NORMAL' | 'SUBCONTRATACAO' | 'REDESPACHO' | 'REDESPACHO_INTERMEDIARIO' | 'MULTIMODAL';
    tomadorPapel?: 'REMETENTE' | 'EXPEDIDOR' | 'RECEBEDOR' | 'DESTINATARIO' | 'OUTROS';
    municipioInicio?: string;
    ufInicio?: string;
    municipioFim?: string;
    ufFim?: string;
    produtoPredominante?: string;
    valorCargaAverbada?: number;
    pesoBrutoKg?: number;
    pesoCubadoKg?: number;
    quantidadeVolumes?: number;
    rntrc?: string;
    placaVeiculo?: string;
    ufVeiculo?: string;
    seguradoraNome?: string;
    apoliceSeguro?: string;
    chavesNFeAcobertadas?: string[];
    componentesFrete?: { nome: string; valor: number }[];
    direitoCreditoFrete?: boolean;
    tipoFrete?: 'FOB' | 'CIF';
  };
  manifestacaoDestinatario?: EventoManifestacaoDestinatario;
}

export type TipoEventoManifesto =
  | '210210' // Ciência da Emissão
  | '210200' // Confirmação da Operação
  | '210220' // Desconhecimento da Operação
  | '210240'; // Operação não Realizada

export interface EventoManifestacaoDestinatario {
  tipoEvento: TipoEventoManifesto;
  descricaoEvento: string;
  dataHoraEvento: string;
  protocoloSefaz?: string;
  justificativa?: string;
  responsavel: string;
  statusSefaz: 'REGISTRADO' | 'PENDENTE' | 'REJEITADO';
  origemAcesso: 'PORTAL_NACIONAL_NFE' | 'WEBSERVICE';
}

export interface RegistroTrilhaAuditoria {
  id: string;
  dataHora: string;
  usuario: string;
  perfilUsuario: string;
  usuarioNome?: string;
  usuarioEmail?: string;
  operacao: 'IMPORTACAO' | 'ANALISE_MOTOR' | 'APROVACAO' | 'ALTERACAO_MANUAL' | 'EXPORTACAO_SPED' | 'INTEGRACAO_PROTHEUS' | 'REJEICAO' | 'MANIFESTO_DESTINATARIO';
  documentoId: string;
  chaveAcesso: string;
  campoAlterado?: string;
  registroAnterior?: string;
  registroNovo?: string;
  justificativa: string;
  ipOrigem?: string;
  regrasExecutadas?: string[];
  divergenciasIdentificadas?: string[];
  versaoMotorRegras?: string;
}

export type Registro_GEPAT_Fiscal = RegistroTrilhaAuditoria;

export interface ResumoDashboard {
  totalDocumentos: number;
  valorTotalOperacoes: number;
  totalTributosCalculados: number;
  totalCreditosAdmissiveis: number;
  totalDebitosCalculados: number;
  totalDivergenciasValor: number;
  documentosAprovados: number;
  documentosComDivergencia: number;
  documentosPendentesRevisao: number;
  ocorrenciasPorSeveridade: Record<SeveridadeAuditoria, number>;
  ocorrenciasPorTributo: Record<string, number>;
  economiaTributariaPotencial: number;
  totalIbsGeral?: number;
  totalCbsGeral?: number;
  totalCreditosIbsCbsGeral?: number;
}
