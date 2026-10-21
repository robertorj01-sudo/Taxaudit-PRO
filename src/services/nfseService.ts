import { DadosServicoNFSe, PadraoLayoutNFSe } from '../types/fiscal';

/**
 * BASE DE ITENS DA LISTA DE SERVIÇOS - LEI COMPLEMENTAR Nº 116/2003
 * Utilizada por todas as prefeituras do Brasil para classificação do ISSQN.
 */
export const LISTA_SERVICOS_LC116: Record<string, string> = {
  '01.01': 'Análise e desenvolvimento de sistemas',
  '01.02': 'Programação e desenvolvimento de softwares e aplicativos',
  '01.03': 'Processamento, armazenamento ou hospedagem de dados, textos e imagens',
  '01.04': 'Elaboração de programas de computadores e jogos eletrônicos',
  '01.05': 'Licenciamento ou cessão de direito de uso de programas de computação',
  '01.06': 'Assessoria e consultoria em tecnologia da informação e computação',
  '01.07': 'Suporte técnico em informática e manutenção de hardware/software',
  '01.08': 'Planejamento, confecção e manutenção de páginas eletrônicas (web design)',
  '07.01': 'Engenharia, agronomia, agrimensura, arquitetura e geologia',
  '07.02': 'Execução de obras de construção civil, hidráulica ou elétrica e terraplenagem',
  '07.03': 'Elaboração de planos diretores, estudos de viabilidade e projetos de engenharia',
  '07.05': 'Reparação, conservação e reforma de edifícios, estradas, pontes e portos',
  '07.06': 'Colocação e instalação de tapetes, pisos, cortinas, revestimentos e divisórias',
  '07.09': 'Varrição, coleta, remoção, incineração e tratamento de lixo e resíduos',
  '07.10': 'Limpeza, manutenção e conservação de vias e logradouros públicos e imóveis',
  '07.11': 'Decoração e jardinagem, inclusive corte e poda de árvores',
  '10.01': 'Agenciamento, corretagem ou intermediação de câmbio, seguros e títulos',
  '10.05': 'Agenciamento, corretagem ou intermediação de bens móveis ou imóveis',
  '11.01': 'Guarda e estacionamento de veículos terrestres automotores e aeronaves',
  '11.02': 'Vigilância, segurança ou monitoramento de bens, pessoas e semoventes',
  '11.04': 'Armazenamento, depósito, carga, descarga, arrumação e guarda de bens',
  '14.01': 'Lubrificação, limpeza, revisão, conserto, restauração e manutenção de máquinas e veículos',
  '14.02': 'Assistência técnica, instalação e montagem de aparelhos e máquinas',
  '14.05': 'Restauração, recondicionamento, pintura e tratamento térmico de objetos',
  '14.06': 'Instalação e montagem de aparelhos, máquinas e equipamentos industriais',
  '17.01': 'Assessoria ou consultoria de qualquer natureza, financeira ou contábil',
  '17.02': 'Datilografia, digitação, estenografia, redação e edição de textos',
  '17.03': 'Planejamento, coordenação, programação ou organização técnica e comercial',
  '17.04': 'Recrutamento, agenciamento, seleção e colocação de mão-de-obra',
  '17.05': 'Fornecimento de mão-de-obra, mesmo em caráter temporário (terceirização)',
  '17.06': 'Propaganda e publicidade, inclusive promoção de vendas e planejamento de campanhas',
  '17.08': 'Franquia (franchising)',
  '17.09': 'Perícias, laudos, exames técnicos e análises técnicas',
  '17.12': 'Administração em geral, inclusive de bens e negócios de terceiros',
  '17.14': 'Advocacia, consultoria e representação jurídica',
  '17.16': 'Auditoria contábil, fiscal, trabalhista e financeira',
  '17.19': 'Contabilidade, inclusive serviços técnicos e auxiliares',
  '17.20': 'Consultoria e assessoria em comércio exterior e desembaraço aduaneiro',
  '35.01': 'Serviços de reportagem, assessoria de imprensa, jornalismo e relações públicas'
};

