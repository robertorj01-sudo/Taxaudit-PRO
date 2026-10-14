import React, { useState, useEffect, useMemo } from 'react';
import {
  Database,
  HardDrive,
  FileCode,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Users,
  ShieldCheck,
  Calendar,
  Search,
  Copy,
  Check,
  Server,
  FolderArchive,
  ArrowDownToLine,
  FileCheck2,
  ExternalLink,
  Save,
  Clock
} from 'lucide-react';
import {
  DocumentoFiscal,
  Empresa,
  UsuarioApp,
  CertificadoDigitalInfo,
  LicencaComercial,
  Registro_GEPAT_Fiscal,
  ArquivoXmlSalvo,
  StatusBancoInterno
} from '../types/fiscal';
import { InternalDbService } from '../services/internalDbService';

interface InternalDatabaseViewProps {
  documentos: DocumentoFiscal[];
  setDocumentos: React.Dispatch<React.SetStateAction<DocumentoFiscal[]>>;
  empresa: Empresa;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa>>;
  usuarios: UsuarioApp[];
  certificado: CertificadoDigitalInfo;
  licenca: LicencaComercial;
  auditLogs: Registro_GEPAT_Fiscal[];
  onNavigate: (tab: any) => void;
  onAdicionarLog?: (operacao: any, docId: string, chave: string, justificativa: string) => void;
}

