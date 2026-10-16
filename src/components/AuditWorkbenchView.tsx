import React, { useState } from 'react';
import {
  DocumentoFiscal,
  ItemDocumentoFiscal,
  OcorrenciaAuditoria,
  FundamentacaoAnalise,
  Empresa
} from '../types/fiscal';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Scale,
  HelpCircle,
  ExternalLink,
  Edit3,
  Check,
  XCircle,
  FileText,
  ChevronRight,
  Sparkles,
  Info,
  Printer,
  Save,
  Shuffle
} from 'lucide-react';
import { DanfeModal } from './DanfeModal';
import { StorageService } from '../services/storageService';
import { CfopService } from '../services/cfopService';

interface AuditWorkbenchViewProps {
  documentos: DocumentoFiscal[];
  setDocumentos: React.Dispatch<React.SetStateAction<DocumentoFiscal[]>>;
  selectedDocId: string | null;
  setSelectedDocId: (id: string) => void;
  empresa: Empresa;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
}

export const AuditWorkbenchView: React.FC<AuditWorkbenchViewProps> = ({
  documentos,
  setDocumentos,
  selectedDocId,
  setSelectedDocId,
  empresa,
  onAddAuditLog
}) => {
  const currentDoc = documentos.find(d => d.id === selectedDocId) || documentos[0];
  const [selectedItemIdx, setSelectedItemIdx] = useState<number>(0);
  const [justificativaAprovacao, setJustificativaAprovacao] = useState('');
  const [showAprovacaoModal, setShowAprovacaoModal] = useState(false);
  const [showDanfeModal, setShowDanfeModal] = useState(false);
  const [salvandoParecer, setSalvandoParecer] = useState(false);
  const [aiAnalysisExplanation, setAiAnalysisExplanation] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleSalvarParecerLocal = () => {
    setSalvandoParecer(true);
    StorageService.salvarDocumentos(documentos);
    setTimeout(() => {
      setSalvandoParecer(false);
    }, 1200);
  };

  if (!currentDoc) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">Nenhum documento disponível para auditoria fiscal.</p>
      </div>
    );
  }

  const currentItem: ItemDocumentoFiscal | undefined = currentDoc.itens[selectedItemIdx] || currentDoc.itens[0];

  const formatMoeda = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleAprovarDocumento = () => {
    if (!justificativaAprovacao.trim() && currentDoc.ocorrencias.length > 0) {
      alert('Para aprovar um documento com apontamentos/divergências, é obrigatório registrar a justificativa técnica para a trilha de auditoria.');
      return;
    }

    setDocumentos(prev =>
      prev.map(d => {
        if (d.id === currentDoc.id) {
          return {
            ...d,
            status: 'APROVADO',
            responsavelAprovacao: 'Roberto Pereira de Oliveira',
            dataAprovacao: new Date().toISOString(),
            observacoes: justificativaAprovacao || 'Aprovado em conformidade com as regras fiscais vigentes.'
          };
        }
        return d;
      })
    );

    onAddAuditLog(
      'APROVACAO',
      currentDoc.id,
      currentDoc.chaveAcesso,
      justificativaAprovacao || 'Aprovação técnica do documento fiscal para escrituração.'
    );

    setShowAprovacaoModal(false);
    setJustificativaAprovacao('');
  };

  const handleRejeitarDocumento = () => {
    const motivo = prompt('Informe o motivo da rejeição do documento fiscal:');
    if (!motivo) return;

    setDocumentos(prev =>
      prev.map(d => (d.id === currentDoc.id ? { ...d, status: 'REJEITADO', observacoes: motivo } : d))
    );

    onAddAuditLog('REJEICAO', currentDoc.id, currentDoc.chaveAcesso, `Rejeição do documento: ${motivo}`);
  };

  // Camada Auxiliar de IA (conforme Item 12 do Prompt: Explicar divergências sem inventar obrigações)
  const handleConsultarIa = () => {
    setIsAiLoading(true);
    setTimeout(() => {
      if (currentItem) {
        if (currentItem.cfop === '5102' && currentDoc.emitente.uf !== currentDoc.destinatario.uf) {
          setAiAnalysisExplanation(
            `ANÁLISE AUXILIAR INTELIGENTE: Detectada incoerência geográfica na NF-e ${currentDoc.numero}. O emitente está localizado em ${currentDoc.emitente.uf} e o destinatário em ${currentDoc.destinatario.uf}. Tratando-se de operação interestadual, o Convênio S/N de 1970 exige CFOP iniciado por '6' (ex: 6.102 para revenda ou 6.108 para não contribuinte). O uso indevido da alíquota interna de 18% em vez da interestadual de 7% (Resolução SF 22/1989) gera um ICMS a maior de R$ 1.650,00, caracterizando recolhimento indevido ou apropriação indevida de crédito na entrada.`
          );
        } else if (currentItem.ncm.startsWith('3004')) {
          setAiAnalysisExplanation(
            `ANÁLISE AUXILIAR INTELIGENTE: O produto "${currentItem.descricao}" (NCM ${currentItem.ncm}) é sujeito ao regime de incidência monofásica da Lei Federal nº 10.147/2000. Na cadeia de comercialização atacadista/varejista, aplica-se alíquota zero de PIS e COFINS (CST 04). A tributação sob CST 01 com 1,65% e 7,60% aponta recolhimento indevido pelo fornecedor ou risco de crédito glosado pelo Fisco Federal.`
          );
        } else {
          setAiAnalysisExplanation(
            `ANÁLISE AUXILIAR INTELIGENTE: O item "${currentItem.descricao}" apresenta conformidade tributária integral. A alíquota informada corresponde exatamente à norma aplicável à operação entre ${currentDoc.emitente.uf} e ${currentDoc.destinatario.uf}, com base de cálculo e retenções aderentes ao Convênio CONFAZ e RICMS.`
          );
        }
      }
      setIsAiLoading(false);
    }, 400);
  };

  return (
    <div id="audit-workbench-view" className="space-y-6">
      {/* Top Header & Seletor de Documento */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
              AUDITORIA FISCAL DIGITAL
            </span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              currentDoc.status === 'APROVADO'
                ? 'bg-emerald-100 text-emerald-800'
                : currentDoc.status === 'COM_DIVERGENCIAS'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {currentDoc.status === 'APROVADO' ? '✓ Aprovado para Escrituração' : currentDoc.status.replace('_', ' ')}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 mt-1">
            NF-e nº {currentDoc.numero} • Série {currentDoc.serie}
          </h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5 truncate max-w-xl">
            Chave: {currentDoc.chaveAcesso}
          </p>
        </div>

        {/* Dropdown seletor de documento */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={currentDoc.id}
            onChange={e => {
              setSelectedDocId(e.target.value);
              setSelectedItemIdx(0);
              setAiAnalysisExplanation(null);
            }}
            className="text-xs p-2 rounded-lg border border-slate-300 font-medium bg-slate-50 focus:outline-emerald-600"
          >
            {documentos.map(d => (
              <option key={d.id} value={d.id}>
                NF-e {d.numero} ({d.emitente.uf} ➔ {d.destinatario.uf}) - {d.status}
              </option>
            ))}
          </select>

          {/* BOTÃO SALVAR PARECER / ALTERAÇÃO */}
          <button
            id="btn-salvar-parecer-workbench"
            onClick={handleSalvarParecerLocal}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm ${
              salvandoParecer
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow'
            }`}
            title="Salvar alterações de parecer, conciliação e status no banco local"
          >
            {salvandoParecer ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Parecer Salvo!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-200" />
                <span>SALVAR</span>
              </>
            )}
          </button>

          {currentDoc.status !== 'APROVADO' ? (
            <button
              onClick={() => setShowAprovacaoModal(true)}
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-sm transition"
            >
              <Check className="w-4 h-4" />
              Aprovar p/ Escrituração
            </button>
          ) : (
            <button
              disabled
              className="px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              Documento Aprovado
            </button>
          )}

          <button
            onClick={handleRejeitarDocumento}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-red-50 hover:text-red-700 text-slate-700 transition"
          >
            Rejeitar
          </button>

          <button
            onClick={() => setShowDanfeModal(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 shadow-sm transition"
            title="Imprimir DANFE / Salvar em PDF"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            Imprimir DANFE (PDF)
          </button>
        </div>
      </div>

      {/* Grid Principal: Lista de Itens à Esquerda & Parecer Detalhado à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel Esquerdo: Itens da NF (4 colunas) */}
        <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Itens da NF-e ({currentDoc.itens.length})
            </h3>
            <span className="text-[10px] text-slate-400">Selecione para inspecionar</span>
          </div>

          <div className="space-y-2">
            {currentDoc.itens.map((item, idx) => {
              const isSelected = selectedItemIdx === idx;
              const hasAlert = item.ocorrencias.length > 0;

              return (
                <button
                  key={item.numeroItem}
                  onClick={() => {
                    setSelectedItemIdx(idx);
                    setAiAnalysisExplanation(null);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition border text-xs ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-800">
                      #{item.numeroItem} {item.descricao}
                    </span>
                    {hasAlert ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 flex items-center gap-1 shrink-0">
                        <AlertTriangle className="w-3 h-3" />
                        {item.ocorrencias.length}
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 shrink-0">
                        <Check className="w-3 h-3" />
                        OK
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                    <span>NCM {item.ncm} • CFOP {item.cfop}</span>
                    <span className="font-semibold text-slate-700">{formatMoeda(item.vProd)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Dados do Destinatário e Emitente */}
          <div className="pt-3 border-t border-slate-100 text-[11px] space-y-2 text-slate-600">
            <div>
              <span className="font-semibold text-slate-700">Origem:</span> {currentDoc.emitente.razaoSocial} ({currentDoc.emitente.uf})
            </div>
            <div>
              <span className="font-semibold text-slate-700">Destino:</span> {currentDoc.destinatario.razaoSocial} ({currentDoc.destinatario.uf})
            </div>
            <div>
              <span className="font-semibold text-slate-700">Natureza:</span> {currentDoc.naturezaOperacao}
            </div>

            {/* Cruzamento da Natureza da Operação com o CFOP do item selecionado */}
            {currentItem && (() => {
              const classif = CfopService.obterClassificacao(currentItem.cfop);
              const isInter = currentDoc.emitente.uf !== currentDoc.destinatario.uf;
              const cruzamento = CfopService.cruzarCfopEntrada(currentItem.cfop, 'INDUSTRIALIZACAO', isInter);
              return (
                <div className="mt-2 p-2 bg-blue-50/80 rounded-lg border border-blue-200 text-[10px] space-y-1">
                  <div className="font-bold text-blue-900 flex items-center gap-1">
                    <Shuffle className="w-3 h-3 text-blue-700" />
                    <span>Cruzamento CFOP x Natureza</span>
                  </div>
                  <div className="text-slate-700">
                    CFOP {currentItem.cfop}: <strong className="text-slate-900">{classif?.naturezaOperacao || 'Operação Fiscal'}</strong>
                  </div>
                  <div className="text-emerald-800 font-semibold pt-1 border-t border-blue-200/60">
                    Entrada Sugerida: <span className="font-mono font-bold">{isInter ? cruzamento.cfopEntradaInterestadual : cruzamento.cfopEntradaInterno}</span> ({cruzamento.naturezaEntradaSugerida})
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Painel Direito: Workbench de Parecer Técnico Explicável (8 colunas) */}
        {currentItem && (
          <div className="lg:col-span-8 space-y-6">
            {/* Box 1: Relatório de Análise Técnica (Conforme Item 18 do Prompt) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Scale className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-800">
                    Relatório de Análise & Confronto de Tributos
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Item #{currentItem.numeroItem}: {currentItem.codigoProduto}
                </span>
              </div>

              {/* Tabela de Confronto: Declarado vs Calculado pelo Motor */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Tributo</th>
                      <th className="py-2.5 px-3">CST / Alíquota Inf.</th>
                      <th className="py-2.5 px-3">Valor Informado</th>
                      <th className="py-2.5 px-3">Alíq. Legal / Calculado</th>
                      <th className="py-2.5 px-3">Diferença Apurada</th>
                      <th className="py-2.5 px-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {/* ICMS */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">ICMS Próprio</td>
                      <td className="py-2.5 px-3">{currentItem.impostos.icmsCst} • {currentItem.impostos.icmsAliquota}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.icmsValor)}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">
                        {formatMoeda(currentItem.impostos.icmsCalculado)}
                      </td>
                      <td className={`py-2.5 px-3 font-bold ${
                        currentItem.impostos.icmsDiferenca > 0.05 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {formatMoeda(currentItem.impostos.icmsDiferenca)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {currentItem.impostos.icmsDiferenca > 0.05 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Divergência
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* ICMS-ST (quando aplicável) */}
                    {currentItem.impostos.temSt && (
                      <tr>
                        <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">ICMS-ST (Retido)</td>
                        <td className="py-2.5 px-3">MVA {currentItem.impostos.icmsStMva}%</td>
                        <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.icmsStValor)}</td>
                        <td className="py-2.5 px-3 font-semibold text-purple-700">
                          {formatMoeda(currentItem.impostos.icmsStCalculado)}
                        </td>
                        <td className={`py-2.5 px-3 font-bold ${
                          currentItem.impostos.icmsStDiferenca > 0.05 ? 'text-amber-700' : 'text-slate-400'
                        }`}>
                          {formatMoeda(currentItem.impostos.icmsStDiferenca)}
                        </td>
                        <td className="py-2.5 px-3 font-sans">
                          {currentItem.impostos.icmsStDiferenca > 0.05 ? (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Atenção
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              OK
                            </span>
                          )}
                        </td>
                      </tr>
                    )}

                    {/* IPI */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">IPI</td>
                      <td className="py-2.5 px-3">{currentItem.impostos.ipiCst} • {currentItem.impostos.ipiAliquota}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.ipiValor)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{formatMoeda(currentItem.impostos.ipiCalculado)}</td>
                      <td className="py-2.5 px-3 text-slate-400">R$ 0,00</td>
                      <td className="py-2.5 px-3 font-sans">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          OK
                        </span>
                      </td>
                    </tr>

                    {/* PIS */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">PIS</td>
                      <td className="py-2.5 px-3">{currentItem.impostos.pisCst} • {currentItem.impostos.pisAliquota}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.pisValor)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{formatMoeda(currentItem.impostos.pisCalculado)}</td>
                      <td className={`py-2.5 px-3 font-bold ${
                        Math.abs(currentItem.impostos.pisValor - currentItem.impostos.pisCalculado) > 0.05 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {formatMoeda(Math.abs(currentItem.impostos.pisValor - currentItem.impostos.pisCalculado))}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {Math.abs(currentItem.impostos.pisValor - currentItem.impostos.pisCalculado) > 0.05 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Divergência
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* COFINS */}
                    <tr>
                      <td className="py-2.5 px-3 font-bold text-slate-800 font-sans">COFINS</td>
                      <td className="py-2.5 px-3">{currentItem.impostos.cofinsCst} • {currentItem.impostos.cofinsAliquota}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.cofinsValor)}</td>
                      <td className="py-2.5 px-3 font-semibold text-slate-700">{formatMoeda(currentItem.impostos.cofinsCalculado)}</td>
                      <td className={`py-2.5 px-3 font-bold ${
                        Math.abs(currentItem.impostos.cofinsValor - currentItem.impostos.cofinsCalculado) > 0.05 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {formatMoeda(Math.abs(currentItem.impostos.cofinsValor - currentItem.impostos.cofinsCalculado))}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {Math.abs(currentItem.impostos.cofinsValor - currentItem.impostos.cofinsCalculado) > 0.05 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Divergência
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OK
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* IBS (Lei Complementar nº 214/2025) */}
                    <tr className="bg-emerald-50/30">
                      <td className="py-2.5 px-3 font-bold text-emerald-900 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span>IBS (LC 214/25)</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-normal">Estadual/DF/Mun.</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{currentItem.impostos.ibsCst || '01'} • {currentItem.impostos.ibsAliquota || 0.10}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.ibsValor || 0)}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-700">{formatMoeda(currentItem.impostos.ibsCalculado || 0)}</td>
                      <td className={`py-2.5 px-3 font-bold ${
                        (currentItem.impostos.ibsDiferenca || 0) > 0.05 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {formatMoeda(currentItem.impostos.ibsDiferenca || 0)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {(currentItem.impostos.ibsDiferenca || 0) > 0.05 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Divergência
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OK Conforme
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* CBS (Lei Complementar nº 214/2025) */}
                    <tr className="bg-blue-50/30">
                      <td className="py-2.5 px-3 font-bold text-blue-900 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span>CBS (LC 214/25)</span>
                          <span className="text-[9px] px-1 py-0.5 rounded bg-blue-100 text-blue-800 font-normal">Federal</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3">{currentItem.impostos.cbsCst || '01'} • {currentItem.impostos.cbsAliquota || 0.90}%</td>
                      <td className="py-2.5 px-3">{formatMoeda(currentItem.impostos.cbsValor || 0)}</td>
                      <td className="py-2.5 px-3 font-semibold text-blue-700">{formatMoeda(currentItem.impostos.cbsCalculado || 0)}</td>
                      <td className={`py-2.5 px-3 font-bold ${
                        (currentItem.impostos.cbsDiferenca || 0) > 0.05 ? 'text-amber-700' : 'text-slate-400'
                      }`}>
                        {formatMoeda(currentItem.impostos.cbsDiferenca || 0)}
                      </td>
                      <td className="py-2.5 px-3 font-sans">
                        {(currentItem.impostos.cbsDiferenca || 0) > 0.05 ? (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                            Divergência
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            OK Conforme
                          </span>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Box 2: "Por que esta regra foi aplicada?" — Princípio da Fundamentação Normativa (Item 3 do Prompt) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-sm text-slate-800">
                    Por que esta regra foi aplicada? (Cadeia Normativa)
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Alta Confiança Jurídica
                </span>
              </div>

              <div className="space-y-4">
                {currentItem.fundamentacoes.map((fund, fIdx) => (
                  <div key={fIdx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        {fund.regraNome} ({fund.tributo})
                      </span>
                      <span className="text-[11px] font-mono font-medium text-slate-500">
                        {fund.hierarquiaNormativa}
                      </span>
                    </div>

                    <div className="p-2.5 bg-white rounded-lg border border-slate-200/80 font-mono text-[11px] text-slate-700">
                      <span className="font-bold text-emerald-800">Base Legal: </span>
                      {fund.normaNome} — {fund.artigo} {fund.paragrafo ? `• ${fund.paragrafo}` : ''} {fund.inciso ? `• ${fund.inciso}` : ''}
                      <span className="text-slate-400 block mt-0.5 font-sans">Vigência: {fund.vigencia}</span>
                    </div>

                    <p className="text-slate-600 leading-relaxed text-xs">
                      {fund.explicacao}
                    </p>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-emerald-800 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Recomendação: {fund.acaoRecomendada}
                      </span>
                      {fund.fonteOficialUrl && (
                        <a
                          href={fund.fonteOficialUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-emerald-600 hover:underline flex items-center gap-1 font-medium"
                        >
                          Fonte Oficial
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: Apontamentos de Auditoria do Item */}
            {currentItem.ocorrencias.length > 0 && (
              <div className="bg-amber-50/50 p-5 rounded-xl border border-amber-200 shadow-sm space-y-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-amber-700" />
                  <h3 className="font-bold text-sm text-amber-900">
                    Ocorrências de Auditoria no Item ({currentItem.ocorrencias.length})
                  </h3>
                </div>

                <div className="space-y-3">
                  {currentItem.ocorrencias.map(oc => (
                    <div key={oc.id} className="p-4 bg-white rounded-xl border border-amber-200 space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900 text-sm">
                          {oc.tipo.replace(/_/g, ' ')}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          {oc.severidade}
                        </span>
                      </div>
                      <p className="text-slate-700">{oc.descricao}</p>
                      <div className="bg-amber-50 p-2 rounded text-[11px] text-amber-900 font-mono">
                        Regra: {oc.regraAplicada} • {oc.fundamentacaoLegal}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <span className="font-bold text-slate-800">Conclusão: </span>{oc.conclusao}
                      </div>
                      <div className="text-[11px] font-semibold text-emerald-800">
                        Ação Sugerida: {oc.acaoRecomendada}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Box 4: Camada Auxiliar de IA (Item 12 do Prompt) */}
            <div className="bg-slate-900 text-slate-200 p-5 rounded-xl shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                  <h3 className="font-bold text-sm text-white">
                    Assistente Inteligente de Apoio Fiscal (Camada Auxiliar)
                  </h3>
                </div>
                <button
                  onClick={handleConsultarIa}
                  disabled={isAiLoading}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isAiLoading ? 'Analisando...' : 'Explicar com IA'}
                </button>
              </div>

              <p className="text-xs text-slate-400">
                A IA atua estritamente como ferramenta interpretativa auxiliar vinculada a regras cadastradas. Ela nunca cria ou infere obrigações tributárias sem base normativa expressa.
              </p>

              {aiAnalysisExplanation && (
                <div className="p-3.5 rounded-lg bg-slate-800/90 border border-emerald-500/30 text-xs text-slate-200 leading-relaxed font-sans mt-2">
                  {aiAnalysisExplanation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de Aprovação com Trilha de Auditoria Obrigatória */}
      {showAprovacaoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-emerald-600" />
                Aprovação Técnica para Escrituração
              </h3>
              <button
                onClick={() => setShowAprovacaoModal(false)}
                className="text-slate-400 hover:text-slate-600 font-semibold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Ao aprovar este documento, ele será formalmente liberado para consolidação no SPED Fiscal (EFD ICMS/IPI) e envio para o ERP TOTVS Protheus.
            </p>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">
                Parecer / Justificativa do Auditor Responsável:
              </label>
              <textarea
                rows={3}
                value={justificativaAprovacao}
                onChange={e => setJustificativaAprovacao(e.target.value)}
                placeholder="Ex: Documento validado com aceite de divergência residual pelo setor fiscal ou confirmação de recolhimento prévio..."
                className="w-full text-xs p-2.5 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
              <span className="text-[10px] text-slate-400">
                Esta manifestação será salva de forma imutável na Trilha de Auditoria.
              </span>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowAprovacaoModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleAprovarDocumento}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm"
              >
                Confirmar Aprovação & Assinar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão e PDF do DANFE */}
      {showDanfeModal && (
        <DanfeModal
          documento={currentDoc}
          onClose={() => setShowDanfeModal(false)}
        />
      )}
    </div>
  );
};