/**
 * DICIONÁRIO DE MUNICÍPIOS E PREFEITURAS DO BRASIL (CÓDIGO IBGE ➔ NOME DA PREFEITURA)
 */
export const PREFEITURAS_BRASIL: Record<string, { nome: string; uf: string; padrao: PadraoLayoutNFSe }> = {
  '3550308': { nome: 'Prefeitura do Município de São Paulo', uf: 'SP', padrao: 'PAULISTANA' },
  '3304557': { nome: 'Prefeitura da Cidade do Rio de Janeiro', uf: 'RJ', padrao: 'CARIOCA' },
  '3106200': { nome: 'Prefeitura Municipal de Belo Horizonte', uf: 'MG', padrao: 'ABRASF_V2' },
  '4106902': { nome: 'Prefeitura Municipal de Curitiba', uf: 'PR', padrao: 'ABRASF_V2' },
  '4314902': { nome: 'Prefeitura Municipal de Porto Alegre', uf: 'RS', padrao: 'ABRASF_V2' },
  '2927408': { nome: 'Prefeitura Municipal de Salvador', uf: 'BA', padrao: 'ABRASF_V2' },
  '2304400': { nome: 'Prefeitura Municipal de Fortaleza', uf: 'CE', padrao: 'ABRASF_V2' },
  '2611606': { nome: 'Prefeitura da Cidade do Recife', uf: 'PE', padrao: 'ABRASF_V2' },
  '5300108': { nome: 'Governo do Distrito Federal (Brasília)', uf: 'DF', padrao: 'PADRAO_NACIONAL' },
  '3509502': { nome: 'Prefeitura Municipal de Campinas', uf: 'SP', padrao: 'DSF' },
  '3549904': { nome: 'Prefeitura de São José dos Campos', uf: 'SP', padrao: 'ABRASF_V2' },
  '3548708': { nome: 'Prefeitura de São Bernardo do Campo', uf: 'SP', padrao: 'GINFES' },
  '3547809': { nome: 'Prefeitura Municipal de Santo André', uf: 'SP', padrao: 'GINFES' },
  '3543402': { nome: 'Prefeitura Municipal de Ribeirão Preto', uf: 'SP', padrao: 'ABRASF_V2' },
  '3552205': { nome: 'Prefeitura de Sorocaba', uf: 'SP', padrao: 'DSF' },
  '3534401': { nome: 'Prefeitura do Município de Osasco', uf: 'SP', padrao: 'ABRASF_V2' },
  '3518800': { nome: 'Prefeitura de Guarulhos', uf: 'SP', padrao: 'GINFES' },
  '3529005': { nome: 'Prefeitura Municipal de Marília', uf: 'SP', padrao: 'ABRASF_V2' },
  '3549805': { nome: 'Prefeitura de São José do Rio Preto', uf: 'SP', padrao: 'GINFES' },
  '3301702': { nome: 'Prefeitura de Duque de Caxias', uf: 'RJ', padrao: 'ABRASF_V2' },
  '3303302': { nome: 'Prefeitura Municipal de Niterói', uf: 'RJ', padrao: 'ABRASF_V2' },
  '3170206': { nome: 'Prefeitura Municipal de Uberlândia', uf: 'MG', padrao: 'ABRASF_V2' },
  '3136702': { nome: 'Prefeitura de Juiz de Fora', uf: 'MG', padrao: 'BETHA' },
  '4205407': { nome: 'Prefeitura Municipal de Florianópolis', uf: 'SC', padrao: 'IPM' },
  '4209102': { nome: 'Prefeitura Municipal de Joinville', uf: 'SC', padrao: 'BETHA' },
  '5208707': { nome: 'Prefeitura Municipal de Goiânia', uf: 'GO', padrao: 'ABRASF_V2' },
  '5002704': { nome: 'Prefeitura Municipal de Campo Grande', uf: 'MS', padrao: 'ABRASF_V2' },
  '5103403': { nome: 'Prefeitura Municipal de Cuiabá', uf: 'MT', padrao: 'ABRASF_V2' },
  '1302603': { nome: 'Prefeitura Municipal de Manaus', uf: 'AM', padrao: 'ABRASF_V2' },
  '1501402': { nome: 'Prefeitura Municipal de Belém', uf: 'PA', padrao: 'ABRASF_V2' },
  '2111300': { nome: 'Prefeitura de São Luís', uf: 'MA', padrao: 'ABRASF_V2' },
  '2704302': { nome: 'Prefeitura de Maceió', uf: 'AL', padrao: 'ABRASF_V2' },
  '2507507': { nome: 'Prefeitura Municipal de João Pessoa', uf: 'PB', padrao: 'ABRASF_V2' },
  '2800308': { nome: 'Prefeitura de Aracaju', uf: 'SE', padrao: 'ABRASF_V2' },
  '2408102': { nome: 'Prefeitura Municipal de Natal', uf: 'RN', padrao: 'ABRASF_V2' },
  '2211001': { nome: 'Prefeitura de Teresina', uf: 'PI', padrao: 'ABRASF_V2' },
  '0000000': { nome: 'Portal de Gestão da NFS-e Nacional (CGNFS-e / Receita Federal)', uf: 'BR', padrao: 'PADRAO_NACIONAL' }
};

