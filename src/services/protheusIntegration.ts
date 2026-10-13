import { DocumentoFiscal } from '../types/fiscal';

export interface ProtheusSyncPayload {
  documentoId: string;
  chaveNfe: string;
  tabelaCabecalho: 'SF1' | 'SF2';
  tabelaItens: 'SD1' | 'SD2';
  camposCabecalho: Record<string, string | number>;
  itens: Record<string, string | number>[];
}

export class ProtheusIntegrationService {
  /**
   * Converte um documento fiscal auditado no payload padrão JSON para consumo via REST pelo TOTVS Protheus
   */
  public static gerarPayloadProtheus(doc: DocumentoFiscal): ProtheusSyncPayload {
    const isEntrada = doc.tipoOperacao === 'ENTRADA';
    const tabelaCabecalho = isEntrada ? 'SF1' : 'SF2';
    const tabelaItens = isEntrada ? 'SD1' : 'SD2';

    const camposCabecalho: Record<string, string | number> = {
      F1_FILIAL: '01',
      F1_DOC: doc.numero.padStart(9, '0'),
      F1_SERIE: doc.serie.padStart(3, ' '),
      F1_FORNECE: doc.emitente.cnpjCpf.replace(/\D/g, '').substring(0, 8),
      F1_LOJA: '01',
      F1_TIPO: 'N',
      F1_EMISSAO: doc.dataEmissao.substring(0, 10).replace(/-/g, ''),
      F1_VALBRUT: doc.valorTotalDocumento,
      F1_VALMERC: doc.valorProdutos,
      F1_DESPESA: doc.valorOutrasDespesas,
      F1_FRETE: doc.valorFrete,
      F1_SEGURO: doc.valorSeguro,
      F1_DESCONT: doc.valorDesconto,
      F1_VALICM: doc.totalIcms,
      F1_VALST: doc.totalIcmsSt,
      F1_VALIPI: doc.totalIpi,
      F1_VALPIS: doc.totalPis,
      F1_VALCOF: doc.totalCofins,
      F1_CHVNFE: doc.chaveAcesso,
      F1_STATUS_AUDIT: doc.status === 'APROVADO' ? 'OK' : 'DIV'
    };

    const itens = doc.itens.map((it, idx) => ({
      D1_ITEM: String(idx + 1).padStart(4, '0'),
      D1_COD: it.codigoProduto,
      D1_UM: it.uCom,
      D1_QUANT: it.qCom,
      D1_VUNIT: it.vUnCom,
      D1_TOTAL: it.vProd,
      D1_CFOP: it.cfop,
      D1_CLASFIS: it.impostos.icmsCst,
      D1_BASEICM: it.impostos.icmsBaseCalculo,
      D1_PICM: it.impostos.icmsAliquota,
      D1_VALICM: it.impostos.icmsCalculado,
      D1_BRICMS: it.impostos.icmsStBaseCalculo,
      D1_ICMSRET: it.impostos.icmsStCalculado,
      D1_BASEIPI: it.impostos.ipiBaseCalculo,
      D1_IPI: it.impostos.ipiAliquota,
      D1_VALIPI: it.impostos.ipiCalculado,
      D1_BASEPIS: it.impostos.pisBaseCalculo,
      D1_ALQPIS: it.impostos.pisAliquota,
      D1_VALPIS: it.impostos.pisCalculado,
      D1_BASECOF: it.impostos.cofinsBaseCalculo,
      D1_ALQCOF: it.impostos.cofinsAliquota,
      D1_VALCOF: it.impostos.cofinsCalculado
    }));

    return {
      documentoId: doc.id,
      chaveNfe: doc.chaveAcesso,
      tabelaCabecalho,
      tabelaItens,
      camposCabecalho,
      itens
    };
  }

