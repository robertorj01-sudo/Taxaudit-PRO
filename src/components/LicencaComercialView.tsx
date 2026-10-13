import React, { useState } from 'react';
import { Empresa, LicencaComercial } from '../types/fiscal';
import {
  Sparkles,
  Award,
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Building,
  Calendar,
  Zap,
  Printer,
  Copy,
  Check,
  FileCheck,
  DownloadCloud,
  ChevronRight,
  ArrowRight,
  Lock,
  Headphones
} from 'lucide-react';

interface LicencaComercialViewProps {
  empresa: Empresa;
  licenca: LicencaComercial;
  setLicenca: React.Dispatch<React.SetStateAction<LicencaComercial>>;
  onSalvar?: (licencaAtualizada: LicencaComercial) => void;
  onNavigate?: (tab: any) => void;
}

export const LicencaComercialView: React.FC<LicencaComercialViewProps> = ({
  empresa,
  licenca,
  setLicenca,
  onSalvar,
  onNavigate
}) => {
  const [copiado, setCopiado] = useState(false);
  const [chaveInput, setChaveInput] = useState('');
  const [modalCompraAberto, setModalCompraAberto] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const copiarChave = () => {
    navigator.clipboard.writeText(licenca.chaveLicenca);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  };

  const handleAtivarChave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chaveInput.trim()) return;

    const novaLicenca: LicencaComercial = {
      ...licenca,
      ativa: true,
      chaveLicenca: chaveInput.toUpperCase().trim(),
      empresaLicenciada: empresa.razaoSocial,
      cnpjLicenciado: empresa.cnpj,
      dataAtivacao: new Date().toISOString().slice(0, 10),
      statusPagamento: 'PAGO_VITALICIO'
    };

    setLicenca(novaLicenca);
    if (onSalvar) onSalvar(novaLicenca);
    setChaveInput('');
    setFeedbackMsg('Licença Vitalícia ativada com sucesso para a empresa!');
    setTimeout(() => setFeedbackMsg(null), 3500);
  };

  const handleSimularCompra = () => {
    const gerada = `PRO-LIFETIME-BR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const novaLicenca: LicencaComercial = {
      ativa: true,
      plano: 'VITALICIO_PREMIUM',
      chaveLicenca: gerada,
      empresaLicenciada: empresa.razaoSocial,
      cnpjLicenciado: empresa.cnpj,
      emailTitular: empresa.emailContato || 'contato@empresa.com.br',
      dataAtivacao: new Date().toISOString().slice(0, 10),
      validade: 'Vitalícia (Sem Expiração - Lifetime Access)',
      statusPagamento: 'PAGO_VITALICIO',
      valorPago: 2490.00,
      formaPagamento: 'PIX Institucional / Confirmação Instantânea',
      idTransacao: `TX-PIX-${Math.floor(Math.random() * 899999 + 100000)}-LIFETIME`,
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

    setLicenca(novaLicenca);
    if (onSalvar) onSalvar(novaLicenca);
    setModalCompraAberto(false);
    setFeedbackMsg('Pagamento confirmado! Acesso Premium Vitalício Liberado.');
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Banner Principal com Identidade Comercial */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-xl border border-amber-600/30 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-2 max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/40">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Licenciamento Comercial &bull; Pagamento Único
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Acesso Premium Vitalício</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Este software foi adquirido na modalidade <strong>Vitalícia (Lifetime)</strong>. A sua empresa possui direito de uso perpétuo da plataforma, sem mensalidades, sem limites de emissão de SPED ou de importação de documentos fiscais.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition border border-slate-700 shadow-md"
            title="Imprimir Certificado de Licença Comercial"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Certificado de Licença</span>
          </button>

          <button
            onClick={() => setModalCompraAberto(true)}
            className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 transition shadow-lg"
          >
            <CreditCard className="w-4 h-4 text-slate-950" />
            <span>Nova Licença / Detalhes de Compra</span>
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-900 flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Card da Chave de Licença Ativa */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-lg shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  Chave de Licença Comercial Registrada
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {licenca.plano} &bull; ATIVA
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Licenciada para: <strong className="text-slate-800">{licenca.empresaLicenciada}</strong> (CNPJ: {licenca.cnpjLicenciado})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Status de Pagamento:</span>
            <span className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold text-xs shadow-xs">
              PAGO VITALÍCIO
            </span>
          </div>
        </div>

        {/* Chave de Licença em Destaque */}
        <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-sans">
              Chave Criptográfica de Hardware / Applet ID:
            </span>
            <span className="text-base sm:text-lg font-black tracking-wider text-amber-400">
              {licenca.chaveLicenca}
            </span>
          </div>

          <button
            onClick={copiarChave}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-sans font-bold rounded-lg flex items-center gap-1.5 transition border border-slate-700 shrink-0"
          >
            {copiado ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copiada!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-400" />
                <span>Copiar Chave</span>
              </>
            )}
          </button>
        </div>

        {/* Metadados da Aquisição Comercial */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Data de Ativação:</span>
            <strong className="text-slate-800">{licenca.dataAtivacao}</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Duração / Vigência:</span>
            <strong className="text-emerald-700">Perpétua / Sem Expiração</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Volume de Documentos:</span>
            <strong className="text-slate-800">Ilimitado (Sem Taxas Extras)</strong>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold text-slate-400 uppercase block">Suporte Técnico:</span>
            <strong className="text-slate-800">{licenca.suporteTecnico}</strong>
          </div>
        </div>
      </div>

      {/* Módulos Habilitados na Licença Vitalícia */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Módulos Corporativos Habilitados</h3>
              <p className="text-xs text-slate-500">Todos os módulos operam com 100% de capacidade sem restrições</p>
            </div>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            9 de 9 Módulos Ativos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          {licenca.modulosHabilitados.map((mod, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50/80 border border-slate-200 flex items-start gap-2.5"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block">{mod}</strong>
                <span className="text-[10px] text-slate-500">Acesso ilimitado e vitalício</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Passo a Passo de Inicialização para Novos Compradores */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-blue-600" />
          Roteiro de Implantação Imediata da Empresa Compradora
        </h3>
        <p className="text-xs text-slate-500">
          Siga estas 4 etapas simples para começar a operar a plataforma fiscal na sua organização:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/40 space-y-2">
            <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              1
            </div>
            <div className="font-bold text-emerald-950">Ativação da Licença</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Sua licença vitalícia já se encontra ativada e vinculada à sua instância.
            </p>
            <span className="inline-block text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
              Concluído ✓
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              2
            </div>
            <div className="font-bold text-slate-900">Cadastro da Empresa</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Informe a Razão Social, CNPJ, Inscrição Estadual e faça upload do seu Logotipo.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('empresa')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Configurar Empresa</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              3
            </div>
            <div className="font-bold text-slate-900">Certificado Digital</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Insira o Certificado A1 (.pfx) ou A3 para comunicação direta com a SEFAZ.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('certificado')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Vincular Certificado</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition space-y-2">
            <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs">
              4
            </div>
            <div className="font-bold text-slate-900">Cadastro de Usuários</div>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              Cadastre analistas e auditores para operarem o sistema com credenciais próprias.
            </p>
            {onNavigate && (
              <button
                onClick={() => onNavigate('usuarios')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Cadastrar Equipe</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Formulário para Inserir Outra Chave de Licença */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-purple-600" />
          Transferir ou Atualizar Chave de Licença
        </h3>
        <p className="text-xs text-slate-500">
          Caso tenha adquirido uma nova chave comercial ou queira transferir a titularidade para outra filial:
        </p>

        <form onSubmit={handleAtivarChave} className="flex flex-col sm:flex-row gap-3 max-w-xl">
          <input
            type="text"
            value={chaveInput}
            onChange={e => setChaveInput(e.target.value)}
            placeholder="PRO-LIFETIME-BR-2026-XXXX-XXXX-XXXX"
            className="flex-1 px-4 py-2.5 text-xs font-mono font-bold uppercase rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 focus:outline-none"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition shrink-0"
          >
            Ativar Chave
          </button>
        </form>
      </div>

      {/* Modal de Detalhes Comerciais / Venda */}
      {modalCompraAberto && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">Acesso Premium Vitalício</h3>
                  <p className="text-xs text-slate-500">Proposta Comercial &bull; Pagamento Único sem Mensalidades</p>
                </div>
              </div>
              <button
                onClick={() => setModalCompraAberto(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-baseline justify-between">
                  <span className="font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Investimento Único Corporativo:
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black text-slate-900">R$ 2.490,00</span>
                    <span className="text-[10px] text-slate-500 block">Vitalício &bull; Sem mensalidades futuras</span>
                  </div>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed pt-2 border-t border-amber-200/50">
                  Ideal para a empresa operadora assumir a gestão fiscal completa com segurança e economia superior a 80% frente aos custos recorrentes de ERPs tradicionais.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Garantias Comerciais Inclusas:
                </div>
                <div className="space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Emissão de Termo de Licença Perpétua e Nota Fiscal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Suporte a Certificado Digital ICP-Brasil A1 e A3</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Atualizações gratuitas da Reforma Tributária 2026 (IBS/CBS)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Multi-usuários ilimitados para analistas e auditores</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-slate-600">
                <span>Empresa Contratante:</span>
                <strong className="text-slate-900">{empresa.razaoSocial}</strong>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalCompraAberto(false)}
                  className="px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={handleSimularCompra}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black shadow-md transition flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Confirmar & Gerar Nova Chave</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
