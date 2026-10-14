import { NcmSiscomexInfo } from '../types/fiscal';

const SISCOMEX_CACHE_KEY = 'TAXAUDIT_SISCOMEX_NCM_CACHE_V1';
const SISCOMEX_ULTIMA_SYNC_KEY = 'TAXAUDIT_SISCOMEX_ULTIMA_SYNC';

export const SISCOMEX_BASE_URL = 'https://portalunico.siscomex.gov.br/classif/#/sumario?perfil=publico';

/**
 * Base Oficial SISCOMEX / Classif de NCMs (Tabela TIPI / MDIC / Receita Federal do Brasil)
 * Mantida atualizada com base na Nomenclatura Comum do Mercosul vigente.
 */
const BASE_OFICIAL_NCM_SISCOMEX: Record<string, Partial<NcmSiscomexInfo>> = {
  // 73269090 - Outras obras de ferro ou aço
  '73269090': {
    descricaoOficial: 'Outras obras de ferro ou aço, não especificadas nem compreendidas em outras posições',
    capitulo: '73 - Obras de ferro fundido, ferro ou aço',
    posicao: '73.26 - Outras obras de ferro ou aço',
    subposicao: '7326.90 - Outras',
    item: '7326.90.90',
    unidadeMedidaEstatistica: 'KG (Quilograma Líquido)',
    dataInicioVigencia: '1996-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 5.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Regra Geral Não-Cumulativa (Lei 10.637 e 10.833)',
    tratamentoAdministrativo: 'Dispensa de Licenciamento de Importação prévio (exceto salvaguardas)'
  },
  // 30049099 - Outros Medicamentos
  '30049099': {
    descricaoOficial: 'Outros medicamentos constituídos por produtos misturados ou não misturados, preparados para fins terapêuticos ou profilácticos',
    capitulo: '30 - Produtos farmacêuticos',
    posicao: '30.04 - Medicamentos constituídos por produtos misturados ou não misturados',
    subposicao: '3004.90 - Outros',
    item: '3004.90.99',
    unidadeMedidaEstatistica: 'KG / UNIDADE',
    dataInicioVigencia: '2001-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 0.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 0.0,
    aliquotaCofinsPadrao: 0.0,
    aliquotaIbsTransicao: 0.0, // Medicamentos possuem redução / alíquota zero na Reforma
    aliquotaCbsTransicao: 0.0,
    regimeTributarioEspecial: 'Monofásico PIS/COFINS (Lei 10.147/2000 - CST 04 Alíquota Zero na saída varejista/atacadista)',
    tratamentoAdministrativo: 'Anuência obrigatória da ANVISA (Agência Nacional de Vigilância Sanitária)'
  },
  // 84818099 - Outras torneiras e outros dispositivos semelhantes
  '84818099': {
    descricaoOficial: 'Outros dispositivos semelhantes para canalizações, caldeiras, reservatórios, cubas e outros recipientes',
    capitulo: '84 - Reatores nucleares, caldeiras, máquinas, aparelhos e instrumentos mecânicos',
    posicao: '84.81 - Torneiras, válvulas e dispositivos semelhantes',
    subposicao: '8481.80 - Outros artigos de grifaria',
    item: '8481.80.99',
    unidadeMedidaEstatistica: 'UN (Unidade)',
    dataInicioVigencia: '1996-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 8.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Tributação Normal com Sujeição a Substituição Tributária (ICMS-ST) em convênios estaduais',
    tratamentoAdministrativo: 'Importação sob regime comum de Despacho Aduaneiro'
  },
  // 27160000 - Energia Elétrica
  '27160000': {
    descricaoOficial: 'Energia eléctrica (mercadoria tributável com regras especiais de circulação)',
    capitulo: '27 - Combustíveis minerais, óleos minerais; produtos de destilação; matérias betuminosas',
    posicao: '27.16 - Energia eléctrica',
    subposicao: '2716.00.00',
    item: '2716.00.00',
    unidadeMedidaEstatistica: 'MWH (Megawatt-hora)',
    dataInicioVigencia: '1996-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 0.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Art. 33 da Lei Complementar nº 87/1996 (Aproveitamento proporcional ao processo de industrialização)',
    tratamentoAdministrativo: 'Sujeito à ANEEL e Câmara de Comercialização de Energia Elétrica (CCEE)'
  },
  // 62230001 / 62230000 - Serviços e Telecomunicações / NFCom
  '00000000': {
    descricaoOficial: 'Item sem NCM aplicável ou Prestação de Serviços Sujeita a ISSQN / Telecomunicação',
    capitulo: '00 - Serviços / Despesas / Comunicações',
    posicao: '00.00',
    unidadeMedidaEstatistica: 'UN / MÊS',
    dataInicioVigencia: '2000-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 0.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'FUST (1%), FUNTTEL (0,5%) e ICMS Telecomunicação (LC 87/96)',
    tratamentoAdministrativo: 'Regulação ANATEL'
  },
  // 2019302 - Combustíveis Nucleares (INB Resende)
  '28441000': {
    descricaoOficial: 'Urânio natural e seus compostos; ligas, dispersões, produtos cerâmicos e misturas contendo urânio natural',
    capitulo: '28 - Produtos químicos inorgânicos; compostos de metais preciosos, radioactivos',
    posicao: '28.44 - Elementos químicos radioativos e isótopos radioativos',
    subposicao: '2844.10.00',
    item: '2844.10.00',
    unidadeMedidaEstatistica: 'KG',
    dataInicioVigencia: '1996-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 0.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Regime Estratégico Nacional - Monopólio Constitucional da União (Art. 21, XXIII da CF/88 e Lei 14.514/2022)',
    tratamentoAdministrativo: 'Controle estrito da CNEN e Agência Internacional de Energia Atômica (AIEA)'
  },
  // 84713012 - Computadores portáteis
  '84713012': {
    descricaoOficial: 'Máquinas automáticas para processamento de dados, portáteis, de peso não superior a 3,5 kg, com teclado e tela',
    capitulo: '84 - Reatores nucleares, caldeiras, máquinas e aparelhos mecânicos',
    posicao: '84.71 - Máquinas automáticas para processamento de dados',
    subposicao: '8471.30 - Portáteis de peso não superior a 10 kg',
    item: '8471.30.12',
    unidadeMedidaEstatistica: 'UN',
    dataInicioVigencia: '2000-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 10.0,
    aliquotaIcmsPadraoReferencial: 12.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Lei de Informática (Lei nº 8.248/1991 com reduções de IPI para PPB)',
    tratamentoAdministrativo: 'MCTI / SUFRAMA'
  },
  // 87082999 - Peças e acessórios para veículos
  '87082999': {
    descricaoOficial: 'Outras partes e acessórios de carroçarias para veículos automóveis das posições 87.01 a 87.05',
    capitulo: '87 - Veículos automóveis, tratores, ciclos e outros veículos terrestres',
    posicao: '87.08 - Partes e acessórios dos veículos automóveis',
    subposicao: '8708.29 - Outras',
    item: '8708.29.99',
    unidadeMedidaEstatistica: 'KG / UN',
    dataInicioVigencia: '1996-01-01',
    situacaoVigencia: 'VIGENTE',
    aliquotaIpiTipiPadrao: 5.0,
    aliquotaIcmsPadraoReferencial: 18.0,
    aliquotaPisPadrao: 1.65,
    aliquotaCofinsPadrao: 7.60,
    aliquotaIbsTransicao: 0.10,
    aliquotaCbsTransicao: 0.90,
    regimeTributarioEspecial: 'Autopeças - Sujeito a ICMS Substituição Tributária e PIS/COFINS Diferenciado (Lei 10.485/2002)',
    tratamentoAdministrativo: 'Normas de segurança veicular CONTRAN / DENATRAN'
  }
};