  /**
   * Gera o código fonte fonte ADVPL pronto para compilação no TDS (Totvs Developer Studio)
   * utilizando a rotina automática oficial MATA103 (Documento de Entrada)
   */
  public static gerarCodigoAdvpl(payload: ProtheusSyncPayload): string {
    return `// =========================================================================
// ROTINA DE INTEGRAÇÃO FISCAL - TOTVS PROTHEUS (ADVPL)
// Consumo do Sistema de Auditoria Tributária e Escrituração Fiscal
// ExecAuto: MATA103 (Documento de Entrada / Classificação de NF)
// =========================================================================

#Include "Protheus.ch"
#Include "TBICONN.ch"

User Function INT_FISCAL_EXEC(cJsonPayload)
    Local aCabec   := {}
    Local aItens   := {}
    Local aLinha   := {}
    Local oJson    := JsonObject():New()
    Local nI       := 0
    Local lOk      := .T.
    Private lMsErroAuto := .F.

    // 1. Parsing do JSON recebido via REST
    If oJson:FromJson(cJsonPayload) != Nil
        ConOut("[ERRO FISCAL] Falha no parse do payload JSON do Sistema Tributario.")
        Return .F.
    EndIf

    // 2. Montagem do Cabeçalho SF1 (Documento de Entrada)
    aAdd(aCabec, {"F1_FILIAL" , xFilial("SF1")               , Nil})
    aAdd(aCabec, {"F1_DOC"    , "${payload.camposCabecalho.F1_DOC}"  , Nil})
    aAdd(aCabec, {"F1_SERIE"  , "${payload.camposCabecalho.F1_SERIE}", Nil})
    aAdd(aCabec, {"F1_FORNECE", "${payload.camposCabecalho.F1_FORNECE}", Nil})
    aAdd(aCabec, {"F1_LOJA"   , "${payload.camposCabecalho.F1_LOJA}" , Nil})
    aAdd(aCabec, {"F1_TIPO"   , "N"                         , Nil})
    aAdd(aCabec, {"F1_EMISSAO", dDataBase                   , Nil})
    aAdd(aCabec, {"F1_CHVNFE" , "${payload.chaveNfe}"       , Nil})

    // 3. Montagem dos Itens SD1 com os tributos auditados e aprovados
${payload.itens
  .map(
    (it, i) => `    // Item ${i + 1}
    aLinha := {}
    aAdd(aLinha, {"D1_ITEM"   , "${it.D1_ITEM}"   , Nil})
    aAdd(aLinha, {"D1_COD"    , "${it.D1_COD}"    , Nil})
    aAdd(aLinha, {"D1_QUANT"  , ${it.D1_QUANT}    , Nil})
    aAdd(aLinha, {"D1_VUNIT"  , ${it.D1_VUNIT}    , Nil})
    aAdd(aLinha, {"D1_TOTAL"  , ${it.D1_TOTAL}    , Nil})
    aAdd(aLinha, {"D1_CFOP"   , "${it.D1_CFOP}"   , Nil})
    aAdd(aLinha, {"D1_CLASFIS", "${it.D1_CLASFIS}", Nil})
    aAdd(aLinha, {"D1_VALICM" , ${it.D1_VALICM}   , Nil})
    aAdd(aLinha, {"D1_VALPIS" , ${it.D1_VALPIS}   , Nil})
    aAdd(aLinha, {"D1_VALCOF" , ${it.D1_VALCOF}   , Nil})
    aAdd(aItens, aLinha)
`
  )
  .join('\n')}
    // 4. Executa a inclusão via ExecAuto MATA103
    MSExecAuto({|x, y, z| MATA103(x, y, z)}, aCabec, aItens, 3) // 3 = Inclusão

    If lMsErroAuto
        ConOut("[ERRO PROTHEUS] Falha na gravacao do Documento via MATA103.")
        MostraErro()
        lOk := .F.
    Else
        ConOut("[SUCESSO] Documento Fiscal " + "${payload.camposCabecalho.F1_DOC}" + " integrado com sucesso no Protheus.")
    EndIf

    Return lOk
`;
  }
}