export class NfseService {
  /**
   * Obtém a descrição oficial do Item da Lista de Serviços (LC 116/2003)
   */
  public static obterDescricaoItemListaServico(codigo: string | undefined): string {
    if (!codigo) return 'Prestação de Serviços em Geral (LC 116/2003)';
    const clean = codigo.trim().replace(/^0+/, '');
    // Tenta formato original (ex: 01.01) ou sem ponto ou sem zero
    for (const [k, desc] of Object.entries(LISTA_SERVICOS_LC116)) {
      if (k === codigo || k.replace('.', '') === codigo || k.replace(/^0+/, '') === clean) {
        return `${k} - ${desc}`;
      }
    }
    return `Item ${codigo} da Lista de Serviços anexa à Lei Complementar nº 116/2003`;
  }

  /**
   * Identifica o nome da Prefeitura e Estado a partir do código do município IBGE ou UF
   */
  public static identificarPrefeitura(codigoMunicipioIbge?: string, uf?: string): {
    nome: string;
    uf: string;
    padrao: PadraoLayoutNFSe;
  } {
    if (codigoMunicipioIbge && PREFEITURAS_BRASIL[codigoMunicipioIbge]) {
      return PREFEITURAS_BRASIL[codigoMunicipioIbge];
    }
    if (uf) {
      return {
        nome: `Prefeitura Municipal (${uf.toUpperCase()})`,
        uf: uf.toUpperCase(),
        padrao: 'ABRASF_V2'
      };
    }
    return {
      nome: 'Prefeitura Municipal Emissora (Padrão ABRASF)',
      uf: 'BR',
      padrao: 'ABRASF_V2'
    };
  }

  /**
   * Traduz a Natureza da Operação tributária da NFS-e
   */
  public static traduzirNaturezaOperacao(naturezaCodigo: string | undefined): string {
    switch (naturezaCodigo) {
      case '1':
        return 'Tributação no município (ISS Devido no local do prestador)';
      case '2':
        return 'Tributação fora do município (ISS Devido no local da prestação)';
      case '3':
        return 'Operação Isenta de ISSQN';
      case '4':
        return 'Operação Imune (Constituição Federal art. 150, VI)';
      case '5':
        return 'Exigibilidade suspensa por decisão judicial';
      case '6':
        return 'Exigibilidade suspensa por procedimento administrativo';
      default:
        return 'Prestação de Serviços Tributada pelo ISSQN';
    }
  }

