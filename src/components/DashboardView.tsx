import React from 'react';
import { DocumentoFiscal, ResumoDashboard, SeveridadeAuditoria } from '../types/fiscal';
import {
  FileText,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  ArrowUpRight,
  Calculator,
  ArrowRight,
  BookOpen,
  FileCheck2
} from 'lucide-react';

interface DashboardViewProps {
  documentos: DocumentoFiscal[];
  onNavigate: (tab: any) => void;
  onSelectDoc: (docId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ documentos, onNavigate, onSelectDoc }) => {
  // Calcula métricas consolidadas
  const resumo: ResumoDashboard = React.useMemo(() => {
    let valorTotalOperacoes = 0;
    let totalTributosCalculados = 0;
    let totalCreditosAdmissiveis = 0;
    let totalDebitosCalculados = 0;
    let totalDivergenciasValor = 0;
    let documentosAprovados = 0;
    let documentosComDivergencia = 0;
    let documentosPendentesRevisao = 0;

    const ocorrenciasPorSeveridade: Record<SeveridadeAuditoria, number> = {
      OK: 0,
      ATENCAO: 0,
      DIVERGENCIA: 0,
      ERRO_PROVAVEL: 0,
      NECESSITA_REVISAO: 0
    };

    const ocorrenciasPorTributo: Record<string, number> = {
      ICMS: 0,
      ICMS_ST: 0,
      IPI: 0,
      PIS: 0,
      COFINS: 0,
      IBS: 0,
      CBS: 0,
      GERAL: 0
    };

    let totalIbsGeral = 0;
    let totalCbsGeral = 0;
    let totalCreditosIbsCbsGeral = 0;

    documentos.forEach(doc => {
      valorTotalOperacoes += doc.valorTotalDocumento;
      totalTributosCalculados += doc.totalIcms + doc.totalIpi + doc.totalPis + doc.totalCofins + doc.totalIcmsSt;
      totalCreditosAdmissiveis += doc.totalCreditosApurados;
      totalDebitosCalculados += doc.totalDebitosApurados;
      totalDivergenciasValor += doc.totalDivergenciasValor;
      totalIbsGeral += (doc.totalIbs || 0);
      totalCbsGeral += (doc.totalCbs || 0);
      totalCreditosIbsCbsGeral += (doc.totalCreditosIbsCbs || 0);

      if (doc.status === 'APROVADO' || doc.status === 'ESCRITURADO') {
        documentosAprovados++;
      } else if (doc.status === 'COM_DIVERGENCIAS') {
        documentosComDivergencia++;
      } else {
        documentosPendentesRevisao++;
      }

      doc.ocorrencias.forEach(oc => {
        ocorrenciasPorSeveridade[oc.severidade] = (ocorrenciasPorSeveridade[oc.severidade] || 0) + 1;
        if (oc.tributo) {
          ocorrenciasPorTributo[oc.tributo] = (ocorrenciasPorTributo[oc.tributo] || 0) + 1;
        }
      });
    });

    return {
      totalDocumentos: documentos.length,
      valorTotalOperacoes,
      totalTributosCalculados,
      totalCreditosAdmissiveis,
      totalDebitosCalculados,
      totalDivergenciasValor,
      documentosAprovados,
      documentosComDivergencia,
      documentosPendentesRevisao,
      ocorrenciasPorSeveridade,
      ocorrenciasPorTributo,
      economiaTributariaPotencial: totalDivergenciasValor,
      totalIbsGeral,
      totalCbsGeral,
      totalCreditosIbsCbsGeral
    };
  }, [documentos]);

  const formatMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
  };

  return (
    <div id="dashboard-view" className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Painel de Auditoria & Escrituração</h2>
          <p className="text-xs text-slate-500 mt-1">
            Mecanismo de conferência tributária baseado na hierarquia normativa brasileira (CF/88, LC 87/96, Convênios CONFAZ e RICMS).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-manual-usuario-dash"
            onClick={() => onNavigate('manual')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition flex items-center gap-1.5 shadow-sm"
            title="Abrir o Manual do Usuário com guias passo a passo"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            Manual & Tutoriais
          </button>
          <button
            id="btn-manifesto-dash"
            onClick={() => onNavigate('manifesto')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-700 text-white hover:bg-emerald-800 transition flex items-center gap-1.5 shadow-sm"
            title="Acessar o módulo de Manifestação do Destinatário no Portal da Fazenda"
          >
            <FileCheck2 className="w-4 h-4 text-emerald-200" />
            Manifestação SEFAZ
          </button>
          <button
            id="btn-import-xml-dash"
            onClick={() => onNavigate('documentos')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Importar XML
          </button>
          <button
            id="btn-ver-auditoria-dash"
            onClick={() => onNavigate('auditoria')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 transition flex items-center gap-1.5 shadow-sm"
          >
            <AlertTriangle className="w-4 h-4" />
            Auditoria ({resumo.documentosComDivergencia})
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Documentos Processados */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documentos Fiscais</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">{resumo.totalDocumentos}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-600 font-semibold">{resumo.documentosAprovados} aprovados</span>
            <span className="text-amber-600 font-semibold">{resumo.documentosComDivergencia} com ressalva</span>
          </div>
        </div>

        {/* Card 2: Volume Financeiro */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Volume das Operações</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-800 mt-2">{formatMoeda(resumo.valorTotalOperacoes)}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Tributos apurados</span>
            <span className="font-semibold text-slate-700">{formatMoeda(resumo.totalTributosCalculados)}</span>
          </div>
        </div>

        {/* Card 3: Créditos Fiscais Legítimos */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Créditos Admissíveis</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-700 mt-2">{formatMoeda(resumo.totalCreditosAdmissiveis)}</p>
          <div className="flex items-center justify-between text-xs text-slate-500 mt-2 pt-2 border-t border-slate-100">
            <span>Débitos apurados</span>
            <span className="font-semibold text-slate-700">{formatMoeda(resumo.totalDebitosCalculados)}</span>
          </div>
        </div>

        {/* Card 4: Divergências & Risco Fiscal */}
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Divergências de Cálculo</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">{formatMoeda(resumo.totalDivergenciasValor)}</p>
          <div className="flex items-center justify-between text-xs text-slate-600 mt-2 pt-2 border-t border-amber-100">
            <span>Créditos indevidos/erros</span>
            <span className="font-semibold text-amber-900 font-mono">
              {resumo.ocorrenciasPorSeveridade.ERRO_PROVAVEL + resumo.ocorrenciasPorSeveridade.DIVERGENCIA} apontamentos
            </span>
          </div>
        </div>
      </div>

      {/* Destaque Reforma Tributária: Leitura e Apuração de IBS e CBS (Lei Complementar nº 214/2025) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 rounded-xl shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500 text-slate-950 uppercase tracking-wider">
              LC 214/2025
            </span>
            <span className="text-xs font-semibold text-emerald-400">
              Reforma Tributária — Leitura de IBS e CBS Habilitada
            </span>
          </div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Apuração Automatizada do Imposto sobre Bens e Serviços (IBS) e Contribuição sobre Bens e Serviços (CBS)
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            Conforme a Lei Complementar nº 214/2025 (Arts. 1º, 8º, 28 e 343), o sistema realiza a leitura dos novos tributos no XML, projeta as alíquotas de teste de transição (0,10% IBS e 0,90% CBS) e apura o crédito financeiro amplo da não-cumulatividade plena sobre insumos e energia elétrica.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-stretch md:items-end gap-3 w-full md:w-auto">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-lg border border-white/10 text-right min-w-[170px]">
            <div className="text-[11px] text-emerald-300 font-medium">Créditos IBS/CBS Apurados</div>
            <div className="text-lg font-mono font-extrabold text-white">
              {formatMoeda(resumo.totalCreditosIbsCbsGeral || 0)}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              IBS: {formatMoeda(resumo.totalIbsGeral || 0)} • CBS: {formatMoeda(resumo.totalCbsGeral || 0)}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <button
              onClick={() => onNavigate('reforma')}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Painel LC 214/2025</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <a
              href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] text-slate-400 hover:text-emerald-300 transition text-center underline"
            >
              Ver LC 214/2025 no Planalto
            </a>
          </div>
        </div>
      </div>

      {/* Grid: Ocorrências por Tributo & Documentos Recentes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo: Distribuição por Tributo e Severidade */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Apontamentos por Tributo
          </h3>

          <div className="space-y-3 text-xs">
            {Object.entries(resumo.ocorrenciasPorTributo).map(([trib, count]) => {
              const pct = resumo.totalDocumentos > 0 ? Math.min(100, Math.round((count / (resumo.totalDocumentos * 3)) * 100)) : 0;
              return (
                <div key={trib} className="space-y-1">
                  <div className="flex justify-between font-medium text-slate-700">
                    <span>{trib.replace('_', ' ')}</span>
                    <span className="font-mono text-slate-500">{count} ocorrência{count !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        trib === 'ICMS'
                          ? 'bg-blue-500'
                          : trib === 'ICMS_ST'
                          ? 'bg-purple-500'
                          : trib === 'PIS' || trib === 'COFINS'
                          ? 'bg-amber-500'
                          : trib === 'IBS'
                          ? 'bg-teal-500'
                          : trib === 'CBS'
                          ? 'bg-indigo-500'
                          : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h4 className="font-semibold text-xs text-slate-700 mb-2">Classificação de Risco</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-100 flex items-center justify-between">
                <span>OK (Conformes)</span>
                <span className="font-bold">{resumo.ocorrenciasPorSeveridade.OK}</span>
              </div>
              <div className="p-2 rounded-lg bg-yellow-50 text-yellow-800 border border-yellow-100 flex items-center justify-between">
                <span>Atenção</span>
                <span className="font-bold">{resumo.ocorrenciasPorSeveridade.ATENCAO}</span>
              </div>
              <div className="p-2 rounded-lg bg-orange-50 text-orange-800 border border-orange-100 flex items-center justify-between">
                <span>Divergência</span>
                <span className="font-bold">{resumo.ocorrenciasPorSeveridade.DIVERGENCIA}</span>
              </div>
              <div className="p-2 rounded-lg bg-red-50 text-red-800 border border-red-100 flex items-center justify-between">
                <span>Erro Provável</span>
                <span className="font-bold">{resumo.ocorrenciasPorSeveridade.ERRO_PROVAVEL}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Painel Direito: Fila de Documentos para Análise e Aprovação */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Fila de Documentos Fiscais
            </h3>
            <button
              onClick={() => onNavigate('documentos')}
              className="text-xs text-emerald-600 font-semibold hover:underline flex items-center gap-1"
            >
              Ver todos ({documentos.length})
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="pb-2">Documento</th>
                  <th className="pb-2">Emitente / Destinatário</th>
                  <th className="pb-2">Valor NF</th>
                  <th className="pb-2">Status Fiscal</th>
                  <th className="pb-2 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documentos.map(doc => {
                  const hasDivergencia = doc.ocorrencias.some(o => o.severidade === 'DIVERGENCIA' || o.severidade === 'ERRO_PROVAVEL');
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 font-mono font-medium text-slate-700">
                        <div className="font-semibold text-slate-900">NF-e {doc.numero}</div>
                        <div className="text-[10px] text-slate-400">Série {doc.serie} • {doc.tipoOperacao}</div>
                      </td>
                      <td className="py-3">
                        <div className="font-medium text-slate-800 max-w-[200px] truncate">{doc.emitente.razaoSocial}</div>
                        <div className="text-[10px] text-slate-500">
                          {doc.emitente.uf} ➔ {doc.destinatario.uf} ({doc.naturezaOperacao})
                        </div>
                      </td>
                      <td className="py-3 font-semibold text-slate-800">
                        {formatMoeda(doc.valorTotalDocumento)}
                      </td>
                      <td className="py-3">
                        {hasDivergencia ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {doc.ocorrencias.length} Apontamento{doc.ocorrencias.length !== 1 ? 's' : ''}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Conforme
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          id={`btn-audit-doc-${doc.id}`}
                          onClick={() => {
                            onSelectDoc(doc.id);
                            onNavigate('auditoria');
                          }}
                          className="px-2.5 py-1.5 text-xs font-semibold rounded-md bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition"
                        >
                          Auditar
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