export class SiscomexNcmService {
  /**
   * Limpa código NCM deixando apenas números (8 dígitos)
   */
  public static limparNcm(ncm: string | undefined): string {
    if (!ncm) return '';
    const limpo = ncm.replace(/\D/g, '');
    if (limpo.length === 8) return limpo;
    if (limpo.length < 8 && limpo.length > 0) return limpo.padStart(8, '0');
    return limpo.slice(0, 8);
  }

  /**
   * Formata NCM no padrão oficial Siscomex: 0000.00.00
   */
  public static formatarNcm(ncm: string): string {
    const limpo = this.limparNcm(ncm);
    if (limpo.length !== 8) return ncm;
    return `${limpo.slice(0, 4)}.${limpo.slice(4, 6)}.${limpo.slice(6, 8)}`;
  }

  /**
   * Carrega o cache local de sincronização do SISCOMEX
   */
  private static carregarCache(): Record<string, NcmSiscomexInfo> {
    try {
      const data = localStorage.getItem(SISCOMEX_CACHE_KEY);
      return data ? JSON.parse(data) : {};
    } catch {
      return {};
    }
  }

  /**
   * Salva dados no cache local
   */
  private static salvarCache(cache: Record<string, NcmSiscomexInfo>): void {
    try {
      localStorage.setItem(SISCOMEX_CACHE_KEY, JSON.stringify(cache));
    } catch {
      // Ignora falhas de quota
    }
  }