  /**
   * Traduz o Regime Especial de Tributação
   */
  public static traduzirRegimeEspecial(regimeCodigo: string | undefined): string {
    switch (regimeCodigo) {
      case '1':
        return 'Microempresa Municipal';
      case '2':
        return 'Estimativa';
      case '3':
        return 'Sociedade de Profissionais (Uniprofissional)';
      case '4':
        return 'Cooperativa';
      case '5':
        return 'Microempresário Individual (MEI)';
      case '6':
        return 'Microempresa ou Empresa de Pequeno Porte (Simples Nacional)';
      default:
        return 'Tributação Normal';
    }
  }
}

/**
 * AMOSTRAS DE XMLS REAIS DE NOTAS FISCAIS DE SERVIÇOS DAS PREFEITURAS DO BRASIL
 * Para testes instantâneos nos padrões:
 * 1. Padrão Nacional CGNFS-e / Receita Federal do Brasil
 * 2. Padrão ABRASF v2.04 (Capitais / BH / Curitiba / Salvador)
 * 3. Padrão Paulistana (Prefeitura de São Paulo - SP / Nota do Milhão)
 * 4. Padrão Carioca (Prefeitura da Cidade do Rio de Janeiro - RJ)
 */

export const SAMPLE_XML_NFSE_PADRAO_NACIONAL = `<?xml version="1.0" encoding="UTF-8"?>
<NFSe xmlns="http://www.sped.fazenda.gov.br/nfse" versao="1.00">
  <infNFSe Id="NFS35503082603123456780001900000000000123456789012345">
    <xLocEmi>São Paulo - SP</xLocEmi>
    <xLocPrestacao>São Paulo - SP</xLocPrestacao>
    <nNFSe>00001248</nNFSe>
    <cVerif>A7B9-8F2C</cVerif>
    <dhEmi>2026-03-18T10:15:30-03:00</dhEmi>
    <dCompet>2026-03-01</dCompet>
    <emit>
      <CNPJ>28456123000177</CNPJ>
      <xNome>TECH CONSULTING BRASIL SERVICOS DE TECNOLOGIA LTDA</xNome>
      <xFant>TECH CONSULTING</xFant>
      <IM>49821458</IM>
      <enderNac>
        <xLgr>Avenida Engenheiro Luis Carlos Berrini</xLgr>
        <nro>105</nro>
        <xCpl>Conjunto 81</xCpl>
        <xBairro>Brooklin</xBairro>
        <cMun>3550308</cMun>
        <xMun>São Paulo</xMun>
        <UF>SP</UF>
        <CEP>04571010</CEP>
      </enderNac>
    </emit>
    <toma>
      <CNPJ>00322818002093</CNPJ>
      <xNome>INDUSTRIAS NUCLEARES DO BRASIL S.A. - INB</xNome>
      <IM>11534567</IM>
      <enderNac>
        <xLgr>Rodovia Presidente Dutra</xLgr>
        <nro>Km 330</nro>
        <xBairro>Engenheiro Passos</xBairro>
        <cMun>3304201</cMun>
        <xMun>Resende</xMun>
        <UF>RJ</UF>
        <CEP>27555000</CEP>
      </enderNac>
    </toma>
    <serv>
      <cServ>
        <cTribNac>010101</cTribNac>
        <cTribMun>02498</cTribMun>
        <xDescServ>SERVICOS DE CONSULTORIA ESPECIALIZADA EM INFRAESTRUTURA DE DADOS, CIBERSEGURANCA E AUDITORIA FISCAL DIGITAL. DESENVOLVIMENTO DE APIs CONFORME CONTRATO DE PRESTACAO DE SERVICOS N 45/2026.</xDescServ>
      </cServ>
    </serv>
    <valores>
      <vServPrest>
        <vServ>18500.00</vServ>
      </vServPrest>
      <vDescIncond>0.00</vDescIncond>
      <vDescCond>0.00</vDescCond>
      <vDed>0.00</vDed>
      <trib>
        <tribMun>
          <tribISSQN>1</tribISSQN>
          <vBC>18500.00</vBC>
          <pAliq>2.00</pAliq>
          <vISSQN>370.00</vISSQN>
          <tpRetISSQN>1</tpRetISSQN>
        </tribMun>
        <tribFed>
          <pPIS>0.65</pPIS>
          <vPIS>120.25</vPIS>
          <pCOFINS>3.00</pCOFINS>
          <vCOFINS>555.00</vCOFINS>
          <vINSS>0.00</vINSS>
          <vIRRF>277.50</vIRRF>
          <vCSLL>185.00</vCSLL>
        </tribFed>
        <vLiq>16992.25</vLiq>
      </trib>
    </valores>
  </infNFSe>
</NFSe>`;

