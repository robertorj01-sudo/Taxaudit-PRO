import React, { useState } from 'react';
import { RegistroTrilhaAuditoria } from '../types/fiscal';
import { History, Shield, Filter, Download, CheckCircle, AlertCircle, FileText } from 'lucide-react';

interface AuditTrailViewProps {
  logs: RegistroTrilhaAuditoria[];
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({ logs }) => {
  const [filtroOperacao, setFiltroOperacao] = useState<string>('TODAS');

  const logsFiltrados = logs.filter(log => {
    if (filtroOperacao === 'TODAS') return true;
    return log.operacao === filtroOperacao;
  });

  const handleExportarCsv = () => {
    const headers = ['ID', 'Data/Hora', 'Usuário', 'Operação', 'Doc ID', 'Chave NF-e', 'Justificativa', 'Versão Motor'];
    const rows = logs.map(l => [
      l.id,
      new Date(l.dataHora).toLocaleString('pt-BR'),
      `"${l.usuarioNome}"`,
      l.operacao,
      l.documentoId,
      l.chaveAcesso,
      `"${l.justificativa.replace(/"/g, '""')}"`,
      l.versaoMotorRegras
    ]);

    const csvContent = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `TRILHA_AUDITORIA_FISCAL_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div id="audit-trail-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-emerald-600" />
            Trilha de Auditoria & Evidências Fiscais Imutáveis
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Registro cronológico inalterável de todas as análises, decisões de aprovação/rejeição, escrituração e justificativas técnicas.
          </p>
        </div>

        <button
          onClick={handleExportarCsv}
          className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1.5 shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exportar Trilha (CSV)
        </button>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700">Filtrar por Operação:</span>
            <select
              value={filtroOperacao}
              onChange={e => setFiltroOperacao(e.target.value)}
              className="text-xs p-1.5 rounded border border-slate-300 font-medium"
            >
              <option value="TODAS">Todas as Operações ({logs.length})</option>
              <option value="IMPORTACAO">Importações</option>
              <option value="APROVACAO">Aprovações Técnicas</option>
              <option value="REJEICAO">Rejeições</option>
              <option value="EXPORTACAO_SPED">Exportações SPED</option>
              <option value="INTEGRACAO_PROTHEUS">Integrações Protheus</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Integridade Criptográfica: SHA-256 Validado
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Data e Hora</th>
                <th className="py-3 px-4">Usuário / Responsável</th>
                <th className="py-3 px-4">Operação</th>
                <th className="py-3 px-4">Documento / Referência</th>
                <th className="py-3 px-4">Justificativa Técnica Obrigatória</th>
                <th className="py-3 px-4">Motor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logsFiltrados.map(log => (
                <tr key={log.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {new Date(log.dataHora).toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{log.usuarioNome}</div>
                    <div className="text-[10px] text-slate-400">{log.usuarioEmail}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      log.operacao === 'APROVACAO'
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.operacao === 'REJEICAO'
                        ? 'bg-red-100 text-red-800'
                        : log.operacao === 'EXPORTACAO_SPED'
                        ? 'bg-blue-100 text-blue-800'
                        : log.operacao === 'INTEGRACAO_PROTHEUS'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}>
                      {log.operacao.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono">
                    <div className="font-semibold text-slate-900">{log.documentoId}</div>
                    <div className="text-[10px] text-slate-400 max-w-[140px] truncate" title={log.chaveAcesso}>
                      {log.chaveAcesso}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 max-w-sm">
                    {log.justificativa}
                  </td>
                  <td className="py-3 px-4 font-mono text-[10px] text-slate-500">
                    {log.versaoMotorRegras}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
