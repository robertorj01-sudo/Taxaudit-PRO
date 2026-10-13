import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  RefreshCw,
  Building2,
  UserCheck,
  AlertOctagon,
  CheckCircle2,
  X,
  ExternalLink,
  FileWarning,
  Scale,
  BadgeAlert,
  Sparkles,
  Check
} from 'lucide-react';
import {
  ConsultaCadastralReceita,
  DocumentoFiscal,
  Empresa,
  SituacaoCadastralRFB
} from '../types/fiscal';
import { ReceitaFederalService } from '../services/receitaFederalService';
import { TaxRuleEngine } from '../services/taxRuleEngine';

interface ReceitaFederalValidatorModalProps {
  empresa: Empresa;
  documentos: DocumentoFiscal[];
  onUpdateDocumentos: (novosDocs: DocumentoFiscal[]) => void;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
  onClose: () => void;
  initialCnpjCpf?: string;
}

export const ReceitaFederalValidatorModal: React.FC<ReceitaFederalValidatorModalProps> = ({
  empresa,
  documentos,
  onUpdateDocumentos,
  onAddAuditLog,
  onClose,
  initialCnpjCpf
}) => {
  const [activeTab, setActiveTab] = useState<'consulta' | 'lote'>('consulta');
  const [inputDoc, setInputDoc] = useState<string>(initialCnpjCpf || '45.842.670/0001-50');
  const [consultando, setConsultando] = useState(false);
  const [varrendoLote, setVarrendoLote] = useState(false);
  const [progressoLote, setProgressoLote] = useState<{ atual: number; total: number } | null>(null);
  const [resultadoAtual, setResultadoAtual] = useState<ConsultaCadastralReceita>(() =>
    ReceitaFederalService.consultarSincrono(initialCnpjCpf || '45842670000150')
  );
  const [mensagemFeedback, setMensagemFeedback] = useState<string | null>(null);

  const handleConsultar = async (docParaConsultar?: string) => {
    const alvo = docParaConsultar || inputDoc;
    const limpo = ReceitaFederalService.limparDocumento(alvo);
    if (!limpo) return;

    setConsultando(true);
    setMensagemFeedback(null);
    try {
      const res = await ReceitaFederalService.consultarReceitaFederalOnline(limpo);
      setResultadoAtual(res);

      // Se houver documentos na base com este CNPJ/CPF, reexecuta o motor de regras para cruzar automaticamente
      const docsAfetados = documentos.filter(
        d =>
          ReceitaFederalService.limparDocumento(d.emitente.cnpjCpf) === limpo ||
          ReceitaFederalService.limparDocumento(d.destinatario.cnpjCpf) === limpo
      );

      if (docsAfetados.length > 0) {
        const docsReauditados = documentos.map(d => {
          const isMatch =
            ReceitaFederalService.limparDocumento(d.emitente.cnpjCpf) === limpo ||
            ReceitaFederalService.limparDocumento(d.destinatario.cnpjCpf) === limpo;
          if (!isMatch) return d;
          return TaxRuleEngine.analisarDocumento(d, empresa).documentoAtualizado;
        });
        onUpdateDocumentos(docsReauditados);
        setMensagemFeedback(
          `Cadastro validado (${res.situacaoCadastral}) e cruzado automaticamente com ${docsAfetados.length} documento(s) fiscal(is) da base!`
        );
      }
    } finally {
      setConsultando(false);
    }
  };

  const handleSimularStatus = (novaSituacao: SituacaoCadastralRFB) => {
    const limpo = resultadoAtual.documento;
    const novoCadastro = ReceitaFederalService.simularSituacaoCadastral(
      limpo,
      novaSituacao,
      resultadoAtual.razaoSocialOficial,
      resultadoAtual.ufOficial
    );
    setResultadoAtual(novoCadastro);

    // Reaudita todos os documentos vinculados a este CNPJ/CPF
    const docsReauditados = documentos.map(d => {
      const isMatch =
        ReceitaFederalService.limparDocumento(d.emitente.cnpjCpf) === limpo ||
        ReceitaFederalService.limparDocumento(d.destinatario.cnpjCpf) === limpo;
      if (!isMatch) return d;
      return TaxRuleEngine.analisarDocumento(d, empresa).documentoAtualizado;
    });

    onUpdateDocumentos(docsReauditados);
    onAddAuditLog(
      'ANALISE_MOTOR',
      'RFB-CADASTRAL',
      limpo,
      `Cruzamento cadastral Receita Federal: CNPJ/CPF ${novoCadastro.documentoFormatado} alterado para ${novaSituacao} com reauditoria automática.`
    );
    setMensagemFeedback(
      `Status alterado para "${novaSituacao}". Todos os documentos deste participante foram reauditados pelo Motor de Regras!`
    );
  };

  const handleVarreduraCompletaLote = async () => {
    setVarrendoLote(true);
    setMensagemFeedback(null);

    const cnpjsUnicos = Array.from(
      new Set<string>(
        documentos.flatMap(d => [
          ReceitaFederalService.limparDocumento(d.emitente.cnpjCpf),
          ReceitaFederalService.limparDocumento(d.destinatario.cnpjCpf)
        ])
      )
    ).filter(Boolean);

    setProgressoLote({ atual: 0, total: cnpjsUnicos.length });

    for (let i = 0; i < cnpjsUnicos.length; i++) {
      const cnpj = cnpjsUnicos[i];
      await ReceitaFederalService.consultarReceitaFederalOnline(cnpj);
      setProgressoLote({ atual: i + 1, total: cnpjsUnicos.length });
    }

    const docsReauditados = documentos.map(
      d => TaxRuleEngine.analisarDocumento(d, empresa).documentoAtualizado
    );
    onUpdateDocumentos(docsReauditados);

    const qtdCriticos = docsReauditados.filter(
      d => d.emitente.validacaoReceita?.alertaCritico || d.destinatario.validacaoReceita?.alertaCritico
    ).length;

    onAddAuditLog(
      'ANALISE_MOTOR',
      'LOTE-RFB',
      'TODOS',
      `Varredura cadastral em lote na Receita Federal concluída (${cnpjsUnicos.length} CNPJs/CPFs verificados; ${qtdCriticos} documento(s) com alerta crítico cadastral).`
    );

    setVarrendoLote(false);
    setProgressoLote(null);
    setMensagemFeedback(
      `Varredura concluída: ${cnpjsUnicos.length} participantes consultados na Receita Federal e ${docsReauditados.length} documentos reauditados (${qtdCriticos} com Alerta Crítico Cadastral).`
    );
  };

  const exemplosRapidos = [
    {
      label: 'Fornecedor CNPJ INAPTO (Art. 81 Lei 9.430/96)',
      doc: '45.842.670/0001-50',
      badge: 'INAPTA',
      cor: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    {
      label: 'Fornecedor CNPJ BAIXADO (Inexistência de Fato)',
      doc: '71.492.830/0001-83',
      badge: 'BAIXADA',
      cor: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    {
      label: 'Transportadora CNPJ SUSPENSO (Fraude)',
      doc: '62.318.490/0001-12',
      badge: 'SUSPENSA',
      cor: 'bg-amber-100 text-amber-800 border-amber-300'
    },
    {
      label: 'Prestador PF — CPF SUSPENSO na RFB',
      doc: '529.982.247-25',
      badge: 'CPF SUSPENSO',
      cor: 'bg-rose-100 text-rose-800 border-rose-300'
    },
    {
      label: 'INB - Indústrias Nucleares do Brasil S.A.',
      doc: '00.322.818/0001-47',
      badge: 'ATIVA',
      cor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    },
    {
      label: 'Telefônica Brasil S.A. (Vivo Empresas)',
      doc: '02.558.157/0001-62',
      badge: 'ATIVA',
      cor: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    }
  ];

  const isCritico = resultadoAtual.alertaCritico;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-rfb-title"
    >
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden my-6">
        {/* Header Institucional Receita Federal */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 p-6 text-white relative border-b border-blue-800/40">
          <button
            onClick={onClose}
            aria-label="Fechar Validador Receita Federal"
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  INTEGRAÇÃO OFICIAL RECEITA FEDERAL DO BRASIL • SINTEGRA / CCC
                </span>
                <span className="text-slate-400">·</span>
                <span className="text-[11px] font-mono text-emerald-300">
                  Art. 82 Lei nº 9.430/1996 &amp; IN RFB nº 2.119/2022
                </span>
              </div>
              <h2 id="modal-rfb-title" className="text-xl font-bold tracking-tight mt-0.5">
                Validação de Situação Cadastral CNPJ &amp; CPF (Clientes e Fornecedores)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Consulta online em tempo real (BrasilAPI / Receita Federal / CNPJ.ws) com bloqueio automático de créditos para CNPJ Inapto, Baixado, Suspenso ou Nulo.
              </p>
            </div>
          </div>

          {/* Navegação de Abas */}
          <div className="flex gap-2 mt-5 border-t border-white/10 pt-4">
            <button
              onClick={() => setActiveTab('consulta')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'consulta'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Consulta Individual Cartão CNPJ / CPF</span>
            </button>

            <button
              onClick={() => setActiveTab('lote')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'lote'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-white/10 text-slate-200 hover:bg-white/20'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cruzamento em Lote dos Documentos Importados ({documentos.length})</span>
            </button>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 max-h-[78vh] overflow-y-auto space-y-5">
          {mensagemFeedback && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-semibold flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{mensagemFeedback}</span>
              </div>
              <button
                onClick={() => setMensagemFeedback(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
              >
                OK
              </button>
            </div>
          )}

          {activeTab === 'consulta' ? (
            <div className="space-y-5">
              {/* Barra de Pesquisa CNPJ / CPF */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <label htmlFor="input-cnpj-cpf-rfb" className="block text-xs font-bold text-slate-700 mb-1">
                      Digite o CNPJ (14 dígitos) ou CPF (11 dígitos) do Fornecedor ou Cliente:
                    </label>
                    <input
                      id="input-cnpj-cpf-rfb"
                      type="text"
                      value={inputDoc}
                      onChange={e => setInputDoc(e.target.value)}
                      placeholder="Ex: 45.842.670/0001-50 ou 00.322.818/0001-47"
                      className="w-full px-3.5 py-2.5 text-sm font-mono bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => handleConsultar()}
                      disabled={consultando}
                      className="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {consultando ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Consultando RFB...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Consultar na Receita Federal</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Atalhos Rápidos de Cenários Cadastrais */}
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Testar Cenários Oficiais (Clique para consultar instantaneamente):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {exemplosRapidos.map(ex => (
                      <button
                        key={ex.doc}
                        onClick={() => {
                          setInputDoc(ex.doc);
                          handleConsultar(ex.doc);
                        }}
                        className="p-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-left transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="text-[11px] font-bold text-slate-800 truncate">{ex.label}</div>
                          <div className="text-[10px] font-mono text-slate-500">{ex.doc}</div>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[9px] font-extrabold rounded border shrink-0 ${ex.cor}`}>
                          {ex.badge}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* BANNER DE ALERTA CRÍTICO SE INAPTO / BAIXADO / SUSPENSO */}
              {isCritico ? (
                <div className="p-4 rounded-xl bg-rose-950 text-white border-2 border-rose-500 shadow-lg space-y-2">
                  <div className="flex items-start gap-3">
                    <AlertOctagon className="w-7 h-7 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-xs font-extrabold uppercase tracking-wider text-rose-300">
                          ALERTA CRÍTICO DE AUDITORIA • BLOQUEIO DE CRÉDITOS E RETENÇÃO CAUTELAR
                        </span>
                        <span className="font-mono text-[11px] text-rose-200">
                          Protocolo: {resultadoAtual.protocoloConsulta}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white">
                        Situação Cadastral: {resultadoAtual.situacaoCadastral} na Receita Federal do Brasil
                      </h3>
                      <p className="text-xs text-rose-100 leading-relaxed">
                        {resultadoAtual.motivoAlertaCritico || resultadoAtual.motivoSituacaoCadastral}
                      </p>
                      <div className="pt-2 text-[11px] text-rose-200 border-t border-rose-800/80 flex flex-wrap gap-4">
                        <span>
                          <strong>Fundamento Legal:</strong> Art. 82 da Lei nº 9.430/1996 &amp; Art. 23 da LC 87/1996
                        </span>
                        <span>
                          <strong>Efeito Fiscal:</strong> Documento Inidôneo (Glosa Integral de ICMS, IPI, PIS/COFINS e IBS/CBS)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-7 h-7 text-emerald-600 shrink-0" />
                    <div>
                      <div className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                        CONTRIBUINTE REGULAR E HABILITADO NA RECEITA FEDERAL
                      </div>
                      <div className="text-sm font-bold text-slate-900 mt-0.5">
                        Situação Cadastral: {resultadoAtual.situacaoCadastral} • Dígito Verificador Módulo 11 Válido
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Apto para emissão de documentos fiscais e apropriação de créditos tributários conforme legislação vigente.
                      </p>
                    </div>
                  </div>
                  <span className="font-mono text-xs text-emerald-800 shrink-0">
                    {resultadoAtual.protocoloConsulta}
                  </span>
                </div>
              )}

              {/* COMPROVANTE OFICIAL DE INSCRIÇÃO E DE SITUAÇÃO CADASTRAL (CARTÃO CNPJ / CPF) */}
              <div className="border-2 border-slate-800 rounded-xl overflow-hidden bg-white">
                <div className="bg-slate-100 border-b-2 border-slate-800 p-3 text-center">
                  <div className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    REPÚBLICA FEDERATIVA DO BRASIL • MINISTÉRIO DA FAZENDA
                  </div>
                  <div className="text-sm font-extrabold text-slate-900 uppercase mt-0.5">
                    SECRETARIA ESPECIAL DA RECEITA FEDERAL DO BRASIL — COMPROVANTE DE SITUAÇÃO CADASTRAL
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-4 p-2.5 border border-slate-300 rounded bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        NÚMERO DE INSCRIÇÃO ({resultadoAtual.tipoPessoa})
                      </span>
                      <span className="font-mono text-sm font-extrabold text-slate-900">
                        {resultadoAtual.documentoFormatado}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Módulo 11: {resultadoAtual.validoMatematicamente ? 'VÁLIDO' : 'INVÁLIDO'}
                      </span>
                    </div>

                    <div className="md:col-span-4 p-2.5 border border-slate-300 rounded bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        SITUAÇÃO CADASTRAL OFICIAL
                      </span>
                      <span
                        className={`font-mono text-sm font-extrabold ${
                          isCritico ? 'text-rose-700' : 'text-emerald-700'
                        }`}
                      >
                        {resultadoAtual.situacaoCadastral}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        Desde: {resultadoAtual.dataSituacaoCadastral}
                      </span>
                    </div>

                    <div className="md:col-span-4 p-2.5 border border-slate-300 rounded bg-slate-50/50">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        INSCRIÇÃO ESTADUAL (SINTEGRA / CCC)
                      </span>
                      <span
                        className={`font-mono text-sm font-extrabold ${
                          resultadoAtual.inscricaoEstadualStatus === 'INABILITADA'
                            ? 'text-rose-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {resultadoAtual.inscricaoEstadualStatus || 'HABILITADA'}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        UF: {resultadoAtual.ufOficial} • {resultadoAtual.municipioOficial}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-8 p-2.5 border border-slate-300 rounded">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        NOME EMPRESARIAL / RAZÃO SOCIAL OFICIAL NA RECEITA FEDERAL
                      </span>
                      <span className="font-bold text-sm text-slate-900">
                        {resultadoAtual.razaoSocialOficial}
                      </span>
                      {resultadoAtual.nomeFantasiaOficial && (
                        <span className="block text-[11px] text-slate-500 mt-0.5">
                          Nome Fantasia: {resultadoAtual.nomeFantasiaOficial}
                        </span>
                      )}
                    </div>

                    <div className="md:col-span-4 p-2.5 border border-slate-300 rounded">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        NATUREZA JURÍDICA &amp; PORTE
                      </span>
                      <span className="font-semibold text-slate-800 block">
                        {resultadoAtual.naturezaJuridica || '206-2 - Sociedade Empresária Limitada'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        Porte: {resultadoAtual.porte || 'DEMAIS'} • Simples:{' '}
                        {resultadoAtual.opcaoSimplesNacional ? 'OPTANTE' : 'NÃO OPTANTE'}
                      </span>
                    </div>
                  </div>

                  {resultadoAtual.cnaePrincipal && (
                    <div className="p-2.5 border border-slate-300 rounded">
                      <span className="text-[10px] text-slate-500 font-bold uppercase block">
                        CÓDIGO E DESCRIÇÃO DA ATIVIDADE ECONÔMICA PRINCIPAL (CNAE)
                      </span>
                      <span className="font-mono font-bold text-slate-900">
                        {resultadoAtual.cnaePrincipal.codigo}
                      </span>{' '}
                      — <span className="text-slate-700">{resultadoAtual.cnaePrincipal.descricao}</span>
                    </div>
                  )}

                  <div className="p-2.5 border border-slate-300 rounded bg-slate-50">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">
                      MOTIVO DETERMINANTE DA SITUAÇÃO CADASTRAL (BASE NORMATIVA RFB)
                    </span>
                    <span className={`font-bold ${isCritico ? 'text-rose-700' : 'text-slate-800'}`}>
                      {resultadoAtual.motivoSituacaoCadastral}
                    </span>
                  </div>
                </div>

                {/* Simulador de Stress Test Cadastral para Auditoria */}
                <div className="bg-slate-900 text-white p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-amber-300 block">
                      Simulador de Stress Test de Auditoria Cadastral:
                    </span>
                    <span className="text-[11px] text-slate-300">
                      Teste o comportamento do Motor Fiscal caso este CNPJ/CPF mude de status na Receita Federal:
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      onClick={() => handleSimularStatus('ATIVA')}
                      className="px-2.5 py-1.5 rounded text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition"
                    >
                      Forçar ATIVA
                    </button>
                    <button
                      onClick={() => handleSimularStatus('INAPTA')}
                      className="px-2.5 py-1.5 rounded text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white transition"
                    >
                      Simular INAPTA
                    </button>
                    <button
                      onClick={() => handleSimularStatus('BAIXADA')}
                      className="px-2.5 py-1.5 rounded text-xs font-bold bg-rose-800 hover:bg-rose-700 text-white transition"
                    >
                      Simular BAIXADA
                    </button>
                    <button
                      onClick={() => handleSimularStatus('SUSPENSA')}
                      className="px-2.5 py-1.5 rounded text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white transition"
                    >
                      Simular SUSPENSA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ABA 2: VARREDURA EM LOTE DE TODOS OS DOCUMENTOS IMPORTADOS */
            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Cruzamento Cadastral Automático de Todos os Documentos da Base
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Verifica simultaneamente o CNPJ/CPF de todos os Emitentes (Fornecedores) e Destinatários (Clientes) perante a Receita Federal.
                  </p>
                </div>
                <button
                  onClick={handleVarreduraCompletaLote}
                  disabled={varrendoLote}
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-2 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${varrendoLote ? 'animate-spin' : ''}`} />
                  <span>
                    {varrendoLote && progressoLote
                      ? `Consultando RFB (${progressoLote.atual}/${progressoLote.total})...`
                      : 'Executar Varredura Online RFB em Lote'}
                  </span>
                </button>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 border-b border-slate-200 text-slate-600 font-bold uppercase">
                    <tr>
                      <th className="py-3 px-4">Documento Fiscal</th>
                      <th className="py-3 px-4">Fornecedor / Emitente</th>
                      <th className="py-3 px-4">Situação RFB Emitente</th>
                      <th className="py-3 px-4">Destinatário / Cliente</th>
                      <th className="py-3 px-4">Impacto / Créditos</th>
                      <th className="py-3 px-4 text-right">Ação Rápida</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documentos.map(doc => {
                      const rfEmit =
                        doc.emitente.validacaoReceita ||
                        ReceitaFederalService.consultarSincrono(
                          doc.emitente.cnpjCpf,
                          doc.emitente.razaoSocial,
                          doc.emitente.uf
                        );
                      const isEmitCritico = rfEmit.alertaCritico;

                      return (
                        <tr
                          key={doc.id}
                          className={isEmitCritico ? 'bg-rose-50/70 hover:bg-rose-100/60' : 'hover:bg-slate-50'}
                        >
                          <td className="py-3 px-4 font-mono font-bold text-slate-900">
                            {doc.tipoDocumento} {doc.numero}
                            <div className="text-[10px] text-slate-500 font-normal">
                              R$ {doc.valorTotalDocumento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-900 max-w-[200px] truncate">
                              {doc.emitente.razaoSocial}
                            </div>
                            <div className="font-mono text-[10px] text-slate-500">
                              {rfEmit.documentoFormatado} • {doc.emitente.uf}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isEmitCritico ? (
                              <div className="text-rose-700 font-extrabold flex items-center gap-1">
                                <AlertOctagon className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                <span>RFB: {rfEmit.situacaoCadastral}</span>
                              </div>
                            ) : (
                              <div className="text-emerald-700 font-bold flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span>RFB: {rfEmit.situacaoCadastral}</span>
                              </div>
                            )}
                            <div className="text-[10px] text-slate-500 truncate max-w-[190px]">
                              {rfEmit.motivoSituacaoCadastral}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-medium text-slate-800 truncate max-w-[160px]">
                              {doc.destinatario.razaoSocial}
                            </div>
                            <div className="font-mono text-[10px] text-emerald-700">
                              RFB: {doc.destinatario.validacaoReceita?.situacaoCadastral || 'ATIVA'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {isEmitCritico ? (
                              <span className="text-rose-800 font-bold text-[11px]">
                                CRÉDITO GLOSADO (Art. 82)
                              </span>
                            ) : (
                              <span className="text-emerald-800 font-semibold text-[11px]">
                                Crédito Apto: R${' '}
                                {doc.totalCreditosApurados.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => {
                                setInputDoc(rfEmit.documentoFormatado);
                                setResultadoAtual(rfEmit);
                                setActiveTab('consulta');
                              }}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-900 text-white text-[11px] font-semibold transition"
                            >
                              Ver Cartão RFB
                            </button>
                          </td>
                        </tr>
                      );
                    })}
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