export const SAMPLE_XML_NFSE_ABRASF_V2 = `<?xml version="1.0" encoding="UTF-8"?>
<CompNfse xmlns="http://www.abrasf.org.br/nfse.xsd">
  <Nfse versao="2.04">
    <InfNfse Id="NFSE3106200000004589">
      <Numero>00004589</Numero>
      <CodigoVerificacao>8F92-K3D1-9874</CodigoVerificacao>
      <DataEmissao>2026-03-14T15:22:10</DataEmissao>
      <IdentificacaoRps>
        <Numero>4589</Numero>
        <Serie>RPS</Serie>
        <Tipo>1</Tipo>
      </IdentificacaoRps>
      <NaturezaOperacao>1</NaturezaOperacao>
      <RegimeEspecialTributacao>6</RegimeEspecialTributacao>
      <OptanteSimplesNacional>2</OptanteSimplesNacional>
      <IncentivadorCultural>2</IncentivadorCultural>
      <Competencia>2026-03-01</Competencia>
      <OutrasInformacoes>DOCUMENTO EMITIDO POR ME OU EPP OPTANTE PELO LUCRO PRESUMIDO. RETENCOES FEDERAIS EFETUADAS NA FONTE CONFORME LEI 10.833/2003 ART. 30.</OutrasInformacoes>
      <Servico>
        <Valores>
          <ValorServicos>12800.00</ValorServicos>
          <ValorDeducoes>0.00</ValorDeducoes>
          <ValorPis>83.20</ValorPis>
          <ValorCofins>384.00</ValorCofins>
          <ValorInss>0.00</ValorInss>
          <ValorIr>192.00</ValorIr>
          <ValorCsll>128.00</ValorCsll>
          <OutrasRetencoes>0.00</OutrasRetencoes>
          <ValorIss>640.00</ValorIss>
          <Aliquota>5.00</Aliquota>
          <DescontoIncondicionado>0.00</DescontoIncondicionado>
          <DescontoCondicionado>0.00</DescontoCondicionado>
          <ValorLiquidoNfse>11372.80</ValorLiquidoNfse>
        </Valores>
        <IssRetido>1</IssRetido>
        <ResponsavelRetencao>1</ResponsavelRetencao>
        <ItemListaServico>17.01</ItemListaServico>
        <CodigoCnae>6920601</CodigoCnae>
        <CodigoTributacaoMunicipio>692060100</CodigoTributacaoMunicipio>
        <Discriminacao>SERVICOS DE ASSESSORIA, AUDITORIA TRIBUTARIA E REVISAO DE OBRIGACOES FISCAIS MENSAIS E SPED FISCAL. PRESTADOS CONFORME PROPOSTA TECNICA APROVADA.</Discriminacao>
        <CodigoMunicipio>3106200</CodigoMunicipio>
        <ExigibilidadeISS>1</ExigibilidadeISS>
      </Servico>
      <PrestadorServico>
        <IdentificacaoPrestador>
          <CpfCnpj>
            <Cnpj>19874563000144</Cnpj>
          </CpfCnpj>
          <InscricaoMunicipal>02894561</InscricaoMunicipal>
        </IdentificacaoPrestador>
        <RazaoSocial>AUDICONTROL AUDITORES INDEPENDENTES LTDA</RazaoSocial>
        <NomeFantasia>AUDICONTROL</NomeFantasia>
        <Endereco>
          <Endereco>Avenida Afonso Pena</Endereco>
          <Numero>1500</Numero>
          <Complemento>Sala 904</Complemento>
          <Bairro>Funcionarios</Bairro>
          <CodigoMunicipio>3106200</CodigoMunicipio>
          <Uf>MG</Uf>
          <Cep>30130005</Cep>
        </Endereco>
        <Contato>
          <Telefone>3132890011</Telefone>
          <Email>contato@audicontrol.com.br</Email>
        </Contato>
      </PrestadorServico>
      <TomadorServico>
        <IdentificacaoTomador>
          <CpfCnpj>
            <Cnpj>00322818002093</Cnpj>
          </CpfCnpj>
          <InscricaoMunicipal>89451230</InscricaoMunicipal>
        </IdentificacaoTomador>
        <RazaoSocial>INDUSTRIAS NUCLEARES DO BRASIL S.A. - INB</RazaoSocial>
        <Endereco>
          <Endereco>Rodovia Presidente Dutra Km 330</Endereco>
          <Numero>SN</Numero>
          <Bairro>Engenheiro Passos</Bairro>
          <CodigoMunicipio>3304201</CodigoMunicipio>
          <Uf>RJ</Uf>
          <Cep>27555000</Cep>
        </Endereco>
      </TomadorServico>
      <OrgaoGerador>
        <CodigoMunicipio>3106200</CodigoMunicipio>
        <Uf>MG</Uf>
      </OrgaoGerador>
    </InfNfse>
  </Nfse>
</CompNfse>`;

