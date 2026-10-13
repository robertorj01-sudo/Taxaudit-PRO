import React, { useState } from 'react';
import { DocumentoFiscal } from '../types/fiscal';
import { ProtheusIntegrationService, ProtheusSyncPayload } from '../services/protheusIntegration';
import {
  Server,
  Code,
  Send,
  CheckCircle2,
  Copy,
  Check,
  Cpu,
  Database,
  Terminal,
  Activity
} from 'lucide-react';

interface ProtheusIntegrationViewProps {
  documentos: DocumentoFiscal[];
  selectedDocId: string | null;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
}

export const ProtheusIntegrationView: React.FC<ProtheusIntegrationViewProps> = ({
  documentos,
  selectedDocId,
  onAddAuditLog
}) => {
  const currentDoc = documentos.find(d => d.id === selectedDocId) || documentos[0];
  const [activeTab, setActiveTab] = useState<'payload' | 'advpl' | 'api'>('payload');
  const [copiado, setCopiado] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SENDING' | 'SUCCESS'>('IDLE');
  const [syncResponse, setSyncResponse] = useState<string | null>(null);

  if (!currentDoc) {
    return (
      <div className="p-8 text-center bg-white rounded-xl border border-slate-200">
        <p className="text-slate-500 text-sm">Nenhum documento disponível para integração Protheus.</p>
      </div>
    );
  }

  const payload: ProtheusSyncPayload = ProtheusIntegrationService.gerarPayloadProtheus(currentDoc);
  const advplCode: string = ProtheusIntegrationService.gerarCodigoAdvpl(payload);

  const handleSimularIntegracao = () => {
    setSyncStatus('SENDING');
    setSyncResponse(null);

    setTimeout(() => {
      setSyncStatus('SUCCESS');
      setSyncResponse(
        JSON.stringify(
          {
            status: '200 OK',
            timestamp: new Date().toISOString(),
            rotinaProtheus: 'MATA103',
            tabelaCabecalho: 'SF1',
            registroCriado: `SF1010 R_E_C_N_O_ ${Math.floor(Math.random() * 90000 + 10000)}`,
            itensGravados: currentDoc.itens.length,
            mensagem: `NF-e ${currentDoc.numero} classificada e escriturada no Protheus com sucesso.`
          },
          null,
          2
        )
      );

      onAddAuditLog(
        'INTEGRACAO_PROTHEUS',
        currentDoc.id,
        currentDoc.chaveAcesso,
        `Envio e classificação automática do documento no ERP TOTVS Protheus via ExecAuto MATA103.`
      );
    }, 600);
  };

  const handleCopiarTexto = (texto: string) => {
    navigator.clipboard.writeText(texto);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  return (
    <div id="protheus-integration-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Server className="w-6 h-6 text-emerald-600" />
            Integração ERP — TOTVS Protheus (REST & ADVPL)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Conector nativo para classificação de documentos de entrada (SF1/SD1 - MATA103) e saída (SF2/SD2) com validações fiscais prévias.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSimularIntegracao}
            disabled={syncStatus === 'SENDING'}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {syncStatus === 'SENDING' ? 'Integrando...' : 'Transmitir ao Protheus (Simular)'}
          </button>
        </div>
      </div>

      {/* Status da Conexão e Metadados do Protheus */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="font-semibold text-slate-500">Documento Ativo</span>
          <div className="font-bold text-sm text-slate-900 font-mono">NF-e {currentDoc.numero}</div>
          <div className="text-[11px] text-slate-400 truncate">{currentDoc.emitente.razaoSocial}</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="font-semibold text-slate-500">Rotina ExecAuto</span>
          <div className="font-bold text-sm text-emerald-700 font-mono">MATA103 (Documento de Entrada)</div>
          <div className="text-[11px] text-slate-400">Tabelas: SF1 / SD1</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="font-semibold text-slate-500">Filial & Ambiente Protheus</span>
          <div className="font-bold text-sm text-slate-900 font-mono">Filial 01 • PROD_TOTVS_12</div>
          <div className="text-[11px] text-emerald-600 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" />
            Endpoint REST Online
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-1">
          <span className="font-semibold text-slate-500">Status da Última Transmissão</span>
          {syncStatus === 'SUCCESS' ? (
            <div className="font-bold text-sm text-emerald-700 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-4 h-4" />
              Sincronizado
            </div>
          ) : (
            <div className="font-bold text-sm text-slate-600 font-mono">Pendente de Envio</div>
          )}
          <div className="text-[11px] text-slate-400">Protocolo REST v1.2</div>
        </div>
      </div>

      {/* Tabs: JSON Payload vs ADVPL ExecAuto Code vs APIs REST */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('payload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'payload'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Payload JSON REST (SF1/SD1)
            </button>
            <button
              onClick={() => setActiveTab('advpl')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'advpl'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Código ADVPL (MATA103 ExecAuto)
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === 'api'
                  ? 'bg-slate-800 text-white'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              Endpoints & Especificação da API
            </button>
          </div>

          <button
            onClick={() => handleCopiarTexto(activeTab === 'payload' ? JSON.stringify(payload, null, 2) : advplCode)}
            className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1 transition"
          >
            {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiado ? 'Copiado!' : 'Copiar Código'}
          </button>
        </div>

        {/* Tab 1: Payload JSON */}
        {activeTab === 'payload' && (
          <div className="p-4 bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto max-h-[500px] whitespace-pre leading-relaxed">
            {JSON.stringify(payload, null, 2)}
          </div>
        )}

        {/* Tab 2: Código ADVPL */}
        {activeTab === 'advpl' && (
          <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-400 overflow-x-auto max-h-[500px] whitespace-pre leading-relaxed">
            {advplCode}
          </div>
        )}

        {/* Tab 3: Endpoints REST */}
        {activeTab === 'api' && (
          <div className="p-5 space-y-4 text-xs text-slate-700">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded font-bold bg-emerald-600 text-white text-[11px]">POST</span>
                <span className="font-bold text-slate-800">/api/v1/protheus/inbound/nfe</span>
              </div>
              <p className="text-slate-600 mt-1">
                Recebe o documento fiscal aprovado com todos os tributos auditados e dispara a classificação automática no Protheus (MATA103).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded font-bold bg-blue-600 text-white text-[11px]">GET</span>
                <span className="font-bold text-slate-800">/api/v1/protheus/audit/rules</span>
              </div>
              <p className="text-slate-600 mt-1">
                Retorna o catálogo de regras tributárias e alíquotas vigentes para sincronização com as tabelas de Exceção Fiscal do Protheus (SF7).
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
              <div className="flex items-center gap-2 font-mono">
                <span className="px-2 py-0.5 rounded font-bold bg-purple-600 text-white text-[11px]">POST</span>
                <span className="font-bold text-slate-800">/api/v1/protheus/audit/feedback</span>
              </div>
              <p className="text-slate-600 mt-1">
                Transmite ao Protheus os apontamentos de inconsistências cadastrais de NCM, CFOP ou alíquotas divergentes.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Retorno do Servidor REST / Logs de ExecAuto */}
      {syncResponse && (
        <div className="bg-slate-900 rounded-xl p-4 text-xs font-mono text-emerald-400 space-y-2 border border-emerald-500/40">
          <div className="flex items-center gap-2 font-bold text-white font-sans text-sm">
            <Terminal className="w-4 h-4 text-emerald-400" />
            Resposta da Execução REST Protheus (Simulação ExecAuto)
          </div>
          <pre className="whitespace-pre overflow-x-auto text-[11px] leading-relaxed">{syncResponse}</pre>
        </div>
      )}
    </div>
  );
};
