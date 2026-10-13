import React, { useState, useEffect, useRef } from 'react';
import {
  FolderTree,
  X,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FolderOpen,
  FileCode,
  ArrowRight,
  ShieldCheck,
  Server,
  Sparkles,
  Download,
  CopyX,
  Filter
} from 'lucide-react';
import { XmlFiscalParser } from '../services/xmlParser';
import { TaxRuleEngine } from '../services/taxRuleEngine';
import { DocumentoFiscal, Empresa } from '../types/fiscal';

interface NetworkFolderSyncModalProps {
  empresa: Empresa;
  documentosExistentes?: DocumentoFiscal[];
  onClose: () => void;
  onImportarDocumentos: (novosDocs: DocumentoFiscal[], caminhoPasta: string) => void;
  onAddAuditLog: (operacao: any, docId: string, chave: string, justificativa: string) => void;
}

const CAMINHO_PADRAO_REDE =
  'R:\\FISCAL$\\NOTAS_FISCAIS_ENTRADA\\XML_NF_Recebidas\\2026\\09_SET';

interface ArquivoLidoItem {
  nome: string;
  xml: string;
  doc?: DocumentoFiscal;
  duplicado?: boolean;
  docExistenteId?: string;
}

export const NetworkFolderSyncModal: React.FC<NetworkFolderSyncModalProps> = ({
  empresa,
  documentosExistentes = [],
  onClose,
  onImportarDocumentos,
  onAddAuditLog
}) => {
  const [caminhoPasta, setCaminhoPasta] = useState<string>(() => {
    return localStorage.getItem('GEPAT_CAMINHO_PASTA_XML') || CAMINHO_PADRAO_REDE;
  });

  const [loading, setLoading] = useState(false);
  const [progresso, setProgresso] = useState<{ total: number; atual: number; arquivo: string } | null>(null);
  const [resultadoMsg, setResultadoMsg] = useState<{ tipo: 'sucesso' | 'aviso' | 'erro'; texto: string; detalhes?: string } | null>(null);
  const [arquivosLidos, setArquivosLidos] = useState<ArquivoLidoItem[]>([]);
  const [ignorarDuplicados, setIgnorarDuplicados] = useState<boolean>(true);

  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('GEPAT_CAMINHO_PASTA_XML', caminhoPasta);
  }, [caminhoPasta]);

  // Opção 1: Leitura via File System / Seletor de Pasta do Navegador (WebkitDirectory)
  const handleSelectFolderFromBrowser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setLoading(true);
    setResultadoMsg(null);
    setArquivosLidos([]);

    const xmlFilesList: File[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.name.toLowerCase().endsWith('.xml')) {
        xmlFilesList.push(file);
      }
    }

    if (xmlFilesList.length === 0) {
      setLoading(false);
      setResultadoMsg({
        tipo: 'aviso',
        texto: 'Nenhum arquivo .xml foi encontrado na pasta selecionada.',
        detalhes: 'Certifique-se de selecionar a pasta que contém as notas fiscais eletrônicas em formato XML.'
      });
      return;
    }

    const processados: ArquivoLidoItem[] = [];
    let contadorDuplicados = 0;

    for (let i = 0; i < xmlFilesList.length; i++) {
      const file = xmlFilesList[i];
      setProgresso({
        total: xmlFilesList.length,
        atual: i + 1,
        arquivo: file.name
      });

      try {
        const text = await file.text();
        const docExtraido = XmlFiscalParser.parseNFeXml(text);
        const resultado = TaxRuleEngine.analisarDocumento(docExtraido, empresa);
        const docAuditado = resultado.documentoAtualizado;

        // Verificar se já existe na base por Chave de Acesso ou Número/Série/Emitente
        const jaExiste = documentosExistentes.find(
          d =>
            d.chaveAcesso === docAuditado.chaveAcesso ||
            (d.numero === docAuditado.numero &&
              d.serie === docAuditado.serie &&
              d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
        );

        if (jaExiste) {
          contadorDuplicados++;
        }

        processados.push({
          nome: file.name,
          xml: text,
          doc: docAuditado,
          duplicado: Boolean(jaExiste),
          docExistenteId: jaExiste?.id
        });
      } catch (err: any) {
        console.warn(`Erro ao ler XML ${file.name}:`, err);
        processados.push({
          nome: file.name,
          xml: '',
          duplicado: false
        });
      }
    }

    setArquivosLidos(processados);
    setLoading(false);
    setProgresso(null);

    const validos = processados.filter(p => p.doc);
    if (validos.length > 0) {
      setResultadoMsg({
        tipo: 'sucesso',
        texto: `Varredura concluída! ${validos.length} arquivos XML processados com sucesso.`,
        detalhes:
          contadorDuplicados > 0
            ? `Detectamos ${contadorDuplicados} arquivo(s) que já existem na sua base atual. Você pode optar por ignorar ou sobrescrever.`
            : `Nenhum arquivo duplicado detectado! Todas as ${validos.length} notas são novas e estão prontas para escrituração.`
      });
    }
  };

  // Opção 2: Leitura direta do Sistema de Arquivos via Servidor Local (Node.js no micro)
  const handleSincronizarServidorLocal = async () => {
    setLoading(true);
    setResultadoMsg(null);
    setArquivosLidos([]);

    try {
      const response = await fetch('/api/pastas/sincronizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caminho: caminhoPasta })
      });

      const data = await response.json();

      if (!response.ok || !data.sucesso) {
        // Se estiver rodando na nuvem (container Web), o drive R:\ não existe fisicamente no servidor remoto
        setResultadoMsg({
          tipo: 'aviso',
          texto: 'Drive de rede R: não detectado no servidor de demonstração em nuvem.',
          detalhes:
            'Como você está testando no navegador em nuvem, utilize o botão "Selecionar Pasta no Computador / Drive R:" logo abaixo para escolher a pasta diretamente do Windows Explorer. Quando você rodar o projeto localmente no seu micro (com "npm run dev"), este botão lerá o drive R:\\ automaticamente sem necessidade de seleção!'
        });
        setLoading(false);
        return;
      }

      // Se o servidor local retornou os arquivos:
      const processados: ArquivoLidoItem[] = [];
      let contadorDuplicados = 0;

      for (let i = 0; i < data.arquivos.length; i++) {
        const item = data.arquivos[i];
        try {
          const docExtraido = XmlFiscalParser.parseNFeXml(item.conteudoXml);
          const resultado = TaxRuleEngine.analisarDocumento(docExtraido, empresa);
          const docAuditado = resultado.documentoAtualizado;

          const jaExiste = documentosExistentes.find(
            d =>
              d.chaveAcesso === docAuditado.chaveAcesso ||
              (d.numero === docAuditado.numero &&
                d.serie === docAuditado.serie &&
                d.emitente.cnpjCpf === docAuditado.emitente.cnpjCpf)
          );

          if (jaExiste) {
            contadorDuplicados++;
          }

          processados.push({
            nome: item.nomeArquivo,
            xml: item.conteudoXml,
            doc: docAuditado,
            duplicado: Boolean(jaExiste),
            docExistenteId: jaExiste?.id
          });
        } catch (e) {
          processados.push({ nome: item.nomeArquivo, xml: item.conteudoXml, duplicado: false });
        }
      }

      setArquivosLidos(processados);
      setResultadoMsg({
        tipo: 'sucesso',
        texto: `Sincronização nativa do Drive R: concluída! ${processados.filter(p => p.doc).length} documentos localizados.`,
        detalhes:
          contadorDuplicados > 0
            ? `${contadorDuplicados} nota(s) já constam na base e foram marcadas como duplicadas.`
            : `Diretório lido: ${caminhoPasta}. Nenhuma duplicidade encontrada.`
      });
    } catch (err: any) {
      setResultadoMsg({
        tipo: 'aviso',
        texto: 'Ambiente de nuvem: utilize o Seletor de Pasta do Navegador.',
        detalhes:
          'No navegador em nuvem, utilize o botão "Selecionar Pasta no Computador / Drive R:" para apontar o Windows Explorer para o seu diretório.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarImportacao = () => {
    let docsParaImportar: DocumentoFiscal[] = [];

    if (ignorarDuplicados) {
      // Importa apenas os que NÃO são duplicados
      docsParaImportar = arquivosLidos
        .filter(a => Boolean(a.doc) && !a.duplicado)
        .map(a => a.doc!);
    } else {
      // Importa todos os válidos (sobrescreve/atualiza)
      docsParaImportar = arquivosLidos
        .filter(a => Boolean(a.doc))
        .map(a => a.doc!);
    }

    if (docsParaImportar.length === 0) {
      alert('Nenhum documento novo para importar (todos os arquivos selecionados já constam na base ou são inválidos).');
      return;
    }

    onImportarDocumentos(docsParaImportar, caminhoPasta);
    onAddAuditLog(
      'IMPORTACAO',
      `LOTE-${docsParaImportar.length}-DOCS`,
      `DIRETORIO: ${caminhoPasta}`,
      `Importação em lote de ${docsParaImportar.length} notas fiscais da pasta ${caminhoPasta} (Duplicados ignorados: ${ignorarDuplicados ? 'Sim' : 'Não'}).`
    );
    onClose();
  };

  const totalValidos = arquivosLidos.filter(a => Boolean(a.doc)).length;
  const totalDuplicados = arquivosLidos.filter(a => a.duplicado).length;
  const totalNovos = totalValidos - totalDuplicados;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight flex items-center gap-2">
                Apontamento de Pasta de Rede / Drive Local
              </h3>
              <p className="text-xs text-slate-300">
                Monitoramento e ingestão automática de arquivos XML de NF-e
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-5">
          {/* Banner de Executáveis da Pasta R:\ */}
          <div className="p-3.5 bg-gradient-to-r from-blue-900 to-indigo-950 text-white rounded-xl border border-blue-700/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-200">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Colocar Executável na Pasta R:\</span>
              </div>
              <p className="text-[11px] text-slate-300">
                Baixe o script para salvar em <code className="text-emerald-300 font-mono">R:\GEPAT.F$\006. NOTAS FISCAIS...</code> e abrir com 2 cliques.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const currentOrigin = window.location.origin;
                const atalhoScript = `@echo off
chcp 65001 > nul
title TAXAUDIT PRO - SISTEMA FISCAL INTELIGENTE
color 0B
echo Iniciando Sistema TaxAudit Pro...
set APP_URL=${currentOrigin}
start msedge.exe --app="%APP_URL%" --app-id=taxaudit-pro --window-size=1440,900
exit
`;
                const blob = new Blob([atalhoScript], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'INICIAR_TAXAUDIT_PRO.bat';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              Baixar para a Pasta R:\
            </button>
          </div>
          {/* Configuração do Caminho */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Caminho da Pasta de Rede (Unidade Mapeada ou Servidor GEPAT):
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <HardDrive className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={caminhoPasta}
                  onChange={e => setCaminhoPasta(e.target.value)}
                  placeholder="R:\GEPAT.F$\..."
                  className="w-full pl-9 pr-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50 text-slate-900"
                />
              </div>
              <button
                type="button"
                onClick={() => setCaminhoPasta(CAMINHO_PADRAO_REDE)}
                title="Restaurar caminho padrão da rede corporativa"
                className="px-2.5 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg hover:bg-slate-100 transition whitespace-nowrap"
              >
                Padrão Rede
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              O sistema memoriza este caminho para os próximos lotes de apuração fiscal.
            </p>
          </div>

          {/* Formas de Conexão */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Opção A: Navegador / Windows Explorer */}
            <div className="p-4 rounded-xl border-2 border-emerald-500/30 bg-emerald-50/40 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-1">
                  <FolderOpen className="w-4 h-4 text-emerald-600" />
                  Opção 1: Selecionar no Windows Explorer
                </div>
                <p className="text-[11px] text-slate-600 mb-3">
                  Abre a janela de pastas do seu computador para apontar a pasta do Drive <strong>R:\...</strong> e carregar todos os XMLs de uma vez.
                </p>
              </div>

              <div>
                <input
                  ref={folderInputRef}
                  type="file"
                  // @ts-ignore
                  webkitdirectory="true"
                  directory="true"
                  multiple
                  onChange={handleSelectFolderFromBrowser}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => folderInputRef.current?.click()}
                  disabled={loading}
                  className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
                >
                  <FolderOpen className="w-4 h-4" />
                  Selecionar Pasta no Drive R:
                </button>
              </div>
            </div>

            {/* Opção B: Servidor Local Node.js */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-slate-800 font-bold text-xs mb-1">
                  <Server className="w-4 h-4 text-slate-600" />
                  Opção 2: Sincronização Direta Node.js
                </div>
                <p className="text-[11px] text-slate-600 mb-3">
                  Quando o sistema estiver rodando no seu micro com <code>npm run dev</code>, lê o caminho <code>R:\...</code> diretamente via sistema operacional.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSincronizarServidorLocal}
                disabled={loading}
                className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center gap-2 transition"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                Sincronizar Automaticamente
              </button>
            </div>
          </div>

          {/* Progresso de Carregamento */}
          {progresso && (
            <div className="bg-slate-100 p-3 rounded-lg border border-slate-200 space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                <span>Processando arquivos XML...</span>
                <span>{progresso.atual} de {progresso.total}</span>
              </div>
              <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-600 h-full transition-all duration-150"
                  style={{ width: `${(progresso.atual / progresso.total) * 100}%` }}
                />
              </div>
              <div className="text-[10px] text-slate-500 truncate font-mono">
                {progresso.arquivo}
              </div>
            </div>
          )}

          {/* Mensagem de Feedback */}
          {resultadoMsg && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                resultadoMsg.tipo === 'sucesso'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : resultadoMsg.tipo === 'aviso'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {resultadoMsg.tipo === 'sucesso' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <div className="font-bold">{resultadoMsg.texto}</div>
                {resultadoMsg.detalhes && (
                  <div className="text-[11px] opacity-90 leading-relaxed">
                    {resultadoMsg.detalhes}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Lista de Arquivos Identificados */}
          {arquivosLidos.length > 0 && (
            <div className="space-y-3">
              {/* Painel de Controle de Duplicidade */}
              {totalDuplicados > 0 && (
                <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <CopyX className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-amber-900">
                        {totalDuplicados} nota(s) duplicada(s) detectada(s)
                      </span>
                      <p className="text-[11px] text-amber-700">
                        Arquivos já constam na escrituração atual (mesma chave ou número/série/emitente).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700 bg-white px-2.5 py-1.5 rounded-lg border border-amber-300 shadow-2xs hover:bg-amber-50">
                      <input
                        type="checkbox"
                        checked={ignorarDuplicados}
                        onChange={e => setIgnorarDuplicados(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3.5 h-3.5"
                      />
                      <span>Ignorar Duplicadas</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Arquivos XML Identificados no Lote ({arquivosLidos.length}):</span>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-emerald-700 font-semibold">
                    {totalNovos} novas
                  </span>
                  {totalDuplicados > 0 && (
                    <span className="text-amber-700 font-semibold">
                      • {totalDuplicados} duplicadas
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 text-xs">
                {arquivosLidos.map((arq, idx) => (
                  <div
                    key={idx}
                    className={`p-2.5 flex items-center justify-between transition ${
                      arq.duplicado ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[65%]">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${arq.duplicado ? 'text-amber-500' : 'text-slate-400'}`} />
                      <div className="truncate">
                        <div className="font-mono text-[11px] text-slate-800 truncate font-semibold">
                          {arq.nome}
                        </div>
                        {arq.doc && (
                          <div className="text-[10px] text-slate-500 truncate">
                            NF-e {arq.doc.numero} • {arq.doc.emitente.razaoSocial}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {arq.duplicado && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <CopyX className="w-3 h-3" />
                          Já Cadastrada
                        </span>
                      )}

                      {arq.doc ? (
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            arq.doc.status === 'CONFORME'
                              ? 'bg-emerald-100 text-emerald-800'
                              : arq.doc.status === 'COM_DIVERGENCIAS'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {arq.doc.status === 'CONFORME' ? '100% Conforme' : 'Divergência'}
                        </span>
                      ) : (
                        <span className="text-[10px] text-red-500 font-medium">XML inválido</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Modal */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg transition"
          >
            Cancelar
          </button>

          {arquivosLidos.length > 0 && (
            <button
              type="button"
              onClick={handleConfirmarImportacao}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-2 transition"
            >
              <span>
                {ignorarDuplicados && totalDuplicados > 0
                  ? `Importar Apenas Novas (${totalNovos})`
                  : `Importar Todos (${totalValidos})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
