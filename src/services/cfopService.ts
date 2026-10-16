import {
  ClassificacaoCfopNatureza,
  CruzamentoCfopEntrada,
  CategoriaCfop,
  TipoTransacaoEntrada,
  AbrangenciaCfop,
  DocumentoFiscal,
  ItemDocumentoFiscal
} from '../types/fiscal';

/**
 * BASE NORMATIVA OFICIAL DE CFOP (CÓDIGO FISCAL DE OPERAÇÕES E PRESTAÇÕES)
 * Conforme Convênio S/Nº de 1970, Ajustes SINIEF, Tabela de CFOP da Receita Federal do Brasil e SPED Fiscal.
 * 
 * Focado especificamente na identificação e classificação de:
 * 1. Entradas de Mercadorias e Bens (Industrialização, Revenda, Ativo Imobilizado, Uso/Consumo)
 * 2. Aquisições de Serviços (Transportes, Telecomunicações, Energia Elétrica, Outros Serviços)
 * 3. Cruzamento De/Para: CFOP do Fornecedor (Saída 5.xxx / 6.xxx) ➔ CFOP de Entrada da Empresa Adquirente (1.xxx / 2.xxx / 3.xxx)
 */

export const TABELA_CFOP_OFICIAL: ClassificacaoCfopNatureza[] = [
  // =========================================================================
  // GRUPO 1: ENTRADAS E/OU AQUISIÇÕES DE SERVIÇOS DO ESTADO (OPERAÇÕES INTERNAS)
  // =========================================================================
  {
    cfop: '1101',
    naturezaOperacao: 'Compra para Industrialização ou Produção Rural',
    descricaoOficial: 'Compra para industrialização ou produção rural',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Lei Complementar 87/96 art. 20; Lei 10.637/02; LC 214/2025',
    detalhamentoFiscal: 'Classificam-se neste código as compras de mercadorias a serem utilizadas em processo de industrialização ou produção rural. Dá direito a crédito amplo de ICMS, IPI, PIS/COFINS e IBS/CBS.',
    exemploUso: 'Aquisição de matéria-prima, produtos intermediários ou embalagens aplicados no produto final.'
  },
  {
    cfop: '1102',
    naturezaOperacao: 'Compra para Comercialização',
    descricaoOficial: 'Compra para comercialização',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Lei Complementar 87/96 art. 20; Lei 10.833/03 art. 3º; LC 214/2025',
    detalhamentoFiscal: 'Classificam-se neste código as compras de mercadorias a serem comercializadas (revenda pura e simples). Permite crédito de ICMS, PIS/COFINS e novo IBS/CBS.',
    exemploUso: 'Mercadorias adquiridas prontas para venda a varejo ou atacado sem transformação.'
  },
  {
    cfop: '1111',
    naturezaOperacao: 'Compra para Industrialização de Mercadoria Recebida em Consignação',
    descricaoOficial: 'Compra para industrialização de mercadoria recebida anteriormente em consignação industrial',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 02/93; RICMS',
    detalhamentoFiscal: 'Efetivação de compra de insumos previamente recebidos em consignação industrial.',
    exemploUso: 'Faturamento de matéria-prima que estava armazenada em regime de consignação no estoque.'
  },
  {
    cfop: '1113',
    naturezaOperacao: 'Compra para Comercialização Recebida em Consignação',
    descricaoOficial: 'Compra para comercialização de mercadoria recebida anteriormente em consignação mercantil',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 02/93; Ajuste SINIEF 07/01',
    detalhamentoFiscal: 'Efetivação de compra de itens para revenda recebidos em consignação mercantil.',
    exemploUso: 'Produtos de terceiros expostos na loja cuja venda se confirmou.'
  },
  {
    cfop: '1116',
    naturezaOperacao: 'Compra para Industrialização - Entrega Futura',
    descricaoOficial: 'Compra para industrialização originada de encomenda para entrega futura',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 40',
    detalhamentoFiscal: 'Entrada física da mercadoria cujo faturamento antecipado ocorreu em momento anterior.',
    exemploUso: 'Recebimento efetivo no armazém de lote de matéria-prima pago antecipadamente.'
  },
  {
    cfop: '1117',
    naturezaOperacao: 'Compra para Comercialização - Entrega Futura',
    descricaoOficial: 'Compra para comercialização originada de encomenda para entrega futura',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 40',
    detalhamentoFiscal: 'Entrada de mercadoria de revenda com faturamento de entrega futura anterior.',
    exemploUso: 'Recebimento de produtos no centro de distribuição previamente encomendados.'
  },
  {
    cfop: '1120',
    naturezaOperacao: 'Compra para Industrialização em Venda à Ordem',
    descricaoOficial: 'Compra para industrialização, em venda à ordem, já recebida do vendedor remetente',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 40 § 3º',
    detalhamentoFiscal: 'Operação triangular onde a mercadoria é enviada diretamente por fornecedor a pedido do adquirente.',
    exemploUso: 'Insumo remetido diretamente da fábrica ao processo produtivo por ordem da revendedora.'
  },
  {
    cfop: '1124',
    naturezaOperacao: 'Industrialização Efetuada por Outra Empresa',
    descricaoOficial: 'Industrialização efetuada por outra empresa',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Cobrança do valor do serviço prestado e insumos agregados pelo industrializador em remessa para industrialização.',
    exemploUso: 'Retorno de beneficiamento, corte, pintura ou montagem executada por terceiros.'
  },
  {
    cfop: '1151',
    naturezaOperacao: 'Transferência para Industrialização',
    descricaoOficial: 'Transferência para industrialização ou produção rural',
    categoria: 'TRANSFERENCIA',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; LC 204/2023; Ajuste SINIEF 13/2024',
    detalhamentoFiscal: 'Entrada de matérias-primas e insumos transferidos entre filiais da mesma empresa no mesmo Estado.',
    exemploUso: 'Transferência da filial produtora para a filial montadora interna de SP.'
  },
  {
    cfop: '1152',
    naturezaOperacao: 'Transferência para Comercialização',
    descricaoOficial: 'Transferência para comercialização',
    categoria: 'TRANSFERENCIA',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; LC 204/2023; Ajuste SINIEF 13/2024',
    detalhamentoFiscal: 'Transferência de mercadorias para revenda entre estabelecimentos do mesmo titular.',
    exemploUso: 'Remessa do centro de distribuição estadual para a loja varejista da mesma pessoa jurídica.'
  },
  {
    cfop: '1201',
    naturezaOperacao: 'Devolução de Venda de Produção do Estabelecimento',
    descricaoOficial: 'Devolução de venda de produção do estabelecimento',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Retorno de mercadoria fabricada pela empresa que foi devolvida pelo cliente.',
    exemploUso: 'Cliente devolveu lote defeituoso ou com divergência de pedido.'
  },
  {
    cfop: '1202',
    naturezaOperacao: 'Devolução de Venda de Mercadoria de Terceiros',
    descricaoOficial: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Retorno ao estoque de mercadoria comercializada que havia sido adquirida de terceiros.',
    exemploUso: 'Devolução de produtos do atacado pelo comerciante varejista.'
  },
  {
    cfop: '1251',
    naturezaOperacao: 'Compra de Energia Elétrica para Distribuição',
    descricaoOficial: 'Compra de energia elétrica para distribuição ou comercialização',
    categoria: 'ENERGIA_ELETRICA',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, II, "a"',
    detalhamentoFiscal: 'Aquisição de energia elétrica por distribuidoras ou comercializadoras no mercado livre/cativo.',
    exemploUso: 'Empresa do setor elétrico adquirindo carga para revenda ao consumidor final.'
  },
  {
    cfop: '1252',
    naturezaOperacao: 'Compra de Energia Elétrica por Estabelecimento Industrial',
    descricaoOficial: 'Compra de energia elétrica por estabelecimento industrial',
    categoria: 'ENERGIA_ELETRICA',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, II, "b"; Laudo Técnico de Consumo na Linha Produtiva',
    detalhamentoFiscal: 'Aquisição de energia consumida no processo produtivo industrial. Dá direito ao crédito de ICMS na proporção consumida na produção (exige laudo pericial), além de PIS/COFINS e IBS/CBS.',
    exemploUso: 'Fatura de energia elétrica (NF3-e) consumida na linha fabril de indústria química.'
  },
  {
    cfop: '1253',
    naturezaOperacao: 'Compra de Energia Elétrica por Estabelecimento Comercial',
    descricaoOficial: 'Compra de energia elétrica por estabelecimento comercial',
    categoria: 'ENERGIA_ELETRICA',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, II; Lei 10.833/03 art. 3º, IX; LC 214/2025',
    detalhamentoFiscal: 'Energia consumida em escritório ou comércio. Vedado crédito de ICMS até 2033 conforme Lei Kandir, porém dá direito a crédito de PIS/COFINS não-cumulativo e novo crédito pleno de IBS/CBS!',
    exemploUso: 'Conta de luz do escritório administrativo, almoxarifado ou loja comercial.'
  },
  {
    cfop: '1301',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação para Execução de Serviço Idêntico',
    descricaoOficial: 'Aquisição de serviço de comunicação para execução de serviço da mesma natureza',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III',
    detalhamentoFiscal: 'Serviço de telecomunicações contratado por operadora ou provedor de internet (ISP) para retransmissão.',
    exemploUso: 'Link dedicado de telecom contratado por provedor de internet municipal.'
  },
  {
    cfop: '1302',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação por Estabelecimento Industrial',
    descricaoOficial: 'Aquisição de serviço de comunicação por estabelecimento industrial',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III; Lei 10.833/03; LC 214/2025',
    detalhamentoFiscal: 'Serviços de telefonia, fibra óptica e telecomunicações na fábrica. Gera crédito de IBS/CBS pleno e PIS/COFINS.',
    exemploUso: 'Nota Fiscal de Comunicação (NFCom modelo 62) para rede fabril interna.'
  },
  {
    cfop: '1303',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação por Estabelecimento Comercial',
    descricaoOficial: 'Aquisição de serviço de comunicação por estabelecimento comercial',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III; Lei 10.833/03; LC 214/2025',
    detalhamentoFiscal: 'Telefonia corporativa, links e dados comerciais. Crédito pleno na Reforma Tributária IBS/CBS.',
    exemploUso: 'Fatura de telecomunicações corporativa (Claro, Vivo, Oi) para filial comercial.'
  },
  {
    cfop: '1351',
    naturezaOperacao: 'Aquisição de Serviço de Transporte para Execução de Serviço Idêntico',
    descricaoOficial: 'Aquisição de serviço de transporte para execução de serviço da mesma natureza',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; RICMS',
    detalhamentoFiscal: 'Subcontratação ou redespacho de transporte efetuado por transportadora contratante.',
    exemploUso: 'Transportadora contratando terceiro para trecho rodoviário específico.'
  },
  {
    cfop: '1352',
    naturezaOperacao: 'Aquisição de Serviço de Transporte por Estabelecimento Industrial',
    descricaoOficial: 'Aquisição de serviço de transporte por estabelecimento industrial',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; Lei 10.637/02 art. 3º; Lei 10.833/03 art. 3º; LC 214/2025',
    detalhamentoFiscal: 'Frete de insumos para industrialização pago pelo adquirente (FOB). Permite crédito de ICMS (se a saída do produto for tributada), PIS/COFINS e novo IBS/CBS.',
    exemploUso: 'Conhecimento de Transporte Eletrônico (CT-e) referente a frete interno de matérias-primas.'
  },
  {
    cfop: '1353',
    naturezaOperacao: 'Aquisição de Serviço de Transporte por Estabelecimento Comercial',
    descricaoOficial: 'Aquisição de serviço de transporte por estabelecimento comercial',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; Lei 10.833/03 art. 3º; LC 214/2025',
    detalhamentoFiscal: 'Frete sobre compras de mercadorias para revenda contratado e pago pela empresa comercial (FOB).',
    exemploUso: 'CT-e emitido por transportadora rodoviária trazendo mercadorias adquiridas de terceiros.'
  },
  {
    cfop: '1401',
    naturezaOperacao: 'Compra para Industrialização Sujeita a Substituição Tributária',
    descricaoOficial: 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Artigo 264 do RICMS',
    detalhamentoFiscal: 'Entrada de mercadoria com recolhimento anterior do ICMS-ST ou inaplicabilidade por destinação à industrialização.',
    exemploUso: 'Compra de peças metálicas ou produtos químicos sujeitos a protocolo de ST aplicados na linha de montagem.'
  },
  {
    cfop: '1403',
    naturezaOperacao: 'Compra para Comercialização Sujeita a Substituição Tributária',
    descricaoOficial: 'Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Artigo 277 do RICMS; LC 214/2025',
    detalhamentoFiscal: 'Entrada de mercadorias para revenda cujo ICMS de toda a cadeia já foi retido pelo substituto tributário (CST 60/10). Sem crédito de ICMS próprio, mas com crédito de IBS/CBS na Reforma.',
    exemploUso: 'Bebidas, cosméticos, tintas, medicamentos e autopeças adquiridos com ICMS-ST recolhido.'
  },
  {
    cfop: '1406',
    naturezaOperacao: 'Compra de Bem para o Ativo Imobilizado Sujeito a ICMS-ST',
    descricaoOficial: 'Compra de bem para o ativo imobilizado cuja operação esteja sujeita ao regime de substituição tributária',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20 § 5º (CIAP 1/48 avos); LC 214/2025 (Crédito Imediato IBS/CBS)',
    detalhamentoFiscal: 'Aquisição de máquinas, veículos ou aparelhos do ativo imobilizado com ICMS recolhido por ST. Crédito de ICMS via CIAP (1/48 avos) do ICMS originário da operação própria.',
    exemploUso: 'Compra de caminhão ou empilhadeira com ST para utilização nas operações da empresa.'
  },
  {
    cfop: '1407',
    naturezaOperacao: 'Compra de Mercadoria para Uso ou Consumo com ICMS-ST',
    descricaoOficial: 'Compra de mercadoria para uso ou consumo cuja operação esteja sujeita ao regime de substituição tributária',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, I; LC 214/2025 (Novo IBS/CBS amplo)',
    detalhamentoFiscal: 'Material consumido internamente sem gerar produto de saída. Sem crédito de ICMS e PIS/COFINS, mas gerará crédito financeiro amplo de IBS/CBS a partir de 2026/2027.',
    exemploUso: 'Produtos de limpeza ou materiais elétricos de manutenção com ICMS-ST retido.'
  },
  {
    cfop: '1551',
    naturezaOperacao: 'Compra de Bem para o Ativo Imobilizado',
    descricaoOficial: 'Compra de bem para o ativo imobilizado',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20 § 5º (Bloco G SPED CIAP 1/48); Lei 10.637/02 e 10.833/03 art. 3º, VI; LC 214/2025 (IBS/CBS imediato)',
    detalhamentoFiscal: 'Aquisição de bens duráveis integrantes do Ativo Não Circulante Imobilizado. Permite apropriação de crédito de ICMS em 48 parcelas mensais (CIAP Bloco G), crédito de PIS/COFINS (por depreciação ou em 48 meses) e crédito IMEDIATO de IBS/CBS na Reforma Tributária!',
    exemploUso: 'Máquinas industriais, tornos CNC, servidores de rede, prensas ou veículos de entrega.'
  },
  {
    cfop: '1552',
    naturezaOperacao: 'Transferência de Bem do Ativo Imobilizado',
    descricaoOficial: 'Transferência de bem do ativo imobilizado',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; LC 204/2023; Ajuste SINIEF 13/2024',
    detalhamentoFiscal: 'Transferência física de máquina ou equipamento entre filiais do mesmo Estado.',
    exemploUso: 'Remanejamento de servidor de TI da matriz para filial estadual.'
  },
  {
    cfop: '1556',
    naturezaOperacao: 'Compra de Material para Uso ou Consumo',
    descricaoOficial: 'Compra de material para uso ou consumo',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, I; Lei 10.833/03 art. 3º; LC 214/2025 (Crédito Amplo IBS/CBS)',
    detalhamentoFiscal: 'Mercadorias adquiridas para consumo interno imediato (material de escritório, copa, descartáveis, uniformes). Veda crédito de ICMS até 2033, mas CONCEDE crédito integral e imediato de IBS e CBS pela Não-Cumulatividade Plena da EC 132/2023!',
    exemploUso: 'Papel A4, café, toner de impressora, lâmpadas ou material de limpeza do prédio.'
  },
  {
    cfop: '1651',
    naturezaOperacao: 'Compra de Combustível ou Lubrificante para Industrialização',
    descricaoOficial: 'Compra de combustível ou lubrificante para industrialização subseqüente',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; LC 192/2022 (ICMS Monofásico Combustíveis)',
    detalhamentoFiscal: 'Óleos industriais, graxas e combustíveis consumidos como insumo direto de caldeiras e fornos industriais.',
    exemploUso: 'Óleo BPF para fornalha de fundição ou lubrificante sintético para fresadoras industriais.'
  },
  {
    cfop: '1652',
    naturezaOperacao: 'Compra de Combustível ou Lubrificante para Comercialização',
    descricaoOficial: 'Compra de combustível ou lubrificante para comercialização',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 192/2022; Emenda Constitucional 33/2001',
    detalhamentoFiscal: 'Aquisição por postos revendedores de combustíveis ou distribuidores.',
    exemploUso: 'Gasolina e óleo diesel adquiridos por distribuidora para revenda.'
  },
  {
    cfop: '1653',
    naturezaOperacao: 'Compra de Combustível por Consumidor ou Usuário Final',
    descricaoOficial: 'Compra de combustível ou lubrificante por consumidor ou usuário final',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 192/2022 (Tributação Monofásica Ad Rem); LC 214/2025',
    detalhamentoFiscal: 'Abastecimento da frota de veículos administrativos ou apoio da empresa.',
    exemploUso: 'Cupom ou NF-e de combustível abastecido no tanque dos veículos comerciais da diretoria/vendas.'
  },
  {
    cfop: '1901',
    naturezaOperacao: 'Entrada para Industrialização por Encomenda',
    descricaoOficial: 'Entrada para industrialização por encomenda',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 42; Suspensão de ICMS e IPI',
    detalhamentoFiscal: 'Recebimento de matérias-primas de terceiro encomendante com suspensão do ICMS para realização de serviço de industrialização.',
    exemploUso: 'Recebimento de chapas de aço para dobra e solda contratadas pelo encomendante.'
  },
  {
    cfop: '1902',
    naturezaOperacao: 'Retorno de Mercadoria Remetida para Industrialização por Encomenda',
    descricaoOficial: 'Retorno de mercadoria remetida para industrialização por encomenda',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 42; RICMS',
    detalhamentoFiscal: 'Retorno físico do insumo que havia sido enviado ao terceirizado industrializador (retorno do valor do insumo com suspensão).',
    exemploUso: 'Retorno dos componentes manufaturados pelo prestador de serviços fabris.'
  },
  {
    cfop: '1910',
    naturezaOperacao: 'Entrada de Bonificação, Doação ou Brinde',
    descricaoOficial: 'Entrada de bonificação, doação ou brinde',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Artigo 455 do RICMS',
    detalhamentoFiscal: 'Recebimento gratuito de mercadorias bonificadas em negociação comercial pelo fornecedor.',
    exemploUso: 'Itens adicionais gratuitos enviados pelo fabricante como desconto comercial em espécie.'
  },
  {
    cfop: '1915',
    naturezaOperacao: 'Entrada de Mercadoria ou Bem Recebido para Conserto ou Reparo',
    descricaoOficial: 'Entrada de mercadoria ou bem recebido para conserto ou reparo',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 43; Não Incidência ICMS',
    detalhamentoFiscal: 'Entrada de bem de terceiro destinado a manutenção técnica sem transferência de propriedade.',
    exemploUso: 'Equipamento recebido na assistência técnica para substituição de placa.'
  },
  {
    cfop: '1916',
    naturezaOperacao: 'Retorno de Mercadoria Remetida para Conserto ou Reparo',
    descricaoOficial: 'Retorno de mercadoria ou bem remetido para conserto ou reparo',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 43',
    detalhamentoFiscal: 'Retorno do ativo da própria empresa que estava na oficina ou assistência.',
    exemploUso: 'Motor elétrico da fábrica consertado retornando às instalações industriais.'
  },
  {
    cfop: '1949',
    naturezaOperacao: 'Outra Entrada de Mercadoria ou Prestação de Serviço não Especificada',
    descricaoOficial: 'Outra entrada de mercadoria ou prestação de serviço não especificada',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'OUTRA_TRANSACAO',
    abrangencia: 'ESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Ajuste SINIEF 07/01 (Código Residual Interno)',
    detalhamentoFiscal: 'Código fiscal genérico de uso estrito e excepcional para operações sem CFOP específico previsto em tabela.',
    exemploUso: 'Entrada de comodato, vasilhames ou amostras sem tipificação específica.'
  },

  // =========================================================================
  // GRUPO 2: ENTRADAS E/OU AQUISIÇÕES DE SERVIÇOS DE OUTROS ESTADOS (INTERESTADUAIS)
  // =========================================================================
  {
    cfop: '2101',
    naturezaOperacao: 'Compra para Industrialização (Interestadual)',
    descricaoOficial: 'Compra para industrialização ou produção rural',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Resolução do Senado Federal 22/1989 (Alíquotas 7% e 12%); LC 214/2025',
    detalhamentoFiscal: 'Entrada de insumos oriundos de outra Unidade Federada (alíquota interestadual de 7% ou 12%, ou 4% para produtos importados pela Res. SF 13/2012). Gera crédito amplo de ICMS, IPI, PIS/COFINS e IBS/CBS.',
    exemploUso: 'Matéria-prima adquirida de fornecedor de Minas Gerais por indústria de São Paulo.'
  },
  {
    cfop: '2102',
    naturezaOperacao: 'Compra para Comercialização (Interestadual)',
    descricaoOficial: 'Compra para comercialização',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Lei Complementar 87/96 art. 20; Lei 10.833/03 art. 3º; LC 214/2025',
    detalhamentoFiscal: 'Entrada interestadual de mercadorias destinadas à revenda. Sujeita a alíquota interestadual de 12%, 7% ou 4% (FCI). Dá direito a crédito de ICMS na alíquota de origem e PIS/COFINS.',
    exemploUso: 'Comércio adquire produtos para revenda faturados por distribuidor de outro Estado.'
  },
  {
    cfop: '2124',
    naturezaOperacao: 'Industrialização Efetuada por Outra Empresa (Interestadual)',
    descricaoOficial: 'Industrialização efetuada por outra empresa',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; Convênio SINIEF S/Nº 1970 art. 42',
    detalhamentoFiscal: 'Cobrança da industrialização por terceiros situada em outra UF.',
    exemploUso: 'Serviço de galvanoplastia ou tratamento térmico realizado em fábrica de outro Estado.'
  },
  {
    cfop: '2151',
    naturezaOperacao: 'Transferência para Industrialização (Interestadual)',
    descricaoOficial: 'Transferência para industrialização ou produção rural',
    categoria: 'TRANSFERENCIA',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; Lei Complementar 204/2023; Convênio ICMS 109/2024',
    detalhamentoFiscal: 'Transferência interestadual de insumos entre filiais. Aplica-se transferência obrigatória ou opcional do crédito de ICMS pelas alíquotas interestaduais.',
    exemploUso: 'Remessa de insumos da filial do Rio de Janeiro para montagem na matriz de São Paulo.'
  },
  {
    cfop: '2152',
    naturezaOperacao: 'Transferência para Comercialização (Interestadual)',
    descricaoOficial: 'Transferência para comercialização',
    categoria: 'TRANSFERENCIA',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; LC 204/2023; Convênio ICMS 109/2024',
    detalhamentoFiscal: 'Transferência interestadual de estoques de revenda.',
    exemploUso: 'Abastecimento interestadual de centro de distribuição a partir de armazém de outra UF.'
  },
  {
    cfop: '2201',
    naturezaOperacao: 'Devolução de Venda de Produção (Interestadual)',
    descricaoOficial: 'Devolução de venda de produção do estabelecimento',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Retorno de produto acabado fabricado devolvido por cliente de outro Estado.',
    exemploUso: 'Cliente do Paraná devolvendo lote manufaturado em São Paulo.'
  },
  {
    cfop: '2202',
    naturezaOperacao: 'Devolução de Venda de Mercadoria de Terceiros (Interestadual)',
    descricaoOficial: 'Devolução de venda de mercadoria adquirida ou recebida de terceiros',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Retorno interestadual de produtos adquiridos para comercialização.',
    exemploUso: 'Revenda de mercadoria devolvida por cliente situado em outro Estado.'
  },
  {
    cfop: '2252',
    naturezaOperacao: 'Compra de Energia Elétrica por Estabelecimento Industrial (Interestadual)',
    descricaoOficial: 'Compra de energia elétrica por estabelecimento industrial',
    categoria: 'ENERGIA_ELETRICA',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, II; CCEE Mercado Livre',
    detalhamentoFiscal: 'Aquisição de energia elétrica no Mercado Livre (CCEE) contratada de geradora situada em outro Estado.',
    exemploUso: 'Contrato de fornecimento de energia eólica do Nordeste para indústria no Sudeste.'
  },
  {
    cfop: '2253',
    naturezaOperacao: 'Compra de Energia Elétrica por Estabelecimento Comercial (Interestadual)',
    descricaoOficial: 'Compra de energia elétrica por estabelecimento comercial',
    categoria: 'ENERGIA_ELETRICA',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, II; LC 214/2025',
    detalhamentoFiscal: 'Energia contratada de outra UF para estabelecimento comercial.',
    exemploUso: 'Aquisição de energia interestadual para conjunto de lojas comerciais.'
  },
  {
    cfop: '2301',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação para Serviço Idêntico (Interestadual)',
    descricaoOficial: 'Aquisição de serviço de comunicação para execução de serviço da mesma natureza',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III',
    detalhamentoFiscal: 'Backbone de telecomunicações interestadual contratado por operadora.',
    exemploUso: 'Interconexão interestadual de dados por provedor de internet.'
  },
  {
    cfop: '2302',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação por Indústria (Interestadual)',
    descricaoOficial: 'Aquisição de serviço de comunicação por estabelecimento industrial',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III; LC 214/2025',
    detalhamentoFiscal: 'Serviço interestadual de telecomunicações para indústria.',
    exemploUso: 'Link de dados conectando fábrica a datacenter em outro Estado.'
  },
  {
    cfop: '2303',
    naturezaOperacao: 'Aquisição de Serviço de Comunicação por Comércio (Interestadual)',
    descricaoOficial: 'Aquisição de serviço de comunicação por estabelecimento comercial',
    categoria: 'SERVICO_COMUNICACAO',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, III; LC 214/2025',
    detalhamentoFiscal: 'Telecomunicações corporativas interestaduais.',
    exemploUso: 'Serviços de voz e dados interurbanos corporativos.'
  },
  {
    cfop: '2352',
    naturezaOperacao: 'Aquisição de Serviço de Transporte por Estabelecimento Industrial (Interestadual)',
    descricaoOficial: 'Aquisição de serviço de transporte por estabelecimento industrial',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; Lei 10.637/02; Lei 10.833/03 art. 3º; LC 214/2025',
    detalhamentoFiscal: 'CT-e interestadual com frete FOB de matérias-primas e insumos industriais. Permite apropriação de crédito de ICMS pela alíquota interestadual destacada, PIS/COFINS e novo IBS/CBS.',
    exemploUso: 'Transporte rodoviário de cargas trazendo peças de metalurgia de MG para indústria em SP.'
  },
  {
    cfop: '2353',
    naturezaOperacao: 'Aquisição de Serviço de Transporte por Estabelecimento Comercial (Interestadual)',
    descricaoOficial: 'Aquisição de serviço de transporte por estabelecimento comercial',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20; Lei 10.833/03; LC 214/2025',
    detalhamentoFiscal: 'Frete interestadual sobre compras de mercadorias para revenda contratado sob cláusula FOB.',
    exemploUso: 'CT-e interestadual de transporte de mercadorias para estoque de revenda.'
  },
  {
    cfop: '2401',
    naturezaOperacao: 'Compra para Industrialização Sujeita a ST (Interestadual)',
    descricaoOficial: 'Compra para industrialização ou produção rural em operação com mercadoria sujeita ao regime de substituição tributária',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio ICMS 142/2018; Inaplicabilidade de ST a insumos industriais',
    detalhamentoFiscal: 'Mercadoria interestadual com protocolo de ST quando destinada à industrialização (geralmente não retém ICMS-ST pelo destinatário ser industrializador).',
    exemploUso: 'Peças com MVA adquiridas de outro Estado para montagem fabril.'
  },
  {
    cfop: '2403',
    naturezaOperacao: 'Compra para Comercialização Sujeita a ST (Interestadual)',
    descricaoOficial: 'Compra para comercialização em operação com mercadoria sujeita ao regime de substituição tributária',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio ICMS 142/2018; LC 214/2025',
    detalhamentoFiscal: 'Compra de mercadoria de outra UF com recolhimento de ICMS-ST por convênio ou guia GNRE.',
    exemploUso: 'Autopeças ou produtos de perfumaria vindos de outro Estado com ST retida na fonte.'
  },
  {
    cfop: '2406',
    naturezaOperacao: 'Compra de Bem para Ativo Imobilizado Sujeito a ICMS-ST (Interestadual)',
    descricaoOficial: 'Compra de bem para o ativo imobilizado cuja operação esteja sujeita ao regime de substituição tributária',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio ICMS 142/2018; LC 87/96 art. 20 § 5º (CIAP)',
    detalhamentoFiscal: 'Aquisição de máquina ou veículo de outra UF sujeito a DIFAL ST.',
    exemploUso: 'Veículo utilitário adquirido de montadora de outro Estado para uso da empresa.'
  },
  {
    cfop: '2407',
    naturezaOperacao: 'Compra de Material de Uso ou Consumo com ICMS-ST (Interestadual)',
    descricaoOficial: 'Compra de mercadoria para uso ou consumo cuja operação esteja sujeita ao regime de substituição tributária',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Convênio ICMS 142/2018; LC 214/2025',
    detalhamentoFiscal: 'Material de consumo com ICMS-ST vindo de outra UF.',
    exemploUso: 'Material de construção para reforma predial adquirido interestadual com ST.'
  },
  {
    cfop: '2551',
    naturezaOperacao: 'Compra de Bem para o Ativo Imobilizado (Interestadual)',
    descricaoOficial: 'Compra de bem para o ativo imobilizado',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 20 § 5º; EC 87/2015 (DIFAL Ativo); Lei 10.637/02; LC 214/2025',
    detalhamentoFiscal: 'Aquisição interestadual de bens do ativo imobilizado. Sujeita ao recolhimento do DIFAL (Diferencial de Alíquota) pelo adquirente. Permite crédito de ICMS em 48 meses (CIAP), inclusive da parcela do DIFAL, crédito de PIS/COFINS e crédito imediato de IBS/CBS!',
    exemploUso: 'Centro de usinagem industrial adquirido de fabricante de Santa Catarina por empresa paulista.'
  },
  {
    cfop: '2552',
    naturezaOperacao: 'Transferência de Bem do Ativo Imobilizado (Interestadual)',
    descricaoOficial: 'Transferência de bem do ativo imobilizado',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'ADC 49 STF; LC 204/2023; Convênio ICMS 109/2024',
    detalhamentoFiscal: 'Deslocamento interestadual de bem patrimonial entre estabelecimentos da mesma empresa.',
    exemploUso: 'Transferência de máquina da matriz em SP para fábrica em MG.'
  },
  {
    cfop: '2556',
    naturezaOperacao: 'Compra de Material para Uso ou Consumo (Interestadual)',
    descricaoOficial: 'Compra de material para uso ou consumo',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96 art. 33, I; EC 87/2015 (DIFAL Uso e Consumo); LC 214/2025 (IBS/CBS Amplo)',
    detalhamentoFiscal: 'Materiais de consumo adquiridos de outro Estado. Sujeita ao pagamento do DIFAL de uso e consumo à UF de destino. Sem crédito de ICMS no regime atual, porém COM DIREITO A CRÉDITO DE IBS/CBS na Reforma Tributária!',
    exemploUso: 'Suprimentos corporativos de escritório encomendados de fornecedor de Curitiba para sede em SP.'
  },
  {
    cfop: '2651',
    naturezaOperacao: 'Compra de Combustível para Industrialização (Interestadual)',
    descricaoOficial: 'Compra de combustível ou lubrificante para industrialização subseqüente',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96; LC 192/2022',
    detalhamentoFiscal: 'Combustível industrial adquirido de refinaria ou distribuidora interestadual.',
    exemploUso: 'Gás natural liquefeito ou óleo combustível para caldeiras trazido de outra UF.'
  },
  {
    cfop: '2653',
    naturezaOperacao: 'Compra de Combustível por Usuário Final (Interestadual)',
    descricaoOficial: 'Compra de combustível ou lubrificante por consumidor ou usuário final',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 192/2022; LC 214/2025',
    detalhamentoFiscal: 'Abastecimento interestadual de frotas e veículos em trânsito.',
    exemploUso: 'Nota de combustível em viagem interestadual do caminhão da empresa.'
  },
  {
    cfop: '2901',
    naturezaOperacao: 'Entrada para Industrialização por Encomenda (Interestadual)',
    descricaoOficial: 'Entrada para industrialização por encomenda',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970 art. 42; Convênio AE-15/74',
    detalhamentoFiscal: 'Entrada com suspensão tributária de insumos enviados por encomendante de outra UF.',
    exemploUso: 'Matéria-prima de cliente do Rio de Janeiro recebida para montagem em SP.'
  },
  {
    cfop: '2902',
    naturezaOperacao: 'Retorno de Mercadoria Remetida para Industrialização (Interestadual)',
    descricaoOficial: 'Retorno de mercadoria remetida para industrialização por encomenda',
    categoria: 'DEVOLUCAO_RETORNO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970; Convênio AE-15/74',
    detalhamentoFiscal: 'Retorno dos insumos próprios manufaturados por industrializador de outra UF.',
    exemploUso: 'Peças manufaturadas retornando de fornecedor situado no PR.'
  },
  {
    cfop: '2910',
    naturezaOperacao: 'Entrada de Bonificação, Doação ou Brinde (Interestadual)',
    descricaoOficial: 'Entrada de bonificação, doação ou brinde',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Ajuste SINIEF 07/01; RICMS',
    detalhamentoFiscal: 'Bonificação em mercadorias recebidas gratuitamente de fornecedor de outra UF.',
    exemploUso: 'Brindes ou bonificação comercial recebida em pedido de compras interestadual.'
  },
  {
    cfop: '2915',
    naturezaOperacao: 'Entrada de Mercadoria Recebida para Conserto (Interestadual)',
    descricaoOficial: 'Entrada de mercadoria ou bem recebido para conserto ou reparo',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Convênio SINIEF S/Nº 1970; Convênio ICMS 15/91',
    detalhamentoFiscal: 'Entrada com suspensão do imposto de bem de terceiro de outra UF para manutenção.',
    exemploUso: 'Bomba hidráulica de cliente de MG enviada para calibração em oficina em SP.'
  },
  {
    cfop: '2949',
    naturezaOperacao: 'Outra Entrada de Mercadoria ou Serviço não Especificada (Interestadual)',
    descricaoOficial: 'Outra entrada de mercadoria ou prestação de serviço não especificada',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'OUTRA_TRANSACAO',
    abrangencia: 'INTERESTADUAL',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Ajuste SINIEF 07/01 (Código Residual Interestadual)',
    detalhamentoFiscal: 'Código residual interestadual para transações atípicas.',
    exemploUso: 'Entrada de mostruário, comodato ou devolução atípica de outros Estados.'
  },

  // =========================================================================
  // GRUPO 3: ENTRADAS E/OU AQUISIÇÕES DE SERVIÇOS DO EXTERIOR (IMPORTAÇÃO DIRETA)
  // =========================================================================
  {
    cfop: '3101',
    naturezaOperacao: 'Compra para Industrialização (Importação)',
    descricaoOficial: 'Compra para industrialização ou produção rural',
    categoria: 'MERCADORIA_INDUSTRIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: true,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Constituição Federal art. 155, § 2º, IX, "a"; Lei 10.865/04 (PIS/COFINS Importação); LC 214/2025',
    detalhamentoFiscal: 'Desembaraço aduaneiro de insumos e matérias-primas importadas com emissão de NF-e de Entrada com base na Declaração de Importação (DI/DUIMP). Dá direito a crédito de ICMS Importação, IPI Importação, PIS/COFINS Importação e futuro IBS/CBS.',
    exemploUso: 'Desembaraço de componentes microeletrônicos importados da Alemanha.'
  },
  {
    cfop: '3102',
    naturezaOperacao: 'Compra para Comercialização (Importação)',
    descricaoOficial: 'Compra para comercialização',
    categoria: 'MERCADORIA_COMERCIALIZACAO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Constituição Federal art. 155, § 2º; Lei 10.865/04; LC 214/2025',
    detalhamentoFiscal: 'Desembaraço aduaneiro de produtos acabados importados para revenda no mercado brasileiro.',
    exemploUso: 'Container de vestuário ou eletroeletrônicos importados para lojas comerciais.'
  },
  {
    cfop: '3352',
    naturezaOperacao: 'Aquisição de Serviço de Transporte por Indústria (Importação)',
    descricaoOficial: 'Aquisição de serviço de transporte por estabelecimento industrial',
    categoria: 'SERVICO_TRANSPORTE',
    transacaoTipo: 'AQUISICAO_SERVICO',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'LC 87/96; Lei 10.865/04',
    detalhamentoFiscal: 'Frete internacional e capatazia aduaneira alocados na importação de insumos industriais.',
    exemploUso: 'Frete marítimo ou aéreo internacional para desembaraço de matéria-prima.'
  },
  {
    cfop: '3551',
    naturezaOperacao: 'Compra de Bem para o Ativo Imobilizado (Importação)',
    descricaoOficial: 'Compra de bem para o ativo imobilizado',
    categoria: 'BEM_ATIVO_IMOBILIZADO',
    transacaoTipo: 'ENTRADA_BEM_ATIVO',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: false,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: true,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: true,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Constituição Federal art. 155; LC 87/96 art. 20 § 5º (CIAP); Lei 10.865/04; LC 214/2025',
    detalhamentoFiscal: 'Máquinas e bens patrimoniais importados diretamente pela empresa. Crédito de ICMS em 48 parcelas (CIAP), PIS/COFINS Importação e crédito imediato de IBS/CBS!',
    exemploUso: 'Robô de solda ou linha de automação industrial importada do Japão.'
  },
  {
    cfop: '3556',
    naturezaOperacao: 'Compra de Material para Uso ou Consumo (Importação)',
    descricaoOficial: 'Compra de material para uso ou consumo',
    categoria: 'MATERIAL_USO_CONSUMO',
    transacaoTipo: 'ENTRADA_MERCADORIA',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: false,
    aplicaAquisicaoServico: false,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: true,
    fundamentoLegal: 'Constituição Federal art. 155; LC 214/2025',
    detalhamentoFiscal: 'Material consumido internamente importado de outro país.',
    exemploUso: 'Catálogos, uniformes especiais ou consumíveis importados diretamente.'
  },
  {
    cfop: '3949',
    naturezaOperacao: 'Outra Entrada de Mercadoria ou Prestação do Exterior',
    descricaoOficial: 'Outra entrada de mercadoria ou prestação de serviço não especificada',
    categoria: 'OUTRAS_ENTRADAS',
    transacaoTipo: 'OUTRA_TRANSACAO',
    abrangencia: 'EXTERIOR',
    aplicaEntradaMercadoria: true,
    aplicaEntradaBem: true,
    aplicaAquisicaoServico: true,
    permiteCreditoIcms: false,
    permiteCreditoIpi: false,
    permiteCreditoPisCofins: false,
    permiteCreditoIbsCbs: false,
    fundamentoLegal: 'Ajuste SINIEF 07/01 (Código Residual Exterior)',
    detalhamentoFiscal: 'Operações atípicas de entrada física ou documental do exterior.',
    exemploUso: 'Retorno do exterior de amostras enviadas para testes laboratoriais internacionais.'
  }
];

