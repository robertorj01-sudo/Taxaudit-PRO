# GUIA DE INSTALAÇÃO E EXECUÇÃO - GEPAT.F / INB

**Local do Arquivo:** `R:\GEPAT.F$\006. NOTAS FISCAIS DE ENTRADA PCVNF GEPAT.F`

Este sistema de Gestão e Escrituração Fiscal foi desenvolvido especificamente para atender a **Gerência de Planejamento Tributário (GEPAT.F)** das **Indústrias Nucleares do Brasil (INB S/A)**, com integração nativa às notas fiscais da pasta corporativa de rede.

---

## 🚀 Método 1: Instalação com 1 Clique via Microsoft Edge (Recomendado)

O Microsoft Edge é o navegador padrão dos computadores da INB e possui suporte nativo a **Web Desktop PWA**:

1. Abra o sistema no Edge através do endereço da aplicação.
2. Observe a barra de endereços (ao lado dos favoritos): aparecerá o ícone de instalação:
   - **`⊞ Aplicativo disponível`** &rarr; clique em **"Instalar GESTÃO FISCAL GEPAT.F"**.
3. O Edge perguntará se você deseja:
   - ✅ **Fixar na barra de tarefas** (o ícone da INB ficará fixo na barra do Windows).
   - ✅ **Criar atalho na Área de Trabalho** (para abrir direto com 2 cliques).
   - ✅ **Fixar em Iniciar**.
4. **Vantagens**:
   - Não precisa de permissão de Administrador nem chamado para a TI.
   - Abre em **janela independente**, sem cara de navegador e sem barra de URL.

---

## ⚡ Método 2: Executar Direto pelo Arquivo .BAT na Pasta R:\

Dentro da pasta `R:\GEPAT.F$\006. NOTAS FISCAIS DE ENTRADA PCVNF GEPAT.F\`:

- **Para abrir o sistema**: Dê 2 cliques no arquivo `INICIAR_GEPAT_DESKTOP.bat`.
- **Para criar o ícone na sua Área de Trabalho**: Dê 2 cliques no arquivo `INSTALAR_ATALHO_WINDOWS.bat`.

---

## 🛡️ Segurança e Acesso Restrito

1. **Acesso Restrito ao Setor Fiscal**: O sistema herda as credenciais do Windows. Apenas funcionários com acesso liberado à pasta de rede `R:\GEPAT.F$\` conseguem carregar e auditar os arquivos XML de notas fiscais.
2. **Privacidade e Sigilo**: Todo o cálculo de ICMS, PIS, COFINS, IPI e SPED Fiscal é executado localmente na rede interna da INB, sem envio de dados fiscais para servidores externos.
