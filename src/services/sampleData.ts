import { Empresa, DocumentoFiscal, UsuarioApp, CertificadoDigitalInfo, LicencaComercial } from '../types/fiscal';
import { TaxRuleEngine } from './taxRuleEngine';
import { XmlFiscalParser } from './xmlParser';

export const EMPRESA_PADRAO: Empresa = {
  id: 'EMP-001',
  cnpj: '12.345.678/0001-90',
  razaoSocial: 'BRASIL FISCAL & TRIBUTOS INDÚSTRIA E COMÉRCIO S/A',
  nomeFantasia: 'BRASIL FISCAL S/A',
  inscricaoEstadual: '115.345.678.110',
  inscricaoMunicipal: '987.654-3',
  uf: 'SP',
  municipio: 'SÃO PAULO',
  codigoMunicipioIBGE: '3550308',
  regimeTributario: 'LUCRO_REAL',
  cnae: '4649-4/08 - Indústria e Comércio Geral',
  perfilSped: 'A',
  dataInicioAtividades: '2015-01-10',
  emailContato: 'contato@empresa.com.br',
  telefoneContato: '(11) 3250-8000',
  logradouro: 'Avenida Paulista',
  numero: '1500',
  bairro: 'Bela Vista',
  cep: '01310-100',
  aliquotaIcmsPadrao: 18,
  aproveitamentoCreditoInsumos: 100
};

export const USUARIOS_PADRAO: UsuarioApp[] = [
  {
    id: 'USR-001',
    nome: 'Roberto Pereira de Oliveira',
    email: 'roberto.pereira@empresa.com.br',
    cargo: 'Administrador Fiscal & Compliance',
    departamento: 'Controladoria & Tributário',
    telefone: '(11) 98765-4321',
    perfil: 'ADMIN_MASTER',
    ativo: true,
    dataCadastro: '2026-01-10',
    ultimoAcesso: 'Hoje às 10:45'
  },
  {
    id: 'USR-002',
    nome: 'Dra. Mariana Vasconcelos',
    email: 'mariana.vasconcelos@empresa.com.br',
    cargo: 'Coordenadora Tributária & Auditora',
    departamento: 'Jurídico Fiscal',
    telefone: '(11) 98111-2233',
    perfil: 'AUDITOR_TRIBUTARIO',
    ativo: true,
    dataCadastro: '2026-02-01',
    ultimoAcesso: 'Ontem às 16:20'
  },
  {
    id: 'USR-003',
    nome: 'Carlos Eduardo Lima',
    email: 'carlos.lima@empresa.com.br',
    cargo: 'Analista Fiscal Sênior',
    departamento: 'Escrita Fiscal & SPED',
    telefone: '(11) 97222-3344',
    perfil: 'ANALISTA_FISCAL',
    ativo: true,
    dataCadastro: '2026-02-15',
    ultimoAcesso: 'Hoje às 08:30'
  },
  {
    id: 'USR-004',
    nome: 'Ana Beatriz Santos',
    email: 'ana.santos@empresa.com.br',
    cargo: 'Operadora Fiscal & Recepção XML',
    departamento: 'Almoxarifado & Recebimento',
    telefone: '(11) 96333-4455',
    perfil: 'OPERADOR_FISCAL',
    ativo: true,
    dataCadastro: '2026-03-01',
    ultimoAcesso: 'Hoje às 09:12'
  }
];

export const CERTIFICADO_PADRAO: CertificadoDigitalInfo = {
  instalado: true,
  tipo: 'A1',
  nomeArquivo: 'CERTIFICADO_ICP_BRASIL_A1_EMPRESA.pfx',
  titular: 'BRASIL FISCAL & TRIBUTOS INDUSTRIA E COMERCIO S/A:12345678000190',
  cnpjVinculado: '12.345.678/0001-90',
  autoridadeCertificadora: 'AC SERASA RFB v5 / ICP-Brasil',
  numeroSerie: '4A:78:E2:91:3C:D0:6B:FA',
  dataEmissao: '2026-01-15',
  dataValidade: '2027-01-15',
  diasParaExpirar: 107,
  status: 'VALIDO',
  senhaSalva: true,
  wsSefazStatus: 'ONLINE',
  ultimoTesteSefaz: '2026-09-30T12:00:00.000Z',
  tempoRespostaMs: 185,
  tamanhoBytes: 8192
};

