import React, { useState, useMemo } from 'react';
import {
  CalendarRange,
  Download,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertTriangle,
  Building2,
  TrendingUp,
  Tag,
  ArrowUpDown,
  ExternalLink,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  FileText,
  DollarSign
} from 'lucide-react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';

interface MonthlyReportViewProps {
  documentos: DocumentoFiscal[];
  empresa: Empresa;
  onSelectDoc: (docId: string) => void;
  onNavigate: (tab: any) => void;
  onPrintDanfe?: (doc: DocumentoFiscal) => void;
}

const NOMES_MESES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro'
];

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  documentos,
  empresa,
  onSelectDoc,
  onNavigate,
  onPrintDanfe
}) => {
  // Extrai todas as competências (Ano-Mês) presentes nos documentos
  const competenciasDisponiveis = useMemo(() => {
    const setComp = new Set<string>();
    documentos.forEach(doc => {
      if (doc.dataEmissao) {
        const d = new Date(doc.dataEmissao);
        if (!isNaN(d.getTime())) {
          const ano = d.getFullYear();
          const mes = String(d.getMonth() + 1).padStart(2, '0');
          setComp.add(`${ano}-${mes}`);
        }
      }
    });

    // Se estiver vazio, adiciona setembro/2026 como padrão
    if (setComp.size === 0) {
      setComp.add('2026-09');
    }

    // Ordena decrescente (meses mais recentes primeiro)
    return Array.from(setComp).sort((a, b) => b.localeCompare(a));
  }, [documentos]);

  // Competência selecionada (ex: '2026-09' ou 'TODOS')
  const [mesSelecionado, setMesSelecionado] = useState<string>(() => {
    return competenciasDisponiveis[0] || '2026-09';
  });

  const [subAba, setSubAba] = useState<'notas' | 'cfop' | 'fornecedores' | 'evolucao'>('notas');
  const [buscaTexto, setBuscaTexto] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroOperacao, setFiltroOperacao] = useState<string>('TODOS');

  // Formata chave 'YYYY-MM' para string amigável 'Setembro / 2026'
  const formatarNomeCompetencia = (anoMes: string) => {
    if (anoMes === 'TODOS') return 'Todas as Competências';
    const [ano, mesStr] = anoMes.split('-');
    const mesIdx = parseInt(mesStr, 10) - 1;
    return `${NOMES_MESES[mesIdx] || mesStr} de ${ano}`;
  };

  // Filtragem dos documentos pelo mês e filtros adicionais
  const documentosDoPeriodo = useMemo(() => {
    return documentos.filter(doc => {
      // Filtro de competência
      if (mesSelecionado !== 'TODOS') {
        const d = new Date(doc.dataEmissao);
        if (!isNaN(d.getTime())) {
          const anoMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (anoMes !== mesSelecionado) return false;
        }
      }

      // Filtro de status
      if (filtroStatus !== 'TODOS' && doc.status !== filtroStatus) {
        return false;
      }

      // Filtro de operação
      if (filtroOperacao !== 'TODOS' && doc.tipoOperacao !== filtroOperacao) {
        return false;
      }

      // Filtro de busca textual
      if (buscaTexto.trim()) {
        const query = buscaTexto.toLowerCase();
        const emitente = (doc.emitente.razaoSocial || '').toLowerCase();
        const cnpj = (doc.emitente.cnpjCpf || '').toLowerCase();
        const numero = (doc.numero || '').toLowerCase();
        const chave = (doc.chaveAcesso || '').toLowerCase();
        return (
          emitente.includes(query) ||
          cnpj.includes(query) ||
          numero.includes(query) ||
          chave.includes(query)
        );
      }

      return true;
    });
  }, [documentos, mesSelecionado, filtroStatus, filtroOperacao, buscaTexto]);

  // Totais consolidados da competência
  const totaisPeriodo = useMemo(() => {
    let totalValor = 0;
    let totalIcms = 0;
    let totalBaseIcms = 0;
    let totalIpi = 0;
    let totalPis = 0;
    let totalCofins = 0;
    let conformesCount = 0;
    let divergenciasCount = 0;

    documentosDoPeriodo.forEach(doc => {
      totalValor += doc.valorTotalDocumento || 0;
      totalIcms += doc.totalIcms || 0;
      totalIpi += doc.totalIpi || 0;
      totalPis += doc.totalPis || 0;
      totalCofins += doc.totalCofins || 0;

      doc.itens.forEach(it => {
        totalBaseIcms += it.impostos.icmsBaseCalculo || 0;
      });

      if (doc.status === 'CONFORME' || doc.status === 'APROVADO' || doc.status === 'ESCRITURADO') {
        conformesCount++;
      } else {
        divergenciasCount++;
      }
    });

    return {
      quantidade: documentosDoPeriodo.length,
      totalValor,
      totalIcms,
      totalBaseIcms,
      totalIpi,
      totalPis,
      totalCofins,
      conformesCount,
      divergenciasCount
    };
  }, [documentosDoPeriodo]);

  // Agrupamento por CFOP para a competência
  const agrupamentoPorCfop = useMemo(() => {
    const mapa = new Map<
      string,
      {
        cfop: string;
        qtdItens: number;
        qtdNotas: Set<string>;
        valorTotal: number;
        baseIcms: number;
        valorIcms: number;
        valorIpi: number;
        valorPis: number;
        valorCofins: number;
      }
    >();

    documentosDoPeriodo.forEach(doc => {
      doc.itens.forEach(it => {
        const cfop = it.cfop || 'SEM_CFOP';
        const item = mapa.get(cfop) || {
          cfop,
          qtdItens: 0,
          qtdNotas: new Set<string>(),
          valorTotal: 0,
          baseIcms: 0,
          valorIcms: 0,
          valorIpi: 0,
          valorPis: 0,
          valorCofins: 0
        };

        item.qtdItens += 1;
        item.qtdNotas.add(doc.id);
        item.valorTotal += it.vProd || 0;
        item.baseIcms += it.impostos.icmsBaseCalculo || 0;
        item.valorIcms += it.impostos.icmsValor || 0;
        item.valorIpi += it.impostos.ipiValor || 0;
        item.valorPis += it.impostos.pisValor || 0;
        item.valorCofins += it.impostos.cofinsValor || 0;

        mapa.set(cfop, item);
      });
    });

    return Array.from(mapa.values()).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [documentosDoPeriodo]);

  // Agrupamento por Fornecedor (Emitente) para a competência
  const agrupamentoPorFornecedor = useMemo(() => {
    const mapa = new Map<
      string,
      {
        cnpj: string;
        razaoSocial: string;
        uf: string;
        qtdNotas: number;
        valorTotal: number;
        totalIcms: number;
        totalIpi: number;
        totalPisCofins: number;
        statusPredominante: string;
      }
    >();

    documentosDoPeriodo.forEach(doc => {
      const cnpj = doc.emitente.cnpjCpf || 'SEM_CNPJ';
      const item = mapa.get(cnpj) || {
        cnpj,
        razaoSocial: doc.emitente.razaoSocial || 'Fornecedor sem identificação',
        uf: doc.emitente.uf || 'UF',
        qtdNotas: 0,
        valorTotal: 0,
        totalIcms: 0,
        totalIpi: 0,
        totalPisCofins: 0,
        statusPredominante: doc.status
      };

      item.qtdNotas += 1;
      item.valorTotal += doc.valorTotalDocumento || 0;
      item.totalIcms += doc.totalIcms || 0;
      item.totalIpi += doc.totalIpi || 0;
      item.totalPisCofins += (doc.totalPis || 0) + (doc.totalCofins || 0);

      mapa.set(cnpj, item);
    });

    return Array.from(mapa.values()).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [documentosDoPeriodo]);

  // Comparativo Mensal para a aba de Evolução
  const evolucaoMeses = useMemo(() => {
    return competenciasDisponiveis.map(comp => {
      const docsDoMes = documentos.filter(doc => {
        const d = new Date(doc.dataEmissao);
        if (isNaN(d.getTime())) return false;
        const anoMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        return anoMes === comp;
      });

      const totalR$ = docsDoMes.reduce((acc, d) => acc + (d.valorTotalDocumento || 0), 0);
      const totalIcms = docsDoMes.reduce((acc, d) => acc + (d.totalIcms || 0), 0);
      const conformes = docsDoMes.filter(d => d.status === 'CONFORME' || d.status === 'APROVADO').length;

      return {
        competencia: comp,
        nome: formatarNomeCompetencia(comp),
        qtdNotas: docsDoMes.length,
        totalR$,
        totalIcms,
        conformes
      };
    });
  }, [competenciasDisponiveis, documentos]);

  // Exportar relatório da competência para CSV (compatível com Excel Windows)
  const handleExportarCsv = () => {
    const separador = ';';
    const cabecalho = [
      'Competência',
      'Data Emissão',
      'Número NF',
      'Série',
      'Tipo',
      'Emitente',
      'CNPJ Emitente',
      'UF Emitente',
      'Chave de Acesso',
      'Valor Total NF (R$)',
      'Valor ICMS (R$)',
      'Valor IPI (R$)',
      'Valor PIS (R$)',
      'Valor COFINS (R$)',
      'Status Auditoria'
    ];

    const linhas = documentosDoPeriodo.map(doc => {
      const d = new Date(doc.dataEmissao);
      const dataFmt = !isNaN(d.getTime()) ? d.toLocaleDateString('pt-BR') : doc.dataEmissao;
      const compFmt = !isNaN(d.getTime())
        ? `${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
        : '';

      return [
        compFmt,
        dataFmt,
        doc.numero,
        doc.serie,
        doc.tipoOperacao,
        `"${doc.emitente.razaoSocial.replace(/"/g, '""')}"`,
        doc.emitente.cnpjCpf,
        doc.emitente.uf,
        doc.chaveAcesso,
        doc.valorTotalDocumento.toFixed(2).replace('.', ','),
        doc.totalIcms.toFixed(2).replace('.', ','),
        doc.totalIpi.toFixed(2).replace('.', ','),
        doc.totalPis.toFixed(2).replace('.', ','),
        doc.totalCofins.toFixed(2).replace('.', ','),
        doc.status
      ].join(separador);
    });

    // UTF-8 BOM para o Excel do Windows abrir com acentuação correta
    const conteudoCsv = '\uFEFF' + [cabecalho.join(separador), ...linhas].join('\r\n');
    const blob = new Blob([conteudoCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `RELATORIO_NOTAS_FISCAIS_GEPAT_${mesSelecionado.replace('-', '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho Institucional do Relatório */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80 w-fit mb-2">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>GEPAT.F — Gerência de Planejamento Tributário</span>
          </div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Relatório Gerencial de Notas Fiscais por Competência
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Demonstrativo analítico e consolidado de documentos fiscais eletrônicos mês a mês para
            apuração de créditos tributários e escrituração fiscal.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          <button
            id="btn-exportar-relatorio-csv"
            onClick={handleExportarCsv}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
            title="Exportar dados da competência em formato CSV compatível com Excel"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Exportar Excel (CSV)</span>
          </button>

          <button
            id="btn-imprimir-relatorio"
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-2 transition"
            title="Imprimir relatório analítico em papel ou salvar em PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Imprimir Relatório (PDF)</span>
          </button>
        </div>
      </div>

      {/* Seletor Mês a Mês (Chips de Navegação Rápida) */}
      <div className="bg-white p-4 rounded-xl shadow-xs border border-slate-200 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
            <CalendarRange className="w-4 h-4 text-emerald-600" />
            <span>Selecione a Competência (Mês / Ano):</span>
          </div>
          <span className="text-[11px] text-slate-500">
            Mostrando documentos da pasta e registros importados
          </span>
        </div>

        {/* Barra de Seleção dos Meses */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            onClick={() => setMesSelecionado('TODOS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
              mesSelecionado === 'TODOS'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>Todos os Meses</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                mesSelecionado === 'TODOS' ? 'bg-slate-700 text-white' : 'bg-slate-300 text-slate-800'
              }`}
            >
              {documentos.length}
            </span>
          </button>

          {competenciasDisponiveis.map(comp => {
            const docsDestaComp = documentos.filter(doc => {
              const d = new Date(doc.dataEmissao);
              if (isNaN(d.getTime())) return false;
              const anoMes = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
              return anoMes === comp;
            });

            const isSelected = mesSelecionado === comp;
            const nomeAmigavel = formatarNomeCompetencia(comp);

            return (
              <button
                key={comp}
                id={`btn-mes-${comp}`}
                onClick={() => setMesSelecionado(comp)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-2 ${
                  isSelected
                    ? 'bg-emerald-700 text-white shadow-sm ring-2 ring-emerald-600/30'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{nomeAmigavel}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isSelected ? 'bg-emerald-900 text-emerald-200' : 'bg-slate-300 text-slate-800'
                  }`}
                >
                  {docsDestaComp.length}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Cards de Métricas da Competência Selecionada */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total de Notas
          </div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">
            {totaisPeriodo.quantidade}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {mesSelecionado === 'TODOS' ? 'Acumulado geral' : formatarNomeCompetencia(mesSelecionado)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Valor Total (R$)
          </div>
          <div className="text-lg font-extrabold text-slate-900 mt-1 truncate">
            {formatCurrency(totaisPeriodo.totalValor)}
          </div>
          <div className="text-[10px] text-emerald-600 font-medium mt-0.5">Total faturado/entradas</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Crédito ICMS
          </div>
          <div className="text-lg font-extrabold text-blue-700 mt-1 truncate">
            {formatCurrency(totaisPeriodo.totalIcms)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            BC: {formatCurrency(totaisPeriodo.totalBaseIcms)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            PIS / COFINS
          </div>
          <div className="text-lg font-extrabold text-indigo-700 mt-1 truncate">
            {formatCurrency(totaisPeriodo.totalPis + totaisPeriodo.totalCofins)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">PIS: {formatCurrency(totaisPeriodo.totalPis)}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total IPI
          </div>
          <div className="text-lg font-extrabold text-amber-700 mt-1 truncate">
            {formatCurrency(totaisPeriodo.totalIpi)}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">Imposto industrial</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Conformidade
          </div>
          <div className="text-lg font-extrabold text-emerald-700 mt-1">
            {totaisPeriodo.quantidade > 0
              ? `${Math.round((totaisPeriodo.conformesCount / totaisPeriodo.quantidade) * 100)}%`
              : '100%'}
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5">
            {totaisPeriodo.conformesCount} ok / {totaisPeriodo.divergenciasCount} div.
          </div>
        </div>
      </div>

      {/* Abas Internas de Visualização do Relatório */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Barra de Sub-abas e Filtros de Pesquisa */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50">
          <div className="flex items-center gap-1 bg-slate-200/80 p-1 rounded-xl">
            <button
              onClick={() => setSubAba('notas')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subAba === 'notas'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Relação de Notas ({documentosDoPeriodo.length})</span>
            </button>

            <button
              onClick={() => setSubAba('cfop')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subAba === 'cfop'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Tag className="w-3.5 h-3.5 text-blue-600" />
              <span>Consolidado por CFOP ({agrupamentoPorCfop.length})</span>
            </button>

            <button
              onClick={() => setSubAba('fornecedores')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subAba === 'fornecedores'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>Por Fornecedor ({agrupamentoPorFornecedor.length})</span>
            </button>

            <button
              onClick={() => setSubAba('evolucao')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                subAba === 'evolucao'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-indigo-600" />
              <span>Evolução Mensal ({competenciasDisponiveis.length} meses)</span>
            </button>
          </div>

          {/* Filtros e Busca Rápida */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por NF, emitente ou CNPJ..."
                value={buscaTexto}
                onChange={e => setBuscaTexto(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 w-48 sm:w-64"
              />
            </div>

            <select
              value={filtroStatus}
              onChange={e => setFiltroStatus(e.target.value)}
              className="px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="CONFORME">100% Conforme</option>
              <option value="COM_DIVERGENCIAS">Com Divergências</option>
              <option value="APROVADO">Aprovado</option>
            </select>
          </div>
        </div>

        {/* Conteúdo da Aba Selecionada */}
        <div className="p-4">
          {/* VISÃO 1: Relação Analítica das Notas do Mês */}
          {subAba === 'notas' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    <th className="py-2.5 px-3">Data</th>
                    <th className="py-2.5 px-3">Nº / Série</th>
                    <th className="py-2.5 px-3">Emitente / Fornecedor</th>
                    <th className="py-2.5 px-3">UF</th>
                    <th className="py-2.5 px-3">CFOPs</th>
                    <th className="py-2.5 px-3 text-right">Valor Total</th>
                    <th className="py-2.5 px-3 text-right">ICMS</th>
                    <th className="py-2.5 px-3 text-right">PIS/COFINS</th>
                    <th className="py-2.5 px-3 text-center">Status</th>
                    <th className="py-2.5 px-3 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {documentosDoPeriodo.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-slate-400">
                        Nenhuma nota fiscal encontrada para a competência selecionada e filtros
                        aplicados.
                      </td>
                    </tr>
                  ) : (
                    documentosDoPeriodo.map(doc => {
                      const d = new Date(doc.dataEmissao);
                      const dataFormatada = !isNaN(d.getTime())
                        ? d.toLocaleDateString('pt-BR')
                        : doc.dataEmissao;

                      const cfopsUnicos = Array.from(new Set(doc.itens.map(i => i.cfop)));

                      return (
                        <tr key={doc.id} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 whitespace-nowrap text-slate-600 font-medium">
                            {dataFormatada}
                          </td>
                          <td className="py-3 px-3 whitespace-nowrap">
                            <span className="font-mono font-bold text-slate-900">
                              {doc.numero}
                            </span>
                            <span className="text-[10px] text-slate-400 ml-1 font-mono">
                              (Série {doc.serie})
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-semibold text-slate-900 truncate max-w-[200px]" title={doc.emitente.razaoSocial}>
                              {doc.emitente.razaoSocial}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              CNPJ: {doc.emitente.cnpjCpf}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono font-semibold text-[10px]">
                              {doc.emitente.uf}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <div className="flex gap-1 flex-wrap max-w-[120px]">
                              {cfopsUnicos.map(c => (
                                <span
                                  key={c}
                                  className="px-1 py-0.5 rounded bg-blue-50 text-blue-700 text-[10px] font-mono border border-blue-200"
                                >
                                  {c}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                            {formatCurrency(doc.valorTotalDocumento)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700 whitespace-nowrap">
                            {formatCurrency(doc.totalIcms)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600 whitespace-nowrap">
                            {formatCurrency((doc.totalPis || 0) + (doc.totalCofins || 0))}
                          </td>
                          <td className="py-3 px-3 text-center whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                doc.status === 'CONFORME' || doc.status === 'APROVADO'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'COM_DIVERGENCIAS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {doc.status === 'CONFORME'
                                ? 'Conforme'
                                : doc.status === 'APROVADO'
                                ? 'Aprovado'
                                : 'Divergência'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              {onPrintDanfe && (
                                <button
                                  onClick={() => onPrintDanfe(doc)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white rounded text-[10px] font-semibold flex items-center gap-1 transition"
                                  title="Imprimir DANFE desta nota"
                                >
                                  <Printer className="w-3 h-3 text-emerald-400" />
                                  DANFE
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  onSelectDoc(doc.id);
                                  onNavigate('auditoria');
                                }}
                                className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-semibold transition"
                                title="Abrir no Workbench de Auditoria"
                              >
                                Auditar
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* VISÃO 2: Consolidado por CFOP */}
          {subAba === 'cfop' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Demonstração contábil do total de entradas e saídas agrupadas por Código Fiscal de
                Operações e Prestações (CFOP) na competência {formatarNomeCompetencia(mesSelecionado)}.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">CFOP</th>
                      <th className="py-2.5 px-3">Descrição Operacional</th>
                      <th className="py-2.5 px-3 text-center">Nº Notas</th>
                      <th className="py-2.5 px-3 text-center">Nº Itens</th>
                      <th className="py-2.5 px-3 text-right">Valor Contábil</th>
                      <th className="py-2.5 px-3 text-right">Base ICMS</th>
                      <th className="py-2.5 px-3 text-right">Valor ICMS</th>
                      <th className="py-2.5 px-3 text-right">PIS/COFINS</th>
                      <th className="py-2.5 px-3 text-right">% do Mês</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {agrupamentoPorCfop.map(item => {
                      const percMes =
                        totaisPeriodo.totalValor > 0
                          ? (item.valorTotal / totaisPeriodo.totalValor) * 100
                          : 0;

                      let descricaoCfop = 'Operação Comercial Fiscal';
                      if (item.cfop === '1102' || item.cfop === '2102') {
                        descricaoCfop = 'Compra p/ comercialização ou matéria-prima';
                      } else if (item.cfop === '1556' || item.cfop === '2556') {
                        descricaoCfop = 'Compra de material para uso ou consumo';
                      } else if (item.cfop === '1403' || item.cfop === '2403') {
                        descricaoCfop = 'Compra mercadoria sujeita a ICMS ST';
                      } else if (item.cfop === '5102' || item.cfop === '6102') {
                        descricaoCfop = 'Venda de mercadoria adquirida de terceiros';
                      }

                      return (
                        <tr key={item.cfop} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-mono font-bold text-emerald-800">
                            <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                              {item.cfop}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-medium text-slate-700">
                            {descricaoCfop}
                          </td>
                          <td className="py-3 px-3 text-center font-mono">{item.qtdNotas.size}</td>
                          <td className="py-3 px-3 text-center font-mono text-slate-500">
                            {item.qtdItens}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(item.valorTotal)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-700">
                            {formatCurrency(item.baseIcms)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                            {formatCurrency(item.valorIcms)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {formatCurrency(item.valorPis + item.valorCofins)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-800">
                            {percMes.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISÃO 3: Consolidado por Fornecedor (Emitente) */}
          {subAba === 'fornecedores' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Volume de faturamento e impostos creditados por fornecedor na competência{' '}
                {formatarNomeCompetencia(mesSelecionado)}.
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Razão Social do Fornecedor</th>
                      <th className="py-2.5 px-3">CNPJ</th>
                      <th className="py-2.5 px-3">UF</th>
                      <th className="py-2.5 px-3 text-center">Qtd NF-e</th>
                      <th className="py-2.5 px-3 text-right">Valor Total Faturado</th>
                      <th className="py-2.5 px-3 text-right">Crédito ICMS</th>
                      <th className="py-2.5 px-3 text-right">PIS/COFINS</th>
                      <th className="py-2.5 px-3 text-right">% do Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {agrupamentoPorFornecedor.map(forn => {
                      const perc =
                        totaisPeriodo.totalValor > 0
                          ? (forn.valorTotal / totaisPeriodo.totalValor) * 100
                          : 0;

                      return (
                        <tr key={forn.cnpj} className="hover:bg-slate-50 transition">
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {forn.razaoSocial}
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-500">{forn.cnpj}</td>
                          <td className="py-3 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                              {forn.uf}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center font-mono font-bold">
                            {forn.qtdNotas}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                            {formatCurrency(forn.valorTotal)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                            {formatCurrency(forn.totalIcms)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono text-slate-600">
                            {formatCurrency(forn.totalPisCofins)}
                          </td>
                          <td className="py-3 px-3 text-right font-mono font-semibold text-slate-700">
                            {perc.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VISÃO 4: Evolução Comparativa Mensal */}
          {subAba === 'evolucao' && (
            <div className="space-y-6">
              <div className="text-xs text-slate-500">
                Comparativo do volume de notas fiscais e montante financeiro escriturado ao longo
                dos meses disponíveis na base de dados.
              </div>

              {/* Gráfico em Barras Elegante (CSS/SVG Nativo e Responsivo) */}
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Evolução do Volume Financeiro Mês a Mês (R$)
                </h4>

                <div className="space-y-4">
                  {evolucaoMeses.map(item => {
                    const maxValor = Math.max(...evolucaoMeses.map(m => m.totalR$), 1);
                    const larguraBarra = Math.max((item.totalR$ / maxValor) * 100, 4);

                    return (
                      <div key={item.competencia} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <div className="font-bold text-slate-800 flex items-center gap-2">
                            <span>{item.nome}</span>
                            <span className="text-[10px] text-slate-500 font-normal">
                              ({item.qtdNotas} nota{item.qtdNotas !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <div className="font-mono font-bold text-slate-900">
                            {formatCurrency(item.totalR$)}
                          </div>
                        </div>

                        <div className="w-full bg-slate-200 h-4 rounded-full overflow-hidden flex items-center">
                          <div
                            className="bg-emerald-600 h-full rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${larguraBarra}%` }}
                          >
                            <span className="text-[9px] text-white font-mono font-bold hidden sm:inline">
                              {larguraBarra > 15 && formatCurrency(item.totalR$)}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                          <span>Crédito ICMS apurado: {formatCurrency(item.totalIcms)}</span>
                          <span className="text-emerald-700 font-semibold">
                            {item.conformes} de {item.qtdNotas} conformes
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tabela Resumo da Evolução */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                      <th className="py-2.5 px-3">Competência</th>
                      <th className="py-2.5 px-3 text-center">Quantidade de NF-e</th>
                      <th className="py-2.5 px-3 text-right">Valor Total Escriturado</th>
                      <th className="py-2.5 px-3 text-right">Crédito ICMS</th>
                      <th className="py-2.5 px-3 text-center">Notas Conformes</th>
                      <th className="py-2.5 px-3 text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {evolucaoMeses.map(item => (
                      <tr key={item.competencia} className="hover:bg-slate-50 transition">
                        <td className="py-3 px-3 font-bold text-slate-900">{item.nome}</td>
                        <td className="py-3 px-3 text-center font-mono font-bold">
                          {item.qtdNotas}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                          {formatCurrency(item.totalR$)}
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-blue-700 font-semibold">
                          {formatCurrency(item.totalIcms)}
                        </td>
                        <td className="py-3 px-3 text-center font-mono">
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {item.conformes} / {item.qtdNotas}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setMesSelecionado(item.competencia);
                              setSubAba('notas');
                            }}
                            className="px-2.5 py-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded font-semibold transition"
                          >
                            Ver Notas
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
