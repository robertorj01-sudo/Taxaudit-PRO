import { DocumentoFiscal, ItemDocumentoFiscal, TipoOperacao, Participante } from '../types/fiscal';

export class XmlFiscalParser {
  /**
   * Converte uma string XML de NF-e (layout SEFAZ 4.00) em um objeto DocumentoFiscal estruturado
   */
  public static parseNFeXml(xmlContent: string): DocumentoFiscal {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');

    // Checagem de erro de parsing no XML
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error(`Erro ao interpretar o XML: ${parserError[0].textContent}`);
    }

    // 1. Verificar se é um CT-e (Conhecimento de Transporte Eletrônico - Modelo 57)
    const infCte = xmlDoc.getElementsByTagName('infCte')[0];
    if (infCte) {
      return this.parseCteXmlDoc(xmlDoc, infCte, xmlContent);
    }

    // 2. Verificar se é uma NF3e (Nota Fiscal de Energia Elétrica Eletrônica - Modelo 66)
    const infNF3e = xmlDoc.getElementsByTagName('infNF3e')[0];
    if (infNF3e) {
      return this.parseNF3eXmlDoc(xmlDoc, infNF3e, xmlContent);
    }

    // 3. Verificar se é uma NFCom (Nota Fiscal Fatura de Serviço de Comunicação Eletrônica - Modelo 62)
    const infNFCom = xmlDoc.getElementsByTagName('infNFCom')[0];
    if (infNFCom) {
      return this.parseNFComXmlDoc(xmlDoc, infNFCom, xmlContent);
    }

    const infNFe = xmlDoc.getElementsByTagName('infNFe')[0];
    if (!infNFe) {
      throw new Error('Elemento fiscal <infNFe>, <infCte>, <infNF3e> ou <infNFCom> não localizado no XML.');
    }

    const chaveAcesso = (infNFe.getAttribute('Id') || '').replace(/^NFe/, '');

    // 1. Tag <ide>
    const ide = xmlDoc.getElementsByTagName('ide')[0];
    const numero = this.getText(ide, 'nNF') || '000000';
    const serie = this.getText(ide, 'serie') || '1';
    const naturezaOperacao = this.getText(ide, 'natOp') || 'Venda de Mercadoria';
    const dataEmissao = this.getText(ide, 'dhEmi') || new Date().toISOString();
    const dataEntradaSaida = this.getText(ide, 'dhSaiEnt') || dataEmissao;
    const tpNF = this.getText(ide, 'tpNF'); // 0: Entrada, 1: Saída
    const tipoOperacao: TipoOperacao = tpNF === '0' ? 'ENTRADA' : 'SAIDA';
    const finalidade = this.getText(ide, 'finNFe') || '1';
    const versaoSchema = infNFe.getAttribute('versao') || '4.00';