export const LICENCA_PADRAO: LicencaComercial = {
  ativa: true,
  plano: 'VITALICIO_PREMIUM',
  chaveLicenca: 'PRO-LIFETIME-BR-2026-F89A-42C1-90B7',
  empresaLicenciada: 'BRASIL FISCAL & TRIBUTOS INDÚSTRIA E COMÉRCIO S/A',
  cnpjLicenciado: '12.345.678/0001-90',
  emailTitular: 'roberto.pereira@empresa.com.br',
  dataAtivacao: '2026-09-15',
  validade: 'Vitalícia (Sem Expiração - Lifetime Access)',
  statusPagamento: 'PAGO_VITALICIO',
  valorPago: 2490.00,
  formaPagamento: 'PIX Institucional / Ativação Imediata',
  idTransacao: 'TX-PIX-982147365-LIFETIME',
  modulosHabilitados: [
    'Auditoria Fiscal Inteligente Explicável',
    'Validação Normativa & Motor de Regras',
    'Escrituração EFD ICMS/IPI (SPED Fiscal)',
    'Integração TOTVS Protheus (ADVPL/REST)',
    'Manifestação do Destinatário (SEFAZ MD-e)',
    'Reforma Tributária IBS/CBS (EC 132/LC 214)',
    'Certificado Digital ICP-Brasil A1/A3',
    'Gestão Multi-Usuários e Perfis de Acesso',
    'Trilha de Auditoria Imutável (CGU/TCU)'
  ],
  limiteNotasFiscais: 'Ilimitado (Sem restrição de volume)',
  suporteTecnico: 'Prioritário Especializado 24/7'
};

// XML de Exemplo 1: Operação Interestadual com CFOP interno indevido (5102) e Alíquota 18% em vez de 7%
export const SAMPLE_XML_INTERESTADUAL_DIVERGENTE = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260112345678000190550010000458921008458921" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00845892</cNF>
        <natOp>Venda de Mercadoria</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>45892</nNF>
        <dhEmi>2026-03-05T14:30:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <tpAmb>1</tpAmb>
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO LTDA</xNome>
        <xFant>BRASIL FISCAL LOG</xFant>
        <enderEmit>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderEmit>
        <IE>112345678110</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>98765432000115</CNPJ>
        <xNome>DISTRIBUIDORA NORDESTE COMÉRCIO S/A</xNome>
        <enderDest>
          <xLgr>Avenida Tancredo Neves</xLgr>
          <nro>800</nro>
          <cMun>2927408</cMun>
          <xMun>Salvador</xMun>
          <UF>BA</UF>
          <CEP>41820020</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>089765432</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>ELET-001</cProd>
          <cEAN>7891234567890</cEAN>
          <xProd>MONITOR INDUSTRIAL LED 27 POL HD</xProd>
          <NCM>85285220</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>1500.0000</vUnCom>
          <vProd>15000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vOutro>0.00</vOutro>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>15000.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>2700.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <IPITrib>
              <CST>50</CST>
              <vBC>15000.00</vBC>
              <pIPI>5.00</pIPI>
              <vIPI>750.00</vIPI>
            </IPITrib>
          </IPI>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>15000.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>247.50</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>15000.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>1140.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>15000.00</vBC>
          <vICMS>2700.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>15000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>750.00</vIPI>
          <vPIS>247.50</vPIS>
          <vCOFINS>1140.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>15750.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

// XML de Exemplo 2: Produto Monofásico PIS/COFINS (Farmácia/Perfumaria) com crédito indevido destacado
export const SAMPLE_XML_MONOFASICO_PISCOFINS = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260155443322000188550010000882101009882101" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00988210</cNF>
        <natOp>Venda de Medicamentos e Cosméticos</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>88210</nNF>
        <dhEmi>2026-03-06T09:15:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>55443322000188</CNPJ>
        <xNome>FARMACÊUTICA CENTRAL DO BRASIL S/A</xNome>
        <xFant>PHARMA BRASIL</xFant>
        <enderEmit>
          <xLgr>Rodovia Anhanguera</xLgr>
          <nro>Km 45</nro>
          <xMun>Campinas</xMun>
          <UF>SP</UF>
          <CEP>13000000</CEP>
        </enderEmit>
        <IE>244555666777</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO LTDA</xNome>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>112345678110</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>MED-009</cProd>
          <xProd>DIPIRONA SODICA 500MG 100 COMPRIMIDOS</xProd>
          <NCM>30049099</NCM>
          <CFOP>5102</CFOP>
          <uCom>CX</uCom>
          <qCom>500.0000</qCom>
          <vUnCom>12.0000</vUnCom>
          <vProd>6000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vOutro>0.00</vOutro>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <vBC>6000.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>1080.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>6000.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>99.00</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>6000.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>456.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>6000.00</vBC>
          <vICMS>1080.00</vICMS>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>6000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vPIS>99.00</vPIS>
          <vCOFINS>456.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>6000.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

// XML de Exemplo 3: Operação Regular Aprovada (100% em conformidade com as normas)
export const SAMPLE_XML_REGULAR_APROVADO = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260177889900000144550010000331001007331001" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00733100</cNF>
        <natOp>Venda Mercadoria Adquirida Terceiros</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>33100</nNF>
        <dhEmi>2026-03-08T11:00:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>77889900000144</CNPJ>
        <xNome>SUPPLY TECH COMPONENTES INDUSTRIAIS S/A</xNome>
        <enderEmit>
          <xLgr>Rua Vergueiro</xLgr>
          <nro>2000</nro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>04101000</CEP>
        </enderEmit>
        <IE>110999888777</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO LTDA</xNome>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>112345678110</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>COMP-882</cProd>
          <xProd>CABO DE FIBRA OPTICA MULTIMODO 50M</xProd>
          <NCM>85447010</NCM>
          <CFOP>5102</CFOP>
          <uCom>M</uCom>
          <qCom>100.0000</qCom>
          <vUnCom>45.0000</vUnCom>
          <vProd>4500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vOutro>0.00</vOutro>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <vBC>4500.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>810.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>4500.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>74.25</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>4500.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>342.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>4500.00</vBC>
          <vICMS>810.00</vICMS>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>4500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vPIS>74.25</vPIS>
          <vCOFINS>342.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>4500.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

