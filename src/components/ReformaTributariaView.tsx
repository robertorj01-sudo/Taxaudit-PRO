import React, { useState, useMemo } from 'react';
import { DocumentoFiscal } from '../types/fiscal';
import {
  TrendingUp,
  Calculator,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Layers,
  FileCheck,
  Zap,
  Radio,
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertCircle,
  HelpCircle
} from 'lucide-react';

interface ReformaTributariaViewProps {
  documentos?: DocumentoFiscal[];
  onSelectDoc?: (docId: string) => void;
  onNavigate?: (tab: any) => void;
}

export const ReformaTributariaView: React.FC<ReformaTributariaViewProps> = ({
  documentos = [],
  onSelectDoc,
  onNavigate
}) => {
  const [valorOperacao, setValorOperacao] = useState<number>(50000);
  const [aliquotaIbsPrevista, setAliquotaIbsPrevista] = useState<number>(17.7);
  const [aliquotaCbsPrevista, setAliquotaCbsPrevista] = useState<number>(8.8);
  const [aliquotaIsPrevista, setAliquotaIsPrevista] = useState<number>(0);
  const [anoTransicao, setAnoTransicao] = useState<number>(2026);

  // Cálculos consolidados sobre os documentos reais da carteira
  const metricasCarteira = useMemo(() => {
    let totalBaseCalculo = 0;
    let totalIbs = 0;
    let totalCbs = 0;
    let totalCreditosIbsCbs = 0;
    let docsComIbsCbs = 0;

    documentos.forEach(doc => {
      totalBaseCalculo += doc.valorTotalProdutos;
      totalIbs += (doc.totalIbs || 0);
      totalCbs += (doc.totalCbs || 0);
      totalCreditosIbsCbs += (doc.totalCreditosIbsCbs || 0);
      if ((doc.totalIbs || 0) > 0 || (doc.totalCbs || 0) > 0) {
        docsComIbsCbs++;
      }
    });

    return {
      totalBaseCalculo,
      totalIbs,
      totalCbs,
      totalCreditosIbsCbs,
      docsComIbsCbs
    };
  }, [documentos]);

  // Sistema Atual no simulador
  const icmsAtual = valorOperacao * 0.18;
  const pisAtual = valorOperacao * 0.0165;
  const cofinsAtual = valorOperacao * 0.076;
  const ipiAtual = valorOperacao * 0.05;
  const totalAtual = icmsAtual + pisAtual + cofinsAtual + ipiAtual;

  // Novo Sistema (LC 214/2025 & EC 132/2023)
  let cbsEfetiva = 0;
  let ibsEfetivo = 0;

  if (anoTransicao === 2026) {
    // 2026: Ano de teste - CBS 0,9% e IBS 0,1% compensáveis com PIS/COFINS (Art. 343 da LC 214/2025)
    cbsEfetiva = valorOperacao * 0.009;
    ibsEfetivo = valorOperacao * 0.001;
  } else if (anoTransicao === 2027 || anoTransicao === 2028) {
    // 2027+: Extinção PIS/COFINS, CBS plena
    cbsEfetiva = (valorOperacao * aliquotaCbsPrevista) / 100;
    ibsEfetivo = valorOperacao * 0.001;
  } else {
    // 2029-2033: Transição ICMS/ISS para IBS
    cbsEfetiva = (valorOperacao * aliquotaCbsPrevista) / 100;
    ibsEfetivo = (valorOperacao * aliquotaIbsPrevista) / 100;
  }

  const isEfetivo = (valorOperacao * aliquotaIsPrevista) / 100;
  const totalNovo = cbsEfetiva + ibsEfetivo + isEfetivo;
  const diferenca = totalNovo - totalAtual;

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="reforma-tributaria-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white uppercase tracking-wider">
              LC nº 214/2025
            </span>
            <span className="text-xs font-semibold text-slate-500">
              Presidência da República • Publicada em 16/01/2025
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2 mt-1">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Leitura & Apuração de IBS e CBS (Lei Complementar nº 214/2025)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-3xl">
            Mecanismo inteligente de extração, auditoria e cálculo do Imposto sobre Bens e Serviços (IBS) e Contribuição sobre Bens e Serviços (CBS) para a empresa adquirente, com suporte à fase de teste de 2026 e apropriação de créditos da não-cumulatividade plena (Art. 28).
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <a
            href="https://www.planalto.gov.br/ccivil_03/leis/lcp/lcp214.htm"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex items-center gap-1.5 border border-slate-200"
          >
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
            Texto Integral no Planalto
          </a>
          <div className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Motor Fiscal Atualizado
          </div>
        </div>
      </div>

      {/* Métricas dos Documentos Fiscais em Carteira */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Base de Cálculo Total</span>
          <p className="text-2xl font-extrabold text-slate-800 mt-1">
            {formatMoeda(metricasCarteira.totalBaseCalculo)}
          </p>
          <div className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100 flex justify-between">
            <span>Documentos na Carteira:</span>
            <span className="font-semibold text-slate-700">{documentos.length} NFs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-teal-200 bg-teal-50/20 shadow-sm">
          <span className="text-xs font-semibold text-teal-800 uppercase tracking-wider">IBS Apurado (0,10%)</span>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">
            {formatMoeda(metricasCarteira.totalIbs)}
          </p>
          <div className="text-[11px] text-teal-900 mt-2 pt-2 border-t border-teal-100 flex justify-between">
            <span>Art. 343 da LC 214/25:</span>
            <span className="font-semibold">Transição Estadual/Mun.</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-sm">
          <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">CBS Apurada (0,90%)</span>
          <p className="text-2xl font-extrabold text-blue-700 mt-1">
            {formatMoeda(metricasCarteira.totalCbs)}
          </p>
          <div className="text-[11px] text-blue-900 mt-2 pt-2 border-t border-blue-100 flex justify-between">
            <span>Art. 343 da LC 214/25:</span>
            <span className="font-semibold">Transição Federal</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 shadow-sm">
          <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Créditos Admissíveis</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">
            {formatMoeda(metricasCarteira.totalCreditosIbsCbs)}
          </p>
          <div className="text-[11px] text-emerald-900 mt-2 pt-2 border-t border-emerald-100 flex justify-between">
            <span>Art. 28 da LC 214/25:</span>
            <span className="font-semibold">Não-Cumulatividade Plena</span>
          </div>
        </div>
      </div>

      {/* Tabela de Documentos Fiscais com Leitura de IBS/CBS */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              Documentos Fiscais Processados sob a LC 214/2025
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valores apurados item a item com alíquotas de transição e regras de crédito da não-cumulatividade plena.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {documentos.length} documento{documentos.length !== 1 ? 's' : ''} auditado{documentos.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
                <th className="py-2.5 px-3">Documento</th>
                <th className="py-2.5 px-3">Emitente</th>
                <th className="py-2.5 px-3">Natureza da Operação</th>
                <th className="py-2.5 px-3">Valor NF</th>
                <th className="py-2.5 px-3">IBS (0,10%)</th>
                <th className="py-2.5 px-3">CBS (0,90%)</th>
                <th className="py-2.5 px-3">Crédito Admissível</th>
                <th className="py-2.5 px-3">Regime LC 214/2025</th>
                <th className="py-2.5 px-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {documentos.map(doc => {
                const isNfcom = doc.modelo === '62' || doc.tipoDocumento === 'NFCOM';
                const isNf3e = doc.modelo === '66' || doc.tipoDocumento === 'NF3E';
                return (
                  <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-sans">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        {isNfcom && <Radio className="w-3.5 h-3.5 text-cyan-600" />}
                        {isNf3e && <Zap className="w-3.5 h-3.5 text-amber-500" />}
                        <span>{isNfcom ? 'NFCom' : isNf3e ? 'NF3e' : 'NF-e'} {doc.numero}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Mod. {isNfcom ? '62' : isNf3e ? '66' : '55'} • Série {doc.serie}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-semibold text-slate-800 max-w-[170px] truncate">
                        {doc.emitente.razaoSocial}
                      </div>
                      <div className="text-[10px] text-slate-500">{doc.emitente.uf} ➔ {doc.destinatario.uf}</div>
                    </td>

                    <td className="py-3 px-3 font-sans text-slate-700 max-w-[150px] truncate">
                      {doc.naturezaOperacao}
                    </td>

                    <td className="py-3 px-3 font-bold text-slate-900">
                      {formatMoeda(doc.valorTotalDocumento)}
                    </td>

                    <td className="py-3 px-3 font-semibold text-teal-700">
                      {formatMoeda(doc.totalIbs || 0)}
                    </td>

                    <td className="py-3 px-3 font-semibold text-blue-700">
                      {formatMoeda(doc.totalCbs || 0)}
                    </td>

                    <td className="py-3 px-3 font-bold text-emerald-700">
                      {formatMoeda(doc.totalCreditosIbsCbs || 0)}
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3 h-3" />
                        {doc.reformaTributariaLC214?.faseTransicao || 'Teste 2026'}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-sans text-right">
                      <button
                        onClick={() => {
                          if (onSelectDoc && onNavigate) {
                            onSelectDoc(doc.id);
                            onNavigate('auditoria');
                          }
                        }}
                        className="px-2 py-1 text-xs font-semibold rounded bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 transition"
                      >
                        Inspecionar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fundamentação Normativa da LC 214/2025 para a Empresa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Art. 343 — Alíquotas de Teste (2026)
          </div>
          <p className="text-slate-600 leading-relaxed">
            No ano-calendário de 2026, as alíquotas do IBS e da CBS serão fixadas em 0,10% e 0,90% respectivamente. Os valores recolhidos a título de CBS e IBS poderão ser integralmente compensados com os débitos devidos de PIS e COFINS.
          </p>
          <div className="text-[10px] text-emerald-700 font-semibold pt-1">
            Garante transição segura sem aumento prematuro de carga tributária.
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Art. 28 — Não-Cumulatividade Plena
          </div>
          <p className="text-slate-600 leading-relaxed">
            O sujeito passivo poderá se apropriar de créditos do IBS e da CBS em relação às operações de aquisição de bens materiais, imateriais e serviços utilizados na sua atividade econômica, inclusive energia elétrica fornecida ao estabelecimento.
          </p>
          <div className="text-[10px] text-blue-700 font-semibold pt-1">
            Supera as restrições históricas de insumos do ICMS e PIS/COFINS.
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="font-bold text-slate-800 flex items-center gap-1.5 text-sm">
            <span className="w-2 h-2 rounded-full bg-purple-500" />
            Art. 8º — Princípio do Destino
          </div>
          <p className="text-slate-600 leading-relaxed">
            O IBS e a CBS pertencem ao Estado e Município de destino da mercadoria ou da prestação de serviço, extinguindo a guerra fiscal e as complexidades de diferencial de alíquotas (DIFAL) e partilhas estaduais.
          </p>
          <div className="text-[10px] text-purple-700 font-semibold pt-1">
            Tributação definitiva alocada no local do consumo efetivo.
          </div>
        </div>
      </div>

      {/* Cronograma Oficial de Transição (2026 - 2033) */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
        <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          Cronograma Constitucional da Transição Tributária (LC nº 214/2025)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div
            onClick={() => setAnoTransicao(2026)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              anoTransicao === 2026
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Ano 2026</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border font-bold text-emerald-700">Vigência Inicial</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              CBS 0,90% e IBS 0,10%. Fase de adaptação e compensação com PIS/COFINS (Art. 343).
            </p>
          </div>

          <div
            onClick={() => setAnoTransicao(2027)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              anoTransicao === 2027
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Anos 2027 - 2028</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">CBS Plena</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Extinção definitiva de PIS e COFINS. Alíquotas de IPI zeradas (exceto ZFM).
            </p>
          </div>

          <div
            onClick={() => setAnoTransicao(2029)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              anoTransicao === 2029
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Anos 2029 - 2032</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">Transição ICMS/ISS</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Redução gradativa de 1/10 ao ano de ICMS e ISS, com aumento proporcional do IBS.
            </p>
          </div>

          <div
            onClick={() => setAnoTransicao(2033)}
            className={`p-3 rounded-lg border cursor-pointer transition ${
              anoTransicao === 2033
                ? 'bg-emerald-50 border-emerald-600 text-emerald-950 font-medium shadow-xs'
                : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>Ano 2033 em diante</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-white border">Vigência Integral</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Extinção total do ICMS e ISS. Sistema 100% no IBS/CBS e princípio do destino.
            </p>
          </div>
        </div>
      </div>

      {/* Simulador Comparativo de Carga Tributária */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Painel de Parâmetros (4 colunas) */}
        <div className="lg:col-span-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-emerald-600" />
            Simulador de Carga Tributária Empresarial
          </h3>

          <div>
            <label className="font-semibold text-slate-700">Faturamento da Operação (R$):</label>
            <input
              type="number"
              value={valorOperacao}
              onChange={e => setValorOperacao(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-semibold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Alíquota CBS Estimada (%):</label>
            <input
              type="number"
              step="0.1"
              value={aliquotaCbsPrevista}
              onChange={e => setAliquotaCbsPrevista(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Alíquota IBS Estimada (%):</label>
            <input
              type="number"
              step="0.1"
              value={aliquotaIbsPrevista}
              onChange={e => setAliquotaIbsPrevista(Number(e.target.value))}
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700">Imposto Seletivo - IS (%):</label>
            <input
              type="number"
              step="0.5"
              value={aliquotaIsPrevista}
              onChange={e => setAliquotaIsPrevista(Number(e.target.value))}
              placeholder="0% para bens não prejudiciais à saúde/meio ambiente"
              className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono"
            />
          </div>
        </div>

        {/* Confronto: Sistema Atual vs Novo Sistema (8 colunas) */}
        <div className="lg:col-span-8 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-5 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-sm text-slate-800">
              Confronto Tributário — Cenário {anoTransicao}
            </h3>
            <span className="font-mono text-slate-500">Operação Base: {formatMoeda(valorOperacao)}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Coluna 1: Sistema Atual */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 font-bold text-slate-800">
                <span>Modelo Atual (Cumulativo / Misto)</span>
                <span className="font-mono text-slate-600">{formatMoeda(totalAtual)}</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">ICMS (18%):</span>
                  <span>{formatMoeda(icmsAtual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">PIS (1,65%):</span>
                  <span>{formatMoeda(pisAtual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">COFINS (7,60%):</span>
                  <span>{formatMoeda(cofinsAtual)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">IPI (5,00%):</span>
                  <span>{formatMoeda(ipiAtual)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-200 text-[10px] text-slate-400">
                Créditos restritos e cumulatividade parcial.
              </div>
            </div>

            {/* Coluna 2: Novo Sistema */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-emerald-200 font-bold text-emerald-950">
                <span>Novo Modelo (LC 214/2025 - IVA Dual)</span>
                <span className="font-mono text-emerald-800">{formatMoeda(totalNovo)}</span>
              </div>
              <div className="space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="text-emerald-800">CBS (Federal):</span>
                  <span className="font-semibold">{formatMoeda(cbsEfetiva)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800">IBS (Subnacional):</span>
                  <span className="font-semibold">{formatMoeda(ibsEfetivo)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-emerald-800">Imposto Seletivo (IS):</span>
                  <span className="font-semibold">{formatMoeda(isEfetivo)}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-200 text-[10px] text-emerald-700">
                Crédito financeiro amplo imediato (não cumulatividade plena no destino - Art. 28).
              </div>
            </div>
          </div>

          {/* Destaque da Variação de Carga */}
          <div className="p-3 rounded-lg bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Diferença Nominal Estimada na Operação:</span>
            </div>
            <span className={`font-mono font-bold text-sm ${diferenca > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {diferenca > 0 ? `+${formatMoeda(diferenca)}` : formatMoeda(diferenca)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
