import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  FileSpreadsheet,
  ShieldAlert,
  CalendarRange,
  BookOpenCheck,
  Server,
  TrendingUp,
  History,
  Scale,
  Save,
  DownloadCloud,
  Monitor,
  Printer,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Zap,
  Layers,
  Sparkles,
  Info,
  Check,
  FileCheck2,
  Building2,
  Users,
  KeyRound
} from 'lucide-react';
import { ActiveTab } from './Sidebar';

interface UserManualViewProps {
  onNavigate: (tab: ActiveTab) => void;
  onOpenPwaModal?: () => void;
}

type UserRoleFilter = 'TODOS' | 'OPERADOR' | 'AUDITOR' | 'CONTADOR' | 'TI';

interface ManualSection {
  id: string;
  titulo: string;
  subtitulo: string;
  categoria: string;
  icone: React.ElementType;
  telaAlvo?: ActiveTab;
  destaque?: string;
  perfis: UserRoleFilter[];
  conteudo: {
    objetivo: string;
    passos: {
      titulo: string;
      descricao: string;
      dica?: string;
    }[];
    regrasOuAtencoes?: string[];
    atalhoTexto?: string;
  };
}

export const UserManualView: React.FC<UserManualViewProps> = ({
  onNavigate,
  onOpenPwaModal
}) => {
  const [busca, setBusca] = useState('');
  const [perfilAtivo, setPerfilAtivo] = useState<UserRoleFilter>('TODOS');
  const [secoesAbertas, setSecoesAbertas] = useState<Record<string, boolean>>({
    'intro': true,
    'fluxo-geral': true,
    'documentos': true
  });

  const toggleSecao = (id: string) => {
    setSecoesAbertas(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const expandirTodas = () => {
    const todas: Record<string, boolean> = {};
    manualSections.forEach(s => {
      todas[s.id] = true;
    });
    todas['intro'] = true;
    todas['fluxo-geral'] = true;
    todas['faq'] = true;
    todas['glossario'] = true;
    setSecoesAbertas(todas);
  };

  const recolherTodas = () => {
    setSecoesAbertas({});
  };

  const manualSections: ManualSection[] = [
    {
      id: 'dashboard',
      titulo: '1. Dashboard Fiscal Geral',
      subtitulo: 'Monitoramento executivo, totalizadores de impostos e índices de conformidade',
      categoria: 'Visão Geral & Métricas',
      icone: TrendingUp,
      telaAlvo: 'dashboard',
      perfis: ['TODOS', 'AUDITOR', 'CONTADOR'],
      conteudo: {
        objetivo: 'Fornecer uma visão executiva imediata de todas as notas fiscais recebidas, apurando totais de ICMS, ST, IPI, PIS, COFINS e o índice de risco fiscal da carteira.',
        passos: [
          {
            titulo: 'Análise dos Cards de Indicadores (KPIs)',
            descricao: 'No topo da página, acompanhe o total de notas fiscais importadas, o valor contábil bruto e o total acumulado de cada tributo destacado.',
            dica: 'O indicador "Conformidade Preventiva" reflete a porcentagem de documentos sem nenhuma pendência ou divergência tributária.'
          },
          {
            titulo: 'Alertas de Auditoria Pendentes',
            descricao: 'Identifique rapidamente documentos com Erro Provável ou Divergência Normativa que exigem ação corretiva antes do fechamento.',
            dica: 'Clique no card de alertas ou no botão "Auditar Documentos" para saltar diretamente para a Bancada de Auditoria.'
          },
          {
            titulo: 'Distribuição por CFOP e Fornecedor',
            descricao: 'Consulte os gráficos analíticos que apontam para onde está concentrada a maior parte das compras da empresa (operações internas vs. interestaduais).'
          }
        ],
        regrasOuAtencoes: [
          'Valores zerados em impostos podem indicar isenção legal, imunidade ou pendência cadastral que precisa de auditoria.',
          'Sempre verifique se a competência (mês/ano) exibida corresponde ao período que você está analisando.'
        ],
        atalhoTexto: 'Abrir Dashboard Fiscal'
      }
    },
    {
      id: 'documentos',
      titulo: '2. Ingestão & Gestão de Documentos Fiscais',
      subtitulo: 'Upload de XMLs (NF-e, NFC-e, CT-e), importação de NF3-e e emissão de DANFE',
      categoria: 'Operação de Documentos',
      icone: FileSpreadsheet,
      telaAlvo: 'documentos',
      destaque: 'Essencial para Assistentes e Operadores',
      perfis: ['TODOS', 'OPERADOR', 'AUDITOR'],
      conteudo: {
        objetivo: 'Gerenciar o recebimento de documentos fiscais eletrônicos através de arquivos XML, prevenindo notas duplicadas e permitindo emissão de DANFE para conferência física de mercadorias.',
        passos: [
          {
            titulo: 'Como Fazer Upload de Arquivos XML de NF-e',
            descricao: 'Arraste um ou mais arquivos .xml diretamente para a área tracejada ou clique em "Selecionar Arquivos XML" para importar lotes de uma única vez.',
            dica: 'O sistema lê instantaneamente a estrutura canônica da SEFAZ v4.00, extraindo emitente, destinatário, itens, CFOPs e impostos.'
          },
          {
            titulo: 'Importação Especial de NF3-e (Conta de Luz / Energia Elétrica)',
            descricao: 'Para notas fiscais de energia elétrica das unidades industriais ou comerciais, clique no botão "Importar NF3-e (Energia)", onde você pode carregar o XML da concessionária ou utilizar os dados pré-configurados.',
            dica: 'A NF3-e calcula o crédito proporcional de ICMS admitido para a atividade produtiva da empresa.'
          },
          {
            titulo: 'Prevenção Automática de Notas Duplicadas',
            descricao: 'Se você tentar carregar um XML com a mesma Chave de Acesso de 44 dígitos já existente na base, o sistema exibe um alerta de proteção e bloqueia a duplicidade para evitar bitributação no SPED.'
          },
          {
            titulo: 'Visualização e Impressão do DANFE em PDF',
            descricao: 'Clique no ícone da impressora ao lado de qualquer nota ou use o botão superior "Imprimir NF-e". O sistema gera o DANFE em PDF com código de barras, canhoto de recebimento e divisão dos produtos.',
            dica: 'Você pode salvar como PDF ou imprimir diretamente para anexar ao processo físico de conferência no almoxarifado.'
          },
          {
            titulo: 'Sincronização com Pasta de Rede Corporativa',
            descricao: 'Utilize o botão "Sincronizar Pasta de Rede" para simular ou carregar arquivos que a equipe de compras deposita em diretórios compartilhados de rede da empresa.'
          }
        ],
        regrasOuAtencoes: [
          'Nunca altere a numeração de arquivos XML manualmente para não corromper a assinatura digital da SEFAZ.',
          'Sempre confira se o CNPJ de destino é correspondente ao estabelecimento da sua empresa.'
        ],
        atalhoTexto: 'Ir para Documentos Fiscais'
      }
    },
    {
      id: 'auditoria',
      titulo: '3. Bancada de Auditoria & Divergências Tributárias',
      subtitulo: 'Confronto item a item, motor fiscal de validação e emissão de parecer técnico',
      categoria: 'Auditoria & Compliance',
      icone: ShieldAlert,
      telaAlvo: 'auditoria',
      destaque: 'Módulo Central de Controle de Riscos',
      perfis: ['TODOS', 'AUDITOR'],
      conteudo: {
        objetivo: 'Detectar preventivamente inconformidades fiscais antes da escrituração no SPED ou envio ao ERP Protheus, permitindo que o auditor registre seu parecer técnico fundamentado.',
        passos: [
          {
            titulo: 'Classificação de Severidade dos Apontamentos',
            descricao: 'O motor classifica as notas em 4 níveis: Erro Provável (crítico, exige correção imediata), Divergência (alíquota diferente da esperada), Atenção (inconsistência cadastral) e Em Conformidade (100% validada).'
          },
          {
            titulo: 'Análise do Confronto Item a Item',
            descricao: 'Selecione a nota desejada na barra lateral. O sistema abrirá a comparação minuciosa entre o que consta no XML emitido pelo fornecedor e o que exige a legislação tributária vigente.',
            dica: 'Veja a coluna de "Ação Recomendada" que sugere exatamente se cabe pedido de carta de correção (CC-e), recusa de mercadoria ou estorno de crédito.'
          },
          {
            titulo: 'Homologação e Parecer do Auditor',
            descricao: 'Após validar as informações, escolha entre: "Aprovar Documento" (habilitando para o SPED), "Aprovar com Ressalva" ou "Rejeitar Documento". Digite a fundamentação técnica e confirme a decisão.',
            dica: 'A decisão é assinada em nome do auditor responsável (Roberto Pereira de Oliveira) e gravada de forma imutável na Trilha de Auditoria.'
          }
        ],
        regrasOuAtencoes: [
          'Notas com Erro Provável não devem ser aprovadas sem prévio esclarecimento do fornecedor ou emissão de nota complementar/carta de correção.',
          'Toda aprovação gera um registro auditável perante auditorias internas e órgãos de controle externo (CGU/TCU).'
        ],
        atalhoTexto: 'Acessar Bancada de Auditoria'
      }
    },
    {
      id: 'manifesto',
      titulo: '4. Manifestação do Destinatário (MD-e & Portal da Fazenda)',
      subtitulo: 'Acesso ao Portal Nacional (nfe.fazenda.gov.br), eventos 210200/210210/210220/210240 e protocolos',
      categoria: 'Conformidade SEFAZ',
      icone: FileCheck2,
      telaAlvo: 'manifesto',
      destaque: 'Integração Oficial com a Fazenda',
      perfis: ['TODOS', 'OPERADOR', 'AUDITOR', 'CONTADOR'],
      conteudo: {
        objetivo: 'Gerenciar os eventos oficiais de manifestação da NF-e perante a Secretaria da Fazenda Nacional (Ajuste SINIEF 07/2005), acessando o Portal Oficial da Fazenda com Certificado Digital da empresa e registrando o protocolo no sistema.',
        passos: [
          {
            titulo: 'Como Acessar o Portal Oficial da Fazenda pelo APP',
            descricao: 'Na tela de Manifestação do Destinatário, selecione a NF-e em análise e clique em "Acessar Portal da Fazenda (SEFAZ)". O sistema copiará a chave de 44 dígitos para a área de transferência e abrirá a página oficial: https://www.nfe.fazenda.gov.br/portal/principal.aspx.',
            dica: 'Acesse Serviços > Manifestação do Destinatário no portal governamental para realizar a consulta completa.'
          },
          {
            titulo: 'Autenticação com Certificado Digital da Empresa',
            descricao: 'No portal da SEFAZ, selecione o Certificado Digital ICP-Brasil (A1 ou A3) da sua empresa e cole a chave de acesso no campo de consulta.'
          },
          {
            titulo: 'Os 4 Eventos Oficiais Disponíveis',
            descricao: 'Escolha: Confirmação da Operação (210200 - atesta recebimento e trava cancelamento), Ciência da Emissão (210210 - libera download do XML), Desconhecimento da Operação (210220 - exime a empresa de notas indevidas) ou Operação não Realizada (210240 - mercadoria devolvida/avariada).'
          },
          {
            titulo: 'Vinculação do Protocolo SEFAZ e Assinatura',
            descricao: 'Copie o número de protocolo gerado pela SEFAZ (ex: 135260019283741), cole no campo de protocolo do sistema e clique em "Salvar Manifestação no Documento".',
            dica: 'O registro é assinado formalmente por Roberto Pereira de Oliveira e gravado com carimbo de tempo na Trilha de Auditoria imutável.'
          }
        ],
        regrasOuAtencoes: [
          'O prazo para Ciência da Emissão e Confirmação da Operação é de até 180 dias da emissão.',
          'Operação não Realizada exige justificativa formal com no mínimo 15 caracteres perante a legislação.'
        ],
        atalhoTexto: 'Abrir Manifestação SEFAZ'
      }
    },
    {
      id: 'relatorios',
      titulo: '4. Relatório Mensal de Notas Fiscais (Fechamento)',
      subtitulo: 'Consolidação contábil por competência, agrupamento por CFOP e CST',
      categoria: 'Relatórios & Fechamento',
      icone: CalendarRange,
      telaAlvo: 'relatorios',
      perfis: ['TODOS', 'CONTADOR', 'OPERADOR'],
      conteudo: {
        objetivo: 'Consolidar todos os documentos fiscais do mês de apuração, separando entradas internas e interestaduais, apurando a base de cálculo e crédito de impostos para a contabilidade.',
        passos: [
          {
            titulo: 'Seleção do Mês de Competência',
            descricao: 'Utilize os seletores de Ano e Mês no topo da tela para filtrar apenas os documentos emitidos no período contábil desejado.'
          },
          {
            titulo: 'Conferência dos Totalizadores Mensais',
            descricao: 'Verifique o resumo de Entradas Totais, Base de Cálculo do ICMS, ICMS Próprio, ICMS Substituição Tributária (ST), IPI e PIS/COFINS.',
            dica: 'O valor apurado deve bater exatamente com os lançamentos de entrada do livro fiscal do período.'
          },
          {
            titulo: 'Exportação e Impressão do Relatório',
            descricao: 'Clique no botão de imprimir para obter o espelho impresso do relatório mensal ou exporte para planilha Excel com um clique.'
          }
        ],
        regrasOuAtencoes: [
          'Notas canceladas ou rejeitadas são expostas separadamente para não inflar a base de cálculo tributária da competência.'
        ],
        atalhoTexto: 'Abrir Relatório Mensal'
      }
    },
    {
      id: 'regras',
      titulo: '5. Motor de Regras & Legislação Fiscal',
      subtitulo: 'Hierarquia das normas jurídicas, catálogo de regras e simulador de alíquotas',
      categoria: 'Conhecimento Tributário',
      icone: Scale,
      telaAlvo: 'regras',
      perfis: ['TODOS', 'AUDITOR', 'CONTADOR'],
      conteudo: {
        objetivo: 'Consultar a cadeia de legalidade que rege cada cálculo do sistema e permitir que a equipe simule novas operações fiscais antes da emissão da nota pelo fornecedor.',
        passos: [
          {
            titulo: 'Hierarquia Normativa do Sistema',
            descricao: 'Na aba "Hierarquia Normativa", entenda a ordem de prevalência legal: Constituição Federal > Leis Complementares (LC 87/96) > Convênios CONFAZ > Regulamentos de ICMS Estaduais > Decretos e Portarias.',
            dica: 'Essa estrutura garante que uma portaria estadual jamais se sobreponha a um benefício federal concedido à empresa adquirente.'
          },
          {
            titulo: 'Catálogo de Regras Fiscais Cadastradas',
            descricao: 'Navegue pelas regras ativas por NCM, CFOP e UF. Cada regra exibe a base de cálculo, alíquota de ICMS/ST/IPI e o número do artigo legal que fundamenta a incidência ou desoneração.'
          },
          {
            titulo: 'Como Usar o Simulador Tributário',
            descricao: 'Acesse a aba "Simulador", informe a UF de Origem (ex: SP), UF de Destino (ex: RJ), o NCM do produto e o valor da operação. O motor calculará na hora a carga de ICMS, ST, IPI e DIFAL esperada.',
            dica: 'Utilize o simulador antes de fechar pedidos de compra para instruir o fornecedor quanto ao preenchimento correto da nota.'
          }
        ],
        atalhoTexto: 'Consultar Motor de Regras'
      }
    },
    {
      id: 'escrituracao',
      titulo: '6. Escrituração SPED Fiscal (EFD ICMS/IPI)',
      subtitulo: 'Portão de segurança, geração dos Blocos 0, C e 9 e exportação do arquivo TXT',
      categoria: 'Conformidade Fiscal Digital',
      icone: BookOpenCheck,
      telaAlvo: 'escrituracao',
      destaque: 'Portão de Aprovação Obrigatório',
      perfis: ['TODOS', 'CONTADOR', 'AUDITOR'],
      conteudo: {
        objetivo: 'Gerar o arquivo oficial da Escrituração Fiscal Digital (EFD ICMS/IPI) em estrita conformidade com o Guia Prático do SPED da Receita Federal do Brasil.',
        passos: [
          {
            titulo: 'O Portão de Aprovação (Regra de Ouro)',
            descricao: 'Apenas documentos com status "APROVADO" na Bancada de Auditoria entram na geração da EFD. Documentos pendentes ou com divergência grave são bloqueados para proteger a empresa de autuações.',
            dica: 'Na tabela inferior, verifique a lista de notas habilitadas com a confirmação de aprovação por Roberto Pereira de Oliveira.'
          },
          {
            titulo: 'Geração dos Registros Oficiais',
            descricao: 'O sistema compõe automaticamente os registros: Bloco 0 (Abertura e dados da empresa), Bloco C (C100 resumo da NF-e, C170 itens mercantis, C190 consolidação por CST/CFOP) e Bloco 9 (Controle de encerramento).'
          },
          {
            titulo: 'Download do Arquivo para o PVA da Receita',
            descricao: 'Clique no botão "Gerar Arquivo SPED (.TXT)". O arquivo formatado será baixado imediatamente no seu computador, pronto para importação direta no validador oficial do SPED Fiscal.'
          }
        ],
        regrasOuAtencoes: [
          'Antes de gerar o arquivo final, certifique-se de que todas as notas daquele mês foram devidamente homologadas na Bancada de Auditoria.'
        ],
        atalhoTexto: 'Ir para Escrituração SPED'
      }
    },
    {
      id: 'protheus',
      titulo: '7. Integração com ERP TOTVS Protheus',
      subtitulo: 'Geração de payloads ExecAuto (MATA103), mapeamento SF1/SD1 e rotinas ADVPL',
      categoria: 'Integração de Sistemas',
      icone: Server,
      telaAlvo: 'protheus',
      perfis: ['TODOS', 'TI', 'CONTADOR'],
      conteudo: {
        objetivo: 'Automatizar o lançamento dos documentos fiscais no sistema corporativo TOTVS Protheus, eliminando a digitação manual de notas de entrada e evitando erros de digitação.',
        passos: [
          {
            titulo: 'Mapeamento das Tabelas do Protheus',
            descricao: 'O sistema converte os dados da nota nas tabelas nativas do ERP: SF1 (Cabeçalho da Nota de Entrada - F1_DOC, F1_SERIE, F1_FORNECE) e SD1 (Itens de Entrada - D1_COD, D1_QUANT, D1_VUNIT, D1_CF, D1_CLASFIS).'
          },
          {
            titulo: 'Visualização do Payload JSON para ExecAuto',
            descricao: 'Selecione uma nota fiscal para inspecionar a estrutura JSON perfeitamente compatível com a rotina automática MATA103 do Protheus.'
          },
          {
            titulo: 'Código-Fonte ADVPL / Rest API',
            descricao: 'Na aba "Código ADVPL", você encontra o exemplo de User Function pronto para ser compilado no ambiente Protheus da sua empresa para recepção contínua de lotes.'
          },
          {
            titulo: 'Simulação de Envio e Diagnóstico',
            descricao: 'Clique em "Simular Transmissão ao Protheus" para validar se todos os campos obrigatórios estão preenchidos sem erros de chave estrangeira ou TES.'
          }
        ],
        atalhoTexto: 'Acessar Integração Protheus'
      }
    },
    {
      id: 'reforma',
      titulo: '8. Simulador da Reforma Tributária (IBS & CBS)',
      subtitulo: 'Impacto da Emenda Constitucional 132/2023, transição 2026-2033 e IVA Dual',
      categoria: 'Planejamento Tributário',
      icone: TrendingUp,
      telaAlvo: 'reforma',
      perfis: ['TODOS', 'AUDITOR', 'CONTADOR'],
      conteudo: {
        objetivo: 'Permitir que a diretoria e equipe fiscal visualizem o impacto orçamentário da transição do atual sistema tributário (PIS/COFINS, ICMS, IPI) para o novo IVA Dual (CBS Federal + IBS Estadual/Municipal).',
        passos: [
          {
            titulo: 'Entendendo o Cronograma de Transição',
            descricao: 'Em 2026 inicia-se a alíquota teste de 0,9% (CBS) e 0,1% (IBS). Entre 2027 e 2032 ocorre a extinção gradual de PIS/COFINS e IPI e a substituição progressiva do ICMS até a vigência plena em 2033.'
          },
          {
            titulo: 'Comparativo de Custo Tributário da Carteira',
            descricao: 'A tela recalcula todas as notas fiscais ativas da empresa sob a ótica da Reforma Tributária, destacando a concessão de crédito financeiro amplo em oposição ao regime cumulativo anterior.'
          }
        ],
        atalhoTexto: 'Ver Simulador da Reforma'
      }
    },
    {
      id: 'trilha',
      titulo: '9. Trilha de Auditoria & Conformidade Regulatória',
      subtitulo: 'Rastreabilidade imutável, carimbo de tempo, SHA-256 e logs de ações',
      categoria: 'Governança & Segurança',
      icone: History,
      telaAlvo: 'trilha',
      perfis: ['TODOS', 'AUDITOR', 'TI'],
      conteudo: {
        objetivo: 'Garantir conformidade com os mais rigorosos padrões de governança pública (SOX, TCU, CGU), gravando todas as operações realizadas em um livro-razão imutável de eventos.',
        passos: [
          {
            titulo: 'O Que Fica Registrado na Trilha',
            descricao: 'Cada upload de XML, validação automática, parecer de aprovação ou rejeição emitido por Roberto Pereira de Oliveira, alteração de regras ou geração de SPED gera um evento com data, hora, IP e operador.'
          },
          {
            titulo: 'Garantia Criptográfica (Hash SHA-256)',
            descricao: 'Cada registro possui um Hash exclusivo que conecta a operação ao documento. Caso haja tentativa de adulteração de dados, a integridade da cadeia é violada visivelmente.'
          },
          {
            titulo: 'Filtros e Exportação para Órgãos de Controle',
            descricao: 'Filtre por período, tipo de operação (IMPORTACAO, APROVACAO, ESCRITURACAO) ou usuário para emitir relatórios de auditoria e prestação de contas.'
          }
        ],
        atalhoTexto: 'Consultar Trilha de Auditoria'
      }
    },
    {
      id: 'seguranca-backup',
      titulo: '10. Como Salvar Alterações, Fazer Backup & Instalar no Windows',
      subtitulo: 'Uso do botão SALVAR, exportação JSON de segurança e instalação PWA Desktop',
      categoria: 'Persistência & Tecnologia',
      icone: Save,
      destaque: 'Instrução Técnica Crucial',
      perfis: ['TODOS', 'OPERADOR', 'TI'],
      conteudo: {
        objetivo: 'Garantir que nenhum dado fiscal ou parecer de auditoria seja perdido e ensinar a instalar o sistema como aplicativo de área de trabalho no Windows com ícone próprio.',
        passos: [
          {
            titulo: 'O Botão Verde "SALVAR" no Cabeçalho e Menu',
            descricao: 'Sempre que você importar notas novas ou aprovar pareceres de auditoria, clique no botão "SALVAR" no canto superior direito ou na barra lateral. O sistema salva o estado completo no armazenamento permanente do navegador.',
            dica: 'Ao clicar em SALVAR, o botão exibirá "Salvo com Sucesso!" confirmando a retenção segura dos dados.'
          },
          {
            titulo: 'Como Fazer Backup de Segurança em Arquivo (.JSON)',
            descricao: 'Clique no botão "Backup Base (.json)" no cabeçalho superior. Um arquivo compactado contendo todos os XMLs, cálculos, cadastro da empresa e a trilha de auditoria será salvo em seus downloads. Guarde-o em uma pasta segura ou na rede corporativa.'
          },
          {
            titulo: 'Como Instalar como Aplicativo no Windows (PWA / Área de Trabalho)',
            descricao: 'Clique no botão "Instalar no Windows (PWA)" no cabeçalho. No Microsoft Edge ou Google Chrome, você pode instalar o app diretamente no menu do navegador (ícone de computador na barra de endereço) para ter um ícone direto na Área de Trabalho e iniciar sem barras de navegador.',
            dica: 'O app funciona em tela cheia com alta velocidade e suporta consulta rápida mesmo se a internet oscilar.'
          }
        ],
        regrasOuAtencoes: [
          'Recomendamos gerar um Backup (.JSON) ao final de cada expediente ou fechamento mensal de apuração.'
        ]
      }
    },
    {
      id: 'empresa_manual',
      titulo: '11. Cadastro da Empresa & Identidade Visual',
      subtitulo: 'Configuração dos dados cadastrais, CNPJ, Inscrição Estadual e upload de logotipo',
      categoria: 'Configuração da Empresa',
      icone: Building2,
      telaAlvo: 'empresa',
      destaque: 'Configuração Inicial Obrigatória',
      perfis: ['TODOS', 'TI', 'CONTADOR'],
      conteudo: {
        objetivo: 'Habilitar o comprador do sistema a personalizar todos os dados da sua empresa (Razão Social, CNPJ, Inscrição Estadual, regime tributário e logotipo), os quais serão impressos nos relatórios e nos registros do SPED.',
        passos: [
          {
            titulo: 'Upload do Logotipo da Empresa',
            descricao: 'Acesse o menu "Cadastro da Empresa" e faça upload da imagem do seu logotipo (PNG, JPG, SVG). Ele será exibido automaticamente no menu lateral e nos cabeçalhos de impressões.',
            dica: 'O logotipo fica salvo no armazenamento seguro local e pode ser trocado a qualquer momento.'
          },
          {
            titulo: 'Preenchimento dos Dados Jurídicos (CNPJ e IE)',
            descricao: 'Preencha a Razão Social, Nome Fantasia, CNPJ com máscara e Inscrição Estadual. Esses dados definem a titularidade do adquirente nas notas fiscais de entrada e saída.'
          },
          {
            titulo: 'Enquadramento Tributário e Alíquotas Padrão',
            descricao: 'Selecione entre Lucro Real, Lucro Presumido ou Simples Nacional e defina o Perfil da EFD (A, B ou C). O motor normativo ajustará os cálculos com base nessas diretrizes.'
          }
        ],
        atalhoTexto: 'Abrir Cadastro da Empresa'
      }
    },
    {
      id: 'certificado_manual',
      titulo: '12. Certificado Digital ICP-Brasil (A1 / A3)',
      subtitulo: 'Upload do certificado .pfx/.p12, senha segura e teste de comunicação com a SEFAZ',
      categoria: 'Segurança & SEFAZ',
      icone: KeyRound,
      telaAlvo: 'certificado',
      destaque: 'Necessário para Operar na SEFAZ',
      perfis: ['TODOS', 'TI', 'AUDITOR', 'CONTADOR'],
      conteudo: {
        objetivo: 'Vincular o Certificado Digital ICP-Brasil da empresa compradora para viabilizar manifestação de notas (MD-e), download de faturas na SEFAZ e assinatura dos livros fiscais.',
        passos: [
          {
            titulo: 'Como Inserir o Certificado A1 (.pfx ou .p12)',
            descricao: 'Selecione a opção "Certificado A1", faça o upload do arquivo do certificado da sua empresa e digite a senha de proteção.',
            dica: 'O sistema valida a chave e armazena com criptografia reversa no seu navegador seguro.'
          },
          {
            titulo: 'Uso de Certificado A3 (Token USB / Smartcard)',
            descricao: 'Conecte o token USB à porta do computador e selecione a modalidade A3 para integração nativa com os drivers do Windows.'
          },
          {
            titulo: 'Teste de Comunicação com os WebServices da SEFAZ',
            descricao: 'Clique no botão "Testar Comunicação SEFAZ". O sistema envia uma requisição simulada aos servidores da Receita e confirma o retorno: "Código 107 - Serviço em Operação".'
          }
        ],
        regrasOuAtencoes: [
          'Verifique sempre o prazo de validade do seu certificado para evitar bloqueios em auditorias fiscais.'
        ],
        atalhoTexto: 'Configurar Certificado Digital'
      }
    },
    {
      id: 'usuarios_manual',
      titulo: '13. Gestão de Usuários & Níveis de Acesso',
      subtitulo: 'Cadastro de analistas, auditores e administradores com perfis de permissão',
      categoria: 'Equipe & Acessos',
      icone: Users,
      telaAlvo: 'usuarios',
      perfis: ['TODOS', 'TI', 'CONTADOR'],
      conteudo: {
        objetivo: 'Gerenciar os colaboradores da equipe fiscal da empresa compradora, permitindo controle de quem pode auditar, aprovar notas fiscais e exportar arquivos do SPED.',
        passos: [
          {
            titulo: 'Como Cadastrar um Novo Membro da Equipe',
            descricao: 'Acesse "Usuários do APP", clique em "Cadastrar Novo Usuário" e preencha nome, e-mail corporativo, cargo, departamento e o perfil desejado.'
          },
          {
            titulo: 'Níveis de Permissão Granulares',
            descricao: 'O sistema oferece 4 perfis: Administrador Master (acesso total e certificado), Analista Fiscal Sênior (auditoria e SPED), Auditor Tributário (validação de conformidade) e Operador Fiscal (conferência de XML).'
          },
          {
            titulo: 'Simulação e Alternância de Sessão',
            descricao: 'O administrador pode clicar no botão "Alternar" ao lado de qualquer usuário da lista para operar temporariamente com a identidade dele, testando permissões e assinaturas.',
            dica: 'Cada aprovação na Trilha de Auditoria fica carimbada com o nome e e-mail do usuário ativo no momento.'
          }
        ],
        atalhoTexto: 'Gerenciar Usuários'
      }
    },
    {
      id: 'licenca_manual',
      titulo: '14. Licenciamento Comercial & Acesso Vitalício',
      subtitulo: 'Regras da licença perpétua, termo de garantia comercial e chave de hardware',
      categoria: 'Licenciamento & Compra',
      icone: Sparkles,
      telaAlvo: 'licenca',
      destaque: 'Pagamento Único Sem Mensalidades',
      perfis: ['TODOS', 'TI', 'CONTADOR'],
      conteudo: {
        objetivo: 'Apresentar as garantias jurídicas, regras de uso perpétuo e ferramentas comerciais para compradores e proprietários do software.',
        passos: [
          {
            titulo: 'Chave de Licença Vitalícia Ativa',
            descricao: 'A sua empresa recebe uma Chave Comercial criptografada (ex: PRO-LIFETIME-BR-2026-XXXX) vinculada ao CNPJ do comprador que garante acesso perpétuo.',
            dica: 'Não há cobrança de taxas recorrentes, mensalidades ou limites na quantidade de notas processadas.'
          },
          {
            titulo: 'Impressão do Certificado e Termo de Licença',
            descricao: 'Clique no botão "Certificado de Licença" para imprimir ou gerar em PDF o documento oficial com garantia jurídica de propriedade da licença.'
          },
          {
            titulo: 'Transferência de Licença para Outra Filial',
            descricao: 'Na seção de atualização de licença, você pode inserir uma nova chave adquirida caso queira expandir o uso para outra unidade ou holding.'
          }
        ],
        atalhoTexto: 'Ver Licença Vitalícia'
      }
    }
  ];

  // Filtro de seções por perfil e termo de busca
  const secoesFiltradas = useMemo(() => {
    return manualSections.filter(secao => {
      const matchPerfil = perfilAtivo === 'TODOS' || secao.perfis.includes(perfilAtivo);
      if (!matchPerfil) return false;

      if (!busca.trim()) return true;

      const termo = busca.toLowerCase();
      const matchTitulo = secao.titulo.toLowerCase().includes(termo);
      const matchSubtitulo = secao.subtitulo.toLowerCase().includes(termo);
      const matchCategoria = secao.categoria.toLowerCase().includes(termo);
      const matchPassos = secao.conteudo.passos.some(
        p => p.titulo.toLowerCase().includes(termo) || p.descricao.toLowerCase().includes(termo)
      );

      return matchTitulo || matchSubtitulo || matchCategoria || matchPassos;
    });
  }, [busca, perfilAtivo]);

  // Dicionário de Termos Tributários (Glossário)
  const glossario = [
    { termo: 'CFOP', significado: 'Código Fiscal de Operações e Prestações. Identifica a natureza da circulação de mercadorias (ex: 1556 para uso/consumo, 5102 para venda dentro do estado).' },
    { termo: 'CST / CSOSN', significado: 'Código de Situação Tributária. Determina se o produto é tributado integralmente, isento, imune ou sujeito a substituição tributária.' },
    { termo: 'NCM', significado: 'Nomenclatura Comum do Mercosul. Código de 8 dígitos que classifica o produto perante a Receita Federal e define as alíquotas de IPI, ICMS e PIS/COFINS.' },
    { termo: 'ICMS-ST', significado: 'Substituição Tributária do ICMS. Antecipação do imposto recolhido pelo primeiro elo da cadeia produtiva por meio da MVA (Margem de Valor Agregado).' },
    { termo: 'DIFAL', significado: 'Diferencial de Alíquota do ICMS. Cobrado em compras interestaduais destinadas a consumo ou ativo imobilizado (diferença entre alíquota interna e interestadual).' },
    { termo: 'DANFE', significado: 'Documento Auxiliar da Nota Fiscal Eletrônica. Representação gráfica simplificada da NF-e para acompanhar o transporte físico da carga.' },
    { termo: 'NF3-e', significado: 'Nota Fiscal de Energia Elétrica Eletrônica (modelo 66). Substitui as faturas tradicionais em papel de concessionárias de energia.' },
    { termo: 'EFD ICMS/IPI', significado: 'Escrituração Fiscal Digital (SPED Fiscal). Arquivo digital contendo toda a escrituração de entradas, saídas e apuração de impostos enviada mensalmente à SEFAZ.' },
    { termo: 'ExecAuto (MATA103)', significado: 'Rotina de execução automática em linguagem ADVPL no ERP TOTVS Protheus para inserção programática de Documentos de Entrada nas tabelas SF1 e SD1.' },
    { termo: 'IBS e CBS', significado: 'Imposto sobre Bens e Serviços (IBS estadual/municipal) e Contribuição sobre Bens e Serviços (CBS federal), criados pela Reforma Tributária (EC 132/2023).' },
    { termo: 'Trilha de Auditoria', significado: 'Registro histórico de todas as transações, assinaturas e alterações fiscais com assinatura digital e carimbo de tempo para efeito probatório perante o TCU e CGU.' }
  ];

  // Perguntas Frequentes (FAQ)
  const faqs = [
    {
      pergunta: 'O que fazer se uma nota fiscal vier com erro de alíquota do fornecedor?',
      resposta: 'Acesse a Bancada de Auditoria. O motor tributário indicará a divergência exata na coluna "Confronto Item a Item". O auditor não deve aprovar a nota: registre o parecer recomendando ao departamento de suprimentos solicitar Carta de Correção Eletrônica (CC-e) ou Nota Fiscal Complementar antes do pagamento.'
    },
    {
      pergunta: 'Por que uma nota que acabei de importar não aparece no SPED Fiscal?',
      resposta: 'O sistema possui um "Portão de Aprovação" de segurança. Somente documentos que foram explicitamente auditados e aprovados pelo auditor responsável são liberados para a geração do Bloco C da EFD ICMS/IPI, protegendo a empresa contra multas fiscais.'
    },
    {
      pergunta: 'Como garanto que os dados e aprovações não se percam quando eu fechar a página?',
      resposta: 'Sempre clique no botão verde "SALVAR" presente no cabeçalho ou menu lateral. Além disso, recomendamos baixar periodicamente o arquivo de "Backup Base (.json)" e salvá-lo em uma pasta segura de sua unidade ou rede corporativa.'
    },
    {
      pergunta: 'Posso usar o sistema sem conexão com a internet?',
      resposta: 'Sim! Ao instalar o sistema como aplicativo no Windows (PWA), ele funciona localmente na máquina, permitindo consulta de notas, análise tributária de XMLs e emissão de relatórios mesmo durante instabilidades na rede corporativa.'
    },
    {
      pergunta: 'Como funciona a importação de contas de energia elétrica (NF3-e)?',
      resposta: 'Na tela de Documentos Fiscais, clique em "Importar NF3e Energia (SVRS)". Você pode carregar o XML oficial fornecido pela distribuidora (Enel, Neoenergia, CPFL, Light, etc.) ou escolher os dados padrão da sua empresa para cálculo automático do crédito proporcional de ICMS (LC 87/96 Kandir, art. 33, II) e PIS/COFINS (Leis 10.637/10.833).'
    },
    {
      pergunta: 'Como funciona a NFCom (Nota Fiscal Fatura de Serviços de Comunicação, Modelo 62)?',
      resposta: 'A NFCom (Modelo 62), instituída pelo Ajuste SINIEF nº 07/2022, é obrigatória para serviços de telecomunicação, internet banda larga, links dedicados de dados e telefonia. O sistema suporta leitura completa do XML da NFCom pelo Portal SVRS, cálculo e segregação do FUST (1%) e FUNTTEL (0,5%), apuração de créditos de ICMS e PIS/COFINS, e emissão do DANFECOM.'
    },
    {
      pergunta: 'Qual o melhor local para hospedar o aplicativo para funcionar online?',
      resposta: 'A Vercel é a opção número 1 (deploy em 30 segundos, CDN Edge global, SSL gratuito e roteamento SPA automático via vercel.json). Outras excelentes alternativas são Netlify, Cloudflare Pages e Docker/Nginx para redes internas/intranets da empresa sem expor dados à internet pública.'
    },
    {
      pergunta: 'Como fazer o Manifesto do Destinatário pelo APP acessando o Portal da Fazenda?',
      resposta: 'No menu "Manifestação SEFAZ (MD-e)", selecione a nota fiscal desejada e clique em "Acessar Portal da Fazenda (SEFAZ)". O sistema copiará a chave de 44 dígitos para sua área de transferência e abrirá o portal oficial (https://www.nfe.fazenda.gov.br/portal/principal.aspx). No portal, autentique com o Certificado Digital da empresa, cole a chave, registre o evento (Ciência, Confirmação, Desconhecimento ou Operação não Realizada) e cole o protocolo retornado no aplicativo para guardar a comprovação fiscal.'
    },
    {
      pergunta: 'Por que o Portal da Fazenda não é exibido dentro de uma janela interna (iframe)?',
      resposta: 'Por motivos estritos de segurança cibernética e exigência de Certificado Digital ICP-Brasil (A1/A3), a SEFAZ e a Receita Federal bloqueiam o carregamento do portal governamental dentro de frames de terceiros (cabeçalho X-Frame-Options: SAMEORIGIN). Portanto, o fluxo correto e homologado é abrir a página oficial em nova aba segura e importar o protocolo de autorização do evento emitido pela autoridade tributária.'
    }
  ];

  return (
    <div id="user-manual-container" className="space-y-6 text-slate-800 pb-16">
      {/* Header Principal */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-700/50">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <BookOpen className="w-3.5 h-3.5" />
              Guia Prático Operacional & Manuais
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Manual do Usuário & Guia de Recursos
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Aprenda a operar todos os recursos da plataforma de Escrituração Fiscal, Auditoria Preventiva e Integração ERP da sua empresa.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 border border-slate-600 transition shadow-sm"
              title="Imprimir ou salvar manual em PDF"
            >
              <Printer className="w-4 h-4 text-emerald-400" />
              <span>Imprimir Manual</span>
            </button>

            {onOpenPwaModal && (
              <button
                onClick={onOpenPwaModal}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md"
                title="Instalar aplicativo no Windows"
              >
                <Monitor className="w-4 h-4 text-emerald-200" />
                <span>Instalar no Windows (PWA)</span>
              </button>
            )}
          </div>
        </div>

        {/* Barra de Pesquisa Rápida no Manual */}
        <div className="mt-6 pt-6 border-t border-slate-700/60 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Pesquisar por assunto (ex: XML, DANFE, SPED, Protheus, Erro Provável, NF3-e, Salvar)..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 transition"
            />
            {busca && (
              <button
                onClick={() => setBusca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-700"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end text-xs">
            <button
              onClick={expandirTodas}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              Expandir Tudo
            </button>
            <button
              onClick={recolherTodas}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition"
            >
              Recolher Tudo
            </button>
          </div>
        </div>
      </div>

      {/* Filtro por Perfil Operacional */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
          <Layers className="w-4 h-4 text-emerald-600" />
          <span>Filtrar por Perfil de Usuário:</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {(
            [
              { id: 'TODOS', label: 'Todos os Recursos' },
              { id: 'OPERADOR', label: 'Operador / Assistente Fiscal' },
              { id: 'AUDITOR', label: 'Auditor Tributário' },
              { id: 'CONTADOR', label: 'Contador / Analista SPED' },
              { id: 'TI', label: 'TI & Administrador' }
            ] as const
          ).map(p => (
            <button
              key={p.id}
              onClick={() => setPerfilAtivo(p.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                perfilAtivo === p.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Card Resumo do Fluxo Operacional */}
      <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2.5 text-emerald-950 font-bold text-sm mb-3">
          <Zap className="w-4 h-4 text-emerald-700" />
          <span>Fluxo Operacional Padrão da Plataforma (Ciclo de Vida do Documento)</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
            <div className="font-extrabold text-emerald-800 mb-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 inline-flex items-center justify-center text-[10px]">1</span>
              Ingestão XML
            </div>
            <p className="text-slate-600">Upload de NF-e, CT-e e NF3-e com validação imediata de duplicidades.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
            <div className="font-extrabold text-blue-800 mb-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 inline-flex items-center justify-center text-[10px]">2</span>
              Auditoria
            </div>
            <p className="text-slate-600">Motor fiscal cruza alíquotas com as leis estaduais e Convênios CONFAZ.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
            <div className="font-extrabold text-purple-800 mb-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 inline-flex items-center justify-center text-[10px]">3</span>
              Homologação
            </div>
            <p className="text-slate-600">Parecer técnico emitido pelo auditor com gravação de Hash na Trilha.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
            <div className="font-extrabold text-amber-800 mb-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 inline-flex items-center justify-center text-[10px]">4</span>
              SPED Fiscal
            </div>
            <p className="text-slate-600">Geração automática dos Blocos 0, C e 9 para importação no PVA da RFB.</p>
          </div>
          <div className="p-3 bg-white rounded-xl border border-emerald-100 shadow-xs">
            <div className="font-extrabold text-indigo-800 mb-1 flex items-center gap-1">
              <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-800 inline-flex items-center justify-center text-[10px]">5</span>
              TOTVS Protheus
            </div>
            <p className="text-slate-600">Geração de lote ExecAuto para alimentar SF1/SD1 no ERP corporativo.</p>
          </div>
        </div>
      </div>

      {/* Lista de Capítulos do Manual */}
      <div className="space-y-4">
        {secoesFiltradas.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center border border-slate-200">
            <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <div className="font-bold text-slate-700">Nenhum tópico encontrado</div>
            <p className="text-slate-500 text-xs mt-1">
              Tente buscar por termos mais genéricos como "xml", "sped", "danfe" ou mude o filtro de perfil.
            </p>
          </div>
        ) : (
          secoesFiltradas.map(secao => {
            const Icone = secao.icone;
            const isAberta = secoesAbertas[secao.id] ?? false;

            return (
              <div
                key={secao.id}
                id={`secao-${secao.id}`}
                className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden transition-all"
              >
                {/* Cabeçalho da Seção Clicável */}
                <div
                  onClick={() => toggleSecao(secao.id)}
                  className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 select-none transition"
                >
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center flex-shrink-0 shadow-xs">
                      <Icone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-base font-bold text-slate-900 leading-tight">
                          {secao.titulo}
                        </span>
                        {secao.destaque && (
                          <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                            {secao.destaque}
                          </span>
                        )}
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-600 rounded-full border border-slate-200">
                          {secao.categoria}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-normal">
                        {secao.subtitulo}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {secao.telaAlvo && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onNavigate(secao.telaAlvo!);
                        }}
                        className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs rounded-lg border border-emerald-300 transition shadow-2xs"
                        title={`Ir diretamente para a tela de ${secao.titulo}`}
                      >
                        <span>Acessar Tela</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition"
                      aria-label={isAberta ? 'Recolher seção' : 'Expandir seção'}
                    >
                      {isAberta ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Conteúdo Expansível */}
                {isAberta && (
                  <div className="px-5 pb-6 pt-2 border-t border-slate-100 bg-slate-50/40 space-y-5">
                    {/* Objetivo do Módulo */}
                    <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-2xs">
                      <strong className="text-slate-900 font-semibold">Finalidade do Recurso: </strong>
                      {secao.conteudo.objetivo}
                    </div>

                    {/* Passo a Passo Ilustrado */}
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Passo a Passo de Utilização:</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {secao.conteudo.passos.map((passo, idx) => (
                          <div
                            key={idx}
                            className="bg-white p-3.5 rounded-xl border border-slate-200/90 shadow-2xs space-y-1.5 flex flex-col justify-between"
                          >
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                                <span className="w-5 h-5 rounded-full bg-slate-900 text-emerald-300 font-mono text-[10px] flex items-center justify-center flex-shrink-0">
                                  {idx + 1}
                                </span>
                                <span>{passo.titulo}</span>
                              </div>
                              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                                {passo.descricao}
                              </p>
                            </div>

                            {passo.dica && (
                              <div className="mt-2 pt-2 border-t border-slate-100 flex items-start gap-1.5 text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                                <span><strong>Dica Prática:</strong> {passo.dica}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Regras Críticas e Cuidados */}
                    {secao.conteudo.regrasOuAtencoes && secao.conteudo.regrasOuAtencoes.length > 0 && (
                      <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3.5 space-y-1 text-xs text-amber-950">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                          <AlertTriangle className="w-4 h-4 text-amber-700" />
                          <span>Atenção & Requisitos Críticos:</span>
                        </div>
                        <ul className="list-disc pl-5 space-y-1 text-amber-900/90 pt-1">
                          {secao.conteudo.regrasOuAtencoes.map((regra, rIdx) => (
                            <li key={rIdx}>{regra}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Botão de Navegação Direta na Base */}
                    {secao.telaAlvo && (
                      <div className="pt-1 flex justify-end">
                        <button
                          onClick={() => onNavigate(secao.telaAlvo!)}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-2 transition shadow-xs"
                        >
                          <span>{secao.conteudo.atalhoTexto || 'Abrir este Módulo Agora'}</span>
                          <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Seção de Perguntas Frequentes (FAQ) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Perguntas Frequentes (FAQ)</h2>
            <p className="text-xs text-slate-500">Dúvidas operacionais mais comuns entre operadores, assistentes e auditores.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, fIdx) => (
            <div key={fIdx} className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-2">
              <div className="text-xs font-bold text-slate-900 flex items-start gap-2">
                <span className="text-emerald-700 font-extrabold text-sm leading-none">?</span>
                <span>{faq.pergunta}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pl-4 border-l-2 border-emerald-500/40">
                {faq.resposta}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Glossário de Termos Tributários & Fiscais */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Glossário Tributário & Siglas Fiscais</h2>
            <p className="text-xs text-slate-500">Dicionário de conceitos fiscais e termos do SPED utilizados no sistema.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {glossario.map((g, gIdx) => (
            <div key={gIdx} className="p-3 bg-slate-50/80 border border-slate-200/70 rounded-xl space-y-1">
              <div className="font-extrabold text-xs text-emerald-950 font-mono tracking-tight bg-emerald-100/60 px-2 py-0.5 rounded-md inline-block">
                {g.termo}
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                {g.significado}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Rodapé Informativo */}
      <div className="bg-slate-900 rounded-xl p-5 text-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div>
          <div className="font-bold text-slate-200">TaxAudit Pro &bull; Plataforma Comercial Licenciada</div>
          <div className="text-slate-400 text-[11px]">Sistema de Gestão & Auditoria Fiscal Inteligente &bull; Licença Vitalícia</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('documentos')}
            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
          >
            Iniciar Operação
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition"
          >
            Voltar ao Topo
          </button>
        </div>
      </div>
    </div>
  );
};