export const InternalDatabaseView: React.FC<InternalDatabaseViewProps> = ({
  documentos,
  setDocumentos,
  empresa,
  usuarios,
  certificado,
  licenca,
  auditLogs,
  onNavigate
}) => {
  const [activeTab, setActiveTab] = useState<'cofre-xml' | 'cadastros' | 'manutencao'>('cofre-xml');
  const [statusBanco, setStatusBanco] = useState<StatusBancoInterno | null>(null);
  const [arquivosXml, setArquivosXml] = useState<ArquivoXmlSalvo[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);
  const [filtroTexto, setFiltroTexto] = useState('');
  const [filtroModelo, setFiltroModelo] = useState<string>('TODOS');
  const [viewingXml, setViewingXml] = useState<ArquivoXmlSalvo | null>(null);
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  // Carregar status e lista de arquivos XML do banco interno
  const carregarDadosBanco = async () => {
    setLoading(true);
    try {
      const [status, xmls] = await Promise.all([
        InternalDbService.obterStatusBanco(),
        InternalDbService.listarArquivosXml()
      ]);
      setStatusBanco(status);
      setArquivosXml(xmls);
    } catch (err) {
      console.error('Erro ao carregar status do banco:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDadosBanco();
  }, []);

  // Forçar salvamento completo de todos os dados no banco interno
  const handleSalvarBancoAgora = async () => {
    setSalvando(true);
    try {
      const res = await InternalDbService.salvarTudo({
        documentos,
        empresa,
        usuarios,
        certificado,
        licenca,
        logs: auditLogs,
        arquivosXml
      });
      if (res.sucesso) {
        setMensagemSucesso('Banco de Dados Interno atualizado e sincronizado com sucesso!');
        await carregarDadosBanco();
      }
    } catch (e: any) {
      alert('Erro ao salvar no banco: ' + e.message);
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagemSucesso(null), 4000);
    }
  };

  // Guardar todos os XMLs brutos das notas fiscais atuais no cofre do banco interno
  const handleExportarTodosDocsParaCofre = async () => {
    setSalvando(true);
    try {
      const novosXmls: ArquivoXmlSalvo[] = [];
      const timestamp = new Date().toISOString();

      for (const doc of documentos) {
        if (doc.rawXml) {
          const nomeArquivo = `${doc.chaveAcesso}-${doc.tipoDocumento.toLowerCase()}.xml`;
          novosXmls.push({
            id: `XML-${doc.id}-${Date.now().toString().slice(-4)}`,
            nomeArquivo,
            chaveAcesso: doc.chaveAcesso,
            tipoDocumento: doc.tipoDocumento,
            dataExportacao: timestamp,
            dataEmissao: doc.dataEmissao,
            emitenteRazao: doc.emitente.razaoSocial,
            emitenteCnpj: doc.emitente.cnpjCpf,
            destinatarioRazao: doc.destinatario.razaoSocial,
            destinatarioCnpj: doc.destinatario.cnpjCpf,
            valorTotal: doc.valorTotalDocumento,
            tamanhoBytes: new Blob([doc.rawXml]).size,
            conteudoXml: doc.rawXml,
            origem: 'EXPORTACAO_LOTE',
            observacoes: `Captura automática de documento ${doc.numero}/${doc.serie} para cofre interno`
          });
        }
      }

      if (novosXmls.length === 0) {
        alert('Nenhum documento na lista possui conteúdo XML bruto para arquivar no cofre.');
        return;
      }

      const totalSalvos = await InternalDbService.salvarArquivosXmlEmLote(novosXmls);
      setMensagemSucesso(`${totalSalvos} arquivos XML foram arquivados com sucesso no Cofre do Banco Interno!`);
      await carregarDadosBanco();
    } catch (e: any) {
      alert('Falha ao exportar XMLs para o cofre: ' + e.message);
    } finally {
      setSalvando(false);
      setTimeout(() => setMensagemSucesso(null), 4000);
    }
  };

  // Baixar arquivo XML individual
  const handleDownloadXml = (item: ArquivoXmlSalvo) => {
    const blob = new Blob([item.conteudoXml], { type: 'application/xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = item.nomeArquivo || `${item.chaveAcesso}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Copiar chave ou XML
  const handleCopiar = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoId(id);
    setTimeout(() => setCopiadoId(null), 2000);
  };

  // Excluir arquivo XML do cofre
  const handleExcluirXml = async (id: string, nome: string) => {
    if (!window.confirm(`Tem certeza que deseja excluir o arquivo "${nome}" do cofre interno?`)) {
      return;
    }
    await InternalDbService.excluirArquivoXml(id);
    await carregarDadosBanco();
  };

  // Exportar backup completo do banco
  const handleExportarBackup = async () => {
    const dump = await InternalDbService.exportarDumpBanco();
    const blob = new Blob([dump], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAXAUDIT_BANCO_INTERNO_BACKUP_${new Date().toISOString().slice(0, 10)}.taxdb.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Restaurar backup a partir de arquivo
  const handleImportarBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        const ok = await InternalDbService.importarDumpBanco(text);
        if (ok) {
          alert('Backup restaurado com sucesso! Recarregando dados...');
          const dados = await InternalDbService.carregarTudo();
          setDocumentos(dados.documentos);
          await carregarDadosBanco();
        } else {
          alert('Falha ao restaurar backup. Verifique se o arquivo possui o formato correto.');
        }
      } catch (err: any) {
        alert('Erro ao processar arquivo: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  // Resetar banco
  const handleResetarBanco = async () => {
    await InternalDbService.resetarBancoInterno();
    setConfirmReset(false);
    alert('Banco de dados interno limpo. O sistema será reiniciado com os dados de demonstração.');
    window.location.reload();
  };

  // Filtragem dos arquivos XML
  const arquivosFiltrados = useMemo(() => {
    return arquivosXml.filter((arq) => {
      const matchesTexto =
        filtroTexto === '' ||
        arq.nomeArquivo.toLowerCase().includes(filtroTexto.toLowerCase()) ||
        arq.chaveAcesso.includes(filtroTexto) ||
        (arq.emitenteRazao && arq.emitenteRazao.toLowerCase().includes(filtroTexto.toLowerCase())) ||
        (arq.emitenteCnpj && arq.emitenteCnpj.includes(filtroTexto));

      const matchesModelo =
        filtroModelo === 'TODOS' || arq.tipoDocumento === filtroModelo;

      return matchesTexto && matchesModelo;
    });
  }, [arquivosXml, filtroTexto, filtroModelo]);

  const formatMoeda = (val?: number) => {
    if (val === undefined || isNaN(val)) return 'R$ 0,00';
    return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal com Diagnóstico da Conexão */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <Database className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                BANCO DE DADOS INTERNO & REPOSITÓRIO XML
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Conectado e Persistente
              </span>
            </div>
            <p className="text-sm text-slate-300">
              Arquitetura de armazenamento interno duplo: <strong>IndexedDB Local de Alta Capacidade</strong> (sem limite de 5MB do navegador) integrado à <strong>Persistência em Disco no Servidor</strong> (<code>data/banco_interno_fiscal.json</code> e <code>data/xml_vault/</code>).
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handleSalvarBancoAgora}
              disabled={salvando}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition flex items-center gap-2 shadow-sm"
              title="Gravar instantaneamente todos os documentos e cadastros no banco interno"
            >
              {salvando ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-200" />
                  <span>Salvando...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-emerald-200" />
                  <span>Salvar Dados Agora</span>
                </>
              )}
            </button>

            <button
              onClick={carregarDadosBanco}
              disabled={loading}
              className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
              title="Recarregar diagnóstico e sincronização"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>

        {/* Feedback visual de sucesso */}
        {mensagemSucesso && (
          <div className="mt-4 p-3 rounded-lg bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{mensagemSucesso}</span>
          </div>
        )}

        {/* Diagnóstico em Grade */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800">
          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Documentos Fiscais Salvos</div>
            <div className="text-xl font-bold text-white mt-1">
              {documentos.length} <span className="text-xs font-normal text-slate-400">docs</span>
            </div>
            <div className="text-[10px] text-emerald-400 mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> No Banco Interno
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Arquivos XML no Cofre</div>
            <div className="text-xl font-bold text-white mt-1">
              {arquivosXml.length} <span className="text-xs font-normal text-slate-400">arquivos</span>
            </div>
            <div className="text-[10px] text-blue-400 mt-0.5 flex items-center gap-1">
              <FileCode className="w-3 h-3" /> XMLs Integros
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Tamanho Armazenado</div>
            <div className="text-xl font-bold text-white mt-1">
              {statusBanco?.espacoEstimadoMb || '1.40 MB'}
            </div>
            <div className="text-[10px] text-amber-300 mt-0.5">
              IndexedDB + Disco Servidor
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
            <div className="text-[11px] text-slate-400 font-medium">Última Sincronização</div>
            <div className="text-xs font-semibold text-white mt-1.5 truncate">
              {statusBanco?.ultimaSincronizacao
                ? new Date(statusBanco.ultimaSincronizacao).toLocaleTimeString('pt-BR')
                : 'Em tempo real'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Auto-Save Ativo
            </div>
          </div>
        </div>
      </div>

      {/* Navegação entre Abas do Banco */}
      <div className="flex border-b border-slate-200 gap-2">
        <button
          onClick={() => setActiveTab('cofre-xml')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'cofre-xml'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FolderArchive className="w-4 h-4" />
          <span>Cofre de Arquivos XML Exportados ({arquivosXml.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cadastros')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'cadastros'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Dados Cadastrais Guardados</span>
        </button>

        <button
          onClick={() => setActiveTab('manutencao')}
          className={`px-4 py-2.5 font-bold text-xs uppercase tracking-wider transition border-b-2 flex items-center gap-2 ${
            activeTab === 'manutencao'
              ? 'border-indigo-600 text-indigo-700 bg-indigo-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4" />
          <span>Backup, Dumps & Manutenção</span>
        </button>
      </div>

      {/* ABA 1: COFRE DE ARQUIVOS XML */}
      {activeTab === 'cofre-xml' && (
        <div className="space-y-4">
          {/* Barra de Filtros e Ações Rápidas */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Pesquisar por chave de 44 dígitos, emitente ou arquivo..."
                  value={filtroTexto}
                  onChange={(e) => setFiltroTexto(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={filtroModelo}
                onChange={(e) => setFiltroModelo(e.target.value)}
                className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700"
              >
                <option value="TODOS">Todos os Modelos</option>
                <option value="NFE">NF-e (Mod. 55)</option>
                <option value="NFCE">NFC-e (Mod. 65)</option>
                <option value="CTE">CT-e (Mod. 57)</option>
                <option value="NFCOM">NFCom (Mod. 62)</option>
                <option value="NF3E">NF3e (Mod. 66)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleExportarTodosDocsParaCofre}
                disabled={salvando}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-1.5 shadow-xs"
                title="Captura e salva todos os XMLs dos documentos atuais no cofre interno permanente"
              >
                <ArrowDownToLine className="w-4 h-4" />
                <span>Salvar Todos os XMLs no Cofre</span>
              </button>

              <button
                onClick={() => onNavigate('documentos')}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition flex items-center gap-1.5"
              >
                <FileCheck2 className="w-4 h-4 text-slate-500" />
                <span>Ver Documentos Ativos</span>
              </button>
            </div>
          </div>

          {/* Tabela de Arquivos XML Salvos */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <FileCode className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Repositório de Arquivos XML Guardados ({arquivosFiltrados.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Cada arquivo XML exportado ou importado é preservado com chave, emitente e integridade
              </span>
            </div>

            {arquivosFiltrados.length === 0 ? (
              <div className="p-10 text-center space-y-3">
                <FileCode className="w-12 h-12 text-slate-300 mx-auto" />
                <div className="text-slate-600 font-semibold text-sm">
                  Nenhum arquivo XML guardado no cofre ainda
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Clique no botão <strong>"Salvar Todos os XMLs no Cofre"</strong> acima ou faça download/exportação de XML na tela de Gerenciador de Documentos para arquivar seus arquivos XML no banco interno permanentemente.
                </p>
                <button
                  onClick={handleExportarTodosDocsParaCofre}
                  className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition inline-flex items-center gap-2"
                >
                  <ArrowDownToLine className="w-4 h-4" />
                  Arquivar XMLs Atuais no Banco
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Arquivo & Modelo</th>
                      <th className="py-2.5 px-4">Chave de Acesso (44 dígitos)</th>
                      <th className="py-2.5 px-4">Emitente / Fornecedor</th>
                      <th className="py-2.5 px-4">Valor Total</th>
                      <th className="py-2.5 px-4">Data Salvamento</th>
                      <th className="py-2.5 px-4">Tamanho</th>
                      <th className="py-2.5 px-4 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {arquivosFiltrados.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/30 transition">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 truncate max-w-[200px]" title={item.nomeArquivo}>
                            {item.nomeArquivo}
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-blue-100 text-blue-800">
                              {item.tipoDocumento}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.origem.replace('_', ' ')}
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4 font-mono text-[11px] text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span className="truncate max-w-[190px]" title={item.chaveAcesso}>
                              {item.chaveAcesso}
                            </span>
                            <button
                              onClick={() => handleCopiar(item.chaveAcesso, `key-${item.id}`)}
                              className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                              title="Copiar Chave"
                            >
                              {copiadoId === `key-${item.id}` ? (
                                <Check className="w-3 h-3 text-emerald-600" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="font-medium text-slate-800 truncate max-w-[170px]" title={item.emitenteRazao}>
                            {item.emitenteRazao || 'Não informado'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {item.emitenteCnpj ? `CNPJ ${item.emitenteCnpj}` : ''}
                          </div>
                        </td>

                        <td className="py-3 px-4 font-bold text-slate-800">
                          {formatMoeda(item.valorTotal)}
                        </td>

                        <td className="py-3 px-4 text-slate-500 text-[11px]">
                          {new Date(item.dataExportacao).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(item.dataExportacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </td>

                        <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                          {(item.tamanhoBytes / 1024).toFixed(1)} KB
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDownloadXml(item)}
                              className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1 shadow-2xs"
                              title="Baixar arquivo XML para seu computador"
                            >
                              <Download className="w-3 h-3 text-emerald-200" />
                              <span>Baixar</span>
                            </button>

                            <button
                              onClick={() => setViewingXml(item)}
                              className="p-1.5 rounded text-slate-500 hover:bg-slate-100 transition"
                              title="Visualizar conteúdo XML"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleExcluirXml(item.id, item.nomeArquivo)}
                              className="p-1.5 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                              title="Excluir do cofre"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: DADOS CADASTRAIS SALVOS */}
      {activeTab === 'cadastros' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card Empresa */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Empresa Cadastrada no Banco</h3>
              </div>
              <button
                onClick={() => onNavigate('empresa')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Editar Cadastro</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Razão Social:</span>
                <span className="font-bold text-slate-800 text-right">{empresa.razaoSocial}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">CNPJ:</span>
                <span className="font-mono font-bold text-slate-800">{empresa.cnpj}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Inscrição Estadual:</span>
                <span className="font-mono text-slate-800">{empresa.inscricaoEstadual}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">CNAE Principal:</span>
                <span className="font-mono text-slate-800">{empresa.cnae || 'Não informado'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Regime Tributário:</span>
                <span className="font-semibold text-indigo-700">{empresa.regimeTributario}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Município / UF:</span>
                <span className="text-slate-800">{empresa.municipio} - {empresa.uf} (IBGE: {empresa.codigoMunicipioIBGE})</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Perfil SPED:</span>
                <span className="font-bold text-slate-800">PERFIL {empresa.perfilSped}</span>
              </div>
            </div>
          </div>

          {/* Card Certificado Digital & Licença */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Certificado Digital e Licença</h3>
              </div>
              <button
                onClick={() => onNavigate('certificado')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Ver Certificado</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Certificado Digital:</span>
                <span className={`font-semibold ${certificado.instalado ? 'text-emerald-700' : 'text-amber-600'}`}>
                  {certificado.instalado ? `INSTALADO (${certificado.tipo})` : 'NÃO CONFIGURADO'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Titular do Certificado:</span>
                <span className="font-medium text-slate-800 text-right">{certificado.titular || empresa.razaoSocial}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Validade:</span>
                <span className="text-slate-800">{certificado.validadeFim ? new Date(certificado.validadeFim).toLocaleDateString('pt-BR') : 'Indeterminada'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Licença do Sistema:</span>
                <span className="font-bold text-indigo-700">{licenca.tipo || 'VITALÍCIA PRO'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500 font-medium">Status da Licença:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  {licenca.ativa ? 'ATIVA E HOMOLOGADA' : 'INATIVA'}
                </span>
              </div>
            </div>
          </div>

          {/* Card Usuários Cadastrados */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 md:col-span-2">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Usuários Cadastrados no Banco ({usuarios.length})</h3>
              </div>
              <button
                onClick={() => onNavigate('usuarios')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <span>Gerenciar Usuários</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {usuarios.map((u) => (
                <div key={u.id} className="p-3 rounded-lg border border-slate-200 bg-slate-50 text-xs space-y-1">
                  <div className="font-bold text-slate-800 truncate">{u.nome}</div>
                  <div className="text-slate-500 text-[11px] truncate">{u.email}</div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-indigo-100 text-indigo-800">
                      {u.perfil}
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      {u.ativo ? '● Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: BACKUP, DUMPS E MANUTENÇÃO */}
      {activeTab === 'manutencao' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Exportar Dump Completo */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Download className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-800 text-sm">Exportar Backup Completo do Banco</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gera um arquivo de snapshot íntegro contendo todos os dados cadastrados, histórico de auditoria GEPAT, parametrizações da empresa, e todos os arquivos XML guardados no cofre interno.
              </p>
              <button
                onClick={handleExportarBackup}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition flex items-center gap-2 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Baixar Backup Completo (.taxdb.json)</span>
              </button>
            </div>

            {/* Restaurar Backup */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-800 text-sm">Restaurar Banco a partir de Backup</h3>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Carrega um arquivo de backup previamente exportado (<code>.taxdb.json</code> ou <code>.json</code>) e restaura instantaneamente todos os documentos, cadastros e XMLs no banco interno.
              </p>
              <div>
                <label
                  htmlFor="input-restore-backup"
                  className="cursor-pointer px-4 py-2 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition inline-flex items-center gap-2 shadow-xs"
                >
                  <Upload className="w-4 h-4" />
                  <span>Selecionar Arquivo de Backup</span>
                </label>
                <input
                  id="input-restore-backup"
                  type="file"
                  accept=".json,.taxdb"
                  onChange={handleImportarBackup}
                  className="hidden"
                />
              </div>
            </div>
          </div>

          {/* Card Detalhes Técnicos do Motor */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <Server className="w-4 h-4 text-indigo-600" />
              Arquitetura de Conexão do Banco de Dados Interno
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">1. Motor IndexedDB Local</div>
                <div className="text-slate-600 text-[11px]">
                  Banco: <code>TaxAuditFiscalDB_v2</code>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Armazenamento permanente no navegador do cliente (sem cota restrita de 5MB).
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">2. Motor de Arquivo Servidor</div>
                <div className="text-slate-600 text-[11px]">
                  Arquivo: <code>data/banco_interno_fiscal.json</code>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Persistência atômica no filesystem do servidor para acesso compartilhado.
                </div>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-1">
                <div className="font-bold text-slate-800">3. Cofre Físico de XMLs</div>
                <div className="text-slate-600 text-[11px]">
                  Diretório: <code>data/xml_vault/</code>
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Arquivos XML individuais gravados com integridade e hash.
                </div>
              </div>
            </div>
          </div>

          {/* Zona de Perigo / Reset */}
          <div className="bg-rose-50/50 p-5 rounded-xl border border-rose-200 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-rose-800">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3 className="font-bold text-sm">Zona de Reinicialização de Dados</h3>
            </div>
            <p className="text-xs text-rose-700">
              Caso deseje apagar todas as notas fiscais importadas e reiniciar com os dados padrão de fábrica do sistema, utilize a opção abaixo com cautela.
            </p>
            {confirmReset ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetarBanco}
                  className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
                >
                  Confirmar e Limpar Todo o Banco
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-100 transition"
              >
                Limpar Banco de Dados e Restaurar Padrão
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal Visualizador de XML */}
      {viewingXml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-5 space-y-4 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="space-y-0.5">
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-indigo-600" />
                  <span>{viewingXml.nomeArquivo}</span>
                </h3>
                <div className="text-[11px] text-slate-400 font-mono">
                  Chave: {viewingXml.chaveAcesso} • {(viewingXml.tamanhoBytes / 1024).toFixed(1)} KB
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadXml(viewingXml)}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-emerald-600 text-white hover:bg-emerald-700 transition flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar XML</span>
                </button>
                <button
                  onClick={() => handleCopiar(viewingXml.conteudoXml, 'modal-xml')}
                  className="px-3 py-1.5 text-xs font-semibold rounded bg-slate-800 text-white hover:bg-slate-900 transition flex items-center gap-1"
                >
                  {copiadoId === 'modal-xml' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Texto</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setViewingXml(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold ml-2"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-900 p-4 rounded-lg font-mono text-xs text-emerald-400 whitespace-pre-wrap select-all">
              {viewingXml.conteudoXml}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