// XML de Exemplo 4: Compra de Equipamentos e Conexões Industriais (Setembro / 2026 - Mês da pasta GEPAT)
export const SAMPLE_XML_SETEMBRO_EQUIPAMENTOS = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe33260933444555000122550010000154201006154201" versao="4.00">
      <ide>
        <cUF>33</cUF>
        <cNF>00615420</cNF>
        <natOp>Venda de Equipamentos Industriais</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>15420</nNF>
        <dhEmi>2026-09-04T10:15:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>1</idDest>
        <cMunFG>3304201</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>33444555000122</CNPJ>
        <xNome>EQUIPAMENTOS E TUBULAÇÕES INDUSTRIAIS RESENDE LTDA</xNome>
        <xFant>VALVULAS RESENDE</xFant>
        <enderEmit>
          <xLgr>Rodovia Presidente Dutra</xLgr>
          <nro>Km 305</nro>
          <xMun>Resende</xMun>
          <UF>RJ</UF>
          <CEP>27537000</CEP>
        </enderEmit>
        <IE>86412399</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO S/A</xNome>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>115345678110</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>VALV-INOX-316</cProd>
          <xProd>VALVULA DE RETENCAO DE ALTA PRESSAO INOX 316 4 POL</xProd>
          <NCM>84818097</NCM>
          <CFOP>5102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>3850.0000</vUnCom>
          <vProd>38500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vOutro>0.00</vOutro>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <vBC>38500.00</vBC>
              <pICMS>18.00</pICMS>
              <vICMS>6930.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <IPITrib>
              <CST>50</CST>
              <vBC>38500.00</vBC>
              <pIPI>5.00</pIPI>
              <vIPI>1925.00</vIPI>
            </IPITrib>
          </IPI>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>38500.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>635.25</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>38500.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>2926.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>38500.00</vBC>
          <vICMS>6930.00</vICMS>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>38500.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>1925.00</vIPI>
          <vPIS>635.25</vPIS>
          <vCOFINS>2926.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>40425.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

// XML de Exemplo 5: Aquisição de Insumos Químicos Industriais (Agosto / 2026)
export const SAMPLE_XML_AGOSTO_QUIMICOS = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc xmlns="http://www.portalfiscal.inf.br/nfe" versao="4.00">
  <NFe>
    <infNFe Id="NFe35260844555666000133550010000289101008289101" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cNF>00828910</cNF>
        <natOp>Venda de Insumos Quimicos Industriais</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>28910</nNF>
        <dhEmi>2026-08-19T16:45:00-03:00</dhEmi>
        <tpNF>1</tpNF>
        <idDest>2</idDest>
        <cMunFG>3550308</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <finNFe>1</finNFe>
      </ide>
      <emit>
        <CNPJ>44555666000133</CNPJ>
        <xNome>SOLUÇÕES QUÍMICAS INDUSTRIAIS DO BRASIL S/A</xNome>
        <xFant>QUIMICA BRASIL</xFant>
        <enderEmit>
          <xLgr>Avenida das Indústrias</xLgr>
          <nro>450</nro>
          <xMun>Campinas</xMun>
          <UF>SP</UF>
          <CEP>13050000</CEP>
        </enderEmit>
        <IE>244988777111</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO S/A</xNome>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xMun>São Paulo</xMun>
          <UF>SP</UF>
          <CEP>01310100</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>115345678110</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>QUIM-992</cProd>
          <xProd>REAGENTE QUIMICO PURIFICADOR GRAU REATOR PA</xProd>
          <NCM>28111990</NCM>
          <CFOP>6102</CFOP>
          <uCom>KG</uCom>
          <qCom>200.0000</qCom>
          <vUnCom>260.0000</vUnCom>
          <vProd>52000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vOutro>0.00</vOutro>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <vBC>52000.00</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>6240.00</vICMS>
            </ICMS00>
          </ICMS>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>52000.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>858.00</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>52000.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>3952.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>52000.00</vBC>
          <vICMS>6240.00</vICMS>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vProd>52000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>0.00</vIPI>
          <vPIS>858.00</vPIS>
          <vCOFINS>3952.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>52000.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

