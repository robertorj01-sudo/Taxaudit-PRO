import React, { useState, useRef } from 'react';
import {
  Zap,
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
  Flame,
  ArrowRight,
  X
} from 'lucide-react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import { SAMPLE_XML_NF3E_ENERGIA_INB } from '../services/sampleData';

interface Nf3eImportModalProps {
  empresa: Empresa;
  documentosExistentes: DocumentoFiscal[];
  onClose: () => void;
  onImportarDocumento: (doc: DocumentoFiscal) => void;
}

export const Nf3eImportModal: React.FC<Nf3eImportModalProps> = ({
  empresa,
  documentosExistentes,
  onClose,
  onImportarDocumento
}) => {
  const [activeTab, setActiveTab] = useState<'portal' | 'upload' | 'colar'>('portal');
  const [chaveConsulta, setChaveConsulta] = useState('33260333050196000188660010000084521000845210');
  const [xmlInput, setXmlInput] = useState('');
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);
  const [copiado, setCopiado] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const PORTAL_SVRS_URL = 'https://dfe-portal.svrs.rs.gov.br/Nf3e';
  const PORTAL_CONSULTA_URL = 'https://dfe-portal.svrs.rs.gov.br/Nf3e/Consulta';

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

      if (parsedDoc.tipoDocumento !== 'NF3E' && !xmlContent.includes('infNF3e') && !xmlContent.includes('mod>66')) {
        // Ainda assim processa, mas alerta que não é modelo 66
        console.info('Documento importado não identificado como Modelo 66');
      }

      // Executa o motor de auditoria normativa (regras de energia, Kandir, PIS/COFINS)
      const resultado = TaxRuleEngine.analisarDocumento(parsedDoc, empresa);
      const docFinal = resultado.documentoAtualizado;

      onImportarDocumento(docFinal);
      setSucessoMensagem(`NF3e Nº ${docFinal.numero} de Energia Elétrica importada e auditada com sucesso!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErroMensagem(err.message || 'Erro ao interpretar o XML da NF3e.');
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

  const handleCarregarExemploInb = () => {
    processarXml(SAMPLE_XML_NF3E_ENERGIA_INB);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-5 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Cabeçalho */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-600 border border-amber-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Importação & Consulta NF3e (Energia Elétrica - Modelo 66)
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  SVRS SEFAZ
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Portal Nacional da SVRS para notas fiscais de energia elétrica recebidas.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificações de Erro e Sucesso */}
        {erroMensagem && (
          <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{erroMensagem}</span>
          </div>
        )}

        {sucessoMensagem && (
          <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{sucessoMensagem}</span>
          </div>
        )}

        {/* Abas */}
        <div className="flex border-b border-slate-200 mt-4 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('portal')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'portal'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Portal SVRS (Instruções & Consulta)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Arquivo .XML
          </button>
          <button
            onClick={() => setActiveTab('colar')}
            className={`pb-2.5 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'colar'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Colar Texto XML
          </button>
        </div>

        {/* Conteúdo da Aba 1: Portal SVRS */}
        {activeTab === 'portal' && (
          <div className="mt-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-slate-600" />
                  Ambiente Autorizador Nacional NF3e (SVRS)
                </span>
                <a
                  href={PORTAL_SVRS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-amber-600 hover:text-amber-800 font-bold hover:underline"
                >
                  {PORTAL_SVRS_URL}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                A <strong>SEFAZ Virtual do RS (SVRS)</strong> é o ambiente nacional que autoriza e armazena as Notas Fiscais de Energia Elétrica Eletrônicas (NF3e - Modelo 66) para distribuidoras de energia e a maioria dos estados da federação.
              </p>

              <div className="pt-2 border-t border-slate-200">
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Chave de Acesso da NF3e (44 dígitos):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chaveConsulta}
                    onChange={(e) => setChaveConsulta(formatarChave(e.target.value))}
                    className="flex-1 px-3 py-2 text-xs font-mono bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="33260333050196000188660010000084521000845210"
                    maxLength={44}
                  />
                  <button
                    type="button"
                    onClick={copiarChave}
                    className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                    title="Copiar Chave"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiado ? 'Copiado!' : 'Copiar'}
                  </button>
                  <a
                    href={`${PORTAL_CONSULTA_URL}?chave=${chaveConsulta}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Consultar no Portal
                  </a>
                </div>
              </div>
            </div>

            {/* Passo a Passo */}
            <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/70 space-y-2">
              <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                Como baixar e importar para o sistema:
              </h4>
              <ol className="text-xs text-amber-900 space-y-1.5 list-decimal list-inside pl-1">
                <li>
                  Acesse o portal <strong>dfe-portal.svrs.rs.gov.br/Nf3e</strong> e entre na opção <em>Consulta Pública</em>.
                </li>
                <li>
                  Insira a Chave de Acesso de 44 dígitos da fatura de energia e valide com o Certificado Digital (e-CNPJ) da empresa.
                </li>
                <li>
                  Clique em <strong>"Download do XML do Documento Fiscal"</strong>.
                </li>
                <li>
                  Retorne aqui e faça o upload na aba <em>Upload Arquivo .XML</em> para apuração automática de:
                  <ul className="list-disc list-inside pl-4 mt-1 font-semibold text-slate-800 space-y-0.5">
                    <li>Crédito de ICMS proporcional ao laudo industrial (LC 87/96 Kandir)</li>
                    <li>Crédito de PIS (1,65%) e COFINS (7,60%) não-cumulativo (Leis 10.637/10.833)</li>
                    <li>CFOP de entrada industrial 1.253 / 2.253</li>
                  </ul>
                </li>
              </ol>
            </div>

            {/* Ação Rápida: Carregar Exemplo Realista */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-emerald-200 text-emerald-800 text-[10px] font-bold">
                    EXEMPLO OFICIAL
                  </span>
                  <span className="text-xs font-bold text-emerald-950">
                    NF3e Fatura de Energia Elétrica (R$ 148.533,25)
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Carregue um XML pré-formatado no layout NF3e da SVRS contendo TUSD, TE, ICMS com crédito e PIS/COFINS.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCarregarExemploInb}
                className="shrink-0 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition"
              >
                <Zap className="w-4 h-4" />
                Carregar NF3e Exemplo
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 2: Upload */}
        {activeTab === 'upload' && (
          <div className="mt-4 space-y-4">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-amber-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-amber-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="mx-auto w-12 h-12 rounded-full bg-amber-100 group-hover:bg-amber-200 flex items-center justify-center text-amber-700 mb-3 transition">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800 mb-1">
                Clique para selecionar o XML da NF3e ou arraste o arquivo aqui
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Suporte aos arquivos de NF3e baixados do Portal SVRS (Modelo 66 - Fornecimento de Energia Elétrica).
              </p>
            </div>

            <div className="flex justify-between items-center text-xs text-slate-500 px-1">
              <span>Layout suportado: NF3e v1.00 (MOC SEFAZ/SVRS)</span>
              <button
                type="button"
                onClick={handleCarregarExemploInb}
                className="text-amber-700 font-bold hover:underline flex items-center gap-1"
              >
                <Zap className="w-3.5 h-3.5" />
                Usar XML de Exemplo NF3e
              </button>
            </div>
          </div>
        )}

        {/* Conteúdo da Aba 3: Colar XML */}
        {activeTab === 'colar' && (
          <div className="mt-4 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Conteúdo do XML da NF3e:
              </label>
              <textarea
                value={xmlInput}
                onChange={(e) => setXmlInput(e.target.value)}
                placeholder="Cole aqui o XML completo da NF3e (<nf3eProc> ou <NF3e>)..."
                rows={9}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setXmlInput(SAMPLE_XML_NF3E_ENERGIA_INB)}
                className="text-xs text-amber-700 font-semibold hover:underline flex items-center gap-1"
              >
                <FileCode className="w-3.5 h-3.5" />
                Preencher com XML de Exemplo NF3e
              </button>
              <button
                type="button"
                onClick={() => processarXml(xmlInput)}
                disabled={!xmlInput.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Processar & Auditar NF3e
              </button>
            </div>
          </div>
        )}

        {/* Rodapé */}
        <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Auditoria Fiscal: LC 87/96 (Kandir) & Leis 10.637/10.833 (PIS/COFINS)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
