import React, { useState, useRef } from 'react';
import {
  Truck,
  ExternalLink,
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Copy,
  Building2,
  FileText,
  ShieldCheck,
  PackageCheck,
  ArrowRight,
  X,
  Navigation,
  Scale
} from 'lucide-react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import { SAMPLE_XML_CTE_TRANSPORTE } from '../services/sampleData';

interface CteImportModalProps {
  empresa: Empresa;
  documentosExistentes: DocumentoFiscal[];
  onClose: () => void;
  onImportarDocumento: (doc: DocumentoFiscal) => void;
}

export const CteImportModal: React.FC<CteImportModalProps> = ({
  empresa,
  documentosExistentes,
  onClose,
  onImportarDocumento
}) => {
  const [activeTab, setActiveTab] = useState<'portal' | 'upload' | 'colar'>('portal');
  const [chaveConsulta, setChaveConsulta] = useState('35260343283811000108570010000412891000412890');
  const [xmlInput, setXmlInput] = useState('');
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PORTAL_CTE_URL = 'https://www.cte.fazenda.gov.br/portal/';
  const PORTAL_CONSULTA_URL = 'https://www.cte.fazenda.gov.br/portal/consultaRecaptcha.aspx?tipoConsulta=completa&tipoConteudo=XbSeqxE8pl8=';

  const formatarChave = (chave: string) => {
    return chave.replace(/\D/g, '').slice(0, 44);
  };

  const copiarChave = () => {
    navigator.clipboard.writeText(chaveConsulta);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const processarXml = (xmlContent: string) => {
    try {
      setErroMensagem(null);
      const parsedDoc = XmlFiscalParser.parseNFeXml(xmlContent);

      if (parsedDoc.tipoDocumento !== 'CTE' && !xmlContent.includes('infCte') && !xmlContent.includes('mod>57')) {
        console.info('Documento importado não identificado nativamente como Modelo 57');
      }

      // Executa motor de regras com validação de ICMS de frete, PIS/COFINS e tomada FOB
      const resultado = TaxRuleEngine.analisarDocumento(parsedDoc, empresa);
      const docFinal = resultado.documentoAtualizado;

      onImportarDocumento(docFinal);
      setSucessoMensagem(`CT-e Nº ${docFinal.numero} (Modelo 57 - Transporte) importado e auditado com sucesso!`);
      setTimeout(() => {
        onClose();
      }, 1300);
    } catch (err: any) {
      setErroMensagem(err.message || 'Erro ao interpretar o XML do CT-e.');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        processarXml(content);
      }
    };
    reader.onerror = () => {
      setErroMensagem('Falha ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  };

  const handleCarregarExemploTransporte = () => {
    processarXml(SAMPLE_XML_CTE_TRANSPORTE);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shadow-inner">
              <Truck className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-400/20 text-blue-200 border border-blue-400/40 uppercase tracking-wider">
                  CT-e Modelo 57 • Ajuste SINIEF 09/2007
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 uppercase">
                  SEFAZ Nacional
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                Importação & Consulta de CT-e (Conhecimento de Transporte)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Conhecimento de Transporte Eletrônico (Modelo 57) para frete rodoviário, aéreo, aquaviário e ferroviário de cargas e insumos.
              </p>
            </div>
          </div>

          {/* Abas */}
          <div className="flex gap-2 mt-6">
            <button
              onClick={() => setActiveTab('portal')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'portal'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <ExternalLink className="w-4 h-4 text-blue-600" />
              <span>Portal SEFAZ & Exemplo Oficial</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Upload className="w-4 h-4 text-blue-600" />
              <span>Upload de Arquivo XML (.xml)</span>
            </button>
            <button
              onClick={() => setActiveTab('colar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'colar'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <FileCode className="w-4 h-4 text-blue-600" />
              <span>Colar Conteúdo XML</span>
            </button>
          </div>
        </div>

        {/* Mensagens de Sucesso ou Erro */}
        {erroMensagem && (
          <div className="mx-6 mt-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="font-medium">{erroMensagem}</span>
          </div>
        )}

        {sucessoMensagem && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-medium">{sucessoMensagem}</span>
          </div>
        )}

        {/* Conteúdo das Abas */}
        <div className="p-6">
          {activeTab === 'portal' && (
            <div className="space-y-6">
              {/* Card Explicativo sobre o CT-e */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-800 rounded-lg shrink-0 mt-0.5">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      O que é o CT-e (Conhecimento de Transporte Eletrônico - Modelo 57)?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Instituído pelo <strong>Ajuste SINIEF nº 09/2007</strong>, o <strong>CT-e (Modelo 57)</strong> é o documento fiscal de existência exclusivamente digital emitido pelas transportadoras para documentar a prestação de serviços de transporte de cargas interestadual e intermunicipal por qualquer modal (rodoviário, aéreo, aquaviário ou ferroviário).
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">Crédito de ICMS no Frete FOB</div>
                        <div className="text-slate-500 mt-0.5">Permite apropriação integral de crédito de ICMS sob o Art. 20 da LC 87/96 (Kandir) quando o frete acoberta insumos industriais.</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">Crédito PIS/COFINS (1,65% e 7,60%)</div>
                        <div className="text-slate-500 mt-0.5">Leis 10.637/2002 e 10.833/2003 garantem crédito de PIS e COFINS sobre frete na aquisição de insumos em Lucro Real.</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">Identificação do Tomador (toma3)</div>
                        <div className="text-slate-500 mt-0.5">Valida se o tomador do frete é o Remetente (CIF) ou o Destinatário (FOB) para auditoria de legitimidade do crédito.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consulta por Chave de Acesso */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-blue-600" />
                    <span>Chave de Acesso do CT-e (44 dígitos)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Modelo 57 (Posição 21-22)</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chaveConsulta}
                    onChange={(e) => setChaveConsulta(formatarChave(e.target.value))}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    placeholder="Chave de 44 dígitos do CT-e"
                  />
                  <button
                    type="button"
                    onClick={copiarChave}
                    className="px-3 py-2 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-1.5 shrink-0"
                    title="Copiar Chave para a área de transferência"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiado ? 'Copiada!' : 'Copiar'}</span>
                  </button>
                  <a
                    href={PORTAL_CONSULTA_URL}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-sm"
                    title="Abrir Portal Nacional da SEFAZ para consultar ou baixar o XML oficial do CT-e"
                  >
                    <span>Abrir Portal SEFAZ</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Botão de Teste com Exemplo Realista */}
              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-slate-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-blue-200 text-blue-900 rounded text-[10px] font-bold uppercase">
                      Cenário Realista
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Frete Rodoviário de Insumos (Braspress Logística R$ 12.800,00)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    Importe instantaneamente um CT-e Modelo 57 emitido pela Braspress Transportes Urgentes LTDA com 24.500 kg de matérias-primas químicas (SP ➔ RJ), ICMS 12% (R$ 1.536), PIS 1,65%, COFINS 7,60%, seguro averbado e NF-e vinculada.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCarregarExemploTransporte}
                  className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 hover:shadow"
                >
                  <PackageCheck className="w-4 h-4 text-blue-200" />
                  <span>Carregar Exemplo CT-e</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/30 hover:bg-blue-50/60 rounded-2xl p-8 text-center cursor-pointer transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xml"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-700 flex items-center justify-center transition mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Selecione ou arraste o arquivo XML do CT-e (.xml)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Arquivos autorizados pela SEFAZ com tag raiz &lt;cteProc&gt; ou &lt;CTe&gt; (Modelo 57)
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-blue-600" />
                  <span>Procurar no computador</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCarregarExemploTransporte}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline flex items-center gap-1"
                >
                  Ou clique aqui para testar com o XML de exemplo do CT-e de frete de insumos
                </button>
              </div>
            </div>
          )}

          {activeTab === 'colar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cole o código XML completo do CT-e:
                </label>
                <textarea
                  rows={8}
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  placeholder="Cole aqui o XML iniciando com <cteProc> ou <CTe>..."
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setXmlInput(SAMPLE_XML_CTE_TRANSPORTE)}
                  className="text-xs text-blue-700 hover:text-blue-900 font-semibold underline"
                >
                  Inserir XML de exemplo do CT-e
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={!xmlInput.trim()}
                    onClick={() => processarXml(xmlInput)}
                    className="px-4 py-2 text-xs font-bold text-white bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-sm"
                  >
                    Processar e Auditar CT-e
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé com Links Oficiais */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Legislação Aplicável:</span>
            <span>Ajuste SINIEF 09/2007 • Lei Complementar 87/96 (Kandir, art. 20) • Leis 10.637/10.833</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.cte.fazenda.gov.br/portal/legislacao.aspx?tipoConteudo=pld14pldXb8="
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>MOC CT-e v4.00</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.confaz.fazenda.gov.br/legislacao/ajustes/2007/ajuste-sinief-09-07"
              target="_blank"
              rel="noreferrer"
              className="text-blue-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ajuste SINIEF 09/2007</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
