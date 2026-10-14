import React, { useState } from 'react';
import {
  LayoutDashboard,
  FileSpreadsheet,
  CalendarRange,
  ShieldAlert,
  Scale,
  BookOpenCheck,
  Server,
  History,
  TrendingUp,
  FileCode,
  Building2,
  Users,
  KeyRound,
  Sparkles,
  ShieldCheck,
  Monitor,
  Save,
  CheckCircle,
  BookOpen,
  FileCheck2,
  Cloud,
  Globe,
  FolderTree
} from 'lucide-react';
import { Empresa } from '../types/fiscal';

export type ActiveTab =
  | 'dashboard'
  | 'documentos'
  | 'relatorios'
  | 'auditoria'
  | 'manifesto'
  | 'regras'
  | 'ncm'
  | 'cnae'
  | 'escrituracao'
  | 'protheus'
  | 'reforma'
  | 'trilha'
  | 'empresa'
  | 'usuarios'
  | 'certificado'
  | 'licenca'
  | 'manual'
  | 'hospedagem'
  | 'arquitetura';

interface SidebarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  divergenciasCount: number;
  pendentesCount: number;
  empresa?: Empresa;
  onOpenPWAInstall?: () => void;
  onSalvar?: () => void;
  totalDocumentos?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  divergenciasCount,
  pendentesCount,
  empresa,
  onOpenPWAInstall,
  onSalvar,
  totalDocumentos
}) => {
  const [salvandoSidebar, setSalvandoSidebar] = useState(false);

  const handleSalvarClick = () => {
    if (onSalvar) {
      setSalvandoSidebar(true);
      onSalvar();
      setTimeout(() => setSalvandoSidebar(false), 2000);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Fiscal', icon: LayoutDashboard },
    {
      id: 'documentos',
      label: 'Documentos Fiscais',
      icon: FileSpreadsheet,
      badge: pendentesCount > 0 ? `${pendentesCount}` : undefined,
      badgeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'relatorios',
      label: 'Relatório Mensal de NF-e',
      icon: CalendarRange
    },
    {
      id: 'auditoria',
      label: 'Auditoria & Divergências',
      icon: ShieldAlert,
      badge: divergenciasCount > 0 ? `${divergenciasCount}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800'
    },
    {
      id: 'manifesto',
      label: 'Manifestação SEFAZ (MD-e)',
      icon: FileCheck2,
      badge: 'Portal',
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
    },
    { id: 'regras', label: 'Motor de Regras & Legislação', icon: Scale },
    {
      id: 'ncm',
      label: 'Atualização NCM (Siscomex)',
      icon: Globe,
      badge: 'Siscomex',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'cnae',
      label: 'Consulta CNAE (IBGE / CONCLA)',
      icon: FolderTree,
      badge: 'CONCLA',
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
    },
    { id: 'escrituracao', label: 'Escrituração SPED (EFD)', icon: BookOpenCheck },
    { id: 'protheus', label: 'Integração TOTVS Protheus', icon: Server },
    { id: 'reforma', label: 'Reforma Tributária (IBS/CBS)', icon: TrendingUp },
    { id: 'trilha', label: 'Trilha de Auditoria', icon: History },
    {
      id: 'empresa',
      label: 'Cadastro da Empresa',
      icon: Building2
    },
    {
      id: 'certificado',
      label: 'Certificado Digital (A1/A3)',
      icon: KeyRound,
      badge: 'ICP-BR',
      badgeColor: 'bg-blue-950 text-blue-300 border border-blue-500/40'
    },
    {
      id: 'usuarios',
      label: 'Usuários do APP',
      icon: Users
    },
    {
      id: 'licenca',
      label: 'Licença Premium',
      icon: Sparkles,
      badge: 'Vitalício',
      badgeColor: 'bg-amber-950 text-amber-300 border border-amber-500/40'
    },
    {
      id: 'manual',
      label: 'Manual do Usuário',
      icon: BookOpen,
      badge: 'Guia',
      badgeColor: 'bg-emerald-900/90 text-emerald-300 border border-emerald-500/40'
    },
    {
      id: 'hospedagem',
      label: 'Hospedagem & Nuvem',
      icon: Cloud,
      badge: 'Deploy',
      badgeColor: 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
    },
    { id: 'arquitetura', label: 'Arquitetura & Especificação', icon: FileCode }
  ];

  return (
    <aside
      id="sidebar-navigation"
      className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 border-r border-slate-800 select-none"
    >
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white p-1 flex items-center justify-center shadow-md overflow-hidden shrink-0 border border-slate-700">
            {empresa?.logotipoUrl ? (
              <img
                src={empresa.logotipoUrl}
                alt="Logo da Empresa"
                className="max-h-full max-w-full object-contain"
              />
            ) : (
              <div
                className="w-full h-full bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-lg flex items-center justify-center text-white font-extrabold shadow-inner"
                title="TaxAudit Pro"
              >
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-black text-[13px] tracking-tight text-white leading-tight truncate flex items-center gap-1.5" title="TAXAUDIT PRO">
              <span>TAXAUDIT PRO</span>
              <span className="px-1 py-0.2 bg-emerald-500/20 text-emerald-300 text-[8.5px] font-extrabold rounded border border-emerald-400/30">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-emerald-400 font-medium leading-tight mt-0.5 truncate" title="Auditoria & Compliance Fiscal">
              Auditoria & Compliance Fiscal
            </p>
          </div>
        </div>
      </div>

      {/* Empresa Ativa */}
      <div className="px-4 py-3 bg-slate-950/70 border-b border-slate-800 text-xs">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400" />
            <span className="uppercase tracking-wider font-semibold text-[10px]">Empresa Ativa</span>
          </div>
          <button
            onClick={() => setActiveTab('empresa')}
            className="text-[10px] text-emerald-400 hover:text-emerald-300 font-bold hover:underline"
            title="Editar Cadastro da Empresa"
          >
            Editar
          </button>
        </div>
        <p className="font-bold text-slate-100 truncate text-xs" title={empresa?.nomeFantasia || empresa?.razaoSocial || 'Empresa Licenciada'}>
          {empresa?.nomeFantasia || empresa?.razaoSocial || 'Empresa Licenciada'}
        </p>
        <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
          <span className="font-mono text-[10.5px] text-slate-300">
            CNPJ: {empresa?.cnpj || '12.345.678/0001-90'}
          </span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 font-mono text-[9.5px] border border-emerald-800/40 font-semibold">
            {empresa?.regimeTributario === 'SIMPLES_NACIONAL'
              ? 'SIMPLES'
              : empresa?.regimeTributario === 'LUCRO_PRESUMIDO'
              ? 'PRESUMIDO'
              : 'LUCRO REAL'}
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-btn-${item.id}`}
              onClick={() => setActiveTab(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Desktop App PWA Button */}
      {onOpenPWAInstall && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            id="btn-sidebar-instalar-pwa"
            onClick={onOpenPWAInstall}
            className="w-full flex items-center justify-between p-2.5 rounded-lg bg-gradient-to-r from-blue-950/60 to-slate-900/60 hover:from-blue-900/70 hover:to-slate-800 border border-blue-500/30 text-left transition group"
            title="Instalar como aplicativo no Windows (PWA) ou criar atalho"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:text-emerald-400 transition">
                <Monitor className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-slate-100 group-hover:text-emerald-300 transition">
                  App de Desktop
                </p>
                <p className="text-[9.5px] text-slate-400">Instalar no Windows / Pasta R:\</p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-blue-600 text-white shadow-xs">
              PWA
            </span>
          </button>
        </div>
      )}

      {/* Botão de Salvar Base Fiscal no Sidebar */}
      {onSalvar && (
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/20">
          <button
            id="btn-sidebar-salvar-base"
            onClick={handleSalvarClick}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition ${
              salvandoSidebar
                ? 'bg-emerald-800 border-emerald-500 text-white'
                : 'bg-emerald-900/40 hover:bg-emerald-800/60 border-emerald-600/40 text-emerald-200'
            }`}
            title="Salvar alterações e notas fiscais importadas"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-md bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
                {salvandoSidebar ? (
                  <CheckCircle className="w-4 h-4 text-emerald-300" />
                ) : (
                  <Save className="w-4 h-4 text-emerald-300" />
                )}
              </div>
              <div>
                <p className="text-[11px] font-bold text-emerald-100">
                  {salvandoSidebar ? 'Base Salva!' : 'Salvar Alterações'}
                </p>
                <p className="text-[9.5px] text-emerald-300/80">
                  {totalDocumentos !== undefined ? `${totalDocumentos} NF-es salvas` : 'Gravar no navegador'}
                </p>
              </div>
            </div>
            <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
              SALVAR
            </span>
          </button>
        </div>
      )}

      {/* Status Bar */}
      <div className="p-3 border-t border-slate-800 text-slate-400 text-[11px]">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Motor Fiscal Ativo
          </span>
          <span className="text-[10px] font-mono text-slate-500">v1.0 MVP</span>
        </div>
      </div>
    </aside>
  );
};
