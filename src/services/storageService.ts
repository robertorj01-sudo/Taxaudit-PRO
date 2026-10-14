import { DocumentoFiscal, Empresa, Registro_GEPAT_Fiscal, UsuarioApp, CertificadoDigitalInfo, LicencaComercial, ArquivoXmlSalvo } from '../types/fiscal';
import { EMPRESA_PADRAO, USUARIOS_PADRAO, CERTIFICADO_PADRAO, LICENCA_PADRAO, getDocumentosIniciais } from './sampleData';
import { InternalDbService } from './internalDbService';

const STORAGE_KEYS = {
  DOCUMENTOS: 'TAXAUDIT_DOCUMENTOS_FISCAIS_V4',
  EMPRESA: 'TAXAUDIT_EMPRESA_CONFIG_V3',
  AUDIT_LOGS: 'TAXAUDIT_AUDIT_LOGS_V3',
  USUARIOS: 'TAXAUDIT_USUARIOS_V3',
  CERTIFICADO: 'TAXAUDIT_CERTIFICADO_V3',
  LICENCA: 'TAXAUDIT_LICENCA_V3',
  LAST_SAVED: 'TAXAUDIT_LAST_SAVED_TIMESTAMP',
  AUTOSAVE_ENABLED: 'TAXAUDIT_AUTOSAVE_ENABLED',
  BANCO_INTERNO_CONECTADO: 'TAXAUDIT_BANCO_INTERNO_ATIVO'
};

