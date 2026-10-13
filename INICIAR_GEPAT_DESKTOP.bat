@echo off
chcp 65001 > nul
title GESTAO FISCAL GEPAT.F - INB S/A
color 0B

echo =======================================================================
echo          INDÚSTRIAS NUCLEARES DO BRASIL - INB S/A
echo          GEPAT.F - GERÊNCIA DE PLANEJAMENTO TRIBUTÁRIO
echo          SISTEMA DE GESTÃO E ESCRITURAÇÃO FISCAL (MODO DESKTOP)
echo =======================================================================
echo.
echo [1/2] Verificando conexão e inicializando interface...

REM Define o endereço público oficial do aplicativo da GEPAT.F
set APP_URL=https://ais-pre-o7rnikdrdvqlyzfozpqssd-546695880517.us-east1.run.app

REM Inicia o Microsoft Edge em Modo Janela Independente (Web Desktop PWA)
REM Isso abre sem barras de navegação do browser, como um programa nativo do Windows!
echo [2/2] Abrindo aplicativo em janela nativa do Windows...
start msedge.exe --app="%APP_URL%" --app-id=gepat-fiscal-inb --window-size=1440,900

echo.
echo =======================================================================
echo   SISTEMA ABERTO COM SUCESSO!
echo   Você pode fixar este ícone na Barra de Tarefas ou Menu Iniciar.
echo =======================================================================
timeout /t 3 > nul
exit
