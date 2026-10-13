import {
  DocumentoFiscal,
  ItemDocumentoFiscal,
  OcorrenciaAuditoria,
  FundamentacaoAnalise,
  Empresa,
  SeveridadeAuditoria,
  GrauConfianca
} from '../types/fiscal';
import { NORMAS_CATALOGO } from './normativeDatabase';
import { ReceitaFederalService } from './receitaFederalService';

const UFS_SUL_SUDESTE = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'];
const UFS_NORTE_NORDESTE_CO_ES = [
  'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'
];

export interface ResultadoAuditoriaMotor {
  documentoAtualizado: DocumentoFiscal;
  totalOcorrencias: number;
  totalDivergenciasValor: number;
  severidadeGeral: SeveridadeAuditoria;
  resumoRegrasAplicadas: string[];
}

export class TaxRuleEngine {
  /**
   * Executa a auditoria e cálculo completo de um documento fiscal
   */
  public static analisarDocumento(doc: DocumentoFiscal, empresaContexto: Empresa): ResultadoAuditoriaMotor {
    // 0. Enriquecimento Cadastral Automático na Receita Federal (CNPJ / CPF)
    const emitenteEnriquecido = ReceitaFederalService.enriquecerParticipante(doc.emitente);
    const destinatarioEnriquecido = ReceitaFederalService.enriquecerParticipante(doc.destinatario);
    const remetenteEnriquecido = doc.remetente
      ? ReceitaFederalService.enriquecerParticipante(doc.remetente)
      : undefined;
    const tomadorEnriquecido = doc.tomador
      ? ReceitaFederalService.enriquecerParticipante(doc.tomador)
      : undefined;

    const docComCadastro: DocumentoFiscal = {
      ...doc,
      emitente: emitenteEnriquecido,
      destinatario: destinatarioEnriquecido,
      remetente: remetenteEnriquecido,
      tomador: tomadorEnriquecido
    };

    const ufOrigem = docComCadastro.emitente.uf.toUpperCase();
    const ufDestino = docComCadastro.destinatario.uf.toUpperCase();
    const isInterestadual = ufOrigem !== ufDestino;

    const ocorrenciasDocumento: OcorrenciaAuditoria[] = [];
    const regrasAplicadasSet = new Set<string>();
    regrasAplicadasSet.add('REG-RFB-CADASTRO-CNPJ-CPF');

    let totalCreditos = 0;
    let totalDebitos = 0;
    let totalDivergencias = 0;

    // 1. Validações de Cabeçalho e Cruzamento Cadastral Receita Federal
    this.validarCabecalho(docComCadastro, ufOrigem, ufDestino, isInterestadual, ocorrenciasDocumento);

    const emitenteInidoneo = Boolean(emitenteEnriquecido.validacaoReceita?.alertaCritico);

    // 2. Análise Item a Item
    const itensAtualizados: ItemDocumentoFiscal[] = docComCadastro.itens.map((item, idx) => {
      const ocorrenciasItem: OcorrenciaAuditoria[] = [];
      const fundamentacoesItem: FundamentacaoAnalise[] = [];

      // A) Auditoria do CFOP
      this.auditarCfop(item, idx + 1, isInterestadual, ufOrigem, ufDestino, ocorrenciasItem, fundamentacoesItem);

      // B) Auditoria e Cálculo do ICMS
      const icmsResult = this.auditarIcms(item, idx + 1, isInterestadual, ufOrigem, ufDestino, empresaContexto, ocorrenciasItem, fundamentacoesItem);
      regrasAplicadasSet.add(icmsResult.regraUtilizada);

      // C) Auditoria e Cálculo do ICMS-ST
      this.auditarIcmsSt(item, idx + 1, isInterestadual, ufOrigem, ufDestino, ocorrenciasItem, fundamentacoesItem);

      // D) Auditoria de PIS e COFINS
      this.auditarPisCofins(item, idx + 1, empresaContexto, ocorrenciasItem, fundamentacoesItem);

      // E) Auditoria de IPI
      this.auditarIpi(item, idx + 1, ocorrenciasItem, fundamentacoesItem);

      // F) Auditoria de IBS e CBS (Lei Complementar nº 214/2025 - Reforma Tributária)
      this.auditarIbsCbs(item, idx + 1, docComCadastro, empresaContexto, ocorrenciasItem, fundamentacoesItem);
      regrasAplicadasSet.add('R-CBS-001');
      regrasAplicadasSet.add('R-IBS-001');
      regrasAplicadasSet.add('R-IBSCBS-002');

      // F.2) Glosa Automática de Créditos em caso de Emitente Inapto / Baixado / Irregular na Receita Federal
      if (emitenteInidoneo && docComCadastro.tipoOperacao === 'ENTRADA') {
        const sitRFB = emitenteEnriquecido.validacaoReceita?.situacaoCadastral || 'INAPTA';
        item.impostos.icmsCreditoAdmissivel = false;
        item.impostos.icmsValorCredito = 0;
        item.impostos.pisCreditoAdmissivel = false;
        item.impostos.cofinsCreditoAdmissivel = false;
        item.impostos.ibsCreditoAdmissivel = false;
        item.impostos.ibsValorCredito = 0;
        item.impostos.cbsCreditoAdmissivel = false;
        item.impostos.cbsValorCredito = 0;

        fundamentacoesItem.push({
          tributo: 'CADASTRO / GLOSA RFB',
          regraCodigo: 'REG-RFB-ART82-LEI9430',
          regraNome: `Glosa Integral de Créditos — Emitente com Situação "${sitRFB}" na Receita Federal`,
          hierarquiaNormativa: 'Lei Ordinária Federal',
          normaNome: 'Lei Federal nº 9.430/1996, Art. 82 c/c Lei Complementar nº 87/1996, Art. 23',
          artigo: 'Art. 82 (Inidoneidade de documentos emitidos por CNPJ Inapto/Baixado)',
          vigencia: 'Vigente',
          explicacao: `Como o emitente (${emitenteEnriquecido.razaoSocial}) encontra-se com situação cadastral "${sitRFB}" perante a Receita Federal do Brasil, o documento é considerado inidôneo para fins fiscais, vedando-se integralmente o creditamento de ICMS, PIS, COFINS, IBS e CBS.`,
          grauConfianca: 'ALTA',
          acaoRecomendada: 'Bloquear apropriação de créditos no SPED Fiscal / EFD-Contribuições e reter pagamento até regularização ou autuação.'
        });
      }

      // G) Somatório de Créditos e Débitos
      if (docComCadastro.tipoOperacao === 'ENTRADA') {
        if (item.impostos.icmsCreditoAdmissivel) {
          totalCreditos += item.impostos.icmsCalculado;
        }
        if (item.impostos.pisCreditoAdmissivel) {
          totalCreditos += item.impostos.pisCalculado;
        }
        if (item.impostos.cofinsCreditoAdmissivel) {
          totalCreditos += item.impostos.cofinsCalculado;
        }
      } else {
        totalDebitos += item.impostos.icmsCalculado + item.impostos.pisCalculado + item.impostos.cofinsCalculado + item.impostos.ipiCalculado;
      }

      // Calcula severidade do item
      let statusItem: SeveridadeAuditoria = 'OK';
      if (ocorrenciasItem.some(o => o.severidade === 'ERRO_PROVAVEL')) {
        statusItem = 'ERRO_PROVAVEL';
      } else if (ocorrenciasItem.some(o => o.severidade === 'DIVERGENCIA')) {
        statusItem = 'DIVERGENCIA';
      } else if (ocorrenciasItem.some(o => o.severidade === 'ATENCAO' || o.severidade === 'NECESSITA_REVISAO')) {
        statusItem = 'ATENCAO';
      }

      ocorrenciasItem.forEach(o => {
        if (o.diferenca && o.diferenca > 0) {
          totalDivergencias += o.diferenca;
        }
      });

      return {
        ...item,
        ocorrencias: ocorrenciasItem,
        fundamentacoes: fundamentacoesItem,
        statusAnalise: statusItem
      };
    });

    // Soma divergências de cabeçalho/cadastro (ex: glosa integral por CNPJ Inapto)
    ocorrenciasDocumento.forEach(o => {
      if (o.diferenca && o.diferenca > 0) {
        totalDivergencias += o.diferenca;
      }
    });

    // Compila todas as ocorrências
    const todasOcorrencias = [...ocorrenciasDocumento];
    itensAtualizados.forEach(it => todasOcorrencias.push(...it.ocorrencias));

    // Determina a severidade geral do documento
    let severidadeGeral: SeveridadeAuditoria = 'OK';
    if (todasOcorrencias.some(o => o.severidade === 'ERRO_PROVAVEL')) {
      severidadeGeral = 'ERRO_PROVAVEL';
    } else if (todasOcorrencias.some(o => o.severidade === 'DIVERGENCIA')) {
      severidadeGeral = 'DIVERGENCIA';
    } else if (todasOcorrencias.some(o => o.severidade === 'ATENCAO' || o.severidade === 'NECESSITA_REVISAO')) {
      severidadeGeral = 'ATENCAO';
    }

    const totalIbsCalculado = Number(itensAtualizados.reduce((acc, it) => acc + (it.impostos.ibsCalculado || 0), 0).toFixed(2));
    const totalCbsCalculado = Number(itensAtualizados.reduce((acc, it) => acc + (it.impostos.cbsCalculado || 0), 0).toFixed(2));
    const totalCredIbs = Number(itensAtualizados.reduce((acc, it) => acc + (it.impostos.ibsValorCredito || 0), 0).toFixed(2));
    const totalCredCbs = Number(itensAtualizados.reduce((acc, it) => acc + (it.impostos.cbsValorCredito || 0), 0).toFixed(2));

    const docAtualizado: DocumentoFiscal = {
      ...docComCadastro,
      itens: itensAtualizados,
      ocorrencias: todasOcorrencias,
      totalIbs: totalIbsCalculado,
      totalCbs: totalCbsCalculado,
      totalCreditosIbsCbs: Number((totalCredIbs + totalCredCbs).toFixed(2)),
      reformaTributariaLC214: {
        faseTransicao2026: true,
        aliquotaIbsTeste: 0.10,
        aliquotaCbsTeste: 0.90,
        valorIbsApurado: totalIbsCalculado,
        valorCbsApurado: totalCbsCalculado,
        creditoIbsDisponivel: totalCredIbs,
        creditoCbsDisponivel: totalCredCbs,
        compensacaoPisCofins2026: true,
        naoCumulatividadePlena: true,
        fundamentacaoLC214: 'Lei Complementar nº 214/2025 (Arts. 1º, 8º, 28, 30, 45 e 343)'
      },
      totalCreditosApurados: Number(totalCreditos.toFixed(2)),
      totalDebitosApurados: Number(totalDebitos.toFixed(2)),
      totalDivergenciasValor: Number(totalDivergencias.toFixed(2)),
      severidadeGeral,
      status: severidadeGeral === 'OK' ? 'APROVADO' : 'COM_DIVERGENCIAS'
    };

    return {
      documentoAtualizado: docAtualizado,
      totalOcorrencias: todasOcorrencias.length,
      totalDivergenciasValor: Number(totalDivergencias.toFixed(2)),
      severidadeGeral,
      resumoRegrasAplicadas: Array.from(regrasAplicadasSet)
    };
  }

