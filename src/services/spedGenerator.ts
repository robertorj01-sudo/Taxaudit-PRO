import { DocumentoFiscal, Empresa } from '../types/fiscal';

export class SpedFiscalGenerator {
  /**
   * Gera o arquivo formatado da EFD ICMS/IPI (SPED Fiscal) conforme Guia Prático da EFD
   */
  public static gerarEfdIcmsIpi(empresa: Empresa, documentos: DocumentoFiscal[], periodoInicio: string, periodoFim: string): string {
    const linhas: string[] = [];

    const formatDataSped = (isoStr: string): string => {
      if (!isoStr) return '';
      const d = new Date(isoStr);
      const dia = String(d.getDate()).padStart(2, '0');
      const mes = String(d.getMonth() + 1).padStart(2, '0');
      const ano = d.getFullYear();
      return `${dia}${mes}${ano}`;
    };

    const formatNumSped = (val?: number): string => {
      if (val === undefined || val === null || isNaN(val)) return '0,00';
      return val.toFixed(2).replace('.', ',');
    };

    // Bloco 0: Abertura e Identificação
    // Registro 0000: Abertura do Arquivo Digital e Identificação da PJ
    // |0000|018|0|DT_INI|DT_FIN|NOME|CNPJ|UF|IE|COD_MUN|IM|IND_PERFIL|IND_ATIV|
    linhas.push(
      `|0000|018|0|${formatDataSped(periodoInicio)}|${formatDataSped(periodoFim)}|${empresa.razaoSocial}|${empresa.cnpj.replace(/\D/g, '')}|${empresa.uf}|${empresa.inscricaoEstadual.replace(/\D/g, '')}|${empresa.codigoMunicipioIBGE}|${empresa.inscricaoMunicipal?.replace(/\D/g, '') || ''}|${empresa.perfilSped}|1|`
    );
    linhas.push('|0001|0|'); // Abertura do Bloco 0

    // Participantes únicos dos documentos aprovados
    const partMap = new Map<string, { cod: string; nome: string; cnpj: string; uf: string; ie: string }>();
    const prodMap = new Map<string, { cod: string; desc: string; un: string; ncm: string }>();

    documentos.forEach((doc, dIdx) => {
      const pKey = doc.emitente.cnpjCpf;
      if (!partMap.has(pKey)) {
        partMap.set(pKey, {
          cod: `PART_${dIdx + 1}`,
          nome: doc.emitente.razaoSocial,
          cnpj: doc.emitente.cnpjCpf.replace(/\D/g, ''),
          uf: doc.emitente.uf,
          ie: doc.emitente.inscricaoEstadual?.replace(/\D/g, '') || ''
        });
      }

      doc.itens.forEach(it => {
        if (!prodMap.has(it.codigoProduto)) {
          prodMap.set(it.codigoProduto, {
            cod: it.codigoProduto,
            desc: it.descricao,
            un: it.uCom,
            ncm: it.ncm
          });
        }
      });
    });

    // Registro 0150: Tabela de Cadastro do Participante
    partMap.forEach(p => {
      linhas.push(`|0150|${p.cod}|${p.nome}|1058|${p.cnpj}||${p.ie}|${empresa.codigoMunicipioIBGE}||||`);
    });

    // Registro 0190: Unidades de Medida
    linhas.push('|0190|UN|UNIDADE|');
    linhas.push('|0190|CX|CAIXA|');
    linhas.push('|0190|M|METRO|');

    // Registro 0200: Identificação do Item (Produtos)
    prodMap.forEach(pr => {
      linhas.push(`|0200|${pr.cod}|${pr.desc}|||${pr.un}|00|${pr.ncm}||||18,00|`);
    });

    linhas.push(`|0990|${linhas.length + 1}|`); // Encerramento Bloco 0

    // Bloco C: Documentos Fiscais I - Mercadorias e Energia Elétrica (ICMS/IPI)
    const docsBlocoC = documentos.filter(d => d.tipoDocumento === 'NFE' || d.tipoDocumento === 'NFCE' || d.tipoDocumento === 'NF3E');
    const docsBlocoD = documentos.filter(d => d.tipoDocumento === 'CTE' || d.tipoDocumento === 'NFCOM');

    const inicioBlocoC = linhas.length;
    linhas.push(`|C001|${docsBlocoC.length > 0 ? '0' : '1'}|`); // Abertura Bloco C

    docsBlocoC.forEach(doc => {
      const part = partMap.get(doc.emitente.cnpjCpf);
      const indOper = doc.tipoOperacao === 'ENTRADA' ? '0' : '1';
      const indEmit = '0'; // Emissão própria ou de terceiros

      if (doc.tipoDocumento === 'NF3E') {
        // Registro C500: Nota Fiscal / Fatura de Energia Elétrica (Modelo 66)
        // |C500|IND_OPER|IND_EMIT|COD_PART|COD_MOD|COD_SIT|SER|SUB|NUM_DOC|DT_DOC|DT_E_S|VL_DOC|VL_DESC|VL_FORN|VL_SERV_NT|VL_TERC|VL_DA|VL_BC_ICMS|VL_ICMS|VL_BC_ICMS_ST|VL_ICMS_ST|COD_INF|VL_PIS|VL_COFINS|TP_LIGACAO|COD_GRUPO_TENSAO|CHV_DOCe|FIN_DOCe|
        linhas.push(
          `|C500|${indOper}|${indEmit}|${part?.cod || 'PART_1'}|66|00|${doc.serie}||${doc.numero}|${formatDataSped(doc.dataEmissao)}|${formatDataSped(doc.dataEntradaSaida || doc.dataEmissao)}|${formatNumSped(doc.valorTotalDocumento)}|0,00|${formatNumSped(doc.valorProdutos)}|0,00|0,00|0,00|${formatNumSped(doc.itens[0]?.impostos.icmsBaseCalculo || doc.valorProdutos)}|${formatNumSped(doc.totalIcms)}|0,00|0,00||${formatNumSped(doc.totalPis)}|${formatNumSped(doc.totalCofins)}|3|06|${doc.chaveAcesso}|1|`
        );
        // Registro C590: Registro Analítico do Documento - Nota Fiscal / Conta de Energia Elétrica
        doc.itens.forEach(it => {
          linhas.push(
            `|C590|${it.impostos.icmsCst}|${it.cfop}|${formatNumSped(it.impostos.icmsAliquota)}|${formatNumSped(it.vProd)}|${formatNumSped(it.impostos.icmsBaseCalculo)}|${formatNumSped(it.impostos.icmsCalculado)}|0,00|0,00|0,00||`
          );
        });
      } else {
        // Registro C100: Nota Fiscal Eletrônica (Modelo 55)
        // |C100|IND_OPER|IND_EMIT|COD_PART|COD_MOD|COD_SIT|SER|NUM_DOC|CHV_NFE|DT_DOC|DT_E_S|VL_DOC|IND_PGTO|VL_DESC|VL_ABAT_NT|VL_MERC|IND_FRT|VL_FRT|VL_SEG|VL_OUT_DA|VL_BC_ICMS|VL_ICMS|VL_BC_ICMS_ST|VL_ICMS_ST|VL_IPI|VL_PIS|VL_COFINS|VL_PIS_ST|VL_COFINS_ST|
        linhas.push(
          `|C100|${indOper}|${indEmit}|${part?.cod || 'PART_1'}|55|00|${doc.serie}|${doc.numero}|${doc.chaveAcesso}|${formatDataSped(doc.dataEmissao)}|${formatDataSped(doc.dataEntradaSaida || doc.dataEmissao)}|${formatNumSped(doc.valorTotalDocumento)}|0|${formatNumSped(doc.valorDesconto)}|0,00|${formatNumSped(doc.valorProdutos)}|0|${formatNumSped(doc.valorFrete)}|${formatNumSped(doc.valorSeguro)}|${formatNumSped(doc.valorOutrasDespesas)}|${formatNumSped(doc.totalIcms > 0 ? doc.valorProdutos : 0)}|${formatNumSped(doc.totalIcms)}|${formatNumSped(doc.totalIcmsSt > 0 ? doc.valorProdutos : 0)}|${formatNumSped(doc.totalIcmsSt)}|${formatNumSped(doc.totalIpi)}|${formatNumSped(doc.totalPis)}|${formatNumSped(doc.totalCofins)}|0,00|0,00|`
        );

        // Itens: Registro C170
        doc.itens.forEach(it => {
          linhas.push(
            `|C170|${it.numeroItem}|${it.codigoProduto}|${it.descricao}|${it.qCom.toFixed(4).replace('.', ',')}|${it.uCom}|${formatNumSped(it.vProd)}|${formatNumSped(it.vDesc)}|0|${it.impostos.icmsCst}|${it.cfop}||${formatNumSped(it.impostos.icmsBaseCalculo)}|${formatNumSped(it.impostos.icmsAliquota)}|${formatNumSped(it.impostos.icmsCalculado)}|${formatNumSped(it.impostos.icmsStBaseCalculo)}|${formatNumSped(it.impostos.icmsStAliquota)}|${formatNumSped(it.impostos.icmsStCalculado)}|0|${it.impostos.ipiCst}||${formatNumSped(it.impostos.ipiBaseCalculo)}|${formatNumSped(it.impostos.ipiAliquota)}|${formatNumSped(it.impostos.ipiCalculado)}|${it.impostos.pisCst}|${formatNumSped(it.impostos.pisBaseCalculo)}|${formatNumSped(it.impostos.pisAliquota)}|${formatNumSped(it.impostos.pisCalculado)}|${it.impostos.cofinsCst}|${formatNumSped(it.impostos.cofinsBaseCalculo)}|${formatNumSped(it.impostos.cofinsAliquota)}|${formatNumSped(it.impostos.cofinsCalculado)}||`
          );
        });

        // Registro C190: Consolidação das Operações por CST/CFOP/Alíquota
        doc.itens.forEach(it => {
          linhas.push(
            `|C190|${it.impostos.icmsCst}|${it.cfop}|${formatNumSped(it.impostos.icmsAliquota)}|${formatNumSped(it.vProd)}|${formatNumSped(it.impostos.icmsBaseCalculo)}|${formatNumSped(it.impostos.icmsCalculado)}|${formatNumSped(it.impostos.icmsStBaseCalculo)}|${formatNumSped(it.impostos.icmsStCalculado)}|0,00|0,00|${formatNumSped(it.impostos.ipiCalculado)}||`
          );
        });
      }
    });

    const totalLinhasBlocoC = linhas.length - inicioBlocoC + 1;
    linhas.push(`|C990|${totalLinhasBlocoC}|`);

    // Bloco D: Documentos Fiscais II - Serviços de Transporte (CT-e Mod 57) e Comunicação (NFCom Mod 62)
    const inicioBlocoD = linhas.length;
    linhas.push(`|D001|${docsBlocoD.length > 0 ? '0' : '1'}|`);

    docsBlocoD.forEach(doc => {
      const part = partMap.get(doc.emitente.cnpjCpf);
      const indOper = doc.tipoOperacao === 'ENTRADA' ? '0' : '1';
      const indEmit = '0';

      if (doc.tipoDocumento === 'CTE') {
        // Registro D100: Conhecimento de Transporte Eletrônico (Modelo 57)
        // |D100|IND_OPER|IND_EMIT|COD_PART|COD_MOD|COD_SIT|SER|SUB|NUM_DOC|CHV_CTE|DT_DOC|DT_A_P|TP_CT-E|CHV_CTE_REF|VL_DOC|VL_DESC|IND_FRT|VL_SERV|VL_BC_ICMS|VL_ICMS|VL_NT|COD_INF|COD_CTA|COD_MUN_ORIG|COD_MUN_DEST|
        linhas.push(
          `|D100|${indOper}|${indEmit}|${part?.cod || 'PART_1'}|57|00|${doc.serie}||${doc.numero}|${doc.chaveAcesso}|${formatDataSped(doc.dataEmissao)}|${formatDataSped(doc.dataEntradaSaida || doc.dataEmissao)}|0||${formatNumSped(doc.valorTotalDocumento)}|0,00|${doc.dadosTransporteCTe?.tipoFrete === 'FOB' ? '1' : '0'}|${formatNumSped(doc.valorTotalDocumento)}|${formatNumSped(doc.totalIcms > 0 ? doc.valorTotalDocumento : 0)}|${formatNumSped(doc.totalIcms)}|0,00|||3536505|3304201|`
        );
        // Registro D190: Registro Analítico dos Documentos - CT-e
        doc.itens.forEach(it => {
          linhas.push(
            `|D190|${it.impostos.icmsCst}|${it.cfop}|${formatNumSped(it.impostos.icmsAliquota)}|${formatNumSped(it.vProd)}|${formatNumSped(it.impostos.icmsBaseCalculo)}|${formatNumSped(it.impostos.icmsCalculado)}|0,00||`
          );
        });
      } else if (doc.tipoDocumento === 'NFCOM') {
        // Registro D695: Nota Fiscal Fatura de Serviços de Comunicação Eletrônica (Modelo 62)
        // |D695|COD_MOD|SER|NRO_ORD_INI|NRO_ORD_FIN|DT_DOC_INI|DT_DOC_FIN|NOM_MEST|CHV_COD_DIG|
        linhas.push(
          `|D695|62|${doc.serie}|${doc.numero}|${doc.numero}|${formatDataSped(doc.dataEmissao)}|${formatDataSped(doc.dataEmissao)}||${doc.chaveAcesso}|`
        );
        // Registro D696: Registro Analítico da NFCom (Modelo 62)
        doc.itens.forEach(it => {
          linhas.push(
            `|D696|${it.impostos.icmsCst}|${it.cfop}|${formatNumSped(it.impostos.icmsAliquota)}|${formatNumSped(it.vProd)}|${formatNumSped(it.impostos.icmsBaseCalculo)}|${formatNumSped(it.impostos.icmsCalculado)}|0,00|0,00|0,00||`
          );
        });
      }
    });

    const totalLinhasBlocoD = linhas.length - inicioBlocoD + 1;
    linhas.push(`|D990|${totalLinhasBlocoD}|`);

    // Bloco 9: Controle e Encerramento
    const inicioBloco9 = linhas.length;
    linhas.push('|9001|0|');
    linhas.push(`|9900|0000|1|`);
    linhas.push(`|9900|0001|1|`);
    linhas.push(`|9900|C001|1|`);
    linhas.push(`|9900|C990|1|`);
    linhas.push(`|9900|D001|1|`);
    linhas.push(`|9900|D990|1|`);
    linhas.push(`|9900|9001|1|`);
    linhas.push(`|9900|9900|10|`);
    linhas.push(`|9900|9990|1|`);
    linhas.push(`|9900|9999|1|`);
    const totalLinhasBloco9 = linhas.length - inicioBloco9 + 2;
    linhas.push(`|9990|${totalLinhasBloco9}|`);
    linhas.push(`|9999|${linhas.length + 1}|`);

    return linhas.join('\r\n');
  }
}
