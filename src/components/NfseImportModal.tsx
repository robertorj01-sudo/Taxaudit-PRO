import React, { useState, useRef } from 'react';
import {
  Building2,
  FileText,
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  Copy,
  ArrowRight,
  X,
  Scale,
  Landmark,
  ShieldAlert,
  Search,
  Sparkles,
  Calculator,
  BookOpen
} from 'lucide-react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import { InternalDbService } from '../services/internalDbService';
import {
  NfseService,
  PREFEITURAS_BRASIL,
  LISTA_SERVICOS_LC116,
  SAMPLE_XML_NFSE_PADRAO_NACIONAL,
  SAMPLE_XML_NFSE_ABRASF_V2,
  SAMPLE_XML_NFSE_PAULISTANA,
  SAMPLE_XML_NFSE_CARIOCA
} from '../services/nfseService';

interface NfseImportModalProps {
  empresa: Empresa;
  documentosExistentes: DocumentoFiscal[];
  onClose: () => void;
  onImportarDocumento: (doc: DocumentoFiscal) => void;
}

export const NfseImportModal: React.FC<NfseImportModalProps> = ({
  empresa,
  documentosExistentes,
  onClose,
  onImportarDocumento
}) => {
  const [activeTab, setActiveTab] = useState<'exemplos' | 'upload' | 'colar' | 'prefeituras'>('exemplos');
  const [xmlInput, setXmlInput] = useState('');
  const [erroMensagem, setErroMensagem] = useState<string | null>(null);
  const [sucessoMensagem, setSucessoMensagem] = useState<string | null>(null);
  const [docPreVisualizacao, setDocPreVisualizacao] = useState<DocumentoFiscal | null>(null);
  const [filtroPrefeitura, setFiltroPrefeitura] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processarXml = async (xmlContent: string) => {
    try {
      setErroMensagem(null);
      setSucessoMensagem(null);

      const parsedDoc = XmlFiscalParser.parseNFeXml(xmlContent);

      if (parsedDoc.tipoDocumento !== 'NFSE' && !parsedDoc.dadosServicoNFSe) {
        throw new Error('O XML fornecido não contém uma estrutura válida de NFS-e (Nota Fiscal de Serviços Eletrônica).');
      }

      // Executa o motor de regras fiscais (ISSQN, retenções federais PIS/COFINS/INSS/IRRF e CFOP 1933/2933)
      const analise = TaxRuleEngine.analisarDocumento(parsedDoc, empresa);
      const docFinal = analise.documentoAtualizado;

      // Armazena no banco de dados interno e cofre de XML com SHA-256
      try {
        await InternalDbService.salvarArquivoXml({
          id: `XML-NFSE-${docFinal.id}-${Date.now().toString().slice(-4)}`,
          nomeArquivo: `NFSE_${docFinal.numero}_${docFinal.emitente.cnpjCpf.replace(/\D/g, '')}.xml`,
          chaveAcesso: docFinal.chaveAcesso,
          tipoDocumento: 'NFSE',
          dataExportacao: new Date().toISOString(),
          dataEmissao: docFinal.dataEmissao,
          tamanhoBytes: new Blob([xmlContent]).size,
          conteudoXml: xmlContent,
          emitenteRazao: docFinal.emitente.razaoSocial,
          emitenteCnpj: docFinal.emitente.cnpjCpf,
          destinatarioRazao: docFinal.destinatario.razaoSocial,
          destinatarioCnpj: docFinal.destinatario.cnpjCpf,
          valorTotal: docFinal.valorTotalDocumento,
          origem: 'IMPORTACAO_SALVA',
          observacoes: `NFS-e Prefeitura: ${docFinal.dadosServicoNFSe?.prefeituraEmissora || 'Municipal'} - Item LC 116: ${docFinal.dadosServicoNFSe?.itemListaServico || 'N/A'}`
        });
      } catch (dbErr) {
        console.warn('Registro no cofre de arquivos XML interno:', dbErr);
      }

      setDocPreVisualizacao(docFinal);
      onImportarDocumento(docFinal);
      setSucessoMensagem(
        `NFS-e Nº ${docFinal.numero} (${docFinal.dadosServicoNFSe?.prefeituraEmissora || 'Prefeitura Municipal'}) importada com sucesso no GEPAT!`
      );
    } catch (err: any) {
      setErroMensagem(err.message || 'Erro ao interpretar o arquivo XML da NFS-e.');
      setDocPreVisualizacao(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setXmlInput(content);
        processarXml(content);
      }
    };
    reader.onerror = () => {
      setErroMensagem('Falha ao ler o arquivo selecionado.');
    };
    reader.readAsText(file);
  };

  const prefeiturasFiltradas = Object.entries(PREFEITURAS_BRASIL).filter(
    ([ibge, pref]) =>
      pref.nome.toLowerCase().includes(filtroPrefeitura.toLowerCase()) ||
      pref.uf.toLowerCase().includes(filtroPrefeitura.toLowerCase()) ||
      ibge.includes(filtroPrefeitura) ||
      pref.padrao.toLowerCase().includes(filtroPrefeitura.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 flex justify-between items-start">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-violet-600/20 text-violet-400 rounded-xl border border-violet-500/30 shadow-inner">
              <Landmark className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-slate-100">
                  Leitura de NFS-e Municipal (Prefeituras do Brasil)
                </h2>
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">
                  LC 116/2003 & ISSQN
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Importação, auditoria de retenções federais, deduções municipais e classificação de aquisições de serviços (CFOP 1933/2933).
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Messages */}
        {erroMensagem && (
          <div className="mx-6 mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl flex items-center gap-3 text-rose-300 text-sm">
            <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            <div className="flex-1 font-medium">{erroMensagem}</div>
          </div>
        )}

        {sucessoMensagem && (
          <div className="mx-6 mt-4 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center gap-3 text-emerald-300 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div className="flex-1 font-medium">{sucessoMensagem}</div>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-6 gap-2 bg-slate-900/50 pt-3">
          <button
            onClick={() => setActiveTab('exemplos')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'exemplos'
                ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            Modelos de Prefeituras (Exemplos)
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'upload'
                ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload de Arquivo XML
          </button>
          <button
            onClick={() => setActiveTab('colar')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'colar'
                ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <FileCode className="w-4 h-4" />
            Colar XML
          </button>
          <button
            onClick={() => setActiveTab('prefeituras')}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'prefeituras'
                ? 'border-violet-500 text-violet-400 bg-violet-500/10 rounded-t-lg'
                : 'border-transparent text-slate-400 hover:text-slate-300 hover:bg-slate-800/40 rounded-t-lg'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Prefeituras Homologadas ({Object.keys(PREFEITURAS_BRASIL).length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'exemplos' && (
            <div className="space-y-4">
              <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60 flex items-start gap-3">
                <Landmark className="w-5 h-5 text-violet-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-slate-300">
                  <p className="font-medium text-slate-200">
                    Compatibilidade Universal com Padrões Municipais Brasileiros
                  </p>
                  <p className="text-slate-400 text-xs mt-0.5">
                    O GEPAT Fiscal processa nativamente o XML do Padrão Nacional (RFB/DPS), Padrão ABRASF (v1.0 e v2.0),
                    Nota Paulistana (São Paulo - SP), Nota Carioca (Rio de Janeiro - RJ) e layouts DSF, Ginfes, Betha e IPM.
                    Clique em um modelo para carregar e inspecionar imediatamente:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Padrão Nacional */}
                <div className="bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 rounded-xl p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/20 text-emerald-400 rounded-md border border-emerald-500/30">
                        Padrão Nacional (RFB / DPS)
                      </span>
                      <span className="text-xs text-slate-400">CGNFS-e Brasil</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-1">
                      Portal Nacional NFS-e (DPS nº 8941)
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Serviço: Desenvolvimento de Softwares (Item 01.02 LC 116). Emissor Simples Nacional, tomador com retenções federais e ISS devido no município.
                    </p>
                    <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div><strong className="text-slate-400">Valor Serviço:</strong> R$ 28.500,00</div>
                      <div><strong className="text-slate-400">Alíquota ISS:</strong> 3.50% (R$ 997,50)</div>
                      <div><strong className="text-slate-400">Retenções:</strong> PIS/COFINS/INSS/IRRF/CSLL</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setXmlInput(SAMPLE_XML_NFSE_PADRAO_NACIONAL);
                      processarXml(SAMPLE_XML_NFSE_PADRAO_NACIONAL);
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-violet-600/20"
                  >
                    <FileCode className="w-4 h-4" />
                    Carregar Exemplo Padrão Nacional
                  </button>
                </div>

                {/* 2. Padrão ABRASF v2.02 */}
                <div className="bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 rounded-xl p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-sky-500/20 text-sky-400 rounded-md border border-sky-500/30">
                        ABRASF v2.02
                      </span>
                      <span className="text-xs text-slate-400">Belo Horizonte - MG</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-1">
                      Prefeitura Municipal de Belo Horizonte (NFS-e 45290)
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Serviço: Consultoria em TI e Segurança (Item 01.06). Retenção de ISS pelo tomador (Responsável Tributário) + Retenções Federais.
                    </p>
                    <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div><strong className="text-slate-400">Valor Serviço:</strong> R$ 14.800,00</div>
                      <div><strong className="text-slate-400">ISS Retido:</strong> SIM (5.00% = R$ 740,00)</div>
                      <div><strong className="text-slate-400">Retenção Federal:</strong> R$ 865,80 (PIS, COFINS, CSLL)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setXmlInput(SAMPLE_XML_NFSE_ABRASF_V2);
                      processarXml(SAMPLE_XML_NFSE_ABRASF_V2);
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-sky-600/20"
                  >
                    <FileCode className="w-4 h-4" />
                    Carregar Exemplo ABRASF v2 (BH/Curitiba/SSA)
                  </button>
                </div>

                {/* 3. Padrão Paulistana (São Paulo - SP) */}
                <div className="bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 rounded-xl p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-amber-500/20 text-amber-400 rounded-md border border-amber-500/30">
                        Padrão Paulistana (Nota do Milhão)
                      </span>
                      <span className="text-xs text-slate-400">São Paulo - SP</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-1">
                      Prefeitura do Município de São Paulo (NFe 192837)
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Serviço: Assessoria e Consultoria Contábil e Fiscal (Item 17.01 LC 116 / Código Paulistana 02801).
                    </p>
                    <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div><strong className="text-slate-400">Valor Serviço:</strong> R$ 12.000,00</div>
                      <div><strong className="text-slate-400">ISS Paulistana:</strong> 2.00% (R$ 240,00)</div>
                      <div><strong className="text-slate-400">Cód. Tributação SP:</strong> 02801</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setXmlInput(SAMPLE_XML_NFSE_PAULISTANA);
                      processarXml(SAMPLE_XML_NFSE_PAULISTANA);
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-amber-600/20"
                  >
                    <FileCode className="w-4 h-4" />
                    Carregar Exemplo Nota Paulistana (SP)
                  </button>
                </div>

                {/* 4. Padrão Carioca (Rio de Janeiro - RJ) */}
                <div className="bg-slate-800/70 border border-slate-700/80 hover:border-violet-500/50 rounded-xl p-5 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 text-xs font-semibold bg-cyan-500/20 text-cyan-400 rounded-md border border-cyan-500/30">
                        Nota Carioca
                      </span>
                      <span className="text-xs text-slate-400">Rio de Janeiro - RJ</span>
                    </div>
                    <h3 className="text-base font-semibold text-slate-100 mb-1">
                      Prefeitura da Cidade do Rio de Janeiro (NFS-e 58210)
                    </h3>
                    <p className="text-xs text-slate-400 mb-3">
                      Serviço: Engenharia e Elaboração de Projetos (Item 07.03). Alíquota de 5.00% e retenções de seguridade social.
                    </p>
                    <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                      <div><strong className="text-slate-400">Valor Serviço:</strong> R$ 35.000,00</div>
                      <div><strong className="text-slate-400">Alíquota ISS:</strong> 5.00% (R$ 1.750,00)</div>
                      <div><strong className="text-slate-400">INSS Retido:</strong> R$ 3.850,00 (11%)</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setXmlInput(SAMPLE_XML_NFSE_CARIOCA);
                      processarXml(SAMPLE_XML_NFSE_CARIOCA);
                    }}
                    className="mt-4 w-full py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-lg shadow-cyan-600/20"
                  >
                    <FileCode className="w-4 h-4" />
                    Carregar Exemplo Nota Carioca (RJ)
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xml"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-700 hover:border-violet-500/60 rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer bg-slate-800/30 hover:bg-violet-950/10 transition-all group"
              >
                <div className="p-4 bg-violet-600/20 group-hover:bg-violet-600/30 text-violet-400 rounded-full mb-4 transition-colors">
                  <Upload className="w-8 h-8" />
                </div>
                <h4 className="text-base font-semibold text-slate-200 mb-1">
                  Clique ou arraste o arquivo XML da NFS-e aqui
                </h4>
                <p className="text-xs text-slate-400 max-w-md text-center">
                  Suporta arquivos .xml emitidos por qualquer prefeitura do Brasil ou pelo emissor nacional da Receita Federal (Padrão Nacional).
                </p>
                <button
                  type="button"
                  className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 transition-colors"
                >
                  Selecionar Arquivo no Computador
                </button>
              </div>
            </div>
          )}

          {activeTab === 'colar' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-2">
                  Cole o código XML completo da NFS-e (contendo tags &lt;CompNfse&gt;, &lt;Nfse&gt;, &lt;DPS&gt;, &lt;NotaFiscal&gt; ou &lt;tcInfNfse&gt;):
                </label>
                <textarea
                  value={xmlInput}
                  onChange={(e) => setXmlInput(e.target.value)}
                  placeholder="<?xml version='1.0' encoding='UTF-8'?>&#10;<CompNfse xmlns='http://www.abrasf.org.br/nfse.xsd'>&#10;  ..."
                  className="w-full h-56 bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                />
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setXmlInput('')}
                  disabled={!xmlInput}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Limpar
                </button>
                <button
                  onClick={() => processarXml(xmlInput)}
                  disabled={!xmlInput.trim()}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-violet-600/20"
                >
                  <FileCode className="w-4 h-4" />
                  Processar e Auditar XML
                </button>
              </div>
            </div>
          )}

          {activeTab === 'prefeituras' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={filtroPrefeitura}
                  onChange={(e) => setFiltroPrefeitura(e.target.value)}
                  placeholder="Pesquisar por município, sigla de UF, código IBGE ou padrão (ex: São Paulo, MG, 3550308, ABRASF)..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800/80 text-slate-400 border-b border-slate-800 sticky top-0">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Código IBGE</th>
                      <th className="py-2.5 px-4 font-semibold">Prefeitura Municipal</th>
                      <th className="py-2.5 px-4 font-semibold">UF</th>
                      <th className="py-2.5 px-4 font-semibold">Padrão Tecnológico</th>
                      <th className="py-2.5 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {prefeiturasFiltradas.map(([ibge, pref]) => (
                      <tr key={ibge} className="hover:bg-slate-800/40">
                        <td className="py-2.5 px-4 font-mono font-medium text-slate-400">{ibge}</td>
                        <td className="py-2.5 px-4 font-medium text-slate-200">{pref.nome}</td>
                        <td className="py-2.5 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300 font-semibold">
                            {pref.uf}
                          </span>
                        </td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                              pref.padrao === 'PADRAO_NACIONAL'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : pref.padrao === 'PAULISTANA'
                                ? 'bg-amber-500/20 text-amber-400'
                                : pref.padrao === 'CARIOCA'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-sky-500/20 text-sky-400'
                            }`}
                          >
                            {pref.padrao}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 text-emerald-400 font-medium flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Homologado
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Parsed NFS-e Document Visual Preview */}
          {docPreVisualizacao && (
            <div className="mt-6 border border-slate-700/80 bg-slate-800/40 rounded-2xl p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                      NFS-e Nº {docPreVisualizacao.numero} - Série {docPreVisualizacao.serie}
                      <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded font-medium border border-violet-500/30">
                        {docPreVisualizacao.dadosServicoNFSe?.padraoLayout || 'MUNICIPAL'}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      {docPreVisualizacao.dadosServicoNFSe?.prefeituraEmissora || 'Prefeitura Municipal'} | Emissão: {new Date(docPreVisualizacao.dataEmissao).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">Valor Total do Serviço</div>
                  <div className="text-lg font-bold text-emerald-400">
                    R$ {docPreVisualizacao.valorTotalDocumento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              {/* Grid Prestador / Tomador */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Prestador do Serviço (Emitente)
                  </span>
                  <div className="font-semibold text-slate-200 text-xs">
                    {docPreVisualizacao.emitente.razaoSocial}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    CNPJ: <span className="font-mono">{docPreVisualizacao.emitente.cnpjCpf}</span>
                    {docPreVisualizacao.emitente.inscricaoMunicipal && (
                      <span className="ml-2">IM: {docPreVisualizacao.emitente.inscricaoMunicipal}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {docPreVisualizacao.emitente.municipio} - {docPreVisualizacao.emitente.uf}
                  </div>
                </div>

                <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Tomador do Serviço (Destinatário / Empresa)
                  </span>
                  <div className="font-semibold text-slate-200 text-xs">
                    {docPreVisualizacao.destinatario.razaoSocial}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    CNPJ: <span className="font-mono">{docPreVisualizacao.destinatario.cnpjCpf}</span>
                    {docPreVisualizacao.destinatario.inscricaoMunicipal && (
                      <span className="ml-2">IM: {docPreVisualizacao.destinatario.inscricaoMunicipal}</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {docPreVisualizacao.destinatario.municipio} - {docPreVisualizacao.destinatario.uf}
                  </div>
                </div>
              </div>

              {/* Discriminação do Serviço e LC 116 */}
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-violet-400 bg-violet-950/60 px-2 py-0.5 rounded border border-violet-800/40">
                      LC 116/2003: Item {docPreVisualizacao.dadosServicoNFSe?.itemListaServico || 'Geral'}
                    </span>
                    <span className="text-xs text-slate-300 font-medium">
                      {docPreVisualizacao.dadosServicoNFSe?.descricaoItemListaServico}
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded border border-indigo-800/40">
                    CFOP {docPreVisualizacao.itens[0]?.cfop} - Aquisição de Serviço pelo Tomador
                  </span>
                </div>
                <div className="text-xs text-slate-300 bg-slate-950/80 p-2.5 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
                  {docPreVisualizacao.dadosServicoNFSe?.discriminacaoServico}
                </div>
              </div>

              {/* Tributos Municipais & Federais */}
              <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">Alíquota ISS</span>
                  <span className="text-xs font-bold text-slate-200">
                    {(docPreVisualizacao.dadosServicoNFSe?.aliquotaIss || 0).toFixed(2)}%
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">ISS Calculado</span>
                  <span className="text-xs font-bold text-slate-200">
                    R$ {(docPreVisualizacao.totalIss || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">ISS Retido?</span>
                  <span
                    className={`text-xs font-bold ${
                      docPreVisualizacao.dadosServicoNFSe?.issRetido ? 'text-amber-400' : 'text-slate-400'
                    }`}
                  >
                    {docPreVisualizacao.dadosServicoNFSe?.issRetido ? 'SIM (Tomador)' : 'NÃO (Prestador)'}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">PIS Retido</span>
                  <span className="text-xs font-bold text-slate-200">
                    R$ {(docPreVisualizacao.totalPis || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">COFINS Retido</span>
                  <span className="text-xs font-bold text-slate-200">
                    R$ {(docPreVisualizacao.totalCofins || 0).toFixed(2)}
                  </span>
                </div>
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 block">INSS Retido</span>
                  <span className="text-xs font-bold text-slate-200">
                    R$ {(docPreVisualizacao.totalInss || 0).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Botão de Fechar / Concluir */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={onClose}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-600/20"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Concluir e Exibir no Painel Fiscal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-violet-400" />
            <span>Regras Tributárias: Lei Complementar nº 116/2003 e Instruções Normativas RFB 1.234 / 2.145</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium rounded-lg transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
