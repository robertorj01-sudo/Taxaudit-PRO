import React, { useState } from 'react';
import {
  Cloud,
  Globe,
  Server,
  ShieldCheck,
  CheckCircle2,
  Copy,
  ExternalLink,
  Terminal,
  FileCode,
  ArrowRight,
  Zap,
  Lock,
  Layers,
  Sparkles,
  Info,
  ChevronRight,
  Boxes,
  Cpu,
  DownloadCloud
} from 'lucide-react';

export const CloudHostingGuideView: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'hostinger' | 'vercel' | 'netlify' | 'cloudflare' | 'docker' | 'aws'>('hostinger');
  const [copiadoCode, setCopiadoCode] = useState<string | null>(null);

  const copiarTexto = (texto: string, id: string) => {
    navigator.clipboard.writeText(texto);
    setCopiadoCode(id);
    setTimeout(() => setCopiadoCode(null), 2000);
  };

  const HOSTINGER_HTACCESS = `<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>

<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType text/html "access plus 0 seconds"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
</IfModule>`;

  const VERCEL_JSON = `{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-XSS-Protection", "value": "1; mode=block" }
      ]
    }
  ]
}`;

  const NETLIFY_REDIRECTS = `/*    /index.html   200`;

  const DOCKERFILE = `# 1. Estágio de Compilação
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# 2. Estágio de Produção com Servidor Nginx Leve
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]`;

  const NGINX_CONF = `server {
    listen 80;
    server_name localhost;

    root /usr/share/nginx/html;
    index index.html;

    # Suporte a SPA (Single Page Application)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache de arquivos estáticos (CSS, JS, Imagens, Fontes)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, no-transform";
    }

    # Compressão Gzip para carregamento ultrarrápido
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}`;

  return (
    <div id="cloud-hosting-guide-view" className="space-y-6">
      {/* Banner Superior com Resposta Executiva Direta */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guia Oficial de Deploy & Hospedagem em Produção</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Qual o melhor lugar para hospedar o APP online?
          </h1>

          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Por se tratar de uma <strong>Single Page Application (SPA) em React + Vite + TypeScript</strong> com processamento fiscal 100% no cliente (Client-Side), a melhor escolha para 95% dos cenários corporativos é a <strong className="text-white">Vercel</strong> ou <strong className="text-white">Netlify</strong>, seguidas por <strong className="text-white">Docker/Nginx</strong> para redes corporativas fechadas (Intranet).
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">1º Recomendado: Vercel</div>
                <div className="text-[11px] text-slate-300">Deploy em 30s, SSL grátis, CDN Edge</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">2º Recomendado: Cloudflare / Netlify</div>
                <div className="text-[11px] text-slate-300">Banda ilimitada & DDoS Shield</div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">Empresas / Intranet: Docker VPS</div>
                <div className="text-[11px] text-slate-300">100% On-Premise dentro da VPN</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Destaque de Privacidade e Segurança Fiscal (LGPD) */}
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 sm:p-5 flex items-start gap-4 shadow-2xs">
        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5 shadow-sm">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
            <span>Privacidade Máxima &amp; Sigilo Fiscal Garantido (Conformidade com a LGPD)</span>
            <span className="px-2 py-0.5 bg-emerald-200 text-emerald-900 rounded text-[10px] font-bold">100% Client-Side</span>
          </h2>
          <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
            Como toda a lógica tributária, validação de regras de ICMS/PIS/COFINS, leitura de arquivos XML (NF-e, NF3e, NFCom) e manipulação do Certificado Digital A1 ocorrem <strong>diretamente no navegador web do usuário</strong> (IndexedDB / LocalStorage criptografado), você pode hospedar o aplicativo em qualquer CDN ou nuvem estática sem risco de vazamento de segredos industriais, faturamento ou chaves privadas.
          </p>
        </div>
      </div>

      {/* Seletor de Plataforma de Hospedagem */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">Passo a Passo de Instalação &amp; Deploy</h2>
            <p className="text-xs text-slate-500 mt-0.5">Selecione o provedor de sua preferência para ver o roteiro detalhado:</p>
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setActivePlatform('hostinger')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'hostinger'
                  ? 'bg-purple-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5 text-purple-200" />
              <span>1. Hostinger (hPanel / VPS)</span>
            </button>
            <button
              onClick={() => setActivePlatform('vercel')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'vercel'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>2. Vercel</span>
            </button>
            <button
              onClick={() => setActivePlatform('netlify')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'netlify'
                  ? 'bg-cyan-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>3. Netlify</span>
            </button>
            <button
              onClick={() => setActivePlatform('cloudflare')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'cloudflare'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>4. Cloudflare Pages</span>
            </button>
            <button
              onClick={() => setActivePlatform('docker')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'docker'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>5. Docker / Nginx VPS</span>
            </button>
            <button
              onClick={() => setActivePlatform('aws')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activePlatform === 'aws'
                  ? 'bg-orange-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>6. AWS S3 / Amplify</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Conteúdo 0: HOSTINGER */}
          {activePlatform === 'hostinger' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-900 rounded font-bold text-[10px] uppercase">
                    Compatibilidade 100% Nativa (hPanel / LiteSpeed / Cloud / VPS)
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Arquivo .htaccess já incluído no projeto!</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Como hospedar na Hostinger (Hospedagem Web Premium, Business, Cloud ou VPS)
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-4xl leading-relaxed">
                  O <strong>TaxAudit PRO</strong> é uma aplicação 100% compatível com qualquer plano da <strong>Hostinger</strong>. Como o motor tributário, leitor de XML e as consultas de CNPJ na Receita Federal (via BrasilAPI / ReceitaWS) rodam diretamente no navegador via HTTPS, você pode publicar tanto enviando a pasta compilada (<code>dist</code>) para a pasta <code>public_html</code> no <strong>hPanel</strong> quanto conectando via Git/Node.js.
                </p>
              </div>

              {/* Método 1: Upload Direto no public_html */}
              <div className="bg-purple-50/50 border border-purple-200 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-purple-950 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-purple-700 text-white rounded text-xs">MÉTODO A (MAIS FÁCIL)</span>
                    <span>Upload Direto pelo Gerenciador de Arquivos do hPanel (Qualquer Plano Hostinger)</span>
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-2">
                      1
                    </div>
                    <div className="text-xs font-bold text-slate-800">Gerar os Arquivos Web</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      No terminal do seu computador (na pasta do projeto), execute <code>npm install</code> e depois <code>npm run build</code>. Isso criará a pasta <strong>dist/</strong> pronta para a web.
                    </p>
                  </div>

                  <div className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-2">
                      2
                    </div>
                    <div className="text-xs font-bold text-slate-800">Acessar public_html</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Entre no <strong>hPanel da Hostinger</strong> &rarr; <strong>Arquivos</strong> &rarr; <strong>Gerenciador de Arquivos</strong>. Abra a pasta <code>public_html</code> do seu domínio (ou subdomínio, ex: <code>fiscal.seudominio.com.br</code>).
                    </p>
                  </div>

                  <div className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-2">
                      3
                    </div>
                    <div className="text-xs font-bold text-slate-800">Enviar Conteúdo da /dist</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      Apague o arquivo <code>default.php</code> da Hostinger e faça upload de <strong>todos os arquivos de dentro da pasta dist/</strong> (<code>index.html</code>, pasta <code>assets/</code>, <code>.htaccess</code>, <code>manifest.webmanifest</code>) direto na raiz do <code>public_html</code>.
                    </p>
                  </div>

                  <div className="bg-white border border-purple-200/80 rounded-xl p-3.5 shadow-2xs">
                    <div className="w-6 h-6 rounded-lg bg-purple-700 text-white font-black text-xs flex items-center justify-center mb-2">
                      4
                    </div>
                    <div className="text-xs font-bold text-slate-800">Ativar SSL (HTTPS)</div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                      No hPanel em <strong>Segurança &rarr; SSL</strong>, garanta que o Certificado SSL gratuito esteja <strong>Ativo</strong>. Pronto! O sistema e a consulta à Receita Federal já funcionarão online.
                    </p>
                  </div>
                </div>
              </div>

              {/* Método 2: Hostinger Node.js Web App / Git */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-purple-700" />
                    <span>MÉTODO B: Deploy Automático via GitHub / Node.js no hPanel</span>
                  </h4>
                  <ol className="text-xs text-slate-600 mt-2 space-y-1.5 list-decimal list-inside leading-relaxed">
                    <li>Suba o projeto para sua conta do <strong>GitHub</strong>.</li>
                    <li>No hPanel da Hostinger, clique em <strong>Sites &rarr; Adicionar Site &rarr; Aplicativo Web Node.js</strong> (ou <em>Avançado &rarr; Git</em>).</li>
                    <li>Conecte seu repositório do GitHub.</li>
                    <li>A Hostinger detectará automaticamente o <strong>Vite</strong>:
                      <ul className="pl-5 mt-1 list-disc text-[11px] text-slate-500">
                        <li>Comando de Build: <code>npm run build</code></li>
                        <li>Diretório de saída: <code>dist</code></li>
                      </ul>
                    </li>
                    <li>Clique em <strong>Implementar (Deploy)</strong>.</li>
                  </ol>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>O que funciona na Web na Hostinger?</span>
                  </h4>
                  <ul className="text-xs text-slate-600 mt-2 space-y-1.5 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Validação Receita Federal (CNPJ/CPF):</strong> Funciona 100% online consultando as APIs HTTPS (BrasilAPI + ReceitaWS) em tempo real.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Importação de XML, Auditoria, DANFE/DACTE e SPED:</strong> Funcionam 100% com velocidade instantânea.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Sincronização de Pasta Local / Rede (ex: Pasta R:):</strong> Ao abrir o site com HTTPS no Chrome/Edge, o botão <em>Sincronizar Pasta de Rede</em> continua podendo ler pastas do seu computador!</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Arquivo .htaccess para Apache / LiteSpeed da Hostinger */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-purple-400" />
                    <span className="font-mono font-bold">public/.htaccess (Já configurado no projeto para o servidor LiteSpeed da Hostinger)</span>
                  </div>
                  <button
                    onClick={() => copiarTexto(HOSTINGER_HTACCESS, 'htaccess')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoCode === 'htaccess' ? 'Copiado!' : 'Copiar .htaccess'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                  {HOSTINGER_HTACCESS}
                </pre>
              </div>
            </div>
          )}

          {/* Conteúdo 1: VERCEL */}
          {activePlatform === 'vercel' && (
            <div className="space-y-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[10px] uppercase">
                      Classificação: Nota 10/10
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Plano Gratuito Perpétuo Disponível</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    Como hospedar na Vercel (Método Mais Rápido &amp; Confiável)
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                    A Vercel é a criadora do Next.js e a líder global em hospedagem de aplicações React/Vite. Ela oferece deploy contínuo integrado ao GitHub, certificado SSL automático (HTTPS), rede global de borda (CDN Edge) com nós em São Paulo (menor latência do Brasil) e suporte nativo ao PWA.
                  </p>
                </div>
              </div>

              {/* Roteiro em 3 Passos */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center mb-2.5">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Enviar para o GitHub</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Suba este projeto para um repositório no GitHub, GitLab ou Bitbucket (público ou privado da empresa).
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center mb-2.5">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Conectar na Vercel</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Acesse <strong>vercel.com</strong>, clique em <em>Add New &gt; Project</em> e importe o repositório. O preset Vite é detectado automaticamente.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="w-7 h-7 rounded-lg bg-slate-900 text-white font-black text-xs flex items-center justify-center mb-2.5">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">Deploy &amp; Domínio</h4>
                  <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                    Clique em <strong>Deploy</strong>. Em 30 segundos seu sistema estará no ar com link tipo <code>suaempresa.vercel.app</code> e você poderá apontar seu domínio próprio (ex: <code>fiscal.suaempresa.com.br</code>).
                  </p>
                </div>
              </div>

              {/* Arquivo vercel.json */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span className="font-mono font-bold">vercel.json (Para roteamento SPA na raiz)</span>
                  </div>
                  <button
                    onClick={() => copiarTexto(VERCEL_JSON, 'vercel')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoCode === 'vercel' ? 'Copiado!' : 'Copiar Arquivo'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                  {VERCEL_JSON}
                </pre>
              </div>

              {/* Linha de Comando Vercel CLI (Opcional) */}
              <div className="bg-slate-100 rounded-xl p-4 border border-slate-300/80">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5 mb-2">
                  <Terminal className="w-4 h-4 text-slate-700" />
                  <span>Deploy Instantâneo via Terminal (Vercel CLI):</span>
                </div>
                <div className="flex items-center justify-between bg-slate-900 text-slate-100 p-2.5 rounded-lg font-mono text-xs">
                  <code>npm i -g vercel &amp;&amp; vercel --prod</code>
                  <button
                    onClick={() => copiarTexto('npm i -g vercel && vercel --prod', 'cli-vercel')}
                    className="text-slate-400 hover:text-white px-2 py-0.5 rounded transition"
                  >
                    {copiadoCode === 'cli-vercel' ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo 2: NETLIFY */}
          {activePlatform === 'netlify' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded font-bold text-[10px] uppercase">
                    Classificação: Nota 9.5/10
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Deploy via Drag &amp; Drop ou Git</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Como hospedar na Netlify</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  A Netlify é uma das pioneiras no modelo Jamstack e oferece o método de deploy mais simples do mundo: basta arrastar a pasta <code>dist</code> gerada pelo comando <code>npm run build</code> diretamente no painel web, sem necessidade de configurar Git.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <DownloadCloud className="w-4 h-4 text-cyan-600" />
                    <span>Opção A: Arrastar e Soltar (Sem Terminal)</span>
                  </h4>
                  <ol className="text-xs text-slate-600 mt-2 space-y-1.5 list-decimal list-inside">
                    <li>Rode no seu computador: <code>npm run build</code></li>
                    <li>Acesse <strong>app.netlify.com/drop</strong></li>
                    <li>Arraste a pasta gerada <strong>/dist</strong> para a janela do navegador</li>
                    <li>Pronto! Seu site está online com HTTPS garantido.</li>
                  </ol>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-cyan-600" />
                    <span>Opção B: Deploy Contínuo Git</span>
                  </h4>
                  <ol className="text-xs text-slate-600 mt-2 space-y-1.5 list-decimal list-inside">
                    <li>Conecte seu repositório no GitHub</li>
                    <li>Build command: <code>npm run build</code></li>
                    <li>Publish directory: <code>dist</code></li>
                    <li>Toda atualização no GitHub fará deploy automático.</li>
                  </ol>
                </div>
              </div>

              {/* Arquivo _redirects */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold">public/_redirects (Para Netlify SPA)</span>
                  </div>
                  <button
                    onClick={() => copiarTexto(NETLIFY_REDIRECTS, 'netlify')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoCode === 'netlify' ? 'Copiado!' : 'Copiar'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs">
                  {NETLIFY_REDIRECTS}
                </pre>
              </div>
            </div>
          )}

          {/* Conteúdo 3: CLOUDFLARE PAGES */}
          {activePlatform === 'cloudflare' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-900 rounded font-bold text-[10px] uppercase">
                    Classificação: Nota 9.5/10
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Banda Ilimitada Gratuita</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Como hospedar no Cloudflare Pages</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  O Cloudflare Pages é perfeito para alta demanda corporativa. Possui a maior rede de proteção contra ataques DDoS do mundo e não impõe limite de largura de banda no plano gratuito, com datacenters diretos nas principais capitais do Brasil.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4.5 space-y-3">
                <h4 className="text-xs font-bold text-slate-800">Passos para Deploy no Cloudflare:</h4>
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">1.</span>
                    <span>Crie uma conta em <strong>dash.cloudflare.com</strong> e vá em <em>Workers &amp; Pages</em> &gt; <em>Create application</em>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">2.</span>
                    <span>Conecte com seu repositório Git.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">3.</span>
                    <span>Selecione o Framework preset: <strong>Vite</strong>.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-amber-700">4.</span>
                    <span>Output directory: <code>dist</code>. Clique em <em>Save and Deploy</em>.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Conteúdo 4: DOCKER / NGINX VPS */}
          {activePlatform === 'docker' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-900 rounded font-bold text-[10px] uppercase">
                    Padrão Corporativo On-Premise
                  </span>
                  <span className="text-xs text-slate-500 font-medium">Intranet / VPN / Servidor Próprio</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  Como hospedar em Servidor Próprio (Docker + Nginx / VPS Linux / Windows Server)
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Ideal para indústrias, estatais e corporações com políticas severas de Compliance em que sistemas com certificados digitais e apuração fiscal não podem ficar em nuvem pública de terceiros.
                </p>
              </div>

              {/* Dockerfile */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <Boxes className="w-4 h-4 text-blue-400" />
                    <span className="font-mono font-bold">Dockerfile (Multi-Stage Build Otimizado)</span>
                  </div>
                  <button
                    onClick={() => copiarTexto(DOCKERFILE, 'dockerfile')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoCode === 'dockerfile' ? 'Copiado!' : 'Copiar Dockerfile'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                  {DOCKERFILE}
                </pre>
              </div>

              {/* nginx.conf */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-900 px-4 py-2.5 flex items-center justify-between text-white text-xs">
                  <div className="flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span className="font-mono font-bold">nginx.conf (Configuração de Alta Performance)</span>
                  </div>
                  <button
                    onClick={() => copiarTexto(NGINX_CONF, 'nginxconf')}
                    className="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-medium transition flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>{copiadoCode === 'nginxconf' ? 'Copiado!' : 'Copiar nginx.conf'}</span>
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 text-slate-200 font-mono text-xs overflow-x-auto">
                  {NGINX_CONF}
                </pre>
              </div>

              <div className="bg-slate-100 p-4 rounded-xl border border-slate-300 text-xs text-slate-700 space-y-2">
                <div className="font-bold">Comandos de Inicialização do Docker:</div>
                <code className="block bg-slate-900 text-slate-100 p-2.5 rounded font-mono">
                  docker build -t taxaudit-pro . &amp;&amp; docker run -d -p 80:80 --name taxaudit-app taxaudit-pro
                </code>
              </div>
            </div>
          )}

          {/* Conteúdo 5: AWS S3 / AMPLIFY */}
          {activePlatform === 'aws' && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-900 rounded font-bold text-[10px] uppercase">
                    Padrão Enterprise AWS
                  </span>
                  <span className="text-xs text-slate-500 font-medium">SLA 99.99% &amp; SOC2 Compliant</span>
                </div>
                <h3 className="text-base font-bold text-slate-900 mt-1">Como hospedar na Amazon Web Services (AWS)</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-3xl leading-relaxed">
                  Para empresas que já utilizam a infraestrutura da AWS. Existem duas abordagens consolidadas: <strong>AWS Amplify</strong> (automático com 1 clique) ou <strong>Amazon S3 + CloudFront CDN</strong> (máxima economia e controle).
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800">1. AWS Amplify (Mais Simples)</h4>
                  <p className="text-slate-500 mt-1">
                    Conecte o repositório Git no console do AWS Amplify. Defina a pasta de saída como <code>dist</code>. O Amplify cuidará da distribuição global e certificados SSL automaticamente.
                  </p>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-800">2. AWS S3 + CloudFront</h4>
                  <p className="text-slate-500 mt-1">
                    Crie um bucket S3 configurado como Static Website Hosting. Aponte uma distribuição CloudFront com Error Page personalizada redirecionando HTTP 404/403 para <code>/index.html</code> (código 200).
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Matriz Comparativa de Hospedagem */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200">
          <h3 className="text-sm font-bold text-slate-800">Tabela Comparativa de Opções de Hospedagem</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold">
              <tr>
                <th className="p-3">Provedor</th>
                <th className="p-3">Custo Inicial</th>
                <th className="p-3">Tempo de Deploy</th>
                <th className="p-3">Certificado SSL</th>
                <th className="p-3">Instalação PWA</th>
                <th className="p-3">Rede Interna (VPN)</th>
                <th className="p-3">Recomendação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="bg-emerald-50/50">
                <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Vercel
                </td>
                <td className="p-3 text-emerald-700 font-semibold">Grátis (Hobby)</td>
                <td className="p-3 font-mono">~30 seg</td>
                <td className="p-3 text-emerald-700 font-bold">Automático (Let's Encrypt)</td>
                <td className="p-3 text-emerald-700 font-bold">100% Suportado</td>
                <td className="p-3 text-slate-400">Não (Público)</td>
                <td className="p-3 font-bold text-emerald-800">Nº 1 Geral</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Netlify</td>
                <td className="p-3 text-cyan-700 font-semibold">Grátis (Starter)</td>
                <td className="p-3 font-mono">~45 seg</td>
                <td className="p-3 text-emerald-700 font-bold">Automático</td>
                <td className="p-3 text-emerald-700 font-bold">100% Suportado</td>
                <td className="p-3 text-slate-400">Não (Público)</td>
                <td className="p-3 text-slate-700">Excelente Alternativa</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Cloudflare Pages</td>
                <td className="p-3 text-amber-700 font-semibold">Grátis (Banda Ilimitada)</td>
                <td className="p-3 font-mono">~1 min</td>
                <td className="p-3 text-emerald-700 font-bold">Automático</td>
                <td className="p-3 text-emerald-700 font-bold">100% Suportado</td>
                <td className="p-3 text-slate-400">Não (Público)</td>
                <td className="p-3 text-slate-700">Melhor para Alto Tráfego</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">Docker VPS / On-Premise</td>
                <td className="p-3 text-blue-700 font-semibold">Custo do Servidor / VPS</td>
                <td className="p-3 font-mono">~5 min</td>
                <td className="p-3 text-slate-600">Configurável no Nginx</td>
                <td className="p-3 text-emerald-700 font-bold">Suportado com HTTPS</td>
                <td className="p-3 text-emerald-700 font-bold">100% Intranet / VPN</td>
                <td className="p-3 font-bold text-blue-800">Melhor para Intranet</td>
              </tr>
              <tr>
                <td className="p-3 font-bold text-slate-900">AWS (S3 + CloudFront / Amplify)</td>
                <td className="p-3 text-orange-700 font-semibold">Free Tier / Pague pelo uso</td>
                <td className="p-3 font-mono">~3 min</td>
                <td className="p-3 text-emerald-700 font-bold">AWS ACM Grátis</td>
                <td className="p-3 text-emerald-700 font-bold">100% Suportado</td>
                <td className="p-3 text-emerald-700">Sim (via AWS VPC)</td>
                <td className="p-3 text-slate-700">Padrão Grandes Empresas</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
