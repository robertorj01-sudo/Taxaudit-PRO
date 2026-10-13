import React, { useState } from 'react';
import { NORMAS_CATALOGO, REGRAS_CATALOGO } from '../services/normativeDatabase';
import { Scale, Layers, Calculator, BookOpen, CheckCircle, ExternalLink, Shield } from 'lucide-react';

export const TaxRuleEngineView: React.FC = () => {
  // Simulador Tributário State
  const [simUfOrigem, setSimUfOrigem] = useState('SP');
  const [simUfDestino, setSimUfDestino] = useState('BA');
  const [simValor, setSimValor] = useState<number>(10000);
  const [simIsImportado, setSimIsImportado] = useState(false);
  const [simTemSt, setSimTemSt] = useState(false);
  const [simMva, setSimMva] = useState(45);
  const [activeTab, setActiveTab] = useState<'hierarquia' | 'regras' | 'simulador'>('regras');

  // Cálculos do simulador em tempo real
  const isInterestadual = simUfOrigem !== simUfDestino;
  const isSulSudeste = ['SP', 'RJ', 'MG', 'PR', 'SC', 'RS'].includes(simUfOrigem);
  const isNorteNordesteCoEs = [
    'AC', 'AL', 'AM', 'AP', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MS', 'MT', 'PA', 'PB', 'PE', 'PI', 'RN', 'RO', 'RR', 'SE', 'TO'
  ].includes(simUfDestino);

  let simAliquotaIcms = 18.0;
  let simNormaIcms = 'RICMS/SP (Decreto 45.490/2000)';
  let simArtigo = 'Art. 52, Inciso I';

  if (isInterestadual) {
    if (simIsImportado) {
      simAliquotaIcms = 4.0;
      simNormaIcms = 'Resolução do Senado Federal nº 13/2012';
      simArtigo = 'Art. 1º (Conteúdo Importação > 40%)';
    } else if (isSulSudeste && isNorteNordesteCoEs) {
      simAliquotaIcms = 7.0;
      simNormaIcms = 'Resolução do Senado Federal nº 22/1989';
      simArtigo = 'Art. 1º, alínea "a" (Sul/Sudeste para N/NE/CO/ES)';
    } else {
      simAliquotaIcms = 12.0;
      simNormaIcms = 'Resolução do Senado Federal nº 22/1989';
      simArtigo = 'Art. 1º, alínea "b" (Demais operações)';
    }
  }

  const simIcmsValor = (simValor * simAliquotaIcms) / 100;
  const simBaseSt = (simValor * (1 + simMva / 100));
  const simIcmsStValor = simTemSt ? Math.max(0, (simBaseSt * 0.18) - simIcmsValor) : 0;
  const simPisValor = (simValor * 1.65) / 100;
  const simCofinsValor = (simValor * 7.60) / 100;

  const formatMoeda = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div id="tax-rule-engine-view" className="space-y-6">
      {/* Top Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-emerald-600" />
            Motor de Regras Fiscais & Hierarquia das Normas
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Mecanismo desacoplado para interpretação de normas, controle de vigência e cálculo de impostos com fundamentação jurídica obrigatória.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('regras')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'regras' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Regras Parametrizadas ({REGRAS_CATALOGO.length})
          </button>
          <button
            onClick={() => setActiveTab('hierarquia')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'hierarquia' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Hierarquia Normativa ({NORMAS_CATALOGO.length})
          </button>
          <button
            onClick={() => setActiveTab('simulador')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'simulador' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Simulador Tributário
          </button>
        </div>
      </div>

      {/* TAB 1: Regras Parametrizadas */}
      {activeTab === 'regras' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              Catálogo de Regras do Motor Tributário
            </h3>
            <span className="text-[11px] text-slate-400">Versionamento ativo (sem sobreposição destrutiva)</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Código / Tributo</th>
                  <th className="py-3 px-4">Descrição da Regra</th>
                  <th className="py-3 px-4">Alíquota Padrão</th>
                  <th className="py-3 px-4">Fundamentação Normativa</th>
                  <th className="py-3 px-4">Vigência</th>
                  <th className="py-3 px-4">Confiança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {REGRAS_CATALOGO.map(reg => (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-800">{reg.codigoRegra}</div>
                      <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                        {reg.tributo}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{reg.descricao}</div>
                      <div className="text-[11px] text-slate-500">
                        Operação: {reg.tipoOperacao} • Versão {reg.versao}.0
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-800">
                      {reg.aliquotaPadrao.toFixed(2)}%
                      {reg.percentualMva && (
                        <div className="text-[10px] text-purple-700 font-sans">MVA: {reg.percentualMva}%</div>
                      )}
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-medium text-slate-800">{reg.normaFundamento.identificacao}</div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {reg.normaFundamento.artigo} {reg.normaFundamento.paragrafo ? `• ${reg.normaFundamento.paragrafo}` : ''}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      Desde {reg.vigenciaInicio}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        {reg.grauConfianca}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Hierarquia Normativa */}
      {activeTab === 'hierarquia' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-200 p-5 rounded-xl border border-slate-800">
            <h3 className="font-bold text-sm text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-emerald-400" />
              Hierarquia das Normas Tributárias no Motor Fiscal
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              O motor tributário rejeita a prevalência de norma infralegal que contrarie preceito de estatura superior:
              Constituição Federal (Nível 1) ➔ Leis Complementares (Nível 2) ➔ Leis Ordinárias (Nível 3) ➔ Decretos e Resoluções (Nível 4) ➔ Convênios CONFAZ (Nível 5) ➔ Regulamentos Estaduais RICMS (Nível 6) ➔ Instruções Normativas (Nível 7).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {NORMAS_CATALOGO.map(norma => (
              <div key={norma.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                    Nível {norma.hierarquia} • {norma.tipoNorma.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Vigência: {norma.dataInicioVigencia}</span>
                </div>
                <h4 className="font-bold text-slate-800 text-sm">{norma.identificacao}</h4>
                <div className="font-mono text-emerald-800 font-medium">
                  {norma.artigo} {norma.paragrafo ? `• ${norma.paragrafo}` : ''} {norma.inciso ? `• ${norma.inciso}` : ''}
                </div>
                <p className="text-slate-600 leading-relaxed">{norma.ementa}</p>
                {norma.linkOficial && (
                  <div className="pt-2 border-t border-slate-100 text-right">
                    <a
                      href={norma.linkOficial}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 hover:underline flex items-center justify-end gap-1 font-semibold"
                    >
                      Acessar Texto Oficial no Planalto / SEFAZ
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Simulador Tributário Interativo */}
      {activeTab === 'simulador' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controles de Parâmetros (5 colunas) */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-emerald-600" />
              Parâmetros da Operação
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-semibold text-slate-700">UF de Origem (Emitente):</label>
                <select
                  value={simUfOrigem}
                  onChange={e => setSimUfOrigem(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-medium"
                >
                  {['SP', 'RJ', 'MG', 'PR', 'SC', 'RS', 'BA', 'PE', 'CE', 'AM', 'GO'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">UF de Destino (Destinatário):</label>
                <select
                  value={simUfDestino}
                  onChange={e => setSimUfDestino(e.target.value)}
                  className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-medium"
                >
                  {['BA', 'SP', 'RJ', 'MG', 'PR', 'PE', 'CE', 'AM', 'GO', 'RS', 'DF'].map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700">Valor dos Produtos / Mercadorias (R$):</label>
              <input
                type="number"
                value={simValor}
                onChange={e => setSimValor(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-lg border border-slate-300 font-mono font-semibold"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simIsImportado}
                  onChange={e => setSimIsImportado(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700">Mercadoria Importada (Resolução Senado 13/2012 - 4%)</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simTemSt}
                  onChange={e => setSimTemSt(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="font-medium text-slate-700">Sujeito a ICMS Substituição Tributária (ST)</span>
              </label>
            </div>

            {simTemSt && (
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                <label className="font-semibold text-purple-900">Margem de Valor Agregado - MVA (%):</label>
                <input
                  type="number"
                  value={simMva}
                  onChange={e => setSimMva(Number(e.target.value))}
                  className="w-full mt-1 p-2 rounded border border-purple-300 font-mono text-xs"
                />
                <span className="text-[10px] text-purple-700 block mt-1">
                  Convênio ICMS nº 142/2018 (Cláusula 11ª)
                </span>
              </div>
            )}
          </div>

          {/* Resultado do Motor em Tempo Real (7 colunas) */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-800">Resultado do Motor Tributário</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Cálculo Instantâneo
              </span>
            </div>

            {/* Cards de Impostos Calculados */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-[11px] font-semibold text-blue-700">ICMS Próprio ({simAliquotaIcms}%)</div>
                <div className="text-lg font-extrabold text-blue-900 font-mono mt-1">{formatMoeda(simIcmsValor)}</div>
                <div className="text-[10px] text-blue-600 mt-1 font-mono">{simNormaIcms}</div>
              </div>

              {simTemSt ? (
                <div className="p-3 rounded-lg bg-purple-50 border border-purple-200">
                  <div className="text-[11px] font-semibold text-purple-700">ICMS-ST Retido</div>
                  <div className="text-lg font-extrabold text-purple-900 font-mono mt-1">{formatMoeda(simIcmsStValor)}</div>
                  <div className="text-[10px] text-purple-600 mt-1 font-mono">Base ST: {formatMoeda(simBaseSt)}</div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="text-[11px] font-semibold text-slate-500">ICMS-ST</div>
                  <div className="text-lg font-extrabold text-slate-400 font-mono mt-1">Não Aplicável</div>
                  <div className="text-[10px] text-slate-400 mt-1">Operação sem retenção na fonte</div>
                </div>
              )}

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-semibold text-amber-800">PIS (1,65% Lucro Real)</div>
                <div className="text-lg font-extrabold text-amber-900 font-mono mt-1">{formatMoeda(simPisValor)}</div>
                <div className="text-[10px] text-amber-700 mt-1">Lei nº 10.637/2002</div>
              </div>

              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200">
                <div className="text-[11px] font-semibold text-amber-800">COFINS (7,60% Lucro Real)</div>
                <div className="text-lg font-extrabold text-amber-900 font-mono mt-1">{formatMoeda(simCofinsValor)}</div>
                <div className="text-[10px] text-amber-700 mt-1">Lei nº 10.833/2003</div>
              </div>
            </div>

            {/* Fundamentação Normativa Detalhada */}
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                Fundamentação Jurídico-Normativa Aplicada
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                A saída de mercadoria da UF <strong>{simUfOrigem}</strong> com destino a <strong>{simUfDestino}</strong>{' '}
                {isInterestadual ? (
                  <>
                    constitui operação <strong>interestadual</strong>. Com amparo no artigo 155, § 2º, IV da Constituição Federal de 1988 e na{' '}
                    <strong>{simNormaIcms}</strong> ({simArtigo}), a operação sujeita-se à alíquota de <strong>{simAliquotaIcms}%</strong>.
                  </>
                ) : (
                  <>
                    constitui operação <strong>interna</strong>, regida pelo regulamento estadual ({simNormaIcms}), incidindo a alíquota padrão modal de 18%.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