// Inicializa documentos de demonstração com auditoria pré-processada pelo motor
export const SAMPLE_XML_NF3E_ENERGIA_INB = `<?xml version="1.0" encoding="UTF-8"?>
<nf3eProc xmlns="http://www.portalfiscal.inf.br/nf3e" versao="1.00">
  <NF3e>
    <infNF3e Id="NF3e33260333050196000188660010000084521000845210" versao="1.00">
      <ide>
        <cUF>33</cUF>
        <tpAmb>1</tpAmb>
        <mod>66</mod>
        <serie>1</serie>
        <nNF>8452</nNF>
        <dhEmi>2026-03-01T08:00:00-03:00</dhEmi>
        <tpEmis>1</tpEmis>
        <cNF>00084521</cNF>
        <cDV>0</cDV>
        <natOp>FORNECIMENTO DE ENERGIA ELETRICA INDUSTRIAL</natOp>
      </ide>
      <emit>
        <CNPJ>33050196000188</CNPJ>
        <xNome>LIGHT SERVICOS DE ELETRICIDADE S A</xNome>
        <xFant>LIGHT</xFant>
        <IE>81619890</IE>
        <enderEmit>
          <xLgr>Av. Marechal Floriano</xLgr>
          <nro>168</nro>
          <xBairro>Centro</xBairro>
          <cMun>3304557</cMun>
          <xMun>Rio de Janeiro</xMun>
          <UF>RJ</UF>
          <CEP>20080002</CEP>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDUSTRIA E COMERCIO S/A</xNome>
        <IE>115345678110</IE>
        <enderDest>
          <xLgr>Rodovia Presidente Dutra</xLgr>
          <nro>Km 330</nro>
          <xBairro>Engenheiro Passos</xBairro>
          <cMun>3304201</cMun>
          <xMun>Resende</xMun>
          <UF>RJ</UF>
          <CEP>27555000</CEP>
        </enderDest>
      </dest>
      <gUC>
        <idAcesso>1004589210</idAcesso>
        <tpClasse>01</tpClasse>
        <tpSubClasse>01</tpSubClasse>
        <tpFase>3</tpFase>
        <tpTensao>04</tpTensao>
      </gUC>
      <gItem nItem="1">
        <cItem>01</cItem>
        <xItem>TARIFA USO SISTEMA DISTRIBUICAO - TUSD (DEMANDA INDUSTRIAL)</xItem>
        <cClass>010201</cClass>
        <uMed>kW</uMed>
        <qFaturada>4200.00</qFaturada>
        <vItem>58800.00</vItem>
        <imposto>
          <ICMS>
            <CST>00</CST>
            <vBC>58800.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>10584.00</vICMS>
          </ICMS>
          <PIS>
            <CST>01</CST>
            <vBC>58800.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>970.20</vPIS>
          </PIS>
          <COFINS>
            <CST>01</CST>
            <vBC>58800.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>4468.80</vCOFINS>
          </COFINS>
          <IBS>
            <CST>01</CST>
            <vBC>58800.00</vBC>
            <pIBS>0.10</pIBS>
            <vIBS>58.80</vIBS>
          </IBS>
          <CBS>
            <CST>01</CST>
            <vBC>58800.00</vBC>
            <pCBS>0.90</pCBS>
            <vCBS>529.20</vCBS>
          </CBS>
        </imposto>
      </gItem>
      <gItem nItem="2">
        <cItem>02</cItem>
        <xItem>CONSUMO ATIVO INDUSTRIAL TE (PONTA / FORA PONTA)</xItem>
        <cClass>010101</cClass>
        <uMed>kWh</uMed>
        <qFaturada>145000.00</qFaturada>
        <vItem>87000.00</vItem>
        <imposto>
          <ICMS>
            <CST>00</CST>
            <vBC>87000.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>15660.00</vICMS>
          </ICMS>
          <PIS>
            <CST>01</CST>
            <vBC>87000.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>1435.50</vPIS>
          </PIS>
          <COFINS>
            <CST>01</CST>
            <vBC>87000.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>6612.00</vCOFINS>
          </COFINS>
        </imposto>
      </gItem>
      <gItem nItem="3">
        <cItem>03</cItem>
        <xItem>ADICIONAL BANDEIRA TARIFARIA AMARELA</xItem>
        <cClass>010103</cClass>
        <uMed>kWh</uMed>
        <qFaturada>145000.00</qFaturada>
        <vItem>2733.25</vItem>
        <imposto>
          <ICMS>
            <CST>00</CST>
            <vBC>2733.25</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>491.99</vICMS>
          </ICMS>
          <PIS>
            <CST>01</CST>
            <vBC>2733.25</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>45.10</vPIS>
          </PIS>
          <COFINS>
            <CST>01</CST>
            <vBC>2733.25</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>207.73</vCOFINS>
          </COFINS>
        </imposto>
      </gItem>
      <total>
        <vProd>148533.25</vProd>
        <vNF>148533.25</vNF>
        <vICMS>26735.99</vICMS>
        <vPIS>2450.80</vPIS>
        <vCOFINS>11288.53</vCOFINS>
        <vIBS>148.53</vIBS>
        <vCBS>1336.80</vCBS>
        <vST>0.00</vST>
      </total>
    </infNF3e>
  </NF3e>
</nf3eProc>`;