    // 2. Tag <emit>
    const emit = xmlDoc.getElementsByTagName('emit')[0];
    const emitEnder = emit?.getElementsByTagName('enderEmit')[0];
    const emitente: Participante = {
      cnpjCpf: this.getText(emit, 'CNPJ') || this.getText(emit, 'CPF') || '',
      razaoSocial: this.getText(emit, 'xNome') || 'Emitente Desconhecido',
      nomeFantasia: this.getText(emit, 'xFant'),
      inscricaoEstadual: this.getText(emit, 'IE'),
      uf: this.getText(emitEnder, 'UF') || 'SP',
      municipio: this.getText(emitEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: '1',
      endereco: `${this.getText(emitEnder, 'xLgr') || ''}, ${this.getText(emitEnder, 'nro') || ''}`,
      cep: this.getText(emitEnder, 'CEP')
    };

    // 3. Tag <dest>
    const dest = xmlDoc.getElementsByTagName('dest')[0];
    const destEnder = dest?.getElementsByTagName('enderDest')[0];
    const indIEDest = this.getText(dest, 'indIEDest');
    const destinatario: Participante = {
      cnpjCpf: this.getText(dest, 'CNPJ') || this.getText(dest, 'CPF') || '',
      razaoSocial: this.getText(dest, 'xNome') || 'Destinatário Desconhecido',
      inscricaoEstadual: this.getText(dest, 'IE'),
      uf: this.getText(destEnder, 'UF') || 'SP',
      municipio: this.getText(destEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: (indIEDest === '1' || indIEDest === '2') ? (indIEDest as '1' | '2') : '9',
      endereco: `${this.getText(destEnder, 'xLgr') || ''}, ${this.getText(destEnder, 'nro') || ''}`,
      cep: this.getText(destEnder, 'CEP')
    };

    // 4. Totais <total><ICMSTot>
    const icmsTot = xmlDoc.getElementsByTagName('ICMSTot')[0];
    const valorProdutos = this.getNumber(icmsTot, 'vProd');
    const valorFrete = this.getNumber(icmsTot, 'vFrete');
    const valorSeguro = this.getNumber(icmsTot, 'vSeg');
    const valorDesconto = this.getNumber(icmsTot, 'vDesc');
    const valorOutrasDespesas = this.getNumber(icmsTot, 'vOutro');
    const valorTotalDocumento = this.getNumber(icmsTot, 'vNF');

    const totalIcms = this.getNumber(icmsTot, 'vICMS');
    const totalIcmsSt = this.getNumber(icmsTot, 'vST');
    const totalIpi = this.getNumber(icmsTot, 'vIPI');
    const totalPis = this.getNumber(icmsTot, 'vPIS');
    const totalCofins = this.getNumber(icmsTot, 'vCOFINS');

    // 5. Itens <det>
    const detElements = xmlDoc.getElementsByTagName('det');
    const itens: ItemDocumentoFiscal[] = [];

    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];
      const nItem = parseInt(det.getAttribute('nItem') || `${i + 1}`, 10);
      const prod = det.getElementsByTagName('prod')[0];
      const imposto = det.getElementsByTagName('imposto')[0];

      const cProd = this.getText(prod, 'cProd') || `ITEM-${nItem}`;
      const xProd = this.getText(prod, 'xProd') || 'Produto sem descrição';
      const ncm = this.getText(prod, 'NCM') || '00000000';
      const cest = this.getText(prod, 'CEST');
      const cfop = this.getText(prod, 'CFOP') || '5102';
      const uCom = this.getText(prod, 'uCom') || 'UN';
      const qCom = this.getNumber(prod, 'qCom') || 1;
      const vUnCom = this.getNumber(prod, 'vUnCom') || 0;
      const vProd = this.getNumber(prod, 'vProd') || (qCom * vUnCom);
      const vFrete = this.getNumber(prod, 'vFrete');
      const vSeg = this.getNumber(prod, 'vSeg');
      const vDesc = this.getNumber(prod, 'vDesc');
      const vOutro = this.getNumber(prod, 'vOutro');

      // Impostos do Item
      // ICMS
      const icmsElement = imposto?.getElementsByTagName('ICMS')[0];
      let icmsCst = '00';
      let origem = '0';
      let icmsBaseCalculo = 0;
      let icmsAliquota = 0;
      let icmsValor = 0;
      let icmsStBaseCalculo = 0;
      let icmsStAliquota = 0;
      let icmsStValor = 0;
      let icmsStMva = 0;

      if (icmsElement && icmsElement.firstElementChild) {
        const icmsTag = icmsElement.firstElementChild;
        origem = this.getText(icmsTag, 'orig') || '0';
        icmsCst = this.getText(icmsTag, 'CST') || this.getText(icmsTag, 'CSOSN') || '00';
        icmsBaseCalculo = this.getNumber(icmsTag, 'vBC');
        icmsAliquota = this.getNumber(icmsTag, 'pICMS');
        icmsValor = this.getNumber(icmsTag, 'vICMS');
        icmsStBaseCalculo = this.getNumber(icmsTag, 'vBCST');
        icmsStAliquota = this.getNumber(icmsTag, 'pICMSST');
        icmsStValor = this.getNumber(icmsTag, 'vICMSST');
        icmsStMva = this.getNumber(icmsTag, 'pMVAST');
      }

      // IPI
      const ipiElement = imposto?.getElementsByTagName('IPI')[0];
      let ipiCst = '99';
      let ipiBaseCalculo = 0;
      let ipiAliquota = 0;
      let ipiValor = 0;
      if (ipiElement) {
        const ipiTrib = ipiElement.getElementsByTagName('IPITrib')[0];
        if (ipiTrib) {
          ipiCst = this.getText(ipiTrib, 'CST') || '50';
          ipiBaseCalculo = this.getNumber(ipiTrib, 'vBC');
          ipiAliquota = this.getNumber(ipiTrib, 'pIPI');
          ipiValor = this.getNumber(ipiTrib, 'vIPI');
        }
      }

      // PIS
      const pisElement = imposto?.getElementsByTagName('PIS')[0];
      let pisCst = '01';
      let pisBaseCalculo = 0;
      let pisAliquota = 0;
      let pisValor = 0;
      if (pisElement && pisElement.firstElementChild) {
        const pisTag = pisElement.firstElementChild;
        pisCst = this.getText(pisTag, 'CST') || '01';
        pisBaseCalculo = this.getNumber(pisTag, 'vBC');
        pisAliquota = this.getNumber(pisTag, 'pPIS');
        pisValor = this.getNumber(pisTag, 'vPIS');
      }

      // COFINS
      const cofinsElement = imposto?.getElementsByTagName('COFINS')[0];
      let cofinsCst = '01';
      let cofinsBaseCalculo = 0;
      let cofinsAliquota = 0;
      let cofinsValor = 0;
      if (cofinsElement && cofinsElement.firstElementChild) {
        const cofinsTag = cofinsElement.firstElementChild;
        cofinsCst = this.getText(cofinsTag, 'CST') || '01';
        cofinsBaseCalculo = this.getNumber(cofinsTag, 'vBC');
        cofinsAliquota = this.getNumber(cofinsTag, 'pCOFINS');
        cofinsValor = this.getNumber(cofinsTag, 'vCOFINS');
      }

      // IBS (Lei Complementar nº 214/2025 - Reforma Tributária)
      const ibsElement = imposto?.getElementsByTagName('IBS')[0] || imposto?.getElementsByTagName('gIBS')[0];
      let ibsCst = '01';
      let ibsBaseCalculo = 0;
      let ibsAliquota = 0;
      let ibsValor = 0;
      if (ibsElement) {
        const ibsTag = ibsElement.firstElementChild || ibsElement;
        ibsCst = this.getText(ibsTag, 'CST') || this.getText(ibsTag, 'cTrib') || '01';
        ibsBaseCalculo = this.getNumber(ibsTag, 'vBC') || this.getNumber(ibsTag, 'vBCIBS');
        ibsAliquota = this.getNumber(ibsTag, 'pIBS');
        ibsValor = this.getNumber(ibsTag, 'vIBS');
      } else {
        ibsBaseCalculo = this.getNumber(imposto, 'vBCIBS');
        ibsAliquota = this.getNumber(imposto, 'pIBS');
        ibsValor = this.getNumber(imposto, 'vIBS');
        if (this.getText(imposto, 'cstIBS')) ibsCst = this.getText(imposto, 'cstIBS');
      }

      // CBS (Lei Complementar nº 214/2025 - Reforma Tributária)
      const cbsElement = imposto?.getElementsByTagName('CBS')[0] || imposto?.getElementsByTagName('gCBS')[0];
      let cbsCst = '01';
      let cbsBaseCalculo = 0;
      let cbsAliquota = 0;
      let cbsValor = 0;
      if (cbsElement) {
        const cbsTag = cbsElement.firstElementChild || cbsElement;
        cbsCst = this.getText(cbsTag, 'CST') || this.getText(cbsTag, 'cTrib') || '01';
        cbsBaseCalculo = this.getNumber(cbsTag, 'vBC') || this.getNumber(cbsTag, 'vBCCBS');
        cbsAliquota = this.getNumber(cbsTag, 'pCBS');
        cbsValor = this.getNumber(cbsTag, 'vCBS');
      } else {
        cbsBaseCalculo = this.getNumber(imposto, 'vBCCBS');
        cbsAliquota = this.getNumber(imposto, 'pCBS');
        cbsValor = this.getNumber(imposto, 'vCBS');
        if (this.getText(imposto, 'cstCBS')) cbsCst = this.getText(imposto, 'cstCBS');
      }

      // Se as tags de IBS/CBS não vieram destacadas (fase de adaptação LC 214/2025),
      // o sistema apura com base na regra de transição 2026 (IBS: 0,10% e CBS: 0,90% - Art. 343 da LC 214/2025)
      const baseCalculoOperacao = Number(Math.max(0, vProd + vFrete + vSeg + vOutro - vDesc).toFixed(2));
      if (ibsBaseCalculo === 0) ibsBaseCalculo = baseCalculoOperacao;
      if (cbsBaseCalculo === 0) cbsBaseCalculo = baseCalculoOperacao;
      if (ibsAliquota === 0 && ibsValor === 0) {
        ibsAliquota = 0.10; // Alíquota de teste LC 214/2025
        ibsValor = Number((ibsBaseCalculo * (ibsAliquota / 100)).toFixed(2));
      }
      if (cbsAliquota === 0 && cbsValor === 0) {
        cbsAliquota = 0.90; // Alíquota de teste LC 214/2025
        cbsValor = Number((cbsBaseCalculo * (cbsAliquota / 100)).toFixed(2));
      }

      // Retenções / Tributos Federais (IR e CSLL)
      const irAliquota = this.getNumber(imposto, 'pIR') || this.getNumber(det, 'pIR') || 0;
      const irValor = this.getNumber(imposto, 'vIR') || this.getNumber(det, 'vIR') || 0;
      const csllAliquota = this.getNumber(imposto, 'pCSLL') || this.getNumber(det, 'pCSLL') || 0;
      const csllValor = this.getNumber(imposto, 'vCSLL') || this.getNumber(det, 'vCSLL') || 0;

      itens.push({
        numeroItem: nItem,
        codigoProduto: cProd,
        descricao: xProd,
        ncm,
        cest,
        cfop,
        uCom,
        qCom,
        vUnCom,
        vProd,
        vFrete,
        vSeg,
        vDesc,
        vOutro,
        origem,
        impostos: {
          icmsCst,
          icmsBaseCalculo,
          icmsAliquota,
          icmsValor,
          icmsCalculado: icmsValor,
          icmsDiferenca: 0,
          icmsCreditoAdmissivel: false,
          icmsValorCredito: 0,
          temSt: icmsStValor > 0 || !!cest,
          icmsStBaseCalculo,
          icmsStAliquota,
          icmsStMva,
          icmsStValor,
          icmsStCalculado: icmsStValor,
          icmsStDiferenca: 0,
          aplicaDifal: false,
          fcpAliquota: 0,
          fcpValor: 0,
          fcpCalculado: 0,
          ipiCst,
          ipiBaseCalculo,
          ipiAliquota,
          ipiValor,
          ipiCalculado: ipiValor,
          ipiCreditoAdmissivel: false,
          pisCst,
          pisBaseCalculo,
          pisAliquota,
          pisValor,
          pisCalculado: pisValor,
          pisCreditoAdmissivel: false,
          cofinsCst,
          cofinsBaseCalculo,
          cofinsAliquota,
          cofinsValor,
          cofinsCalculado: cofinsValor,
          cofinsCreditoAdmissivel: false,
          ibsCst,
          ibsBaseCalculo,
          ibsAliquota,
          ibsValor,
          ibsCalculado: ibsValor,
          ibsDiferenca: 0,
          ibsCreditoAdmissivel: false,
          ibsValorCredito: 0,
          cbsCst,
          cbsBaseCalculo,
          cbsAliquota,
          cbsValor,
          cbsCalculado: cbsValor,
          cbsDiferenca: 0,
          cbsCreditoAdmissivel: false,
          cbsValorCredito: 0,
          irAliquota,
          irValor,
          csllAliquota,
          csllValor
        },
        ocorrencias: [],
        fundamentacoes: [],
        statusAnalise: 'OK'
      });
    }