/**
 * MATRIZ DE CRUZAMENTO DE/PARA:
 * CFOP DO FORNECEDOR (SAÍDA: 5.xxx / 6.xxx) ➔ CFOP DE ESCRITURAÇÃO DE ENTRADA NA EMPRESA ADQUIRENTE
 * Cruzando a Natureza da Operação com a Destinação Interna (Mercadoria p/ Indústria ou Revenda, Ativo Imobilizado, Uso/Consumo ou Aquisição de Serviço)
 */
export const MATRIZ_CRUZAMENTO_ENTRADAS: CruzamentoCfopEntrada[] = [
  // 5101 / 6101 - Venda de produção do estabelecimento
  {
    cfopOrigem: '5101',
    naturezaOrigem: 'Venda de produção do estabelecimento (Interna)',
    cfopEntradaInterno: '1101',
    cfopEntradaInterestadual: '2101',
    naturezaEntradaSugerida: 'Compra para industrialização ou produção rural',
    destinacaoEmpresa: 'INDUSTRIALIZACAO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Se a empresa for indústria e for aplicar os itens em processo produtivo, deve classificar no CFOP 1101/2101, garantindo crédito amplo de ICMS, IPI e IBS/CBS.'
  },
  {
    cfopOrigem: '5101',
    naturezaOrigem: 'Venda de produção do estabelecimento (Interna)',
    cfopEntradaInterno: '1102',
    cfopEntradaInterestadual: '2102',
    naturezaEntradaSugerida: 'Compra para comercialização',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Se a empresa for comercial e for revender a mercadoria sem transformação, a entrada será no CFOP 1102/2102.'
  },
  {
    cfopOrigem: '5101',
    naturezaOrigem: 'Venda de produção do estabelecimento (Interna)',
    cfopEntradaInterno: '1551',
    cfopEntradaInterestadual: '2551',
    naturezaEntradaSugerida: 'Compra de bem para o ativo imobilizado',
    destinacaoEmpresa: 'ATIVO_IMOBILIZADO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Se for máquina, equipamento ou utilitário destinado ao patrimônio, entra no CFOP 1551/2551 com apropriação CIAP 1/48 avos e crédito imediato IBS/CBS.'
  },
  {
    cfopOrigem: '5101',
    naturezaOrigem: 'Venda de produção do estabelecimento (Interna)',
    cfopEntradaInterno: '1556',
    cfopEntradaInterestadual: '2556',
    naturezaEntradaSugerida: 'Compra de material para uso ou consumo',
    destinacaoEmpresa: 'USO_CONSUMO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: false,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Itens consumidos internamente sem revenda ou produção. Sem crédito ICMS/PIS/COFINS atual, com crédito de IBS/CBS na Reforma.'
  },

  // 5102 / 6102 - Venda de mercadoria adquirida de terceiros
  {
    cfopOrigem: '5102',
    naturezaOrigem: 'Venda de mercadoria adquirida ou recebida de terceiros (Interna)',
    cfopEntradaInterno: '1102',
    cfopEntradaInterestadual: '2102',
    naturezaEntradaSugerida: 'Compra para comercialização',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Cruzamento padrão para distribuidores e revendedores: Fornecedor emite 5102/6102 ➔ Comprador escritura 1102/2102.'
  },
  {
    cfopOrigem: '5102',
    naturezaOrigem: 'Venda de mercadoria adquirida ou recebida de terceiros (Interna)',
    cfopEntradaInterno: '1101',
    cfopEntradaInterestadual: '2101',
    naturezaEntradaSugerida: 'Compra para industrialização',
    destinacaoEmpresa: 'INDUSTRIALIZACAO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Insumo comprado de atacadista ou comerciante para ser utilizado na indústria: escritura 1101/2101.'
  },
  {
    cfopOrigem: '5102',
    naturezaOrigem: 'Venda de mercadoria adquirida ou recebida de terceiros (Interna)',
    cfopEntradaInterno: '1556',
    cfopEntradaInterestadual: '2556',
    naturezaEntradaSugerida: 'Compra de material para uso ou consumo',
    destinacaoEmpresa: 'USO_CONSUMO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: false,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Suprimentos adquiridos no comércio para uso das dependências da empresa: escritura 1556/2556.'
  },
  {
    cfopOrigem: '5102',
    naturezaOrigem: 'Venda de mercadoria adquirida ou recebida de terceiros (Interna)',
    cfopEntradaInterno: '1551',
    cfopEntradaInterestadual: '2551',
    naturezaEntradaSugerida: 'Compra de bem para o ativo imobilizado',
    destinacaoEmpresa: 'ATIVO_IMOBILIZADO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Equipamento ou mobiliário comprado de lojista para o ativo: escritura 1551/2551.'
  },

  // 6101 / 6102 - Saídas interestaduais de fornecedores
  {
    cfopOrigem: '6101',
    naturezaOrigem: 'Venda de produção do estabelecimento (Interestadual)',
    cfopEntradaInterno: '1101',
    cfopEntradaInterestadual: '2101',
    naturezaEntradaSugerida: 'Compra para industrialização (Interestadual)',
    destinacaoEmpresa: 'INDUSTRIALIZACAO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Fornecedor de outra UF emitiu 6101 ➔ Entrada na empresa será no CFOP 2101 (alíquota interestadual 7%, 12% ou 4%).'
  },
  {
    cfopOrigem: '6102',
    naturezaOrigem: 'Venda de mercadoria de terceiros (Interestadual)',
    cfopEntradaInterno: '1102',
    cfopEntradaInterestadual: '2102',
    naturezaEntradaSugerida: 'Compra para comercialização (Interestadual)',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Fornecedor de outra UF emitiu 6102 ➔ Entrada de revenda será no CFOP 2102.'
  },

  // 5405 / 6403 - Mercadorias com Substituição Tributária (ST)
  {
    cfopOrigem: '5405',
    naturezaOrigem: 'Venda de mercadoria sujeita a ST como contribuinte substituído',
    cfopEntradaInterno: '1403',
    cfopEntradaInterestadual: '2403',
    naturezaEntradaSugerida: 'Compra para comercialização com ICMS-ST',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Fornecedor emite com CFOP 5405 e CST 60 (imposto cobrado anteriormente por ST). Entrada deve ser escriturada como 1403/2403 sem aproveitamento de crédito de ICMS próprio.'
  },
  {
    cfopOrigem: '5401',
    naturezaOrigem: 'Venda de produção com retenção do ICMS-ST',
    cfopEntradaInterno: '1403',
    cfopEntradaInterestadual: '2403',
    naturezaEntradaSugerida: 'Compra para comercialização sujeita a ICMS-ST',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Fornecedor fabricante retém ICMS-ST na NF (CST 10). A empresa adquirente registra como 1403/2403.'
  },
  {
    cfopOrigem: '5403',
    naturezaOrigem: 'Venda de mercadoria de terceiros com retenção de ST',
    cfopEntradaInterno: '1403',
    cfopEntradaInterestadual: '2403',
    naturezaEntradaSugerida: 'Compra para comercialização com ICMS-ST',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Revenda de mercadoria sujeita a regime de ST.'
  },
  {
    cfopOrigem: '5405',
    naturezaOrigem: 'Venda de mercadoria sujeita a ST',
    cfopEntradaInterno: '1407',
    cfopEntradaInterestadual: '2407',
    naturezaEntradaSugerida: 'Compra de mercadoria para uso ou consumo com ICMS-ST',
    destinacaoEmpresa: 'USO_CONSUMO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: false,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Item com ST comprado para consumo da empresa: escriturar no CFOP 1407/2407.'
  },
  {
    cfopOrigem: '5405',
    naturezaOrigem: 'Venda de mercadoria sujeita a ST',
    cfopEntradaInterno: '1406',
    cfopEntradaInterestadual: '2406',
    naturezaEntradaSugerida: 'Compra de bem para o ativo imobilizado com ICMS-ST',
    destinacaoEmpresa: 'ATIVO_IMOBILIZADO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Bem durável para o ativo cuja mercadoria tenha ST: escritura 1406/2406 com crédito via CIAP da operação própria.'
  },

  // 5352 / 6352 / 5353 / 6353 - Aquisição de Serviços de Transporte (CT-e)
  {
    cfopOrigem: '5352',
    naturezaOrigem: 'Prestação de serviço de transporte a estabelecimento industrial',
    cfopEntradaInterno: '1352',
    cfopEntradaInterestadual: '2352',
    naturezaEntradaSugerida: 'Aquisição de serviço de transporte por estabelecimento industrial',
    destinacaoEmpresa: 'PRESTACAO_SERVICO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Transportadora emite CT-e com CFOP 5352/6352. A indústria compradora que paga o frete FOB registra com 1352 (mesma UF) ou 2352 (interestadual), aproveitando crédito de ICMS, PIS/COFINS e IBS/CBS.'
  },
  {
    cfopOrigem: '5353',
    naturezaOrigem: 'Prestação de serviço de transporte a estabelecimento comercial',
    cfopEntradaInterno: '1353',
    cfopEntradaInterestadual: '2353',
    naturezaEntradaSugerida: 'Aquisição de serviço de transporte por estabelecimento comercial',
    destinacaoEmpresa: 'PRESTACAO_SERVICO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Transportadora emite CT-e 5353/6353 ➔ Comércio comprador registra como 1353/2353.'
  },

  // 5253 / 6253 - Compra de Energia Elétrica (NF3-e)
  {
    cfopOrigem: '5253',
    naturezaOrigem: 'Fornecimento de energia elétrica a estabelecimento comercial',
    cfopEntradaInterno: '1252',
    cfopEntradaInterestadual: '2252',
    naturezaEntradaSugerida: 'Compra de energia elétrica por estabelecimento industrial',
    destinacaoEmpresa: 'INDUSTRIALIZACAO',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Distribuidora faturou energia elétrica ➔ Indústria registra no CFOP 1252/2252 com crédito de ICMS da linha fabril, PIS/COFINS e IBS/CBS.'
  },
  {
    cfopOrigem: '5253',
    naturezaOrigem: 'Fornecimento de energia elétrica a consumidor',
    cfopEntradaInterno: '1253',
    cfopEntradaInterestadual: '2253',
    naturezaEntradaSugerida: 'Compra de energia elétrica por estabelecimento comercial',
    destinacaoEmpresa: 'USO_CONSUMO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Consumo no escritório ou comércio ➔ Escritura no CFOP 1253/2253.'
  },

  // 5303 / 6303 - Aquisição de Serviços de Comunicação / Telecomunicações (NFCom)
  {
    cfopOrigem: '5303',
    naturezaOrigem: 'Prestação de serviço de comunicação a estabelecimento comercial',
    cfopEntradaInterno: '1302',
    cfopEntradaInterestadual: '2302',
    naturezaEntradaSugerida: 'Aquisição de serviço de comunicação por estabelecimento industrial',
    destinacaoEmpresa: 'INDUSTRIALIZACAO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Operadora de telecomunicações emite NFCom ➔ Registra-se 1302/2302 (indústria) ou 1303/2303 (comércio).'
  },
  {
    cfopOrigem: '5303',
    naturezaOrigem: 'Prestação de serviço de comunicação',
    cfopEntradaInterno: '1303',
    cfopEntradaInterestadual: '2303',
    naturezaEntradaSugerida: 'Aquisição de serviço de comunicação por estabelecimento comercial',
    destinacaoEmpresa: 'USO_CONSUMO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: true,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Comunicação corporativa registrada em 1303/2303.'
  },

  // 5910 / 6910 - Bonificações, Doações ou Brindes
  {
    cfopOrigem: '5910',
    naturezaOrigem: 'Remessa em bonificação, doação ou brinde',
    cfopEntradaInterno: '1910',
    cfopEntradaInterestadual: '2910',
    naturezaEntradaSugerida: 'Entrada de bonificação, doação ou brinde',
    destinacaoEmpresa: 'REVENDA',
    direitoCreditoIcms: true,
    direitoCreditoPisCofins: false,
    direitoCreditoIbsCbs: true,
    justificativaNormativa: 'Fornecedor enviou mercadorias bonificadas em 5910/6910 ➔ Empresa deve dar entrada no CFOP 1910 (mesma UF) ou 2910 (outra UF).'
  },

  // 5915 / 6915 - Remessas para conserto ou reparo
  {
    cfopOrigem: '5915',
    naturezaOrigem: 'Remessa de mercadoria ou bem para conserto ou reparo',
    cfopEntradaInterno: '1915',
    cfopEntradaInterestadual: '2915',
    naturezaEntradaSugerida: 'Entrada de bem recebido para conserto ou reparo',
    destinacaoEmpresa: 'PRESTACAO_SERVICO',
    direitoCreditoIcms: false,
    direitoCreditoPisCofins: false,
    direitoCreditoIbsCbs: false,
    justificativaNormativa: 'Entrada para conserto de bem de terceiro: 1915/2915 com suspensão do ICMS.'
  }
];