export function gerarExemploNf3eEnergia(): DocumentoFiscal {
  const doc = XmlFiscalParser.parseNFeXml(SAMPLE_XML_NF3E_ENERGIA_INB);
  const auditado = TaxRuleEngine.analisarDocumento(doc, EMPRESA_PADRAO);
  return auditado.documentoAtualizado;
}

export const SAMPLE_XML_NFCOM_TELECOM = `<?xml version="1.0" encoding="UTF-8"?>
<nfcomProc versao="1.00" xmlns="http://www.portalfiscal.inf.br/nfcom">
  <NFCom>
    <infNFCom Id="NFCom35260302558157000162620010000078411000078410" versao="1.00">
      <ide>
        <cUF>35</cUF>
        <tpAmb>1</tpAmb>
        <mod>62</mod>
        <serie>001</serie>
        <nNF>00007841</nNF>
        <cNF>00078410</cNF>
        <cDV>0</cDV>
        <dhEmi>2026-03-25T14:30:00-03:00</dhEmi>
        <tpEmis>1</tpEmis>
        <nSiteAutoriz>0</nSiteAutoriz>
        <cMunFG>3550308</cMunFG>
        <finNFCom>0</finNFCom>
        <tpFat>0</tpFat>
        <verProc>VIVO_CORP_FAT_1.0</verProc>
      </ide>
      <emit>
        <CNPJ>02558157000162</CNPJ>
        <IE>108383949112</IE>
        <xNome>TELEFONICA BRASIL S.A.</xNome>
        <xFant>VIVO TELECOM &amp; DADOS</xFant>
        <enderEmit>
          <xLgr>Avenida Engenheiro Luis Carlos Berrini</xLgr>
          <nro>1376</nro>
          <xBairro>Cidade Moncoes</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <CEP>04571000</CEP>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO S/A</xNome>
        <indIEDest>1</indIEDest>
        <IE>115345678110</IE>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <CEP>01310200</CEP>
          <UF>SP</UF>
        </enderDest>
      </dest>
      <assinante>
        <iCodAssinante>ASSIN-CORP-99824-BR</iCodAssinante>
        <tpAssinante>1</tpAssinante>
        <tpServUtil>2</tpServUtil>
        <nContrato>CT-TELECOM-2026-9841</nContrato>
        <dContratoIni>2025-01-01</dContratoIni>
        <dContratoFim>2027-12-31</dContratoFim>
        <NroTermPrinc>CIRC-FIBRA-10G-SP01</NroTermPrinc>
      </assinante>
      <gSub>
        <dIniPer>2026-03-01</dIniPer>
        <dFimPer>2026-03-31</dFimPer>
      </gSub>
      <det nItem="1">
        <prod>
          <cProd>SERV-LINK-1GBPS</cProd>
          <xProd>Serviço de Comunicação Multimídia - Link Dedicado IP 1Gbps Fibra Óptica</xProd>
          <cClass>010101</cClass>
          <CFOP>1303</CFOP>
          <uMed>MES</uMed>
          <qFaturada>1.0000</qFaturada>
          <vItem>14500.00</vItem>
        </prod>
        <imposto>
          <ICMS00>
            <CST>00</CST>
            <vBC>14500.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>2610.00</vICMS>
            <pFUST>1.00</pFUST>
            <vFUST>145.00</vFUST>
            <pFUNTTEL>0.50</pFUNTTEL>
            <vFUNTTEL>72.50</vFUNTTEL>
          </ICMS00>
          <PIS>
            <CST>01</CST>
            <vBC>14500.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>239.25</vPIS>
          </PIS>
          <COFINS>
            <CST>01</CST>
            <vBC>14500.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>1102.00</vCOFINS>
          </COFINS>
        </imposto>
      </det>
      <det nItem="2">
        <prod>
          <cProd>SERV-SDWAN-SEG</cProd>
          <xProd>Serviço Gerenciado de Rede SD-WAN &amp; Firewall Corporativo Dedicado</xProd>
          <cClass>010102</cClass>
          <CFOP>1303</CFOP>
          <uMed>MES</uMed>
          <qFaturada>1.0000</qFaturada>
          <vItem>3950.00</vItem>
        </prod>
        <imposto>
          <ICMS00>
            <CST>00</CST>
            <vBC>3950.00</vBC>
            <pICMS>18.00</pICMS>
            <vICMS>711.00</vICMS>
            <pFUST>1.00</pFUST>
            <vFUST>39.50</vFUST>
            <pFUNTTEL>0.50</pFUNTTEL>
            <vFUNTTEL>19.75</vFUNTTEL>
          </ICMS00>
          <PIS>
            <CST>01</CST>
            <vBC>3950.00</vBC>
            <pPIS>1.65</pPIS>
            <vPIS>65.18</vPIS>
          </PIS>
          <COFINS>
            <CST>01</CST>
            <vBC>3950.00</vBC>
            <pCOFINS>7.60</pCOFINS>
            <vCOFINS>300.20</vCOFINS>
          </COFINS>
        </imposto>
      </det>
      <total>
        <vProd>18450.00</vProd>
        <vNF>18450.00</vNF>
        <vBC>18450.00</vBC>
        <vICMS>3321.00</vICMS>
        <vFUST>184.50</vFUST>
        <vFUNTTEL>92.25</vFUNTTEL>
        <vPIS>304.43</vPIS>
        <vCOFINS>1402.20</vCOFINS>
        <vIBS>18.45</vIBS>
        <vCBS>166.05</vCBS>
      </total>
      <gFat>
        <nFat>FAT-VIVO-00007841</nFat>
        <vOrig>18450.00</vOrig>
        <vLiq>18450.00</vLiq>
        <dVen>2026-04-10</dVen>
      </gFat>
      <protNFCom>
        <nProt>135260000458921</nProt>
        <dhRecbto>2026-03-25T14:30:12-03:00</dhRecbto>
        <cStat>100</cStat>
        <xMotivo>Autorizado o uso da NFCom (SVRS)</xMotivo>
      </protNFCom>
    </infNFCom>
  </NFCom>
</nfcomProc>`;

