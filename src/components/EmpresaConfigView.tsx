import React, { useState } from 'react';
import { Empresa } from '../types/fiscal';
import {
  Building2,
  Upload,
  CheckCircle2,
  Save,
  RotateCcw,
  Image,
  Trash2,
  FileSpreadsheet,
  MapPin,
  FileCheck,
  ShieldCheck,
  Percent,
  Mail,
  Phone,
  Printer
} from 'lucide-react';

interface EmpresaConfigViewProps {
  empresa: Empresa;
  setEmpresa: React.Dispatch<React.SetStateAction<Empresa>>;
  onSave?: (empresaAtualizada: Empresa) => void;
  onNavigate?: (tab: any) => void;
}

export const EmpresaConfigView: React.FC<EmpresaConfigViewProps> = ({
  empresa,
  setEmpresa,
  onSave,
  onNavigate
}) => {
  const [formData, setFormData] = useState<Empresa>({ ...empresa });
  const [salvoFeedback, setSalvoFeedback] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | undefined>(empresa.logotipoUrl);

  const handleChange = (field: keyof Empresa, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Formatação de CNPJ em tempo real
  const formatarCnpj = (valor: string) => {
    const limpo = valor.replace(/\D/g, '').slice(0, 14);
    if (limpo.length <= 2) return limpo;
    if (limpo.length <= 5) return `${limpo.slice(0, 2)}.${limpo.slice(2)}`;
    if (limpo.length <= 8) return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5)}`;
    if (limpo.length <= 12) return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 8)}/${limpo.slice(8)}`;
    return `${limpo.slice(0, 2)}.${limpo.slice(2, 5)}.${limpo.slice(5, 8)}/${limpo.slice(8, 12)}-${limpo.slice(12, 14)}`;
  };

  // Upload do Logotipo com conversão para Base64 (salvo localmente)
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('O arquivo de imagem deve ter no máximo 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        setFormData(prev => ({ ...prev, logotipoUrl: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoverLogo = () => {
    setLogoPreview(undefined);
    setFormData(prev => ({ ...prev, logotipoUrl: undefined }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmpresa(formData);
    if (onSave) {
      onSave(formData);
    }
    setSalvoFeedback(true);
    setTimeout(() => setSalvoFeedback(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Banner de Cabeçalho */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 sm:p-8 rounded-2xl text-white shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-500/30">
            <Building2 className="w-3.5 h-3.5" />
            Configuração da Empresa Licenciada
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <span>Cadastro da Empresa</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Configure os dados fiscais, endereço, regime tributário e identidade visual da empresa compradora deste aplicativo. Todos os relatórios, XMLs, livros de escrituração SPED e declarações fiscais utilizarão estes dados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onNavigate && (
            <button
              type="button"
              onClick={() => onNavigate('certificado')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition border border-slate-600"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Vincular Certificado</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs flex items-center gap-2 transition border border-slate-600"
            title="Imprimir Ficha Cadastral da Empresa"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Ficha Cadastral</span>
          </button>
        </div>
      </div>

      {/* Formulário Principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bloco 1: Identidade Visual & Logotipo */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3 border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                <Image className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Logotipo da Empresa</h3>
                <p className="text-xs text-slate-500">Personalize a identidade visual exibida no menu lateral e nos relatórios DANFE</p>
              </div>
            </div>
            {logoPreview && (
              <button
                type="button"
                onClick={handleRemoverLogo}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 hover:underline"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Remover Logo
              </button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
            <div className="w-32 h-32 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden shrink-0 shadow-inner p-2 relative group">
              {logoPreview ? (
                <img
                  src={logoPreview}
                  alt="Logotipo da Empresa"
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-center p-3 text-slate-400">
                  <Building2 className="w-8 h-8 mx-auto mb-1 text-slate-300" />
                  <span className="text-[11px] font-medium block leading-tight">Sem logotipo configurado</span>
                </div>
              )}
            </div>

            <div className="space-y-2 flex-1">
              <label className="block text-xs font-bold text-slate-700">
                Selecione o arquivo do Logotipo (PNG, JPG, SVG ou WebP):
              </label>
              <div className="flex items-center gap-3">
                <label className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer transition flex items-center gap-2 shadow-xs">
                  <Upload className="w-4 h-4" />
                  <span>Escolher Imagem...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-slate-500">
                  Resolução recomendada: 400x120px ou proporção 1:1.
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                O logotipo é salvo com segurança e exibido instantaneamente no topo do menu lateral e nos cabeçalhos de relatórios exportados.
              </p>
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados Principais e Fiscais */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Dados Cadastrais Oficiais</h3>
              <p className="text-xs text-slate-500">Informações jurídicas registradas na Receita Federal do Brasil</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Razão Social (Nome Empresarial) *</label>
              <input
                type="text"
                required
                value={formData.razaoSocial}
                onChange={e => handleChange('razaoSocial', e.target.value)}
                placeholder="Ex: SILVA & OLIVEIRA COMERCIO LTDA"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Nome Fantasia (Título do Estabelecimento)</label>
              <input
                type="text"
                value={formData.nomeFantasia}
                onChange={e => handleChange('nomeFantasia', e.target.value)}
                placeholder="Ex: SILVA COMERCIAL"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">CNPJ (Cadastro Nacional da Pessoa Jurídica) *</label>
              <input
                type="text"
                required
                value={formData.cnpj}
                onChange={e => handleChange('cnpj', formatarCnpj(e.target.value))}
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Inscrição Estadual (IE) *</label>
              <input
                type="text"
                required
                value={formData.inscricaoEstadual}
                onChange={e => handleChange('inscricaoEstadual', e.target.value)}
                placeholder="Ex: 115.345.678.110"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Inscrição Municipal (IM)</label>
              <input
                type="text"
                value={formData.inscricaoMunicipal || ''}
                onChange={e => handleChange('inscricaoMunicipal', e.target.value)}
                placeholder="Ex: 987.654-3"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700">CNAE Principal</label>
                {onNavigate && (
                  <button
                    type="button"
                    onClick={() => onNavigate('cnae')}
                    className="text-[11px] font-bold text-emerald-600 hover:text-emerald-800 hover:underline flex items-center gap-1"
                  >
                    <span>Consultar Tabela CONCLA / IBGE &rarr;</span>
                  </button>
                )}
              </div>
              <input
                type="text"
                value={formData.cnae}
                onChange={e => handleChange('cnae', e.target.value)}
                placeholder="Ex: 4649-4/08 - Comércio Atacadista"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 3: Endereço & Localização */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Endereço do Estabelecimento Matriz</h3>
              <p className="text-xs text-slate-500">Localização física para determinação de competência tributária e alíquotas internas</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs">
            <div className="md:col-span-2 space-y-1">
              <label className="font-bold text-slate-700">Logradouro (Rua, Avenida, Rodovia)</label>
              <input
                type="text"
                value={formData.logradouro || ''}
                onChange={e => handleChange('logradouro', e.target.value)}
                placeholder="Ex: Avenida Paulista"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Número</label>
              <input
                type="text"
                value={formData.numero || ''}
                onChange={e => handleChange('numero', e.target.value)}
                placeholder="Ex: 1500"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Complemento</label>
              <input
                type="text"
                value={formData.complemento || ''}
                onChange={e => handleChange('complemento', e.target.value)}
                placeholder="Ex: Andar 10, Sala 102"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Bairro</label>
              <input
                type="text"
                value={formData.bairro || ''}
                onChange={e => handleChange('bairro', e.target.value)}
                placeholder="Ex: Bela Vista"
                className="w-full p-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Município *</label>
              <input
                type="text"
                required
                value={formData.municipio}
                onChange={e => handleChange('municipio', e.target.value)}
                placeholder="Ex: SÃO PAULO"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">UF (Estado) *</label>
              <select
                value={formData.uf}
                onChange={e => handleChange('uf', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                {['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'].map(uf => (
                  <option key={uf} value={uf}>{uf}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">CEP</label>
              <input
                type="text"
                value={formData.cep || ''}
                onChange={e => handleChange('cep', e.target.value)}
                placeholder="00000-000"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bloco 4: Parâmetros Fiscais & Regime Tributário */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 border-b pb-3 border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Parâmetros de Tributação & SPED</h3>
              <p className="text-xs text-slate-500">Defina o enquadramento tributário para cálculo do motor de regras normativo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Regime Tributário *</label>
              <select
                value={formData.regimeTributario}
                onChange={e => handleChange('regimeTributario', e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="LUCRO_REAL">Lucro Real (Não-Cumulativo)</option>
                <option value="LUCRO_PRESUMIDO">Lucro Presumido (Cumulativo)</option>
                <option value="SIMPLES_NACIONAL">Simples Nacional (ME / EPP)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Perfil EFD ICMS/IPI (SPED) *</label>
              <select
                value={formData.perfilSped}
                onChange={e => handleChange('perfilSped', e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none bg-white"
              >
                <option value="A">Perfil A (Mais Detalhado - Itens C170 Obrigatórios)</option>
                <option value="B">Perfil B (Intermediário - Totalizações por CST/CFOP)</option>
                <option value="C">Perfil C (Simplificado)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Alíquota Interna Padrão de ICMS (%)</label>
              <input
                type="number"
                step="0.5"
                value={formData.aliquotaIcmsPadrao || 18}
                onChange={e => handleChange('aliquotaIcmsPadrao', Number(e.target.value))}
                placeholder="18"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">E-mail Corporativo de Contato Fiscal</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  value={formData.emailContato || ''}
                  onChange={e => handleChange('emailContato', e.target.value)}
                  placeholder="fiscal@empresa.com.br"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Telefone / Ramal do Fiscal</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={formData.telefoneContato || ''}
                  onChange={e => handleChange('telefoneContato', e.target.value)}
                  placeholder="(11) 3250-8000"
                  className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Início das Atividades</label>
              <input
                type="date"
                value={formData.dataInicioAtividades}
                onChange={e => handleChange('dataInicioAtividades', e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Barra de Ações & Salvar */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            {salvoFeedback ? (
              <span className="flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Dados cadastrais da empresa salvos com sucesso!
              </span>
            ) : (
              <span>Os dados salvos serão refletidos imediatamente em todos os módulos e cabeçalhos.</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => {
                setFormData({ ...empresa });
                setLogoPreview(empresa.logotipoUrl);
              }}
              className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-300 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Descartar
            </button>

            <button
              type="submit"
              className="flex-1 sm:flex-initial px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4 text-emerald-200" />
              <span>Salvar Dados da Empresa</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