export class CfopService {
  private static mapaCfops: Map<string, ClassificacaoCfopNatureza> | null = null;

  private static inicializarMapa(): Map<string, ClassificacaoCfopNatureza> {
    if (!this.mapaCfops) {
      this.mapaCfops = new Map<string, ClassificacaoCfopNatureza>();
      TABELA_CFOP_OFICIAL.forEach(item => {
        this.mapaCfops!.set(item.cfop, item);
      });
    }
    return this.mapaCfops;
  }

  /**
   * Obtém a classificação detalhada da Natureza da Operação a partir do CFOP
   */
  static obterClassificacao(cfop: string): ClassificacaoCfopNatureza | null {
    const mapa = this.inicializarMapa();
    const cleanCfop = (cfop || '').trim().replace(/\D/g, '');
    if (mapa.has(cleanCfop)) {
      return mapa.get(cleanCfop)!;
    }

    // Busca por dedução com base no primeiro dígito e grupo
    return this.gerarClassificacaoDedutiva(cleanCfop);
  }

  /**
   * Gera uma classificação dedutiva para CFOPs não cadastrados individualmente na lista resumida
   */
  private static gerarClassificacaoDedutiva(cfop: string): ClassificacaoCfopNatureza | null {
    if (!cfop || cfop.length < 4) return null;

    const primeiroDigito = cfop.charAt(0);
    const grupo = cfop.slice(1, 3);
    const isInterna = primeiroDigito === '1' || primeiroDigito === '5';
    const isInterestadual = primeiroDigito === '2' || primeiroDigito === '6';
    const isExterior = primeiroDigito === '3' || primeiroDigito === '7';
    const isEntrada = ['1', '2', '3'].includes(primeiroDigito);

    let categoria: CategoriaCfop = 'OUTRAS_ENTRADAS';
    let transacaoTipo: TipoTransacaoEntrada = 'OUTRA_TRANSACAO';
    let naturezaOperacao = `Operação Fiscal CFOP ${cfop}`;
    let descricaoOficial = `Operação Fiscal classificada sob o código ${cfop}`;
    let permiteCreditoIcms = isEntrada;
    let permiteCreditoPisCofins = isEntrada;
    let permiteCreditoIbsCbs = isEntrada;

    if (grupo === '10' || grupo === '11' || grupo === '12') {
      categoria = 'MERCADORIA_INDUSTRIALIZACAO';
      transacaoTipo = 'ENTRADA_MERCADORIA';
      naturezaOperacao = 'Compra para Industrialização / Comercialização';
      descricaoOficial = 'Compra para industrialização, comercialização ou produção';
    } else if (grupo === '25') {
      categoria = 'ENERGIA_ELETRICA';
      transacaoTipo = 'AQUISICAO_SERVICO';
      naturezaOperacao = 'Compra de Energia Elétrica';
      descricaoOficial = 'Aquisição de energia elétrica por estabelecimento usuário';
    } else if (grupo === '30') {
      categoria = 'SERVICO_COMUNICACAO';
      transacaoTipo = 'AQUISICAO_SERVICO';
      naturezaOperacao = 'Aquisição de Serviço de Comunicação';
      descricaoOficial = 'Aquisição de serviço de comunicação e telecomunicações';
    } else if (grupo === '35') {
      categoria = 'SERVICO_TRANSPORTE';
      transacaoTipo = 'AQUISICAO_SERVICO';
      naturezaOperacao = 'Aquisição de Serviço de Transporte';
      descricaoOficial = 'Aquisição de serviço de transporte de cargas (frete)';
    } else if (grupo === '40') {
      categoria = 'MERCADORIA_COMERCIALIZACAO';
      transacaoTipo = 'ENTRADA_MERCADORIA';
      naturezaOperacao = 'Operação Sujeita a Substituição Tributária (ST)';
      descricaoOficial = 'Entrada ou aquisição sujeita ao regime de substituição tributária';
      permiteCreditoIcms = false;
    } else if (grupo === '55') {
      categoria = 'BEM_ATIVO_IMOBILIZADO';
      transacaoTipo = 'ENTRADA_BEM_ATIVO';
      naturezaOperacao = 'Operação com Ativo Imobilizado / Uso e Consumo';
      descricaoOficial = 'Entrada de bem para ativo imobilizado ou material de consumo';
    }

    const abrangencia: AbrangenciaCfop = isInterna
      ? isEntrada ? 'ESTADUAL' : 'SAIDA_ESTADUAL'
      : isInterestadual
      ? isEntrada ? 'INTERESTADUAL' : 'SAIDA_INTERESTADUAL'
      : isEntrada ? 'EXTERIOR' : 'SAIDA_EXTERIOR';

    return {
      cfop,
      naturezaOperacao,
      descricaoOficial,
      categoria,
      transacaoTipo,
      abrangencia,
      aplicaEntradaMercadoria: transacaoTipo === 'ENTRADA_MERCADORIA',
      aplicaEntradaBem: transacaoTipo === 'ENTRADA_BEM_ATIVO',
      aplicaAquisicaoServico: transacaoTipo === 'AQUISICAO_SERVICO',
      permiteCreditoIcms,
      permiteCreditoIpi: categoria === 'MERCADORIA_INDUSTRIALIZACAO',
      permiteCreditoPisCofins,
      permiteCreditoIbsCbs,
      fundamentoLegal: 'Ajuste SINIEF 07/01; Lei Complementar 87/96; LC 214/2025',
      detalhamentoFiscal: `Classificação sintética atribuída ao CFOP ${cfop} conforme tabelas padronizadas da SEFAZ e SPED Fiscal.`,
      exemploUso: `Lançamento fiscal sob o CFOP ${cfop}.`
    };
  }