export function gerarExemploNfcomTelecom(): DocumentoFiscal {
  const doc = XmlFiscalParser.parseNFeXml(SAMPLE_XML_NFCOM_TELECOM);
  const auditado = TaxRuleEngine.analisarDocumento(doc, EMPRESA_PADRAO);
  return auditado.documentoAtualizado;
}

export const SAMPLE_XML_CTE_TRANSPORTE = `<?xml version="1.0" encoding="UTF-8"?>
<cteProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/cte">
  <CTe>
    <infCte Id="CTe35260343283811000108570010000412891000412890" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <cCT>00041289</cCT>
        <CFOP>6353</CFOP>
        <natOp>PRESTACAO DE SERVICO DE TRANSPORTE A ESTABELECIMENTO INDUSTRIAL</natOp>
        <mod>57</mod>
        <serie>001</serie>
        <nCT>00041289</nCT>
        <dhEmi>2026-03-24T10:15:00-03:00</dhEmi>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <cDV>0</cDV>
        <tpAmb>1</tpAmb>
        <tpCTe>0</tpCTe>
        <procEmi>0</procEmi>
        <verProc>BRASPRESS_TMS_4.0</verProc>
        <cMunEnv>3550308</cMunEnv>
        <xMunEnv>São Paulo</xMunEnv>
        <UFEnv>SP</UFEnv>
        <modal>01</modal>
        <tpServ>0</tpServ>
        <cMunIni>3550308</cMunIni>
        <xMunIni>São Paulo</xMunIni>
        <UFIni>SP</UFIni>
        <cMunFim>3304201</cMunFim>
        <xMunFim>Resende</xMunFim>
        <UFFim>RJ</UFFim>
        <retira>1</retira>
        <indIEToma>1</indIEToma>
        <toma3>
          <toma>3</toma>
        </toma3>
      </ide>
      <emit>
        <CNPJ>43283811000108</CNPJ>
        <IE>114892401115</IE>
        <xNome>BRASPRESS TRANSPORTES URGENTES LTDA</xNome>
        <xFant>BRASPRESS LOGISTICA</xFant>
        <enderEmit>
          <xLgr>Rodovia Presidente Dutra</xLgr>
          <nro>Km 225</nro>
          <xBairro>Varzea do Palacio</xBairro>
          <cMun>3518800</cMun>
          <xMun>Guarulhos</xMun>
          <CEP>07034911</CEP>
          <UF>SP</UF>
        </enderEmit>
      </emit>
      <rem>
        <CNPJ>11222333000144</CNPJ>
        <IE>112334455667</IE>
        <xNome>INDUSTRIA QUIMICA PAULISTA LTDA</xNome>
        <xFant>QUIMICA PAULISTA</xFant>
        <enderReme>
          <xLgr>Avenida das Industrias</xLgr>
          <nro>500</nro>
          <xBairro>Distrito Industrial</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <CEP>05001000</CEP>
          <UF>SP</UF>
        </enderReme>
      </rem>
      <dest>
        <CNPJ>12345678000190</CNPJ>
        <IE>115345678110</IE>
        <xNome>BRASIL FISCAL &amp; TRIBUTOS INDÚSTRIA E COMÉRCIO S/A</xNome>
        <enderDest>
          <xLgr>Avenida Paulista</xLgr>
          <nro>1500</nro>
          <xBairro>Bela Vista</xBairro>
          <cMun>3550308</cMun>
          <xMun>São Paulo</xMun>
          <CEP>01310200</CEP>
          <UF>SP</UF>
        </enderDest>
      </dest>
      <vPrest>
        <vTPrest>12800.00</vTPrest>
        <vRec>12800.00</vRec>
        <Comp>
          <xNome>Frete Peso</xNome>
          <vComp>8320.00</vComp>
        </Comp>
        <Comp>
          <xNome>Frete Valor (Ad-Valorem)</xNome>
          <vComp>2304.00</vComp>
        </Comp>
        <Comp>
          <xNome>GRIS (Gerenciamento de Risco)</xNome>
          <vComp>1280.00</vComp>
        </Comp>
        <Comp>
          <xNome>Pedágio</xNome>
          <vComp>896.00</vComp>
        </Comp>
      </vPrest>
      <imp>
        <ICMS>
          <ICMS00>
            <CST>00</CST>
            <vBC>12800.00</vBC>
            <pICMS>12.00</pICMS>
            <vICMS>1536.00</vICMS>
          </ICMS00>
        </ICMS>
      </imp>
      <infCTeNorm>
        <infCarga>
          <vCarga>385000.00</vCarga>
          <proPred>Insumos Industriais e Matérias-Primas Químicas</proPred>
          <infQ>
            <cUnid>01</cUnid>
            <tpMed>PESO BRUTO</tpMed>
            <qCarga>24500.0000</qCarga>
          </infQ>
          <infQ>
            <cUnid>03</cUnid>
            <tpMed>VOLUMES</tpMed>
            <qCarga>48.0000</qCarga>
          </infQ>
        </infCarga>
        <infDoc>
          <infNFe>
            <chave>35260311222333000144550010000123451000123456</chave>
          </infNFe>
        </infDoc>
        <seg>
          <respSeg>4</respSeg>
          <xSeg>PORTO SEGURO CIA DE SEGUROS GERAIS</xSeg>
          <nApol>APOL-CARGA-99420-2026</nApol>
        </seg>
        <rodo>
          <RNTRC>00492819</RNTRC>
        </rodo>
      </infCTeNorm>
      <protCTe>
        <nProt>135260000412891</nProt>
        <dhRecbto>2026-03-24T10:15:15-03:00</dhRecbto>
        <cStat>100</cStat>
        <xMotivo>Autorizado o uso do CT-e (SEFAZ-SP)</xMotivo>
      </protCTe>
    </infCte>
  </CTe>
</cteProc>`;

