import React, { useState } from 'react';
import {
  FileText,
  Database,
  Layers,
  Shield,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Code,
  Terminal,
  Server,
  BookOpen
} from 'lucide-react';

export const ArchitectureDocsView: React.FC = () => {
  const [selectedSection, setSelectedSection] = useState<string>('arquitetura');

  const secoes = [
    { id: 'arquitetura', label: '1. Arquitetura da Solução', icon: Layers },
    { id: 'modelo-dados', label: '2. Modelo de Dados & Entidades', icon: Database },
    { id: 'fluxo', label: '3. Fluxo de Processamento', icon: Activity },
    { id: 'motor', label: '4. Motor de Regras Desacoplado', icon: Shield },
    { id: 'apis', label: '5. Especificação de APIs', icon: Server },
    { id: 'fases', label: '6. Plano de Fases (1 a 7)', icon: CheckCircle2 },
    { id: 'riscos', label: '7. Matriz de Riscos Fiscais', icon: AlertTriangle }
  ];

  return (
    <div id="architecture-docs-view" className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Especificação Técnica & Arquitetura do Sistema Fiscal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Detalhamento formal dos 10 pilares de engenharia de software, conformidade jurídica e integração com ERPs.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Navigation Sidebar (3 colunas) */}
        <div className="lg:col-span-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm space-y-1 text-xs">
          {secoes.map(sec => {
            const Icon = sec.icon;
            const isSelected = selectedSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setSelectedSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left font-medium transition ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Viewer (9 colunas) */}
        <div className="lg:col-span-9 bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs text-slate-700 leading-relaxed">
          {/* 1. Arquitetura da Solução */}
          {selectedSection === 'arquitetura' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                1. Arquitetura Completa da Solução
              </h3>
              <p>
                O sistema foi concebido sob o paradigma de <strong>Arquitetura Hexagonal (Ports & Adapters)</strong> com separação estrita de responsabilidades:
              </p>
              <div className="p-4 bg-slate-900 text-slate-200 rounded-xl font-mono text-xs space-y-2 border border-slate-800">
                <div className="text-emerald-400 font-bold">[Camada de Apresentação / UI]</div>
                <div>React 18 + Vite + Tailwind CSS + Lucide Icons</div>
                <div className="text-emerald-400 font-bold mt-2">[Camada de Aplicação / Gateways]</div>
                <div>XmlFiscalParser ➔ TaxRuleEngine ➔ SpedFiscalGenerator ➔ ProtheusConnector</div>
                <div className="text-emerald-400 font-bold mt-2">[Núcleo de Regras de Negócio & Direito Tributário]</div>
                <div>Hierarquia Normativa (CF/88, LC 87/96, Convênios CONFAZ, RICMS Estaduais, INs RFB)</div>
                <div className="text-emerald-400 font-bold mt-2">[Trilha de Auditoria & Persistência]</div>
                <div>Logs imutáveis de alterações fiscais com justificativa obrigatória e hash SHA-256</div>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Desacoplamento do Motor:</strong> Nenhuma regra fiscal está embutida no código-fonte de telas. Todas residem em tabelas com versionamento temporal de vigência.</li>
                <li><strong>Princípio da Fundamentação:</strong> O sistema nunca infere impostos sem referenciar expressamente o número da norma, artigo e parágrafo legal correspondente.</li>
              </ul>
            </div>
          )}

          {/* 2. Modelo de Dados & Entidades */}
          {selectedSection === 'modelo-dados' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                2. Modelo de Dados e Entidades Principais
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_empresa</div>
                  <p className="text-[11px] text-slate-500">Cadastro de empresas, filiais, regime tributário (Lucro Real, Presumido, Simples), Inscrição Estadual e perfil SPED.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_documento_fiscal</div>
                  <p className="text-[11px] text-slate-500">Chave de acesso (44 dígitos), emitente, destinatário, CFOP predominante, totalizadores de impostos e status de auditoria.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_item_documento_fiscal</div>
                  <p className="text-[11px] text-slate-500">Item analítico, NCM, CEST, CFOP, CST de ICMS, IPI, PIS, COFINS, bases de cálculo e alíquotas confrontadas.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_regra_tributaria</div>
                  <p className="text-[11px] text-slate-500">Tabela de parâmetros tributários com vigência de início e fim, prioridade hierárquica e fórmula de cálculo.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_trilha_auditoria</div>
                  <p className="text-[11px] text-slate-500">Logs imutáveis de cada decisão de aprovação, rejeição ou alteração manual com justificativa registrada.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg space-y-1">
                  <div className="font-bold text-slate-800 font-mono">tb_transicao_reforma</div>
                  <p className="text-[11px] text-slate-500">Mapeamento de alíquotas de IBS, CBS e Imposto Seletivo para os períodos de 2026 a 2033 (EC 132/2023).</p>
                </div>
              </div>
            </div>
          )}

          {/* 3. Fluxo de Processamento */}
          {selectedSection === 'fluxo' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                3. Fluxo de Processamento dos Documentos Fiscais
              </h3>
              <p>O fluxo obedece ao rigor do processo de auditoria tributária preventiva:</p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3 font-mono text-xs">
                <div className="flex items-center gap-2 text-emerald-800 font-bold">
                  <span>[1] Ingestão XML</span> ➔ <span>[2] Normalização</span> ➔ <span>[3] Motor Fiscal</span> ➔ <span>[4] Apontamentos</span> ➔ <span>[5] Homologação</span> ➔ <span>[6] Escrituração SPED / Protheus</span>
                </div>
              </div>
              <ol className="list-decimal pl-5 space-y-1.5">
                <li><strong>Ingestão:</strong> Leitura de arquivos XML conforme manuais da SEFAZ (v4.00 para NF-e).</li>
                <li><strong>Normalização:</strong> Descompactação, conversão de tipos de dados e estruturação em modelo canônico tipado.</li>
                <li><strong>Motor Fiscal:</strong> Aplicação das regras de validação cadastral (NCM, CEST, CFOP) e cálculo de alíquotas com base na UF de origem e destino.</li>
                <li><strong>Apontamentos:</strong> Geração de divergências categorizadas por severidade (OK, Atenção, Divergência, Erro Provável).</li>
                <li><strong>Homologação Humana:</strong> Exibição do relatório explicativo com cadeia normativa para decisão do auditor.</li>
                <li><strong>Escrituração e ERP:</strong> Geração de arquivos EFD ICMS/IPI e chamadas REST via ExecAuto no TOTVS Protheus.</li>
              </ol>
            </div>
          )}

          {/* 4. Motor de Regras Desacoplado */}
          {selectedSection === 'motor' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                4. Estrutura do Motor de Regras Tributárias
              </h3>
              <p>
                O motor foi construído seguindo o <strong>Princípio da Fundamentação Jurídica</strong>:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Hierarquia Rígida:</strong> Uma portaria estadual não pode sobrepor um Convênio CONFAZ ou Lei Complementar Federal.
                </li>
                <li>
                  <strong>Resolução de Conflitos:</strong> Quando há normas concorrentes, o motor adota a regra de especificidade (Lex Specialis Derogat Legi Generali) e temporalidade (Lex Posterior Derogat Legi Priori).
                </li>
                <li>
                  <strong>IA Restrita:</strong> A Inteligência Artificial atua exclusivamente como assistente explicativo e organizador de dados. Ela é terminantemente proibida de criar fatos geradores ou alíquotas por inferência.
                </li>
              </ul>
            </div>
          )}

          {/* 5. Especificação de APIs */}
          {selectedSection === 'apis' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                5. Especificação das APIs do Sistema
              </h3>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <span className="font-bold text-emerald-700">POST /api/v1/documentos/upload</span>
                  <p className="text-slate-600 font-sans mt-1">Upload de lotes de arquivos XML de NF-e, NFC-e, CT-e e NFS-e.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <span className="font-bold text-blue-700">POST /api/v1/auditoria/executar</span>
                  <p className="text-slate-600 font-sans mt-1">Dispara o recálculo do documento contra a base normativa vigente na data de emissão.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <span className="font-bold text-purple-700">POST /api/v1/protheus/inbound/nfe</span>
                  <p className="text-slate-600 font-sans mt-1">Transmite dados validados ao ERP TOTVS Protheus para gravação nas tabelas SF1/SD1 via ExecAuto MATA103.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <span className="font-bold text-amber-700">GET /api/v1/sped/efd-icms-ipi</span>
                  <p className="text-slate-600 font-sans mt-1">Gera e faz download do arquivo texto formatado nos Blocos 0, C e 9.</p>
                </div>
              </div>
            </div>
          )}

          {/* 6. Plano de Fases */}
          {selectedSection === 'fases' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                6. Plano de Desenvolvimento em Fases (1 a 7)
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-950">Fase 1: Fundação & Ingestão XML (Concluída - MVP)</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Modelagem de dados canônica, parser XML oficial da SEFAZ, catálogo de normas e interface de visualização.</p>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-950">Fase 2: Motor Tributário & Confronto (Concluída - MVP)</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Cálculo de ICMS, ST, IPI, PIS, COFINS com fundamentação normativa completa e classificação de riscos.</p>
                </div>
                <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <div className="font-bold text-emerald-950">Fase 3: Escrituração SPED & EFD (Concluída - MVP)</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Geração de registros C100, C170, C190 e totalizadores com controle de portão de aprovação.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <div className="font-bold text-slate-800">Fase 4: Conector TOTVS Protheus & ADVPL (Arquitetura & Código Prontos)</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Rotina MATA103 com ExecAuto, mapeamento de campos SF1/SD1 e tratamento de retorno de erros de dicionário SX3.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <div className="font-bold text-slate-800">Fase 5: Automação SEFAZ & Manifestação do Destinatário</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Consulta de NSU na Receita Federal e disparo de Ciência da Emissão e Confirmação da Operação.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <div className="font-bold text-slate-800">Fase 6: Inteligência Preditiva & Apoio ao Auditor</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Explicação contextualizada de divergências e detecção de benefícios fiscais aplicáveis com base na LC 160/2017.</p>
                </div>
                <div className="p-3 bg-slate-50 border rounded-lg">
                  <div className="font-bold text-slate-800">Fase 7: Transição da Reforma Tributária (IBS / CBS / IS)</div>
                  <p className="text-slate-600 text-[11px] mt-0.5">Módulo de cálculo dual progressivo de 2026 a 2033 com apuração no princípio do destino.</p>
                </div>
              </div>
            </div>
          )}

          {/* 7. Matriz de Riscos */}
          {selectedSection === 'riscos' && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b pb-2">
                7. Matriz de Riscos Fiscais e Operacionais
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-bold text-amber-900">Risco: Apropriação de Crédito Glosado pelo Fisco</div>
                  <p className="text-slate-700 text-[11px] mt-1"><strong>Mitigação:</strong> O motor confronta a alíquota da NF com a tabela interestadual. Se houver alíquota superior (ex: 18% em vez de 7%), o sistema aponta divergência e bloqueia o crédito indevido.</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-bold text-amber-900">Risco: Pagamento em Duplicidade de PIS/COFINS Monofásico</div>
                  <p className="text-slate-700 text-[11px] mt-1"><strong>Mitigação:</strong> O motor identifica NCMs sujeitos à tributação concentrada (medicamentos, cosméticos, autopeças) e alerta o contribuinte para usar CST 04 (alíquota zero na revenda).</p>
                </div>

                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="font-bold text-amber-900">Risco: Rejeição no PVA do SPED Fiscal</div>
                  <p className="text-slate-700 text-[11px] mt-1"><strong>Mitigação:</strong> Todos os registros C100/C190 são totalizados matematicamente com validação de casas decimais e integridade referencial antes da geração do arquivo texto.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