export const SAMPLE_XML_NFSE_PAULISTANA = `<?xml version="1.0" encoding="UTF-8"?>
<RetornoEnvioLoteRPS xmlns="http://www.prefeitura.sp.gov.br/nfe">
  <ChaveNFeRPS>
    <ChaveNFe>
      <InscricaoPrestador>39845120</InscricaoPrestador>
      <NumeroNFe>00028912</NumeroNFe>
      <CodigoVerificacao>K89X-M41P</CodigoVerificacao>
    </ChaveNFe>
  </ChaveNFeRPS>
  <NotaFiscal>
    <NumeroNFe>00028912</NumeroNFe>
    <CodigoVerificacao>K89X-M41P</CodigoVerificacao>
    <DataEmissaoNFe>2026-03-12T14:10:00</DataEmissaoNFe>
    <CPFCNPJPrestador>
      <CNPJ>60872534000109</CNPJ>
    </CPFCNPJPrestador>
    <RazaoSocialPrestador>SISTEMAS E TECNOLOGIA INTEGRADA PAULISTA LTDA</RazaoSocialPrestador>
    <InscricaoMunicipalPrestador>39845120</InscricaoMunicipalPrestador>
    <CPFCNPJTomador>
      <CNPJ>00322818002093</CNPJ>
    </CPFCNPJTomador>
    <RazaoSocialTomador>INDUSTRIAS NUCLEARES DO BRASIL S.A. - INB</RazaoSocialTomador>
    <Discriminacao>SERVICOS DE SUPORTE TECNICO ESPECIALIZADO, HOSPEDAGEM EM NUVEM E MONITORAMENTO 24X7 DE SERVIDORES DE BANCO DE DADOS E BACKUP CORPORATIVO CONFORME CONTRATO TI-2026.</Discriminacao>
    <ValorServicos>9450.00</ValorServicos>
    <ValorDeducoes>0.00</ValorDeducoes>
    <CodigoServico>02498</CodigoServico>
    <AliquotaServicos>0.02</AliquotaServicos>
    <ValorISS>189.00</ValorISS>
    <ISSRetido>false</ISSRetido>
    <ValorPIS>61.43</ValorPIS>
    <ValorCOFINS>283.50</ValorCOFINS>
    <ValorINSS>0.00</ValorINSS>
    <ValorIR>141.75</ValorIR>
    <ValorCSLL>94.50</ValorCSLL>
    <ValorLiquido>8868.82</ValorLiquido>
    <CidadePrestador>São Paulo</CidadePrestador>
    <UFPrestador>SP</UFPrestador>
    <CidadeTomador>Resende</CidadeTomador>
    <UFTomador>RJ</UFTomador>
  </NotaFiscal>
</RetornoEnvioLoteRPS>`;

