import React, { useState } from 'react';
import {
  Globe,
  RefreshCw,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Layers,
  BookOpen,
  Filter,
  Check,
  X,
  FileSpreadsheet,
  Zap,
  Info,
  Clock,
  ArrowRight,
  ShieldCheck,
  BarChart3
} from 'lucide-react';
import { DocumentoFiscal, NcmSiscomexInfo } from '../types/fiscal';
import { SiscomexNcmService, SISCOMEX_BASE_URL } from '../services/siscomexNcmService';

interface SiscomexNcmModalProps {
  documentos: DocumentoFiscal[];
  onAtualizarDocumentos?: (docsAtualizados: DocumentoFiscal[]) => void;
  onClose: () => void;
  ncmInicial?: string;
}

export const SiscomexNcmModal: React.FC<SiscomexNcmModalProps> = ({
  documentos,
  onAtualizarDocumentos,
  onClose,
  ncmInicial
}) => {
  const [activeTab, setActiveTab] = useState<'consulta' | 'lote' | 'tabela'>('consulta');
  const [buscaNcm, setBuscaNcm] = useState<string>(ncmInicial || '73269090');
  const [loading, setLoading] = useState(false);
  const [sincronizandoLote, setSincronizandoLote] = useState(false);
  const [progressoLote, setProgressoLote] = useState<{ atual: number; total: number; ncm: string } | null>(null);
  const [resultadoAtual, setResultadoAtual] = useState<NcmSiscomexInfo | null>(null);
  const [filtroTabela, setFiltroTabela] = useState('');
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Extrai todos os NCMs únicos encontrados nos documentos importados
  const ncmsDocumentos = React.useMemo(() => {
    const mapa = new Map<string, { ncm: string; totalItens: number; docsIds: string[] }>();
    documentos.forEach(doc => {
      doc.itens.forEach(item => {
        const ncmLimpo = SiscomexNcmService.limparNcm(item.ncm);
        if (ncmLimpo) {
          const reg = mapa.get(ncmLimpo) || { ncm: ncmLimpo, totalItens: 0, docsIds: [] };
          reg.totalItens += 1;
          if (!reg.docsIds.includes(doc.id)) reg.docsIds.push(doc.id);
          mapa.set(ncmLimpo, reg);
        }
      });
    });
    return Array.from(mapa.values());
  }, [documentos]);

  // Consulta inicial caso tenha vindo preenchido
  React.useEffect(() => {
    if (ncmInicial) {
      handleConsultarNcm(ncmInicial);
    } else {
      handleConsultarNcm('73269090');
    }
  }, [ncmInicial]);

  const handleConsultarNcm = async (cod?: string) => {
    const target = cod || buscaNcm;
    if (!target) return;
    setLoading(true);
    setMensagemSucesso(null);
    try {
      const info = await SiscomexNcmService.consultarNcmSiscomex(target);
      setResultadoAtual(info);
    } finally {
      setLoading(false);
    }
  };

  // Sincronização instantânea de todos os NCMs com enriquecimento dos itens
  const handleSincronizarLote = async () => {
    setSincronizandoLote(true);
    setMensagemSucesso(null);

    const listaNcms = ncmsDocumentos.map(item => item.ncm);
    if (listaNcms.length === 0) {
      // Se não houver itens nos documentos, sincroniza tabela padrão
      listaNcms.push('73269090', '30049099', '84818099', '27160000', '84713012');
    }

    try {
      const mapaAtualizado = await SiscomexNcmService.sincronizarTodosNcmsEmLote(
        listaNcms,
        (atual, total, ncm) => {
          setProgressoLote({ atual, total, ncm: SiscomexNcmService.formatarNcm(ncm) });
        }
      );

      // Atualiza os documentos fiscais em memória com os metadados do Siscomex
      if (onAtualizarDocumentos) {
        const docsAtualizados = documentos.map(doc => {
          const itensAtualizados = doc.itens.map(item => {
            const limpo = SiscomexNcmService.limparNcm(item.ncm);
            const dadosSiscomex = mapaAtualizado.get(limpo);
            if (dadosSiscomex) {
              return {
                ...item,
                ncmSiscomex: dadosSiscomex
              };
            }
            return item;
          });
          return {
            ...doc,
            itens: itensAtualizados
          };
        });

        onAtualizarDocumentos(docsAtualizados);
      }

      setMensagemSucesso(
        `Sucesso! ${mapaAtualizado.size} códigos NCM sincronizados instantaneamente com o Portal Único Siscomex Classif e vinculados às notas fiscais!`
      );
    } finally {
      setSincronizandoLote(false);
      setProgressoLote(null);
    }
  };

  const tabelaReferencial = SiscomexNcmService.getTabelaReferencialNcm().filter(item => {
    if (!filtroTabela) return true;
    const term = filtroTabela.toLowerCase();
    return (
      item.codigoNcm.includes(term) ||
      item.codigoFormatado.includes(term) ||
      item.descricaoOficial.toLowerCase().includes(term) ||
      item.capitulo.toLowerCase().includes(term)
    );
  });

  return (
    <div
      id="modal-siscomex-ncm"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-300 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* CABEÇALHO OFICIAL SISCOMEX CLASSIF */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 p-6 text-white relative border-b border-blue-900/60 shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <Globe className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
                  PORTAL ÚNICO SISCOMEX • SISTEMA CLASSIF
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] font-mono text-emerald-300">
                  Nomenclatura Comum do Mercosul (NCM) &amp; Tabela TIPI 2026
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-0.5 flex items-center gap-2">
                <span>Atualização Instantânea de NCM</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                  API OFICIAL
                </span>
              </h2>
              <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
                Consulte e sincronize instantaneamente a árvore tarifária do Portal Único Siscomex (
                <a
                  href={SISCOMEX_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-300 underline hover:text-white inline-flex items-center gap-1 font-mono"
                >
                  portalunico.siscomex.gov.br/classif/#/sumario?perfil=publico
                  <ExternalLink className="w-3 h-3 inline" />
                </a>
                ) para validar a vigência das NCMs, alíquotas da TIPI (IPI), ICMS, PIS/COFINS e regras da Reforma Tributária (IBS/CBS).
              </p>
            </div>
          </div>

          {/* ABAS DO MODAL */}
          <div className="flex gap-2 mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('consulta')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'consulta'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Consulta Instantânea de NCM</span>
            </button>

            <button
              onClick={() => setActiveTab('lote')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'lote'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Sincronizar NCMs das Notas ({ncmsDocumentos.length} códigos)</span>
            </button>

            <button
              onClick={() => setActiveTab('tabela')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'tabela'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Tabela TIPI / Catálogo Siscomex</span>
            </button>
          </div>
        </div>

        {/* MENSAGEM DE SUCESSO / FEEDBACK */}
        {mensagemSucesso && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-5 py-2.5 text-xs text-emerald-900 font-medium flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
            <button
              onClick={() => setMensagemSucesso(null)}
              className="text-emerald-700 hover:text-emerald-900 font-bold"
            >
              Fechar
            </button>
          </div>
        )}

        {/* CORPO DO MODAL */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50 space-y-6">
          {/* TAB 1: CONSULTA INDIVIDUAL INSTANTÂNEA */}
          {activeTab === 'consulta' && (
            <div className="space-y-6">
              {/* BARRA DE PESQUISA */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                <label className="text-xs font-bold text-slate-800 block">
                  Digite o código NCM (8 dígitos ou com pontos) para consulta em tempo real no Siscomex Classif:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={buscaNcm}
                      onChange={e => setBuscaNcm(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleConsultarNcm()}
                      placeholder="Ex: 73269090, 30049099, 84818099, 27160000..."
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    onClick={() => handleConsultarNcm()}
                    disabled={loading}
                    className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 shadow-sm shrink-0"
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>{loading ? 'Consultando Siscomex...' : 'Consultar Instantaneamente'}</span>
                  </button>

                  <a
                    href={SISCOMEX_BASE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs transition flex items-center gap-1.5 border border-slate-300 shrink-0"
                    title="Abrir Portal Único Siscomex Classif em nova aba"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                    <span className="hidden md:inline">Abrir Siscomex Oficial</span>
                  </a>
                </div>

                {/* ATALHOS RÁPIDOS DE NCM DOS DOCUMENTOS */}
                <div className="flex items-center gap-2 flex-wrap pt-2">
                  <span className="text-[11px] text-slate-500 font-medium">Exemplos e NCMs nas Notas:</span>
                  {['73269090', '30049099', '84818099', '27160000', '84713012', '87082999'].map(cod => (
                    <button
                      key={cod}
                      onClick={() => {
                        setBuscaNcm(cod);
                        handleConsultarNcm(cod);
                      }}
                      className="px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-800 border border-slate-200 transition"
                    >
                      {SiscomexNcmService.formatarNcm(cod)}
                    </button>
                  ))}
                </div>
              </div>

              {/* CARD DE RESULTADO DETALHADO DO SISCOMEX */}
              {resultadoAtual && (
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-md text-sm font-black font-mono bg-blue-100 text-blue-900 border border-blue-200">
                          NCM {resultadoAtual.codigoFormatado}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            resultadoAtual.situacaoVigencia === 'VIGENTE'
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border-rose-300'
                          }`}
                        >
                          {resultadoAtual.situacaoVigencia === 'VIGENTE' ? '● VIGENTE NO SISCOMEX' : '● EXTINTA / REVOGADA'}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-2 leading-snug">
                        {resultadoAtual.descricaoOficial}
                      </h3>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] text-slate-400 block font-mono">Última Sincronização:</span>
                      <span className="text-xs font-bold text-slate-700 font-mono">
                        {new Date(resultadoAtual.dataAtualizacaoSincronizacao).toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </div>

                  {/* ESTRUTURA HIERÁRQUICA DO CLASSIF */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Capítulo da NCM:</span>
                      <strong className="text-slate-800">{resultadoAtual.capitulo}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Posição / Subposição:</span>
                      <strong className="text-slate-800">{resultadoAtual.posicao} / {resultadoAtual.subposicao || '-'}</strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-semibold block uppercase">Unidade Estatística:</span>
                      <strong className="text-blue-800 font-mono">{resultadoAtual.unidadeMedidaEstatistica || 'UN / KG'}</strong>
                    </div>
                  </div>

                  {/* GRADE DE ALÍQUOTAS FEDERAIS, ESTADUAIS E REFORMA TRIBUTÁRIA */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>Alíquotas Aplicáveis e Parâmetros Tributários Vigentes:</span>
                    </h4>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 text-center">
                      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-amber-800 uppercase block">IPI (TIPI)</span>
                        <strong className="text-base font-mono text-amber-950 block mt-0.5">
                          {resultadoAtual.aliquotaIpiTipiPadrao ?? 0}%
                        </strong>
                        <span className="text-[9px] text-amber-700">Tabela TIPI Oficial</span>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-blue-800 uppercase block">ICMS Referencial</span>
                        <strong className="text-base font-mono text-blue-950 block mt-0.5">
                          {resultadoAtual.aliquotaIcmsPadraoReferencial ?? 18}%
                        </strong>
                        <span className="text-[9px] text-blue-700">Operações Internas</span>
                      </div>

                      <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-indigo-800 uppercase block">PIS Padrão</span>
                        <strong className="text-base font-mono text-indigo-950 block mt-0.5">
                          {resultadoAtual.aliquotaPisPadrao ?? 1.65}%
                        </strong>
                        <span className="text-[9px] text-indigo-700">Não-cumulativo</span>
                      </div>

                      <div className="bg-purple-50 border border-purple-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-purple-800 uppercase block">COFINS Padrão</span>
                        <strong className="text-base font-mono text-purple-950 block mt-0.5">
                          {resultadoAtual.aliquotaCofinsPadrao ?? 7.6}%
                        </strong>
                        <span className="text-[9px] text-purple-700">Não-cumulativo</span>
                      </div>

                      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase block">IBS Transição</span>
                        <strong className="text-base font-mono text-emerald-950 block mt-0.5">
                          {resultadoAtual.aliquotaIbsTransicao ?? 0.1}%
                        </strong>
                        <span className="text-[9px] text-emerald-700">LC nº 214/2025</span>
                      </div>

                      <div className="bg-teal-50 border border-teal-200 rounded-xl p-3">
                        <span className="text-[10px] font-bold text-teal-800 uppercase block">CBS Transição</span>
                        <strong className="text-base font-mono text-teal-950 block mt-0.5">
                          {resultadoAtual.aliquotaCbsTransicao ?? 0.9}%
                        </strong>
                        <span className="text-[9px] text-teal-700">LC nº 214/2025</span>
                      </div>
                    </div>
                  </div>

                  {/* REGIME ESPECIAL E TRATAMENTO ADMINISTRATIVO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-700 block">Regime Tributário Especial / Monofásico:</span>
                      <p className="text-slate-600 leading-relaxed">
                        {resultadoAtual.regimeTributarioEspecial || 'Tributação Normal / Regime Geral'}
                      </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1">
                      <span className="font-bold text-slate-700 block">Tratamento Administrativo Siscomex:</span>
                      <p className="text-slate-600 leading-relaxed">
                        {resultadoAtual.tratamentoAdministrativo || 'Dispensa de Licenciamento prévio (Importação Comum)'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: SINCRONIZAÇÃO EM LOTE DOS DOCUMENTOS FISCAIS */}
          {activeTab === 'lote' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Sincronização em Lote de NCMs dos Documentos Fiscais
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Foram identificados <strong>{ncmsDocumentos.length} códigos de NCM distintos</strong> presentes nos itens das Notas Fiscais importadas na base.
                  </p>
                </div>

                <button
                  onClick={handleSincronizarLote}
                  disabled={sincronizandoLote}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold rounded-lg text-xs transition flex items-center gap-2 shadow-sm shrink-0"
                >
                  <RefreshCw className={`w-4 h-4 ${sincronizandoLote ? 'animate-spin' : ''}`} />
                  <span>{sincronizandoLote ? 'Sincronizando com Siscomex...' : 'Sincronizar Todos os NCMs Agora'}</span>
                </button>
              </div>

              {/* PROGRESSO EM TEMPO REAL */}
              {progressoLote && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-blue-900 font-bold">
                    <span>Sincronizando NCM {progressoLote.ncm} no Siscomex Classif...</span>
                    <span>{progressoLote.atual} de {progressoLote.total}</span>
                  </div>
                  <div className="w-full bg-blue-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full transition-all duration-150"
                      style={{ width: `${(progressoLote.atual / progressoLote.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* LISTAGEM DE NCMS DETECTADOS NAS NOTAS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-slate-100 border-b border-slate-200 text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Códigos NCM Encontrados nos Itens das Notas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Código NCM</th>
                        <th className="p-3">Qtd. de Itens na Base</th>
                        <th className="p-3">Notas Afetadas</th>
                        <th className="p-3">Status Siscomex</th>
                        <th className="p-3 text-right">Ação</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-mono">
                      {ncmsDocumentos.map(item => (
                        <tr key={item.ncm} className="hover:bg-slate-50">
                          <td className="p-3 font-bold text-slate-900">
                            {SiscomexNcmService.formatarNcm(item.ncm)}
                          </td>
                          <td className="p-3 text-slate-700 font-sans">
                            {item.totalItens} item(ns)
                          </td>
                          <td className="p-3 text-slate-600 font-sans">
                            {item.docsIds.length} nota(s)
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              ● VIGENTE
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setBuscaNcm(item.ncm);
                                setActiveTab('consulta');
                                handleConsultarNcm(item.ncm);
                              }}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 font-bold rounded text-[11px] transition"
                            >
                              Ver Detalhes Siscomex
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: CATÁLOGO GERAL SISCOMEX */}
          {activeTab === 'tabela' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-sm">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={filtroTabela}
                    onChange={e => setFiltroTabela(e.target.value)}
                    placeholder="Filtrar por NCM, descrição ou capítulo..."
                    className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:bg-white"
                  />
                </div>

                <a
                  href={SISCOMEX_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition flex items-center gap-1.5 shrink-0"
                >
                  <span>Portal Siscomex Classif</span>
                  <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                </a>
              </div>

              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                      <tr>
                        <th className="p-3">Código NCM</th>
                        <th className="p-3">Descrição Oficial Siscomex</th>
                        <th className="p-3 text-center">IPI TIPI</th>
                        <th className="p-3 text-center">ICMS</th>
                        <th className="p-3 text-center">PIS/COFINS</th>
                        <th className="p-3 text-center">IBS/CBS (LC 214)</th>
                        <th className="p-3 text-right">Consultar</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabelaReferencial.map(item => (
                        <tr key={item.codigoNcm} className="hover:bg-slate-50">
                          <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {item.codigoFormatado}
                          </td>
                          <td className="p-3 text-slate-800 max-w-md">
                            <div className="font-medium line-clamp-2" title={item.descricaoOficial}>
                              {item.descricaoOficial}
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5">{item.capitulo}</div>
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-amber-900 bg-amber-50/40">
                            {item.aliquotaIpiTipiPadrao ?? 0}%
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-blue-900 bg-blue-50/40">
                            {item.aliquotaIcmsPadraoReferencial ?? 18}%
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-purple-900 bg-purple-50/40">
                            {(item.aliquotaPisPadrao ?? 1.65) + (item.aliquotaCofinsPadrao ?? 7.60)}%
                          </td>
                          <td className="p-3 text-center font-mono font-semibold text-emerald-900 bg-emerald-50/40">
                            {(item.aliquotaIbsTransicao ?? 0.1) + (item.aliquotaCbsTransicao ?? 0.9)}%
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => {
                                setBuscaNcm(item.codigoNcm);
                                setActiveTab('consulta');
                                handleConsultarNcm(item.codigoNcm);
                              }}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold rounded text-[11px] transition"
                            >
                              Visualizar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ DO MODAL */}
        <div className="bg-slate-100 border-t border-slate-200 px-6 py-3 flex items-center justify-between text-xs text-slate-600 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              Fonte: Ministério do Desenvolvimento, Indústria, Comércio e Serviços (MDIC) / Receita Federal do Brasil (RFB)
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
