import React, { useState } from 'react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { SpedFiscalGenerator } from '../services/spedGenerator';
import {
  BookOpenCheck,
  Download,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Calendar
} from 'lucide-react';

interface EscrituracaoSpedViewProps {
  documentos: DocumentoFiscal[];
  empresa: Empresa;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
}

export const EscrituracaoSpedView: React.FC<EscrituracaoSpedViewProps> = ({
  documentos,
  empresa,
  onAddAuditLog
}) => {
  const [periodoInicio, setPeriodoInicio] = useState('2026-03-01');
  const [periodoFim, setPeriodoFim] = useState('2026-03-31');
  const [conteudoSped, setConteudoSped] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);

  // Apenas documentos APROVADOS ou ESCRITURADOS (Item 19 do Prompt)
  const docsAprovados = documentos.filter(d => d.status === 'APROVADO' || d.status === 'ESCRITURADO');
  const docsNaoAprovados = documentos.filter(d => d.status !== 'APROVADO' && d.status !== 'ESCRITURADO');

  const handleGerarSped = () => {
    if (docsAprovados.length === 0) {
      alert('Não existem documentos aprovados para geração da EFD ICMS/IPI. Aprove documentos na tela de Auditoria antes de prosseguir.');
      return;
    }

    const txt = SpedFiscalGenerator.gerarEfdIcmsIpi(empresa, docsAprovados, periodoInicio, periodoFim);
    setConteudoSped(txt);

    onAddAuditLog(
      'EXPORTACAO_SPED',
      'LOTE_SPED_03_2026',
      `${docsAprovados.length}_DOCUMENTOS`,
      `Geração de arquivo EFD ICMS/IPI com ${docsAprovados.length} documentos fiscais aprovados.`
    );
  };

  const handleDownloadArquivo = () => {
    if (!conteudoSped) return;
    const blob = new Blob([conteudoSped], { type: 'text/plain;charset=iso-8859-1' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `SPED_EFD_${empresa.cnpj.replace(/\D/g, '')}_202603.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="escrituracao-sped-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BookOpenCheck className="w-6 h-6 text-emerald-600" />
            Escrituração Fiscal Digital — EFD ICMS/IPI (SPED Fiscal)
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Geração de registros oficiais (Blocos 0, C e 9) estritamente a partir de documentos fiscais aprovados na auditoria técnica.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleGerarSped}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <FileText className="w-4 h-4" />
            Gerar Arquivo EFD
          </button>
        </div>
      </div>

      {/* Painel de Controle do Período e Parâmetros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
          <span className="font-bold text-slate-700 flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-600" />
            Período de Apuração
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-500">Data Inicial:</label>
              <input
                type="date"
                value={periodoInicio}
                onChange={e => setPeriodoInicio(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-500">Data Final:</label>
              <input
                type="date"
                value={periodoFim}
                onChange={e => setPeriodoFim(e.target.value)}
                className="w-full p-1.5 border border-slate-300 rounded font-mono text-xs"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
          <span className="font-bold text-slate-700">Controle de Portão de Escrituração</span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              {docsAprovados.length} Aprovado{docsAprovados.length !== 1 ? 's' : ''} (Aptos)
            </span>
            <span className="text-amber-700 font-semibold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {docsNaoAprovados.length} Retido{docsNaoAprovados.length !== 1 ? 's' : ''} (Pendente)
            </span>
          </div>
          <p className="text-[10px] text-slate-400">
            Regra do Sistema: Documentos com divergência não auditados são bloqueados para evitar autuação pelo Fisco.
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-xs space-y-2">
          <span className="font-bold text-slate-700">Perfil SPED & Versão do Layout</span>
          <div className="font-mono text-slate-800 space-y-0.5">
            <div>Perfil Fiscal: <span className="font-bold text-emerald-700">{empresa.perfilSped} (Avançado/Detalhado)</span></div>
            <div>Versão Guia Prático: <span className="font-bold">v3.1.6 (Layout 018)</span></div>
            <div>Finalidade do Arquivo: <span className="font-bold">Remessa Regular</span></div>
          </div>
        </div>
      </div>

      {/* Visualizador do Arquivo SPED Gerado */}
      {conteudoSped ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="font-bold text-xs font-mono">
                SPED_EFD_{empresa.cnpj.replace(/\D/g, '')}_202603.txt
              </span>
              <span className="text-[11px] text-slate-400 font-sans">
                ({conteudoSped.split('\r\n').length} registros formatados)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(conteudoSped);
                  setCopiado(true);
                  setTimeout(() => setCopiado(false), 2000);
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition"
              >
                {copiado ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiado ? 'Copiado!' : 'Copiar Texto'}
              </button>

              <button
                onClick={handleDownloadArquivo}
                className="px-3 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1 transition shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar Arquivo .TXT
              </button>
            </div>
          </div>

          <div className="bg-slate-950 p-4 font-mono text-xs text-emerald-400 overflow-x-auto max-h-96 whitespace-pre leading-relaxed border-t border-slate-800 selection:bg-emerald-800 selection:text-white">
            {conteudoSped}
          </div>
        </div>
      ) : (
        <div className="p-8 text-center bg-white rounded-xl border border-dashed border-slate-300">
          <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700">Nenhum arquivo EFD gerado nesta sessão</p>
          <p className="text-xs text-slate-500 mt-1">
            Clique no botão <strong>"Gerar Arquivo EFD"</strong> acima para consolidar os registros C100, C170 e C190.
          </p>
        </div>
      )}

      {/* Tabela de Documentos Incluídos na Escrituração */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 font-bold text-xs text-slate-700 uppercase tracking-wider">
          Documentos Fiscais Habilitados para a Escrituração ({docsAprovados.length})
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-2.5 px-4">Doc</th>
                <th className="py-2.5 px-4">Chave de Acesso</th>
                <th className="py-2.5 px-4">Participante</th>
                <th className="py-2.5 px-4">Valor Total</th>
                <th className="py-2.5 px-4">ICMS Escriturado</th>
                <th className="py-2.5 px-4">Aprovado Por</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docsAprovados.map(doc => (
                <tr key={doc.id} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-4 font-bold text-slate-800 font-mono">
                    {doc.tipoDocumento === 'NFCOM' ? `NFCom ${doc.numero}` : doc.tipoDocumento === 'NF3E' ? `NF3e ${doc.numero}` : `NF-e ${doc.numero}`}
                  </td>
                  <td className="py-2.5 px-4 font-mono text-[10px] text-slate-500">{doc.chaveAcesso}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-700">{doc.emitente.razaoSocial}</td>
                  <td className="py-2.5 px-4 font-semibold text-slate-900">{formatMoeda(doc.valorTotalDocumento)}</td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-emerald-700">{formatMoeda(doc.totalIcms)}</td>
                  <td className="py-2.5 px-4 text-slate-500">{doc.responsavelAprovacao || 'Roberto Pereira de Oliveira'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