export function gerarExemploCteTransporte(): DocumentoFiscal {
  const doc = XmlFiscalParser.parseNFeXml(SAMPLE_XML_CTE_TRANSPORTE);
  const auditado = TaxRuleEngine.analisarDocumento(doc, EMPRESA_PADRAO);
  return auditado.documentoAtualizado;
}

export const SAMPLE_XML_FORNECEDOR_CNPJ_INAPTO = `<?xml version="1.0" encoding="UTF-8"?>
<nfeProc versao="4.00" xmlns="http://www.portalfiscal.inf.br/nfe">
  <NFe>
    <infNFe Id="NFe35260345842670000150550010000089121000089124" versao="4.00">
      <ide>
        <cUF>35</cUF>
        <natOp>VENDA DE INSUMOS E MATERIAIS INDUSTRIAIS</natOp>
        <mod>55</mod>
        <serie>1</serie>
        <nNF>8912</nNF>
        <dhEmi>2026-03-28T11:20:00-03:00</dhEmi>
        <dhSaiEnt>2026-03-28T14:00:00-03:00</dhSaiEnt>
        <tpNF>0</tpNF>
        <idDest>2</idDest>
        <cMunFG>3548708</cMunFG>
        <tpImp>1</tpImp>
        <tpEmis>1</tpEmis>
        <finNFe>1</finNFe>
        <indFinal>0</indFinal>
        <indPres>9</indPres>
      </ide>
      <emit>
        <CNPJ>45842670000150</CNPJ>
        <xNome>COMERCIO E DISTRIBUIDORA MERCANTIL VALE SUL LTDA</xNome>
        <xFant>VALE SUL SUPRIMENTOS INDUSTRIAIS</xFant>
        <enderEmit>
          <xLgr>AV INDUSTRIAL DO ABC</xLgr>
          <nro>1450</nro>
          <xBairro>DISTRITO INDUSTRIAL</xBairro>
          <cMun>3548708</cMun>
          <xMun>SAO BERNARDO DO CAMPO</xMun>
          <UF>SP</UF>
          <CEP>09720000</CEP>
        </enderEmit>
        <IE>635112890114</IE>
        <CRT>3</CRT>
      </emit>
      <dest>
        <CNPJ>00322818000147</CNPJ>
        <xNome>INDUSTRIAS NUCLEARES DO BRASIL S/A - INB</xNome>
        <enderDest>
          <xLgr>RODOVIA PRESIDENTE DUTRA KM 330</xLgr>
          <nro>S/N</nro>
          <xBairro>ENGENHEIRO PASSOS</xBairro>
          <cMun>3304201</cMun>
          <xMun>RESENDE</xMun>
          <UF>RJ</UF>
          <CEP>27555000</CEP>
        </enderDest>
        <indIEDest>1</indIEDest>
        <IE>83749201</IE>
      </dest>
      <det nItem="1">
        <prod>
          <cProd>VALV-INOX-316L</cProd>
          <cEAN>7891234560099</cEAN>
          <xProd>CONJUNTO DE VALVULAS DE ALTA PRESSAO ACO INOX 316L</xProd>
          <NCM>84818099</NCM>
          <CFOP>6102</CFOP>
          <uCom>UN</uCom>
          <qCom>10.0000</qCom>
          <vUnCom>3500.0000</vUnCom>
          <vProd>35000.00</vProd>
          <cEANTrib>7891234560099</cEANTrib>
          <uTrib>UN</uTrib>
          <qTrib>10.0000</qTrib>
          <vUnTrib>3500.0000</vUnTrib>
          <indTot>1</indTot>
        </prod>
        <imposto>
          <ICMS>
            <ICMS00>
              <orig>0</orig>
              <CST>00</CST>
              <modBC>3</modBC>
              <vBC>35000.00</vBC>
              <pICMS>12.00</pICMS>
              <vICMS>4200.00</vICMS>
            </ICMS00>
          </ICMS>
          <IPI>
            <IPITrib>
              <CST>50</CST>
              <vBC>35000.00</vBC>
              <pIPI>5.00</pIPI>
              <vIPI>1750.00</vIPI>
            </IPITrib>
          </IPI>
          <PIS>
            <PISAliq>
              <CST>01</CST>
              <vBC>35000.00</vBC>
              <pPIS>1.65</pPIS>
              <vPIS>577.50</vPIS>
            </PISAliq>
          </PIS>
          <COFINS>
            <COFINSAliq>
              <CST>01</CST>
              <vBC>35000.00</vBC>
              <pCOFINS>7.60</pCOFINS>
              <vCOFINS>2660.00</vCOFINS>
            </COFINSAliq>
          </COFINS>
        </imposto>
      </det>
      <total>
        <ICMSTot>
          <vBC>35000.00</vBC>
          <vICMS>4200.00</vICMS>
          <vICMSDeson>0.00</vICMSDeson>
          <vFCP>0.00</vFCP>
          <vBCST>0.00</vBCST>
          <vST>0.00</vST>
          <vFCPST>0.00</vFCPST>
          <vFCPSTRet>0.00</vFCPSTRet>
          <vProd>35000.00</vProd>
          <vFrete>0.00</vFrete>
          <vSeg>0.00</vSeg>
          <vDesc>0.00</vDesc>
          <vII>0.00</vII>
          <vIPI>1750.00</vIPI>
          <vIPIDevol>0.00</vIPIDevol>
          <vPIS>577.50</vPIS>
          <vCOFINS>2660.00</vCOFINS>
          <vOutro>0.00</vOutro>
          <vNF>36750.00</vNF>
        </ICMSTot>
      </total>
    </infNFe>
  </NFe>
</nfeProc>`;