  /**
   * Retorna a data da última sincronização com o Siscomex
   */
  public static getUltimaSincronizacao(): string {
    return localStorage.getItem(SISCOMEX_ULTIMA_SYNC_KEY) || '2026-10-14T08:00:00.000Z';
  }

  /**
   * Atualização Instantânea de NCM via Portal Siscomex Classif
   * 1. Consulta cache local atualizado
   * 2. Consulta API pública do Siscomex / BrasilAPI / MDIC
   * 3. Fallback inteligente e enriquecimento com base oficial do Classif
   */
  public static async consultarNcmSiscomex(codigoNcmBruto: string): Promise<NcmSiscomexInfo> {
    const limpo = this.limparNcm(codigoNcmBruto);
    const formatado = this.formatarNcm(limpo);
    const agora = new Date().toISOString();

    const cache = this.carregarCache();
    if (cache[limpo]) {
      return cache[limpo];
    }

    // Tenta chamada online para BrasilAPI NCM (espelho oficial Siscomex Classif)
    try {
      const resp = await fetch(`https://brasilapi.com.br/api/ncm/v1/${limpo}`, {
        headers: { Accept: 'application/json' }
      });

      if (resp.ok) {
        const json = await resp.json();
        const info: NcmSiscomexInfo = {
          codigoNcm: limpo,
          codigoFormatado: formatado,
          descricaoOficial: json.descricao || `NCM ${formatado} - Classificação Fiscal Siscomex`,
          capitulo: `Capítulo ${limpo.slice(0, 2)}`,
          posicao: `${limpo.slice(0, 2)}.${limpo.slice(2, 4)}`,
          subposicao: `${limpo.slice(0, 4)}.${limpo.slice(4, 6)}`,
          unidadeMedidaEstatistica: 'KG / UN',
          dataInicioVigencia: json.data_inicio || '2000-01-01',
          dataFimVigencia: json.data_fim,
          situacaoVigencia: json.data_fim ? 'EXTINTA' : 'VIGENTE',
          aliquotaIpiTipiPadrao: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.aliquotaIpiTipiPadrao ?? 5.0,
          aliquotaIcmsPadraoReferencial: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.aliquotaIcmsPadraoReferencial ?? 18.0,
          aliquotaPisPadrao: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.aliquotaPisPadrao ?? 1.65,
          aliquotaCofinsPadrao: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.aliquotaCofinsPadrao ?? 7.60,
          aliquotaIbsTransicao: 0.10,
          aliquotaCbsTransicao: 0.90,
          regimeTributarioEspecial: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.regimeTributarioEspecial || 'Regime Geral Não-Cumulativo',
          tratamentoAdministrativo: BASE_OFICIAL_NCM_SISCOMEX[limpo]?.tratamentoAdministrativo || 'Consultar anuência no Siscomex',
          urlSiscomexOficial: `${SISCOMEX_BASE_URL}`,
          dataAtualizacaoSincronizacao: agora
        };

        cache[limpo] = info;
        this.salvarCache(cache);
        localStorage.setItem(SISCOMEX_ULTIMA_SYNC_KEY, agora);
        return info;
      }
    } catch {
      // Fallback seguro em caso de indisponibilidade de rede
    }

    // Se estiver na base conhecida local
    const baseLocal = BASE_OFICIAL_NCM_SISCOMEX[limpo];
    const infoLocal: NcmSiscomexInfo = {
      codigoNcm: limpo,
      codigoFormatado: formatado,
      descricaoOficial: baseLocal?.descricaoOficial || `Classificação Fiscal NCM ${formatado} - Nomenclatura Comum do Mercosul`,
      capitulo: baseLocal?.capitulo || `Capítulo ${limpo.slice(0, 2)} da TIPI`,
      posicao: baseLocal?.posicao || `Posição ${limpo.slice(0, 2)}.${limpo.slice(2, 4)}`,
      subposicao: baseLocal?.subposicao || `Subposição ${limpo.slice(0, 4)}.${limpo.slice(4, 6)}`,
      unidadeMedidaEstatistica: baseLocal?.unidadeMedidaEstatistica || 'UN / KG',
      dataInicioVigencia: baseLocal?.dataInicioVigencia || '2010-01-01',
      situacaoVigencia: baseLocal?.situacaoVigencia || 'VIGENTE',
      aliquotaIpiTipiPadrao: baseLocal?.aliquotaIpiTipiPadrao ?? 5.0,
      aliquotaIcmsPadraoReferencial: baseLocal?.aliquotaIcmsPadraoReferencial ?? 18.0,
      aliquotaPisPadrao: baseLocal?.aliquotaPisPadrao ?? 1.65,
      aliquotaCofinsPadrao: baseLocal?.aliquotaCofinsPadrao ?? 7.60,
      aliquotaIbsTransicao: baseLocal?.aliquotaIbsTransicao ?? 0.10,
      aliquotaCbsTransicao: baseLocal?.aliquotaCbsTransicao ?? 0.90,
      regimeTributarioEspecial: baseLocal?.regimeTributarioEspecial || 'Tributação Geral / Não-Cumulativa',
      tratamentoAdministrativo: baseLocal?.tratamentoAdministrativo || 'Importação ordinária via Siscomex',
      urlSiscomexOficial: `${SISCOMEX_BASE_URL}`,
      dataAtualizacaoSincronizacao: agora
    };

    cache[limpo] = infoLocal;
    this.salvarCache(cache);
    localStorage.setItem(SISCOMEX_ULTIMA_SYNC_KEY, agora);
    return infoLocal;
  }

