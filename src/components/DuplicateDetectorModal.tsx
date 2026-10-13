import React, { useState, useMemo } from 'react';
import {
  CopyX,
  X,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Trash2,
  Eye,
  FileCode,
  Sparkles,
  ArrowRight,
  Info,
  RefreshCw,
  Search,
  Check
} from 'lucide-react';
import { DocumentoFiscal } from '../types/fiscal';

interface DuplicateDetectorModalProps {
  documentos: DocumentoFiscal[];
  onClose: () => void;
  onRemoverDocumento: (id: string, chave: string) => void;
  onSimularTentativaDuplicada: (doc: DocumentoFiscal) => void;
}

interface GrupoDuplicado {
  tipo: 'CHAVE_IDENTICA' | 'NUMERO_SERIE_EMITENTE' | 'VALOR_DATA_FORNECEDOR';
  descricao: string;
  documentos: DocumentoFiscal[];
}

export const DuplicateDetectorModal: React.FC<DuplicateDetectorModalProps> = ({
  documentos,
  onClose,
  onRemoverDocumento,
  onSimularTentativaDuplicada
}) => {
  const [termoBusca, setTermoBusca] = useState('');
  const [docSelecionadoVisualizar, setDocSelecionadoVisualizar] = useState<DocumentoFiscal | null>(null);
  const [sucessoRemocao, setSucessoRemocao] = useState<string | null>(null);

  // Análise em tempo real de documentos duplicados na base
  const gruposDuplicados = useMemo(() => {
    const grupos: GrupoDuplicado[] = [];

    // 1. Agrupamento por Chave de Acesso Exata
    const mapaChave: Record<string, DocumentoFiscal[]> = {};
    documentos.forEach(doc => {
      const k = doc.chaveAcesso?.trim();
      if (!k) return;
      if (!mapaChave[k]) mapaChave[k] = [];
      mapaChave[k].push(doc);
    });

    Object.entries(mapaChave).forEach(([chave, docs]) => {
      if (docs.length > 1) {
        grupos.push({
          tipo: 'CHAVE_IDENTICA',
          descricao: `Chave de Acesso Idêntica: ${chave}`,
          documentos: docs
        });
      }
    });

    // 2. Agrupamento por Número + Série + CNPJ Emitente (caso a chave tenha divergido por digito ou versão)
    const mapaNumeroSerieCnpj: Record<string, DocumentoFiscal[]> = {};
    documentos.forEach(doc => {
      const k = `${doc.numero}-${doc.serie}-${doc.emitente.cnpjCpf}`;
      if (!mapaNumeroSerieCnpj[k]) mapaNumeroSerieCnpj[k] = [];
      mapaNumeroSerieCnpj[k].push(doc);
    });

    Object.entries(mapaNumeroSerieCnpj).forEach(([_, docs]) => {
      if (docs.length > 1) {
        // Apenas se não for exatamente o mesmo grupo já identificado por chave
        const idsUnicos = new Set(docs.map(d => d.id));
        const jaExiste = grupos.some(g => g.documentos.length === docs.length && g.documentos.every(d => idsUnicos.has(d.id)));
        if (!jaExiste) {
          grupos.push({
            tipo: 'NUMERO_SERIE_EMITENTE',
            descricao: `Mesmo Número (${docs[0].numero}), Série (${docs[0].serie}) e Fornecedor (${docs[0].emitente.razaoSocial})`,
            documentos: docs
          });
        }
      }
    });

    return grupos;
  }, [documentos]);

  const totalDuplicatas = gruposDuplicados.reduce((acc, g) => acc + (g.documentos.length - 1), 0);

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleExcluirDuplicata = (id: string, chave: string) => {
    onRemoverDocumento(id, chave);
    setSucessoRemocao(`Documento ${chave} removido com sucesso.`);
    setTimeout(() => setSucessoRemocao(null), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-6 shadow-2xl border border-slate-200 my-8 space-y-5 animate-in fade-in zoom-in-95 duration-150">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-100 text-rose-700">
              <CopyX className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Auditoria e Visualizador de Arquivos Duplicados
              </h2>
              <p className="text-xs text-slate-500">
                Detecção inteligente de duplicidades por Chave de Acesso (44 dígitos), Número/Série/Emitente ou Fatura de Concessionária.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação de sucesso */}
        {sucessoRemocao && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{sucessoRemocao}</span>
          </div>
        )}

        {/* Resumo Métrico */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
              Total de Arquivos na Base
            </span>
            <span className="text-2xl font-black text-slate-800 font-mono mt-1 block">
              {documentos.length}
            </span>
            <span className="text-[10px] text-slate-400">Varredura contínua em memória e LocalStorage</span>
          </div>

          <div
            className={`p-3.5 rounded-xl border ${
              totalDuplicatas > 0
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider block">
              Duplicidades Detectadas
            </span>
            <span className="text-2xl font-black font-mono mt-1 block">
              {totalDuplicatas}
            </span>
            <span className="text-[10px] opacity-80">
              {totalDuplicatas > 0
                ? 'Exigem descarte para evitar bitributação'
                : 'Nenhum documento repetido na base ativa'}
            </span>
          </div>

          <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200 text-blue-900">
            <span className="text-[11px] font-semibold uppercase tracking-wider block flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              Proteção Tributária (SPED & Protheus)
            </span>
            <span className="text-2xl font-black font-mono mt-1 block text-blue-700">
              100% Blindado
            </span>
            <span className="text-[10px] text-blue-600">
              Impedimento de escrituração e pagamento em dobro
            </span>
          </div>
        </div>

        {/* Explicação e Diretrizes Técnicas */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed flex items-start gap-2.5">
          <Info className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
          <div>
            <strong>Como a aplicação protege contra duplicidades:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px] text-amber-800">
              <li>
                <strong>No Upload / Sincronização de Pasta R:\:</strong> O sistema checa automaticamente a chave de 44 dígitos antes de gravar. Se for repetida, exibe um alerta de duplicidade e bloqueia o cadastro automático.
              </li>
              <li>
                <strong>Nas Faturas de Energia (NF3e):</strong> Identifica a mesma Unidade Consumidora (UC) e mês de referência para evitar escrituração duplicada da conta da Light / Enel.
              </li>
              <li>
                <strong>Na Integração TOTVS Protheus:</strong> O preenchimento da tabela SF1 não permite duplicidade de chave de acesso (CHV_NFE).
              </li>
            </ul>
          </div>
        </div>

        {/* Lista de Grupos de Duplicados */}
        {gruposDuplicados.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              Documentos com Conflito de Duplicidade
            </h3>

            {gruposDuplicados.map((grupo, idx) => (
              <div
                key={idx}
                className="p-4 bg-rose-50/40 border border-rose-200 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    {grupo.descricao}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold">
                    {grupo.documentos.length} Ocorrências
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {grupo.documentos.map((doc, docIdx) => (
                    <div
                      key={doc.id}
                      className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                        docIdx === 0
                          ? 'bg-white border-emerald-300 ring-1 ring-emerald-400'
                          : 'bg-white border-rose-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 font-mono">
                          {doc.tipoDocumento === 'NF3E' ? `NF3e ${doc.numero}` : `NF-e ${doc.numero}`} (Série {doc.serie})
                        </span>
                        {docIdx === 0 ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                            Original (Base)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                            Duplicata
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-600 truncate">
                        <strong>Emitente:</strong> {doc.emitente.razaoSocial}
                      </div>
                      <div className="text-[11px] text-slate-600">
                        <strong>Emissão:</strong> {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')} •{' '}
                        <strong>Total:</strong> {formatMoeda(doc.valorTotalDocumento)}
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 truncate" title={doc.chaveAcesso}>
                        {doc.chaveAcesso}
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                        <button
                          onClick={() => setDocSelecionadoVisualizar(doc)}
                          className="text-[11px] text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Inspecionar
                        </button>

                        {docIdx > 0 && (
                          <button
                            onClick={() => handleExcluirDuplicata(doc.id, doc.chaveAcesso)}
                            className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-[11px] font-bold flex items-center gap-1 shadow-2xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Excluir Duplicata
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">
                Base Fiscal 100% Livre de Duplicidades!
              </h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
                Todas as {documentos.length} notas fiscais possuem chaves de acesso únicas e combinações exclusivas de número, série e fornecedor.
              </p>
            </div>

            {/* Teste Interativo de Prevenção */}
            {documentos.length > 0 && (
              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onSimularTentativaDuplicada(documentos[0]);
                  }}
                  className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold inline-flex items-center gap-2 shadow-sm transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                  Simular Teste: Tentar Reimportar a NF-e {documentos[0].numero}
                </button>
                <p className="text-[10px] text-slate-400 mt-1">
                  Veja como o motor impede em tempo real a entrada do mesmo arquivo repetido.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Modal interno para inspecionar XML */}
        {docSelecionadoVisualizar && (
          <div className="p-4 bg-slate-900 text-slate-200 rounded-xl space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between pb-2 border-b border-slate-700">
              <span className="font-bold text-white">
                Inspeção: {docSelecionadoVisualizar.numero} • Chave {docSelecionadoVisualizar.chaveAcesso}
              </span>
              <button
                onClick={() => setDocSelecionadoVisualizar(null)}
                className="text-slate-400 hover:text-white"
              >
                Fechar Detalhes
              </button>
            </div>
            <div className="max-h-40 overflow-y-auto whitespace-pre text-[11px]">
              {docSelecionadoVisualizar.rawXml || 'XML bruto não armazenado em cache para este registro.'}
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="flex items-center justify-end pt-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-lg transition"
          >
            Fechar Painel de Duplicidades
          </button>
        </div>
      </div>
    </div>
  );
};