export function gerarExemploFornecedorInapto(): DocumentoFiscal {
  const doc = XmlFiscalParser.parseNFeXml(SAMPLE_XML_FORNECEDOR_CNPJ_INAPTO);
  const auditado = TaxRuleEngine.analisarDocumento(doc, EMPRESA_PADRAO);
  return auditado.documentoAtualizado;
}

// Inicializa documentos de demonstração com auditoria pré-processada pelo motor
export function getDocumentosIniciais(): DocumentoFiscal[] {
  const doc1 = XmlFiscalParser.parseNFeXml(SAMPLE_XML_INTERESTADUAL_DIVERGENTE);
  const doc2 = XmlFiscalParser.parseNFeXml(SAMPLE_XML_MONOFASICO_PISCOFINS);
  const doc3 = XmlFiscalParser.parseNFeXml(SAMPLE_XML_REGULAR_APROVADO);
  const doc4 = XmlFiscalParser.parseNFeXml(SAMPLE_XML_SETEMBRO_EQUIPAMENTOS);
  const doc5 = XmlFiscalParser.parseNFeXml(SAMPLE_XML_AGOSTO_QUIMICOS);

  const res1 = TaxRuleEngine.analisarDocumento(doc1, EMPRESA_PADRAO);
  const res2 = TaxRuleEngine.analisarDocumento(doc2, EMPRESA_PADRAO);
  const res3 = TaxRuleEngine.analisarDocumento(doc3, EMPRESA_PADRAO);
  const res4 = TaxRuleEngine.analisarDocumento(doc4, EMPRESA_PADRAO);
  const res5 = TaxRuleEngine.analisarDocumento(doc5, EMPRESA_PADRAO);
  const docNf3e = gerarExemploNf3eEnergia();
  const docNfcom = gerarExemploNfcomTelecom();
  const docCte = gerarExemploCteTransporte();
  const docInapto = gerarExemploFornecedorInapto();

  return [
    docInapto,                // NF-e com Alerta Crítico: Fornecedor CNPJ INAPTO na Receita Federal (Art. 82 Lei 9.430/96)
    res4.documentoAtualizado, // Setembro/2026
    res5.documentoAtualizado, // Agosto/2026
    docCte,                   // CT-e Transporte Rodoviário de Insumos (Modelo 57)
    docNfcom,                 // NFCom Telecom & Link de Dados (Modelo 62)
    docNf3e,                  // NF3e Energia Elétrica (Modelo 66)
    res1.documentoAtualizado, // Março/2026
    res2.documentoAtualizado, // Março/2026
    res3.documentoAtualizado  // Março/2026
  ];
}