export class StorageService {
  /**
   * Carrega os documentos fiscais salvos. Caso não existam, retorna os dados iniciais.
   */
  static carregarDocumentos(): DocumentoFiscal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DOCUMENTOS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar documentos do localStorage:', e);
    }
    return getDocumentosIniciais();
  }

  /**
   * Salva a lista de documentos no localStorage
   */
  static salvarDocumentos(documentos: DocumentoFiscal[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.DOCUMENTOS, JSON.stringify(documentos));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Falha ao salvar documentos no localStorage:', e);
      return false;
    }
  }

  /**
   * Carrega a empresa configurada
   */
  static carregarEmpresa(): Empresa {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EMPRESA);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Falha ao carregar empresa do localStorage:', e);
    }
    return EMPRESA_PADRAO;
  }

  /**
   * Salva a empresa no localStorage
   */
  static salvarEmpresa(empresa: Empresa): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.EMPRESA, JSON.stringify(empresa));
      localStorage.setItem(STORAGE_KEYS.LAST_SAVED, new Date().toISOString());
      return true;
    } catch (e) {
      console.error('Falha ao salvar empresa:', e);
      return false;
    }
  }

  /**
   * Carrega os usuários cadastrados
   */
  static carregarUsuarios(): UsuarioApp[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USUARIOS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar usuários:', e);
    }
    return USUARIOS_PADRAO;
  }

  /**
   * Salva a lista de usuários
   */
  static salvarUsuarios(usuarios: UsuarioApp[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.USUARIOS, JSON.stringify(usuarios));
      return true;
    } catch (e) {
      console.error('Falha ao salvar usuários:', e);
      return false;
    }
  }

  /**
   * Carrega o certificado digital da empresa
   */
  static carregarCertificado(): CertificadoDigitalInfo {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CERTIFICADO);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Falha ao carregar certificado:', e);
    }
    return CERTIFICADO_PADRAO;
  }

  /**
   * Salva as informações do certificado digital
   */
  static salvarCertificado(cert: CertificadoDigitalInfo): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.CERTIFICADO, JSON.stringify(cert));
      return true;
    } catch (e) {
      console.error('Falha ao salvar certificado:', e);
      return false;
    }
  }

  /**
   * Carrega as informações da licença comercial
   */
  static carregarLicenca(): LicencaComercial {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LICENCA);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Falha ao carregar licença:', e);
    }
    return LICENCA_PADRAO;
  }

  /**
   * Salva as informações da licença comercial
   */
  static salvarLicenca(licenca: LicencaComercial): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.LICENCA, JSON.stringify(licenca));
      return true;
    } catch (e) {
      console.error('Falha ao salvar licença:', e);
      return false;
    }
  }

  /**
   * Carrega os logs de auditoria
   */
  static carregarLogs(logsIniciais: Registro_GEPAT_Fiscal[]): Registro_GEPAT_Fiscal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Falha ao carregar logs:', e);
    }
    return logsIniciais;
  }

  /**
   * Salva os logs de auditoria
   */
  static salvarLogs(logs: Registro_GEPAT_Fiscal[]): boolean {
    try {
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
      return true;
    } catch (e) {
      console.error('Falha ao salvar logs:', e);
      return false;
    }
  }

  /**
   * Retorna a data e hora do último salvamento efetuado
   */
  static getUltimaDataSalva(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_SAVED);
  }

  /**
   * Restaura os dados padrão de fábrica (Reset)
   */
  static restaurarPadrao(): void {
    localStorage.removeItem(STORAGE_KEYS.DOCUMENTOS);
    localStorage.removeItem(STORAGE_KEYS.EMPRESA);
    localStorage.removeItem(STORAGE_KEYS.AUDIT_LOGS);
    localStorage.removeItem(STORAGE_KEYS.USUARIOS);
    localStorage.removeItem(STORAGE_KEYS.CERTIFICADO);
    localStorage.removeItem(STORAGE_KEYS.LICENCA);
    localStorage.removeItem(STORAGE_KEYS.LAST_SAVED);
  }

  /**
   * Exporta um arquivo JSON de backup completo com todas as NF-es e configurações
   */
  static exportarBackupJson(
    documentos: DocumentoFiscal[],
    logs: Registro_GEPAT_Fiscal[],
    empresa?: Empresa,
    usuarios?: UsuarioApp[],
    licenca?: LicencaComercial
  ): void {
    const backup = {
      versao: 'TAXAUDIT_PRO_3.0_LIFETIME',
      dataExportacao: new Date().toISOString(),
      totalDocumentos: documentos.length,
      empresa: empresa || null,
      licenca: licenca || null,
      totalUsuarios: usuarios?.length || 0,
      usuarios: usuarios || [],
      documentos,
      logs
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `TAXAUDIT_BACKUP_COMPLETO_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Salva os dados no Banco de Dados Interno (IndexedDB + Servidor)
   */
  static async salvarNoBancoInterno(dados: {
    documentos: DocumentoFiscal[];
    empresa: Empresa;
    usuarios: UsuarioApp[];
    certificado: CertificadoDigitalInfo;
    licenca: LicencaComercial;
    logs: Registro_GEPAT_Fiscal[];
  }): Promise<{ sucesso: boolean; mensagem: string; timestamp: string }> {
    return InternalDbService.salvarTudo(dados);
  }

  /**
   * Carrega os dados persistidos do Banco de Dados Interno
   */
  static async carregarDoBancoInterno() {
    return InternalDbService.carregarTudo();
  }

  /**
   * Guarda um arquivo XML exportado ou gerado no Cofre do Banco Interno
   */
  static async salvarArquivoXmlNoBanco(arquivo: ArquivoXmlSalvo): Promise<boolean> {
    return InternalDbService.salvarArquivoXml(arquivo);
  }

  /**
   * Lista todos os arquivos XML salvos no cofre do Banco Interno
   */
  static async listarArquivosXmlDoBanco(): Promise<ArquivoXmlSalvo[]> {
    return InternalDbService.listarArquivosXml();
  }

  /**
   * Exclui um arquivo XML do cofre do Banco Interno
   */
  static async excluirArquivoXmlDoBanco(id: string): Promise<boolean> {
    return InternalDbService.excluirArquivoXml(id);
  }
}