  /**
   * Cruzamento inteligente entre CFOP da nota do fornecedor e a destinação de entrada da empresa
   */
  static cruzarCfopEntrada(
    cfopFornecedor: string,
    destinacao: 'INDUSTRIALIZACAO' | 'REVENDA' | 'ATIVO_IMOBILIZADO' | 'USO_CONSUMO' | 'PRESTACAO_SERVICO' = 'INDUSTRIALIZACAO',
    isInterestadual: boolean = false
  ): CruzamentoCfopEntrada {
    const cleanCfop = (cfopFornecedor || '').trim().replace(/\D/g, '');

    // Busca exata na matriz
    const cruzamentoExato = MATRIZ_CRUZAMENTO_ENTRADAS.find(
      c => c.cfopOrigem === cleanCfop && c.destinacaoEmpresa === destinacao
    );

    if (cruzamentoExato) {
      return cruzamentoExato;
    }

    // Busca genérica pela origem
    const cruzamentoGenerico = MATRIZ_CRUZAMENTO_ENTRADAS.find(
      c => c.cfopOrigem === cleanCfop
    );

    if (cruzamentoGenerico) {
      return cruzamentoGenerico;
    }

    // Dedução automática por algoritmo fiscal de De/Para
    let cfopEntradaInterno = '1102';
    let cfopEntradaInterestadual = '2102';
    let naturezaEntradaSugerida = 'Compra para comercialização';
    let direitoCreditoIcms = true;
    let direitoCreditoPisCofins = true;
    let direitoCreditoIbsCbs = true;

    if (destinacao === 'INDUSTRIALIZACAO') {
      cfopEntradaInterno = '1101';
      cfopEntradaInterestadual = '2101';
      naturezaEntradaSugerida = 'Compra para industrialização ou produção rural';
    } else if (destinacao === 'ATIVO_IMOBILIZADO') {
      cfopEntradaInterno = '1551';
      cfopEntradaInterestadual = '2551';
      naturezaEntradaSugerida = 'Compra de bem para o ativo imobilizado';
    } else if (destinacao === 'USO_CONSUMO') {
      cfopEntradaInterno = '1556';
      cfopEntradaInterestadual = '2556';
      naturezaEntradaSugerida = 'Compra de material para uso ou consumo';
      direitoCreditoIcms = false;
      direitoCreditoPisCofins = false;
    } else if (destinacao === 'PRESTACAO_SERVICO') {
      cfopEntradaInterno = '1352';
      cfopEntradaInterestadual = '2352';
      naturezaEntradaSugerida = 'Aquisição de serviço de transporte ou comunicação';
    }

    // Ajuste se o fornecedor faturou com ST (ex: 5405, 6403, 5401)
    if (cleanCfop.startsWith('54') || cleanCfop.startsWith('64')) {
      if (destinacao === 'REVENDA') {
        cfopEntradaInterno = '1403';
        cfopEntradaInterestadual = '2403';
        naturezaEntradaSugerida = 'Compra para comercialização com ICMS-ST';
        direitoCreditoIcms = false;
      } else if (destinacao === 'INDUSTRIALIZACAO') {
        cfopEntradaInterno = '1401';
        cfopEntradaInterestadual = '2401';
        naturezaEntradaSugerida = 'Compra para industrialização com mercadoria sujeita a ICMS-ST';
      }
    }

    return {
      cfopOrigem: cleanCfop,
      naturezaOrigem: `Operação de saída do fornecedor (${cleanCfop})`,
      cfopEntradaInterno,
      cfopEntradaInterestadual,
      naturezaEntradaSugerida,
      destinacaoEmpresa: destinacao,
      direitoCreditoIcms,
      direitoCreditoPisCofins,
      direitoCreditoIbsCbs,
      justificativaNormativa: `Cruzamento fiscal de entrada deduzido a partir da destinação "${destinacao}" na empresa compradora.`
    };
  }

