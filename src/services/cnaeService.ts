import { CnaeInfo, CnaeSecao } from '../types/fiscal';
import { ReceitaFederalService } from './receitaFederalService';

export const CONCLA_PORTAL_URL = 'https://concla.ibge.gov.br/busca-online-cnae.html';
export const IBGE_API_BASE_URL = 'https://servicodados.ibge.gov.br/api/v2/cnae';

const CNAE_CACHE_KEY = 'TAXAUDIT_CNAE_CACHE_V1';

/**
 * 21 Seções Oficiais da Classificação Nacional de Atividades Econômicas (CNAE 2.3 / IBGE - CONCLA)
 */
export const SECOES_CNAE_OFICIAIS: CnaeSecao[] = [
  {
    codigo: 'A',
    titulo: 'AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA',
    divisaoDe: '01',
    divisaoAte: '03',
    descricaoDetalhada: 'Cultivo de espécies agrícolas, pecuária, silvicultura, exploração florestal e aqüicultura.'
  },
  {
    codigo: 'B',
    titulo: 'INDÚSTRIAS EXTRATIVAS',
    divisaoDe: '05',
    divisaoAte: '09',
    descricaoDetalhada: 'Extração de carvão mineral, petróleo, gás natural e minerais metálicos e não-metálicos.'
  },
  {
    codigo: 'C',
    titulo: 'INDÚSTRIAS DE TRANSFORMAÇÃO',
    divisaoDe: '10',
    divisaoAte: '33',
    descricaoDetalhada: 'Transformação física, química e biológica de materiais, substâncias ou componentes em novos produtos.'
  },
  {
    codigo: 'D',
    titulo: 'ELETRICIDADE E GÁS',
    divisaoDe: '35',
    divisaoAte: '35',
    descricaoDetalhada: 'Geração, transmissão, distribuição e comercialização de energia elétrica e produção e distribuição de gás.'
  },
  {
    codigo: 'E',
    titulo: 'ÁGUA, ESGOTO, ATIVIDADES DE GESTÃO DE RESÍDUOS E DESCONTAMINAÇÃO',
    divisaoDe: '36',
    divisaoAte: '39',
    descricaoDetalhada: 'Captação, tratamento e distribuição de água; esgoto e coleta, tratamento e disposição de resíduos.'
  },
  {
    codigo: 'F',
    titulo: 'CONSTRUÇÃO',
    divisaoDe: '41',
    divisaoAte: '43',
    descricaoDetalhada: 'Construção de edifícios, obras de infraestrutura e serviços especializados para construção.'
  },
  {
    codigo: 'G',
    titulo: 'COMÉRCIO; REPARAÇÃO DE VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    divisaoDe: '45',
    divisaoAte: '47',
    descricaoDetalhada: 'Comércio por atacado e a varejo e reparação e manutenção de veículos automotores e motocicletas.'
  },
  {
    codigo: 'H',
    titulo: 'TRANSPORTE, ARMAZENAGEM E CORREIO',
    divisaoDe: '49',
    divisaoAte: '53',
    descricaoDetalhada: 'Transporte de passageiros e carga (rodoviário, ferroviário, aquaviário, aéreo e dutoviário) e logística.'
  },
  {
    codigo: 'I',
    titulo: 'ALOJAMENTO E ALIMENTAÇÃO',
    divisaoDe: '55',
    divisaoAte: '56',
    descricaoDetalhada: 'Hotéis, apart-hotéis, pousadas, restaurantes, bares, lanchonetes e serviços de alimentação para eventos.'
  },
  {
    codigo: 'J',
    titulo: 'INFORMAÇÃO E COMUNICAÇÃO',
    divisaoDe: '58',
    divisaoAte: '63',
    descricaoDetalhada: 'Edição, produção audiovisual, rádio, televisão, telecomunicações, software e serviços de TI e hospedagem.'
  },
  {
    codigo: 'K',
    titulo: 'ATIVIDADES FINANCEIRAS, DE SEGUROS E SERVIÇOS RELACIONADOS',
    divisaoDe: '64',
    divisaoAte: '66',
    descricaoDetalhada: 'Intermediação monetária, bancos, cooperativas de crédito, seguros, previdência complementar e fundos.'
  },
  {
    codigo: 'L',
    titulo: 'ATIVIDADES IMOBILIÁRIAS',
    divisaoDe: '68',
    divisaoAte: '68',
    descricaoDetalhada: 'Compra, venda e aluguel de imóveis próprios e de terceiros e corretagem e administração no setor imobiliário.'
  },
  {
    codigo: 'M',
    titulo: 'ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS',
    divisaoDe: '69',
    divisaoAte: '75',
    descricaoDetalhada: 'Serviços jurídicos, contabilidade, auditoria, consultoria em gestão empresarial, arquitetura, engenharia e P&D.'
  },
  {
    codigo: 'N',
    titulo: 'ATIVIDADES ADMINISTRATIVAS E SERVIÇOS COMPLEMENTARES',
    divisaoDe: '77',
    divisaoAte: '82',
    descricaoDetalhada: 'Aluguel de bens móveis, recursos humanos, segurança privada, limpeza em prédios e teleatendimento.'
  },
  {
    codigo: 'O',
    titulo: 'ADMINISTRAÇÃO PÚBLICA, DEFESA E SEGURIDADE SOCIAL',
    divisaoDe: '84',
    divisaoAte: '84',
    descricaoDetalhada: 'Administração do Estado e das políticas econômicas e sociais, relações exteriores, defesa e seguridade social.'
  },
  {
    codigo: 'P',
    titulo: 'EDUCAÇÃO',
    divisaoDe: '85',
    divisaoAte: '85',
    descricaoDetalhada: 'Educação infantil, ensino fundamental, médio, profissionalizante, superior, pós-graduação e outros cursos.'
  },
  {
    codigo: 'Q',
    titulo: 'SAÚDE HUMANA E SERVIÇOS SOCIAIS',
    divisaoDe: '86',
    divisaoAte: '88',
    descricaoDetalhada: 'Hospitais, atendimento médico ambulatorial, odontologia, diagnósticos por imagem, laboratórios e assistência social.'
  },
  {
    codigo: 'R',
    titulo: 'ARTES, CULTURA, ESPORTE E RECREAÇÃO',
    divisaoDe: '90',
    divisaoAte: '93',
    descricaoDetalhada: 'Atividades artísticas e de espetáculos, museus, preservação de locais históricos, esportes e jogos de recreação.'
  },
  {
    codigo: 'S',
    titulo: 'OUTRAS ATIVIDADES DE SERVIÇOS',
    divisaoDe: '94',
    divisaoAte: '96',
    descricaoDetalhada: 'Organizações associativas sindicais e religiosas, reparação de computadores e lavanderias e cabeleireiros.'
  },
  {
    codigo: 'T',
    titulo: 'SERVIÇOS DOMÉSTICOS',
    divisaoDe: '97',
    divisaoAte: '97',
    descricaoDetalhada: 'Serviços prestados por empregados domésticos a famílias ou particulares.'
  },
  {
    codigo: 'U',
    titulo: 'ORGANISMOS INTERNACIONAIS E OUTRAS INSTITUIÇÕES EXTRATERRITORIAIS',
    divisaoDe: '99',
    divisaoAte: '99',
    descricaoDetalhada: 'Organização das Nações Unidas, OEA, representações diplomáticas e consulados estrangeiros.'
  }
];

/**
 * Dicionário Oficial CONCLA / IBGE enriquecido com Tributação, Previdência (RAT),
 * Simples Nacional, Reforma Tributária e Notas Explicativas completas
 */
