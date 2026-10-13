import React, { useState, useRef } from 'react';
import {
  Wifi,
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
  Radio,
  ArrowRight,
  X,
  Server,
  Network
} from 'lucide-react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import { SAMPLE_XML_NFCOM_TELECOM } from '../services/sampleData';

interface NfcomImportModalProps {
  empresa: Empresa;
  documentosExistentes: DocumentoFiscal[];
  onClose: () => void;
  onImportarDocumento: (doc: DocumentoFiscal) => void;
}

export const NfcomImportModal: React.FC<NfcomImportModalProps> = ({
  empresa,
  documentosExistentes,
  onClose,
  onImportarDocumento
}) => {
  const [activeTab, setActiveTab] = useState<'portal' | 'upload' | 'colar'>('portal');
  const [chaveConsulta, setChaveConsulta] = useState('35260302558157000162620010000078411000078410');
  const [xmlInput, setXmlInput] = useState('');
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PORTAL_SVRS_URL = 'https://dfe-portal.svrs.rs.gov.br/Nfcom';
  const PORTAL_CONSULTA_URL = 'https://dfe-portal.svrs.rs.gov.br/Nfcom/Consulta';

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

      if (parsedDoc.tipoDocumento !== 'NFCOM' && !xmlContent.includes('infNFCom') && !xmlContent.includes('mod>62')) {
        console.info('Documento importado não identificado nativamente como Modelo 62');
      }

      // Executa motor de regras com validação de ICMS, PIS/COFINS, FUST e FUNTTEL
      const resultado = TaxRuleEngine.analisarDocumento(parsedDoc, empresa);
      const docFinal = resultado.documentoAtualizado;

      onImportarDocumento(docFinal);
      setSucessoMensagem(`NFCom Nº ${docFinal.numero} (Modelo 62 - Telecom) importada e auditada com sucesso!`);
      setTimeout(() => {
        onClose();
      }, 1300);
    } catch (err: any) {
      setErroMensagem(err.message || 'Erro ao interpretar o XML da NFCom.');
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

  const handleCarregarExemploVivo = () => {
    processarXml(SAMPLE_XML_NFCOM_TELECOM);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header do Modal */}
        <div className="bg-gradient-to-r from-cyan-900 via-sky-900 to-indigo-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-xl transition"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300 shadow-inner">
              <Radio className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-400/20 text-cyan-200 border border-cyan-400/40 uppercase tracking-wider">
                  NFCom Modelo 62 • Ajuste SINIEF 07/2022
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-400/20 text-emerald-200 border border-emerald-400/40 uppercase">
                  SEFAZ / SVRS Autorizadora
                </span>
              </div>
              <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                Importação & Consulta de NFCom (Serviços de Comunicação)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                Nota Fiscal Fatura Eletrônica de Serviços de Comunicação (Modelo 62) para Internet Banda Larga, Links Dedicados, Dados e Telefonia.
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
              <ExternalLink className="w-4 h-4 text-cyan-500" />
              <span>Portal SVRS & Exemplo Oficial</span>
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'upload'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Upload className="w-4 h-4 text-cyan-500" />
              <span>Upload de Arquivo XML</span>
            </button>
            <button
              onClick={() => setActiveTab('colar')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'colar'
                  ? 'bg-white text-slate-900 shadow-md'
                  : 'bg-white/10 text-slate-200 hover:bg-white/15'
              }`}
            >
              <FileCode className="w-4 h-4 text-cyan-500" />
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
              {/* Card Explicativo sobre a NFCom */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-cyan-100 text-cyan-800 rounded-lg shrink-0 mt-0.5">
                    <Wifi className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">
                      O que é a NFCom (Modelo 62)?
                    </h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Instituída pelo <strong>Ajuste SINIEF nº 07/2022</strong> pelo Conselho Nacional de Política Fazendária (CONFAZ), a <strong>NFCom (Modelo 62)</strong> é o documento fiscal digital obrigatório para acobertar prestações de serviços de telecomunicação, internet banda larga, links dedicados de transmissão de dados, telefonia e TV por assinatura. Ela substitui em definitivo as antigas <em>Notas Fiscais de Comunicação (Modelo 21)</em> e <em>Notas Fiscais de Telecomunicações (Modelo 22)</em> em todo o território nacional.
                    </p>
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">Ambiente SVRS Nacional</div>
                        <div className="text-slate-500 mt-0.5">A SEFAZ Virtual do RS (SVRS) é a autorizadora centralizada da NFCom para quase todos os estados brasileiros.</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">Créditos de ICMS e PIS/COFINS</div>
                        <div className="text-slate-500 mt-0.5">Permite apropriação de créditos fiscais nos termos do Art. 33 da Lei Kandir e Leis 10.637/10.833.</div>
                      </div>
                      <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                        <div className="font-bold text-slate-800">FUST (1%) e FUNTTEL (0,5%)</div>
                        <div className="text-slate-500 mt-0.5">Segregação automática das contribuições de telecomunicações e integração com SPED Fiscal Bloco D.</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Consulta por Chave de Acesso */}
              <div className="border border-slate-200 rounded-xl p-4.5 bg-white shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-cyan-600" />
                    <span>Chave de Acesso da NFCom (44 dígitos)</span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400">Modelo 62 (Posição 21-22)</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chaveConsulta}
                    onChange={(e) => setChaveConsulta(formatarChave(e.target.value))}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                    placeholder="Chave de 44 dígitos da NFCom"
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
                    className="px-4 py-2 text-xs font-bold bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg transition flex items-center gap-1.5 shrink-0 shadow-sm"
                    title="Abrir Portal Nacional da SVRS para consultar ou baixar o XML oficial"
                  >
                    <span>Abrir Portal SVRS</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Botão de Teste com Exemplo Realista */}
              <div className="bg-gradient-to-r from-cyan-50 via-sky-50 to-indigo-50 border border-cyan-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-cyan-200 text-cyan-900 rounded text-[10px] font-bold uppercase">
                      Cenário Realista
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      Fatura de Telecomunicações & Link Dedicado 1Gbps (Vivo / Telefônica)
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    Importe instantaneamente uma NFCom Modelo 62 completa (R$ 18.450,00) emitida pela Telefônica Brasil S/A com Link IP 1Gbps, Rede SD-WAN, ICMS 18%, PIS/COFINS, FUST (1%) e FUNTTEL (0,5%).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCarregarExemploVivo}
                  className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-sm shrink-0 hover:shadow"
                >
                  <Server className="w-4 h-4 text-cyan-200" />
                  <span>Carregar Exemplo NFCom</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-cyan-300 hover:border-cyan-500 bg-cyan-50/30 hover:bg-cyan-50/60 rounded-2xl p-8 text-center cursor-pointer transition group"
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xml"
                  className="hidden"
                />
                <div className="w-14 h-14 mx-auto rounded-full bg-cyan-100 group-hover:bg-cyan-200 text-cyan-700 flex items-center justify-center transition mb-3">
                  <Upload className="w-7 h-7" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">
                  Selecione ou arraste o arquivo XML da NFCom (.xml)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Arquivos autorizados pelo Portal SVRS com tag raiz &lt;NFCom&gt; ou &lt;nfcomProc&gt;
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700 shadow-2xs">
                  <FileText className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Procurar no computador</span>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleCarregarExemploVivo}
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold underline flex items-center gap-1"
                >
                  Ou clique aqui para testar com o XML de exemplo da NFCom Modelo 62
                </button>
              </div>
            </div>
          )}

          {activeTab === 'colar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Cole o código XML completo da NFCom:
                </label>
                <textarea
                  rows={8}
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  placeholder="Cole aqui o XML iniciando com <nfcomProc> ou <NFCom>..."
                  className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setXmlInput(SAMPLE_XML_NFCOM_TELECOM)}
                  className="text-xs text-cyan-700 hover:text-cyan-900 font-semibold underline"
                >
                  Inserir XML de exemplo da NFCom
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
                    className="px-4 py-2 text-xs font-bold text-white bg-cyan-700 hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-sm"
                  >
                    Processar e Auditar XML
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
            <span>Ajuste SINIEF 07/2022 • Lei Complementar 87/96 (Kandir) • Leis 10.637/10.833</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://dfe-portal.svrs.rs.gov.br/Nfcom/Documentos"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>MOC NFCom v1.00</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <a
              href="https://www.confaz.fazenda.gov.br/legislacao/ajustes/2022/ajuste-sinief-07-22"
              target="_blank"
              rel="noreferrer"
              className="text-cyan-700 hover:underline flex items-center gap-1 font-medium"
            >
              <span>Ajuste SINIEF 07/2022</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
