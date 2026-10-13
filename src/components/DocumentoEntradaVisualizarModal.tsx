import React, { useState } from 'react';
import {
  FileText,
  X,
  Printer,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  DollarSign,
  Maximize2,
  Minimize2,
  ArrowRight
} from 'lucide-react';
import { DocumentoFiscal, ItemDocumentoFiscal } from '../types/fiscal';

interface DocumentoEntradaVisualizarModalProps {
  documento: DocumentoFiscal;
  onClose: () => void;
  onPrintDanfe?: (doc: DocumentoFiscal) => void;
}

export const DocumentoEntradaVisualizarModal: React.FC<DocumentoEntradaVisualizarModalProps> = ({
  documento,
  onClose,
  onPrintDanfe
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fullscreen, setFullscreen] = useState(false);

  // Formatação de valores monetários
  const formatMoeda = (val: number | undefined) => {
    return (val || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Formatação de quantidade com até 4 casas
  const formatQtd = (val: number | undefined) => {
    return (val || 0).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    });
  };

  // Formatação de alíquotas com %
  const formatAliq = (val: number | undefined) => {
    if (val === undefined || val === null || val === 0) return '0,00%';
    return `${val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
  };

  // Determinar espécie do documento com base no tipo
  const especieDocumento = (() => {
    if (documento.tipoDocumento === 'CTE') return 'CTE (Mod 57)';
    if (documento.tipoDocumento === 'NFCOM') return 'NFCOM (Mod 62)';
    if (documento.tipoDocumento === 'NF3E') return 'NF3E (Mod 66)';
    if (documento.tipoDocumento === 'NFSE') return 'NFSE';
    if (documento.tipoDocumento === 'NFCE') return 'NFC-E (Mod 65)';
    return 'NFE (Mod 55)';
  })();

  const modeloDoc = (() => {
    if (documento.tipoDocumento === 'CTE') return '57';
    if (documento.tipoDocumento === 'NFCOM') return '62';
    if (documento.tipoDocumento === 'NF3E') return '66';
    if (documento.tipoDocumento === 'NFCE') return '65';
    return '55';
  })();

  // Filtragem dos itens de produtos
  const itensFiltrados = documento.itens.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      item.descricao.toLowerCase().includes(term) ||
      item.codigoProduto.toLowerCase().includes(term) ||
      item.ncm.toLowerCase().includes(term) ||
      item.cfop.toLowerCase().includes(term)
    );
  });

  return (
    <div
      id="modal-documento-entrada-visualizar"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl flex flex-col border border-slate-300 overflow-hidden transition-all duration-200 ${
          fullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-7xl max-h-[94vh]'
        }`}
      >
        {/* BARRA DE TÍTULO PRINCIPAL ESTILO SISTEMA ERP / GEPAT */}
        <div className="bg-[#242424] text-white px-4 py-2.5 flex items-center justify-between select-none shrink-0 border-b border-black">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs tracking-wide">
              Documento de Entrada - VISUALIZAR
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFullscreen(!fullscreen)}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-white/10 transition"
              title={fullscreen ? 'Restaurar tamanho' : 'Maximizar'}
            >
              {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-300 hover:text-white rounded hover:bg-rose-600 transition"
              title="Fechar (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SUB-CABEÇALHO AZUL COM TEXTO 'Documento de Entrada - VISUALIZAR' */}
        <div className="bg-white px-5 pt-3 pb-1 border-b border-slate-200">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-[#0275d8] text-lg font-normal tracking-tight flex items-center gap-2">
              <span>Documento de Entrada - VISUALIZAR</span>
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                Chave: {documento.chaveAcesso}
              </span>
              {onPrintDanfe && (
                <button
                  onClick={() => onPrintDanfe(documento)}
                  className="px-2.5 py-1 text-xs font-semibold rounded bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1 transition"
                  title="Imprimir DANFE / DACTE em PDF"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Imprimir DANFE</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* CABEÇALHO COM OS CAMPOS DO FORMULÁRIO (Exatamente como na imagem de referência) */}
        <div className="bg-[#fcfcfc] p-4 border-b border-slate-300 text-xs shrink-0 select-text">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-x-4 gap-y-3">
            {/* Tipo da Nota */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Tipo da Nota</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded text-slate-800 font-medium">
                <span>{documento.naturezaOperacao.toLowerCase().includes('devoluc') ? 'Devolução' : 'Normal'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            {/* Tipo Compl. */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Tipo Compl.</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded text-slate-600">
                <span>{documento.finalidade === '4' ? 'Devolução' : '-'}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            {/* Form. Prop. */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Form. Prop.</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded text-slate-800 font-medium">
                <span>Não</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            {/* Número da Nota */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-800">Número da Nota Fiscal</label>
              <div className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-slate-900 font-mono shadow-2xs">
                {documento.numero}
              </div>
            </div>

            {/* Série */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Série</label>
              <div className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-mono text-slate-800">
                {documento.serie || '1'}
              </div>
            </div>

            {/* Modelo */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Modelo</label>
              <div className="px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded font-mono font-bold text-slate-800">
                {modeloDoc} ({documento.tipoDocumento})
              </div>
            </div>

            {/* DT Emissão */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold text-slate-800">DT Emissão</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 font-mono">
                <span>{new Date(documento.dataEmissao).toLocaleDateString('pt-BR')}</span>
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
              </div>
            </div>

            {/* Fornecedor / Razão Social */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-800">Razão Social do Fornecedor</label>
              <div className="flex items-center gap-1">
                <div className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-bold truncate">
                  {documento.emitente.razaoSocial}
                </div>
                <div className="px-2 py-1.5 bg-[#e9ecef] border border-slate-300 rounded text-[10px] font-mono text-slate-600 shrink-0">
                  {documento.emitente.codigoInterno || 'P02803'}
                </div>
              </div>
            </div>

            {/* CNPJ Emitente */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-slate-800">CNPJ do Emitente</label>
              <div className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-900 font-mono font-semibold">
                {documento.emitente.cnpjCpf}
              </div>
            </div>

            {/* Espécie do Documento */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Espéc. Docum.</label>
              <div className="flex items-center justify-between px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded font-mono font-semibold text-slate-800">
                <span>{especieDocumento}</span>
                <Search className="w-3 h-3 text-slate-500" />
              </div>
            </div>

            {/* UF de Origem */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">UF de Origem</label>
              <div className="px-2.5 py-1.5 bg-white border border-slate-300 rounded font-bold text-blue-700 font-mono text-center">
                {documento.emitente.uf}
              </div>
            </div>

            {/* Tipo de Emissão */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-medium text-slate-700">Tipo de Emissão</label>
              <div className="px-2.5 py-1.5 bg-[#e9ecef] border border-slate-300 rounded text-slate-700">
                1 - Normal SEFAZ
              </div>
            </div>

            {/* Valor Total do Documento */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-semibold text-emerald-800">Valor Total do Documento</label>
              <div className="px-2.5 py-1.5 bg-emerald-50 border border-emerald-300 rounded font-bold text-emerald-900 font-mono text-base">
                R$ {formatMoeda(documento.valorTotalDocumento)}
              </div>
            </div>

            {/* Destinatário */}
            <div className="flex flex-col gap-1 sm:col-span-2">
              <label className="text-[11px] font-medium text-slate-700">Destinatário</label>
              <div className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-slate-800 truncate">
                {documento.destinatario.razaoSocial} ({documento.destinatario.uf})
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE FERRAMENTAS / FILTROS DOS ITENS */}
        <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-bold text-xs text-slate-800 uppercase tracking-wide">
              Itens da Nota Fiscal ({itensFiltrados.length} de {documento.itens.length})
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Filtrar por código, descrição, NCM ou CFOP..."
                className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded text-xs text-slate-800 focus:outline-none focus:border-blue-500 w-64"
              />
            </div>
          </div>
        </div>

        {/* TABELA DE PRODUTOS / LINHA DE PRODUTOS COM TODAS AS COLUNAS SOLICITADAS */}
        <div className="flex-1 overflow-auto bg-white select-text">
          <table className="w-full border-collapse text-[11px] text-slate-800 whitespace-nowrap">
            <thead className="bg-[#f0f2f5] sticky top-0 z-10 border-b border-slate-300 text-slate-700 font-semibold shadow-2xs">
              <tr className="divide-x divide-slate-200">
                <th className="py-2 px-2 text-center bg-slate-200/80 w-12">Item NF</th>
                <th className="py-2 px-2.5 text-left">Produto</th>
                <th className="py-2 px-3 text-left min-w-[200px]">Desc Prod</th>
                <th className="py-2 px-2 text-center">Unidade</th>
                <th className="py-2 px-2 text-right">Quantidade</th>
                <th className="py-2 px-2.5 text-right">Preço (Vlr.Unit)</th>
                <th className="py-2 px-2.5 text-right font-bold bg-slate-100">Valor Total</th>

                {/* Tributos Principais ICMS e IPI */}
                <th className="py-2 px-2 text-right bg-blue-50/60">Alíq. ICMS</th>
                <th className="py-2 px-2.5 text-right bg-blue-50/80">Valor ICMS</th>
                <th className="py-2 px-2 text-right bg-amber-50/60">Alíq. IPI</th>
                <th className="py-2 px-2.5 text-right bg-amber-50/80">Valor IPI</th>

                {/* Reforma Tributária IBS e CBS (LC 214/2025) */}
                <th className="py-2 px-2 text-right bg-emerald-50/60">Alíq. IBS</th>
                <th className="py-2 px-2.5 text-right bg-emerald-50/80">Valor IBS</th>
                <th className="py-2 px-2 text-right bg-teal-50/60">Alíq. CBS</th>
                <th className="py-2 px-2.5 text-right bg-teal-50/80">Valor CBS</th>

                {/* Tributos Federais e Retenções: PIS, COFINS, IR e CSLL */}
                <th className="py-2 px-2 text-right bg-indigo-50/60">Alíq. PIS</th>
                <th className="py-2 px-2.5 text-right bg-indigo-50/80">Valor PIS</th>
                <th className="py-2 px-2 text-right bg-purple-50/60">Alíq. COFINS</th>
                <th className="py-2 px-2.5 text-right bg-purple-50/80">Valor COFINS</th>
                <th className="py-2 px-2 text-right bg-rose-50/60">Alíq. IR</th>
                <th className="py-2 px-2.5 text-right bg-rose-50/80">Valor IR</th>
                <th className="py-2 px-2 text-right bg-amber-100/60">Alíq. CSLL</th>
                <th className="py-2 px-2.5 text-right bg-amber-100/80">Valor CSLL</th>

                {/* Classificações Fiscais: NCM, CFOP e CST */}
                <th className="py-2 px-2.5 text-center font-mono">Código NCM</th>
                <th className="py-2 px-2 text-center font-mono font-bold text-blue-800">Código CFOP</th>
                <th className="py-2 px-2 text-center font-mono font-bold text-purple-800">CST</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono">
              {itensFiltrados.map((item, index) => {
                const itemNum = String(item.numeroItem || index + 1).padStart(4, '0');
                const imp = item.impostos;
                const cstPrincipal = imp?.icmsCst || imp?.pisCst || '00';

                return (
                  <tr
                    key={item.numeroItem || index}
                    className="hover:bg-blue-50/40 transition-colors divide-x divide-slate-100"
                  >
                    {/* Item NF */}
                    <td className="py-1.5 px-2 text-center font-bold text-slate-700 bg-slate-50/60">
                      {itemNum}
                    </td>

                    {/* Produto (Código) */}
                    <td className="py-1.5 px-2.5 text-slate-900 font-semibold">
                      {item.codigoProduto}
                    </td>

                    {/* Desc Prod */}
                    <td className="py-1.5 px-3 font-sans text-slate-800 max-w-xs truncate" title={item.descricao}>
                      {item.descricao}
                    </td>

                    {/* Unidade */}
                    <td className="py-1.5 px-2 text-center font-semibold text-slate-700">
                      {item.uCom || item.unidadeComercial || 'UN'}
                    </td>

                    {/* Quantidade */}
                    <td className="py-1.5 px-2 text-right text-slate-800">
                      {formatQtd(item.qCom || item.quantidade)}
                    </td>

                    {/* Preço (Vlr.Unitário) */}
                    <td className="py-1.5 px-2.5 text-right text-slate-800">
                      {formatMoeda(item.vUnCom || item.valorUnitario)}
                    </td>

                    {/* Valor Total */}
                    <td className="py-1.5 px-2.5 text-right font-bold text-slate-900 bg-slate-50/80">
                      {formatMoeda(item.vProd || item.valorTotal)}
                    </td>

                    {/* Alíquota ICMS */}
                    <td className="py-1.5 px-2 text-right text-blue-900 bg-blue-50/30 font-medium">
                      {formatAliq(imp?.icmsAliquota)}
                    </td>

                    {/* Valor ICMS */}
                    <td className="py-1.5 px-2.5 text-right text-blue-950 bg-blue-50/50 font-semibold">
                      {formatMoeda(imp?.icmsValor)}
                    </td>

                    {/* Alíquota IPI */}
                    <td className="py-1.5 px-2 text-right text-amber-900 bg-amber-50/30">
                      {formatAliq(imp?.ipiAliquota)}
                    </td>

                    {/* Valor IPI */}
                    <td className="py-1.5 px-2.5 text-right text-amber-950 bg-amber-50/50 font-semibold">
                      {formatMoeda(imp?.ipiValor)}
                    </td>

                    {/* Alíquota IBS (LC 214) */}
                    <td className="py-1.5 px-2 text-right text-emerald-800 bg-emerald-50/30">
                      {formatAliq(imp?.ibsAliquota || 0.1)}
                    </td>

                    {/* Valor IBS */}
                    <td className="py-1.5 px-2.5 text-right text-emerald-950 bg-emerald-50/50 font-semibold">
                      {formatMoeda(imp?.ibsValor)}
                    </td>

                    {/* Alíquota CBS (LC 214) */}
                    <td className="py-1.5 px-2 text-right text-teal-800 bg-teal-50/30">
                      {formatAliq(imp?.cbsAliquota || 0.9)}
                    </td>

                    {/* Valor CBS */}
                    <td className="py-1.5 px-2.5 text-right text-teal-950 bg-teal-50/50 font-semibold">
                      {formatMoeda(imp?.cbsValor)}
                    </td>

                    {/* Alíquota PIS */}
                    <td className="py-1.5 px-2 text-right text-indigo-900 bg-indigo-50/30">
                      {formatAliq(imp?.pisAliquota)}
                    </td>

                    {/* Valor PIS */}
                    <td className="py-1.5 px-2.5 text-right text-indigo-950 bg-indigo-50/50 font-semibold">
                      {formatMoeda(imp?.pisValor)}
                    </td>

                    {/* Alíquota COFINS */}
                    <td className="py-1.5 px-2 text-right text-purple-900 bg-purple-50/30">
                      {formatAliq(imp?.cofinsAliquota)}
                    </td>

                    {/* Valor COFINS */}
                    <td className="py-1.5 px-2.5 text-right text-purple-950 bg-purple-50/50 font-semibold">
                      {formatMoeda(imp?.cofinsValor)}
                    </td>

                    {/* Alíquota IR (Retenção) */}
                    <td className="py-1.5 px-2 text-right text-rose-900 bg-rose-50/30">
                      {formatAliq(imp?.irAliquota)}
                    </td>

                    {/* Valor IR */}
                    <td className="py-1.5 px-2.5 text-right text-rose-950 bg-rose-50/50 font-semibold">
                      {formatMoeda(imp?.irValor)}
                    </td>

                    {/* Alíquota CSLL (Retenção) */}
                    <td className="py-1.5 px-2 text-right text-amber-900 bg-amber-100/30">
                      {formatAliq(imp?.csllAliquota)}
                    </td>

                    {/* Valor CSLL */}
                    <td className="py-1.5 px-2.5 text-right text-amber-950 bg-amber-100/50 font-semibold">
                      {formatMoeda(imp?.csllValor)}
                    </td>

                    {/* Código NCM */}
                    <td className="py-1.5 px-2.5 text-center text-slate-800">
                      {item.ncm}
                    </td>

                    {/* Código CFOP */}
                    <td className="py-1.5 px-2 text-center font-bold text-blue-700 bg-blue-50/20">
                      {item.cfop}
                    </td>

                    {/* CST */}
                    <td className="py-1.5 px-2 text-center font-bold text-purple-700 bg-purple-50/20">
                      {cstPrincipal}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* RODAPÉ DO DOCUMENTO COM TOTAIS CONSOLIDADOS */}
        <div className="bg-[#f0f2f5] border-t border-slate-300 px-4 py-2.5 flex items-center justify-between text-xs shrink-0 select-text flex-wrap gap-2">
          <div className="flex items-center gap-4 text-slate-600 font-mono text-[11px]">
            <div>Total de Itens: <strong className="text-slate-900">{documento.itens.length}</strong></div>
            <div>•</div>
            <div>ICMS: <strong className="text-blue-900">R$ {formatMoeda(documento.totalIcms)}</strong></div>
            <div>•</div>
            <div>IPI: <strong className="text-amber-900">R$ {formatMoeda(documento.totalIpi)}</strong></div>
            <div>•</div>
            <div>PIS: <strong className="text-indigo-900">R$ {formatMoeda(documento.totalPis)}</strong></div>
            <div>•</div>
            <div>COFINS: <strong className="text-purple-900">R$ {formatMoeda(documento.totalCofins)}</strong></div>
            <div>•</div>
            <div>IBS/CBS (LC 214): <strong className="text-emerald-900">R$ {formatMoeda((documento.totalIbs || 0) + (documento.totalCbs || 0))}</strong></div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Geral da Nota: </span>
              <strong className="text-sm font-mono text-emerald-800 ml-1">
                R$ {formatMoeda(documento.valorTotalDocumento)}
              </strong>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded font-medium text-xs transition"
            >
              Fechar Visualização
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