const BASE_CNAE_CONCLA: Record<string, CnaeInfo> = {
  // 6201-5/01 - TI Software sob Encomenda
  '6201501': {
    codigo: '6201-5/01',
    codigoLimpo: '6201501',
    descricao: 'Desenvolvimento de programas de computador sob encomenda',
    secao: 'J - INFORMAÇÃO E COMUNICAÇÃO',
    secaoCodigo: 'J',
    divisao: '62 - ATIVIDADES DOS SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO',
    divisaoCodigo: '62',
    grupo: '62.0 - Atividades dos serviços de tecnologia da informação',
    grupoCodigo: '62.0',
    classe: '62.01-5 - Desenvolvimento de programas de computador sob encomenda',
    classeCodigo: '6201-5',
    subclasseCodigo: '6201-5/01',
    compreende: [
      'O desenvolvimento de sistemas e programas de computador (software) sob encomenda de clientes',
      'A programação e codificação de sistemas com especificações definidas sob medida',
      'O desenvolvimento de aplicativos para dispositivos móveis (smartphones, tablets) sob encomenda',
      'A personalização e adaptação de módulos e códigos fonte sob demanda do contratante'
    ],
    naoCompreende: [
      { descricao: 'Desenvolvimento e licenciamento de softwares customizáveis', cnaeAlternativo: '6202-3/00' },
      { descricao: 'Desenvolvimento e licenciamento de softwares padronizados / de prateleira', cnaeAlternativo: '6203-1/00' },
      { descricao: 'Consultoria e assessoria técnica em tecnologia da informação', cnaeAlternativo: '6204-0/00' }
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R (Art. 18, § 5º-J e 5º-M da LC 123/2006). Se Folha de Pagamento / Receita Bruta >= 28%, tributa no Anexo III (alíquota inicial de 6%). Caso inferior a 28%, tributa no Anexo V (iniciando em 15,50%).'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Tributação pelo IBS e CBS no regime não-cumulativo amplo (EC 132/2023). Gera direito a crédito integral sobre aquisições de insumos e tecnologia.'
    },
    obrigacoesAcessorias: ['EFD-Reinf', 'eSocial', 'PGDAS-D ou DCTFWeb', 'SPED Contribuições (se Lucro Presumido/Real)'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6201501',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6202-3/00 - Software customizável
  '6202300': {
    codigo: '6202-3/00',
    codigoLimpo: '6202300',
    descricao: 'Desenvolvimento e licenciamento de programas de computador customizáveis',
    secao: 'J - INFORMAÇÃO E COMUNICAÇÃO',
    secaoCodigo: 'J',
    divisao: '62 - ATIVIDADES DOS SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO',
    divisaoCodigo: '62',
    grupo: '62.0 - Atividades dos serviços de tecnologia da informação',
    grupoCodigo: '62.0',
    classe: '62.02-3 - Desenvolvimento e licenciamento de programas de computador customizáveis',
    classeCodigo: '6202-3',
    subclasseCodigo: '6202-3/00',
    compreende: [
      'O desenvolvimento e licenciamento de softwares que permitem adaptações e parametrizações pelo usuário final',
      'Sistemas de gestão empresarial ERP com módulos adaptáveis',
      'Manutenção e atualização de versões customizáveis de programas de computador'
    ],
    naoCompreende: [
      { descricao: 'Desenvolvimento exclusivo sob encomenda', cnaeAlternativo: '6201-5/01' },
      { descricao: 'Software não customizável de prateleira', cnaeAlternativo: '6203-1/00' }
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R. Tributa pelo Anexo III se folha/faturamento >= 28%, ou pelo Anexo V se inferior.'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Licenciamento e cessão de uso com incidência do IVA Dual (IBS e CBS) no destino.'
    },
    obrigacoesAcessorias: ['EFD-Reinf', 'eSocial', 'DCTFWeb', 'SPED EFD'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6202300',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6203-1/00 - Software não customizável (SaaS / Prateleira)
  '6203100': {
    codigo: '6203-1/00',
    codigoLimpo: '6203100',
    descricao: 'Desenvolvimento e licenciamento de programas de computador não-customizáveis',
    secao: 'J - INFORMAÇÃO E COMUNICAÇÃO',
    secaoCodigo: 'J',
    divisao: '62 - ATIVIDADES DOS SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO',
    divisaoCodigo: '62',
    grupo: '62.0 - Atividades dos serviços de tecnologia da informação',
    grupoCodigo: '62.0',
    classe: '62.03-1 - Desenvolvimento e licenciamento de programas de computador não-customizáveis',
    classeCodigo: '6203-1',
    subclasseCodigo: '6203-1/00',
    compreende: [
      'O desenvolvimento e licenciamento de programas de computador padronizados (softwares de prateleira)',
      'A comercialização e licenciamento de modelos SaaS (Software as a Service) prontos para consumo'
    ],
    naoCompreende: [
      { descricao: 'Desenvolvimento sob encomenda sob medida', cnaeAlternativo: '6201-5/01' }
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R com enquadramento no Anexo III ou Anexo V da LC 123/2006.'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Incidência uniforme do IBS/CBS sobre serviços digitais e softwares padronizados.'
    },
    obrigacoesAcessorias: ['EFD-Reinf', 'eSocial', 'PGDAS-D', 'SPED EFD Contribuições'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6203100',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6204-0/00 - Consultoria em TI
  '6204000': {
    codigo: '6204-0/00',
    codigoLimpo: '6204000',
    descricao: 'Consultoria em tecnologia da informação',
    secao: 'J - INFORMAÇÃO E COMUNICAÇÃO',
    secaoCodigo: 'J',
    divisao: '62 - ATIVIDADES DOS SERVIÇOS DE TECNOLOGIA DA INFORMAÇÃO',
    divisaoCodigo: '62',
    grupo: '62.0 - Atividades dos serviços de tecnologia da informação',
    grupoCodigo: '62.0',
    classe: '62.04-0 - Consultoria em tecnologia da informação',
    classeCodigo: '6204-0',
    subclasseCodigo: '6204-0/00',
    compreende: [
      'A assessoria e consultoria especializada em sistemas e infraestrutura de tecnologia da informação',
      'Diagnóstico de necessidades de hardware e software e arquitetura de dados'
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R (Anexo III se folha >= 28%, Anexo V se menor).'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Regime Geral do IBS e CBS com crédito pleno aos tomadores do serviço.'
    },
    obrigacoesAcessorias: ['EFD-Reinf', 'eSocial', 'DCTFWeb'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6204000',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4649-4/08 - Comércio Atacadista Higiene / Limpeza
  '4649408': {
    codigo: '4649-4/08',
    codigoLimpo: '4649408',
    descricao: 'Comércio atacadista de produtos de higiene, limpeza e conservação domiciliar',
    secao: 'G - COMÉRCIO; REPARAÇÃO DE VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    secaoCodigo: 'G',
    divisao: '46 - COMÉRCIO POR ATACADO, EXCETO VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    divisaoCodigo: '46',
    grupo: '46.4 - Comércio atacadista de artigos de uso pessoal e doméstico',
    grupoCodigo: '46.4',
    classe: '46.49-4 - Comércio atacadista de outros artigos de uso pessoal e doméstico não especificados anteriormente',
    classeCodigo: '4649-4',
    subclasseCodigo: '4649-4/08',
    compreende: [
      'O comércio atacadista de produtos de higiene pessoal e beleza',
      'O comércio atacadista de produtos de limpeza, saneantes e desinfetantes domiciliares',
      'O comércio atacadista de vassouras, panos de limpeza e artigos de conservação'
    ],
    naoCompreende: [
      { descricao: 'Comércio varejista de cosméticos e higiene', cnaeAlternativo: '4772-5/00' }
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Tributação pelo Anexo I do Simples Nacional (Comércio). Permite segregação de receitas para produtos com Substituição Tributária (ICMS-ST) ou PIS/COFINS Monofásico.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Incidência no destino com compensação automática dos créditos de entrada da indústria.'
    },
    obrigacoesAcessorias: ['SPED Fiscal (EFD ICMS/IPI)', 'EFD Contribuições', 'SPED ECF/ECD', 'NF-e Modelo 55'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4649408',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4651-6/01 - Comércio atacadista de equipamentos de informática
  '4651601': {
    codigo: '4651-6/01',
    codigoLimpo: '4651601',
    descricao: 'Comércio atacadista de equipamentos de informática',
    secao: 'G - COMÉRCIO; REPARAÇÃO DE VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    secaoCodigo: 'G',
    divisao: '46 - COMÉRCIO POR ATACADO, EXCETO VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    divisaoCodigo: '46',
    grupo: '46.5 - Comércio atacadista de equipamentos e produtos de tecnologia da informação e comunicação',
    grupoCodigo: '46.5',
    classe: '46.51-6 - Comércio atacadista de computadores, periféricos e suprimentos de informática',
    classeCodigo: '4651-6',
    subclasseCodigo: '4651-6/01',
    compreende: [
      'O comércio atacadista de computadores, notebooks, servidores e estações de trabalho',
      'O comércio atacadista de impressoras, monitores, periféricos e peças para computador'
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Tributa no Anexo I (Comércio). Possibilidade de redução por benefício da Lei de Informática / PPB.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Crédito financeiro total nas compras e débito nas saídas interestaduais/internas.'
    },
    obrigacoesAcessorias: ['SPED Fiscal EFD', 'EFD Contribuições', 'Manifestação do Destinatário MD-e'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4651601',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4751-2/01 - Varejo Informática
  '4751201': {
    codigo: '4751-2/01',
    codigoLimpo: '4751201',
    descricao: 'Comércio varejista especializado de equipamentos e suprimentos de informática',
    secao: 'G - COMÉRCIO; REPARAÇÃO DE VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    secaoCodigo: 'G',
    divisao: '47 - COMÉRCIO VAREJISTA',
    divisaoCodigo: '47',
    grupo: '47.5 - Comércio varejista de artigos de uso doméstico',
    grupoCodigo: '47.5',
    classe: '47.51-2 - Comércio varejista especializado de equipamentos e suprimentos de informática',
    classeCodigo: '4751-2',
    subclasseCodigo: '4751-2/01',
    compreende: [
      'O comércio a varejo de computadores, impressoras e periféricos',
      'O comércio de suprimentos de informática (cartuchos, cabos, componentes)'
    ],
    aliquotaRat: 1.0,
    grauRiscoTrabalho: 'LEVE (1%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Anexo I do Simples Nacional com alíquota inicial a partir de 4,00%.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Vendas ao consumidor final com retenção de IBS e CBS no ponto de venda.'
    },
    obrigacoesAcessorias: ['NFC-e / CF-e SAT', 'SPED Fiscal EFD', 'DEFIS'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4751201',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4711-3/02 - Supermercados
  '4711302': {
    codigo: '4711-3/02',
    codigoLimpo: '4711302',
    descricao: 'Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios - supermercados',
    secao: 'G - COMÉRCIO; REPARAÇÃO DE VEÍCULOS AUTOMOTORES E MOTOCICLETAS',
    secaoCodigo: 'G',
    divisao: '47 - COMÉRCIO VAREJISTA',
    divisaoCodigo: '47',
    grupo: '47.1 - Comércio varejista não-especializado',
    grupoCodigo: '47.1',
    classe: '47.11-3 - Comércio varejista de mercadorias em geral, com predominância de produtos alimentícios',
    classeCodigo: '4711-3',
    subclasseCodigo: '4711-3/02',
    compreende: [
      'Comércio varejista com área de venda entre 300 e 5.000 metros quadrados',
      'Comercialização ampla de alimentos frescos, enlatados, carnes, laticínios, bebidas e bazar'
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.2,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Anexo I com segregação extensiva de Cesta Básica, ICMS-ST e Monofásicos de PIS/COFINS.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'REDUZIDO',
      descricao: 'Beneficiado com Alíquota Zero para itens da Cesta Básica Nacional de Alimentos e redução de 60% para produtos agropecuários.'
    },
    obrigacoesAcessorias: ['SPED Fiscal ICMS/IPI', 'EFD Contribuições Bloco C', 'NFC-e Sincronizada'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4711302',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4930-2/02 - Transporte Rodoviário de Carga Intermunicipal/Interestadual
  '4930202': {
    codigo: '4930-2/02',
    codigoLimpo: '4930202',
    descricao: 'Transporte rodoviário de carga, exceto produtos perigosos e mudanças, intermunicipal, interestadual e internacional',
    secao: 'H - TRANSPORTE, ARMAZENAGEM E CORREIO',
    secaoCodigo: 'H',
    divisao: '49 - TRANSPORTE TERRESTRE',
    divisaoCodigo: '49',
    grupo: '49.3 - Transporte rodoviário de carga',
    grupoCodigo: '49.3',
    classe: '49.30-2 - Transporte rodoviário de carga',
    classeCodigo: '4930-2',
    subclasseCodigo: '4930-2/02',
    compreende: [
      'O transporte rodoviário de carga intermunicipal e interestadual acobertado por CT-e (Conhecimento de Transporte Eletrônico)',
      'A operação de frotas rodoviárias de carga geral e carretas'
    ],
    naoCompreende: [
      { descricao: 'Transporte rodoviário de produtos perigosos', cnaeAlternativo: '4930-2/03' },
      { descricao: 'Transporte municipal de carga (sujeito ao ISSQN)', cnaeAlternativo: '4930-2/01' }
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.5,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III',
      sujeitoFatorR: false,
      observacao: 'Tributado pelo Anexo III do Simples Nacional com dedução de parcela do ICMS referente aos serviços intermunicipais/interestaduais.'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Serviços de transporte interestadual terão crédito amplo de combustíveis e pneus, gerando crédito financeiro ao tomador.'
    },
    obrigacoesAcessorias: ['CT-e Modelo 57', 'MDF-e Modelo 58', 'SPED Fiscal EFD', 'RNTRC / ANTT'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4930202',
    ultimaAtualizacao: '2026-03-01'
  },

  // 2599-3/99 - Fabricação de outros produtos de metal
  '2599399': {
    codigo: '2599-3/99',
    codigoLimpo: '2599399',
    descricao: 'Fabricação de outros produtos de metal não especificados anteriormente',
    secao: 'C - INDÚSTRIAS DE TRANSFORMAÇÃO',
    secaoCodigo: 'C',
    divisao: '25 - FABRICAÇÃO DE PRODUTOS DE METAL, EXCETO MÁQUINAS E EQUIPAMENTOS',
    divisaoCodigo: '25',
    grupo: '25.9 - Fabricação de produtos de metal diversos',
    grupoCodigo: '25.9',
    classe: '25.99-3 - Fabricação de produtos de metal não especificados anteriormente',
    classeCodigo: '2599-3',
    subclasseCodigo: '2599-3/99',
    compreende: [
      'A fabricação de artefatos de ferro fundido, aço e metais não ferrosos sob encomenda ou série',
      'Estruturas auxiliares, suportes, esquadrias pesadas e peças de metalurgia mecânica'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.3,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_II',
      sujeitoFatorR: false,
      observacao: 'Tributa pelo Anexo II do Simples Nacional (Indústria), sujeito ao recolhimento do IPI na tabela TIPI.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Crédito financeiro de todas as aquisições de aço e energia elétrica consumida no processo produtivo.'
    },
    obrigacoesAcessorias: ['SPED Fiscal (Bloco K - Controle da Produção e Estoque)', 'EFD ICMS/IPI', 'eSocial SST'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=2599399',
    ultimaAtualizacao: '2026-03-01'
  },

  // 2710-4/01 - Fabricação de geradores e motores elétricos
  '2710401': {
    codigo: '2710-4/01',
    codigoLimpo: '2710401',
    descricao: 'Fabricação de geradores, transformadores e motores elétricos',
    secao: 'C - INDÚSTRIAS DE TRANSFORMAÇÃO',
    secaoCodigo: 'C',
    divisao: '27 - FABRICAÇÃO DE MÁQUINAS, APARELHOS E MATERIAIS ELÉTRICOS',
    divisaoCodigo: '27',
    grupo: '27.1 - Fabricação de geradores, transformadores e motores elétricos',
    grupoCodigo: '27.1',
    classe: '27.10-4 - Fabricação de geradores, transformadores e motores elétricos',
    classeCodigo: '2710-4',
    subclasseCodigo: '2710-4/01',
    compreende: [
      'A fabricação de motores elétricos de corrente contínua e alternada',
      'A fabricação de geradores e conjuntos motogeradores',
      'A fabricação de transformadores de potência para distribuição'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.2,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_II',
      sujeitoFatorR: false,
      observacao: 'Tributa pelo Anexo II do Simples Nacional.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Regime não-cumulativo pleno do IVA Dual.'
    },
    obrigacoesAcessorias: ['Bloco K SPED', 'EFD Contribuições', 'SPED Fiscal'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=2710401',
    ultimaAtualizacao: '2026-03-01'
  },

  // 2013-4/02 - Química Industrial e Fertilizantes
  '2013402': {
    codigo: '2013-4/02',
    codigoLimpo: '2013402',
    descricao: 'Fabricação de intermediários para fertilizantes e reagentes químicos',
    secao: 'C - INDÚSTRIAS DE TRANSFORMAÇÃO',
    secaoCodigo: 'C',
    divisao: '20 - FABRICAÇÃO DE PRODUTOS QUÍMICOS',
    divisaoCodigo: '20',
    grupo: '20.1 - Fabricação de produtos químicos inorgânicos',
    grupoCodigo: '20.1',
    classe: '20.13-4 - Fabricação de adubos e fertilizantes',
    classeCodigo: '2013-4',
    subclasseCodigo: '2013-4/02',
    compreende: [
      'A produção de intermediários químicos, ureia, ácido nítrico, sulfato de amônio e compostos minerais'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.8,
    simplesNacional: {
      permitido: false,
      anexo: 'VEDADO',
      sujeitoFatorR: false,
      observacao: 'Indústria química de grande escala sujeita a licenciamento ambiental e porte impeditivo do Simples.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'REDUZIDO',
      descricao: 'Insumos agropecuários possuem redução de 60% ou Alíquota Zero de IBS/CBS na Reforma Tributária.'
    },
    obrigacoesAcessorias: ['SPED Fiscal ICMS/IPI', 'Bloco K', 'Polícia Federal Químicos', 'IBAMA / CTF'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=2013402',
    ultimaAtualizacao: '2026-03-01'
  },

  // 2121-1/01 - Farmacêutica
  '2121101': {
    codigo: '2121-1/01',
    codigoLimpo: '2121101',
    descricao: 'Fabricação de medicamentos alopáticos para uso humano',
    secao: 'C - INDÚSTRIAS DE TRANSFORMAÇÃO',
    secaoCodigo: 'C',
    divisao: '21 - FABRICAÇÃO DE PRODUTOS FARMOQUÍMICOS E FARMACÊUTICOS',
    divisaoCodigo: '21',
    grupo: '21.2 - Fabricação de produtos farmacêuticos',
    grupoCodigo: '21.2',
    classe: '21.21-1 - Fabricação de medicamentos para uso humano',
    classeCodigo: '2121-1',
    subclasseCodigo: '2121-1/01',
    compreende: [
      'A fabricação de remédios, antibióticos, comprimidos, soluções injetáveis e medicamentos com receita'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.4,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_II',
      sujeitoFatorR: false,
      observacao: 'Anexo II com PIS/COFINS sob regime especial da Lei 10.147/2000 (Monofásico na indústria).'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'REDUZIDO',
      descricao: 'Medicamentos essenciais e fórmulas de alto custo terão isenção ou redução de 60% a 100% no IBS/CBS.'
    },
    obrigacoesAcessorias: ['ANVISA / Rastreabilidade', 'SPED Fiscal', 'EFD Contribuições'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=2121101',
    ultimaAtualizacao: '2026-03-01'
  },

  // 3511-5/01 - Geração de Energia Elétrica
  '3511501': {
    codigo: '3511-5/01',
    codigoLimpo: '3511501',
    descricao: 'Geração de energia elétrica',
    secao: 'D - ELETRICIDADE E GÁS',
    secaoCodigo: 'D',
    divisao: '35 - ELETRICIDADE, GÁS E OUTRAS UTILIDADES',
    divisaoCodigo: '35',
    grupo: '35.1 - Geração, transmissão e distribuição de energia elétrica',
    grupoCodigo: '35.1',
    classe: '35.11-5 - Geração de energia elétrica',
    classeCodigo: '3511-5',
    subclasseCodigo: '3511-5/01',
    compreende: [
      'A geração de energia hidrelétrica, termoelétrica, eólica, solar fotovoltaica e biomassa para rede'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.5,
    simplesNacional: {
      permitido: false,
      anexo: 'VEDADO',
      sujeitoFatorR: false,
      observacao: 'Vedado ao Simples Nacional por expressa vedação do art. 17 da LC 123/2006.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Energia elétrica é considerada insumo produtivo essencial; gera crédito integral para a indústria compradora.'
    },
    obrigacoesAcessorias: ['NF3e Modelo 66', 'CCEE', 'ANEEL', 'SPED Fiscal EFD'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=3511501',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6110-8/01 - Telefonia e Telecomunicações
  '6110801': {
    codigo: '6110-8/01',
    codigoLimpo: '6110801',
    descricao: 'Serviços de telefonia fixa comutada - STFC',
    secao: 'J - INFORMAÇÃO E COMUNICAÇÃO',
    secaoCodigo: 'J',
    divisao: '61 - TELECOMUNICAÇÕES',
    divisaoCodigo: '61',
    grupo: '61.1 - Telecomunicações por fio',
    grupoCodigo: '61.1',
    classe: '61.10-8 - Telecomunicações por fio',
    classeCodigo: '6110-8',
    subclasseCodigo: '6110-8/01',
    compreende: [
      'A prestação de serviços de telefonia fixa local, longa distância nacional e internacional',
      'Operação de redes e centrais comutadas'
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: false,
      anexo: 'VEDADO',
      sujeitoFatorR: false,
      observacao: 'Atividade de telecomunicações sob concessão/autorização da ANATEL vedada ao Simples Nacional.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Emissão obrigatória da Nota Fiscal Fatura de Serviços de Comunicação Eletrônica (NFCom Modelo 62).'
    },
    obrigacoesAcessorias: ['NFCom Modelo 62', 'FUST / FUNTTEL', 'ANATEL', 'SPED Fiscal'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6110801',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6920-6/01 - Atividades de Contabilidade
  '6920601': {
    codigo: '6920-6/01',
    codigoLimpo: '6920601',
    descricao: 'Atividades de contabilidade',
    secao: 'M - ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS',
    secaoCodigo: 'M',
    divisao: '69 - ATIVIDADES JURÍDICAS, DE CONTABILIDADE E DE AUDITORIA',
    divisaoCodigo: '69',
    grupo: '69.2 - Atividades de contabilidade, consultoria e auditoria contábil e tributária',
    grupoCodigo: '69.2',
    classe: '69.20-6 - Atividades de contabilidade, consultoria e auditoria contábil e tributária',
    classeCodigo: '6920-6',
    subclasseCodigo: '6920-6/01',
    compreende: [
      'O registro e escrituração contábil e fiscal de transações comerciais de empresas e entidades',
      'A elaboração de balanços, balancetes e demonstrações financeiras',
      'A apuração de impostos e elaboração de declarações fiscais e de rendimentos',
      'A assessoria e consultoria contábil rotineira'
    ],
    naoCompreende: [
      { descricao: 'Auditoria contábil e parecer de demonstrações financeiras', cnaeAlternativo: '6920-6/02' },
      { descricao: 'Consultoria em gestão empresarial estratégica', cnaeAlternativo: '7020-4/00' }
    ],
    aliquotaRat: 1.0,
    grauRiscoTrabalho: 'LEVE (1%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III',
      sujeitoFatorR: false,
      observacao: 'Permitido no Anexo III do Simples Nacional (NÃO sujeito ao Fator R, conforme expressamente garantido pelo art. 18, § 5º-B, inciso XIV da LC 123/2006). Alíquota inicial de 6%.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'DIFERENCIADO',
      descricao: 'Profissões regulamentadas (CRC) contam com regime diferenciado de redução de alíquotas na Reforma Tributária.'
    },
    obrigacoesAcessorias: ['DEFIS', 'eSocial', 'EFD-Reinf', 'DCTFWeb', 'Registro no CRC'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6920601',
    ultimaAtualizacao: '2026-03-01'
  },

  // 6911-7/01 - Serviços Advocatícios
  '6911701': {
    codigo: '6911-7/01',
    codigoLimpo: '6911701',
    descricao: 'Serviços advocatícios',
    secao: 'M - ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS',
    secaoCodigo: 'M',
    divisao: '69 - ATIVIDADES JURÍDICAS, DE CONTABILIDADE E DE AUDITORIA',
    divisaoCodigo: '69',
    grupo: '69.1 - Atividades jurídicas',
    grupoCodigo: '69.1',
    classe: '69.11-7 - Atividades jurídicas',
    classeCodigo: '6911-7',
    subclasseCodigo: '6911-7/01',
    compreende: [
      'A representação jurídica de interesses de uma das partes perante tribunais ou outros órgãos judiciais',
      'A assessoria e consultoria jurídica em matérias civil, criminal, trabalhista e tributária'
    ],
    aliquotaRat: 1.0,
    grauRiscoTrabalho: 'LEVE (1%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_IV',
      sujeitoFatorR: false,
      observacao: 'Tributado exclusivamente pelo Anexo IV do Simples Nacional. A contribuição previdenciária patronal (INSS 20%) NÃO está inclusa na guia DAS e deve ser recolhida em GPS/DCTFWeb.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'DIFERENCIADO',
      descricao: 'Serviços de advocacia (OAB) possuem redução de 30% nas alíquotas de IBS/CBS na Reforma Tributária.'
    },
    obrigacoesAcessorias: ['DCTFWeb (INSS Patronal)', 'eSocial', 'EFD-Reinf', 'NFS-e'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=6911701',
    ultimaAtualizacao: '2026-03-01'
  },

  // 7112-0/00 - Serviços de Engenharia
  '7112000': {
    codigo: '7112-0/00',
    codigoLimpo: '7112000',
    descricao: 'Serviços de engenharia',
    secao: 'M - ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS',
    secaoCodigo: 'M',
    divisao: '71 - SERVIÇOS DE ARQUITETURA E ENGENHARIA; TESTES E ANÁLISES TÉCNICAS',
    divisaoCodigo: '71',
    grupo: '71.1 - Serviços de arquitetura e engenharia e atividades técnicas relacionadas',
    grupoCodigo: '71.1',
    classe: '71.12-0 - Serviços de engenharia',
    classeCodigo: '7112-0',
    subclasseCodigo: '7112-0/00',
    compreende: [
      'Os serviços de elaboração de projetos e consultoria em engenharia civil, mecânica, elétrica, química e ambiental',
      'Gerenciamento e fiscalização técnica de obras e perícias de engenharia'
    ],
    aliquotaRat: 1.0,
    grauRiscoTrabalho: 'LEVE (1%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R. Tributa pelo Anexo III se folha/receita >= 28%, ou pelo Anexo V se inferior.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'DIFERENCIADO',
      descricao: 'Profissões regulamentadas (CREA/CONFEA) com regime diferenciado de alíquota reduzida.'
    },
    obrigacoesAcessorias: ['ART (Anotação de Responsabilidade Técnica)', 'NFS-e', 'DCTFWeb', 'eSocial'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=7112000',
    ultimaAtualizacao: '2026-03-01'
  },

  // 7020-4/00 - Consultoria em Gestão Empresarial
  '7020400': {
    codigo: '7020-4/00',
    codigoLimpo: '7020400',
    descricao: 'Atividades de consultoria em gestão empresarial, exceto consultoria técnica específica',
    secao: 'M - ATIVIDADES PROFISSIONAIS, CIENTÍFICAS E TÉCNICAS',
    secaoCodigo: 'M',
    divisao: '70 - ATIVIDADES DE SEDES DE EMPRESAS E DE CONSULTORIA EM GESTÃO EMPRESARIAL',
    divisaoCodigo: '70',
    grupo: '70.2 - Atividades de consultoria em gestão empresarial',
    grupoCodigo: '70.2',
    classe: '70.20-4 - Atividades de consultoria em gestão empresarial',
    classeCodigo: '7020-4',
    subclasseCodigo: '7020-4/00',
    compreende: [
      'A assessoria, consultoria e orientação estratégica em gestão corporativa, planejamento e finanças'
    ],
    aliquotaRat: 1.0,
    grauRiscoTrabalho: 'LEVE (1%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Sujeito ao Fator R. Tributa pelo Anexo III se folha/faturamento >= 28%, ou pelo Anexo V.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'PADRAO',
      descricao: 'Incidência de IBS/CBS na modalidade prestação de serviços.'
    },
    obrigacoesAcessorias: ['NFS-e', 'DCTFWeb', 'eSocial'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=7020400',
    ultimaAtualizacao: '2026-03-01'
  },

  // 8610-1/01 - Atividades de Atendimento Hospitalar
  '8610101': {
    codigo: '8610-1/01',
    codigoLimpo: '8610101',
    descricao: 'Atividades de atendimento hospitalar, exceto pronto-socorro e unidades para atendimento a urgências',
    secao: 'Q - SAÚDE HUMANA E SERVIÇOS SOCIAIS',
    secaoCodigo: 'Q',
    divisao: '86 - ATIVIDADES DE ATENÇÃO À SAÚDE HUMANA',
    divisaoCodigo: '86',
    grupo: '86.1 - Atividades de atendimento hospitalar',
    grupoCodigo: '86.1',
    classe: '86.10-1 - Atividades de atendimento hospitalar',
    classeCodigo: '8610-1',
    subclasseCodigo: '8610-1/01',
    compreende: [
      'As atividades de internação hospitalar sob supervisão direta de médicos especialistas',
      'Leitos cirúrgicos, enfermarias, centros de tratamento intensivo (UTI) e clínicas especializadas'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.5,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_III_OU_V',
      sujeitoFatorR: true,
      observacao: 'Permitido pelo Anexo III se folha >= 28%, ou Anexo V da LC 123/2006.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'REDUZIDO',
      descricao: 'Serviços de saúde possuem redução constitucional de 60% nas alíquotas de IBS e CBS.'
    },
    obrigacoesAcessorias: ['DMED (Declaração de Serviços Médicos)', 'eSocial Saúde SST', 'NFS-e'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=8610101',
    ultimaAtualizacao: '2026-03-01'
  },

  // 4120-4/00 - Construção de Edifícios
  '4120400': {
    codigo: '4120-4/00',
    codigoLimpo: '4120400',
    descricao: 'Construção de edifícios',
    secao: 'F - CONSTRUÇÃO',
    secaoCodigo: 'F',
    divisao: '41 - CONSTRUÇÃO DE EDIFÍCIOS',
    divisaoCodigo: '41',
    grupo: '41.2 - Construção de edifícios',
    grupoCodigo: '41.2',
    classe: '41.20-4 - Construção de edifícios',
    classeCodigo: '4120-4',
    subclasseCodigo: '4120-4/00',
    compreende: [
      'A construção de edifícios residenciais, comerciais, industriais e públicos',
      'Reformas amplas e ampliações estruturais de edifícios'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.6,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_IV',
      sujeitoFatorR: false,
      observacao: 'Tributado pelo Anexo IV do Simples Nacional com INSS patronal recolhido à parte (20% sobre folha de pagamento).'
    },
    desoneracaoFolhaCPRB: true,
    reformaTributaria: {
      regimeIbsCbs: 'DIFERENCIADO',
      descricao: 'Regime específico para operações com bens imóveis, incorporação e construção civil com redutores de base de cálculo.'
    },
    obrigacoesAcessorias: ['CNO (Cadastro Nacional de Obras)', 'SERO (Serviço Eletrônico para Aferição de Obras)', 'eSocial'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=4120400',
    ultimaAtualizacao: '2026-03-01'
  },

  // 5611-2/01 - Restaurantes e similares
  '5611201': {
    codigo: '5611-2/01',
    codigoLimpo: '5611201',
    descricao: 'Restaurantes e similares',
    secao: 'I - ALOJAMENTO E ALIMENTAÇÃO',
    secaoCodigo: 'I',
    divisao: '56 - ALIMENTAÇÃO',
    divisaoCodigo: '56',
    grupo: '56.1 - Restaurantes e outros serviços de alimentação e bebidas',
    grupoCodigo: '56.1',
    classe: '56.11-2 - Restaurantes e outros serviços de alimentação e bebidas',
    classeCodigo: '5611-2',
    subclasseCodigo: '5611-2/01',
    compreende: [
      'Serviços de alimentação com consumo no local, buffet, self-service e restaurantes à la carte',
      'Fornecimento de refeições preparadas e bebidas'
    ],
    aliquotaRat: 2.0,
    grauRiscoTrabalho: 'MÉDIO (2%)',
    fapSugerido: 1.0,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Tributado pelo Anexo I do Simples Nacional.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'DIFERENCIADO',
      descricao: 'Regime diferenciado para bares e restaurantes previsto na Lei Complementar da Reforma Tributária.'
    },
    obrigacoesAcessorias: ['NFC-e', 'SPED Fiscal', 'DeSTDA'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=5611201',
    ultimaAtualizacao: '2026-03-01'
  },

  // 0115-6/00 - Cultivo de Soja
  '0115600': {
    codigo: '0115-6/00',
    codigoLimpo: '0115600',
    descricao: 'Cultivo de soja',
    secao: 'A - AGRICULTURA, PECUÁRIA, PRODUÇÃO FLORESTAL, PESCA E AQÜICULTURA',
    secaoCodigo: 'A',
    divisao: '01 - AGRICULTURA, PECUÁRIA E SERVIÇOS RELACIONADOS',
    divisaoCodigo: '01',
    grupo: '01.1 - Produção de lavouras temporárias',
    grupoCodigo: '01.1',
    classe: '01.15-6 - Cultivo de soja',
    classeCodigo: '0115-6',
    subclasseCodigo: '0115-6/00',
    compreende: [
      'O cultivo de soja para grãos e produção de sementes certificadas'
    ],
    aliquotaRat: 3.0,
    grauRiscoTrabalho: 'GRAVE (3%)',
    fapSugerido: 1.2,
    simplesNacional: {
      permitido: true,
      anexo: 'ANEXO_I',
      sujeitoFatorR: false,
      observacao: 'Produtor rural com opção pelo Funrural ou recolhimento via Simples Anexo I.'
    },
    desoneracaoFolhaCPRB: false,
    reformaTributaria: {
      regimeIbsCbs: 'REDUZIDO',
      descricao: 'Produtos agropecuários in natura contam com redução de 60% da alíquota e produtor integrado com crédito presumido.'
    },
    obrigacoesAcessorias: ['NF-e Produtor Rural Modelo 55', 'eSocial Funrural'],
    urlConclaOficial: 'https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=0115600',
    ultimaAtualizacao: '2026-03-01'
  }
};

export class CnaeService {
  /**
   * Remove formatação de código CNAE (retorna apenas dígitos numéricos)
   * Ex: "6201-5/01" -> "6201501"
   */
  public static limparCnae(codigo: string): string {
    if (!codigo) return '';
    return codigo.replace(/\D/g, '');
  }

  /**
   * Formata código CNAE para o padrão oficial CONCLA / IBGE (ex: 6201-5/01 ou 6201-5)
   */
  public static formatarCnae(codigo: string): string {
    const limpo = this.limparCnae(codigo);
    if (!limpo) return '';

    if (limpo.length === 7) {
      // 6201501 -> 6201-5/01
      return `${limpo.slice(0, 4)}-${limpo.slice(4, 5)}/${limpo.slice(5, 7)}`;
    } else if (limpo.length === 5) {
      // 62015 -> 6201-5
      return `${limpo.slice(0, 4)}-${limpo.slice(4, 5)}`;
    } else if (limpo.length === 4) {
      // 6201 -> 6201
      return limpo;
    }
    return codigo;
  }

  /**
   * Recupera cache de CNAEs gravados localmente
   */
  private static getCache(): Record<string, CnaeInfo> {
    try {
      const raw = localStorage.getItem(CNAE_CACHE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback silencioso
    }
    return {};
  }

  /**
   * Salva no cache local
   */
  private static saveCache(cod: string, info: CnaeInfo): void {
    try {
      const cache = this.getCache();
      cache[cod] = info;
      localStorage.setItem(CNAE_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // ignore
    }
  }

  /**
   * Consulta um código CNAE específico (busca na base embutida, cache local ou API do IBGE)
   */
  public static async consultarCnae(termoOuCodigo: string): Promise<CnaeInfo | null> {
    const limpo = this.limparCnae(termoOuCodigo);
    const formatado = this.formatarCnae(termoOuCodigo);

    // 1. Verifica se está na base oficial pré-carregada
    if (BASE_CNAE_CONCLA[limpo]) {
      return BASE_CNAE_CONCLA[limpo];
    }

    // 2. Verifica se está no cache local do usuário
    const cache = this.getCache();
    if (cache[limpo]) {
      return cache[limpo];
    }

    // 3. Tenta consultar a API de Dados do IBGE / CONCLA oficial
    if (limpo.length >= 5) {
      try {
        const idConsulta = limpo.slice(0, 7);
        const resp = await fetch(`${IBGE_API_BASE_URL}/subclasses/${idConsulta}`, {
          headers: { Accept: 'application/json' }
        });

        if (resp.ok) {
          const dadosArray = await resp.json();
          const item = Array.isArray(dadosArray) ? dadosArray[0] : dadosArray;

          if (item && item.id) {
            const secaoCod = item.classe?.grupo?.divisao?.secao?.id || 'J';
            const secaoNome = item.classe?.grupo?.divisao?.secao?.nome || 'ATIVIDADES DIVERSAS';
            const divisaoCod = item.classe?.grupo?.divisao?.id || limpo.slice(0, 2);
            const divisaoNome = item.classe?.grupo?.divisao?.nome || '';
            const grupoCod = item.classe?.grupo?.id || '';
            const grupoNome = item.classe?.grupo?.nome || '';
            const classeCod = item.classe?.id || '';
            const classeNome = item.classe?.nome || '';
            const descricao = item.descricao || classeNome || 'Atividade Econômica';

            // Determina enquadramento tributário com heurística CONCLA
            const ratInfo = this.determinarRatHeuristica(divisaoCod);
            const simplesInfo = this.determinarSimplesHeuristica(secaoCod, divisaoCod, limpo);

            const cnaeMontado: CnaeInfo = {
              codigo: this.formatarCnae(item.id.toString()),
              codigoLimpo: item.id.toString(),
              descricao,
              secao: `${secaoCod} - ${secaoNome}`,
              secaoCodigo: secaoCod,
              divisao: `${divisaoCod} - ${divisaoNome}`,
              divisaoCodigo: divisaoCod,
              grupo: `${grupoCod} - ${grupoNome}`,
              grupoCodigo: grupoCod,
              classe: `${classeCod} - ${classeNome}`,
              classeCodigo: classeCod,
              subclasseCodigo: this.formatarCnae(item.id.toString()),
              compreende: item.atividades?.map((a: { id: string; descricao: string }) => a.descricao) || [descricao],
              aliquotaRat: ratInfo.aliquota,
              grauRiscoTrabalho: ratInfo.risco,
              fapSugerido: 1.0,
              simplesNacional: simplesInfo,
              desoneracaoFolhaCPRB: ['62', '63', '49'].includes(divisaoCod),
              reformaTributaria: {
                regimeIbsCbs: secaoCod === 'A' ? 'REDUZIDO' : 'PADRAO',
                descricao: `Operação sujeita ao regime tributário do setor ${secaoCod} conforme regras do IVA Dual (EC 132/2023).`
              },
              obrigacoesAcessorias: ['eSocial', 'EFD-Reinf', 'DCTFWeb', 'SPED Fiscal EFD'],
              urlConclaOficial: `https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=${item.id}`,
              ultimaAtualizacao: new Date().toISOString().split('T')[0]
            };

            this.saveCache(item.id.toString(), cnaeMontado);
            return cnaeMontado;
          }
        }
      } catch {
        // Fallback para busca textual ou aproximação
      }
    }

    // 4. Se não achou por código exato, busca por palavra-chave ou aproximação na base
    const matches = this.buscarNaBaseLocal(termoOuCodigo);
    if (matches.length > 0) {
      return matches[0];
    }

    return null;
  }

  /**
   * Busca CNAEs por termo textual (descrição, palavras-chave, código ou seção)
   */
  public static async buscarCnaes(termo: string): Promise<CnaeInfo[]> {
    if (!termo || termo.trim().length === 0) {
      return Object.values(BASE_CNAE_CONCLA);
    }

    const termoNorm = termo.toLowerCase().trim();
    const termoLimpo = this.limparCnae(termoNorm);

    // 1. Busca local na base pré-carregada e no cache
    const resultadosLocais = this.buscarNaBaseLocal(termo);

    // 2. Se for número de 4 ou mais dígitos, tenta buscar na API do IBGE
    if (termoLimpo.length >= 4 && resultadosLocais.length === 0) {
      try {
        const info = await this.consultarCnae(termoLimpo);
        if (info) {
          return [info];
        }
      } catch {
        // ignora
      }
    }

    // 3. Tenta buscar atividades por texto na API do IBGE
    if (termoNorm.length >= 3 && resultadosLocais.length < 5) {
      try {
        const resp = await fetch(`${IBGE_API_BASE_URL}/subclasses?termo=${encodeURIComponent(termoNorm)}`, {
          headers: { Accept: 'application/json' }
        });
        if (resp.ok) {
          const apiItens = await resp.json();
          if (Array.isArray(apiItens)) {
            const apiMapeados: CnaeInfo[] = apiItens.slice(0, 8).map((item: any) => {
              const codLimpo = item.id.toString();
              const secaoCod = item.classe?.grupo?.divisao?.secao?.id || 'G';
              const secaoNome = item.classe?.grupo?.divisao?.secao?.nome || '';
              const divisaoCod = item.classe?.grupo?.divisao?.id || codLimpo.slice(0, 2);
              const divisaoNome = item.classe?.grupo?.divisao?.nome || '';

              const rat = this.determinarRatHeuristica(divisaoCod);
              const simples = this.determinarSimplesHeuristica(secaoCod, divisaoCod, codLimpo);

              return {
                codigo: this.formatarCnae(codLimpo),
                codigoLimpo: codLimpo,
                descricao: item.descricao || '',
                secao: `${secaoCod} - ${secaoNome}`,
                secaoCodigo: secaoCod,
                divisao: `${divisaoCod} - ${divisaoNome}`,
                divisaoCodigo: divisaoCod,
                grupo: `${item.classe?.grupo?.id || ''} - ${item.classe?.grupo?.nome || ''}`,
                grupoCodigo: item.classe?.grupo?.id || '',
                classe: `${item.classe?.id || ''} - ${item.classe?.nome || ''}`,
                classeCodigo: item.classe?.id || '',
                subclasseCodigo: this.formatarCnae(codLimpo),
                compreende: [item.descricao],
                aliquotaRat: rat.aliquota,
                grauRiscoTrabalho: rat.risco,
                fapSugerido: 1.0,
                simplesNacional: simples,
                desoneracaoFolhaCPRB: false,
                reformaTributaria: {
                  regimeIbsCbs: 'PADRAO',
                  descricao: 'Regime Geral do IVA Dual (EC 132/2023).'
                },
                obrigacoesAcessorias: ['SPED Fiscal', 'eSocial', 'DCTFWeb'],
                urlConclaOficial: `https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=${codLimpo}`,
                ultimaAtualizacao: new Date().toISOString().split('T')[0]
              };
            });

            // Une locais com API evitando duplicatas
            const idsExistentes = new Set(resultadosLocais.map(r => r.codigoLimpo));
            apiMapeados.forEach(item => {
              if (!idsExistentes.has(item.codigoLimpo)) {
                resultadosLocais.push(item);
                idsExistentes.add(item.codigoLimpo);
              }
            });
          }
        }
      } catch {
        // ignora
      }
    }

    return resultadosLocais;
  }

  /**
   * Retorna os CNAEs pertencentes a uma Seção específica (ex: 'J' para TI/Comunicação)
   */
  public static buscarPorSecao(secaoCodigo: string): CnaeInfo[] {
    const todos = [...Object.values(BASE_CNAE_CONCLA), ...Object.values(this.getCache())];
    return todos.filter(c => c.secaoCodigo.toUpperCase() === secaoCodigo.toUpperCase());
  }

  /**
   * Consulta os CNAEs (Principal e Secundários) de um CNPJ consultando a Receita Federal
   */
  public static async consultarCnaesPorCnpj(cnpj: string): Promise<{
    cnpj: string;
    razaoSocial: string;
    nomeFantasia?: string;
    cnaePrincipal: CnaeInfo | null;
    cnaesSecundarios: CnaeInfo[];
    situacaoCadastral: string;
  } | null> {
    try {
      const resRfb = await ReceitaFederalService.consultarReceitaFederalOnline(cnpj);
      if (!resRfb || !resRfb.cnaePrincipal) {
        return null;
      }

      // Detalha o CNAE principal
      let cnaePrincipalInfo = await this.consultarCnae(resRfb.cnaePrincipal.codigo);
      if (!cnaePrincipalInfo) {
        cnaePrincipalInfo = {
          codigo: this.formatarCnae(resRfb.cnaePrincipal.codigo),
          codigoLimpo: this.limparCnae(resRfb.cnaePrincipal.codigo),
          descricao: resRfb.cnaePrincipal.descricao,
          secao: 'OUTRAS ATIVIDADES',
          secaoCodigo: 'G',
          divisao: '',
          divisaoCodigo: '',
          grupo: '',
          grupoCodigo: '',
          classe: '',
          classeCodigo: '',
          subclasseCodigo: this.formatarCnae(resRfb.cnaePrincipal.codigo),
          aliquotaRat: 2.0,
          grauRiscoTrabalho: 'MÉDIO (2%)',
          fapSugerido: 1.0,
          simplesNacional: {
            permitido: resRfb.opcaoSimplesNacional || false,
            anexo: 'ANEXO_I',
            sujeitoFatorR: false,
            observacao: 'Regime cadastrado na Receita Federal do Brasil.'
          },
          desoneracaoFolhaCPRB: false,
          reformaTributaria: {
            regimeIbsCbs: 'PADRAO',
            descricao: 'Regime Geral do IVA Dual.'
          },
          obrigacoesAcessorias: ['SPED Fiscal', 'EFD Contribuições', 'eSocial'],
          urlConclaOficial: `https://concla.ibge.gov.br/busca-online-cnae.html?view=subclasse&tipo=cnae&versao=10&subclasse=${this.limparCnae(resRfb.cnaePrincipal.codigo)}`,
          ultimaAtualizacao: resRfb.dataSituacaoCadastral || '2026-01-01'
        };
      }

      // Processa secundários se houver
      const secundarias: CnaeInfo[] = [];
      if (resRfb.cnaesSecundarios && resRfb.cnaesSecundarios.length > 0) {
        for (const sec of resRfb.cnaesSecundarios) {
          const secInfo = await this.consultarCnae(sec.codigo);
          if (secInfo) {
            secundarias.push(secInfo);
          }
        }
      }

      return {
        cnpj: resRfb.documentoFormatado,
        razaoSocial: resRfb.razaoSocialOficial,
        nomeFantasia: resRfb.nomeFantasiaOficial,
        cnaePrincipal: cnaePrincipalInfo,
        cnaesSecundarios: secundarias,
        situacaoCadastral: resRfb.situacaoCadastral
      };
    } catch {
      return null;
    }
  }

  /**
   * Determina o enquadramento no Simples Nacional com base no CNAE
   */
  private static determinarSimplesHeuristica(secaoCod: string, divisaoCod: string, _limpo: string) {
    if (['35', '61', '64', '65'].includes(divisaoCod)) {
      return {
        permitido: false,
        anexo: 'VEDADO' as const,
        sujeitoFatorR: false,
        observacao: 'Atividade com vedação legal expressa ao Simples Nacional (Art. 17 da LC 123/2006).'
      };
    }

    if (['45', '46', '47'].includes(divisaoCod)) {
      return {
        permitido: true,
        anexo: 'ANEXO_I' as const,
        sujeitoFatorR: false,
        observacao: 'Tributação pelo Anexo I do Simples Nacional (Comércio).'
      };
    }

    if (secaoCod === 'C' || (Number(divisaoCod) >= 10 && Number(divisaoCod) <= 33)) {
      return {
        permitido: true,
        anexo: 'ANEXO_II' as const,
        sujeitoFatorR: false,
        observacao: 'Tributação pelo Anexo II do Simples Nacional (Indústria).'
      };
    }

    if (divisaoCod === '62' || divisaoCod === '63' || divisaoCod === '70' || divisaoCod === '71') {
      return {
        permitido: true,
        anexo: 'ANEXO_III_OU_V' as const,
        sujeitoFatorR: true,
        observacao: 'Sujeito ao Fator R. Tributa pelo Anexo III se folha/receita >= 28%, ou Anexo V se menor.'
      };
    }

    if (divisaoCod === '41' || divisaoCod === '42' || divisaoCod === '43' || divisaoCod === '69') {
      return {
        permitido: true,
        anexo: 'ANEXO_IV' as const,
        sujeitoFatorR: false,
        observacao: 'Tributado pelo Anexo IV do Simples Nacional (com INSS patronal recolhido à parte).'
      };
    }

    return {
      permitido: true,
      anexo: 'ANEXO_III' as const,
      sujeitoFatorR: false,
      observacao: 'Tributação geral de serviços pelo Anexo III do Simples Nacional.'
    };
  }

  /**
   * Determina a alíquota RAT (Riscos Ambientais do Trabalho) segundo Decreto 3.048/1999
   */
  private static determinarRatHeuristica(divisaoCod: string): {
    aliquota: number;
    risco: 'LEVE (1%)' | 'MÉDIO (2%)' | 'GRAVE (3%)';
  } {
    const div = Number(divisaoCod);
    // Indústrias pesadas, mineração, transporte, química, construção = Grau 3
    if ((div >= 5 && div <= 9) || (div >= 20 && div <= 30) || div === 41 || div === 42 || div === 49) {
      return { aliquota: 3.0, risco: 'GRAVE (3%)' };
    }
    // Comércio em geral, alimentação, telecomunicações, TI desenvolvimento = Grau 2
    if ((div >= 45 && div <= 47) || div === 56 || div === 62 || div === 61 || div === 46) {
      return { aliquota: 2.0, risco: 'MÉDIO (2%)' };
    }
    // Serviços administrativos, contabilidade, direito, escritórios, consultoria = Grau 1
    return { aliquota: 1.0, risco: 'LEVE (1%)' };
  }

  private static buscarNaBaseLocal(termo: string): CnaeInfo[] {
    const termoNorm = termo.toLowerCase().trim();
    const termoLimpo = this.limparCnae(termoNorm);
    const todos = [...Object.values(BASE_CNAE_CONCLA), ...Object.values(this.getCache())];

    return todos.filter(item => {
      if (termoLimpo && (item.codigoLimpo.includes(termoLimpo) || item.codigo.includes(termo))) {
        return true;
      }
      if (item.descricao.toLowerCase().includes(termoNorm)) {
        return true;
      }
      if (item.secao.toLowerCase().includes(termoNorm)) {
        return true;
      }
      if (item.divisao.toLowerCase().includes(termoNorm)) {
        return true;
      }
      if (item.classe.toLowerCase().includes(termoNorm)) {
        return true;
      }
      if (item.compreende && item.compreende.some(c => c.toLowerCase().includes(termoNorm))) {
        return true;
      }
      return false;
    });
  }
}
