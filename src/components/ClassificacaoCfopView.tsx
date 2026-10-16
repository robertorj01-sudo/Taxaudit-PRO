import React, { useState, useMemo } from 'react';
import {
  Tag,
  Shuffle,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  BookOpen,
  FileSpreadsheet,
  Download,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  Building2,
  Truck,
  Zap,
  PhoneCall,
  PackageCheck,
  Boxes,
  HelpCircle,
  FileText,
  DollarSign
} from 'lucide-react';
import {
  DocumentoFiscal,
  ClassificacaoCfopNatureza,
  CruzamentoCfopEntrada,
  CategoriaCfop,
  TipoTransacaoEntrada,
  AbrangenciaCfop
} from '../types/fiscal';
import {
  TABELA_CFOP_OFICIAL,
  MATRIZ_CRUZAMENTO_ENTRADAS,
  CfopService
} from '../services/cfopService';

interface ClassificacaoCfopViewProps {
  documentos: DocumentoFiscal[];
  onSelectDoc?: (docId: string) => void;
  onNavigate?: (tab: any) => void;
}

export const ClassificacaoCfopView: React.FC<ClassificacaoCfopViewProps> = ({
  documentos,
  onSelectDoc,
  onNavigate
}) => {
  // Estados para filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroTransacao, setFiltroTransacao] = useState<TipoTransacaoEntrada | 'TODOS'>('TODOS');
  const [filtroAbrangencia, setFiltroAbrangencia] = useState<AbrangenciaCfop | 'TODAS'>('TODAS');
  const [somenteEntradas, setSomenteEntradas] = useState(true);
  const [cfopDetalheModal, setCfopDetalheModal] = useState<ClassificacaoCfopNatureza | null>(null);
  const [cfopCopiado, setCfopCopiado] = useState<string | null>(null);

  // Estados para o Simulador de Cruzamento De/Para
  const [cfopSimuladorOrigem, setCfopSimuladorOrigem] = useState('5102');
  const [destinacaoSimulador, setDestinacaoSimulador] = useState<
    'INDUSTRIALIZACAO' | 'REVENDA' | 'ATIVO_IMOBILIZADO' | 'USO_CONSUMO' | 'PRESTACAO_SERVICO'
  >('REVENDA');
  const [isInterestadualSimulador, setIsInterestadualSimulador] = useState(false);

  // Lista de CFOPs filtrada
  const cfopsFiltrados = useMemo(() => {
    return CfopService.listarCfops({
      busca,
      transacaoTipo: filtroTransacao,
      abrangencia: filtroAbrangencia,
      somenteEntradas
    });
  }, [busca, filtroTransacao, filtroAbrangencia, somenteEntradas]);

  // Resultado do Simulador de Cruzamento
  const cruzamentoCalculado = useMemo(() => {
    return CfopService.cruzarCfopEntrada(
      cfopSimuladorOrigem,
      destinacaoSimulador,
      isInterestadualSimulador
    );
  }, [cfopSimuladorOrigem, destinacaoSimulador, isInterestadualSimulador]);

  // Estatísticas de CFOP nos documentos atuais do sistema
  const estatisticasDocumentosAtuais = useMemo(() => {
    const mapa = new Map<string, { count: number; totalValor: number }>();
    documentos.forEach(doc => {
      doc.itens.forEach(it => {
        const c = it.cfop || 'SEM_CFOP';
        const curr = mapa.get(c) || { count: 0, totalValor: 0 };
        curr.count += 1;
        curr.totalValor += it.vProd || 0;
        mapa.set(c, curr);
      });
    });
    return mapa;
  }, [documentos]);

  // Copiar código para área de transferência
  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCfopCopiado(texto);
    setTimeout(() => {
      setCfopCopiado(null);
    }, 2000);
  };

  // Exportar Tabela para CSV
  const handleExportarCsv = () => {
    const header = [
      'CFOP',
      'Natureza da Operação',
      'Descrição Oficial SINIEF',
      'Tipo de Transação',
      'Abrangência',
      'Crédito ICMS',
      'Crédito IPI',
      'Crédito PIS/COFINS',
      'Crédito IBS/CBS',
      'Fundamentação Legal'
    ];

    const rows = cfopsFiltrados.map(c => [
      `"${c.cfop}"`,
      `"${c.naturezaOperacao.replace(/"/g, '""')}"`,
      `"${c.descricaoOficial.replace(/"/g, '""')}"`,
      `"${c.transacaoTipo}"`,
      `"${c.abrangencia}"`,
      c.permiteCreditoIcms ? 'Sim' : 'Não',
      c.permiteCreditoIpi ? 'Sim' : 'Não',
      c.permiteCreditoPisCofins ? 'Sim' : 'Não',
      c.permiteCreditoIbsCbs ? 'Sim' : 'Não',
      `"${c.fundamentoLegal.replace(/"/g, '""')}"`
    ]);

    const csvContent = '\uFEFF' + [header.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tabela_cfop_natureza_operacao_entradas_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="view-classificacao-cfop" className="space-y-6">
      {/* CABEÇALHO DO MÓDULO */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 bg-gradient-to-br from-indigo-700 to-blue-800 text-white rounded-xl shadow-xs">
                <Shuffle className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>Classificação da Natureza da Operação & Códigos Fiscais (CFOP)</span>
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Ajuste SINIEF / Receita Federal
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  Cruzamento normativo para identificação das informações relacionadas a transações de entradas de mercadorias e bens, ou da aquisição de serviços por uma empresa.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={handleExportarCsv}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-xs"
              title="Exportar Tabela de CFOPs de Entradas em arquivo CSV para Excel"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Exportar Tabela (CSV)</span>
            </button>
            {onNavigate && (
              <button
                onClick={() => onNavigate('documentos')}
                className="px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                title="Voltar para Gerenciador de Documentos"
              >
                <span>Ver Notas Fiscais</span>
              </button>
            )}
          </div>
        </div>

        {/* CARDS DE RESUMO DE ENTRADAS DE MERCADORIAS, BENS E SERVIÇOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
          <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wide">
                1. Entradas de Mercadorias
              </span>
              <Boxes className="w-4 h-4 text-blue-700" />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Industrialização (1.101 / 2.101), Revenda (1.102 / 2.102) e ST (1.403 / 2.403).
            </div>
            <div className="mt-2 text-[10px] text-blue-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Gera Crédito de ICMS, PIS/COFINS e IBS/CBS</span>
            </div>
          </div>

          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-amber-950 uppercase tracking-wide">
                2. Entradas de Bens (Ativo)
              </span>
              <Building2 className="w-4 h-4 text-amber-700" />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Ativo Imobilizado (1.551 / 2.551) e com ST (1.406 / 2.406).
            </div>
            <div className="mt-2 text-[10px] text-amber-900 font-semibold flex items-center gap-1">
              <Info className="w-3 h-3 text-amber-600" />
              <span>CIAP 1/48 avos ICMS e Crédito Imediato IBS/CBS</span>
            </div>
          </div>

          <div className="p-3.5 bg-purple-50/70 border border-purple-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-purple-900 uppercase tracking-wide">
                3. Aquisição de Serviços
              </span>
              <Truck className="w-4 h-4 text-purple-700" />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Transporte (1.352 / 2.352), Telecom (1.302 / 2.302) e Energia (1.252 / 2.252).
            </div>
            <div className="mt-2 text-[10px] text-purple-800 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span>Crédito na Indústria e Crédito Pleno IBS/CBS</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wide">
                4. Uso, Consumo & Outras
              </span>
              <Tag className="w-4 h-4 text-slate-600" />
            </div>
            <div className="text-xs text-slate-600 font-medium">
              Uso/Consumo (1.556 / 2.556), Devoluções (1.201 / 2.201) e Outras (1.949 / 2.949).
            </div>
            <div className="mt-2 text-[10px] text-slate-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>Crédito Amplo pela Não-Cumulatividade EC 132/23</span>
            </div>
          </div>
        </div>
      </div>

      {/* PAINEL INTERATIVO: SIMULADOR & MATRIZ DE CRUZAMENTO DE/PARA */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
              <Shuffle className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Matriz de Cruzamento De/Para (CFOP Fornecedor ➔ CFOP Entrada Empresa)
              </h2>
              <p className="text-xs text-slate-500">
                Simule como a nota fiscal emitida pelo fornecedor (saída 5.xxx / 6.xxx) deve ser classificada na entrada da empresa compradora.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 p-4 bg-slate-50/70 border border-slate-200 rounded-xl">
          {/* Configuração da Operação */}
          <div className="lg:col-span-5 space-y-3.5">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                CFOP Informado na Nota pelo Fornecedor (Saída):
              </label>
              <select
                value={cfopSimuladorOrigem}
                onChange={e => setCfopSimuladorOrigem(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 font-mono shadow-2xs"
              >
                <optgroup label="Venda de Mercadorias / Produtos">
                  <option value="5101">5101 - Venda de produção do estabelecimento (Interna SP-SP)</option>
                  <option value="5102">5102 - Venda de mercadoria adquirida de terceiros (Interna SP-SP)</option>
                  <option value="6101">6101 - Venda de produção do estabelecimento (Interestadual)</option>
                  <option value="6102">6102 - Venda de mercadoria de terceiros (Interestadual)</option>
                </optgroup>
                <optgroup label="Mercadorias com Substituição Tributária (ST)">
                  <option value="5401">5401 - Venda de produção com retenção de ICMS-ST</option>
                  <option value="5403">5403 - Venda de mercadoria de terceiros com retenção de ICMS-ST</option>
                  <option value="5405">5405 - Venda de mercadoria com ST como contribuinte substituído</option>
                  <option value="6401">6401 - Venda interestadual de produção com retenção de ST</option>
                  <option value="6403">6403 - Venda interestadual de terceiros com retenção de ST</option>
                </optgroup>
                <optgroup label="Aquisição de Serviços & Conhecimentos (CT-e / NFCom / NF3-e)">
                  <option value="5352">5352 - Prestação serviço transporte a indústria (CT-e Interno)</option>
                  <option value="5353">5353 - Prestação serviço transporte a comércio (CT-e Interno)</option>
                  <option value="6352">6352 - Prestação serviço transporte a indústria (CT-e Interestadual)</option>
                  <option value="6353">6353 - Prestação serviço transporte a comércio (CT-e Interestadual)</option>
                  <option value="5253">5253 - Fornecimento de energia elétrica (NF3-e)</option>
                  <option value="5303">5303 - Prestação de serviço de comunicação (NFCom)</option>
                </optgroup>
                <optgroup label="Outras Saídas do Fornecedor">
                  <option value="5910">5910 - Remessa em bonificação, doação ou brinde</option>
                  <option value="5915">5915 - Remessa de mercadoria ou bem para conserto ou reparo</option>
                  <option value="6910">6910 - Remessa em bonificação (Interestadual)</option>
                </optgroup>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Destinação do Bem / Mercadoria / Serviço na Empresa Compradora:
              </label>
              <select
                value={destinacaoSimulador}
                onChange={e => setDestinacaoSimulador(e.target.value as any)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:border-blue-500 shadow-2xs"
              >
                <option value="INDUSTRIALIZACAO">1. Industrialização (Matéria-prima, insumo, componentes ou embalagens)</option>
                <option value="REVENDA">2. Comercialização / Revenda de Mercadorias (Comércio)</option>
                <option value="ATIVO_IMOBILIZADO">3. Ativo Imobilizado (Máquinas, computadores, móveis e utilitários)</option>
                <option value="USO_CONSUMO">4. Material para Uso ou Consumo (Escritório, limpeza, copa e reparos)</option>
                <option value="PRESTACAO_SERVICO">5. Prestação de Serviços (Fretes FOB, energia fabril e telecomunicações)</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <label className="text-xs font-medium text-slate-700 cursor-pointer flex items-center gap-2 select-none">
                <input
                  type="checkbox"
                  checked={isInterestadualSimulador}
                  onChange={e => setIsInterestadualSimulador(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span>Operação Interestadual (Fornecedor e Destinatário em UFs diferentes)</span>
              </label>
            </div>
          </div>

          {/* Resultado do Cruzamento */}
          <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-blue-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Resultado do Cruzamento de Entrada
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-900 border border-blue-200">
                  {isInterestadualSimulador ? 'Entrada Interestadual (Grupo 2)' : 'Entrada Interna Estadual (Grupo 1)'}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-300 text-center shrink-0">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase">CFOP de Entrada</div>
                  <div className="text-2xl font-black font-mono text-emerald-800">
                    {isInterestadualSimulador
                      ? cruzamentoCalculado.cfopEntradaInterestadual
                      : cruzamentoCalculado.cfopEntradaInterno}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-900 leading-tight">
                    {cruzamentoCalculado.naturezaEntradaSugerida}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">
                    {cruzamentoCalculado.justificativaNormativa}
                  </div>
                </div>
              </div>

              {/* Indicadores de Direito a Crédito */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs pt-2 border-t border-slate-100">
                <div className={`p-1.5 rounded border ${
                  cruzamentoCalculado.direitoCreditoIcms
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="text-[10px] font-bold">ICMS</div>
                  <div className="font-semibold text-[11px]">
                    {cruzamentoCalculado.direitoCreditoIcms ? 'Crédito Válido' : 'Vedado'}
                  </div>
                </div>

                <div className={`p-1.5 rounded border ${
                  cruzamentoCalculado.direitoCreditoPisCofins
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}>
                  <div className="text-[10px] font-bold">PIS / COFINS</div>
                  <div className="font-semibold text-[11px]">
                    {cruzamentoCalculado.direitoCreditoPisCofins ? 'Apropriável' : 'Sem Crédito'}
                  </div>
                </div>

                <div className="p-1.5 rounded border bg-teal-50 border-teal-300 text-teal-900">
                  <div className="text-[10px] font-bold">IBS / CBS (Reforma)</div>
                  <div className="font-semibold text-[11px]">
                    {cruzamentoCalculado.direitoCreditoIbsCbs ? 'Não-Cumulatividade Plena' : 'Sem Crédito'}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 italic">
              Conforme Ajuste SINIEF 07/01, Convênio S/Nº 1970, Lei Complementar 87/96 e Lei Complementar 214/2025.
            </div>
          </div>
        </div>
      </div>

      {/* TABELA OFICIAL DE CFOPs E NATUREZAS DA OPERAÇÃO COM FILTROS AVANÇADOS */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-700" />
              <span>Tabela Oficial de Códigos Fiscais (CFOP) de Entradas e Aquisições de Serviços</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-700 font-mono">
                {cfopsFiltrados.length} registros
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Códigos oficiais para identificação das operações de entradas de mercadorias e bens, e aquisição de serviços.
            </p>
          </div>

          {/* Barra de Busca */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={busca}
              onChange={e => setBusca(e.target.value)}
              placeholder="Pesquisar por CFOP, natureza, mercadoria..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:bg-white transition"
            />
          </div>
        </div>

        {/* FILTROS RÁPIDOS POR CATEGORIA E ABRANGÊNCIA */}
        <div className="flex flex-wrap items-center gap-2 pb-4 mb-4 border-b border-slate-200">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros:</span>
          </div>

          {/* Filtro por Tipo de Transação */}
          <button
            onClick={() => setFiltroTransacao('TODOS')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
              filtroTransacao === 'TODOS'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas Transações
          </button>
          <button
            onClick={() => setFiltroTransacao('ENTRADA_MERCADORIA')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filtroTransacao === 'ENTRADA_MERCADORIA'
                ? 'bg-blue-700 text-white shadow-2xs'
                : 'bg-blue-50 text-blue-900 hover:bg-blue-100'
            }`}
          >
            <Boxes className="w-3.5 h-3.5" />
            <span>Entrada de Mercadorias</span>
          </button>
          <button
            onClick={() => setFiltroTransacao('ENTRADA_BEM_ATIVO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filtroTransacao === 'ENTRADA_BEM_ATIVO'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-900 hover:bg-amber-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Entrada de Bens (Ativo)</span>
          </button>
          <button
            onClick={() => setFiltroTransacao('AQUISICAO_SERVICO')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              filtroTransacao === 'AQUISICAO_SERVICO'
                ? 'bg-purple-700 text-white shadow-2xs'
                : 'bg-purple-50 text-purple-900 hover:bg-purple-100'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Aquisição de Serviços</span>
          </button>

          <div className="h-4 w-px bg-slate-300 mx-1 hidden sm:block" />

          {/* Filtro por Abrangência Territorial */}
          <button
            onClick={() => setFiltroAbrangencia('TODAS')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              filtroAbrangencia === 'TODAS'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todas UFs
          </button>
          <button
            onClick={() => setFiltroAbrangencia('ESTADUAL')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              filtroAbrangencia === 'ESTADUAL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interna (1.xxx)
          </button>
          <button
            onClick={() => setFiltroAbrangencia('INTERESTADUAL')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              filtroAbrangencia === 'INTERESTADUAL'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Interestadual (2.xxx)
          </button>
          <button
            onClick={() => setFiltroAbrangencia('EXTERIOR')}
            className={`px-2 py-1 rounded-lg text-xs font-medium transition ${
              filtroAbrangencia === 'EXTERIOR'
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Importação (3.xxx)
          </button>
        </div>

        {/* TABELA DE CFOPs */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold text-[11px] uppercase tracking-wider">
                <th className="py-3 px-3 w-20">CFOP</th>
                <th className="py-3 px-3">Classificação da Natureza da Operação</th>
                <th className="py-3 px-3 text-center">Tipo de Transação</th>
                <th className="py-3 px-3 text-center">Abrangência</th>
                <th className="py-3 px-3 text-center">Crédito ICMS</th>
                <th className="py-3 px-3 text-center">PIS/COFINS</th>
                <th className="py-3 px-3 text-center">IBS/CBS</th>
                <th className="py-3 px-3 text-center">Uso no Sistema</th>
                <th className="py-3 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cfopsFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Nenhum código fiscal (CFOP) encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                cfopsFiltrados.map(item => {
                  const stats = estatisticasDocumentosAtuais.get(item.cfop);

                  return (
                    <tr key={item.cfop} className="hover:bg-slate-50/70 transition">
                      {/* Código CFOP com Botão Copiar */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 text-xs">
                            {item.cfop}
                          </span>
                          <button
                            onClick={() => handleCopiar(item.cfop)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition"
                            title="Copiar código CFOP"
                          >
                            {cfopCopiado === item.cfop ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* Natureza da Operação e Descrição Oficial */}
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900 text-xs leading-snug">
                          {item.naturezaOperacao}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                          {item.descricaoOficial}
                        </div>
                      </td>

                      {/* Tipo de Transação */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.transacaoTipo === 'ENTRADA_MERCADORIA'
                            ? 'bg-blue-100 text-blue-800'
                            : item.transacaoTipo === 'ENTRADA_BEM_ATIVO'
                            ? 'bg-amber-100 text-amber-900'
                            : item.transacaoTipo === 'AQUISICAO_SERVICO'
                            ? 'bg-purple-100 text-purple-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {item.transacaoTipo === 'ENTRADA_MERCADORIA' && 'Entrada Mercadoria'}
                          {item.transacaoTipo === 'ENTRADA_BEM_ATIVO' && 'Entrada Bem (Ativo)'}
                          {item.transacaoTipo === 'AQUISICAO_SERVICO' && 'Aquisição Serviço'}
                          {item.transacaoTipo === 'OUTRA_TRANSACAO' && 'Outra Transação'}
                        </span>
                      </td>

                      {/* Abrangência Territorial */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.abrangencia === 'ESTADUAL' && 'Interna (1.xxx)'}
                          {item.abrangencia === 'INTERESTADUAL' && 'Interestadual (2.xxx)'}
                          {item.abrangencia === 'EXTERIOR' && 'Importação (3.xxx)'}
                        </span>
                      </td>

                      {/* Crédito ICMS */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.permiteCreditoIcms
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.permiteCreditoIcms ? 'Permitido' : 'Vedado'}
                        </span>
                      </td>

                      {/* Crédito PIS/COFINS */}
                      <td className="py-2.5 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.permiteCreditoPisCofins
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}>
                          {item.permiteCreditoPisCofins ? 'Apropriável' : 'Sem Crédito'}
                        </span>
                      </td>

                      {/* Crédito IBS/CBS */}
                      <td className="py-2.5 px-3 text-center">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-100 text-teal-800">
                          {item.permiteCreditoIbsCbs ? 'Não-Cumulativo' : 'Vedado'}
                        </span>
                      </td>

                      {/* Estatística no Sistema */}
                      <td className="py-2.5 px-3 text-center">
                        {stats ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {stats.count} itens faturados
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">-</span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-2.5 px-3 text-right whitespace-nowrap">
                        <button
                          onClick={() => setCfopDetalheModal(item)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded font-semibold text-[11px] transition inline-flex items-center gap-1"
                          title="Visualizar fundamentação legal e exemplo prático"
                        >
                          <Info className="w-3 h-3 text-blue-700" />
                          <span>Detalhes</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE DETALHAMENTO NORMATIVO DO CFOP */}
      {cfopDetalheModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-xl font-mono font-black text-blue-900 bg-blue-50 px-3 py-1 rounded-lg border border-blue-200">
                  {cfopDetalheModal.cfop}
                </span>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    {cfopDetalheModal.naturezaOperacao}
                  </h3>
                  <div className="text-xs text-slate-500">
                    {cfopDetalheModal.descricaoOficial}
                  </div>
                </div>
              </div>
              <button
                onClick={() => setCfopDetalheModal(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-slate-700 uppercase text-[10px]">Detalhamento Operacional & Contábil:</div>
                <div className="text-slate-800 font-medium leading-relaxed">
                  {cfopDetalheModal.detalhamentoFiscal}
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200 space-y-1">
                <div className="font-bold text-blue-900 uppercase text-[10px]">Exemplo de Aplicação Prática:</div>
                <div className="text-blue-950">
                  {cfopDetalheModal.exemploUso}
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-1">
                <div className="font-bold text-amber-900 uppercase text-[10px]">Fundamentação Legal (Legislação Brasileira):</div>
                <div className="text-amber-950 font-mono text-[11px]">
                  {cfopDetalheModal.fundamentoLegal}
                </div>
              </div>

              {/* Tabela de Créditos */}
              <div className="border border-slate-200 rounded-xl p-3">
                <div className="font-bold text-slate-700 uppercase text-[10px] mb-2">Diretrizes de Crédito Tributário:</div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">ICMS</div>
                    <div className={`font-bold text-xs ${cfopDetalheModal.permiteCreditoIcms ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {cfopDetalheModal.permiteCreditoIcms ? 'Permitido' : 'Vedado'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">IPI</div>
                    <div className={`font-bold text-xs ${cfopDetalheModal.permiteCreditoIpi ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {cfopDetalheModal.permiteCreditoIpi ? 'Permitido' : 'Vedado'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">PIS/COFINS</div>
                    <div className={`font-bold text-xs ${cfopDetalheModal.permiteCreditoPisCofins ? 'text-emerald-700' : 'text-slate-500'}`}>
                      {cfopDetalheModal.permiteCreditoPisCofins ? 'Apropriável' : 'Sem Crédito'}
                    </div>
                  </div>
                  <div className="p-2 rounded bg-slate-50 border border-slate-200">
                    <div className="text-[10px] font-bold text-slate-500">IBS/CBS</div>
                    <div className="font-bold text-xs text-teal-700">
                      Não-Cumulativo
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setCfopDetalheModal(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
