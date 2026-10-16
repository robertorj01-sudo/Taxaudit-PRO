import React, { useState } from 'react';
import { Sidebar, ActiveTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { DocumentManagerView } from './components/DocumentManagerView';
import { MonthlyReportView } from './components/MonthlyReportView';
import { AuditWorkbenchView } from './components/AuditWorkbenchView';
import { TaxRuleEngineView } from './components/TaxRuleEngineView';
import { EscrituracaoSpedView } from './components/EscrituracaoSpedView';
import { ProtheusIntegrationView } from './components/ProtheusIntegrationView';
import { AuditTrailView } from './components/AuditTrailView';
import { ReformaTributariaView } from './components/ReformaTributariaView';
import { ArchitectureDocsView } from './components/ArchitectureDocsView';
import { UserManualView } from './components/UserManualView';
import { ManifestoDestinatarioView } from './components/ManifestoDestinatarioView';
import { EmpresaConfigView } from './components/EmpresaConfigView';
import { UsuariosAppView } from './components/UsuariosAppView';
import { CertificadoDigitalView } from './components/CertificadoDigitalView';
import { LicencaComercialView } from './components/LicencaComercialView';
import { CloudHostingGuideView } from './components/CloudHostingGuideView';
import { SiscomexNcmModal } from './components/SiscomexNcmModal';
import { CnaeConsultationView } from './components/CnaeConsultationView';
import { ClassificacaoCfopView } from './components/ClassificacaoCfopView';
import { InternalDatabaseView } from './components/InternalDatabaseView';
import {
  DocumentoFiscal,
  Empresa,
  RegistroTrilhaAuditoria,
  Registro_GEPAT_Fiscal,
  UsuarioApp,
  CertificadoDigitalInfo,
  LicencaComercial
} from './types/fiscal';
import { EMPRESA_PADRAO, getDocumentosIniciais } from './services/sampleData';
import { StorageService } from './services/storageService';
import { InternalDbService } from './services/internalDbService';
import { DanfeModal } from './components/DanfeModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import {
  Bell,
  Search,
  User,
  ShieldCheck,
  Printer,
  Monitor,
  Save,
  CheckCircle,
  DownloadCloud,
  RotateCcw,
  BookOpen,
  Sparkles,
  Award,
  Database
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [empresa, setEmpresa] = useState<Empresa>(() => StorageService.carregarEmpresa());
  const [documentos, setDocumentos] = useState<DocumentoFiscal[]>(() => StorageService.carregarDocumentos());
  const [usuarios, setUsuarios] = useState<UsuarioApp[]>(() => StorageService.carregarUsuarios());
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioApp>(() => {
    const lista = StorageService.carregarUsuarios();
    return lista[0] || {
      id: 'USR-001',
      nome: 'Roberto Pereira de Oliveira',
      email: 'roberto.pereira@empresa.com.br',
      cargo: 'Administrador Fiscal & Compliance',
      departamento: 'Controladoria & Tributário',
      perfil: 'ADMIN_MASTER',
      ativo: true,
      dataCadastro: '2026-01-10'
    };
  });
  const [certificado, setCertificado] = useState<CertificadoDigitalInfo>(() => StorageService.carregarCertificado());
  const [licenca, setLicenca] = useState<LicencaComercial>(() => StorageService.carregarLicenca());

  const [selectedDocId, setSelectedDocId] = useState<string | null>(() => {
    const docs = StorageService.carregarDocumentos();
    return docs[0]?.id || null;
  });
  const [viewingDanfeDoc, setViewingDanfeDoc] = useState<DocumentoFiscal | null>(null);
  const [showPwaModal, setShowPwaModal] = useState(false);
  const [salvandoEstado, setSalvandoEstado] = useState<'ocioso' | 'salvando' | 'salvo'>('ocioso');
  const [ultimaDataSalva, setUltimaDataSalva] = useState<string | null>(() => StorageService.getUltimaDataSalva());

  // Trilha de Auditoria com registros iniciais persistidos
  const [auditLogs, setAuditLogs] = useState<Registro_GEPAT_Fiscal[]>(() => {
    const logsIniciais: Registro_GEPAT_Fiscal[] = [
      {
        id: 'LOG-001',
        dataHora: new Date(Date.now() - 3600000 * 4).toISOString(),
        usuario: 'Roberto Pereira de Oliveira',
        perfilUsuario: 'ASSISTENTE DE ADMINISTRAÇÃO SENIOR',
        usuarioNome: 'Roberto Pereira de Oliveira',
        usuarioEmail: 'roberto.pereira@inb.gov.br',
        operacao: 'IMPORTACAO',
        documentoId: 'DOC-001',
        chaveAcesso: '35260312345678000190550010000123451000123456',
        regrasExecutadas: ['REG-CFOP-INTERESTADUAL', 'REG-ICMS-RES-SF-22', 'REG-PIS-COFINS-LR'],
        divergenciasIdentificadas: [
          'CFOP informado 5102 em operação interestadual SP->BA',
          'Alíquota de ICMS informada 18% em vez de 7%'
        ],
        justificativa: 'Importação do arquivo XML da NF-e 12345 e execução do motor de regras normativo.',
        versaoMotorRegras: 'v1.0.0-PROD'
      },
      {
        id: 'LOG-002',
        dataHora: new Date(Date.now() - 3600000 * 3).toISOString(),
        usuario: 'Roberto Pereira de Oliveira',
        perfilUsuario: 'ASSISTENTE DE ADMINISTRAÇÃO SENIOR',
        usuarioNome: 'Roberto Pereira de Oliveira',
        usuarioEmail: 'roberto.pereira@inb.gov.br',
        operacao: 'IMPORTACAO',
        documentoId: 'DOC-002',
        chaveAcesso: '35260398765432000199550010000543211000543219',
        regrasExecutadas: ['REG-PIS-COFINS-MONOFASICO-MED'],
        divergenciasIdentificadas: [
          'CST PIS/COFINS tributado (01) em produto monofásico NCM 3004 com alíquota zero (CST 04)'
        ],
        justificativa: 'Identificação de pagamento indevido de PIS e COFINS monofásico pela Lei 10.147/00.',
        versaoMotorRegras: 'v1.0.0-PROD'
      },
      {
        id: 'LOG-003',
        dataHora: new Date(Date.now() - 3600000 * 2).toISOString(),
        usuario: 'Dra. Mariana Vasconcelos',
        perfilUsuario: 'COORDENADORA_TRIBUTARIA',
        usuarioNome: 'Dra. Mariana Vasconcelos',
        usuarioEmail: 'mariana.vasconcelos@tributos.adv.br',
        operacao: 'APROVACAO',
        documentoId: 'DOC-003',
        chaveAcesso: '35260311223344000188550010000987651000987654',
        regrasExecutadas: ['REG-ICMS-INTERNO-SP', 'REG-IPI-GERAL', 'REG-PIS-COFINS-LR'],
        divergenciasIdentificadas: [],
        justificativa: 'NF-e 98765 100% conforme. Aprovada para escrituração no SPED e envio ao TOTVS Protheus.',
        versaoMotorRegras: 'v1.0.0-PROD'
      }
    ];
    return StorageService.carregarLogs(logsIniciais);
  });

  // Salvar Manualmente com Feedback Visual Imediato
  const handleSalvarManual = () => {
    setSalvandoEstado('salvando');
    StorageService.salvarDocumentos(documentos);
    StorageService.salvarEmpresa(empresa);
    StorageService.salvarUsuarios(usuarios);
    StorageService.salvarCertificado(certificado);
    StorageService.salvarLicenca(licenca);
    StorageService.salvarLogs(auditLogs);
    setUltimaDataSalva(new Date().toISOString());

    // Salvar também no Banco de Dados Interno (IndexedDB + Servidor)
    InternalDbService.salvarTudo({
      documentos,
      empresa,
      usuarios,
      certificado,
      licenca,
      logs: auditLogs
    }).then(() => {
      setSalvandoEstado('salvo');
      setTimeout(() => {
        setSalvandoEstado('ocioso');
      }, 2500);
    }).catch(() => {
      setSalvandoEstado('salvo');
      setTimeout(() => {
        setSalvandoEstado('ocioso');
      }, 2500);
    });
  };

  // Carregamento inicial assíncrono do Banco de Dados Interno (IndexedDB + Servidor Local)
  React.useEffect(() => {
    let cancelado = false;
    InternalDbService.carregarTudo().then(dados => {
      if (cancelado) return;
      if (dados.documentos && dados.documentos.length > 0) {
        setDocumentos(dados.documentos);
      }
      if (dados.empresa) {
        setEmpresa(dados.empresa);
      }
      if (dados.usuarios && dados.usuarios.length > 0) {
        setUsuarios(dados.usuarios);
        setUsuarioAtual(dados.usuarios[0]);
      }
      if (dados.certificado) {
        setCertificado(dados.certificado);
      }
      if (dados.licenca) {
        setLicenca(dados.licenca);
      }
      if (dados.logs && dados.logs.length > 0) {
        setAuditLogs(dados.logs);
      }
      if (dados.dataUltimaSalva) {
        setUltimaDataSalva(dados.dataUltimaSalva);
      }
    }).catch(err => {
      console.warn('Carga do banco interno finalizada:', err);
    });

    return () => {
      cancelado = true;
    };
  }, []);

  // Auto-save inteligente: Salva automaticamente no localStorage E no Banco de Dados Interno (IndexedDB + Servidor)
  React.useEffect(() => {
    StorageService.salvarDocumentos(documentos);
    StorageService.salvarEmpresa(empresa);
    StorageService.salvarUsuarios(usuarios);
    StorageService.salvarCertificado(certificado);
    StorageService.salvarLicenca(licenca);
    StorageService.salvarLogs(auditLogs);
    setUltimaDataSalva(new Date().toISOString());

    const timer = setTimeout(() => {
      InternalDbService.salvarTudo({
        documentos,
        empresa,
        usuarios,
        certificado,
        licenca,
        logs: auditLogs
      }).catch(err => {
        console.warn('Auto-save banco interno:', err);
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [documentos, empresa, usuarios, certificado, licenca, auditLogs]);

  const handleAddAuditLog = (
    operacao: any,
    docId: string,
    chave: string,
    justificativa: string
  ) => {
    const newLog: RegistroTrilhaAuditoria = {
      id: `LOG-${String(auditLogs.length + 1).padStart(3, '0')}`,
      dataHora: new Date().toISOString(),
      usuario: usuarioAtual.nome,
      perfilUsuario: usuarioAtual.perfil,
      usuarioNome: usuarioAtual.nome,
      usuarioEmail: usuarioAtual.email,
      operacao,
      documentoId: docId,
      chaveAcesso: chave,
      regrasExecutadas: ['REG-MOTOR-FISCAL-NORMAS-BR'],
      divergenciasIdentificadas: [],
      justificativa,
      versaoMotorRegras: 'v1.0.0-PROD'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const divergenciasCount = documentos.filter(d => d.status === 'COM_DIVERGENCIAS').length;
  const pendentesCount = documentos.filter(d => d.status === 'PENDENTE_ANALISE' || d.status === 'COM_DIVERGENCIAS').length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-800 antialiased">
      {/* Sidebar Lateral */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        divergenciasCount={divergenciasCount}
        pendentesCount={pendentesCount}
        empresa={empresa}
        onOpenPWAInstall={() => setShowPwaModal(true)}
        onSalvar={handleSalvarManual}
        totalDocumentos={documentos.length}
      />

      {/* Área Principal de Conteúdo */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 shadow-2xs">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              MÓDULO ATIVO:
            </span>
            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200/80">
              {activeTab === 'dashboard' && 'PAINEL FISCAL GERAL'}
              {activeTab === 'documentos' && 'DOCUMENTOS FISCAIS ELETRÔNICOS'}
              {activeTab === 'relatorios' && 'RELATÓRIO MENSAL DE NOTAS FISCAIS'}
              {activeTab === 'auditoria' && 'WORKBENCH DE AUDITORIA & PARECERES'}
              {activeTab === 'manifesto' && 'MANIFESTAÇÃO DO DESTINATÁRIO (SEFAZ MD-E)'}
              {activeTab === 'regras' && 'MOTOR DE REGRAS & HIERARQUIA NORMATIVA'}
              {activeTab === 'ncm' && 'ATUALIZAÇÃO INSTANTÂNEA NCM (PORTAL SISCOMEX CLASSIF)'}
              {activeTab === 'cnae' && 'CONSULTA AOS CÓDIGOS CNAE (IBGE / CONCLA / RECEITA FEDERAL)'}
              {activeTab === 'cfop' && 'CLASSIFICAÇÃO DA NATUREZA DA OPERAÇÃO & TABELA CFOP (ENTRADAS)'}
              {activeTab === 'banco-dados' && 'BANCO DE DADOS INTERNO & REPOSITÓRIO XML'}
              {activeTab === 'escrituracao' && 'ESCRITURAÇÃO SPED FISCAL (EFD)'}
              {activeTab === 'protheus' && 'INTEGRAÇÃO TOTVS PROTHEUS (ADVPL)'}
              {activeTab === 'reforma' && 'REFORMA TRIBUTÁRIA (IVA DUAL / EC 132)'}
              {activeTab === 'trilha' && 'TRILHA DE AUDITORIA IMUTÁVEL'}
              {activeTab === 'empresa' && 'CADASTRO DA EMPRESA & IDENTIDADE VISUAL'}
              {activeTab === 'certificado' && 'CERTIFICADO DIGITAL ICP-BRASIL (A1/A3)'}
              {activeTab === 'usuarios' && 'GESTÃO DE USUÁRIOS & PERMISSÕES'}
              {activeTab === 'licenca' && 'LICENCIAMENTO & ACESSO PREMIUM VITALÍCIO'}
              {activeTab === 'manual' && 'MANUAL DO USUÁRIO & GUIA DE RECURSOS'}
              {activeTab === 'hospedagem' && 'GUIA DE HOSPEDAGEM WEB (HOSTINGER / CLOUD)'}
              {activeTab === 'arquitetura' && 'ESPECIFICAÇÃO TÉCNICA DO SISTEMA'}
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-xs">
            {/* BADGE DO BANCO DE DADOS INTERNO */}
            <button
              id="btn-status-banco-topo"
              onClick={() => setActiveTab('banco-dados')}
              className={`px-2.5 py-1.5 font-bold rounded-lg border flex items-center gap-1.5 transition ${
                activeTab === 'banco-dados'
                  ? 'bg-indigo-700 text-white border-indigo-800 shadow-xs'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-950 border-indigo-300'
              }`}
              title="Banco de Dados Interno Ativo e Persistente - Clique para gerenciar o cofre de XMLs e backups"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="hidden sm:inline">Banco Interno</span>
            </button>

            {/* BADGE DA LICENÇA VITALÍCIA COM ACESSO RÁPIDO */}
            <button
              id="btn-licenca-vitalicia-topo"
              onClick={() => setActiveTab('licenca')}
              className={`px-2.5 py-1.5 font-bold rounded-lg border flex items-center gap-1.5 transition ${
                activeTab === 'licenca'
                  ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-300'
              }`}
              title="Acesso Premium Vitalício Ativado - Clique para gerenciar"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Vitalício Ativo</span>
            </button>

            {/* BOTÃO DO MANUAL DO USUÁRIO */}
            <button
              id="btn-manual-usuario-topo"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 font-bold rounded-lg border flex items-center gap-1.5 transition ${
                activeTab === 'manual'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}
              title="Acessar o Manual do Usuário e Tutoriais da Plataforma"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden lg:inline">Manual do Usuário</span>
            </button>

            {/* BOTÃO PRINCIPAL: SALVAR ALTERAÇÕES & XMLS */}
            <button
              id="btn-salvar-alteracoes-global"
              onClick={handleSalvarManual}
              disabled={salvandoEstado === 'salvando'}
              className={`px-3.5 py-1.5 font-bold rounded-lg shadow-sm flex items-center gap-1.5 transition ${
                salvandoEstado === 'salvo'
                  ? 'bg-emerald-600 text-white animate-pulse'
                  : salvandoEstado === 'salvando'
                  ? 'bg-blue-800 text-white cursor-wait'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white hover:shadow-md'
              }`}
              title="Salvar todas as alterações fiscais, notas importadas e trilha de auditoria localmente"
            >
              {salvandoEstado === 'salvo' ? (
                <>
                  <CheckCircle className="w-4 h-4 text-emerald-200" />
                  <span>Salvo com Sucesso!</span>
                </>
              ) : salvandoEstado === 'salvando' ? (
                <>
                  <RotateCcw className="w-4 h-4 text-white animate-spin" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-200" />
                  <span>SALVAR</span>
                </>
              )}
            </button>

            {/* BOTÃO DE BACKUP JSON / EXPORTAR BASE */}
            <button
              id="btn-backup-json-base"
              onClick={() => StorageService.exportarBackupJson(documentos, auditLogs, empresa, usuarios, licenca)}
              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 flex items-center gap-1.5 transition"
              title="Baixar arquivo de Backup de Segurança (.JSON) com todas as NF-es, empresa e configurações"
            >
              <DownloadCloud className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden xl:inline">Backup Base (.json)</span>
            </button>

            {/* Botão de Instalar Desktop PWA */}
            <button
              id="btn-instalar-desktop-pwa"
              onClick={() => setShowPwaModal(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold rounded-lg shadow-xs flex items-center gap-1.5 transition border border-blue-500/30"
              title="Instalar como aplicativo no Windows (PWA) ou criar atalho na Área de Trabalho"
            >
              <Monitor className="w-3.5 h-3.5 text-emerald-300" />
              <span className="hidden md:inline">Instalar no Windows (PWA)</span>
            </button>

            <button
              onClick={() => {
                const doc = documentos.find(d => d.id === selectedDocId) || documentos[0];
                if (doc) setViewingDanfeDoc(doc);
              }}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white font-semibold rounded-lg shadow-xs flex items-center gap-1.5 transition"
              title="Visualizar e Imprimir DANFE em PDF"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Imprimir NF-e</span>
            </button>

            <div className="hidden 2xl:flex items-center gap-1.5 text-slate-400 text-[11px]">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Auto-save Ativo</span>
            </div>

            <div className="h-4 w-px bg-slate-200" />

            {/* Usuário Atual com link para Gerenciamento de Usuários */}
            <button
              onClick={() => setActiveTab('usuarios')}
              className="flex items-center gap-2 hover:bg-slate-100 p-1 rounded-lg transition text-left"
              title="Usuário conectado - Clique para gerenciar equipe"
            >
              <div className="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs shrink-0">
                {usuarioAtual.nome.slice(0, 2).toUpperCase()}
              </div>
              <div className="hidden sm:block text-left">
                <div className="font-bold text-slate-800 leading-tight">{usuarioAtual.nome}</div>
                <div className="text-[10px] text-slate-400">{usuarioAtual.cargo}</div>
              </div>
            </button>
          </div>
        </header>

        {/* Scrollable Content View */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                documentos={documentos}
                onNavigate={setActiveTab}
                onSelectDoc={setSelectedDocId}
              />
            )}

            {activeTab === 'documentos' && (
              <DocumentManagerView
                documentos={documentos}
                setDocumentos={setDocumentos}
                empresa={empresa}
                onSelectDoc={setSelectedDocId}
                onNavigate={setActiveTab}
                onAddAuditLog={handleAddAuditLog}
                onPrintDanfe={setViewingDanfeDoc}
              />
            )}

            {activeTab === 'relatorios' && (
              <MonthlyReportView
                documentos={documentos}
                empresa={empresa}
                onSelectDoc={setSelectedDocId}
                onNavigate={setActiveTab}
                onPrintDanfe={setViewingDanfeDoc}
              />
            )}

            {activeTab === 'auditoria' && (
              <AuditWorkbenchView
                documentos={documentos}
                setDocumentos={setDocumentos}
                selectedDocId={selectedDocId}
                setSelectedDocId={setSelectedDocId}
                empresa={empresa}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeTab === 'manifesto' && (
              <ManifestoDestinatarioView
                documentos={documentos}
                setDocumentos={setDocumentos}
                selectedDocId={selectedDocId}
                setSelectedDocId={setSelectedDocId}
                empresa={empresa}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeTab === 'regras' && <TaxRuleEngineView />}

            {activeTab === 'ncm' && (
              <SiscomexNcmModal
                documentos={documentos}
                onAtualizarDocumentos={setDocumentos}
                onClose={() => setActiveTab('documentos')}
              />
            )}

            {activeTab === 'cnae' && (
              <CnaeConsultationView
                documentos={documentos}
                empresa={empresa}
                onAtualizarEmpresa={setEmpresa}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'cfop' && (
              <ClassificacaoCfopView
                documentos={documentos}
                onSelectDoc={setSelectedDocId}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'banco-dados' && (
              <InternalDatabaseView
                documentos={documentos}
                setDocumentos={setDocumentos}
                empresa={empresa}
                setEmpresa={setEmpresa}
                usuarios={usuarios}
                certificado={certificado}
                licenca={licenca}
                auditLogs={auditLogs}
                onNavigate={setActiveTab}
                onAdicionarLog={handleAddAuditLog}
              />
            )}

            {activeTab === 'escrituracao' && (
              <EscrituracaoSpedView
                documentos={documentos}
                empresa={empresa}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeTab === 'protheus' && (
              <ProtheusIntegrationView
                documentos={documentos}
                selectedDocId={selectedDocId}
                onAddAuditLog={handleAddAuditLog}
              />
            )}

            {activeTab === 'reforma' && (
              <ReformaTributariaView
                documentos={documentos}
                onSelectDoc={setSelectedDocId}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'trilha' && <AuditTrailView logs={auditLogs} />}

            {activeTab === 'empresa' && (
              <EmpresaConfigView
                empresa={empresa}
                setEmpresa={setEmpresa}
                onSave={emp => StorageService.salvarEmpresa(emp)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'certificado' && (
              <CertificadoDigitalView
                empresa={empresa}
                certificado={certificado}
                setCertificado={setCertificado}
                onSalvar={cert => StorageService.salvarCertificado(cert)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'usuarios' && (
              <UsuariosAppView
                usuarios={usuarios}
                setUsuarios={setUsuarios}
                usuarioAtual={usuarioAtual}
                setUsuarioAtual={setUsuarioAtual}
                onSalvar={us => StorageService.salvarUsuarios(us)}
              />
            )}

            {activeTab === 'licenca' && (
              <LicencaComercialView
                empresa={empresa}
                licenca={licenca}
                setLicenca={setLicenca}
                onSalvar={lic => StorageService.salvarLicenca(lic)}
                onNavigate={setActiveTab}
              />
            )}

            {activeTab === 'manual' && (
              <UserManualView
                onNavigate={setActiveTab}
                onOpenPwaModal={() => setShowPwaModal(true)}
              />
            )}

            {activeTab === 'hospedagem' && <CloudHostingGuideView />}

            {activeTab === 'arquitetura' && <ArchitectureDocsView />}
          </div>
        </main>
      </div>

      {/* Modal Global de Impressão de DANFE em PDF */}
      {viewingDanfeDoc && (
        <DanfeModal
          documento={viewingDanfeDoc}
          onClose={() => setViewingDanfeDoc(null)}
        />
      )}

      {/* Modal de Instalação no Windows (PWA / Área de Trabalho) */}
      <PWAInstallModal
        isOpen={showPwaModal}
        onClose={() => setShowPwaModal(false)}
      />
    </div>
  );
}
