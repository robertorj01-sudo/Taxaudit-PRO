import {
  DocumentoFiscal,
  Empresa,
  Registro_GEPAT_Fiscal,
  UsuarioApp,
  CertificadoDigitalInfo,
  LicencaComercial,
  ArquivoXmlSalvo,
  StatusBancoInterno
} from '../types/fiscal';
import { EMPRESA_PADRAO, USUARIOS_PADRAO, CERTIFICADO_PADRAO, LICENCA_PADRAO, getDocumentosIniciais } from './sampleData';

const DB_NAME = 'TaxAuditFiscalDB_v2';
const DB_VERSION = 2;

export interface CargaInicialBanco {
  documentos: DocumentoFiscal[];
  empresa: Empresa;
  usuarios: UsuarioApp[];
  certificado: CertificadoDigitalInfo;
  licenca: LicencaComercial;
  logs: Registro_GEPAT_Fiscal[];
  arquivosXml: ArquivoXmlSalvo[];
  fonte: 'INDEXED_DB' | 'SERVIDOR_LOCAL' | 'LOCAL_STORAGE' | 'PADRAO_SISTEMA';
  dataUltimaSalva: string;
}

export class InternalDbService {
  private static dbPromise: Promise<IDBDatabase> | null = null;
  private static servidorDisponivel: boolean = true;