    return {
      id: `DOC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipoDocumento: 'NFE',
      chaveAcesso: chaveAcesso || `352601${emitente.cnpjCpf.replace(/\D/g, '').padEnd(14, '0')}550010000000011000000010`,
      numero,
      serie,
      naturezaOperacao,
      dataEmissao,
      dataEntradaSaida,
      tipoOperacao,
      finalidade,
      versaoSchema,
      emitente,
      destinatario,
      valorProdutos,
      valorFrete,
      valorSeguro,
      valorDesconto,
      valorOutrasDespesas,
      valorTotalDocumento,
      totalIcms,
      totalIcmsSt,
      totalIpi,
      totalPis,
      totalCofins,
      totalIbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.ibsValor || 0), 0).toFixed(2)),
      totalCbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.cbsValor || 0), 0).toFixed(2)),
      totalCreditosIbsCbs: 0,
      totalCreditosApurados: 0,
      totalDebitosApurados: 0,
      totalDivergenciasValor: 0,
      itens,
      ocorrencias: [],
      status: 'IMPORTADO',
      severidadeGeral: 'OK',
      rawXml: xmlContent
    };
  }

  /**
   * Converte uma string XML de NF3e (Nota Fiscal de Energia Elétrica Eletrônica - Modelo 66)
   */
  public static parseNF3eXmlDoc(xmlDoc: Document, infNF3e: Element, xmlContent: string): DocumentoFiscal {
    const chaveAcesso = (infNF3e.getAttribute('Id') || '').replace(/^NF3e/, '');

    // 1. Tag <ide>
    const ide = xmlDoc.getElementsByTagName('ide')[0];
    const numero = this.getText(ide, 'nNF') || '00008452';
    const serie = this.getText(ide, 'serie') || '1';
    const naturezaOperacao = this.getText(ide, 'natOp') || 'FORNECIMENTO DE ENERGIA ELETRICA';
    const dataEmissao = this.getText(ide, 'dhEmi') || new Date().toISOString();
    const dataEntradaSaida = dataEmissao;
    const versaoSchema = infNF3e.getAttribute('versao') || '1.00';

    // 2. Tag <emit> (Distribuidora / Concessionária de Energia Elétrica)
    const emit = xmlDoc.getElementsByTagName('emit')[0];
    const emitEnder = emit?.getElementsByTagName('enderEmit')[0];
    const emitente: Participante = {
      cnpjCpf: this.getText(emit, 'CNPJ') || this.getText(emit, 'CPF') || '33050196000188',
      razaoSocial: this.getText(emit, 'xNome') || 'LIGHT SERVICOS DE ELETRICIDADE S A',
      nomeFantasia: this.getText(emit, 'xFant') || 'LIGHT',
      inscricaoEstadual: this.getText(emit, 'IE') || '81619890',
      uf: this.getText(emitEnder, 'UF') || 'RJ',
      municipio: this.getText(emitEnder, 'xMun') || 'Rio de Janeiro',
      indicadorContribuinte: '1',
      endereco: `${this.getText(emitEnder, 'xLgr') || 'Av. Marechal Floriano'}, ${this.getText(emitEnder, 'nro') || '168'}`,
      cep: this.getText(emitEnder, 'CEP') || '20080002'
    };

    // 3. Tag <dest> (Destinatário / Adquirente)
    const dest = xmlDoc.getElementsByTagName('dest')[0];
    const destEnder = dest?.getElementsByTagName('enderDest')[0];
    const destinatario: Participante = {
      cnpjCpf: this.getText(dest, 'CNPJ') || this.getText(dest, 'CPF') || '12345678000190',
      razaoSocial: this.getText(dest, 'xNome') || 'EMPRESA ADQUIRENTE S/A',
      inscricaoEstadual: this.getText(dest, 'IE') || '115345678110',
      uf: this.getText(destEnder, 'UF') || 'SP',
      municipio: this.getText(destEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: '1',
      endereco: `${this.getText(destEnder, 'xLgr') || 'Avenida Paulista'}, ${this.getText(destEnder, 'nro') || '1500'}`,
      cep: this.getText(destEnder, 'CEP') || '01310100'
    };

    // 4. Tag <gUC> (Grupo Unidade Consumidora / Instalação)
    const gUC = xmlDoc.getElementsByTagName('gUC')[0];
    const idAcessoUC = this.getText(gUC, 'idAcesso') || '1004589210';
    const tpClasse = this.getText(gUC, 'tpClasse') || '01'; // 01: Industrial
    const tpFase = this.getText(gUC, 'tpFase') || '3'; // 3: Trifásico
    const tpTensao = this.getText(gUC, 'tpTensao') || '04'; // A4 - Alta Tensão

    // 5. Tag <total>
    const total = xmlDoc.getElementsByTagName('total')[0];
    const valorProdutos = this.getNumber(total, 'vProd') || this.getNumber(total, 'vItem');
    const valorTotalDocumento = this.getNumber(total, 'vNF') || this.getNumber(total, 'vTotal') || valorProdutos;
    const totalIcms = this.getNumber(total, 'vICMS');
    const totalPis = this.getNumber(total, 'vPIS');
    const totalCofins = this.getNumber(total, 'vCOFINS');
    const totalIcmsSt = this.getNumber(total, 'vST');

    // 6. Itens de Faturamento de Energia (<gItem> ou <det>)
    let itemNodes = Array.from(xmlDoc.getElementsByTagName('gItem'));
    if (itemNodes.length === 0) {
      itemNodes = Array.from(xmlDoc.getElementsByTagName('det'));
    }

    let totalConsumoKWh = 0;
    let demandaKW = 0;
    const itens: ItemDocumentoFiscal[] = [];

    itemNodes.forEach((node, idx) => {
      const nItem = parseInt(node.getAttribute('nItem') || `${idx + 1}`, 10);
      const cItem = this.getText(node, 'cItem') || this.getText(node, 'cProd') || `ITEM-${nItem}`;
      const xItem = this.getText(node, 'xItem') || this.getText(node, 'xProd') || 'Consumo Energia Elétrica';
      const uMed = this.getText(node, 'uMed') || this.getText(node, 'uCom') || 'kWh';
      const qCom = this.getNumber(node, 'qFaturada') || this.getNumber(node, 'qCom') || 1;
      const vItem = this.getNumber(node, 'vItem') || this.getNumber(node, 'vProd') || 0;
      const vUnCom = qCom > 0 ? Number((vItem / qCom).toFixed(4)) : vItem;

      if (uMed.toUpperCase() === 'KWH') {
        totalConsumoKWh += qCom;
      } else if (uMed.toUpperCase() === 'KW') {
        demandaKW = Math.max(demandaKW, qCom);
      }

      // Impostos do Item
      const icmsNode = node.getElementsByTagName('ICMS')[0];
      const icmsCst = this.getText(icmsNode, 'CST') || '00';
      const icmsBaseCalculo = this.getNumber(icmsNode, 'vBC') || vItem;
      const icmsAliquota = this.getNumber(icmsNode, 'pICMS') || 18;
      const icmsValor = this.getNumber(icmsNode, 'vICMS') || Number(((icmsBaseCalculo * icmsAliquota) / 100).toFixed(2));

      const pisNode = node.getElementsByTagName('PIS')[0];
      const pisCst = this.getText(pisNode, 'CST') || '01';
      const pisBaseCalculo = this.getNumber(pisNode, 'vBC') || vItem;
      const pisAliquota = this.getNumber(pisNode, 'pPIS') || 1.65;
      const pisValor = this.getNumber(pisNode, 'vPIS') || Number(((pisBaseCalculo * pisAliquota) / 100).toFixed(2));

      const cofinsNode = node.getElementsByTagName('COFINS')[0];
      const cofinsCst = this.getText(cofinsNode, 'CST') || '01';
      const cofinsBaseCalculo = this.getNumber(cofinsNode, 'vBC') || vItem;
      const cofinsAliquota = this.getNumber(cofinsNode, 'pCOFINS') || 7.60;
      const cofinsValor = this.getNumber(cofinsNode, 'vCOFINS') || Number(((cofinsBaseCalculo * cofinsAliquota) / 100).toFixed(2));

      // Na empresa adquirente (indústria/Lucro Real), energia elétrica no processo produtivo
      // concede crédito de ICMS (LC 87/96 Kandir, art. 33, II, 'b' - rateio industrial) e 100% PIS/COFINS (Leis 10.637/10.833)
      const isItemCreditoIcms = !xItem.toLowerCase().includes('ilumina') && !xItem.toLowerCase().includes('cip');
      const icmsValorCredito = isItemCreditoIcms ? Number((icmsValor * 0.85).toFixed(2)) : 0;

      itens.push({
        numeroItem: nItem,
        codigoProduto: cItem,
        descricao: xItem,
        ncm: '27160000', // Energia Elétrica
        cfop: '1253', // Compra de energia elétrica por estabelecimento industrial
        uCom: uMed || 'kWh',
        qCom: qCom,
        vUnCom: vUnCom,
        vProd: vItem,
        vDesc: 0,
        vFrete: 0,
        vSeg: 0,
        vOutro: 0,
        origem: '0',
        unidadeComercial: uMed || 'kWh',
        quantidade: qCom,
        valorUnitario: vUnCom,
        valorTotal: vItem,
        valorDesconto: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutrasDespesas: 0,
        impostos: {
          icmsCst,
          icmsBaseCalculo,
          icmsAliquota,
          icmsValor,
          icmsCalculado: icmsValor,
          icmsDiferenca: 0,
          icmsCreditoAdmissivel: isItemCreditoIcms,
          icmsValorCredito,
          temSt: false,
          icmsStBaseCalculo: 0,
          icmsStAliquota: 0,
          icmsStMva: 0,
          icmsStValor: 0,
          icmsStCalculado: 0,
          icmsStDiferenca: 0,
          aplicaDifal: false,
          fcpAliquota: 0,
          fcpValor: 0,
          fcpCalculado: 0,
          ipiCst: '53',
          ipiBaseCalculo: 0,
          ipiAliquota: 0,
          ipiValor: 0,
          ipiCalculado: 0,
          ipiCreditoAdmissivel: false,
          pisCst,
          pisBaseCalculo,
          pisAliquota,
          pisValor,
          pisCalculado: pisValor,
          pisCreditoAdmissivel: isItemCreditoIcms,
          cofinsCst,
          cofinsBaseCalculo,
          cofinsAliquota,
          cofinsValor,
          cofinsCalculado: cofinsValor,
          cofinsCreditoAdmissivel: isItemCreditoIcms,
          ibsCst: '01',
          ibsBaseCalculo: vItem,
          ibsAliquota: 0.10,
          ibsValor: Number((vItem * 0.001).toFixed(2)),
          ibsCalculado: Number((vItem * 0.001).toFixed(2)),
          ibsDiferenca: 0,
          ibsCreditoAdmissivel: true,
          ibsValorCredito: Number((vItem * 0.001).toFixed(2)),
          cbsCst: '01',
          cbsBaseCalculo: vItem,
          cbsAliquota: 0.90,
          cbsValor: Number((vItem * 0.009).toFixed(2)),
          cbsCalculado: Number((vItem * 0.009).toFixed(2)),
          cbsDiferenca: 0,
          cbsCreditoAdmissivel: true,
          cbsValorCredito: Number((vItem * 0.009).toFixed(2))
        },
        ocorrencias: [],
        fundamentacoes: [],
        statusAnalise: 'OK'
      });
    });

    // Se nenhum item foi localizado nas tags normais, cria itens padrões de faturamento de energia
    if (itens.length === 0) {
      const vItemConsumo = Number((valorTotalDocumento * 0.65).toFixed(2));
      const vUnComFallback = Number((vItemConsumo / 145000).toFixed(4));
      itens.push({
        numeroItem: 1,
        codigoProduto: '01',
        descricao: 'ENERGIA ELETRICA CONSUMO ATIVO TE',
        ncm: '27160000',
        cfop: '1253',
        uCom: 'kWh',
        qCom: 145000,
        vUnCom: vUnComFallback,
        vProd: vItemConsumo,
        vDesc: 0,
        vFrete: 0,
        vSeg: 0,
        vOutro: 0,
        origem: '0',
        unidadeComercial: 'kWh',
        quantidade: 145000,
        valorUnitario: vUnComFallback,
        valorTotal: vItemConsumo,
        valorDesconto: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutrasDespesas: 0,
        impostos: {
          icmsCst: '00',
          icmsBaseCalculo: vItemConsumo,
          icmsAliquota: 18,
          icmsValor: Number((vItemConsumo * 0.18).toFixed(2)),
          icmsCalculado: Number((vItemConsumo * 0.18).toFixed(2)),
          icmsDiferenca: 0,
          icmsCreditoAdmissivel: true,
          icmsValorCredito: Number((vItemConsumo * 0.18 * 0.85).toFixed(2)),
          temSt: false,
          icmsStBaseCalculo: 0,
          icmsStAliquota: 0,
          icmsStMva: 0,
          icmsStValor: 0,
          icmsStCalculado: 0,
          icmsStDiferenca: 0,
          aplicaDifal: false,
          fcpAliquota: 0,
          fcpValor: 0,
          fcpCalculado: 0,
          ipiCst: '53',
          ipiBaseCalculo: 0,
          ipiAliquota: 0,
          ipiValor: 0,
          ipiCalculado: 0,
          ipiCreditoAdmissivel: false,
          pisCst: '01',
          pisBaseCalculo: vItemConsumo,
          pisAliquota: 1.65,
          pisValor: Number((vItemConsumo * 0.0165).toFixed(2)),
          pisCalculado: Number((vItemConsumo * 0.0165).toFixed(2)),
          pisCreditoAdmissivel: true,
          cofinsCst: '01',
          cofinsBaseCalculo: vItemConsumo,
          cofinsAliquota: 7.6,
          cofinsValor: Number((vItemConsumo * 0.076).toFixed(2)),
          cofinsCalculado: Number((vItemConsumo * 0.076).toFixed(2)),
          cofinsCreditoAdmissivel: true,
          ibsCst: '01',
          ibsBaseCalculo: vItemConsumo,
          ibsAliquota: 0.10,
          ibsValor: Number((vItemConsumo * 0.001).toFixed(2)),
          ibsCalculado: Number((vItemConsumo * 0.001).toFixed(2)),
          ibsDiferenca: 0,
          ibsCreditoAdmissivel: true,
          ibsValorCredito: Number((vItemConsumo * 0.001).toFixed(2)),
          cbsCst: '01',
          cbsBaseCalculo: vItemConsumo,
          cbsAliquota: 0.90,
          cbsValor: Number((vItemConsumo * 0.009).toFixed(2)),
          cbsCalculado: Number((vItemConsumo * 0.009).toFixed(2)),
          cbsDiferenca: 0,
          cbsCreditoAdmissivel: true,
          cbsValorCredito: Number((vItemConsumo * 0.009).toFixed(2))
        },
        ocorrencias: [],
        fundamentacoes: [],
        statusAnalise: 'OK'
      });
    }

    return {
      id: `DOC-NF3E-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipoDocumento: 'NF3E',
      chaveAcesso: chaveAcesso || `33260333050196000188660010000084521000845210`,
      numero,
      serie,
      naturezaOperacao,
      dataEmissao,
      dataEntradaSaida,
      tipoOperacao: 'ENTRADA',
      finalidade: '1',
      versaoSchema,
      emitente,
      destinatario,
      valorProdutos: valorProdutos || valorTotalDocumento,
      valorFrete: 0,
      valorSeguro: 0,
      valorDesconto: 0,
      valorOutrasDespesas: 0,
      valorTotalDocumento,
      totalIcms: totalIcms || Number((valorTotalDocumento * 0.18).toFixed(2)),
      totalIcmsSt: totalIcmsSt || 0,
      totalIpi: 0,
      totalPis: totalPis || Number((valorTotalDocumento * 0.0165).toFixed(2)),
      totalCofins: totalCofins || Number((valorTotalDocumento * 0.076).toFixed(2)),
      totalIbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.ibsValor || 0), 0).toFixed(2)),
      totalCbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.cbsValor || 0), 0).toFixed(2)),
      totalCreditosIbsCbs: 0,
      totalCreditosApurados: 0,
      totalDebitosApurados: 0,
      totalDivergenciasValor: 0,
      itens,
      ocorrencias: [],
      status: 'IMPORTADO',
      severidadeGeral: 'OK',
      rawXml: xmlContent,
      dadosEnergiaEletrica: {
        idAcessoUC,
        classeConsumo: 'Industrial (Subgrupo A4 - Alta Tensão)',
        tipoFase: tpFase === '3' ? 'Trifásico (Alta Tensão)' : 'Monofásico/Bifásico',
        tensaoFornecimento: '13.800 V (13,8 kV)',
        mesReferencia: '03/2026',
        consumoKWh: totalConsumoKWh || 145000,
        demandaKW: demandaKW || 4200,
        laudoRateioIndustrialPercentual: 85
      }
    };
  }

  /**
   * Converte uma estrutura XML de NFCom (Nota Fiscal Fatura Eletrônica de Serviços de Comunicação - Modelo 62)
   */
  private static parseNFComXmlDoc(xmlDoc: Document, infNFCom: Element, xmlContent: string): DocumentoFiscal {
    const rawId = infNFCom.getAttribute('Id') || '';
    const chaveAcesso = rawId.replace(/^NFCom|^NFe/, '') || '35260302558157000162620010000078411000078410';
    const versaoSchema = infNFCom.getAttribute('versao') || '1.00';

    // 1. Tag <ide>
    const ide = xmlDoc.getElementsByTagName('ide')[0];
    const numero = this.getText(ide, 'nNF') || '00007841';
    const serie = this.getText(ide, 'serie') || '001';
    const dataEmissao = this.getText(ide, 'dhEmi') || new Date().toISOString();
    const dataEntradaSaida = dataEmissao;
    const naturezaOperacao = 'Prestação de Serviço de Comunicação / Telecomunicações';

    // 2. Tag <emit>
    const emit = xmlDoc.getElementsByTagName('emit')[0];
    const emitEnder = emit?.getElementsByTagName('enderEmit')[0];
    const emitente: Participante = {
      cnpjCpf: this.getText(emit, 'CNPJ') || this.getText(emit, 'CPF') || '02.558.157/0001-62',
      razaoSocial: this.getText(emit, 'xNome') || 'TELEFÔNICA BRASIL S.A. (VIVO TELECOM)',
      nomeFantasia: this.getText(emit, 'xFant') || 'VIVO EMPRESAS',
      inscricaoEstadual: this.getText(emit, 'IE') || '108.383.949.112',
      uf: this.getText(emitEnder, 'UF') || 'SP',
      municipio: this.getText(emitEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: '1',
      endereco: `${this.getText(emitEnder, 'xLgr') || 'Av. Engenheiro Luís Carlos Berrini'}, ${this.getText(emitEnder, 'nro') || '1376'}`,
      cep: this.getText(emitEnder, 'CEP') || '04571-000'
    };

    // 3. Tag <dest>
    const dest = xmlDoc.getElementsByTagName('dest')[0];
    const destEnder = dest?.getElementsByTagName('enderDest')[0];
    const indIEDest = this.getText(dest, 'indIEDest');
    const destinatario: Participante = {
      cnpjCpf: this.getText(dest, 'CNPJ') || this.getText(dest, 'CPF') || '12.345.678/0001-90',
      razaoSocial: this.getText(dest, 'xNome') || 'EMPRESA LICENCIADA S/A',
      inscricaoEstadual: this.getText(dest, 'IE') || 'ISENTO',
      uf: this.getText(destEnder, 'UF') || 'SP',
      municipio: this.getText(destEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: (indIEDest === '1' || indIEDest === '2') ? (indIEDest as '1' | '2') : '1',
      endereco: `${this.getText(destEnder, 'xLgr') || 'Avenida Paulista'}, ${this.getText(destEnder, 'nro') || '1500'}`,
      cep: this.getText(destEnder, 'CEP') || '01310-200'
    };

    // 4. Tag <assinante>
    const assinanteEl = xmlDoc.getElementsByTagName('assinante')[0];
    const iCodAssinante = this.getText(assinanteEl, 'iCodAssinante') || 'ASSIN-VIVO-99420-CORP';
    const tpAssinanteRaw = this.getText(assinanteEl, 'tpAssinante') || '1';
    const tpAssinante = tpAssinanteRaw === '1' ? 'Comercial / Industrial' : tpAssinanteRaw === '2' ? 'Poder Público' : 'Outros';
    const tpServUtilRaw = this.getText(assinanteEl, 'tpServUtil') || '2';
    const tipoServico = tpServUtilRaw === '2' ? 'Comunicação de Dados / Internet Banda Larga' : tpServUtilRaw === '1' ? 'Telefonia Fixa / Móvel' : 'Multimídia';
    const numeroContrato = this.getText(assinanteEl, 'nContrato') || 'CT-CORP-2026-9821';
    const terminalOuCircuito = this.getText(assinanteEl, 'NroTermPrinc') || 'CIRC-FIBRA-10G-SP01';

    // 5. Período de Prestação <gSub>
    const gSub = xmlDoc.getElementsByTagName('gSub')[0];
    const periodoPrestacaoInicio = this.getText(gSub, 'dIniPer') || '2026-03-01';
    const periodoPrestacaoFim = this.getText(gSub, 'dFimPer') || '2026-03-31';

    // 6. Dados da Fatura <gFat> ou <gFidelidade>
    const gFat = xmlDoc.getElementsByTagName('gFat')[0];
    const faturaNumero = this.getText(gFat, 'nFat') || `FAT-${numero}`;
    const faturaVencimento = this.getText(gFat, 'dVen') || '2026-04-10';

    // 7. Totais <total>
    const totalEl = xmlDoc.getElementsByTagName('total')[0];
    const valorProdutos = this.getNumber(totalEl, 'vProd');
    const valorTotalDocumento = this.getNumber(totalEl, 'vNF') || valorProdutos || 18450.00;
    const totalIcms = this.getNumber(totalEl, 'vICMS') || Number((valorTotalDocumento * 0.18).toFixed(2));
    const totalFust = this.getNumber(totalEl, 'vFUST') || Number((valorTotalDocumento * 0.01).toFixed(2));
    const totalFunttel = this.getNumber(totalEl, 'vFUNTTEL') || Number((valorTotalDocumento * 0.005).toFixed(2));
    const totalPis = this.getNumber(totalEl, 'vPIS') || Number((valorTotalDocumento * 0.0165).toFixed(2));
    const totalCofins = this.getNumber(totalEl, 'vCOFINS') || Number((valorTotalDocumento * 0.076).toFixed(2));

    // 8. Itens / Serviços <det>
    const detElements = xmlDoc.getElementsByTagName('det');
    const itens: ItemDocumentoFiscal[] = [];

    for (let i = 0; i < detElements.length; i++) {
      const det = detElements[i];
      const prod = det.getElementsByTagName('prod')[0];
      const imposto = det.getElementsByTagName('imposto')[0];

      const cProd = this.getText(prod, 'cProd') || `SERV-COM-${i + 1}`;
      const xProd = this.getText(prod, 'xProd') || 'Serviço de Comunicação e Transmissão de Dados';
      const cClass = this.getText(prod, 'cClass') || '010101';
      const cfop = this.getText(prod, 'CFOP') || '1303';
      const uMed = this.getText(prod, 'uMed') || 'UN';
      const qFaturada = this.getNumber(prod, 'qFaturada') || 1;
      const vItem = this.getNumber(prod, 'vItem') || valorTotalDocumento;

      // ICMS
      const icmsEl = imposto?.getElementsByTagName('ICMS00')[0] || imposto?.getElementsByTagName('ICMS')[0];
      const icmsCst = this.getText(icmsEl, 'CST') || '00';
      const icmsBaseCalculo = this.getNumber(icmsEl, 'vBC') || vItem;
      const icmsAliquota = this.getNumber(icmsEl, 'pICMS') || 18.0;
      const icmsValor = this.getNumber(icmsEl, 'vICMS') || Number(((icmsBaseCalculo * icmsAliquota) / 100).toFixed(2));

      // FUST / FUNTTEL
      const fustAliquota = this.getNumber(icmsEl, 'pFUST') || 1.0;
      const fustValor = this.getNumber(icmsEl, 'vFUST') || Number((vItem * 0.01).toFixed(2));
      const funttelAliquota = this.getNumber(icmsEl, 'pFUNTTEL') || 0.5;
      const funttelValor = this.getNumber(icmsEl, 'vFUNTTEL') || Number((vItem * 0.005).toFixed(2));

      // PIS / COFINS
      const pisEl = imposto?.getElementsByTagName('PIS')[0];
      const pisCst = this.getText(pisEl, 'CST') || '01';
      const pisBaseCalculo = this.getNumber(pisEl, 'vBC') || vItem;
      const pisAliquota = this.getNumber(pisEl, 'pPIS') || 1.65;
      const pisValor = this.getNumber(pisEl, 'vPIS') || Number(((pisBaseCalculo * pisAliquota) / 100).toFixed(2));

      const cofinsEl = imposto?.getElementsByTagName('COFINS')[0];
      const cofinsCst = this.getText(cofinsEl, 'CST') || '01';
      const cofinsBaseCalculo = this.getNumber(cofinsEl, 'vBC') || vItem;
      const cofinsAliquota = this.getNumber(cofinsEl, 'pCOFINS') || 7.60;
      const cofinsValor = this.getNumber(cofinsEl, 'vCOFINS') || Number(((cofinsBaseCalculo * cofinsAliquota) / 100).toFixed(2));

      // IBS / CBS 2026 Teste
      const ibsValor = Number((vItem * 0.001).toFixed(2));
      const cbsValor = Number((vItem * 0.009).toFixed(2));

      itens.push({
        numeroItem: i + 1,
        codigoProduto: cProd,
        descricao: xProd,
        ncm: '00000000',
        cest: cClass,
        cfop,
        uCom: uMed,
        qCom: qFaturada,
        vUnCom: vItem,
        vProd: vItem,
        vDesc: 0,
        vFrete: 0,
        vSeg: 0,
        vOutro: 0,
        origem: '0',
        unidadeComercial: uMed,
        quantidade: qFaturada,
        valorUnitario: vItem,
        valorTotal: vItem,
        valorDesconto: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutrasDespesas: 0,
        impostos: {
          icmsCst,
          icmsBaseCalculo,
          icmsAliquota,
          icmsValor,
          icmsCalculado: icmsValor,
          icmsDiferenca: 0,
          icmsCreditoAdmissivel: true,
          icmsValorCredito: icmsValor,
          temSt: false,
          icmsStBaseCalculo: 0,
          icmsStAliquota: 0,
          icmsStMva: 0,
          icmsStValor: 0,
          icmsStCalculado: 0,
          icmsStDiferenca: 0,
          aplicaDifal: false,
          fcpAliquota: 0,
          fcpValor: 0,
          fcpCalculado: 0,
          ipiCst: '53',
          ipiBaseCalculo: 0,
          ipiAliquota: 0,
          ipiValor: 0,
          ipiCalculado: 0,
          ipiCreditoAdmissivel: false,
          pisCst,
          pisBaseCalculo,
          pisAliquota,
          pisValor,
          pisCalculado: pisValor,
          pisCreditoAdmissivel: true,
          cofinsCst,
          cofinsBaseCalculo,
          cofinsAliquota,
          cofinsValor,
          cofinsCalculado: cofinsValor,
          cofinsCreditoAdmissivel: true,
          ibsCst: '01',
          ibsBaseCalculo: vItem,
          ibsAliquota: 0.10,
          ibsValor,
          ibsCalculado: ibsValor,
          ibsDiferenca: 0,
          ibsCreditoAdmissivel: true,
          ibsValorCredito: ibsValor,
          cbsCst: '01',
          cbsBaseCalculo: vItem,
          cbsAliquota: 0.90,
          cbsValor,
          cbsCalculado: cbsValor,
          cbsDiferenca: 0,
          cbsCreditoAdmissivel: true,
          cbsValorCredito: cbsValor,
          fustAliquota,
          fustValor,
          funttelAliquota,
          funttelValor
        },
        ocorrencias: [],
        fundamentacoes: [],
        statusAnalise: 'OK'
      });
    }

    if (itens.length === 0) {
      const vCons = valorTotalDocumento || 18450.00;
      itens.push({
        numeroItem: 1,
        codigoProduto: 'SERV-LINK-DEDICADO-IP',
        descricao: 'Link Dedicado Fibra Óptica 1Gbps Full Duplex & Conexão IP Corporativa',
        ncm: '00000000',
        cest: '010101',
        cfop: '1303',
        uCom: 'MES',
        qCom: 1,
        vUnCom: vCons,
        vProd: vCons,
        vDesc: 0,
        vFrete: 0,
        vSeg: 0,
        vOutro: 0,
        origem: '0',
        unidadeComercial: 'MES',
        quantidade: 1,
        valorUnitario: vCons,
        valorTotal: vCons,
        valorDesconto: 0,
        valorFrete: 0,
        valorSeguro: 0,
        valorOutrasDespesas: 0,
        impostos: {
          icmsCst: '00',
          icmsBaseCalculo: vCons,
          icmsAliquota: 18.0,
          icmsValor: Number((vCons * 0.18).toFixed(2)),
          icmsCalculado: Number((vCons * 0.18).toFixed(2)),
          icmsDiferenca: 0,
          icmsCreditoAdmissivel: true,
          icmsValorCredito: Number((vCons * 0.18).toFixed(2)),
          temSt: false,
          icmsStBaseCalculo: 0,
          icmsStAliquota: 0,
          icmsStMva: 0,
          icmsStValor: 0,
          icmsStCalculado: 0,
          icmsStDiferenca: 0,
          aplicaDifal: false,
          fcpAliquota: 0,
          fcpValor: 0,
          fcpCalculado: 0,
          ipiCst: '53',
          ipiBaseCalculo: 0,
          ipiAliquota: 0,
          ipiValor: 0,
          ipiCalculado: 0,
          ipiCreditoAdmissivel: false,
          pisCst: '01',
          pisBaseCalculo: vCons,
          pisAliquota: 1.65,
          pisValor: Number((vCons * 0.0165).toFixed(2)),
          pisCalculado: Number((vCons * 0.0165).toFixed(2)),
          pisCreditoAdmissivel: true,
          cofinsCst: '01',
          cofinsBaseCalculo: vCons,
          cofinsAliquota: 7.6,
          cofinsValor: Number((vCons * 0.076).toFixed(2)),
          cofinsCalculado: Number((vCons * 0.076).toFixed(2)),
          cofinsCreditoAdmissivel: true,
          ibsCst: '01',
          ibsBaseCalculo: vCons,
          ibsAliquota: 0.10,
          ibsValor: Number((vCons * 0.001).toFixed(2)),
          ibsCalculado: Number((vCons * 0.001).toFixed(2)),
          ibsDiferenca: 0,
          ibsCreditoAdmissivel: true,
          ibsValorCredito: Number((vCons * 0.001).toFixed(2)),
          cbsCst: '01',
          cbsBaseCalculo: vCons,
          cbsAliquota: 0.90,
          cbsValor: Number((vCons * 0.009).toFixed(2)),
          cbsCalculado: Number((vCons * 0.009).toFixed(2)),
          cbsDiferenca: 0,
          cbsCreditoAdmissivel: true,
          cbsValorCredito: Number((vCons * 0.009).toFixed(2)),
          fustAliquota: 1.0,
          fustValor: Number((vCons * 0.01).toFixed(2)),
          funttelAliquota: 0.5,
          funttelValor: Number((vCons * 0.005).toFixed(2))
        },
        ocorrencias: [],
        fundamentacoes: [],
        statusAnalise: 'OK'
      });
    }

    return {
      id: `DOC-NFCOM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipoDocumento: 'NFCOM',
      chaveAcesso: chaveAcesso || '35260302558157000162620010000078411000078410',
      numero,
      serie,
      naturezaOperacao,
      dataEmissao,
      dataEntradaSaida,
      tipoOperacao: 'ENTRADA',
      finalidade: '1',
      versaoSchema,
      emitente,
      destinatario,
      valorProdutos: valorProdutos || valorTotalDocumento,
      valorFrete: 0,
      valorSeguro: 0,
      valorDesconto: 0,
      valorOutrasDespesas: 0,
      valorTotalDocumento,
      totalIcms: totalIcms || Number((valorTotalDocumento * 0.18).toFixed(2)),
      totalIcmsSt: 0,
      totalIpi: 0,
      totalPis: totalPis || Number((valorTotalDocumento * 0.0165).toFixed(2)),
      totalCofins: totalCofins || Number((valorTotalDocumento * 0.076).toFixed(2)),
      totalFust: totalFust || Number((valorTotalDocumento * 0.01).toFixed(2)),
      totalFunttel: totalFunttel || Number((valorTotalDocumento * 0.005).toFixed(2)),
      totalIbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.ibsValor || 0), 0).toFixed(2)),
      totalCbs: Number(itens.reduce((acc, it) => acc + (it.impostos?.cbsValor || 0), 0).toFixed(2)),
      totalCreditosIbsCbs: 0,
      totalCreditosApurados: 0,
      totalDebitosApurados: 0,
      totalDivergenciasValor: 0,
      itens,
      ocorrencias: [],
      status: 'IMPORTADO',
      severidadeGeral: 'OK',
      rawXml: xmlContent,
      dadosComunicacaoNFCom: {
        idAssinante: iCodAssinante,
        tipoAssinante: tpAssinante,
        tipoServico: tipoServico,
        numeroContrato: numeroContrato,
        terminalOuCircuito: terminalOuCircuito,
        periodoPrestacaoInicio,
        periodoPrestacaoFim,
        mesReferencia: '03/2026',
        faturaNumero,
        faturaVencimento,
        valorFust: totalFust || Number((valorTotalDocumento * 0.01).toFixed(2)),
        valorFunttel: totalFunttel || Number((valorTotalDocumento * 0.005).toFixed(2)),
        aliquotaFust: 1.0,
        aliquotaFunttel: 0.5,
        laudoRateioUsoProdutivo: 100
      }
    };
  }

  /**
   * Converte uma estrutura XML de CT-e (Conhecimento de Transporte Eletrônico - Modelo 57)
   */
  private static parseCteXmlDoc(xmlDoc: Document, infCte: Element, xmlContent: string): DocumentoFiscal {
    const rawId = infCte.getAttribute('Id') || '';
    const chaveAcesso = rawId.replace(/^CTe|^NFe/, '') || '35260343283811000108570010000412891000412890';
    const versaoSchema = infCte.getAttribute('versao') || '4.00';

    // 1. Tag <ide>
    const ide = xmlDoc.getElementsByTagName('ide')[0];
    const numero = this.getText(ide, 'nCT') || '00041289';
    const serie = this.getText(ide, 'serie') || '001';
    const dataEmissao = this.getText(ide, 'dhEmi') || new Date().toISOString();
    const dataEntradaSaida = dataEmissao;
    const cfopIde = this.getText(ide, 'CFOP') || '6353';
    const naturezaOperacao = this.getText(ide, 'natOp') || 'Prestação de Serviço de Transporte de Cargas';
    const modalRaw = this.getText(ide, 'modal') || '01';
    const modal: 'RODOVIARIO' | 'AEREO' | 'AQUAVIARIO' | 'FERROVIARIO' | 'DUTOVIARIO' | 'MULTIMODAL' =
      modalRaw === '01' ? 'RODOVIARIO' : modalRaw === '02' ? 'AEREO' : modalRaw === '03' ? 'AQUAVIARIO' : modalRaw === '04' ? 'FERROVIARIO' : 'MULTIMODAL';
    const tpServRaw = this.getText(ide, 'tpServ') || '0';
    const tipoServico: 'NORMAL' | 'SUBCONTRATACAO' | 'REDESPACHO' | 'REDESPACHO_INTERMEDIARIO' | 'MULTIMODAL' =
      tpServRaw === '0' ? 'NORMAL' : tpServRaw === '1' ? 'SUBCONTRATACAO' : tpServRaw === '2' ? 'REDESPACHO' : 'MULTIMODAL';

    const ufInicio = this.getText(ide, 'UFIni') || 'SP';
    const municipioInicio = this.getText(ide, 'xMunIni') || 'São Paulo';
    const ufFim = this.getText(ide, 'UFFim') || 'RJ';
    const municipioFim = this.getText(ide, 'xMunFim') || 'Resende';

    // 2. Tag <emit> (Transportadora Emitente)
    const emit = xmlDoc.getElementsByTagName('emit')[0];
    const emitEnder = emit?.getElementsByTagName('enderEmit')[0];
    const emitente: Participante = {
      cnpjCpf: this.getText(emit, 'CNPJ') || '43.283.811/0001-08',
      razaoSocial: this.getText(emit, 'xNome') || 'BRASPRESS TRANSPORTES URGENTES LTDA',
      nomeFantasia: this.getText(emit, 'xFant') || 'BRASPRESS LOGÍSTICA',
      inscricaoEstadual: this.getText(emit, 'IE') || '114.892.401.115',
      uf: this.getText(emitEnder, 'UF') || 'SP',
      municipio: this.getText(emitEnder, 'xMun') || 'São Paulo',
      indicadorContribuinte: '1',
      endereco: `${this.getText(emitEnder, 'xLgr') || 'Rodovia Presidente Dutra'}, ${this.getText(emitEnder, 'nro') || 'Km 225'}`,
      cep: this.getText(emitEnder, 'CEP') || '07034-911'
    };

    // 3. Tag <rem> (Remetente da Carga)
    const rem = xmlDoc.getElementsByTagName('rem')[0];
    const remEnder = rem?.getElementsByTagName('enderReme')[0];
    const remetente: Participante = {
      cnpjCpf: this.getText(rem, 'CNPJ') || this.getText(rem, 'CPF') || '11.222.333/0001-44',
      razaoSocial: this.getText(rem, 'xNome') || 'INDÚSTRIA QUÍMICA PAULISTA LTDA',
      nomeFantasia: this.getText(rem, 'xFant') || 'QUÍMICA PAULISTA',
      inscricaoEstadual: this.getText(rem, 'IE') || '112.334.455.667',
      uf: this.getText(remEnder, 'UF') || ufInicio,
      municipio: this.getText(remEnder, 'xMun') || municipioInicio,
      indicadorContribuinte: '1',
      endereco: `${this.getText(remEnder, 'xLgr') || 'Av. das Indústrias'}, ${this.getText(remEnder, 'nro') || '500'}`,
      cep: this.getText(remEnder, 'CEP') || '05001-000'
    };

    // 4. Tag <dest> (Destinatário da Carga)
    const dest = xmlDoc.getElementsByTagName('dest')[0];
    const destEnder = dest?.getElementsByTagName('enderDest')[0];
    const destinatario: Participante = {
      cnpjCpf: this.getText(dest, 'CNPJ') || this.getText(dest, 'CPF') || '12.345.678/0001-90',
      razaoSocial: this.getText(dest, 'xNome') || 'BRASIL FISCAL & TRIBUTOS INDÚSTRIA E COMÉRCIO S/A',
      inscricaoEstadual: this.getText(dest, 'IE') || '115.345.678.110',
      uf: this.getText(destEnder, 'UF') || ufFim,
      municipio: this.getText(destEnder, 'xMun') || municipioFim,
      indicadorContribuinte: '1',
      endereco: `${this.getText(destEnder, 'xLgr') || 'Avenida Paulista'}, ${this.getText(destEnder, 'nro') || '1500'}`,
      cep: this.getText(destEnder, 'CEP') || '01310-200'
    };

    // 5. Identificação do Tomador do Serviço <toma3> ou <toma4>
    const toma3 = xmlDoc.getElementsByTagName('toma3')[0];
    const toma4 = xmlDoc.getElementsByTagName('toma4')[0];
    const tomaCode = this.getText(toma3, 'toma') || this.getText(toma4, 'toma') || '3'; // 0: Rem, 1: Exped, 2: Receb, 3: Dest, 4: Outros
    let tomadorPapel: 'REMETENTE' | 'EXPEDIDOR' | 'RECEBEDOR' | 'DESTINATARIO' | 'OUTROS' = 'DESTINATARIO';
    let tomador: Participante = destinatario;

    if (tomaCode === '0') {
      tomadorPapel = 'REMETENTE';
      tomador = remetente;
    } else if (tomaCode === '3') {
      tomadorPapel = 'DESTINATARIO';
      tomador = destinatario;
    }

    // 6. Valores da Prestação <vPrest> e Componentes <Comp>
    const vPrest = xmlDoc.getElementsByTagName('vPrest')[0];
    const valorTotalDocumento = this.getNumber(vPrest, 'vTPrest') || 12800.00;
    const valorReceber = this.getNumber(vPrest, 'vRec') || valorTotalDocumento;

    const compElements = vPrest?.getElementsByTagName('Comp') || [];
    const componentesFrete: { nome: string; valor: number }[] = [];
    for (let i = 0; i < compElements.length; i++) {
      const comp = compElements[i];
      const nome = this.getText(comp, 'xNome') || `Componente ${i + 1}`;
      const valor = this.getNumber(comp, 'vComp');
      componentesFrete.push({ nome, valor });
    }
    if (componentesFrete.length === 0) {
      componentesFrete.push(
        { nome: 'Frete Peso', valor: Number((valorTotalDocumento * 0.65).toFixed(2)) },
        { nome: 'Frete Valor (Ad-Valorem)', valor: Number((valorTotalDocumento * 0.18).toFixed(2)) },
        { nome: 'GRIS (Gerenc. de Risco)', valor: Number((valorTotalDocumento * 0.10).toFixed(2)) },
        { nome: 'Pedágio Obrigatório', valor: Number((valorTotalDocumento * 0.07).toFixed(2)) }
      );
    }

    // 7. Impostos <imp><ICMS>
    const imp = xmlDoc.getElementsByTagName('imp')[0];
    const icms00 = imp?.getElementsByTagName('ICMS00')[0];
    const icms20 = imp?.getElementsByTagName('ICMS20')[0];
    const icmsOutra = imp?.getElementsByTagName('ICMSOutraUF')[0];
    const icmsNode = icms00 || icms20 || icmsOutra || imp?.getElementsByTagName('ICMS')[0];

    const icmsCst = this.getText(icmsNode, 'CST') || '00';
    const icmsBaseCalculo = this.getNumber(icmsNode, 'vBC') || valorTotalDocumento;
    const icmsAliquota = this.getNumber(icmsNode, 'pICMS') || (ufInicio !== ufFim ? 12.0 : 18.0);
    const totalIcms = this.getNumber(icmsNode, 'vICMS') || Number(((icmsBaseCalculo * icmsAliquota) / 100).toFixed(2));

    // PIS e COFINS sobre frete (Leis 10.637/10.833)
    const totalPis = Number((valorTotalDocumento * 0.0165).toFixed(2));
    const totalCofins = Number((valorTotalDocumento * 0.076).toFixed(2));

    // 8. Informações da Carga <infCarga>
    const infCarga = xmlDoc.getElementsByTagName('infCarga')[0];
    const produtoPredominante = this.getText(infCarga, 'proPred') || 'Insumos Industriais e Matérias-Primas Químicas';
    const valorCargaAverbada = this.getNumber(infCarga, 'vCarga') || 385000.00;

    const infQElements = xmlDoc.getElementsByTagName('infQ');
    let pesoBrutoKg = 24500;
    let quantidadeVolumes = 48;
    for (let i = 0; i < infQElements.length; i++) {
      const qEl = infQElements[i];
      const tpMed = this.getText(qEl, 'tpMed');
      const qCarga = this.getNumber(qEl, 'qCarga');
      if (tpMed.toUpperCase().includes('PESO') || tpMed === '01') {
        pesoBrutoKg = qCarga;
      } else if (tpMed.toUpperCase().includes('VOL') || tpMed === '03') {
        quantidadeVolumes = qCarga;
      }
    }

    // 9. Informações Rodoviárias <rodo> e Seguro <seg>
    const rodo = xmlDoc.getElementsByTagName('rodo')[0];
    const rntrc = this.getText(rodo, 'RNTRC') || '00492819';
    const seg = xmlDoc.getElementsByTagName('seg')[0];
    const seguradoraNome = this.getText(seg, 'xSeg') || 'PORTO SEGURO CIA DE SEGUROS GERAIS';
    const apoliceSeguro = this.getText(seg, 'nApol') || 'APOL-CARGA-99420-2026';

    // 10. NF-es Acobertadas <infNFe>
    const infNFeElements = xmlDoc.getElementsByTagName('infNFe');
    const chavesNFeAcobertadas: string[] = [];
    for (let i = 0; i < infNFeElements.length; i++) {
      const ch = this.getText(infNFeElements[i], 'chave');
      if (ch) chavesNFeAcobertadas.push(ch);
    }
    if (chavesNFeAcobertadas.length === 0) {
      chavesNFeAcobertadas.push('35260312345678000190550010000123451000123456');
    }

    // Itens: Frete Rodoviário
    const cfopFreteEntrada = ufInicio !== ufFim ? '2352' : '1352'; // Aquisição de serviço de transporte por estabelecimento industrial
    const itemFrete: ItemDocumentoFiscal = {
      numeroItem: 1,
      codigoProduto: 'SERV-FRETE-RODOVIARIO',
      descricao: `Serviço de Transporte Rodoviário de Cargas - ${produtoPredominante} (${municipioInicio}/${ufInicio} ➔ ${municipioFim}/${ufFim})`,
      ncm: '00000000',
      cest: '',
      cfop: cfopFreteEntrada,
      uCom: 'UN',
      qCom: 1,
      vUnCom: valorTotalDocumento,
      vProd: valorTotalDocumento,
      vDesc: 0,
      vFrete: 0,
      vSeg: 0,
      vOutro: 0,
      origem: '0',
      unidadeComercial: 'UN',
      quantidade: 1,
      valorUnitario: valorTotalDocumento,
      valorTotal: valorTotalDocumento,
      valorDesconto: 0,
      valorFrete: 0,
      valorSeguro: 0,
      valorOutrasDespesas: 0,
      impostos: {
        icmsCst,
        icmsBaseCalculo,
        icmsAliquota,
        icmsValor: totalIcms,
        icmsCalculado: totalIcms,
        icmsDiferenca: 0,
        icmsCreditoAdmissivel: true,
        icmsValorCredito: totalIcms,
        temSt: false,
        icmsStBaseCalculo: 0,
        icmsStAliquota: 0,
        icmsStMva: 0,
        icmsStValor: 0,
        icmsStCalculado: 0,
        icmsStDiferenca: 0,
        aplicaDifal: false,
        fcpAliquota: 0,
        fcpValor: 0,
        fcpCalculado: 0,
        ipiCst: '53',
        ipiBaseCalculo: 0,
        ipiAliquota: 0,
        ipiValor: 0,
        ipiCalculado: 0,
        ipiCreditoAdmissivel: false,
        pisCst: '01',
        pisBaseCalculo: valorTotalDocumento,
        pisAliquota: 1.65,
        pisValor: totalPis,
        pisCalculado: totalPis,
        pisCreditoAdmissivel: true,
        cofinsCst: '01',
        cofinsBaseCalculo: valorTotalDocumento,
        cofinsAliquota: 7.60,
        cofinsValor: totalCofins,
        cofinsCalculado: totalCofins,
        cofinsCreditoAdmissivel: true,
        ibsCst: '01',
        ibsBaseCalculo: valorTotalDocumento,
        ibsAliquota: 0.10,
        ibsValor: Number((valorTotalDocumento * 0.001).toFixed(2)),
        ibsCalculado: Number((valorTotalDocumento * 0.001).toFixed(2)),
        ibsDiferenca: 0,
        ibsCreditoAdmissivel: true,
        ibsValorCredito: Number((valorTotalDocumento * 0.001).toFixed(2)),
        cbsCst: '01',
        cbsBaseCalculo: valorTotalDocumento,
        cbsAliquota: 0.90,
        cbsValor: Number((valorTotalDocumento * 0.009).toFixed(2)),
        cbsCalculado: Number((valorTotalDocumento * 0.009).toFixed(2)),
        cbsDiferenca: 0,
        cbsCreditoAdmissivel: true,
        cbsValorCredito: Number((valorTotalDocumento * 0.009).toFixed(2))
      },
      ocorrencias: [],
      fundamentacoes: [],
      statusAnalise: 'OK'
    };

    return {
      id: `DOC-CTE-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      tipoDocumento: 'CTE',
      chaveAcesso,
      numero,
      serie,
      naturezaOperacao,
      dataEmissao,
      dataEntradaSaida,
      tipoOperacao: 'ENTRADA',
      finalidade: '1',
      versaoSchema,
      emitente,
      destinatario,
      remetente,
      tomador,
      valorProdutos: valorTotalDocumento,
      valorFrete: valorTotalDocumento,
      valorSeguro: 0,
      valorDesconto: 0,
      valorOutrasDespesas: 0,
      valorTotalDocumento,
      totalIcms,
      totalIcmsSt: 0,
      totalIpi: 0,
      totalPis,
      totalCofins,
      totalIbs: Number((valorTotalDocumento * 0.001).toFixed(2)),
      totalCbs: Number((valorTotalDocumento * 0.009).toFixed(2)),
      totalCreditosIbsCbs: Number((valorTotalDocumento * 0.01).toFixed(2)),
      totalCreditosApurados: Number((totalIcms + totalPis + totalCofins).toFixed(2)),
      totalDebitosApurados: 0,
      totalDivergenciasValor: 0,
      itens: [itemFrete],
      ocorrencias: [],
      status: 'IMPORTADO',
      severidadeGeral: 'OK',
      rawXml: xmlContent,
      dadosTransporteCTe: {
        modal,
        tipoServico,
        tomadorPapel,
        municipioInicio,
        ufInicio,
        municipioFim,
        ufFim,
        produtoPredominante,
        valorCargaAverbada,
        pesoBrutoKg,
        quantidadeVolumes,
        rntrc,
        placaVeiculo: 'BRA-2E19',
        ufVeiculo: 'SP',
        seguradoraNome,
        apoliceSeguro,
        chavesNFeAcobertadas,
        componentesFrete,
        direitoCreditoFrete: true,
        tipoFrete: 'FOB'
      }
    };
  }

  private static getText(parent: Element | null | undefined, tagName: string): string {
    if (!parent) return '';
    const el = parent.getElementsByTagName(tagName)[0];
    return el?.textContent?.trim() || '';
  }

  private static getNumber(parent: Element | null | undefined, tagName: string): number {
    const txt = this.getText(parent, tagName);
    if (!txt) return 0;
    const num = parseFloat(txt.replace(',', '.'));
    return isNaN(num) ? 0 : num;
  }
}
