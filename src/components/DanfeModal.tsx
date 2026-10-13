import React from 'react';
import { DocumentoFiscal } from '../types/fiscal';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';

interface DanfeModalProps {
  documento: DocumentoFiscal;
  onClose: () => void;
}

export const DanfeModal: React.FC<DanfeModalProps> = ({ documento, onClose }) => {
  const formatMoeda = (val?: number) => {
    if (val === undefined || val === null || isNaN(val)) return '0,00';
    return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  const chaveFormatada = documento.chaveAcesso
    ? documento.chaveAcesso.replace(/(\d{4})/g, '$1 ').trim()
    : '3526 0300 3228 1800 2093 5500 1000 0123 4510 0012 3456';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 overflow-y-auto">
      {/* Botões de Ação Superiores (ocultos na impressão) */}
      <div className="fixed top-3 right-3 z-60 flex items-center gap-2 print:hidden">
        <button
          onClick={handlePrint}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg flex items-center gap-2 transition"
        >
          <Printer className="w-4 h-4" />
          Imprimir / Salvar em PDF
        </button>
        <button
          onClick={onClose}
          className="p-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg shadow-lg transition"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Folha DANFE Oficial A4 */}
      <div
        id="danfe-print-area"
        className="bg-white text-black w-full max-w-4xl p-6 rounded-lg shadow-2xl font-sans text-[11px] leading-tight border border-slate-300 print:border-none print:shadow-none print:p-0 print:m-0 print:w-full print:max-w-none"
      >
        {/* Canhoto de Recebimento */}
        <div className="border border-black mb-2">
          <div className="flex border-b border-black">
            <div className="p-1.5 flex-1 text-[9px]">
              RECEBEMOS DE <span className="font-bold uppercase">{documento.emitente.razaoSocial}</span> OS PRODUTOS CONSTANTES DA NOTA FISCAL ELETRÔNICA INDICADA AO LADO
            </div>
            <div className="w-40 border-l border-black p-1 text-center font-bold">
              <div className="text-[10px]">NF-e</div>
              <div className="text-xs">Nº {documento.numero}</div>
              <div className="text-[9px]">SÉRIE {documento.serie}</div>
            </div>
          </div>
          <div className="flex text-[9px]">
            <div className="w-40 p-1 border-r border-black">DATA DE RECEBIMENTO</div>
            <div className="flex-1 p-1">IDENTIFICAÇÃO E ASSINATURA DO RECEBEDOR</div>
          </div>
        </div>

        {/* Linha pontilhada de corte */}
        <div className="border-b border-dashed border-slate-400 my-2 text-center text-[8px] text-slate-400">
          --------------------------------------- CORTE AQUI ---------------------------------------
        </div>

        {/* Cabeçalho DANFE */}
        <div className="border border-black grid grid-cols-12 mb-2">
          {/* Dados do Emitente (5 colunas) */}
          <div className="col-span-5 p-2 border-r border-black flex flex-col justify-between">
            <div>
              <div className="font-extrabold text-sm uppercase leading-snug">{documento.emitente.razaoSocial}</div>
              <div className="text-[10px] mt-1 text-slate-700">
                {documento.emitente.municipio} - {documento.emitente.uf}
              </div>
              <div className="text-[10px] text-slate-700">
                CNPJ: <span className="font-semibold">{documento.emitente.cnpjCpf}</span>
              </div>
              <div className="text-[10px] text-slate-700">
                Inscrição Estadual: <span className="font-semibold">{documento.emitente.inscricaoEstadual || 'ISENTO'}</span>
              </div>
            </div>
          </div>

          {/* Quadro DANFE Central (3 colunas) */}
          <div className="col-span-3 p-2 border-r border-black text-center flex flex-col justify-between">
            <div className="font-extrabold text-sm tracking-wider">
              {documento.tipoDocumento === 'CTE'
                ? 'DACTE'
                : documento.tipoDocumento === 'NFCOM'
                ? 'DANFECOM'
                : documento.tipoDocumento === 'NF3E'
                ? 'DANF3E'
                : 'DANFE'}
            </div>
            <div className="text-[9px] leading-tight font-semibold">
              {documento.tipoDocumento === 'CTE'
                ? 'DOCUMENTO AUXILIAR DO CONHECIMENTO DE TRANSPORTE ELETRÔNICO'
                : documento.tipoDocumento === 'NFCOM'
                ? 'DOC. AUXILIAR DA NOTA FISCAL FATURA ELETRÔNICA DE SERVIÇOS DE COMUNICAÇÃO'
                : documento.tipoDocumento === 'NF3E'
                ? 'DOC. AUXILIAR DA NOTA FISCAL DE ENERGIA ELÉTRICA ELETRÔNICA'
                : 'DOCUMENTO AUXILIAR DA NOTA FISCAL ELETRÔNICA'}
            </div>
            <div className="my-1 text-left inline-block mx-auto text-[10px] font-mono border border-black p-1">
              <div>0 - ENTRADA &nbsp; [ {documento.tipoOperacao === 'ENTRADA' ? 'X' : ' '} ]</div>
              <div>1 - SAÍDA &nbsp;&nbsp;&nbsp; [ {documento.tipoOperacao === 'SAIDA' ? 'X' : ' '} ]</div>
            </div>
            <div>
              <div className="font-extrabold text-xs">Nº {documento.numero}</div>
              <div className="font-bold text-[10px]">SÉRIE {documento.serie}</div>
              <div className="text-[9px]">
                {documento.tipoDocumento === 'CTE'
                  ? 'MOD. 57'
                  : documento.tipoDocumento === 'NFCOM'
                  ? 'MOD. 62'
                  : documento.tipoDocumento === 'NF3E'
                  ? 'MOD. 66'
                  : 'FOLHA 1/1'}
              </div>
            </div>
          </div>

          {/* Quadro Chave de Acesso e Código de Barras (4 colunas) */}
          <div className="col-span-4 p-2 flex flex-col justify-between">
            {/* Código de barras simulado em SVG vetorial para fidelidade gráfica */}
            <div className="w-full flex justify-center py-1">
              <svg className="w-full h-10" viewBox="0 0 200 40">
                {Array.from({ length: 45 }).map((_, i) => (
                  <rect
                    key={i}
                    x={i * 4.4 + (i % 3 === 0 ? 1 : 0)}
                    y="0"
                    width={i % 2 === 0 ? "2.5" : "1.2"}
                    height="38"
                    fill="#000"
                  />
                ))}
              </svg>
            </div>
            <div className="text-center font-mono font-bold text-[10px] tracking-widest border-t border-black pt-1">
              CHAVE DE ACESSO
              <div className="text-[9px] tracking-normal mt-0.5">{chaveFormatada}</div>
            </div>
            <div className="text-[9px] text-center border-t border-black pt-1">
              {documento.tipoDocumento === 'CTE' ? (
                <>
                  Consulta de autenticidade no Portal Nacional do CT-e <br />
                  <span className="font-mono text-[8px] font-semibold text-blue-700">www.cte.fazenda.gov.br/portal</span>
                </>
              ) : documento.tipoDocumento === 'NFCOM' ? (
                <>
                  Consulta de autenticidade no Portal da NFCom (SVRS) <br />
                  <span className="font-mono text-[8px] font-semibold text-cyan-700">dfe-portal.svrs.rs.gov.br/Nfcom</span>
                </>
              ) : documento.tipoDocumento === 'NF3E' ? (
                <>
                  Consulta de autenticidade no Portal da NF3e (SVRS) <br />
                  <span className="font-mono text-[8px] font-semibold text-blue-700">dfe-portal.svrs.rs.gov.br/Nf3e</span>
                </>
              ) : (
                <>
                  Consulta de autenticidade no portal nacional da NF-e <br />
                  <span className="font-mono text-[8px]">www.nfe.fazenda.gov.br/portal</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quadro Específico de Serviços de Comunicação / Telecomunicações (para NFCOM - Modelo 62) */}
        {documento.dadosComunicacaoNFCom && (
          <div className="border-2 border-cyan-600 bg-cyan-50/40 p-2 mb-2 rounded text-[9px]">
            <div className="font-bold text-[10px] text-cyan-900 uppercase flex items-center justify-between border-b border-cyan-300 pb-1 mb-1.5">
              <span>DADOS DO ASSINANTE &amp; SERVIÇOS DE TELECOMUNICAÇÕES • NFCOM MODELO 62</span>
              <span className="px-1.5 py-0.5 bg-cyan-200 text-cyan-950 font-mono text-[8.5px] rounded">
                NFCom MODELO 62 • AJUSTE SINIEF 07/2022 • AMBIENTE SVRS
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">CÓDIGO DO ASSINANTE</span>
                <span className="font-bold text-slate-900">{documento.dadosComunicacaoNFCom.idAssinante}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">TIPO DE SERVIÇO</span>
                <span className="font-bold text-slate-900">{documento.dadosComunicacaoNFCom.tipoServico}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">CIRCUITO / TERMINAL</span>
                <span className="font-bold text-slate-900">{documento.dadosComunicacaoNFCom.terminalOuCircuito}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">PERÍODO DE PRESTAÇÃO</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosComunicacaoNFCom.periodoPrestacaoInicio} a {documento.dadosComunicacaoNFCom.periodoPrestacaoFim}
                </span>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-cyan-200/80 flex items-center justify-between text-[8.5px] font-sans">
              <span className="text-cyan-950">
                <strong>Contrato:</strong> {documento.dadosComunicacaoNFCom.numeroContrato} • <strong>Fatura:</strong> {documento.dadosComunicacaoNFCom.faturaNumero} • <strong>Vencimento:</strong> {documento.dadosComunicacaoNFCom.faturaVencimento}
              </span>
              <div className="flex gap-2">
                <span className="bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-mono text-[8px]">
                  FUST (1,0%): R$ {(documento.totalFust || (documento.valorTotalDocumento * 0.01)).toFixed(2)}
                </span>
                <span className="bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-mono text-[8px]">
                  FUNTTEL (0,5%): R$ {(documento.totalFunttel || (documento.valorTotalDocumento * 0.005)).toFixed(2)}
                </span>
                <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono text-[8px]">
                  Crédito ICMS (LC 87/96): R$ {formatMoeda(documento.totalIcms)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Quadro Específico de Energia Elétrica (para NF3E) */}
        {documento.dadosEnergiaEletrica && (
          <div className="border-2 border-amber-600 bg-amber-50/40 p-2 mb-2 rounded text-[9px]">
            <div className="font-bold text-[10px] text-amber-900 uppercase flex items-center justify-between border-b border-amber-300 pb-1 mb-1.5">
              <span>DADOS DA UNIDADE CONSUMIDORA (UC) &amp; FORNECIMENTO DE ENERGIA</span>
              <span className="px-1.5 py-0.5 bg-amber-200 text-amber-950 font-mono text-[8.5px] rounded">
                NF3e MODELO 66 • AMBIENTE SVRS
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">CÓDIGO UC / INSTALAÇÃO</span>
                <span className="font-bold text-slate-900">{documento.dadosEnergiaEletrica.idAcessoUC}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">CLASSE / SUBGRUPO TARIFÁRIO</span>
                <span className="font-bold text-slate-900">{documento.dadosEnergiaEletrica.classeConsumo}</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">TENSÃO NOMINAL & FASE</span>
                <span className="font-bold text-slate-900">{documento.dadosEnergiaEletrica.tensaoFornecimento} ({documento.dadosEnergiaEletrica.tipoFase})</span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">MÊS DE REFERÊNCIA / DEMANDA</span>
                <span className="font-bold text-slate-900">{documento.dadosEnergiaEletrica.mesReferencia} • {documento.dadosEnergiaEletrica.demandaKW} kW</span>
              </div>
            </div>
            <div className="mt-1.5 pt-1.5 border-t border-amber-200/80 flex items-center justify-between text-[8.5px] font-sans">
              <span className="text-amber-950">
                <strong>Laudo Técnico Pericial de Rateio Industrial:</strong> {documento.dadosEnergiaEletrica.laudoRateioIndustrialPercentual}% do consumo consumido diretamente na linha fabril da empresa adquirente (Direito a Crédito ICMS LC 87/96, art. 33).
              </span>
              <span className="font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                Crédito ICMS Apropriável: R$ {formatMoeda(documento.itens.reduce((acc, it) => acc + (it.impostos.icmsValorCredito || 0), 0))}
              </span>
            </div>
          </div>
        )}

        {/* Quadro Específico de Transporte de Carga (para CT-e - Modelo 57) */}
        {(documento.tipoDocumento === 'CTE' || documento.dadosTransporteCTe) && (
          <div className="border-2 border-indigo-700 bg-indigo-50/40 p-2 mb-2 rounded text-[9px]">
            <div className="font-bold text-[10px] text-indigo-950 uppercase flex items-center justify-between border-b border-indigo-300 pb-1 mb-1.5">
              <span>DADOS DO TRANSPORTE DE CARGA &amp; PRESTAÇÃO DE SERVIÇO • DACTE MODELO 57</span>
              <span className="px-1.5 py-0.5 bg-indigo-200 text-indigo-950 font-mono text-[8.5px] rounded">
                MODAL {documento.dadosTransporteCTe?.modal || 'RODOVIÁRIO'} • TIPO {documento.dadosTransporteCTe?.tipoServico || 'NORMAL'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2 font-mono">
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">MUNICÍPIO / UF INÍCIO (ORIGEM)</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosTransporteCTe?.municipioInicio || 'PAULÍNIA'} / {documento.dadosTransporteCTe?.ufInicio || 'SP'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">MUNICÍPIO / UF TÉRMINO (DESTINO)</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosTransporteCTe?.municipioFim || 'RESENDE'} / {documento.dadosTransporteCTe?.ufFim || 'RJ'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">TOMADOR DO SERVIÇO / FRETE</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosTransporteCTe?.tomadorPapel || 'DESTINATÁRIO'} ({documento.dadosTransporteCTe?.tipoFrete || 'FOB'})
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">CARGA / PESO BRUTO / VOL</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosTransporteCTe?.pesoBrutoKg?.toLocaleString('pt-BR') || '28.500'} kg • {documento.dadosTransporteCTe?.quantidadeVolumes || 1} vol
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2 font-mono mt-1.5 pt-1.5 border-t border-indigo-200">
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">PRODUTO PREDOMINANTE</span>
                <span className="font-bold text-slate-900 truncate block">
                  {documento.dadosTransporteCTe?.produtoPredominante || 'INSUMOS QUÍMICOS / MATÉRIA-PRIMA'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">VALOR DA CARGA AVERBADA</span>
                <span className="font-bold text-slate-900">
                  R$ {(documento.dadosTransporteCTe?.valorCargaAverbada || 185000).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">RNTRC / VEÍCULO</span>
                <span className="font-bold text-slate-900">
                  {documento.dadosTransporteCTe?.rntrc ? `RNTRC: ${documento.dadosTransporteCTe.rntrc}` : 'RNTRC: 00492819'} • {documento.dadosTransporteCTe?.placaVeiculo || 'BRA-2E19'}/{documento.dadosTransporteCTe?.ufVeiculo || 'SP'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 font-sans block text-[8px]">SEGURADORA & APÓLICE</span>
                <span className="font-bold text-slate-900 truncate block">
                  {documento.dadosTransporteCTe?.seguradoraNome || 'PORTO SEGURO'} (Ap. {documento.dadosTransporteCTe?.apoliceSeguro || 'APOL-CARGA-99420'})
                </span>
              </div>
            </div>

            {/* Documentos originários acobertados (NF-es vinculadas) */}
            {documento.dadosTransporteCTe?.chavesNFeAcobertadas && documento.dadosTransporteCTe.chavesNFeAcobertadas.length > 0 && (
              <div className="mt-1.5 pt-1.5 border-t border-indigo-200 text-[8px] font-sans">
                <span className="text-indigo-950 font-semibold">NF-e(s) Acobertada(s) por este Conhecimento:</span>{' '}
                {documento.dadosTransporteCTe.chavesNFeAcobertadas.map(ch => (
                  <span key={ch} className="font-mono bg-indigo-100 text-indigo-900 px-1 py-0.5 rounded mr-1">
                    {ch}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1.5 pt-1.5 border-t border-indigo-200/80 flex items-center justify-between text-[8.5px] font-sans">
              <span className="text-indigo-950">
                <strong>Direito a Crédito Tributário sobre Frete:</strong> Frete FOB tomado na aquisição de insumos industriais / revenda garante apropriação integral de ICMS (LC 87/96) e PIS/COFINS (Lei 10.833/03 art. 3º, II).
              </span>
              <div className="flex gap-2 font-mono">
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                  Crédito ICMS (12%): R$ {formatMoeda(documento.totalIcms)}
                </span>
                <span className="font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded border border-blue-300">
                  PIS/COFINS (9,25%): R$ {formatMoeda(documento.totalPis + documento.totalCofins)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Natureza da Operação e Protocolo */}
        <div className="border border-black grid grid-cols-12 mb-2 text-[9px]">
          <div className="col-span-8 p-1 border-r border-black">
            <div className="text-slate-500 font-semibold">NATUREZA DA OPERAÇÃO</div>
            <div className="font-bold text-[10px] uppercase">{documento.naturezaOperacao}</div>
          </div>
          <div className="col-span-4 p-1">
            <div className="text-slate-500 font-semibold">PROTOCOLO DE AUTORIZAÇÃO DE USO</div>
            <div className="font-mono font-bold text-[10px]">135260089283741 05/03/2026 14:31:00</div>
          </div>
        </div>

        {/* Inscrição Estadual e CNPJ */}
        <div className="border border-black grid grid-cols-12 mb-2 text-[9px]">
          <div className="col-span-4 p-1 border-r border-black">
            <div className="text-slate-500 font-semibold">INSCRIÇÃO ESTADUAL</div>
            <div className="font-mono font-bold">{documento.emitente.inscricaoEstadual || 'ISENTO'}</div>
          </div>
          <div className="col-span-4 p-1 border-r border-black">
            <div className="text-slate-500 font-semibold">INSCRIÇÃO ESTADUAL DO SUBST. TRIB.</div>
            <div className="font-mono font-bold">-</div>
          </div>
          <div className="col-span-4 p-1">
            <div className="text-slate-500 font-semibold">CNPJ</div>
            <div className="font-mono font-bold">{documento.emitente.cnpjCpf}</div>
          </div>
        </div>

        {/* Destinatário / Remetente */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase mb-0.5">DESTINATÁRIO / REMETENTE</div>
          <div className="border border-black text-[9px]">
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-8 p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">NOME / RAZÃO SOCIAL</div>
                <div className="font-bold text-[10px] uppercase">{documento.destinatario.razaoSocial}</div>
              </div>
              <div className="col-span-4 p-1">
                <div className="text-slate-500 font-semibold">CNPJ / CPF</div>
                <div className="font-mono font-bold">{documento.destinatario.cnpjCpf}</div>
              </div>
            </div>
            <div className="grid grid-cols-12 border-b border-black">
              <div className="col-span-7 p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">ENDEREÇO / MUNICÍPIO</div>
                <div className="font-medium">{documento.destinatario.municipio} - {documento.destinatario.uf}</div>
              </div>
              <div className="col-span-2 p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">UF</div>
                <div className="font-bold">{documento.destinatario.uf}</div>
              </div>
              <div className="col-span-3 p-1">
                <div className="text-slate-500 font-semibold">INSCRIÇÃO ESTADUAL</div>
                <div className="font-mono font-bold">{documento.destinatario.inscricaoEstadual || 'ISENTO'}</div>
              </div>
            </div>
            <div className="grid grid-cols-12">
              <div className="col-span-6 p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">DATA DA EMISSÃO</div>
                <div className="font-mono font-bold">{new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}</div>
              </div>
              <div className="col-span-6 p-1">
                <div className="text-slate-500 font-semibold">DATA ENTRADA / SAÍDA</div>
                <div className="font-mono font-bold">{new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Cálculo do Imposto */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase mb-0.5">CÁLCULO DO IMPOSTO</div>
          <div className="border border-black text-[9px]">
            <div className="grid grid-cols-5 border-b border-black">
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">BASE DE CÁLCULO ICMS</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorProdutos)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">VALOR DO ICMS</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.totalIcms)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">BASE DE CÁLC. ICMS S.T.</div>
                <div className="font-mono font-bold text-right">0,00</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">VALOR DO ICMS S.T.</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.totalIcmsSt)}</div>
              </div>
              <div className="p-1">
                <div className="text-slate-500 font-semibold">VALOR TOTAL PRODUTOS</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorProdutos)}</div>
              </div>
            </div>
            <div className="grid grid-cols-6">
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">VALOR DO FRETE</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorFrete)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">VALOR DO SEGURO</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorSeguro)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">DESCONTO</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorDesconto)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">OUTRAS DESPESAS</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.valorOutrasDespesas)}</div>
              </div>
              <div className="p-1 border-r border-black">
                <div className="text-slate-500 font-semibold">VALOR DO IPI</div>
                <div className="font-mono font-bold text-right">{formatMoeda(documento.totalIpi)}</div>
              </div>
              <div className="p-1 bg-slate-50">
                <div className="text-slate-700 font-extrabold">VALOR TOTAL DA NOTA</div>
                <div className="font-mono font-extrabold text-right text-[11px]">{formatMoeda(documento.valorTotalDocumento)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabela de Produtos / Serviços */}
        <div className="mb-2">
          <div className="font-bold text-[10px] uppercase mb-0.5">DADOS DOS PRODUTOS / SERVIÇOS</div>
          <div className="border border-black overflow-hidden">
            <table className="w-full text-[8.5px] border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-black font-semibold text-center uppercase">
                  <th className="p-1 border-r border-black w-8">Item</th>
                  <th className="p-1 border-r border-black w-16">Código</th>
                  <th className="p-1 border-r border-black text-left">Descrição do Produto / Serviço</th>
                  <th className="p-1 border-r border-black w-14">NCM/SH</th>
                  <th className="p-1 border-r border-black w-10">CST</th>
                  <th className="p-1 border-r border-black w-10">CFOP</th>
                  <th className="p-1 border-r border-black w-8">UN</th>
                  <th className="p-1 border-r border-black w-12">Qtd.</th>
                  <th className="p-1 border-r border-black w-16">Vlr. Unit</th>
                  <th className="p-1 border-r border-black w-16">Vlr. Total</th>
                  <th className="p-1 border-r border-black w-16">BC ICMS</th>
                  <th className="p-1 border-r border-black w-14">Vlr. ICMS</th>
                  <th className="p-1 w-10">Alíq.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black font-mono">
                {documento.itens.map((it, idx) => (
                  <tr key={it.numeroItem || idx} className="text-center">
                    <td className="p-1 border-r border-black">{it.numeroItem}</td>
                    <td className="p-1 border-r border-black">{it.codigoProduto}</td>
                    <td className="p-1 border-r border-black text-left font-sans font-medium">{it.descricao}</td>
                    <td className="p-1 border-r border-black">{it.ncm}</td>
                    <td className="p-1 border-r border-black">{it.impostos.icmsCst}</td>
                    <td className="p-1 border-r border-black">{it.cfop}</td>
                    <td className="p-1 border-r border-black">{it.uCom}</td>
                    <td className="p-1 border-r border-black">{it.qCom}</td>
                    <td className="p-1 border-r border-black text-right">{formatMoeda(it.vUnCom)}</td>
                    <td className="p-1 border-r border-black text-right font-bold">{formatMoeda(it.vProd)}</td>
                    <td className="p-1 border-r border-black text-right">{formatMoeda(it.impostos.icmsBaseCalculo)}</td>
                    <td className="p-1 border-r border-black text-right">{formatMoeda(it.impostos.icmsCalculado)}</td>
                    <td className="p-1">{it.impostos.icmsAliquota}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Dados Adicionais / Informações Complementares */}
        <div className="border border-black text-[9px] p-2 min-h-[70px]">
          <div className="font-bold uppercase text-[10px] mb-1">DADOS ADICIONAIS / INFORMAÇÕES COMPLEMENTARES</div>
          <div className="text-slate-700 leading-relaxed">
            Documento emitido por empresa optante pelo Regime Normal / Lucro Real.
            {documento.ocorrencias.length > 0 && (
              <span className="block mt-1 font-semibold text-slate-800">
                Auditoria Fiscal Digital: Documento analisado pelo Motor Tributário. Status: {documento.status}.
              </span>
            )}
            {documento.observacoes && (
              <span className="block mt-0.5">Observações: {documento.observacoes}</span>
            )}
          </div>
        </div>

        {/* Rodapé Fiscal do Sistema */}
        <div className="mt-2 text-center text-[8px] text-slate-500">
          SISTEMA DE ESCRITURAÇÃO FISCAL DIGITAL E AUDITORIA TRIBUTÁRIA • IMPRESSÃO DE DANFE • {new Date().toLocaleString('pt-BR')}
        </div>
      </div>
    </div>
  );
};
