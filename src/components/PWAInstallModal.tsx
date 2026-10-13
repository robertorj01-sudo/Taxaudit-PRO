import React, { useState } from 'react';
import {
  Monitor,
  Download,
  CheckCircle2,
  X,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  HardDrive,
  Laptop
} from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, promptInstall } = usePWAInstall();
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedEdgeCmd, setCopiedEdgeCmd] = useState(false);
  const [activeTab, setActiveTab] = useState<'edge' | 'chrome' | 'script'>('edge');

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    const success = await promptInstall();
    if (success) {
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const batchScriptContent = `@echo off
chcp 65001 > nul
title TAXAUDIT PRO - SISTEMA FISCAL INTELIGENTE
echo ========================================================
echo   INICIANDO TAXAUDIT PRO (MODO DESKTOP STANDALONE)
echo   SISTEMA DE GESTAO E AUDITORIA FISCAL EMPRESARIAL
echo ========================================================
echo.
set APP_URL=%~1
if "%APP_URL%"=="" set APP_URL=${currentUrl}

REM Inicia via Microsoft Edge em modo Janela de Aplicativo (Desktop Standalone)
start msedge.exe --app="%APP_URL%" --app-id=taxaudit-pro --window-size=1440,900

echo Aplicativo aberto em janela independente com sucesso!
exit
`;

  const copyToClipboard = (text: string, type: 'script' | 'cmd') => {
    navigator.clipboard.writeText(text);
    if (type === 'script') {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2500);
    } else {
      setCopiedEdgeCmd(true);
      setTimeout(() => setCopiedEdgeCmd(false), 2500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header com Identidade Visual TaxAudit Pro */}
        <div className="bg-gradient-to-r from-slate-900 via-[#002B49] to-slate-900 px-6 py-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shadow-inner">
              <Monitor className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white tracking-wide">
                  Instalar TAXAUDIT PRO no Windows
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Web Desktop PWA
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Execução independente com 1 clique &bull; Zero privilégios de Administrador
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Corpo com Instruções Claras */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Status do App */}
          {isInstalled ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="font-bold text-emerald-900">Aplicativo Já Instalado no Micro!</p>
                <p className="text-xs text-emerald-700">
                  O sistema já está configurado como Web Desktop PWA e pode ser acessado pelo Menu Iniciar ou Barra de Tarefas do Windows.
                </p>
              </div>
            </div>
          ) : (
            isInstallable && (
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200/80 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Navegador Detectou Instalador Disponível</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Clique no botão ao lado para abrir a janela nativa de instalação do Windows.
                  </p>
                </div>
                <button
                  onClick={handleNativeInstall}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  Instalar Agora
                </button>
              </div>
            )
          )}

          {/* Abas de Navegador / Método */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <button
                onClick={() => setActiveTab('edge')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'edge'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Laptop className="w-3.5 h-3.5" />
                Microsoft Edge (Padrão Windows)
              </button>
              <button
                onClick={() => setActiveTab('chrome')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'chrome'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Google Chrome
              </button>
              <button
                onClick={() => setActiveTab('script')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition flex items-center gap-1.5 ${
                  activeTab === 'script'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                Script / Pasta R:\
              </button>
            </div>

            {/* Conteúdo Aba Edge */}
            {activeTab === 'edge' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  No Microsoft Edge (Recomendado no Windows):
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 pl-1">
                  <li>
                    Olhe no canto direito da barra de endereços do Edge: você verá o ícone de aplicativo{' '}
                    <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                      ⊞ Aplicativo disponível
                    </strong>.
                  </li>
                  <li>
                    Basta clicar nele e depois em{' '}
                    <strong className="text-emerald-700 font-bold">
                      &quot;Instalar GESTÃO FISCAL GEPAT.F&quot;
                    </strong>.
                  </li>
                  <li>
                    Ou clique nos <strong>3 pontinhos (...)</strong> no canto superior direito do Edge &rarr;{' '}
                    <strong>&quot;Aplicativos&quot;</strong> &rarr;{' '}
                    <strong>&quot;Instalar este site como um aplicativo&quot;</strong>.
                  </li>
                  <li>
                    Marque as opções:{' '}
                    <span className="text-blue-800 font-semibold">
                      &quot;Fixar na barra de tarefas&quot;
                    </span>{' '}
                    e{' '}
                    <span className="text-blue-800 font-semibold">
                      &quot;Criar atalho na Área de Trabalho&quot;
                    </span>.
                  </li>
                </ol>
              </div>
            )}

            {/* Conteúdo Aba Chrome */}
            {activeTab === 'chrome' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-[11px]">
                    1
                  </span>
                  No Google Chrome:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-xs text-slate-700 pl-1">
                  <li>
                    Na barra de endereços (ao lado da estrela de favoritos), clique no ícone{' '}
                    <strong className="text-slate-900 bg-white px-1.5 py-0.5 rounded border border-slate-300">
                      ⊕ Instalar
                    </strong>.
                  </li>
                  <li>
                    Confirme o nome <strong>&quot;GESTÃO FISCAL GEPAT.F&quot;</strong> e clique em{' '}
                    <strong>Instalar</strong>.
                  </li>
                  <li>
                    Ele abrirá imediatamente em uma janela própria, sem barra de navegação, com o ícone do sistema na barra de tarefas do Windows.
                  </li>
                </ol>
              </div>
            )}

            {/* Conteúdo Aba Script para a Pasta R:\ */}
            {activeTab === 'script' && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-blue-600" />
                    Arquivo Executável .BAT para a Pasta R:\
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob([batchScriptContent], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'INICIAR_GEPAT_DESKTOP.bat';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 transition shadow-xs"
                      title="Baixar arquivo .BAT direto para salvar na pasta R:\"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar INICIAR_GEPAT.bat
                    </button>

                    <button
                      onClick={() => {
                        const currentOrigin = window.location.origin;
                        const atalhoScript = `@echo off
chcp 65001 > nul
title Instalar Atalho TAXAUDIT PRO
color 0A
echo Criando atalho na Area de Trabalho do Windows (Sem precisar de Admin)...
set SCRIPT="%TEMP%\\CriarAtalhoTaxAudit.vbs"
set SHORTCUT_NAME=TAXAUDIT PRO.lnk
set TARGET_URL=${currentOrigin}

echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\\%SHORTCUT_NAME%" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "msedge.exe" >> %SCRIPT%
echo oLink.Arguments = "--app=""" ^& "%TARGET_URL%" ^& """ --app-id=taxaudit-pro" >> %SCRIPT%
echo oLink.Description = "Sistema de Gestao e Auditoria Fiscal Inteligente" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript /nologo %SCRIPT%
del %SCRIPT%
echo [OK] Atalho criado com sucesso na Area de Trabalho!
pause
`;
                        const blob = new Blob([atalhoScript], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'INSTALAR_ATALHO_WINDOWS.bat';
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-blue-700 hover:bg-blue-800 text-white flex items-center gap-1 transition shadow-xs"
                      title="Baixar gerador de atalho na Área de Trabalho"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Baixar INSTALAR_ATALHO.bat
                    </button>

                    <button
                      onClick={() => copyToClipboard(batchScriptContent, 'script')}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 flex items-center gap-1 transition"
                    >
                      {copiedScript ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-slate-500" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-slate-600">
                  Você pode salvar este arquivo com o nome{' '}
                  <code className="bg-slate-200 text-slate-800 px-1 py-0.5 rounded font-mono text-[11px]">
                    INICIAR_GEPAT_DESKTOP.bat
                  </code>{' '}
                  direto na pasta:
                  <br />
                  <strong className="text-slate-800 font-mono text-[11px]">
                    R:\GEPAT.F$\006. NOTAS FISCAIS DE ENTRADA PCVNF GEPAT.F\
                  </strong>
                </p>
                <div className="bg-slate-900 text-emerald-400 p-3 rounded-lg font-mono text-[11px] overflow-x-auto">
                  <pre>{batchScriptContent}</pre>
                </div>
              </div>
            )}
          </div>

          {/* Destaque de Vantagens Corporativas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Sem Conta de Admin
              </div>
              <p className="text-[11px] text-slate-500">
                Qualquer analista instala diretamente pelo Edge sem precisar abrir chamado na TI.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Monitor className="w-4 h-4 text-blue-600" />
                Janela Independente
              </div>
              <p className="text-[11px] text-slate-500">
                Abre sem barra de abas ou URL do navegador, parecendo 100% um programa Windows nativo.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <HardDrive className="w-4 h-4 text-amber-600" />
                Acesso Direto ao R:\
              </div>
              <p className="text-[11px] text-slate-500">
                Conecta nativamente à pasta protegida de notas fiscais da GEPAT.F.
              </p>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-medium">
            TaxAudit Pro &bull; Sistema Comercial Licenciado
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition"
          >
            Entendido / Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
