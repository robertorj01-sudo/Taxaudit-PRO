import React, { useState } from 'react';
import { DocumentoFiscal, Empresa } from '../types/fiscal';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import {
  SAMPLE_XML_INTERESTADUAL_DIVERGENTE,
  SAMPLE_XML_MONOFASICO_PISCOFINS,
  SAMPLE_XML_REGULAR_APROVADO,
  SAMPLE_XML_NF3E_ENERGIA_INB,
  SAMPLE_XML_NFCOM_TELECOM,
  SAMPLE_XML_CTE_TRANSPORTE,
  SAMPLE_XML_FORNECEDOR_CNPJ_INAPTO
} from '../services/sampleData';
import {
  Upload,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  FilePlus,
  Eye,
  Trash2,
  Play,
  Copy,
  Check,
  Printer,
  FolderTree,
  HardDrive,
  FolderOpen,
  CalendarRange,
  Save,
  DownloadCloud,
  CopyX,
  ShieldAlert,
  ShieldCheck,
  AlertOctagon,
  Info,
  Zap,
  Radio,
  Wifi,
  Truck,
  TableProperties,
  Globe
} from 'lucide-react';
import { DanfeModal } from './DanfeModal';
import { DocumentoEntradaVisualizarModal } from './DocumentoEntradaVisualizarModal';
import { NetworkFolderSyncModal } from './NetworkFolderSyncModal';
import { Nf3eImportModal } from './Nf3eImportModal';
import { NfcomImportModal } from './NfcomImportModal';
import { CteImportModal } from './CteImportModal';
import { DuplicateDetectorModal } from './DuplicateDetectorModal';
import { ReceitaFederalValidatorModal } from './ReceitaFederalValidatorModal';
import { SiscomexNcmModal } from './SiscomexNcmModal';
import { ReceitaFederalService } from '../services/receitaFederalService';
import { StorageService } from '../services/storageService';

interface DocumentManagerViewProps {
  documentos: DocumentoFiscal[];
  setDocumentos: React.Dispatch<React.SetStateAction<DocumentoFiscal[]>>;
  empresa: Empresa;
  onSelectDoc: (docId: string) => void;
  onNavigate: (tab: any) => void;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
  onPrintDanfe?: (doc: DocumentoFiscal) => void;
}