  /**
   * Abre e inicializa a conexão com o banco de dados interno IndexedDB do navegador.
   * Não possui os limites rígidos de 5MB do localStorage, suportando gigabytes de dados e XMLs brutos.
   */
  static getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) {
      return this.dbPromise;
    }

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB não suportado neste ambiente'));
        return;
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = request.result;

        // Tabela de Documentos Fiscais
        if (!db.objectStoreNames.contains('documentos')) {
          const store = db.createObjectStore('documentos', { keyPath: 'id' });
          store.createIndex('chaveAcesso', 'chaveAcesso', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('dataEmissao', 'dataEmissao', { unique: false });
        }

        // Tabela do Cofre de Arquivos XML Salvos / Exportados
        if (!db.objectStoreNames.contains('arquivos_xml')) {
          const xmlStore = db.createObjectStore('arquivos_xml', { keyPath: 'id' });
          xmlStore.createIndex('chaveAcesso', 'chaveAcesso', { unique: false });
          xmlStore.createIndex('dataExportacao', 'dataExportacao', { unique: false });
          xmlStore.createIndex('tipoDocumento', 'tipoDocumento', { unique: false });
        }

        // Tabela de Cadastros da Empresa
        if (!db.objectStoreNames.contains('empresa')) {
          db.createObjectStore('empresa', { keyPath: 'id' });
        }

        // Tabela de Usuários do Sistema
        if (!db.objectStoreNames.contains('usuarios')) {
          db.createObjectStore('usuarios', { keyPath: 'id' });
        }

        // Tabela de Certificados Digitais
        if (!db.objectStoreNames.contains('certificados')) {
          db.createObjectStore('certificados', { keyPath: 'id' });
        }

        // Tabela de Licença
        if (!db.objectStoreNames.contains('licenca')) {
          db.createObjectStore('licenca', { keyPath: 'id' });
        }

        // Tabela de Trilha de Auditoria GEPAT
        if (!db.objectStoreNames.contains('logs')) {
          db.createObjectStore('logs', { keyPath: 'id' });
        }

        // Tabela de Metadados e Configurações
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'chave' });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Salva todos os dados cadastrados, documentos e histórico no Banco de Dados Interno (IndexedDB + Servidor Local)
   */
  static async salvarTudo(dados: {
    documentos: DocumentoFiscal[];
    empresa: Empresa;
    usuarios: UsuarioApp[];
    certificado: CertificadoDigitalInfo;
    licenca: LicencaComercial;
    logs: Registro_GEPAT_Fiscal[];
    arquivosXml?: ArquivoXmlSalvo[];
  }): Promise<{ sucesso: boolean; mensagem: string; timestamp: string }> {
    const timestamp = new Date().toISOString();

    try {
      const db = await this.getDB();
      const tx = db.transaction(
        ['documentos', 'empresa', 'usuarios', 'certificados', 'licenca', 'logs', 'meta'],
        'readwrite'
      );

      // 1. Salvar documentos fiscais
      const docStore = tx.objectStore('documentos');
      await new Promise<void>((res, rej) => {
        const clearReq = docStore.clear();
        clearReq.onsuccess = () => {
          for (const doc of dados.documentos) {
            docStore.put(doc);
          }
          res();
        };
        clearReq.onerror = () => rej(clearReq.error);
      });

      // 2. Salvar empresa
      const empStore = tx.objectStore('empresa');
      empStore.put(dados.empresa);

      // 3. Salvar usuários
      const usrStore = tx.objectStore('usuarios');
      usrStore.clear();
      for (const u of dados.usuarios) {
        usrStore.put(u);
      }

      // 4. Salvar certificado
      const certStore = tx.objectStore('certificados');
      certStore.put({ id: 'CERT_ATIVO', ...dados.certificado });

      // 5. Salvar licença
      const licStore = tx.objectStore('licenca');
      licStore.put({ id: 'LIC_ATIVA', ...dados.licenca });

      // 6. Salvar logs de auditoria
      const logStore = tx.objectStore('logs');
      logStore.clear();
      for (const log of dados.logs) {
        logStore.put(log);
      }

      // 7. Salvar metadata de sincronização
      const metaStore = tx.objectStore('meta');
      metaStore.put({ chave: 'ULTIMO_SALVAMENTO', valor: timestamp });
      metaStore.put({ chave: 'TOTAL_DOCUMENTOS', valor: dados.documentos.length });

      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

      // Sincronizar em background com o Servidor Local via API REST se disponível
      this.sincronizarServidorLocal(dados, timestamp).catch((err) => {
        console.warn('Sincronização com API do Servidor Local em background pausada:', err.message);
      });

      return {
        sucesso: true,
        mensagem: 'Dados cadastrados, empresa e documentos salvos com sucesso no Banco de Dados Interno!',
        timestamp
      };
    } catch (e: any) {
      console.error('Erro ao salvar no Banco Interno IndexedDB:', e);
      return {
        sucesso: false,
        mensagem: `Falha ao salvar no banco interno: ${e.message}`,
        timestamp
      };
    }
  }

  /**
   * Salva um arquivo XML no Cofre de Arquivos XML do Banco de Dados Interno
   */
  static async salvarArquivoXml(arquivo: ArquivoXmlSalvo): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['arquivos_xml'], 'readwrite');
      const store = tx.objectStore('arquivos_xml');
      store.put(arquivo);

      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

      // Envia ao servidor local se online
      try {
        await fetch('/api/banco/xml/salvar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arquivoXml: arquivo })
        });
      } catch {
        // Fallback para IndexedDB ok
      }

      return true;
    } catch (err) {
      console.error('Falha ao salvar arquivo no cofre XML:', err);
      return false;
    }
  }

  /**
   * Salva múltiplos arquivos XML em lote no cofre do banco interno
   */
  static async salvarArquivosXmlEmLote(arquivos: ArquivoXmlSalvo[]): Promise<number> {
    let salvos = 0;
    try {
      const db = await this.getDB();
      const tx = db.transaction(['arquivos_xml'], 'readwrite');
      const store = tx.objectStore('arquivos_xml');

      for (const arq of arquivos) {
        store.put(arq);
        salvos++;
      }

      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

      // Sincroniza com servidor em lote
      try {
        await fetch('/api/banco/salvar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ arquivosXmlNovos: arquivos })
        });
      } catch {
        // ok
      }
    } catch (e) {
      console.error('Erro ao salvar lote no cofre XML:', e);
    }
    return salvos;
  }

  /**
   * Lista todos os arquivos XML guardados no Cofre do Banco Interno
   */
  static async listarArquivosXml(): Promise<ArquivoXmlSalvo[]> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['arquivos_xml'], 'readonly');
      const store = tx.objectStore('arquivos_xml');

      const arquivos: ArquivoXmlSalvo[] = await new Promise((res, rej) => {
        const req = store.getAll();
        req.onsuccess = () => res(req.result || []);
        req.onerror = () => rej(req.error);
      });

      if (arquivos.length > 0) {
        return arquivos.sort(
          (a, b) => new Date(b.dataExportacao).getTime() - new Date(a.dataExportacao).getTime()
        );
      }

      // Se IndexedDB estiver vazio, tentar carregar do servidor local
      try {
        const resp = await fetch('/api/banco/xml/listar');
        if (resp.ok) {
          const json = await resp.json();
          if (Array.isArray(json.arquivos) && json.arquivos.length > 0) {
            // Guardar no IndexedDB local para acesso instantâneo
            this.salvarArquivosXmlEmLote(json.arquivos).catch(() => {});
            return json.arquivos;
          }
        }
      } catch {
        // ignore
      }

      return [];
    } catch (err) {
      console.warn('Falha ao listar arquivos XML do banco interno:', err);
      return [];
    }
  }

  /**
   * Exclui um arquivo XML específico do cofre do banco interno
   */
  static async excluirArquivoXml(id: string): Promise<boolean> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(['arquivos_xml'], 'readwrite');
      const store = tx.objectStore('arquivos_xml');
      store.delete(id);
      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });
      return true;
    } catch (err) {
      console.error('Falha ao excluir arquivo XML:', err);
      return false;
    }
  }

  /**
   * Carrega todos os dados do banco interno (IndexedDB -> Servidor Local -> LocalStorage -> Padrão)
   */
  static async carregarTudo(): Promise<CargaInicialBanco> {
    // 1. Tentar IndexedDB primeiro
    try {
      const db = await this.getDB();
      const tx = db.transaction(
        ['documentos', 'empresa', 'usuarios', 'certificados', 'licenca', 'logs', 'arquivos_xml', 'meta'],
        'readonly'
      );

      const docsReq = tx.objectStore('documentos').getAll();
      const empReq = tx.objectStore('empresa').getAll();
      const usrReq = tx.objectStore('usuarios').getAll();
      const certReq = tx.objectStore('certificados').getAll();
      const licReq = tx.objectStore('licenca').getAll();
      const logReq = tx.objectStore('logs').getAll();
      const xmlReq = tx.objectStore('arquivos_xml').getAll();
      const metaReq = tx.objectStore('meta').get('ULTIMO_SALVAMENTO');

      const docs: DocumentoFiscal[] = await new Promise((res, rej) => {
        docsReq.onsuccess = () => res(docsReq.result || []);
        docsReq.onerror = () => rej(docsReq.error);
      });

      if (docs.length > 0) {
        const empList: Empresa[] = await new Promise((res) => {
          empReq.onsuccess = () => res(empReq.result || []);
          empReq.onerror = () => res([]);
        });
        const usrList: UsuarioApp[] = await new Promise((res) => {
          usrReq.onsuccess = () => res(usrReq.result || []);
          usrReq.onerror = () => res([]);
        });
        const certList: any[] = await new Promise((res) => {
          certReq.onsuccess = () => res(certReq.result || []);
          certReq.onerror = () => res([]);
        });
        const licList: any[] = await new Promise((res) => {
          licReq.onsuccess = () => res(licReq.result || []);
          licReq.onerror = () => res([]);
        });
        const logList: Registro_GEPAT_Fiscal[] = await new Promise((res) => {
          logReq.onsuccess = () => res(logReq.result || []);
          logReq.onerror = () => res([]);
        });
        const xmlList: ArquivoXmlSalvo[] = await new Promise((res) => {
          xmlReq.onsuccess = () => res(xmlReq.result || []);
          xmlReq.onerror = () => res([]);
        });
        const metaVal: any = await new Promise((res) => {
          metaReq.onsuccess = () => res(metaReq.result);
          metaReq.onerror = () => res(null);
        });

        return {
          documentos: docs,
          empresa: empList[0] || EMPRESA_PADRAO,
          usuarios: usrList.length > 0 ? usrList : USUARIOS_PADRAO,
          certificado: certList[0] || CERTIFICADO_PADRAO,
          licenca: licList[0] || LICENCA_PADRAO,
          logs: logList,
          arquivosXml: xmlList,
          fonte: 'INDEXED_DB',
          dataUltimaSalva: metaVal?.valor || new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn('IndexedDB vazio ou falhou, tentando servidor local...', e);
    }

    // 2. Tentar Servidor Local (/api/banco/dados)
    try {
      const resp = await fetch('/api/banco/dados');
      if (resp.ok) {
        const resJson = await resp.json();
        if (resJson.sucesso && resJson.dados && Array.isArray(resJson.dados.documentos) && resJson.dados.documentos.length > 0) {
          const d = resJson.dados;
          // Migrar automaticamente para o IndexedDB local
          this.salvarTudo({
            documentos: d.documentos,
            empresa: d.empresa || EMPRESA_PADRAO,
            usuarios: d.usuarios || USUARIOS_PADRAO,
            certificado: d.certificado || CERTIFICADO_PADRAO,
            licenca: d.licenca || LICENCA_PADRAO,
            logs: d.logs || [],
            arquivosXml: d.arquivosXml || []
          }).catch(() => {});

          return {
            documentos: d.documentos,
            empresa: d.empresa || EMPRESA_PADRAO,
            usuarios: d.usuarios || USUARIOS_PADRAO,
            certificado: d.certificado || CERTIFICADO_PADRAO,
            licenca: d.licenca || LICENCA_PADRAO,
            logs: d.logs || [],
            arquivosXml: d.arquivosXml || [],
            fonte: 'SERVIDOR_LOCAL',
            dataUltimaSalva: d.ultimaAtualizacao || new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('API Servidor Local indisponível, checando localStorage...', e);
    }

    // 3. Tentar migrar do localStorage legado
    try {
      const lsDocs = localStorage.getItem('TAXAUDIT_DOCUMENTOS_FISCAIS_V4');
      if (lsDocs) {
        const parsedDocs = JSON.parse(lsDocs);
        if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
          const lsEmpresa = localStorage.getItem('TAXAUDIT_EMPRESA_CONFIG_V3');
          const empresa = lsEmpresa ? JSON.parse(lsEmpresa) : EMPRESA_PADRAO;
          const lsUsuarios = localStorage.getItem('TAXAUDIT_USUARIOS_V3');
          const usuarios = lsUsuarios ? JSON.parse(lsUsuarios) : USUARIOS_PADRAO;
          const lsCert = localStorage.getItem('TAXAUDIT_CERTIFICADO_V3');
          const cert = lsCert ? JSON.parse(lsCert) : CERTIFICADO_PADRAO;
          const lsLic = localStorage.getItem('TAXAUDIT_LICENCA_V3');
          const lic = lsLic ? JSON.parse(lsLic) : LICENCA_PADRAO;
          const lsLogs = localStorage.getItem('TAXAUDIT_AUDIT_LOGS_V3');
          const logs = lsLogs ? JSON.parse(lsLogs) : [];

          // Migrar do localStorage para o novo Banco Interno IndexedDB e Servidor!
          this.salvarTudo({
            documentos: parsedDocs,
            empresa,
            usuarios,
            certificado: cert,
            licenca: lic,
            logs,
            arquivosXml: []
          }).catch(() => {});

          return {
            documentos: parsedDocs,
            empresa,
            usuarios,
            certificado: cert,
            licenca: lic,
            logs,
            arquivosXml: [],
            fonte: 'LOCAL_STORAGE',
            dataUltimaSalva: new Date().toISOString()
          };
        }
      }
    } catch (e) {
      console.warn('Migração localStorage falhou:', e);
    }

    // 4. Retornar dados iniciais padrão
    const docsIniciais = getDocumentosIniciais();
    // Salvar base inicial no Banco Interno
    this.salvarTudo({
      documentos: docsIniciais,
      empresa: EMPRESA_PADRAO,
      usuarios: USUARIOS_PADRAO,
      certificado: CERTIFICADO_PADRAO,
      licenca: LICENCA_PADRAO,
      logs: [],
      arquivosXml: []
    }).catch(() => {});

    return {
      documentos: docsIniciais,
      empresa: EMPRESA_PADRAO,
      usuarios: USUARIOS_PADRAO,
      certificado: CERTIFICADO_PADRAO,
      licenca: LICENCA_PADRAO,
      logs: [],
      arquivosXml: [],
      fonte: 'PADRAO_SISTEMA',
      dataUltimaSalva: new Date().toISOString()
    };
  }

  /**
   * Obtém o diagnóstico completo e status da conexão com o Banco de Dados Interno
   */
  static async obterStatusBanco(): Promise<StatusBancoInterno> {
    let totalDocs = 0;
    let totalXmls = 0;
    let totalLogs = 0;
    let totalUsuarios = 0;
    let ultimaSalva = '';
    let totalBytes = 0;

    try {
      const db = await this.getDB();
      const tx = db.transaction(
        ['documentos', 'arquivos_xml', 'logs', 'usuarios', 'meta'],
        'readonly'
      );

      const docsReq = tx.objectStore('documentos').count();
      const xmlsReq = tx.objectStore('arquivos_xml').count();
      const logsReq = tx.objectStore('logs').count();
      const usrReq = tx.objectStore('usuarios').count();
      const metaReq = tx.objectStore('meta').get('ULTIMO_SALVAMENTO');

      totalDocs = await new Promise((res) => {
        docsReq.onsuccess = () => res(docsReq.result || 0);
        docsReq.onerror = () => res(0);
      });
      totalXmls = await new Promise((res) => {
        xmlsReq.onsuccess = () => res(xmlsReq.result || 0);
        xmlsReq.onerror = () => res(0);
      });
      totalLogs = await new Promise((res) => {
        logsReq.onsuccess = () => res(logsReq.result || 0);
        logsReq.onerror = () => res(0);
      });
      totalUsuarios = await new Promise((res) => {
        usrReq.onsuccess = () => res(usrReq.result || 0);
        usrReq.onerror = () => res(0);
      });
      const metaObj: any = await new Promise((res) => {
        metaReq.onsuccess = () => res(metaReq.result);
        metaReq.onerror = () => res(null);
      });

      ultimaSalva = metaObj?.valor || new Date().toISOString();
    } catch (e) {
      console.warn('Erro ao ler contadores do IndexedDB:', e);
    }

    // Verificar API do Servidor Local
    let servidorAtivo = false;
    try {
      const resp = await fetch('/api/banco/status');
      if (resp.ok) {
        const json = await resp.json();
        servidorAtivo = !!json.conectado;
        if (json.tamanhoBytes) {
          totalBytes = json.tamanhoBytes;
        }
      }
    } catch {
      servidorAtivo = false;
    }

    // Estimativa de bytes no IndexedDB (média ~12KB por documento + XMLs)
    if (totalBytes === 0) {
      totalBytes = totalDocs * 12500 + totalXmls * 45000 + totalLogs * 1024 + 15000;
    }

    const espacoMb = (totalBytes / (1024 * 1024)).toFixed(2) + ' MB';

    return {
      conectado: true,
      tipoMotor: servidorAtivo ? 'HIBRIDO_SINCRONIZADO' : 'INDEXED_DB_LOCAL',
      totalDocumentos: totalDocs,
      totalArquivosXml: totalXmls,
      totalBytesArmazenados: totalBytes,
      totalLogs,
      totalUsuarios,
      ultimaSincronizacao: ultimaSalva,
      bancoNome: DB_NAME,
      versaoSchema: DB_VERSION,
      servidorLocalAtivo: servidorAtivo,
      espacoEstimadoMb: espacoMb
    };
  }

  /**
   * Exporta um dump completo do Banco de Dados Interno em formato JSON
   */
  static async exportarDumpBanco(): Promise<string> {
    const dados = await this.carregarTudo();
    const dump = {
      tipo: 'TAXAUDIT_BANCO_INTERNO_DUMP',
      versaoSchema: DB_VERSION,
      dataExportacao: new Date().toISOString(),
      ...dados
    };
    return JSON.stringify(dump, null, 2);
  }

  /**
   * Restaura um dump completo de backup no Banco de Dados Interno
   */
  static async importarDumpBanco(jsonStr: string): Promise<boolean> {
    try {
      const dump = JSON.parse(jsonStr);
      if (!dump.documentos || !Array.isArray(dump.documentos)) {
        throw new Error('Formato de dump inválido: array de documentos ausente');
      }

      await this.salvarTudo({
        documentos: dump.documentos,
        empresa: dump.empresa || EMPRESA_PADRAO,
        usuarios: dump.usuarios || USUARIOS_PADRAO,
        certificado: dump.certificado || CERTIFICADO_PADRAO,
        licenca: dump.licenca || LICENCA_PADRAO,
        logs: dump.logs || [],
        arquivosXml: dump.arquivosXml || []
      });

      return true;
    } catch (err) {
      console.error('Falha ao restaurar dump do banco interno:', err);
      return false;
    }
  }

  /**
   * Sincroniza os dados com o servidor local em background
   */
  private static async sincronizarServidorLocal(dados: any, timestamp: string): Promise<void> {
    try {
      const resp = await fetch('/api/banco/salvar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentos: dados.documentos,
          empresa: dados.empresa,
          usuarios: dados.usuarios,
          certificado: dados.certificado,
          licenca: dados.licenca,
          logs: dados.logs,
          timestamp
        })
      });
      if (resp.ok) {
        this.servidorDisponivel = true;
      }
    } catch {
      this.servidorDisponivel = false;
    }
  }

  /**
   * Limpa o banco de dados interno e restaura os dados de fábrica
   */
  static async resetarBancoInterno(): Promise<void> {
    try {
      const db = await this.getDB();
      const tx = db.transaction(
        ['documentos', 'empresa', 'usuarios', 'certificados', 'licenca', 'logs', 'arquivos_xml', 'meta'],
        'readwrite'
      );
      tx.objectStore('documentos').clear();
      tx.objectStore('empresa').clear();
      tx.objectStore('usuarios').clear();
      tx.objectStore('certificados').clear();
      tx.objectStore('licenca').clear();
      tx.objectStore('logs').clear();
      tx.objectStore('arquivos_xml').clear();
      tx.objectStore('meta').clear();

      await new Promise<void>((res, rej) => {
        tx.oncomplete = () => res();
        tx.onerror = () => rej(tx.error);
      });

      try {
        await fetch('/api/banco/reset', { method: 'POST' });
      } catch {}

      // Limpar também o localStorage legado
      localStorage.clear();
    } catch (e) {
      console.error('Erro ao resetar banco interno:', e);
    }
  }
}
