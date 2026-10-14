import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  Building2,
  ShieldCheck,
  Scale,
  Sparkles,
  Copy,
  Check,
  TrendingUp,
  Layers,
  ArrowRight,
  Info,
  Users,
  RefreshCw,
  FileSpreadsheet,
  HelpCircle,
  FileText
} from 'lucide-react';
import { DocumentoFiscal, Empresa, CnaeInfo, CnaeSecao } from '../types/fiscal';
import { CnaeService, SECOES_CNAE_OFICIAIS, CONCLA_PORTAL_URL } from '../services/cnaeService';

interface CnaeConsultationViewProps {
  documentos?: DocumentoFiscal[];
  empresa?: Empresa;
  onAtualizarEmpresa?: (empresaAtualizada: Empresa) => void;
  onNavigate?: (tab: any) => void;
  cnaeInicial?: string;
}

export const CnaeConsultationView: React.FC<CnaeConsultationViewProps> = ({
  documentos = [],
  empresa,
  onAtualizarEmpresa,
  onNavigate,
  cnaeInicial
}) => {
  const [activeTab, setActiveTab] = useState<'consulta' | 'secoes' | 'participantes'>('consulta');
  const [busca, setBusca] = useState<string>(cnaeInicial || '6201-5/01');
  const [loading, setLoading] = useState(false);
  const [cnaeSelecionado, setCnaeSelecionado] = useState<CnaeInfo | null>(null);
  const [resultadosBusca, setResultadosBusca] = useState<CnaeInfo[]>([]);
  const [secaoAtiva, setSecaoAtiva] = useState<CnaeSecao>(SECOES_CNAE_OFICIAIS[9]); // J - Informação e Comunicação
  const [cnaesDaSecao, setCnaesDaSecao] = useState<CnaeInfo[]>([]);
  const [copiadoCode, setCopiadoCode] = useState<string | null>(null);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Inicializa com o CNAE buscado ou inicial
  useEffect(() => {
    handleExecutarBusca(busca || '6201-5/01');
  }, []);

  // Quando a seção ativa muda na aba de árvore
  useEffect(() => {
    const lista = CnaeService.buscarPorSecao(secaoAtiva.codigo);
    setCnaesDaSecao(lista);
  }, [secaoAtiva]);

  const handleExecutarBusca = async (termo: string) => {
    if (!termo || termo.trim().length === 0) return;
    setLoading(true);
    setMensagemSucesso(null);
    try {
      const termoLimpo = CnaeService.limparCnae(termo);

      // Se for um CNPJ (14 dígitos), pesquisa via Receita Federal
      if (termoLimpo.length === 14) {
        const resCnpj = await CnaeService.consultarCnaesPorCnpj(termoLimpo);
        if (resCnpj && resCnpj.cnaePrincipal) {
          setCnaeSelecionado(resCnpj.cnaePrincipal);
          setResultadosBusca(resCnpj.cnaesSecundarios ? [resCnpj.cnaePrincipal, ...resCnpj.cnaesSecundarios] : [resCnpj.cnaePrincipal]);
          setMensagemSucesso(`CNAE obtido com sucesso para a empresa: ${resCnpj.razaoSocial} (${resCnpj.cnpj})`);
          return;
        }
      }

      // Busca na base oficial e API do IBGE
      const info = await CnaeService.consultarCnae(termo);
      if (info) {
        setCnaeSelecionado(info);
      }

      const lista = await CnaeService.buscarCnaes(termo);
      setResultadosBusca(lista);
      if (!info && lista.length > 0) {
        setCnaeSelecionado(lista[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopiar = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCode(texto);
    setTimeout(() => setCopiadoCode(null), 2500);
  };

  const handleAplicarNaEmpresa = (cnae: CnaeInfo) => {
    if (empresa && onAtualizarEmpresa) {
      const novaEmpresa: Empresa = {
        ...empresa,
        cnae: `${cnae.codigo} - ${cnae.descricao}`
      };
      onAtualizarEmpresa(novaEmpresa);
      setMensagemSucesso(`CNAE ${cnae.codigo} configurado com sucesso como CNAE Principal da Empresa Licenciada!`);
      setTimeout(() => setMensagemSucesso(null), 4000);
    }
  };

  // Participantes dos documentos importados (fornecedores e clientes)
  const participantesComCnae = useMemo(() => {
    const mapa = new Map<string, {
      cnpj: string;
      razaoSocial: string;
      uf: string;
      papel: string;
      cnae?: { codigo: string; descricao: string };
      situacao?: string;
      docsQtd: number;
    }>();

    documentos.forEach(doc => {
      // Emitente
      if (doc.emitente && doc.emitente.cnpjCpf) {
        const cnpj = doc.emitente.cnpjCpf;
        const reg = mapa.get(cnpj) || {
          cnpj,
          razaoSocial: doc.emitente.razaoSocial || 'Fornecedor',
          uf: doc.emitente.uf || doc.ufOrigem || 'SP',
          papel: 'Emitente / Fornecedor',
          cnae: doc.emitente.validacaoReceita?.cnaePrincipal,
          situacao: doc.emitente.validacaoReceita?.situacaoCadastral || 'ATIVA',
          docsQtd: 0
        };
        reg.docsQtd += 1;
        if (doc.emitente.validacaoReceita?.cnaePrincipal) {
          reg.cnae = doc.emitente.validacaoReceita.cnaePrincipal;
        }
        mapa.set(cnpj, reg);
      }

      // Destinatário
      if (doc.destinatario && doc.destinatario.cnpjCpf) {
        const cnpj = doc.destinatario.cnpjCpf;
        if (!mapa.has(cnpj)) {
          mapa.set(cnpj, {
            cnpj,
            razaoSocial: doc.destinatario.razaoSocial || 'Destinatário',
            uf: doc.destinatario.uf || doc.ufDestino || 'SP',
            papel: 'Destinatário / Cliente',
            cnae: doc.destinatario.validacaoReceita?.cnaePrincipal,
            situacao: doc.destinatario.validacaoReceita?.situacaoCadastral || 'ATIVA',
            docsQtd: 1
          });
        }
      }
    });

    return Array.from(mapa.values());
  }, [documentos]);

  const chipsRapidos = [
    { cod: '6201-5/01', label: '6201-5/01 Software sob Encomenda' },
    { cod: '6203-1/00', label: '6203-1/00 Software SaaS / Prateleira' },
    { cod: '4649-4/08', label: '4649-4/08 Atacado Higiene/Limpeza' },
    { cod: '4930-2/02', label: '4930-2/02 Transporte Rodoviário CT-e' },
    { cod: '4711-3/02', label: '4711-3/02 Supermercados' },
    { cod: '6920-6/01', label: '6920-6/01 Contabilidade' },
    { cod: '2599-3/99', label: '2599-3/99 Indústria Metalúrgica' },
    { cod: '2121-1/01', label: '2121-1/01 Fármacos / Medicamentos' },
    { cod: '3511-5/01', label: '3511-5/01 Geração Energia NF3e' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-100 overflow-y-auto">
      {/* Top Banner Informativo */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-6 sm:p-8 border-b border-emerald-900/40 shadow-sm shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <FolderTree className="w-3.5 h-3.5" />
              CONCLA / IBGE &bull; Receita Federal do Brasil (CNAE 2.3)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Consulta Nacional de Atividades Econômicas (CNAE)</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
              Consulte instantaneamente a estrutura hierárquica das atividades econômicas brasileiras. Analise o enquadramento no <strong>Simples Nacional (Anexos I a V e Fator R)</strong>, alíquotas previdenciárias de <strong>RAT (1%, 2%, 3%)</strong>, Desoneração da Folha (CPRB) e impactos na <strong>Reforma Tributária (IVA Dual / EC 132/2023)</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={CONCLA_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition border border-emerald-500/40 shadow-xs"
              title="Acessar o portal oficial do CONCLA / IBGE em nova aba"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Portal Oficial CONCLA</span>
            </a>

            {empresa && (
              <div className="px-3.5 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs flex items-center gap-2 text-slate-300">
                <Building2 className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-bold">Empresa Atual</div>
                  <div className="font-bold text-white max-w-[180px] truncate">{empresa.cnae || 'CNAE não configurado'}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Abas de Navegação */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 mt-6 border-b border-emerald-900/60 pb-1">
          <button
            onClick={() => setActiveTab('consulta')}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'consulta'
                ? 'bg-white/10 text-emerald-300 border-emerald-400'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Pesquisa & Detalhes da Atividade</span>
          </button>

          <button
            onClick={() => setActiveTab('secoes')}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'secoes'
                ? 'bg-white/10 text-emerald-300 border-emerald-400'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            <span>Navegador das 21 Seções (Árvore CONCLA)</span>
          </button>

          <button
            onClick={() => setActiveTab('participantes')}
            className={`px-4 py-2 rounded-t-lg font-bold text-xs flex items-center gap-2 transition border-b-2 ${
              activeTab === 'participantes'
                ? 'bg-white/10 text-emerald-300 border-emerald-400'
                : 'text-slate-300 hover:text-white border-transparent'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>CNAEs dos Emitentes & Clientes Importados</span>
            {participantesComCnae.length > 0 && (
              <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-slate-950 font-black">
                {participantesComCnae.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mensagem de Sucesso Temporária */}
      {mensagemSucesso && (
        <div className="max-w-7xl mx-auto w-full px-6 pt-4">
          <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-900 text-xs font-bold flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{mensagemSucesso}</span>
            </div>
            <button onClick={() => setMensagemSucesso(null)} className="text-emerald-700 hover:text-emerald-900 text-xs">
              Dispensar
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <div className="max-w-7xl mx-auto w-full p-6 space-y-6">
        {/* ========================================================= */}
        {/* ABA 1: PESQUISA E DETALHES DO CNAE                       */}
        {/* ========================================================= */}
        {activeTab === 'consulta' && (
          <div className="space-y-6">
            {/* Barra de Pesquisa Avançada */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <form
                onSubmit={e => {
                  e.preventDefault();
                  handleExecutarBusca(busca);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    placeholder="Digite o código CNAE (ex: 6201-5/01), palavra-chave (ex: software, transporte) ou CNPJ da empresa..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 font-semibold text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 transition shadow-xs disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                  <span>Consultar CNAE</span>
                </button>
              </form>

              {/* Chips Rápidos */}
              <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-500 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" /> Exemplos Rápidos:
                </span>
                {chipsRapidos.map(chip => (
                  <button
                    key={chip.cod}
                    type="button"
                    onClick={() => {
                      setBusca(chip.cod);
                      handleExecutarBusca(chip.cod);
                    }}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 rounded-lg text-[11px] font-semibold text-slate-700 transition"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Painel do CNAE Selecionado */}
            {cnaeSelecionado ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna 1 & 2: Dados Oficiais e Notas Explicativas */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Ficha Oficial */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-mono font-black text-sm">
                            {cnaeSelecionado.codigo}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            (ID Limpo: {cnaeSelecionado.codigoLimpo})
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopiar(cnaeSelecionado.codigo)}
                            className="p-1 text-slate-400 hover:text-emerald-600 rounded transition"
                            title="Copiar código CNAE formatado"
                          >
                            {copiadoCode === cnaeSelecionado.codigo ? (
                              <Check className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 mt-2 leading-snug">
                          {cnaeSelecionado.descricao}
                        </h2>
                      </div>

                      <div className="flex items-center gap-2">
                        {empresa && onAtualizarEmpresa && (
                          <button
                            type="button"
                            onClick={() => handleAplicarNaEmpresa(cnaeSelecionado)}
                            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                            title="Definir como CNAE da Empresa Licenciada deste sistema"
                          >
                            <Building2 className="w-3.5 h-3.5" />
                            <span>Vincular à Empresa</span>
                          </button>
                        )}

                        <a
                          href={cnaeSelecionado.urlConclaOficial}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                          title="Abrir página oficial do CONCLA/IBGE para este CNAE"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Página CONCLA</span>
                        </a>
                      </div>
                    </div>

                    {/* Hierarquia CONCLA */}
                    <div className="space-y-2.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-emerald-600" />
                        Estrutura Hierárquica CONCLA / IBGE
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-700">
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0 w-20">Seção:</span>
                          <span className="font-semibold text-slate-800">{cnaeSelecionado.secao}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0 w-20">Divisão:</span>
                          <span className="text-slate-700">{cnaeSelecionado.divisao}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0 w-20">Grupo:</span>
                          <span className="text-slate-700">{cnaeSelecionado.grupo}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0 w-20">Classe:</span>
                          <span className="text-slate-700">{cnaeSelecionado.classe}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <span className="font-bold text-slate-900 shrink-0 w-20">Subclasse:</span>
                          <span className="font-bold text-emerald-800">{cnaeSelecionado.subclasseCodigo} - {cnaeSelecionado.descricao}</span>
                        </div>
                      </div>
                    </div>

                    {/* Notas Explicativas: O que compreende */}
                    {cnaeSelecionado.compreende && cnaeSelecionado.compreende.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Esta subclasse compreende:
                        </h4>
                        <ul className="space-y-1.5 pl-2">
                          {cnaeSelecionado.compreende.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Notas Explicativas: O que NÃO compreende */}
                    {cnaeSelecionado.naoCompreende && cnaeSelecionado.naoCompreende.length > 0 && (
                      <div className="space-y-2 pt-2 border-t border-slate-100">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" />
                          Esta subclasse NÃO compreende:
                        </h4>
                        <ul className="space-y-1.5 pl-2">
                          {cnaeSelecionado.naoCompreende.map((item, idx) => (
                            <li key={idx} className="text-xs text-slate-700 flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                                <span>{item.descricao}</span>
                              </div>
                              {item.cnaeAlternativo && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBusca(item.cnaeAlternativo!);
                                    handleExecutarBusca(item.cnaeAlternativo!);
                                  }}
                                  className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline shrink-0"
                                >
                                  Ver CNAE {item.cnaeAlternativo} &rarr;
                                </button>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Coluna 3: Enquadramento Tributário, Simples Nacional, RAT & Reforma */}
                <div className="space-y-6">
                  {/* Card Simples Nacional */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                      <div className="flex items-center gap-2">
                        <Scale className="w-4 h-4 text-emerald-600" />
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Simples Nacional (LC 123/2006)
                        </h3>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          cnaeSelecionado.simplesNacional.permitido
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {cnaeSelecionado.simplesNacional.permitido ? 'PERMITIDO' : 'VEDADO'}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-500">Anexo Sugerido:</span>
                        <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded font-mono">
                          {cnaeSelecionado.simplesNacional.anexo.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-500">Sujeito ao Fator R:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            cnaeSelecionado.simplesNacional.sujeitoFatorR
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cnaeSelecionado.simplesNacional.sujeitoFatorR ? 'SIM (Folha >= 28%)' : 'NÃO'}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {cnaeSelecionado.simplesNacional.observacao}
                      </p>
                    </div>
                  </div>

                  {/* Card Previdenciário (RAT / Riscos de Trabalho) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-blue-600" />
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          RAT & Previdência Social
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                        {cnaeSelecionado.grauRiscoTrabalho}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-500">Alíquota Base RAT:</span>
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {cnaeSelecionado.aliquotaRat.toFixed(1)}%
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-500">FAP Sugerido:</span>
                        <span className="font-mono font-bold text-slate-700">
                          {cnaeSelecionado.fapSugerido.toFixed(2)}x
                        </span>
                      </div>

                      <div className="flex justify-between items-center py-1 border-b border-slate-50">
                        <span className="text-slate-500">Desoneração CPRB:</span>
                        <span
                          className={`font-bold px-2 py-0.5 rounded ${
                            cnaeSelecionado.desoneracaoFolhaCPRB
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {cnaeSelecionado.desoneracaoFolhaCPRB ? 'Elegível (Lei 12.546)' : 'Não Aplicável'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card Reforma Tributária (IBS / CBS) */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                          Reforma Tributária (IBS/CBS)
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-300">
                        {cnaeSelecionado.reformaTributaria.regimeIbsCbs}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100 leading-relaxed">
                      {cnaeSelecionado.reformaTributaria.descricao}
                    </p>
                  </div>

                  {/* Card Obrigações Acessórias */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                    <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-slate-600" />
                      Obrigações Acessórias Vinculadas
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {cnaeSelecionado.obrigacoesAcessorias.map((obrig, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-slate-100 text-slate-700 border border-slate-200 rounded-md text-[10px] font-bold"
                        >
                          {obrig}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <Search className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">Nenhum CNAE encontrado</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Tente buscar por outro código de atividade, termo textual (como "transporte", "software", "comércio") ou pelo CNPJ completo da empresa.
                </p>
              </div>
            )}

            {/* Lista de Outros Resultados Encontrados */}
            {resultadosBusca.length > 1 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
                  <span>Outras Atividades Econômicas Relacionadas ({resultadosBusca.length})</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {resultadosBusca.map(item => (
                    <button
                      key={item.codigoLimpo}
                      onClick={() => {
                        setCnaeSelecionado(item);
                        setBusca(item.codigo);
                      }}
                      className={`p-3.5 rounded-xl border text-left transition flex items-start justify-between gap-3 ${
                        cnaeSelecionado?.codigoLimpo === item.codigoLimpo
                          ? 'bg-emerald-50 border-emerald-400 shadow-2xs'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                            {item.codigo}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold uppercase">
                            {item.secaoCodigo}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-900 line-clamp-2">
                          {item.descricao}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          RAT: {item.aliquotaRat}% &bull; Simples: {item.simplesNacional.anexo.replace('_', ' ')}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 2: NAVEGADOR DAS 21 SEÇÕES CONCLA                      */}
        {/* ========================================================= */}
        {activeTab === 'secoes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista das 21 Seções */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2">
                <FolderTree className="w-4 h-4 text-emerald-600" />
                21 Seções CONCLA / IBGE
              </h3>
              <div className="space-y-1 max-h-[600px] overflow-y-auto pr-1">
                {SECOES_CNAE_OFICIAIS.map(sec => (
                  <button
                    key={sec.codigo}
                    onClick={() => setSecaoAtiva(sec)}
                    className={`w-full p-2.5 rounded-xl text-left transition flex items-start gap-2.5 ${
                      secaoAtiva.codigo === sec.codigo
                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-black text-xs shrink-0 ${
                        secaoAtiva.codigo === sec.codigo
                          ? 'bg-white text-emerald-800'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {sec.codigo}
                    </span>
                    <div className="text-xs line-clamp-2 leading-snug">
                      {sec.titulo}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Atividades da Seção Selecionada */}
            <div className="lg:col-span-2 space-y-5">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                <div className="flex items-center gap-3 border-b pb-3 border-slate-100">
                  <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-mono font-black text-base">
                    {secaoAtiva.codigo}
                  </span>
                  <div>
                    <h3 className="font-black text-slate-900 text-sm">
                      Seção {secaoAtiva.codigo} &bull; {secaoAtiva.titulo}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Divisões compreendidas: {secaoAtiva.divisaoDe} a {secaoAtiva.divisaoAte}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {secaoAtiva.descricaoDetalhada}
                </p>
              </div>

              {/* Subclasses Encontradas */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                  Atividades em Destaque da Seção {secaoAtiva.codigo} ({cnaesDaSecao.length})
                </h4>

                {cnaesDaSecao.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {cnaesDaSecao.map(item => (
                      <div
                        key={item.codigoLimpo}
                        className="p-4 bg-slate-50 hover:bg-emerald-50/50 rounded-xl border border-slate-200 hover:border-emerald-300 transition space-y-2 flex flex-col justify-between"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-mono font-bold text-xs text-emerald-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                              {item.codigo}
                            </span>
                            <span className="text-[10px] font-bold text-slate-500">
                              RAT: {item.aliquotaRat}%
                            </span>
                          </div>
                          <div className="text-xs font-bold text-slate-900">
                            {item.descricao}
                          </div>
                          <div className="text-[11px] text-slate-500 line-clamp-1">
                            {item.classe}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                          <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                            {item.simplesNacional.anexo.replace('_', ' ')}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setCnaeSelecionado(item);
                              setBusca(item.codigo);
                              setActiveTab('consulta');
                            }}
                            className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                          >
                            <span>Ver Detalhes</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500">
                    <p>Nenhuma atividade pré-cadastrada nesta seção.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setBusca(`Divisão ${secaoAtiva.divisaoDe}`);
                        setActiveTab('consulta');
                        handleExecutarBusca(secaoAtiva.divisaoDe);
                      }}
                      className="mt-2 text-emerald-600 font-bold hover:underline"
                    >
                      Consultar subclasses da Divisão {secaoAtiva.divisaoDe} na API &rarr;
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* ABA 3: CNAEs DOS PARTICIPANTES IMPORTADOS                  */}
        {/* ========================================================= */}
        {activeTab === 'participantes' && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4 border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  CNAE dos Fornecedores e Clientes dos Documentos Fiscais
                </h3>
                <p className="text-xs text-slate-500">
                  Cruzamento cadastral entre a atividade econômica registrada na Receita Federal e as operações fiscais emitidas
                </p>
              </div>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => onNavigate('documentos')}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-bold flex items-center gap-2 transition"
                >
                  <FileSpreadsheet className="w-4 h-4 text-slate-600" />
                  <span>Ver Documentos Fiscais</span>
                </button>
              )}
            </div>

            {participantesComCnae.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
                      <th className="py-2.5 px-3">Papel</th>
                      <th className="py-2.5 px-3">CNPJ / CPF</th>
                      <th className="py-2.5 px-3">Razão Social / Nome</th>
                      <th className="py-2.5 px-3">UF</th>
                      <th className="py-2.5 px-3">CNAE Principal</th>
                      <th className="py-2.5 px-3">Situação RFB</th>
                      <th className="py-2.5 px-3 text-right">Notas</th>
                      <th className="py-2.5 px-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {participantesComCnae.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition">
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                            {p.papel}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">
                          {p.cnpj}
                        </td>
                        <td className="py-2.5 px-3 font-semibold text-slate-800 max-w-[220px] truncate" title={p.razaoSocial}>
                          {p.razaoSocial}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-slate-700">
                          {p.uf}
                        </td>
                        <td className="py-2.5 px-3">
                          {p.cnae ? (
                            <div className="space-y-0.5">
                              <span className="font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                {p.cnae.codigo}
                              </span>
                              <div className="text-[10px] text-slate-500 truncate max-w-[220px]" title={p.cnae.descricao}>
                                {p.cnae.descricao}
                              </div>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-700 italic">
                              CNAE não consultado
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.situacao === 'ATIVA'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {p.situacao}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800">
                          {p.docsQtd}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              if (p.cnae?.codigo) {
                                setBusca(p.cnae.codigo);
                                handleExecutarBusca(p.cnae.codigo);
                              } else {
                                setBusca(p.cnpj);
                                handleExecutarBusca(p.cnpj);
                              }
                              setActiveTab('consulta');
                            }}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-[11px] font-bold transition"
                            title="Consultar CNAE deste participante no CONCLA"
                          >
                            Consultar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500">
                Nenhum participante encontrado nos documentos atuais. Importe XMLs de NF-e, CT-e ou NFCom para cruzar os dados com os CNAEs da Receita Federal.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