export const SAMPLE_XML_NFSE_CARIOCA = `<?xml version="1.0" encoding="UTF-8"?>
<ConsultarNfseResposta xmlns="http://notacarioca.rio.gov.br/WSNacional/XSD/1/nfse_pcrj_v01.xsd">
  <CompNfse>
    <Nfse versao="1.00">
      <InfNfse Id="NFSE3304557000089123">
        <Numero>00089123</Numero>
        <CodigoVerificacao>CR7X-89P2</CodigoVerificacao>
        <DataEmissao>2026-03-10T16:45:00</DataEmissao>
        <NaturezaOperacao>1</NaturezaOperacao>
        <RegimeEspecialTributacao>1</RegimeEspecialTributacao>
        <OptanteSimplesNacional>2</OptanteSimplesNacional>
        <Competencia>2026-03-01</Competencia>
        <Servico>
          <Valores>
            <ValorServicos>15600.00</ValorServicos>
            <ValorDeducoes>0.00</ValorDeducoes>
            <ValorPis>101.40</ValorPis>
            <ValorCofins>468.00</ValorCofins>
            <ValorInss>1716.00</ValorInss>
            <ValorIr>234.00</ValorIr>
            <ValorCsll>156.00</ValorCsll>
            <ValorIss>780.00</ValorIss>
            <Aliquota>0.05</Aliquota>
            <ValorLiquidoNfse>12144.60</ValorLiquidoNfse>
          </Valores>
          <IssRetido>1</IssRetido>
          <ItemListaServico>07.02</ItemListaServico>
          <CodigoCnae>4321500</CodigoCnae>
          <CodigoTributacaoMunicipio>432150001</CodigoTributacaoMunicipio>
          <Discriminacao>SERVICOS DE ENGENHARIA ELETRICA E MANUTENCAO PREVENTIVA E CORRETIVA EM SUBESTACOES E PAINÉIS DE ALTA TENSAO NA PLANTA INDUSTRIAL. COM DEDUCAO PREVISTA EM LEI.</Discriminacao>
          <CodigoMunicipio>3304557</CodigoMunicipio>
        </Servico>
        <PrestadorServico>
          <IdentificacaoPrestador>
            <CpfCnpj>
              <Cnpj>33984512000199</Cnpj>
            </CpfCnpj>
            <InscricaoMunicipal>04589123</InscricaoMunicipal>
          </IdentificacaoPrestador>
          <RazaoSocial>ENGETEC MANUTENCAO E ENGENHARIA INDUSTRIAL S/A</RazaoSocial>
          <NomeFantasia>ENGETEC RIO</NomeFantasia>
          <Endereco>
            <Endereco>Avenida Rio Branco</Endereco>
            <Numero>156</Numero>
            <Complemento>Andar 22</Complemento>
            <Bairro>Centro</Bairro>
            <CodigoMunicipio>3304557</CodigoMunicipio>
            <Uf>RJ</Uf>
            <Cep>20040003</Cep>
          </Endereco>
        </PrestadorServico>
        <TomadorServico>
          <IdentificacaoTomador>
            <CpfCnpj>
              <Cnpj>00322818002093</Cnpj>
            </CpfCnpj>
          </IdentificacaoTomador>
          <RazaoSocial>INDUSTRIAS NUCLEARES DO BRASIL S.A. - INB</RazaoSocial>
          <Endereco>
            <Endereco>Rodovia Presidente Dutra Km 330</Endereco>
            <Numero>SN</Numero>
            <Bairro>Engenheiro Passos</Bairro>
            <CodigoMunicipio>3304201</CodigoMunicipio>
            <Uf>RJ</Uf>
            <Cep>27555000</Cep>
          </Endereco>
        </TomadorServico>
        <OrgaoGerador>
          <CodigoMunicipio>3304557</CodigoMunicipio>
          <Uf>RJ</Uf>
        </OrgaoGerador>
      </InfNfse>
    </Nfse>
  </CompNfse>
</ConsultarNfseResposta>`;
