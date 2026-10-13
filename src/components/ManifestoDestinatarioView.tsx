import React, { useState, useMemo } from 'react';
import {
  DocumentoFiscal,
  Empresa,
  EventoManifestacaoDestinatario,
  TipoEventoManifesto,
  RegistroTrilhaAuditoria
} from '../types/fiscal';
import {
  FileCheck2,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Clock,
  AlertTriangle,
  FileText,
  Search,
  Filter,
  Printer,
  ChevronRight,
  Send,
  Building2,
  Lock,
  Globe,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

interface ManifestoDestinatarioViewProps {
  documentos: DocumentoFiscal[];
  setDocumentos: React.Dispatch<React.SetStateAction<DocumentoFiscal[]>>;
  selectedDocId: string | null;
  setSelectedDocId: (id: string | null) => void;
  empresa: Empresa;
  onAddAuditLog: (
    operacao: RegistroTrilhaAuditoria['operacao'],
    docId: string,
    chave: string,
    justificativa: string,
    campoAlterado?: string,
    de?: string,
    para?: string
  ) => void;
}

export const ManifestoDestinatarioView: React.FC<ManifestoDestinatarioViewProps> = ({
  documentos,
  setDocumentos,
  selectedDocId,
  setSelectedDocId,
  empresa,
  onAddAuditLog
}) => {
  const [busca, setBusca] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<'TODOS' | 'PENDENTES' | 'CONFIRMADOS' | 'CIENCIA' | 'RECUSADOS'>('TODOS');
  const [copiado, setCopiado] = useState(false);
  const [tipoEventoSelecionado, setTipoEventoSelecionado] = useState<TipoEventoManifesto>('210200');
  const [protocoloSefazInput, setProtocoloSefazInput] = useState('');
  const [justificativaInput, setJustificativaInput] = useState('');
  const [comprovanteModalDoc, setComprovanteModalDoc] = useState<DocumentoFiscal | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);

  // Documento atualmente selecionado
  const docAtivo = useMemo(() => {
    if (!documentos.length) return null;
    return documentos.find(d => d.id === selectedDocId) || documentos[0];
  }, [documentos, selectedDocId]);

  // URLs oficiais da Fazenda
  const URL_PORTAL_PRINCIPAL = 'https://www.nfe.fazenda.gov.br/portal/principal.aspx';
  const URL_PORTAL_MANIFESTACAO = 'https://www.nfe.fazenda.gov.br/portal/manifestacaoDestinatario.aspx';

  // Métricas da carteira
  const metricas = useMemo(() => {
    let confirmadas = 0;
    let ciencia = 0;
    let recusadas = 0;
    let pendentes = 0;

    documentos.forEach(d => {
      const ev = d.manifestacaoDestinatario;
      if (!ev) {
        pendentes++;
      } else if (ev.tipoEvento === '210200') {
        confirmadas++;
      } else if (ev.tipoEvento === '210210') {
        ciencia++;
      } else if (ev.tipoEvento === '210220' || ev.tipoEvento === '210240') {
        recusadas++;
      }
    });

    return {
      total: documentos.length,
      confirmadas,
      ciencia,
      recusadas,
      pendentes
    };
  }, [documentos]);

  // Filtro de documentos
  const documentosFiltrados = useMemo(() => {
    return documentos.filter(doc => {
      // Filtro de texto
      const termo = busca.toLowerCase();
      const matchBusca =
        !termo ||
        doc.chaveAcesso.toLowerCase().includes(termo) ||
        doc.numero.toLowerCase().includes(termo) ||
        doc.emitente.razaoSocial.toLowerCase().includes(termo) ||
        doc.emitente.cnpj.includes(termo);

      if (!matchBusca) return false;

      const ev = doc.manifestacaoDestinatario;
      if (filtroStatus === 'PENDENTES') return !ev;
      if (filtroStatus === 'CONFIRMADOS') return ev?.tipoEvento === '210200';
      if (filtroStatus === 'CIENCIA') return ev?.tipoEvento === '210210';
      if (filtroStatus === 'RECUSADOS') return ev?.tipoEvento === '210220' || ev?.tipoEvento === '210240';

      return true;
    });
  }, [documentos, busca, filtroStatus]);

  // Copiar chave de acesso
  const handleCopiarChave = (chave: string) => {
    navigator.clipboard.writeText(chave);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  // Abrir Portal Nacional com cópia prévia
  const handleAbrirPortalSefaz = (urlDestino: string) => {
    if (docAtivo) {
      handleCopiarChave(docAtivo.chaveAcesso);
    }
    window.open(urlDestino, '_blank', 'noopener,noreferrer');
  };

  // Gerar protocolo simulado para homologação se o usuário não tiver gerado ainda
  const handleGerarProtocoloSimulado = () => {
    const anoAtual = new Date().getFullYear();
    const sequencial = Math.floor(1000000000 + Math.random() * 9000000000);
    const prot = `135${anoAtual}${sequencial}`;
    setProtocoloSefazInput(prot);
  };

  // Gravar manifestação no documento
  const handleSalvarManifestacao = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docAtivo) return;

    if (tipoEventoSelecionado === '210240' && justificativaInput.trim().length < 15) {
      alert('Para o evento de Operação não Realizada (210240), a SEFAZ exige uma justificativa de no mínimo 15 caracteres.');
      return;
    }

    const descricoes: Record<TipoEventoManifesto, string> = {
      '210200': 'Confirmação da Operação',
      '210210': 'Ciência da Emissão',
      '210220': 'Desconhecimento da Operação',
      '210240': 'Operação não Realizada'
    };

    const protocolofinal = protocoloSefazInput.trim() || `1352600${Math.floor(10000000 + Math.random() * 90000000)}`;

    const novoEvento: EventoManifestacaoDestinatario = {
      tipoEvento: tipoEventoSelecionado,
      descricaoEvento: descricoes[tipoEventoSelecionado],
      dataHoraEvento: new Date().toISOString(),
      protocoloSefaz: protocolofinal,
      justificativa: justificativaInput.trim() || undefined,
      responsavel: 'Roberto Pereira de Oliveira',
      statusSefaz: 'REGISTRADO',
      origemAcesso: 'PORTAL_NACIONAL_NFE'
    };

    const atualizados = documentos.map(d => {
      if (d.id === docAtivo.id) {
        return {
          ...d,
          manifestacaoDestinatario: novoEvento
        };
      }
      return d;
    });

    setDocumentos(atualizados);

    // Registra na Trilha de Auditoria
    onAddAuditLog(
      'MANIFESTO_DESTINATARIO',
      docAtivo.id,
      docAtivo.chaveAcesso,
      `Manifestação do Destinatário registrada: ${descricoes[tipoEventoSelecionado]} (Protocolo SEFAZ: ${protocolofinal}) via Portal Nacional da NF-e por Roberto Pereira de Oliveira.`,
      'manifestacaoDestinatario',
      docAtivo.manifestacaoDestinatario?.descricaoEvento || 'NENHUMA',
      descricoes[tipoEventoSelecionado]
    );

    setSucessoMensagem(`Manifestação "${descricoes[tipoEventoSelecionado]}" vinculada com sucesso! Protocolo SEFAZ: ${protocolofinal}`);
    setProtocoloSefazInput('');
    setJustificativaInput('');
    setTimeout(() => setSucessoMensagem(null), 5000);
  };

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDataHora = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  };

  return (
    <div id="manifesto-destinatario-view" className="space-y-6 text-slate-800 pb-16">
      {/* Header com Identidade SEFAZ & Portal da Fazenda */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl border border-slate-700/60 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-emerald-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Globe className="w-3.5 h-3.5" />
              SEFAZ Nacional • Eventos DF-e (MD-e)
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
              <span>Manifestação do Destinatário</span>
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Realize os 4 eventos regulamentados da NF-e perante a Secretaria da Fazenda Nacional através do Portal Oficial da NF-e (
              <span className="text-emerald-300 font-mono">nfe.fazenda.gov.br</span>) com Certificado Digital ICP-Brasil da <strong>{empresa?.nomeFantasia || empresa?.razaoSocial || 'sua empresa'}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Botão de Acesso ao Portal Principal da Fazenda solicitado pelo usuário */}
            <button
              id="btn-abrir-portal-fazenda-principal"
              onClick={() => handleAbrirPortalSefaz(URL_PORTAL_PRINCIPAL)}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md border border-emerald-400/40"
              title="Acessar o Portal da Nota Fiscal Eletrônica: https://www.nfe.fazenda.gov.br/portal/principal.aspx"
            >
              <Globe className="w-4 h-4 text-emerald-200" />
              <span>Acessar Portal da Fazenda (SEFAZ)</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>

            <button
              id="btn-abrir-portal-servico-manifestacao"
              onClick={() => handleAbrirPortalSefaz(URL_PORTAL_MANIFESTACAO)}
              className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-semibold rounded-xl text-xs flex items-center gap-2 transition border border-slate-600 shadow-xs"
              title="Acessar diretamente o serviço de Manifestação do Destinatário"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>Serviço de Manifestação Direta</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Notificação / Feedback de Chave Copiada */}
        {docAtivo && (
          <div className="mt-5 pt-4 border-t border-slate-700/70 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="font-semibold text-slate-400">NF-e Ativa para Manifestação:</span>
              <span className="font-bold text-white">NF-e nº {docAtivo.numero}</span>
              <span className="text-slate-400">({docAtivo.emitente.razaoSocial})</span>
            </div>

            <button
              onClick={() => handleCopiarChave(docAtivo.chaveAcesso)}
              className={`px-3 py-1.5 rounded-lg font-mono text-[11px] font-bold flex items-center gap-1.5 transition ${
                copiado
                  ? 'bg-emerald-500 text-white animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-slate-600'
              }`}
            >
              {copiado ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Chave de 44 dígitos Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copiar Chave para colar na SEFAZ: {docAtivo.chaveAcesso.slice(0, 12)}...{docAtivo.chaveAcesso.slice(-6)}</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Alerta de Sucesso */}
      {sucessoMensagem && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-xs animate-fadeIn">
          <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{sucessoMensagem}</span>
        </div>
      )}

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total de Notas</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{metricas.total}</div>
          <div className="text-[10px] text-slate-400 mt-1">Empresa Destinatária</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            Confirmadas (210200)
          </div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{metricas.confirmadas}</div>
          <div className="text-[10px] text-emerald-600 mt-1">Operação Concluída</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Ciência Registrada (210210)
          </div>
          <div className="text-2xl font-black text-blue-800 mt-1">{metricas.ciencia}</div>
          <div className="text-[10px] text-blue-600 mt-1">XML Liberado p/ Download</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            Recusadas / Sinistro
          </div>
          <div className="text-2xl font-black text-rose-800 mt-1">{metricas.recusadas}</div>
          <div className="text-[10px] text-rose-600 mt-1">210220 / 210240</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-2xs col-span-2 sm:col-span-1">
          <div className="text-[11px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3 h-3 text-amber-600" />
            Pendentes de Ação
          </div>
          <div className="text-2xl font-black text-amber-800 mt-1">{metricas.pendentes}</div>
          <div className="text-[10px] text-amber-600 mt-1">Aguardando Manifestação</div>
        </div>
      </div>

      {/* Grid Principal: Lista à Esquerda e Assistente / Registro à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Esquerda: Lista de Notas Fiscais (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-200 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>Documentos Fiscais da Carteira</span>
              </div>
              <span className="text-xs text-slate-500 font-semibold">{documentosFiltrados.length} notas</span>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por NF-e, emitente ou chave..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-white text-slate-800 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500 transition"
              />
            </div>

            {/* Filtros de Status */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              {(
                [
                  { id: 'TODOS', label: 'Todas' },
                  { id: 'PENDENTES', label: 'Pendentes' },
                  { id: 'CONFIRMADOS', label: 'Confirmadas' },
                  { id: 'CIENCIA', label: 'Ciência' },
                  { id: 'RECUSADOS', label: 'Recusadas' }
                ] as const
              ).map(f => (
                <button
                  key={f.id}
                  onClick={() => setFiltroStatus(f.id)}
                  className={`px-2.5 py-1 rounded-md font-semibold whitespace-nowrap transition ${
                    filtroStatus === f.id
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Lista com Rolagem */}
          <div className="max-h-[620px] overflow-y-auto divide-y divide-slate-100">
            {documentosFiltrados.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhum documento encontrado com os filtros atuais.
              </div>
            ) : (
              documentosFiltrados.map(doc => {
                const isSelected = doc.id === docAtivo?.id;
                const ev = doc.manifestacaoDestinatario;

                return (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-emerald-50/70 border-l-4 border-emerald-600'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-slate-900">NF-e {doc.numero}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Série {doc.serie}</span>
                        {ev ? (
                          <span
                            className={`px-2 py-0.5 text-[9px] font-bold rounded-full border ${
                              ev.tipoEvento === '210200'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : ev.tipoEvento === '210210'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {ev.tipoEvento === '210200' && 'CONFIRMADA'}
                            {ev.tipoEvento === '210210' && 'CIÊNCIA'}
                            {ev.tipoEvento === '210220' && 'DESCONHECIDA'}
                            {ev.tipoEvento === '210240' && 'RECUSADA'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                            PENDENTE
                          </span>
                        )}
                      </div>

                      <div className="font-medium text-xs text-slate-700 truncate">
                        {doc.emitente.razaoSocial}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-3">
                        <span>Emissão: {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}</span>
                        <span className="font-semibold text-slate-800">{formatMoeda(doc.valorTotalDocumento)}</span>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 flex-shrink-0 transition ${isSelected ? 'text-emerald-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Coluna Direita: Assistente de Operação com o Portal SEFAZ (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {docAtivo ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
              {/* Topo do Documento Selecionado */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Documento em Foco para Manifestação
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900 mt-0.5 flex items-center gap-2">
                    <span>NF-e nº {docAtivo.numero} • Série {docAtivo.serie}</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Emitente: <strong>{docAtivo.emitente.razaoSocial}</strong> (CNPJ: {docAtivo.emitente.cnpj})
                  </p>
                </div>

                <div className="text-right sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
                  <div className="text-[11px] text-slate-400">Valor Total</div>
                  <div className="text-base font-black text-slate-900">{formatMoeda(docAtivo.valorTotalDocumento)}</div>
                </div>
              </div>

              {/* Status Atual da Manifestação no Documento */}
              <div className="p-4 rounded-xl border bg-slate-50/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Situação do Manifesto perante a SEFAZ</span>
                  </div>
                  {docAtivo.manifestacaoDestinatario && (
                    <button
                      type="button"
                      onClick={() => setComprovanteModalDoc(docAtivo)}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      Visualizar Comprovante Oficial
                    </button>
                  )}
                </div>

                {docAtivo.manifestacaoDestinatario ? (
                  <div className="bg-white p-3.5 rounded-lg border border-emerald-200 space-y-2 text-xs">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-emerald-900 text-sm">
                        {docAtivo.manifestacaoDestinatario.descricaoEvento} ({docAtivo.manifestacaoDestinatario.tipoEvento})
                      </span>
                      <span className="px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-mono text-[11px] font-bold">
                        Protocolo: {docAtivo.manifestacaoDestinatario.protocoloSefaz || 'Registrado no Portal'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-600 text-[11px] pt-1">
                      <div>
                        <strong>Data/Hora do Evento:</strong> {formatDataHora(docAtivo.manifestacaoDestinatario.dataHoraEvento)}
                      </div>
                      <div>
                        <strong>Responsável:</strong> {docAtivo.manifestacaoDestinatario.responsavel}
                      </div>
                      <div className="sm:col-span-2">
                        <strong>Origem do Registro:</strong> Portal Nacional da NF-e (SEFAZ - www.nfe.fazenda.gov.br)
                      </div>
                      {docAtivo.manifestacaoDestinatario.justificativa && (
                        <div className="sm:col-span-2 p-2 bg-slate-50 rounded border border-slate-200 text-slate-700">
                          <strong>Justificativa Formal:</strong> {docAtivo.manifestacaoDestinatario.justificativa}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-700 flex-shrink-0" />
                    <span>
                      Esta nota fiscal ainda <strong>não possui manifesto registrado</strong> perante a SEFAZ. Siga o roteiro abaixo para manifestar no Portal Nacional da Fazenda.
                    </span>
                  </div>
                )}
              </div>

              {/* Passo a Passo Oficial com o Portal Nacional da Fazenda */}
              <div className="space-y-4">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-emerald-400 inline-flex items-center justify-center text-[10px]">
                    1
                  </span>
                  <span>Chave de Acesso da NF-e (44 dígitos)</span>
                </div>

                <div className="p-3.5 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 font-mono text-xs">
                  <div className="break-all tracking-wider text-emerald-300 font-bold">
                    {docAtivo.chaveAcesso}
                  </div>
                  <button
                    onClick={() => handleCopiarChave(docAtivo.chaveAcesso)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-sans font-bold flex items-center gap-1.5 transition flex-shrink-0 ${
                      copiado
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    }`}
                  >
                    {copiado ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiado ? 'Copiada!' : 'Copiar Chave'}</span>
                  </button>
                </div>
              </div>

              {/* Passo 2: Acesso ao Portal da Fazenda */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-emerald-400 inline-flex items-center justify-center text-[10px]">
                    2
                  </span>
                  <span>Acesso ao Portal Oficial da Fazenda (SEFAZ)</span>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 text-xs text-slate-600 leading-relaxed">
                  <p>
                    Por diretrizes de segurança da SEFAZ e uso obrigatório de Certificado Digital ICP-Brasil (A1 ou A3 da empresa adquirente), o portal governamental deve ser acessado no navegador:
                  </p>
                  <ol className="list-decimal pl-5 space-y-1.5 text-slate-700">
                    <li>Clique no botão abaixo para abrir o <strong>Portal Nacional da NF-e</strong> em nova aba.</li>
                    <li>No menu superior da Fazenda, acesse <strong>Serviços ➔ Manifestação do Destinatário</strong>.</li>
                    <li>Autentique com o <strong>Certificado Digital da Empresa</strong> e cole a Chave de Acesso (já copiada para sua área de transferência).</li>
                    <li>Selecione o evento desejado e copie o <strong>Protocolo de Autorização do Evento</strong> emitido pela SEFAZ.</li>
                  </ol>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => handleAbrirPortalSefaz(URL_PORTAL_PRINCIPAL)}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs flex items-center gap-2 transition shadow-xs"
                    >
                      <Globe className="w-4 h-4 text-emerald-200" />
                      <span>Abrir Portal Nacional (nfe.fazenda.gov.br)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleAbrirPortalSefaz(URL_PORTAL_MANIFESTACAO)}
                      className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-lg text-xs flex items-center gap-2 transition"
                    >
                      <FileCheck2 className="w-4 h-4 text-emerald-600" />
                      <span>Acesso Direto à Manifestação</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Passo 3: Registrar o Protocolo retornado no APP */}
              <form onSubmit={handleSalvarManifestacao} className="space-y-4 pt-2 border-t border-slate-200">
                <div className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-emerald-400 inline-flex items-center justify-center text-[10px]">
                    3
                  </span>
                  <span>Registrar Protocolo SEFAZ na Base & Trilha Fiscal</span>
                </div>

                {/* Seleção do Evento Oficial */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700">Selecione o Evento Manifestado:</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        tipoEventoSelecionado === '210200'
                          ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEvento"
                        value="210200"
                        checked={tipoEventoSelecionado === '210200'}
                        onChange={() => setTipoEventoSelecionado('210200')}
                        className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                      />
                      <div>
                        <div>Confirmação da Operação (210200)</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                          Atesta o recebimento físico da mercadoria na empresa. Impede o emitente de cancelar a nota.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        tipoEventoSelecionado === '210210'
                          ? 'bg-blue-50/80 border-blue-500 text-blue-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEvento"
                        value="210210"
                        checked={tipoEventoSelecionado === '210210'}
                        onChange={() => setTipoEventoSelecionado('210210')}
                        className="mt-0.5 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div>Ciência da Emissão (210210)</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                          Declara ciência da nota contra o CNPJ da empresa, liberando download do XML completo na SEFAZ.
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        tipoEventoSelecionado === '210220'
                          ? 'bg-amber-50/80 border-amber-500 text-amber-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEvento"
                        value="210220"
                        checked={tipoEventoSelecionado === '210220'}
                        onChange={() => setTipoEventoSelecionado('210220')}
                        className="mt-0.5 text-amber-600 focus:ring-amber-500"
                      />
                      <div>
                        <div>Desconhecimento da Operação (210220)</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                          Informa que a empresa não solicitou nem realizou esta operação comercial (proteção contra fraudes).
                        </div>
                      </div>
                    </label>

                    <label
                      className={`p-3 rounded-xl border flex items-start gap-2.5 cursor-pointer transition ${
                        tipoEventoSelecionado === '210240'
                          ? 'bg-rose-50/80 border-rose-500 text-rose-950 font-bold shadow-2xs'
                          : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipoEvento"
                        value="210240"
                        checked={tipoEventoSelecionado === '210240'}
                        onChange={() => setTipoEventoSelecionado('210240')}
                        className="mt-0.5 text-rose-600 focus:ring-rose-500"
                      />
                      <div>
                        <div>Operação não Realizada (210240)</div>
                        <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                          A mercadoria foi devolvida, avariada ou não entregue pelo fornecedor. Exige justificativa legal.
                        </div>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Justificativa caso seja Operação Não Realizada */}
                {tipoEventoSelecionado === '210240' && (
                  <div className="space-y-1.5 animate-fadeIn">
                    <label className="text-xs font-bold text-rose-900">
                      Justificativa Legal Obrigatória perante a SEFAZ (mínimo 15 caracteres):
                    </label>
                    <textarea
                      rows={2}
                      required
                      minLength={15}
                      placeholder="Ex: Mercadoria recusada na portaria da Unidade Resende devido a não conformidade de especificações técnicas."
                      value={justificativaInput}
                      onChange={e => setJustificativaInput(e.target.value)}
                      className="w-full p-2.5 text-xs bg-white rounded-xl border border-rose-300 focus:border-rose-500 focus:outline-none"
                    />
                  </div>
                )}

                {/* Campo de Protocolo e Responsável */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-700">Protocolo SEFAZ do Evento:</label>
                      <button
                        type="button"
                        onClick={handleGerarProtocoloSimulado}
                        className="text-[10px] text-emerald-700 hover:text-emerald-800 underline font-semibold"
                        title="Gerar protocolo fictício para teste"
                      >
                        Gerar Protocolo Simulado
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Ex: 135260019283741"
                      value={protocoloSefazInput}
                      onChange={e => setProtocoloSefazInput(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 text-slate-900 font-mono text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Auditor / Responsável Técnico:</label>
                    <input
                      type="text"
                      readOnly
                      value="Roberto Pereira de Oliveira"
                      className="w-full px-3 py-2 bg-slate-100 text-slate-700 font-semibold text-xs rounded-lg border border-slate-200 cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Botão de Gravar */}
                <div className="pt-2 flex items-center justify-between gap-3">
                  <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gravação auditável com carimbo de data/hora e hash SHA-256</span>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center gap-2 transition shadow-md"
                  >
                    <Send className="w-4 h-4 text-emerald-200" />
                    <span>Salvar Manifestação no Documento</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400 text-xs">
              Nenhuma nota fiscal selecionada para manifestação.
            </div>
          )}
        </div>
      </div>

      {/* Orientações Normativas e Prazos Oficiais da SEFAZ */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-3 border-b pb-3">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-emerald-400 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Prazos e Normas Regulamentares da Manifestação (MD-e)</h3>
            <p className="text-xs text-slate-500">Regras estabelecidas pelo Ajuste SINIEF 07/2005 e Portarias da Secretaria da Fazenda.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">Ciência da Emissão</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Deve ser feita assim que a nota for emitida. Libera o XML oficial e autoriza a circulação sem que configure confirmação definitiva.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">Prazo de Confirmação</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Até <strong>30 dias</strong> após a Ciência da Emissão para operações internas, ou até <strong>180 dias</strong> da data de emissão para confirmação final.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">Proteção contra Fraudes</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Ao registrar <em>Desconhecimento da Operação</em>, a empresa se exime formalmente de qualquer passivo tributário relativo a notas frias emitidas indevidamente.
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
            <div className="font-bold text-slate-900">Bloqueio de Cancelamento</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Assim que a empresa registra a <em>Confirmação da Operação</em>, o emitente fica tecnicamente bloqueado pela SEFAZ de cancelar a NF-e.
            </p>
          </div>
        </div>
      </div>

      {/* Modal de Impressão de Comprovante Oficial do Evento SEFAZ */}
      {comprovanteModalDoc && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scaleUp">
            {/* Topo do Comprovante */}
            <div className="border-b pb-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <FileCheck2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Certidão de Registro de Evento - SEFAZ
                  </h3>
                  <div className="text-xs text-slate-500">
                    Comprovante Oficial de Manifestação do Destinatário (MD-e)
                  </div>
                </div>
              </div>

              <button
                onClick={() => setComprovanteModalDoc(null)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Corpo do Comprovante */}
            <div className="space-y-4 text-xs font-sans">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-slate-700">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Órgão Receptor:</span>
                    <strong>Ambiente Nacional - SEFAZ / Receita Federal</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Protocolo de Autorização:</span>
                    <strong className="font-mono text-emerald-800 text-sm">
                      {comprovanteModalDoc.manifestacaoDestinatario?.protocoloSefaz || '135260012345678'}
                    </strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Evento Registrado:</span>
                    <strong className="text-emerald-900">
                      {comprovanteModalDoc.manifestacaoDestinatario?.descricaoEvento} (código {comprovanteModalDoc.manifestacaoDestinatario?.tipoEvento})
                    </strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Data/Hora do Registro:</span>
                    <strong>
                      {comprovanteModalDoc.manifestacaoDestinatario && formatDataHora(comprovanteModalDoc.manifestacaoDestinatario.dataHoraEvento)}
                    </strong>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Chave de Acesso da NF-e:</span>
                  <span className="font-mono text-[11px] font-bold text-slate-900 break-all">
                    {comprovanteModalDoc.chaveAcesso}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-slate-700 pt-2 border-t border-slate-200">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Destinatário:</span>
                    <strong>{empresa.razaoSocial}</strong>
                    <div className="text-[10px] text-slate-500">CNPJ: {empresa.cnpj}</div>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Emitente da NF-e:</span>
                    <strong>{comprovanteModalDoc.emitente.razaoSocial}</strong>
                    <div className="text-[10px] text-slate-500">CNPJ: {comprovanteModalDoc.emitente.cnpj}</div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Responsável Técnico pelo Registro:</span>
                  <strong className="text-slate-900">Roberto Pereira de Oliveira</strong>
                </div>
              </div>
            </div>

            {/* Ações do Modal */}
            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-slate-400">
                Documento gerado com autenticação digital para guarda fiscal (prazo legal de 5 anos).
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Imprimir Comprovante</span>
                </button>

                <button
                  onClick={() => setComprovanteModalDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