  /**
   * Identifica se um CFOP é específico de:
   * 1. Entrada de Mercadorias
   * 2. Entrada de Bens (Ativo Imobilizado)
   * 3. Aquisição de Serviços (Transporte, Comunicação, Energia)
   */
  static classificarTipoTransacao(cfop: string): TipoTransacaoEntrada {
    const classif = this.obterClassificacao(cfop);
    if (classif) return classif.transacaoTipo;

    const clean = (cfop || '').trim().replace(/\D/g, '');
    if (['1551', '2551', '3551', '1552', '2552', '1406', '2406'].includes(clean)) {
      return 'ENTRADA_BEM_ATIVO';
    }
    if (['1351', '1352', '1353', '2351', '2352', '2353', '3351', '3352', '1301', '1302', '1303', '2301', '2302', '2303', '1251', '1252', '1253', '2251', '2252', '2253'].includes(clean)) {
      return 'AQUISICAO_SERVICO';
    }
    if (clean.startsWith('1') || clean.startsWith('2') || clean.startsWith('3')) {
      return 'ENTRADA_MERCADORIA';
    }
    return 'OUTRA_TRANSACAO';
  }

  /**
   * Filtra CFOPs por critérios selecionados pelo usuário
   */
  static listarCfops(filtro?: {
    categoria?: CategoriaCfop | 'TODAS';
    transacaoTipo?: TipoTransacaoEntrada | 'TODOS';
    abrangencia?: AbrangenciaCfop | 'TODAS';
    busca?: string;
    somenteEntradas?: boolean;
  }): ClassificacaoCfopNatureza[] {
    return TABELA_CFOP_OFICIAL.filter(item => {
      if (filtro?.somenteEntradas) {
        if (!['1', '2', '3'].includes(item.cfop.charAt(0))) return false;
      }
      if (filtro?.categoria && filtro.categoria !== 'TODAS') {
        if (item.categoria !== filtro.categoria) return false;
      }
      if (filtro?.transacaoTipo && filtro.transacaoTipo !== 'TODOS') {
        if (item.transacaoTipo !== filtro.transacaoTipo) return false;
      }
      if (filtro?.abrangencia && filtro.abrangencia !== 'TODAS') {
        if (item.abrangencia !== filtro.abrangencia) return false;
      }
      if (filtro?.busca && filtro.busca.trim().length > 0) {
        const query = filtro.busca.toLowerCase().trim();
        const matchCfop = item.cfop.includes(query);
        const matchNat = item.naturezaOperacao.toLowerCase().includes(query);
        const matchDesc = item.descricaoOficial.toLowerCase().includes(query);
        const matchFund = item.fundamentoLegal.toLowerCase().includes(query);
        const matchDetalhe = item.detalhamentoFiscal.toLowerCase().includes(query);
        if (!matchCfop && !matchNat && !matchDesc && !matchFund && !matchDetalhe) {
          return false;
        }
      }
      return true;
    });
  }