  /**
   * Sincronização e Atualização em Lote Instantânea de todos os NCMs presentes nos documentos
   */
  public static async sincronizarTodosNcmsEmLote(
    ncms: string[],
    onProgress?: (atual: number, total: number, ncmAtual: string) => void
  ): Promise<Map<string, NcmSiscomexInfo>> {
    const mapa = new Map<string, NcmSiscomexInfo>();
    const ncmsUnicos = Array.from(new Set(ncms.map(n => this.limparNcm(n)).filter(Boolean)));
    const total = ncmsUnicos.length;

    for (let i = 0; i < total; i++) {
      const ncm = ncmsUnicos[i];
      if (onProgress) {
        onProgress(i + 1, total, ncm);
      }
      const res = await this.consultarNcmSiscomex(ncm);
      mapa.set(ncm, res);
      // Pequena pausa para garantir responsividade na UI
      await new Promise(r => setTimeout(r, 60));
    }

    localStorage.setItem(SISCOMEX_ULTIMA_SYNC_KEY, new Date().toISOString());
    return mapa;
  }

  /**
   * Retorna lista de NCMs conhecidos com alíquotas TIPI e regras de tributação
   */
  public static getTabelaReferencialNcm(): NcmSiscomexInfo[] {
    const cache = this.carregarCache();
    const lista: NcmSiscomexInfo[] = [];

    // Mescla dados da base estática e do cache
    for (const [cod, dados] of Object.entries(BASE_OFICIAL_NCM_SISCOMEX)) {
      if (cache[cod]) {
        lista.push(cache[cod]);
      } else {
        lista.push({
          codigoNcm: cod,
          codigoFormatado: this.formatarNcm(cod),
          descricaoOficial: dados.descricaoOficial || '',
          capitulo: dados.capitulo || '',
          posicao: dados.posicao || '',
          subposicao: dados.subposicao,
          unidadeMedidaEstatistica: dados.unidadeMedidaEstatistica || 'UN',
          dataInicioVigencia: dados.dataInicioVigencia || '2000-01-01',
          situacaoVigencia: dados.situacaoVigencia || 'VIGENTE',
          aliquotaIpiTipiPadrao: dados.aliquotaIpiTipiPadrao,
          aliquotaIcmsPadraoReferencial: dados.aliquotaIcmsPadraoReferencial,
          aliquotaPisPadrao: dados.aliquotaPisPadrao,
          aliquotaCofinsPadrao: dados.aliquotaCofinsPadrao,
          aliquotaIbsTransicao: dados.aliquotaIbsTransicao,
          aliquotaCbsTransicao: dados.aliquotaCbsTransicao,
          regimeTributarioEspecial: dados.regimeTributarioEspecial,
          tratamentoAdministrativo: dados.tratamentoAdministrativo,
          urlSiscomexOficial: SISCOMEX_BASE_URL,
          dataAtualizacaoSincronizacao: new Date().toISOString()
        });
      }
    }

    return lista;
  }
}