  // --- Validações de Cabeçalho & Situação Cadastral Receita Federal (CNPJ/CPF) ---
  private static validarCabecalho(
    doc: DocumentoFiscal,
    ufOrigem: string,
    ufDestino: string,
    isInterestadual: boolean,
    ocorrencias: OcorrenciaAuditoria[]
  ): void {
    // 1. Chave de acesso: 44 dígitos
    if (!doc.chaveAcesso || doc.chaveAcesso.length !== 44) {
      ocorrencias.push({
        id: `OC-CAB-${doc.id}-01`,
        tributo: 'GERAL',
        tipo: 'CHAVE_ACESSO_INVALIDA',
        severidade: 'ERRO_PROVAVEL',
        descricao: `Chave de acesso com comprimento inválido (${doc.chaveAcesso?.length || 0} dígitos; esperado 44).`,
        regraAplicada: 'Manual de Orientação do Contribuinte (MOC) NF-e v7.0',
        fundamentacaoLegal: 'Ajuste SINIEF 07/05, Cláusula terceira.',
        conclusao: 'Documento potencialmente corrompido ou emitido fora do padrão SEFAZ.',
        acaoRecomendada: 'Exigir XML íntegro emitido pela SEFAZ autorizadora.',
        grauConfianca: 'ALTA',
        resolvido: false
      });
    }

    // 2. Validação Cadastral do EMITENTE na Receita Federal (CNPJ / CPF)
    const cleanEmit = (doc.emitente.cnpjCpf || '').replace(/\D/g, '');
    const rfEmit = doc.emitente.validacaoReceita;

    if (!cleanEmit || (cleanEmit.length !== 14 && cleanEmit.length !== 11)) {
      ocorrencias.push({
        id: `OC-CAB-${doc.id}-02`,
        tributo: 'CADASTRO',
        tipo: 'CNPJ_CPF_EMITENTE_FORMATO_INVALIDO',
        severidade: 'ERRO_PROVAVEL',
        descricao: `Identificação fiscal do emitente (${doc.emitente.cnpjCpf || 'vazio'}) não possui 14 dígitos (CNPJ) nem 11 dígitos (CPF).`,
        regraAplicada: 'Validação Cadastral CNPJ/CPF Receita Federal',
        fundamentacaoLegal: 'Instrução Normativa RFB nº 2.119/2022 e IN RFB nº 1.548/2015.',
        conclusao: 'Risco crítico de inidoneidade documental ou erro estrutural no cadastro do participante.',
        acaoRecomendada: 'Bloquear escrituração e confirmar o CNPJ/CPF do fornecedor na Receita Federal.',
        grauConfianca: 'ALTA',
        resolvido: false
      });
    } else if (rfEmit) {
      // 2.1 Verificação de Dígito Verificador Módulo 11
      if (!rfEmit.validoMatematicamente) {
        ocorrencias.push({
          id: `OC-RFB-DV-EMIT-${doc.id}`,
          tributo: 'CADASTRO',
          tipo: 'DIGITO_VERIFICADOR_CNPJ_CPF_INVALIDO',
          severidade: 'ERRO_PROVAVEL',
          descricao: `ALERTA CRÍTICO: O ${rfEmit.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} do emitente (${rfEmit.documentoFormatado}) possui dígito verificador matematicamente inválido pelo algoritmo Módulo 11 da Receita Federal.`,
          regraAplicada: 'Algoritmo Oficial Módulo 11 RFB (REG-RFB-MOD11)',
          fundamentacaoLegal: 'Instrução Normativa RFB nº 2.119/2022 e Manual de Orientação do Contribuinte SEFAZ (Rejeição 207 / 208).',
          conclusao: 'Documento com numeração cadastral forjada ou corrompida.',
          acaoRecomendada: 'Rejeitar imediatamente o documento fiscal e acionar compliance.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }

      // 2.2 Verificação de Situação Cadastral Irregular (INAPTA, BAIXADA, SUSPENSA, NULA, CPF SUSPENSO/CANCELADO)
      const situacoesCriticas = [
        'INAPTA',
        'BAIXADA',
        'SUSPENSA',
        'NULA',
        'PENDENTE_REGULARIZACAO_CPF',
        'SUSPENSA_CPF',
        'CANCELADA_CPF',
        'NULA_CPF'
      ];

      if (situacoesCriticas.includes(rfEmit.situacaoCadastral)) {
        const creditosDestacadosNoXml = Number(
          (doc.totalIcms + doc.totalPis + doc.totalCofins + doc.totalIpi).toFixed(2)
        );

        ocorrencias.push({
          id: `OC-RFB-SIT-EMIT-${doc.id}`,
          tributo: 'CADASTRO',
          tipo: `ALERTA_CRITICO_CNPJ_${rfEmit.situacaoCadastral}_RFB`,
          severidade: 'ERRO_PROVAVEL',
          descricao: `ALERTA CRÍTICO RECEITA FEDERAL: Fornecedor/Emitente "${doc.emitente.razaoSocial}" (${rfEmit.documentoFormatado}) consta com Situação Cadastral "${rfEmit.situacaoCadastral}" desde ${rfEmit.dataSituacaoCadastral}. Motivo RFB: ${rfEmit.motivoSituacaoCadastral || 'Irregularidade Cadastral'}.`,
          valorInformado: creditosDestacadosNoXml,
          valorCalculado: 0,
          diferenca: creditosDestacadosNoXml > 0 ? creditosDestacadosNoXml : doc.valorTotalDocumento,
          regraAplicada: 'Cruzamento Cadastral Receita Federal & SINTEGRA (REG-RFB-IDONEIDADE)',
          fundamentacaoLegal:
            'Art. 82 da Lei Federal nº 9.430/1996, Art. 23 da Lei Complementar nº 87/1996 (Lei Kandir) e Art. 48 da IN RFB nº 2.119/2022.',
          conclusao: `DOCUMENTO FISCAL INIDÔNEO: Nos termos do Art. 82 da Lei nº 9.430/1996, não produzem efeitos tributários em favor de terceiros os documentos emitidos por pessoa jurídica cuja inscrição no CNPJ tenha sido declarada ${rfEmit.situacaoCadastral}. Glosa integral de R$ ${creditosDestacadosNoXml.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} em créditos tributários.`,
          acaoRecomendada:
            '1) Bloquear imediatamente a escrituração de créditos no SPED Fiscal e EFD-Contribuições; 2) Reter pagamento ao fornecedor pelo setor financeiro; 3) Registrar Manifestação de "Desconhecimento" ou "Operação Não Realizada" se aplicável.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    }

    // 3. Validação Cadastral do DESTINATÁRIO / CLIENTE na Receita Federal (CNPJ / CPF)
    const rfDest = doc.destinatario.validacaoReceita;
    if (rfDest) {
      if (!rfDest.validoMatematicamente) {
        ocorrencias.push({
          id: `OC-RFB-DV-DEST-${doc.id}`,
          tributo: 'CADASTRO',
          tipo: 'DIGITO_VERIFICADOR_DESTINATARIO_INVALIDO',
          severidade: 'ERRO_PROVAVEL',
          descricao: `ALERTA CRÍTICO: O ${rfDest.tipoPessoa === 'PF' ? 'CPF' : 'CNPJ'} do destinatário (${rfDest.documentoFormatado}) possui dígito verificador inválido (Erro Módulo 11).`,
          regraAplicada: 'Algoritmo Oficial Módulo 11 RFB (REG-RFB-MOD11)',
          fundamentacaoLegal: 'IN RFB nº 2.119/2022 e IN RFB nº 1.548/2015.',
          conclusao: 'Cadastro do destinatário/cliente inválido.',
          acaoRecomendada: 'Corrigir o CNPJ/CPF do destinatário no cadastro antes da escrituração.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      } else if (
        [
          'INAPTA',
          'BAIXADA',
          'SUSPENSA',
          'NULA',
          'SUSPENSA_CPF',
          'CANCELADA_CPF',
          'NULA_CPF'
        ].includes(rfDest.situacaoCadastral)
      ) {
        ocorrencias.push({
          id: `OC-RFB-SIT-DEST-${doc.id}`,
          tributo: 'CADASTRO',
          tipo: `ALERTA_CRITICO_DESTINATARIO_${rfDest.situacaoCadastral}_RFB`,
          severidade: 'ERRO_PROVAVEL',
          descricao: `ALERTA CRÍTICO RECEITA FEDERAL: Destinatário/Cliente "${doc.destinatario.razaoSocial}" (${rfDest.documentoFormatado}) encontra-se com Situação Cadastral "${rfDest.situacaoCadastral}" na Receita Federal (${rfDest.motivoSituacaoCadastral}).`,
          regraAplicada: 'Validação de Idoneidade de Destinatário (REG-RFB-DEST)',
          fundamentacaoLegal: 'Art. 124 do Código Tributário Nacional (Responsabilidade Solidária) e Ajuste SINIEF 07/05 (Denegação Uso Código 301/302).',
          conclusao: 'Operação com destinatário em situação irregular perante a Receita Federal / SINTEGRA gera responsabilidade tributária solidária.',
          acaoRecomendada: 'Bloquear faturamento/recebimento e exigir regularização cadastral imediata.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    }
  }

  // --- Auditoria de CFOP ---
  private static auditarCfop(
    item: ItemDocumentoFiscal,
    itemNum: number,
    isInterestadual: boolean,
    ufOrigem: string,
    ufDestino: string,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): void {
    const cfopPrimeiroDigito = item.cfop.charAt(0);

    if (isInterestadual) {
      // Operação interestadual DEVE iniciar com 2 (entrada) ou 6 (saída)
      if (cfopPrimeiroDigito === '1' || cfopPrimeiroDigito === '5') {
        ocorrencias.push({
          id: `OC-ITEM-${itemNum}-CFOP-01`,
          itemNumero: itemNum,
          tributo: 'GERAL',
          tipo: 'CFOP_INCOMPATIVEL_OPERACAO',
          severidade: 'ERRO_PROVAVEL',
          descricao: `CFOP ${item.cfop} é para operação interna, mas a operação é interestadual (${ufOrigem} -> ${ufDestino}). Deveria iniciar com '6' para saídas interestaduais.`,
          regraAplicada: 'Tabela de CFOP - Convênio S/N de 1970 e Ajuste SINIEF 07/05',
          fundamentacaoLegal: 'Anexo ao Convênio S/N de 15/12/1970 - Tabela de Códigos Fiscais de Operações e Prestações.',
          conclusao: 'Incompatibilidade entre a localização geográfica dos participantes e o CFOP declarado no documento.',
          acaoRecomendada: 'Solicitar Carta de Correção Eletrônica (CC-e) ao emitente retificando o CFOP para 6.xxx.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    } else {
      // Operação interna DEVE iniciar com 1 (entrada) ou 5 (saída)
      if (cfopPrimeiroDigito === '2' || cfopPrimeiroDigito === '6') {
        ocorrencias.push({
          id: `OC-ITEM-${itemNum}-CFOP-02`,
          itemNumero: itemNum,
          tributo: 'GERAL',
          tipo: 'CFOP_INCOMPATIVEL_OPERACAO',
          severidade: 'DIVERGENCIA',
          descricao: `CFOP ${item.cfop} é para operação interestadual, porém ambos os estabelecimentos estão na UF ${ufOrigem}.`,
          regraAplicada: 'Tabela de CFOP - Convênio S/N de 1970',
          fundamentacaoLegal: 'Anexo ao Convênio S/N de 15/12/1970.',
          conclusao: 'Operação estritamente interna classificada com código de operação externa.',
          acaoRecomendada: 'Revisar classificação fiscal e solicitar regularização.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    }
  }

  // --- Auditoria e Cálculo do ICMS Próprio ---
  private static auditarIcms(
    item: ItemDocumentoFiscal,
    itemNum: number,
    isInterestadual: boolean,
    ufOrigem: string,
    ufDestino: string,
    empresa: Empresa,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): { regraUtilizada: string } {
    let aliquotaEsperada = 18.0;
    let normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RICMS-SP')!;
    let regraNome = 'ICMS Interno Padrão Estadual';

    // Regra da Resolução SF 13/2012: Mercadorias de Origem Importada (Origem 1, 2, 3, 8)
    const isImportada = ['1', '2', '3', '8'].includes(item.origem);

    if (isInterestadual) {
      if (isImportada) {
        aliquotaEsperada = 4.0;
        normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RES-SF-13')!;
        regraNome = 'Resolução do Senado Federal nº 13/2012 (Alíquota 4% Importados)';
      } else if (UFS_SUL_SUDESTE.includes(ufOrigem) && UFS_NORTE_NORDESTE_CO_ES.includes(ufDestino)) {
        aliquotaEsperada = 7.0;
        normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RES-SF-22')!;
        regraNome = 'Resolução do Senado Federal nº 22/1989 (Alíquota 7% Sul/Sudeste para N/NE/CO/ES)';
      } else {
        aliquotaEsperada = 12.0;
        normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RES-SF-22')!;
        regraNome = 'Resolução do Senado Federal nº 22/1989 (Alíquota 12% Demais Interestaduais)';
      }
    } else {
      // Operação Interna
      if (ufOrigem === 'RJ') {
        aliquotaEsperada = 20.0;
        normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RICMS-RJ')!;
        regraNome = 'RICMS-RJ (Decreto 27.427/2000) - Alíquota Modal 20%';
      } else {
        aliquotaEsperada = 18.0;
        normaAplicada = NORMAS_CATALOGO.find(n => n.id === 'NORM-RICMS-SP')!;
        regraNome = 'RICMS-SP (Decreto 45.490/2000) - Alíquota Interna 18%';
      }
    }

    // Calcula Base de Cálculo e Imposto esperado
    // Base de cálculo integral = vProd + vFrete + vSeg + vOutro - vDesc
    const baseCalculoEsperada = Math.max(0, item.vProd + item.vFrete + item.vSeg + item.vOutro - item.vDesc);
    const icmsCalculado = Number(((baseCalculoEsperada * aliquotaEsperada) / 100).toFixed(2));
    const icmsInformado = item.impostos.icmsValor;
    const diferencaIcms = Math.abs(icmsInformado - icmsCalculado);

    item.impostos.icmsCalculado = icmsCalculado;
    item.impostos.icmsDiferenca = Number(diferencaIcms.toFixed(2));

    // Se empresa no Lucro Real / Presumido adquire insumos ou mercadoria para revenda, permite crédito
    const cstPermiteCredito = ['00', '10', '20', '70'].includes(item.impostos.icmsCst);
    item.impostos.icmsCreditoAdmissivel = cstPermiteCredito && empresa.regimeTributario !== 'SIMPLES_NACIONAL';
    item.impostos.icmsValorCredito = item.impostos.icmsCreditoAdmissivel ? icmsCalculado : 0;

    const isEnergiaEletrica = item.ncm === '27160000' || ['1253', '2253', '5253', '6253'].includes(item.cfop);
    if (isEnergiaEletrica) {
      aliquotaEsperada = 18.0;
      regraNome = 'ICMS Energia Elétrica - Essencialidade (LC 194/2022 e LC 87/96 Kandir)';
      // Na empresa adquirente (indústria em Lucro Real), energia elétrica no processo produtivo gera crédito proporcional via laudo (85%)
      if (empresa.regimeTributario === 'LUCRO_REAL') {
        item.impostos.icmsCreditoAdmissivel = true;
        item.impostos.icmsValorCredito = Number((icmsCalculado * 0.85).toFixed(2));
      }

      fundamentacoes.push({
        tributo: 'ICMS',
        regraCodigo: 'REG-ICMS-ENERGIA-KANDIR',
        regraNome: 'Crédito de ICMS sobre Energia Elétrica Industrial (Lei Kandir)',
        hierarquiaNormativa: 'Lei Complementar Federal (Nível 2)',
        normaNome: 'Lei Complementar nº 87/1996 (Lei Kandir)',
        artigo: 'Art. 33',
        paragrafo: 'Único',
        inciso: 'Inciso II, alínea b',
        vigencia: 'Vigente',
        explicacao: 'A entrada de energia elétrica no estabelecimento industrial da empresa adquirente gera direito ao crédito de ICMS na proporção da energia consumida no processo de industrialização (85% apurado em laudo técnico pericial). Alíquota de 18% conforme LC 194/2022 e legislação estadual.',
        fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
        grauConfianca: 'ALTA',
        acaoRecomendada: 'Escriturar o crédito proporcional (85%) no Bloco E do SPED Fiscal com suporte no laudo pericial de rateio de carga.'
      });
    }

    const isComunicacao = ['1301', '1303', '1305', '1306', '1307', '2301', '2303', '2305', '2306', '2307', '5301', '5303', '5307', '6301', '6303', '6307'].includes(item.cfop) || item.cfop.includes('303') || item.cfop.includes('301');
    if (isComunicacao) {
      aliquotaEsperada = ufOrigem === 'RJ' ? 20.0 : 18.0;
      regraNome = 'ICMS Serviço de Comunicação / Telecomunicações (LC 87/96 Kandir, Art. 33, IV & Ajuste SINIEF 07/2022)';
      if (empresa.regimeTributario === 'LUCRO_REAL') {
        item.impostos.icmsCreditoAdmissivel = true;
        item.impostos.icmsValorCredito = icmsCalculado;
      }

      fundamentacoes.push({
        tributo: 'ICMS',
        regraCodigo: 'REG-ICMS-COMUNICACAO-NFCOM',
        regraNome: 'Crédito de ICMS sobre Serviços de Comunicação (NFCom Modelo 62)',
        hierarquiaNormativa: 'Lei Complementar Federal (Nível 2)',
        normaNome: 'Lei Complementar nº 87/1996 (Lei Kandir)',
        artigo: 'Art. 33',
        paragrafo: 'Único',
        inciso: 'Inciso IV',
        vigencia: 'Vigente (Ajuste SINIEF nº 07/2022)',
        explicacao: 'A aquisição de serviços de comunicação, links dedicados de transmissão de dados e internet corporativa gera apuração de crédito fiscal nos termos do Art. 33, IV da Lei Kandir e normas da SEFAZ estadual de destino.',
        fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
        grauConfianca: 'ALTA',
        acaoRecomendada: 'Escriturar a NFCom Modelo 62 nos registros do SPED Fiscal (Registro D695/D696 e D100).'
      });
    }

    const isTransporte = ['1351', '1352', '1353', '1354', '1355', '1356', '2351', '2352', '2353', '2354', '2355', '2356', '5351', '5352', '5353', '5354', '5355', '5356', '5357', '6351', '6352', '6353', '6354', '6355', '6356', '6357'].includes(item.cfop) || item.cfop.includes('352') || item.cfop.includes('353');
    if (isTransporte) {
      aliquotaEsperada = isInterestadual ? 12.0 : (ufOrigem === 'RJ' ? 20.0 : 18.0);
      regraNome = 'ICMS Transporte de Cargas (CT-e Modelo 57 - Convênio SINIEF 06/89 & LC 87/96)';
      if (empresa.regimeTributario === 'LUCRO_REAL') {
        item.impostos.icmsCreditoAdmissivel = true;
        item.impostos.icmsValorCredito = icmsCalculado;
      }

      fundamentacoes.push({
        tributo: 'ICMS',
        regraCodigo: 'REG-ICMS-FRETE-CTE',
        regraNome: 'Crédito de ICMS sobre Serviço de Transporte de Cargas (CT-e Modelo 57)',
        hierarquiaNormativa: 'Lei Complementar Federal (Nível 2)',
        normaNome: 'Lei Complementar nº 87/1996 (Lei Kandir)',
        artigo: 'Art. 20',
        paragrafo: 'Caput',
        inciso: 'Art. 33',
        vigencia: 'Vigente',
        explicacao: 'O frete interestadual ou intermunicipal contratado sob cláusula FOB para transporte de insumos fabris confere direito a crédito integral de ICMS para o estabelecimento industrial adquirente.',
        fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp87.htm',
        grauConfianca: 'ALTA',
        acaoRecomendada: 'Escriturar o CT-e no Registro D100 do SPED Fiscal com apropriação do crédito de ICMS correspondente.'
      });
    }

    // Registra a fundamentação normativa explicável
    fundamentacoes.push({
      tributo: 'ICMS',
      regraCodigo: isInterestadual ? (isImportada ? 'R-ICMS-001' : aliquotaEsperada === 7 ? 'R-ICMS-002' : 'R-ICMS-003') : 'R-ICMS-INT',
      regraNome,
      hierarquiaNormativa: `${normaAplicada.tipoNorma} (Nível ${normaAplicada.hierarquia})`,
      normaNome: normaAplicada.identificacao,
      artigo: normaAplicada.artigo,
      paragrafo: normaAplicada.paragrafo,
      inciso: normaAplicada.inciso,
      vigencia: `Desde ${normaAplicada.dataInicioVigencia}`,
      explicacao: `A operação entre ${ufOrigem} e ${ufDestino}${isImportada ? ' com mercadoria de origem importada' : ''} submete-se à alíquota de ${aliquotaEsperada}%. Base de cálculo calculada em R$ ${baseCalculoEsperada.toFixed(2)} segundo o art. 13 da Lei Complementar nº 87/1996.`,
      fonteOficialUrl: normaAplicada.linkOficial,
      grauConfianca: 'ALTA',
      acaoRecomendada: diferencaIcms > 0.10 ? 'Solicitar Carta de Correção ou retificação de alíquota ao emitente.' : 'Alíquota em conformidade com as normas vigentes.'
    });

    // Se houver discrepância de alíquota ou valor superior a 10 centavos
    if (Math.abs(item.impostos.icmsAliquota - aliquotaEsperada) > 0.01 && item.impostos.icmsCst === '00') {
      ocorrencias.push({
        id: `OC-ITEM-${itemNum}-ICMS-01`,
        itemNumero: itemNum,
        tributo: 'ICMS',
        tipo: 'DIVERGENCIA_ALIQUOTA_ICMS',
        severidade: 'DIVERGENCIA',
        descricao: `Alíquota de ICMS informada (${item.impostos.icmsAliquota}%) diverge da alíquota legal esperada (${aliquotaEsperada}%) para a operação ${ufOrigem} -> ${ufDestino}.`,
        valorInformado: item.impostos.icmsValor,
        valorCalculado: icmsCalculado,
        diferenca: Number(diferencaIcms.toFixed(2)),
        regraAplicada: regraNome,
        fundamentacaoLegal: `${normaAplicada.identificacao}, ${normaAplicada.artigo}`,
        conclusao: `Apuração de diferença de R$ ${diferencaIcms.toFixed(2)} no ICMS próprio do item.`,
        acaoRecomendada: 'Solicitar manifestação do emitente ou registrar estorno de crédito correspondente na escrituração.',
        grauConfianca: 'ALTA',
        resolvido: false
      });
    }

    return { regraUtilizada: regraNome };
  }

  // --- Auditoria de ICMS-ST ---
  private static auditarIcmsSt(
    item: ItemDocumentoFiscal,
    itemNum: number,
    isInterestadual: boolean,
    ufOrigem: string,
    ufDestino: string,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): void {
    const cstComSt = ['10', '30', '70', '201', '202', '203'].includes(item.impostos.icmsCst);

    if (cstComSt || item.cest) {
      item.impostos.temSt = true;
      const mvaPadrao = 45.0; // MVA referencial Convênio CONFAZ
      item.impostos.icmsStMva = item.impostos.icmsStMva || mvaPadrao;

      // Base ST = (vProd + vFrete + vSeg + vOutro - vDesc + vIPI) * (1 + MVA/100)
      const baseStEsperada = (item.vProd + item.vFrete + item.vSeg + item.vOutro - item.vDesc + item.impostos.ipiValor) * (1 + (item.impostos.icmsStMva / 100));
      const aliquotaInternaDestino = 18.0;
      // ICMS ST = (Base ST * Alíquota Interna) - ICMS Próprio
      const valorStCalculado = Math.max(0, (baseStEsperada * (aliquotaInternaDestino / 100)) - item.impostos.icmsCalculado);

      item.impostos.icmsStBaseCalculo = Number(baseStEsperada.toFixed(2));
      item.impostos.icmsStCalculado = Number(valorStCalculado.toFixed(2));
      item.impostos.icmsStDiferenca = Number(Math.abs(item.impostos.icmsStValor - valorStCalculado).toFixed(2));

      const normaSt = NORMAS_CATALOGO.find(n => n.id === 'NORM-CONV-142-18')!;
      fundamentacoes.push({
        tributo: 'ICMS_ST',
        regraCodigo: 'R-ICMS-ST-001',
        regraNome: 'Substituição Tributária - Cláusula 11ª Convênio CONFAZ 142/2018',
        hierarquiaNormativa: 'Convênio CONFAZ (Nível 5)',
        normaNome: normaSt.identificacao,
        artigo: normaSt.artigo,
        paragrafo: normaSt.paragrafo,
        vigencia: `Desde ${normaSt.dataInicioVigencia}`,
        explicacao: `Cálculo da retenção do ICMS-ST aplicando MVA de ${item.impostos.icmsStMva}%, gerando Base ST de R$ ${baseStEsperada.toFixed(2)} com abatimento do ICMS próprio.`,
        fonteOficialUrl: normaSt.linkOficial,
        grauConfianca: 'ALTA',
        acaoRecomendada: 'Conferir protocolo estadual específico entre os estados e MVA ajustada.'
      });

      if (Math.abs(item.impostos.icmsStValor - valorStCalculado) > 1.0) {
        ocorrencias.push({
          id: `OC-ITEM-${itemNum}-ST-01`,
          itemNumero: itemNum,
          tributo: 'ICMS_ST',
          tipo: 'DIVERGENCIA_ICMS_ST',
          severidade: 'ATENCAO',
          descricao: `ICMS-ST declarado (R$ ${item.impostos.icmsStValor.toFixed(2)}) diverge do cálculo padrão com MVA ${item.impostos.icmsStMva}% (R$ ${valorStCalculado.toFixed(2)}).`,
          valorInformado: item.impostos.icmsStValor,
          valorCalculado: valorStCalculado,
          diferenca: Number(Math.abs(item.impostos.icmsStValor - valorStCalculado).toFixed(2)),
          regraAplicada: 'Convênio ICMS nº 142/2018',
          fundamentacaoLegal: 'Cláusula décima primeira do Convênio CONFAZ 142/2018.',
          conclusao: 'Possível divergência no percentual de MVA ou na alíquota interna de destino utilizada pelo emitente.',
          acaoRecomendada: 'Verificar se o produto possui MVA original ou ajustada para a operação interestadual.',
          grauConfianca: 'MEDIA',
          resolvido: false
        });
      }
    }
  }

  // --- Auditoria de PIS e COFINS ---
  private static auditarPisCofins(
    item: ItemDocumentoFiscal,
    itemNum: number,
    empresa: Empresa,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): void {
    // Alíquotas do Regime Não-Cumulativo: PIS 1.65%, COFINS 7.60%
    const isLucroReal = empresa.regimeTributario === 'LUCRO_REAL';
    const isMonofasico = ['3004', '3003', '3303', '3304', '3305', '8708'].some(prefix => item.ncm.startsWith(prefix));

    if (isMonofasico) {
      // Lei 10.147/2000 - Tributação Monofásica (CST 04 - Alíquota 0% para revenda)
      item.impostos.pisCalculado = 0;
      item.impostos.cofinsCalculado = 0;
      item.impostos.pisCreditoAdmissivel = false;
      item.impostos.cofinsCreditoAdmissivel = false;

      const normaMono = NORMAS_CATALOGO.find(n => n.id === 'NORM-LEI-10147')!;
      fundamentacoes.push({
        tributo: 'PIS/COFINS',
        regraCodigo: 'R-PISCOF-MONO-01',
        regraNome: 'Tributação Monofásica - Lei 10.147/2000',
        hierarquiaNormativa: 'Lei Ordinária Federal (Nível 3)',
        normaNome: normaMono.identificacao,
        artigo: normaMono.artigo,
        vigencia: `Desde ${normaMono.dataInicioVigencia}`,
        explicacao: `O produto com NCM ${item.ncm} enquadra-se no regime monofásico de PIS e COFINS. Na condição de revenda atacadista/varejista, aplica-se alíquota zero (CST 04), sendo vedada a tomada de crédito tributário na entrada.`,
        fonteOficialUrl: normaMono.linkOficial,
        grauConfianca: 'ALTA',
        acaoRecomendada: 'Garantir a desoneração tributária na saída e estornar eventual crédito tomado indevidamente.'
      });

      // Se foi destacado CST 01 com tributação ou tentativa de tomada de crédito
      if (item.impostos.pisCst === '01' || item.impostos.pisValor > 0) {
        ocorrencias.push({
          id: `OC-ITEM-${itemNum}-PIS-01`,
          itemNumero: itemNum,
          tributo: 'PIS',
          tipo: 'CREDITO_INDEVIDO_MONOFASICO',
          severidade: 'DIVERGENCIA',
          descricao: `Produto com NCM ${item.ncm} sujeito ao regime monofásico (Lei 10.147/2000) mas tributado sob CST ${item.impostos.pisCst} com destaque de PIS.`,
          valorInformado: item.impostos.pisValor,
          valorCalculado: 0,
          diferenca: item.impostos.pisValor,
          regraAplicada: 'Lei nº 10.147/2000, Art. 1º e 2º',
          fundamentacaoLegal: 'Lei nº 10.147/2000 c/c Lei nº 10.637/2002 Art. 3º.',
          conclusao: 'Risco de tomada indevida de crédito tributário de PIS ou cobrança em duplicidade na revenda.',
          acaoRecomendada: 'Parametrizar o item como CST 04 (monofásico - alíquota zero) para escrituração no SPED Contribuições.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    } else if (isLucroReal) {
      // Regime Não-Cumulativo Normal
      const basePis = Math.max(0, item.vProd - item.vDesc);
      const pisCalc = Number(((basePis * 1.65) / 100).toFixed(2));
      const cofinsCalc = Number(((basePis * 7.60) / 100).toFixed(2));

      item.impostos.pisCalculado = pisCalc;
      item.impostos.cofinsCalculado = cofinsCalc;
      item.impostos.pisCreditoAdmissivel = true;
      item.impostos.cofinsCreditoAdmissivel = true;

      if (item.ncm === '27160000' || ['1253', '2253', '5253', '6253'].includes(item.cfop)) {
        fundamentacoes.push({
          tributo: 'PIS/COFINS',
          regraCodigo: 'REG-PIS-COFINS-ENERGIA',
          regraNome: 'Crédito Não-Cumulativo de PIS/COFINS sobre Energia Elétrica',
          hierarquiaNormativa: 'Lei Federal Ordinária (Nível 3)',
          normaNome: 'Leis Federais nº 10.637/2002 e 10.833/2003',
          artigo: 'Art. 3º',
          paragrafo: 'Caput',
          inciso: 'Inciso IX',
          vigencia: 'Vigente',
          explicacao: 'A pessoa jurídica adquirente tributada pelo Lucro Real tem direito ao crédito integral de PIS (1,65%) e COFINS (7,60%) sobre a energia elétrica e térmica consumidas nos seus estabelecimentos industriais.',
          fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/2002/L10637.htm',
          grauConfianca: 'ALTA',
          acaoRecomendada: 'Apropriar 100% dos créditos de PIS (1,65%) e COFINS (7,60%) nos Registros M100/M500 do EFD-Contribuições.'
        });
      }

      if (['1301', '1303', '1305', '1306', '1307', '2301', '2303', '2305', '2306', '2307'].includes(item.cfop) || item.cfop.includes('303')) {
        fundamentacoes.push({
          tributo: 'PIS/COFINS',
          regraCodigo: 'REG-PIS-COFINS-COMUNICACAO',
          regraNome: 'Crédito Não-Cumulativo de PIS/COFINS sobre Serviços de Comunicação',
          hierarquiaNormativa: 'Lei Federal Ordinária (Nível 3)',
          normaNome: 'Leis Federais nº 10.637/2002 e 10.833/2003',
          artigo: 'Art. 3º',
          paragrafo: 'Caput',
          inciso: 'Inciso II e IX',
          vigencia: 'Vigente',
          explicacao: 'A aquisição de serviços de comunicação, conexão e tráfego de dados para a operação corporativa e produtiva da pessoa jurídica em Lucro Real gera direito a crédito de PIS (1,65%) e COFINS (7,60%).',
          fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/2002/L10637.htm',
          grauConfianca: 'ALTA',
          acaoRecomendada: 'Escriturar créditos de PIS/COFINS nos Blocos M100/M500 do EFD-Contribuições.'
        });
      }

      if (['1351', '1352', '1353', '1354', '1355', '1356', '2351', '2352', '2353', '2354', '2355', '2356'].includes(item.cfop) || item.cfop.includes('352')) {
        fundamentacoes.push({
          tributo: 'PIS/COFINS',
          regraCodigo: 'REG-PIS-COFINS-FRETE',
          regraNome: 'Crédito Não-Cumulativo de PIS/COFINS sobre Frete de Insumos (CT-e)',
          hierarquiaNormativa: 'Lei Federal Ordinária (Nível 3)',
          normaNome: 'Leis Federais nº 10.637/2002 e 10.833/2003',
          artigo: 'Art. 3º',
          paragrafo: 'Caput',
          inciso: 'Inciso II e IX',
          vigencia: 'Vigente',
          explicacao: 'A pessoa jurídica no Lucro Real tem direito a descontar créditos de PIS (1,65%) e COFINS (7,60%) sobre o frete na aquisição de matérias-primas e insumos de industrialização.',
          fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/2002/L10637.htm',
          grauConfianca: 'ALTA',
          acaoRecomendada: 'Apropriar créditos nos Registros M100/M500 do EFD-Contribuições com base no CT-e.'
        });
      }
    }
  }

  // --- Auditoria de IPI ---
  private static auditarIpi(
    item: ItemDocumentoFiscal,
    itemNum: number,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): void {
    if (item.impostos.ipiAliquota > 0) {
      const baseIpi = item.vProd - item.vDesc;
      const ipiEsperado = Number(((baseIpi * item.impostos.ipiAliquota) / 100).toFixed(2));
      item.impostos.ipiCalculado = ipiEsperado;

      if (Math.abs(item.impostos.ipiValor - ipiEsperado) > 0.05) {
        ocorrencias.push({
          id: `OC-ITEM-${itemNum}-IPI-01`,
          itemNumero: itemNum,
          tributo: 'IPI',
          tipo: 'DIVERGENCIA_CALCULO_IPI',
          severidade: 'DIVERGENCIA',
          descricao: `IPI declarado (R$ ${item.impostos.ipiValor.toFixed(2)}) diverge do cálculo padrão pela alíquota ${item.impostos.ipiAliquota}% (R$ ${ipiEsperado.toFixed(2)}).`,
          valorInformado: item.impostos.ipiValor,
          valorCalculado: ipiEsperado,
          diferenca: Number(Math.abs(item.impostos.ipiValor - ipiEsperado).toFixed(2)),
          regraAplicada: 'Regulamento do IPI (Decreto nº 7.212/2010 - RIPI)',
          fundamentacaoLegal: 'Decreto Federal nº 7.212/2010, Art. 190.',
          conclusao: 'Cálculo do imposto sobre produtos industrializados inconsistente com a base de cálculo.',
          acaoRecomendada: 'Conferir enquadramento e base de IPI.',
          grauConfianca: 'ALTA',
          resolvido: false
        });
      }
    }
  }

  // --- Auditoria de IBS e CBS (Lei Complementar nº 214/2025 - Reforma Tributária) ---
  private static auditarIbsCbs(
    item: ItemDocumentoFiscal,
    itemNum: number,
    doc: DocumentoFiscal,
    empresaContexto: Empresa,
    ocorrencias: OcorrenciaAuditoria[],
    fundamentacoes: FundamentacaoAnalise[]
  ): void {
    // 1. Base de Cálculo do IBS e CBS (Art. 8º da LC 214/2025)
    // Valor integral da operação acrescido de frete, seguro e despesas acessórias, deduzido de descontos
    const baseEsperada = Number(Math.max(0, item.vProd + item.vFrete + item.vSeg + item.vOutro - item.vDesc).toFixed(2));
    if (!item.impostos.ibsBaseCalculo || item.impostos.ibsBaseCalculo === 0) {
      item.impostos.ibsBaseCalculo = baseEsperada;
    }
    if (!item.impostos.cbsBaseCalculo || item.impostos.cbsBaseCalculo === 0) {
      item.impostos.cbsBaseCalculo = baseEsperada;
    }

    // 2. Alíquotas de Transição / Teste (Ano 2026 - Art. 343 da LC 214/2025)
    // CBS (União): 0,90%
    // IBS (Estados e Municípios): 0,10%
    // Total de 1,00%
    let aliquotaIbsEsperada = 0.10;
    let aliquotaCbsEsperada = 0.90;
    let isRegimeDiferenciado = false;
    let explicacaoDiferenciado = '';

    // Regime diferenciado para medicamentos (Art. 138 da LC 214/2025 - Redução de 60%)
    if (item.ncm.startsWith('3004') || item.ncm.startsWith('3003')) {
      isRegimeDiferenciado = true;
      aliquotaIbsEsperada = 0.04;
      aliquotaCbsEsperada = 0.36;
      explicacaoDiferenciado = 'Medicamentos e produtos farmacêuticos essenciais possuem redução de 60% nas alíquotas de IBS e CBS conforme Anexo da LC 214/2025.';
    }

    // Cálculo do IBS e CBS esperados
    const ibsEsperado = Number(((item.impostos.ibsBaseCalculo * aliquotaIbsEsperada) / 100).toFixed(2));
    const cbsEsperado = Number(((item.impostos.cbsBaseCalculo * aliquotaCbsEsperada) / 100).toFixed(2));

    item.impostos.ibsCalculado = ibsEsperado;
    item.impostos.cbsCalculado = cbsEsperado;
    item.impostos.ibsDiferenca = Number(Math.abs(item.impostos.ibsValor - ibsEsperado).toFixed(2));
    item.impostos.cbsDiferenca = Number(Math.abs(item.impostos.cbsValor - cbsEsperado).toFixed(2));

    // 3. Regra de Crédito Financeiro Amplo (Não-Cumulatividade Plena - Arts. 28 e 30 da LC 214/2025)
    // Para as operações de ENTRADA da empresa adquirente (Lucro Real), toda aquisição vinculada à atividade
    // econômica (energia elétrica, insumos industriais, manutenção) confere direito a crédito integral.
    const permiteCreditoIbsCbs = doc.tipoOperacao === 'ENTRADA' && !['5551', '1556'].includes(item.cfop);
    item.impostos.ibsCreditoAdmissivel = permiteCreditoIbsCbs;
    item.impostos.ibsValorCredito = permiteCreditoIbsCbs ? ibsEsperado : 0;
    item.impostos.cbsCreditoAdmissivel = permiteCreditoIbsCbs;
    item.impostos.cbsValorCredito = permiteCreditoIbsCbs ? cbsEsperado : 0;

    // 4. Verificação de Divergência na alíquota ou cálculo destacado no XML
    if (item.impostos.ibsValor > 0 && Math.abs(item.impostos.ibsValor - ibsEsperado) > 0.05) {
      ocorrencias.push({
        id: `OC-ITEM-${itemNum}-IBS-01`,
        itemNumero: itemNum,
        tributo: 'IBS',
        tipo: 'DIVERGENCIA_IBS_LC214',
        severidade: 'DIVERGENCIA',
        descricao: `IBS destacado no item ${itemNum} (R$ ${item.impostos.ibsValor.toFixed(2)}) diverge da alíquota regulamentar de transição 2026 de ${aliquotaIbsEsperada}% (esperado: R$ ${ibsEsperado.toFixed(2)}).`,
        valorInformado: item.impostos.ibsValor,
        valorCalculado: ibsEsperado,
        diferenca: item.impostos.ibsDiferenca,
        regraAplicada: 'LC 214/2025 - Alíquota de Teste do IBS 0,10% (Art. 343)',
        fundamentacaoLegal: 'Lei Complementar nº 214/2025, Arts. 8º e 343.',
        conclusao: 'Divergência apurada no cálculo do Imposto sobre Bens e Serviços (IBS - Estados e Municípios).',
        acaoRecomendada: 'Ajustar base de cálculo e alíquota de teste do IBS conforme cronograma da LC 214/2025.',
        grauConfianca: 'ALTA',
        resolvido: false
      });
    }

    if (item.impostos.cbsValor > 0 && Math.abs(item.impostos.cbsValor - cbsEsperado) > 0.05) {
      ocorrencias.push({
        id: `OC-ITEM-${itemNum}-CBS-01`,
        itemNumero: itemNum,
        tributo: 'CBS',
        tipo: 'DIVERGENCIA_CBS_LC214',
        severidade: 'DIVERGENCIA',
        descricao: `CBS destacada no item ${itemNum} (R$ ${item.impostos.cbsValor.toFixed(2)}) diverge da alíquota regulamentar de transição 2026 de ${aliquotaCbsEsperada}% (esperado: R$ ${cbsEsperado.toFixed(2)}).`,
        valorInformado: item.impostos.cbsValor,
        valorCalculado: cbsEsperado,
        diferenca: item.impostos.cbsDiferenca,
        regraAplicada: 'LC 214/2025 - Alíquota de Teste da CBS 0,90% (Art. 343)',
        fundamentacaoLegal: 'Lei Complementar nº 214/2025, Arts. 8º e 343.',
        conclusao: 'Divergência apurada no cálculo da Contribuição sobre Bens e Serviços (CBS - União).',
        acaoRecomendada: 'Verificar se o fornecedor aplicou a alíquota de transição de 0,90% prevista no Art. 343 da LC 214/2025.',
        grauConfianca: 'ALTA',
        resolvido: false
      });
    }

    // Fundamentação legal detalhada da Reforma Tributária (LC 214/2025)
    fundamentacoes.push({
      tributo: 'IBS / CBS',
      regraCodigo: 'R-LC214-TRANSICAO',
      regraNome: 'Reforma Tributária - Regime de Transição 2026 e Não-Cumulatividade Plena',
      hierarquiaNormativa: 'Lei Complementar Federal (Hierarquia 2)',
      normaNome: 'Lei Complementar nº 214/2025',
      artigo: 'Arts. 8º, 28, 30 e 343',
      paragrafo: '§ 1º do Art. 343',
      vigencia: 'Vigente a partir de 2025/2026',
      explicacao: isRegimeDiferenciado
        ? explicacaoDiferenciado
        : `Conforme a LC 214/2025 (Art. 343), em 2026 vigora a alíquota de teste de 0,90% para a CBS e 0,10% para o IBS (total 1,00%). Pelo princípio da não-cumulatividade plena (Art. 28), as aquisições de insumos geram direito a crédito integral para a atividade econômica, compensável com PIS/COFINS no ano de 2026.`,
      fonteOficialUrl: 'https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm',
      grauConfianca: 'ALTA',
      acaoRecomendada: permiteCreditoIbsCbs
        ? `Apropriar R$ ${ibsEsperado.toFixed(2)} de crédito de IBS e R$ ${cbsEsperado.toFixed(2)} de crédito de CBS (LC 214/2025).`
        : 'Operação sem apropriação de crédito de IBS/CBS por se tratar de consumo final sem aproveitamento fabril.'
    });
  }
}