  /**
   * Auditoria de consistência: Cruza o CFOP com a Natureza da Operação do Documento Fiscal
   * Verifica se a Natureza informada na NF-e está de acordo com a tabela oficial de CFOP
   */
  static auditarDocumentoFiscal(doc: DocumentoFiscal): {
    conforme: boolean;
    divergencias: string[];
    classificacaoPreponderante?: ClassificacaoCfopNatureza;
    cfopPreponderante?: string;
  } {
    const divergencias: string[] = [];
    const primeiroItem = doc.itens[0];
    const cfopItem = primeiroItem?.cfop || '5102';
    const classif = this.obterClassificacao(cfopItem);

    const ufEmitente = doc.emitente.uf.trim().toUpperCase();
    const ufDestinatario = doc.destinatario.uf.trim().toUpperCase();
    const isInterestadual = ufEmitente !== ufDestinatario;

    const primeiroDigitoCfop = cfopItem.charAt(0);

    // 1. Validação de Abrangência Territorial (Interna x Interestadual)
    if (isInterestadual) {
      if (primeiroDigitoCfop === '1' || primeiroDigitoCfop === '5') {
        divergencias.push(
          `DIVERGÊNCIA TERRITORIAL: CFOP ${cfopItem} é para operações internas no mesmo Estado, mas a operação é interestadual (${ufEmitente} ➔ ${ufDestinatario}). O CFOP deveria iniciar com dígito '2' (entradas) ou '6' (saídas).`
        );
      }
    } else {
      if (primeiroDigitoCfop === '2' || primeiroDigitoCfop === '6') {
        divergencias.push(
          `DIVERGÊNCIA TERRITORIAL: CFOP ${cfopItem} é para operações interestaduais, mas emitente e destinatário estão na mesma UF (${ufEmitente}). O CFOP deveria iniciar com '1' ou '5'.`
        );
      }
    }

    // 2. Validação da Natureza da Operação declarada vs CFOP
    const natDoc = (doc.naturezaOperacao || '').toLowerCase();
    if (classif) {
      if (classif.categoria === 'ENERGIA_ELETRICA' && !natDoc.includes('energia')) {
        divergencias.push(
          `CLASSIFICAÇÃO DE NATUREZA: CFOP ${cfopItem} é específico para Energia Elétrica, porém a Natureza da Operação da nota está como "${doc.naturezaOperacao}".`
        );
      }
      if (classif.categoria === 'SERVICO_TRANSPORTE' && !natDoc.includes('transporte') && !natDoc.includes('frete')) {
        divergencias.push(
          `CLASSIFICAÇÃO DE NATUREZA: CFOP ${cfopItem} refere-se a Serviço de Transporte, incompatível com a Natureza "${doc.naturezaOperacao}".`
        );
      }
      if (classif.categoria === 'SERVICO_COMUNICACAO' && !natDoc.includes('comunica') && !natDoc.includes('telecom')) {
        divergencias.push(
          `CLASSIFICAÇÃO DE NATUREZA: CFOP ${cfopItem} refere-se a Serviço de Comunicação, incompatível com a Natureza "${doc.naturezaOperacao}".`
        );
      }
      if (classif.categoria === 'BEM_ATIVO_IMOBILIZADO' && natDoc.includes('venda de producao')) {
        divergencias.push(
          `CLASSIFICAÇÃO DE NATUREZA: CFOP ${cfopItem} trata-se de Ativo Imobilizado, divergindo da Natureza declarada "${doc.naturezaOperacao}".`
        );
      }
    }

    return {
      conforme: divergencias.length === 0,
      divergencias,
      classificacaoPreponderante: classif || undefined,
      cfopPreponderante: cfopItem
    };
  }
}