export const DocumentManagerView: React.FC<DocumentManagerViewProps> = ({
  documentos,
  setDocumentos,
  empresa,
  onSelectDoc,
  onNavigate,
  onAddAuditLog,
  onPrintDanfe
}) => {
  const [xmlInput, setXmlInput] = useState('');
  const [showXmlModal, setShowXmlModal] = useState(false);
  const [viewingRawXml, setViewingRawXml] = useState<string | null>(null);
  const [viewingDanfeDoc, setViewingDanfeDoc] = useState<DocumentoFiscal | null>(null);
  const [viewingEntradaDoc, setViewingEntradaDoc] = useState<DocumentoFiscal | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [copiado, setCopiado] = useState(false);
  const [erroImportacao, setErroImportacao] = useState<string | null>(null);
  const [showFolderSyncModal, setShowFolderSyncModal] = useState(false);
  const [showNf3eModal, setShowNf3eModal] = useState(false);
  const [showNfcomModal, setShowNfcomModal] = useState(false);
  const [showCteModal, setShowCteModal] = useState(false);
  const [showRfbModal, setShowRfbModal] = useState(false);
  const [rfbInitialCnpj, setRfbInitialCnpj] = useState<string | undefined>(undefined);
  const [showSiscomexModal, setShowSiscomexModal] = useState(false);
  const [siscomexNcmFoco, setSiscomexNcmFoco] = useState<string | undefined>(undefined);
  const [showDuplicateDetectorModal, setShowDuplicateDetectorModal] = useState(false);
  const [salvandoLocal, setSalvandoLocal] = useState(false);
  const [caminhoPastaAtiva, setCaminhoPastaAtiva] = useState<string>(() => {
    return (
      localStorage.getItem('GEPAT_CAMINHO_PASTA_XML') ||
      'R:\\GEPAT.F$\\006. NOTAS FISCAIS DE ENTRADA PCVNF GEPAT.F\\XML_NF_Recebidas\\2026\\09_SET'
    );
  });
  const [alertaDuplicado, setAlertaDuplicado] = useState<{
    docNovo: DocumentoFiscal;
    docExistente: DocumentoFiscal;
  } | null>(null);

  // Validação assíncrona automática na Receita Federal ao importar qualquer documento
  const cruzarCadastroReceitaFederalAsync = async (docImportado: DocumentoFiscal) => {
    try {
      await Promise.all([
        ReceitaFederalService.consultarReceitaFederalOnline(
          docImportado.emitente.cnpjCpf,
          docImportado.emitente.razaoSocial,
          docImportado.emitente.uf
        ),
        ReceitaFederalService.consultarReceitaFederalOnline(
          docImportado.destinatario.cnpjCpf,
          docImportado.destinatario.razaoSocial,
          docImportado.destinatario.uf
        )
      ]);
      setDocumentos(prev =>
        prev.map(d =>
          d.id === docImportado.id || d.chaveAcesso === docImportado.chaveAcesso
            ? TaxRuleEngine.analisarDocumento(d, empresa).documentoAtualizado
            : d
        )
      );
    } catch (e) {
      // Mantém validação síncrona caso sem conexão externa
    }
  };

  const handleSalvarBaseLocal = () => {
    setSalvandoLocal(true);
    StorageService.salvarDocumentos(documentos);
    setTimeout(() => {
      setSalvandoLocal(false);
    }, 1200);
  };

  const handleProcessarXmlString = (xmlContent: string, forceReplace: boolean = false) => {
    try {
      setErroImportacao(null);
      const novoDoc = XmlFiscalParser.parseNFeXml(xmlContent);
      const resultado = TaxRuleEngine.analisarDocumento(novoDoc, empresa);
      const docAuditado = resultado.documentoAtualizado;

      // Verificar se o documento já existe na base pela Chave de Acesso ou Número/Série/Emitente
      const docExistente = documentos.find(
        d =>
          d.chaveAcesso === docAuditado.chaveAcesso ||
          (d.numero === docAuditado.numero &&
            d.serie === docAuditado.serie &&
            d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
      );

      if (docExistente && !forceReplace) {
        // Documento duplicado detectado!
        setAlertaDuplicado({
          docNovo: docAuditado,
          docExistente
        });
        return;
      }

      if (docExistente && forceReplace) {
        // Atualizar documento existente mantendo histórico
        setDocumentos(prev =>
          prev.map(d => (d.id === docExistente.id || d.chaveAcesso === docAuditado.chaveAcesso ? docAuditado : d))
        );
        onAddAuditLog(
          'IMPORTACAO',
          docAuditado.id,
          docAuditado.chaveAcesso,
          `Atualização/Reimportação da NF-e ${docAuditado.numero} (substituição de versão anterior na base).`
        );
      } else {
        // Inserir novo documento
        setDocumentos(prev => [docAuditado, ...prev]);
        onAddAuditLog(
          'IMPORTACAO',
          docAuditado.id,
          docAuditado.chaveAcesso,
          `Importação e auditoria automática da NF-e ${docAuditado.numero} com cruzamento cadastral Receita Federal (Chave: ${docAuditado.chaveAcesso})`
        );
      }

      // Dispara cruzamento online na Receita Federal em background
      cruzarCadastroReceitaFederalAsync(docAuditado);

      setShowXmlModal(false);
      setXmlInput('');
      setAlertaDuplicado(null);
    } catch (err: any) {
      setErroImportacao(err.message || 'Erro ao processar o XML');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (content) {
        handleProcessarXmlString(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteDoc = (id: string, chave: string) => {
    if (confirm('Deseja realmente remover este documento fiscal da base?')) {
      setDocumentos(prev => prev.filter(d => d.id !== id));
      onAddAuditLog('REJEICAO', id, chave, 'Exclusão do documento fiscal da base de escrituração.');
    }
  };

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const handleImportarNf3e = (docAuditado: DocumentoFiscal, forceReplace: boolean = false) => {
    const docExistente = documentos.find(
      d =>
        d.chaveAcesso === docAuditado.chaveAcesso ||
        (d.numero === docAuditado.numero &&
          d.serie === docAuditado.serie &&
          d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
    );

    if (docExistente && !forceReplace) {
      setAlertaDuplicado({
        docNovo: docAuditado,
        docExistente
      });
      return;
    }

    if (docExistente && forceReplace) {
      setDocumentos(prev => prev.map(d => (d.id === docExistente.id ? docAuditado : d)));
      onAddAuditLog('SUBSTITUICAO', docAuditado.id, docAuditado.chaveAcesso, 'NF3e substituída para evitar duplicidade.');
    } else {
      setDocumentos(prev => [docAuditado, ...prev]);
      onAddAuditLog('IMPORTACAO', docAuditado.id, docAuditado.chaveAcesso, 'Importação de NF3e de Energia Elétrica (Modelo 66 - SVRS).');
    }
  };

  const handleImportarNfcom = (docAuditado: DocumentoFiscal, forceReplace: boolean = false) => {
    const docExistente = documentos.find(
      d =>
        d.chaveAcesso === docAuditado.chaveAcesso ||
        (d.numero === docAuditado.numero &&
          d.serie === docAuditado.serie &&
          d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
    );

    if (docExistente && !forceReplace) {
      setAlertaDuplicado({
        docNovo: docAuditado,
        docExistente
      });
      return;
    }

    if (docExistente && forceReplace) {
      setDocumentos(prev => prev.map(d => (d.id === docExistente.id ? docAuditado : d)));
      onAddAuditLog('SUBSTITUICAO', docAuditado.id, docAuditado.chaveAcesso, 'NFCom Modelo 62 substituída para evitar duplicidade.');
    } else {
      setDocumentos(prev => [docAuditado, ...prev]);
      onAddAuditLog('IMPORTACAO', docAuditado.id, docAuditado.chaveAcesso, 'Importação de NFCom de Serviços de Comunicação (Modelo 62 - SVRS).');
    }
  };

  const handleImportarCte = (docAuditado: DocumentoFiscal, forceReplace: boolean = false) => {
    const docExistente = documentos.find(
      d =>
        d.chaveAcesso === docAuditado.chaveAcesso ||
        (d.numero === docAuditado.numero &&
          d.serie === docAuditado.serie &&
          d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
    );

    if (docExistente && !forceReplace) {
      setAlertaDuplicado({
        docNovo: docAuditado,
        docExistente
      });
      return;
    }

    if (docExistente && forceReplace) {
      setDocumentos(prev => prev.map(d => (d.id === docExistente.id ? docAuditado : d)));
      onAddAuditLog('SUBSTITUICAO', docAuditado.id, docAuditado.chaveAcesso, 'CT-e Modelo 57 substituído para evitar duplicidade.');
    } else {
      setDocumentos(prev => [docAuditado, ...prev]);
      onAddAuditLog('IMPORTACAO', docAuditado.id, docAuditado.chaveAcesso, 'Importação de CT-e Conhecimento de Transporte (Modelo 57 - SEFAZ).');
    }
  };

  const docsFiltrados = documentos.filter(doc => {
    if (filtroStatus === 'APROVADOS') return doc.status === 'APROVADO' || doc.status === 'ESCRITURADO';
    if (filtroStatus === 'DIVERGENCIAS') return doc.status === 'COM_DIVERGENCIAS';
    if (filtroStatus === 'NF3E') return doc.tipoDocumento === 'NF3E';
    if (filtroStatus === 'NFCOM') return doc.tipoDocumento === 'NFCOM';
    if (filtroStatus === 'CTE') return doc.tipoDocumento === 'CTE';
    return true;
  });

  return (
    <div id="document-manager-view" className="space-y-6">
      {/* Header & Ações */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight">Gestão de Documentos Fiscais Eletrônicos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Importe arquivos XML (NF-e, NF3e de Energia Elétrica, NFCom Telecom Modelo 62, CT-e, NFS-e) com extração instantânea e auditoria tributária automática.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* BOTÃO IMPORTAR CT-E (TRANSPORTE / PORTAL NACIONAL MODELO 57) */}
          <button
            id="btn-importar-cte"
            onClick={() => setShowCteModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-indigo-700 hover:bg-indigo-800 text-white transition flex items-center gap-1.5 shadow-sm"
            title="Importar ou Consultar CT-e Conhecimento de Transporte Eletrônico (Modelo 57) emitido pelo Portal SEFAZ"
          >
            <Truck className="w-4 h-4 text-indigo-200" />
            <span>Importar CT-e Frete (SEFAZ)</span>
          </button>

          {/* BOTÃO IMPORTAR NFCOM (TELECOMUNICAÇÃO / PORTAL SVRS MODELO 62) */}
          <button
            id="btn-importar-nfcom"
            onClick={() => setShowNfcomModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-cyan-700 hover:bg-cyan-800 text-white transition flex items-center gap-1.5 shadow-sm"
            title="Importar ou Consultar NFCom de Telecomunicações e Dados (Modelo 62) emitida pelo Portal SVRS"
          >
            <Radio className="w-4 h-4 text-cyan-200" />
            <span>Importar NFCom Telecom (SVRS)</span>
          </button>

          {/* BOTÃO IMPORTAR NF3E (ENERGIA ELÉTRICA / PORTAL SVRS) */}
          <button
            id="btn-importar-nf3e"
            onClick={() => setShowNf3eModal(true)}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-amber-600 hover:bg-amber-700 text-white transition flex items-center gap-1.5 shadow-sm"
            title="Importar ou Consultar NF3e de Energia Elétrica emitida pelo Portal SVRS"
          >
            <Zap className="w-4 h-4 text-amber-200" />
            <span>Importar NF3e Energia (SVRS)</span>
          </button>

          {/* BOTÃO ATUALIZAÇÃO INSTANTÂNEA NCM (PORTAL SISCOMEX CLASSIF) */}
          <button
            id="btn-atualizar-ncm-siscomex"
            onClick={() => {
              setSiscomexNcmFoco(undefined);
              setShowSiscomexModal(true);
            }}
            className="px-3 py-2 text-xs font-bold rounded-lg bg-blue-800 hover:bg-blue-900 text-white transition flex items-center gap-1.5 shadow-sm border border-blue-500/40"
            title="Atualização instantânea para NCM através do Portal Único Siscomex Classif (TIPI, IPI, ICMS, PIS/COFINS e IBS/CBS)"
          >
            <Globe className="w-4 h-4 text-cyan-300" />
            <span>Atualizar NCM (Siscomex)</span>
          </button>

          {/* BOTÃO SALVAR BASE FISCAL */}
          <button
            id="btn-salvar-base-documentos"
            onClick={handleSalvarBaseLocal}
            className={`px-3 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1.5 shadow-sm ${
              salvandoLocal
                ? 'bg-emerald-800 text-white'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow'
            }`}
            title="Salvar todas as NF-es importadas e alterações no banco local do navegador"
          >
            {salvandoLocal ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Base Salva!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-emerald-200" />
                <span>SALVAR BASE</span>
              </>
            )}
          </button>

          <button
            id="btn-relatorio-mensal-shortcut"
            onClick={() => onNavigate('relatorios')}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
            title="Abrir Relatório Mensal de Notas Fiscais (Separação Mês a Mês)"
          >
            <CalendarRange className="w-4 h-4 text-emerald-400" />
            Relatório Mensal
          </button>

          {/* BOTÃO AUDITAR DUPLICIDADES */}
          <button
            id="btn-verificar-duplicidades"
            onClick={() => setShowDuplicateDetectorModal(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 transition flex items-center gap-1.5 shadow-2xs"
            title="Visualizar e auditar arquivos duplicados na base para evitar duplicidade na escrituração"
          >
            <CopyX className="w-4 h-4 text-rose-600" />
            <span>Auditar Duplicidades</span>
          </button>

          <button
            id="btn-apontar-pasta-rede"
            onClick={() => setShowFolderSyncModal(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-blue-700 text-white hover:bg-blue-800 transition flex items-center gap-1.5 shadow-sm"
            title="Apontar e Sincronizar Pasta do Drive de Rede R:"
          >
            <FolderTree className="w-4 h-4 text-amber-300" />
            Apontar Pasta de Rede (Drive R:\...)
          </button>

          <label
            htmlFor="upload-xml-input"
            className="cursor-pointer px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Upload className="w-4 h-4" />
            Upload Arquivo XML
          </label>
          <input
            id="upload-xml-input"
            type="file"
            accept=".xml"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            id="btn-colar-xml"
            onClick={() => setShowXmlModal(true)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 text-white hover:bg-slate-900 transition flex items-center gap-1.5 shadow-sm"
          >
            <FileCode className="w-4 h-4" />
            Colar Texto XML
          </button>
        </div>
      </div>

      {/* Barra de Status do Apontamento de Pasta de Rede (Drive R:) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-4 rounded-xl shadow-sm border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-blue-300 tracking-wide uppercase">
                Diretório de Rede Vinculado (GEPAT.F$)
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Ativo
              </span>
            </div>
            <div className="font-mono text-xs text-slate-200 break-all select-all mt-0.5">
              {caminhoPastaAtiva}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={() => setShowFolderSyncModal(true)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-300" />
            Sincronizar / Ler Lote de XMLs
          </button>
        </div>
      </div>

      {/* Exemplos Rápidos para Testes Fiscais */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <FilePlus className="w-4 h-4 text-emerald-600" />
            Carregar Cenários Fiscais de Teste (XMLs Reais)
          </span>
          <span className="text-[11px] text-slate-500">Clique para importar instantaneamente</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_INTERESTADUAL_DIVERGENTE)}
            className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Cenário 1: Divergência de CFOP & ICMS
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              NF-e SP ➔ BA com CFOP 5102 (deveria ser 6102) e ICMS 18% (legal: 7% Res. SF 22/89).
            </p>
          </button>

          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_MONOFASICO_PISCOFINS)}
            className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Cenário 2: PIS/COFINS Monofásico Indevido
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Medicamento (NCM 3004) faturado com CST 01 em vez de CST 04 (alíquota zero - Lei 10.147/00).
            </p>
          </button>

          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_REGULAR_APROVADO)}
            className="p-3 bg-white hover:bg-emerald-50/60 border border-slate-200 hover:border-emerald-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
              Cenário 3: Operação Regular Aprovada
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              NF-e com todos os parâmetros fiscais e alíquotas 100% validadas pelo motor.
            </p>
          </button>

          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_NF3E_ENERGIA_INB)}
            className="p-3 bg-white hover:bg-amber-50/60 border border-slate-200 hover:border-amber-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-amber-700 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              Cenário 4: NF3e Energia Elétrica
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Light S.A. Modelo 66 (R$ 148.533) com crédito ICMS (85% industrial LC 87/96) e PIS/COFINS.
            </p>
          </button>

          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_NFCOM_TELECOM)}
            className="p-3 bg-white hover:bg-cyan-50/60 border border-slate-200 hover:border-cyan-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-cyan-700 flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-cyan-600" />
              Cenário 5: NFCom Telecom (Mod. 62)
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Vivo Telecom Modelo 62 (R$ 18.450) com Link Dedicado, FUST (1%), FUNTTEL (0,5%) e ICMS 18%.
            </p>
          </button>

          <button
            onClick={() => handleProcessarXmlString(SAMPLE_XML_CTE_TRANSPORTE)}
            className="p-3 bg-white hover:bg-indigo-50/60 border border-slate-200 hover:border-indigo-300 rounded-lg text-left transition group shadow-2xs"
          >
            <div className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-indigo-600" />
              Cenário 6: CT-e Frete Rodoviário (Mod. 57)
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Braspress Modelo 57 (R$ 4.850) Frete FOB com Tomada de Crédito ICMS 12% e PIS/COFINS (9,25%).
            </p>
          </button>
        </div>
      </div>

      {/* Filtros e Tabela de Documentos */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700">Filtrar:</span>
            <div className="flex gap-1 text-xs flex-wrap">
              <button
                onClick={() => setFiltroStatus('TODOS')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  filtroStatus === 'TODOS' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Todos ({documentos.length})
              </button>
              <button
                onClick={() => setFiltroStatus('CTE')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                  filtroStatus === 'CTE'
                    ? 'bg-indigo-700 text-white'
                    : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
                }`}
              >
                <Truck className="w-3 h-3" />
                CT-e Frete ({documentos.filter(d => d.tipoDocumento === 'CTE').length})
              </button>
              <button
                onClick={() => setFiltroStatus('NFCOM')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                  filtroStatus === 'NFCOM'
                    ? 'bg-cyan-700 text-white'
                    : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'
                }`}
              >
                <Radio className="w-3 h-3" />
                NFCom Telecom ({documentos.filter(d => d.tipoDocumento === 'NFCOM').length})
              </button>
              <button
                onClick={() => setFiltroStatus('NF3E')}
                className={`px-3 py-1 rounded-md font-medium transition flex items-center gap-1 ${
                  filtroStatus === 'NF3E'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
                }`}
              >
                <Zap className="w-3 h-3" />
                NF3e Energia ({documentos.filter(d => d.tipoDocumento === 'NF3E').length})
              </button>
              <button
                onClick={() => setFiltroStatus('DIVERGENCIAS')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  filtroStatus === 'DIVERGENCIAS'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                }`}
              >
                Com Divergências ({documentos.filter(d => d.status === 'COM_DIVERGENCIAS').length})
              </button>
              <button
                onClick={() => setFiltroStatus('APROVADOS')}
                className={`px-3 py-1 rounded-md font-medium transition ${
                  filtroStatus === 'APROVADOS'
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                Aprovados ({documentos.filter(d => d.status === 'APROVADO' || d.status === 'ESCRITURADO').length})
              </button>
            </div>
          </div>
          <span className="text-xs text-slate-400 font-mono">Total de Itens: {documentos.reduce((acc, d) => acc + d.itens.length, 0)}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Doc / Chave de Acesso</th>
                <th className="py-3 px-4">Emissão</th>
                <th className="py-3 px-4">Emitente</th>
                <th className="py-3 px-4">Destinatário</th>
                <th className="py-3 px-4">Valor Total</th>
                <th className="py-3 px-4">ICMS / IPI / PIS / COFINS</th>
                <th className="py-3 px-4">Auditoria Fiscal</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {docsFiltrados.map(doc => {
                const hasDivergencia = doc.ocorrencias.some(
                  o => o.severidade === 'DIVERGENCIA' || o.severidade === 'ERRO_PROVAVEL'
                );

                return (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setViewingEntradaDoc(doc)}
                          className="font-bold text-slate-900 hover:text-blue-700 font-mono text-left transition hover:underline flex items-center gap-1"
                          title="Clique para visualizar o Documento de Entrada completo com cabeçalho e itens"
                        >
                          {doc.tipoDocumento === 'CTE'
                            ? `CT-e ${doc.numero}`
                            : doc.tipoDocumento === 'NFCOM'
                            ? `NFCom ${doc.numero}`
                            : doc.tipoDocumento === 'NF3E'
                            ? `NF3e ${doc.numero}`
                            : `NF-e ${doc.numero}`}
                        </button>
                        {doc.tipoDocumento === 'CTE' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-indigo-100 text-indigo-900 border border-indigo-300 flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5 text-indigo-700" />
                            <span>MOD. 57</span>
                          </span>
                        )}
                        {doc.tipoDocumento === 'NFCOM' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-cyan-100 text-cyan-900 border border-cyan-300 flex items-center gap-0.5">
                            <Radio className="w-2.5 h-2.5 text-cyan-700" />
                            <span>MOD. 62</span>
                          </span>
                        )}
                        {doc.tipoDocumento === 'NF3E' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                            ⚡ MOD. 66
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono max-w-[170px] truncate" title={doc.chaveAcesso}>
                        {doc.chaveAcesso}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
                        <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold uppercase bg-slate-100 text-slate-600">
                          {doc.tipoOperacao} • SÉRIE {doc.serie}
                        </span>
                        {doc.dadosTransporteCTe && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                            {doc.dadosTransporteCTe.municipioInicio}/{doc.dadosTransporteCTe.ufInicio} ➔ {doc.dadosTransporteCTe.municipioFim}/{doc.dadosTransporteCTe.ufFim} ({doc.dadosTransporteCTe.tipoFrete || 'FOB'})
                          </span>
                        )}
                        {doc.dadosComunicacaoNFCom && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                            {doc.dadosComunicacaoNFCom.terminalOuCircuito}
                          </span>
                        )}
                        {doc.dadosEnergiaEletrica && (
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            UC {doc.dadosEnergiaEletrica.idAcessoUC}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(doc.dataEmissao).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 max-w-[160px] truncate">{doc.emitente.razaoSocial}</div>
                      <div className="text-[10px] text-slate-400">{doc.emitente.uf} • CNPJ {doc.emitente.cnpjCpf}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 max-w-[160px] truncate">{doc.destinatario.razaoSocial}</div>
                      <div className="text-[10px] text-slate-400">{doc.destinatario.uf} • CNPJ {doc.destinatario.cnpjCpf}</div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {formatMoeda(doc.valorTotalDocumento)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-0.5 text-[11px] font-mono text-slate-600">
                        <div>ICMS: <span className="font-medium text-slate-800">{formatMoeda(doc.totalIcms)}</span></div>
                        <div>IPI: <span className="font-medium text-slate-800">{formatMoeda(doc.totalIpi)}</span></div>
                        <div>PIS/COF: <span className="font-medium text-slate-800">{formatMoeda(doc.totalPis + doc.totalCofins)}</span></div>
                        <div className="text-emerald-700 font-medium flex items-center gap-1">
                          <span className="text-[9px] px-1 py-0.2 rounded bg-emerald-100 font-bold">LC 214</span>
                          <span>IBS/CBS: {formatMoeda((doc.totalIbs || 0) + (doc.totalCbs || 0))}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {hasDivergencia ? (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3 h-3" />
                            {doc.ocorrencias.length} Apontamento{doc.ocorrencias.length !== 1 ? 's' : ''}
                          </span>
                          <div className="text-[10px] text-amber-700 font-semibold">
                            Diff: {formatMoeda(doc.totalDivergenciasValor)}
                          </div>
                        </div>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Conforme (OK)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* BOTÃO VISUALIZAR DOCUMENTO DE ENTRADA (CABEÇALHO + LINHA DE PRODUTOS COMPLETA) */}
                        <button
                          title="Visualizar Documento de Entrada (Cabeçalho Geral e Linha de Produtos com Tributos)"
                          onClick={() => setViewingEntradaDoc(doc)}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-800 text-white transition flex items-center gap-1 shadow-2xs"
                        >
                          <TableProperties className="w-3.5 h-3.5 text-blue-200" />
                          <span>Visualizar</span>
                        </button>

                        <button
                          title="Imprimir DANFE / DACTE / Salvar em PDF"
                          onClick={() => {
                            if (onPrintDanfe) {
                              onPrintDanfe(doc);
                            } else {
                              setViewingDanfeDoc(doc);
                            }
                          }}
                          className="px-2 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-900 text-white transition flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3 text-emerald-400" />
                          {doc.tipoDocumento === 'CTE'
                            ? 'DACTE'
                            : doc.tipoDocumento === 'NFCOM'
                            ? 'DANFECOM'
                            : doc.tipoDocumento === 'NF3E'
                            ? 'DANF3E'
                            : 'DANFE'}
                        </button>
                        <button
                          title="Abrir Workbench de Auditoria Fiscal"
                          onClick={() => {
                            onSelectDoc(doc.id);
                            onNavigate('auditoria');
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1"
                        >
                          <Play className="w-3 h-3" />
                          Auditar
                        </button>
                        {doc.rawXml && (
                          <button
                            title="Ver XML Bruto"
                            onClick={() => setViewingRawXml(doc.rawXml || '')}
                            className="p-1 rounded text-slate-500 hover:bg-slate-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          title="Excluir documento"
                          onClick={() => handleDeleteDoc(doc.id, doc.chaveAcesso)}
                          className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Colar XML */}
      {showXmlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Importação Manual de XML NF-e</h3>
              <button
                onClick={() => setShowXmlModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            {erroImportacao && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-xs">
                {erroImportacao}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Cole o conteúdo do XML da NF-e:</label>
              <textarea
                rows={10}
                value={xmlInput}
                onChange={e => setXmlInput(e.target.value)}
                placeholder="<nfeProc xmlns='http://www.portalfiscal.inf.br/nfe' versao='4.00'>...</nfeProc>"
                className="w-full font-mono text-xs p-3 border border-slate-300 rounded-lg focus:outline-emerald-600"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowXmlModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleProcessarXmlString(xmlInput)}
                disabled={!xmlInput.trim()}
                className="px-4 py-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg disabled:opacity-50"
              >
                Processar e Auditar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Visualizar XML Bruto */}
      {viewingRawXml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full p-5 space-y-4 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-800 text-base">Conteúdo XML da NF-e</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(viewingRawXml);
                    setCopiado(true);
                    setTimeout(() => setCopiado(false), 2000);
                  }}
                  className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1"
                >
                  {copiado ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiado ? 'Copiado!' : 'Copiar XML'}
                </button>
                <button
                  onClick={() => setViewingRawXml(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-slate-900 text-slate-200 p-4 rounded-lg font-mono text-xs whitespace-pre">
              {viewingRawXml}
            </div>
          </div>
        </div>
      )}

      {/* Modal de Impressão de DANFE da NF-e */}
      {viewingDanfeDoc && (
        <DanfeModal
          documento={viewingDanfeDoc}
          onClose={() => setViewingDanfeDoc(null)}
        />
      )}

      {/* Modal de Alerta e Resolução de Documento Duplicado */}
      {alertaDuplicado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-amber-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-700 shrink-0">
                <CopyX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Documento Duplicado Detectado!
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Esta nota fiscal já consta cadastrada na base de dados para evitar duplicidade na escrituração fiscal.
                </p>
              </div>
            </div>

            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2 font-mono">
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Documento:</span>
                <span className="font-bold text-slate-800">
                  NF-e {alertaDuplicado.docNovo.numero} (Série {alertaDuplicado.docNovo.serie})
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Emitente:</span>
                <span className="font-semibold text-slate-700 truncate max-w-[240px]">
                  {alertaDuplicado.docNovo.emitente.razaoSocial}
                </span>
              </div>
              <div className="flex justify-between pb-1 border-b border-slate-200">
                <span className="text-slate-500">Valor Total:</span>
                <span className="font-bold text-emerald-700">
                  {formatMoeda(alertaDuplicado.docNovo.valorTotalDocumento)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px]">Chave de Acesso:</span>
                <span className="text-[11px] text-slate-700 break-all select-all font-mono">
                  {alertaDuplicado.docNovo.chaveAcesso}
                </span>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Ação recomendada:</strong> Manter o documento original e cancelar esta importação para não gerar tributação em duplicidade.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setAlertaDuplicado(null);
                  setShowXmlModal(false);
                  setXmlInput('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Cancelar (Ignorar Duplicata)
              </button>
              <button
                type="button"
                onClick={() => {
                  if (alertaDuplicado.docNovo.rawXml) {
                    handleProcessarXmlString(alertaDuplicado.docNovo.rawXml, true);
                  } else {
                    setDocumentos(prev =>
                      prev.map(d =>
                        d.id === alertaDuplicado.docExistente.id || d.chaveAcesso === alertaDuplicado.docNovo.chaveAcesso
                          ? alertaDuplicado.docNovo
                          : d
                      )
                    );
                    setAlertaDuplicado(null);
                    setShowXmlModal(false);
                    setXmlInput('');
                  }
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
              >
                Sobrescrever / Atualizar Versão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Apontamento e Sincronização de Pasta de Rede (Drive R:) */}
      {showFolderSyncModal && (
        <NetworkFolderSyncModal
          empresa={empresa}
          documentosExistentes={documentos}
          onClose={() => setShowFolderSyncModal(false)}
          onImportarDocumentos={(novosDocs, caminho) => {
            setDocumentos(prev => {
              // Mesclar atualizando existentes ou adicionando novos
              const chavesNovas = new Set(novosDocs.map(d => d.chaveAcesso));
              const filtradosAntigos = prev.filter(d => !chavesNovas.has(d.chaveAcesso));
              return [...novosDocs, ...filtradosAntigos];
            });
            setCaminhoPastaAtiva(caminho);
            if (novosDocs.length > 0) {
              onSelectDoc(novosDocs[0].id);
            }
          }}
          onAddAuditLog={onAddAuditLog}
        />
      )}

      {/* Modal de Importação de CT-e Conhecimento de Transporte (Portal SEFAZ) */}
      {showCteModal && (
        <CteImportModal
          empresa={empresa}
          documentosExistentes={documentos}
          onClose={() => setShowCteModal(false)}
          onImportarDocumento={(doc) => handleImportarCte(doc)}
        />
      )}

      {/* Modal de Importação de NFCom Serviços de Comunicação (Modelo 62 - SVRS) */}
      {showNfcomModal && (
        <NfcomImportModal
          empresa={empresa}
          documentosExistentes={documentos}
          onClose={() => setShowNfcomModal(false)}
          onImportarDocumento={(doc) => handleImportarNfcom(doc)}
        />
      )}

      {/* Modal de Importação de NF3e Energia Elétrica (Portal SVRS) */}
      {showNf3eModal && (
        <Nf3eImportModal
          empresa={empresa}
          documentosExistentes={documentos}
          onClose={() => setShowNf3eModal(false)}
          onImportarDocumento={(doc) => handleImportarNf3e(doc)}
        />
      )}

      {/* Modal de Auditoria e Visualização de Arquivos Duplicados */}
      {showDuplicateDetectorModal && (
        <DuplicateDetectorModal
          documentos={documentos}
          onClose={() => setShowDuplicateDetectorModal(false)}
          onRemoverDocumento={(id, chave) => handleDeleteDoc(id, chave)}
          onSimularTentativaDuplicada={(doc) => {
            setAlertaDuplicado({
              docNovo: doc,
              docExistente: doc
            });
          }}
        />
      )}

      {/* Modal de Visualização de Documento de Entrada (Conforme Modelo Solicitado) */}
      {viewingEntradaDoc && (
        <DocumentoEntradaVisualizarModal
          documento={viewingEntradaDoc}
          onClose={() => setViewingEntradaDoc(null)}
          onPrintDanfe={(doc) => {
            if (onPrintDanfe) {
              onPrintDanfe(doc);
            } else {
              setViewingDanfeDoc(doc);
            }
          }}
        />
      )}

      {/* Modal de Atualização Instantânea de NCM via Portal Siscomex Classif */}
      {showSiscomexModal && (
        <SiscomexNcmModal
          documentos={documentos}
          ncmInicial={siscomexNcmFoco}
          onClose={() => setShowSiscomexModal(false)}
          onAtualizarDocumentos={(novosDocs) => {
            setDocumentos(novosDocs);
            onAddAuditLog(
              'ANALISE_MOTOR',
              'SISCOMEX-NCM',
              'PORTAL-CLASSIF',
              'Sincronização em lote de NCMs com o Portal Único Siscomex Classif e atualização da base fiscal.'
            );
          }}
        />
      )}
    </div>
  );
};
