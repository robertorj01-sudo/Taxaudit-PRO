@echo off
chcp 65001 > nul
title Instalar Atalho GESTAO FISCAL GEPAT.F - INB
color 0A

echo =======================================================================
echo          INDÚSTRIAS NUCLEARES DO BRASIL - INB S/A
echo          INSTALADOR DE ATALHO DO SETOR FISCAL (GEPAT.F)
echo =======================================================================
echo.
echo Criando atalho na Área de Trabalho do Windows (Sem precisar de Admin)...

set SCRIPT="%TEMP%\CriarAtalhoGepat.vbs"
set SHORTCUT_NAME=GESTÃO FISCAL GEPAT.F.lnk
set TARGET_URL=https://ais-pre-o7rnikdrdvqlyzfozpqssd-546695880517.us-east1.run.app

echo Set oWS = WScript.CreateObject("WScript.Shell") > %SCRIPT%
echo sLinkFile = oWS.SpecialFolders("Desktop") ^& "\%SHORTCUT_NAME%" >> %SCRIPT%
echo Set oLink = oWS.CreateShortcut(sLinkFile) >> %SCRIPT%
echo oLink.TargetPath = "msedge.exe" >> %SCRIPT%
echo oLink.Arguments = "--app=""" ^& "%TARGET_URL%" ^& """ --app-id=gepat-fiscal-inb" >> %SCRIPT%
echo oLink.Description = "Sistema de Gestão e Auditoria Fiscal da GEPAT.F - INB" >> %SCRIPT%
echo oLink.Save >> %SCRIPT%

cscript /nologo %SCRIPT%
del %SCRIPT%

echo.
echo =======================================================================
echo   [OK] ATALHO CRIADO COM SUCESSO NA SUA ÁREA DE TRABALHO!
echo   Basta dar 2 cliques no ícone "GESTÃO FISCAL GEPAT.F" na sua tela.
echo =======================================================================
echo.
pause
exit
