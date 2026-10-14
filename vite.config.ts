import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import {defineConfig, Plugin} from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// LINT.IfChange(aistudio_media_plugin)
function aistudioMediaPlugin(): Plugin {
  return {
    name: 'vite-plugin-aistudio-media',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith('/assets/aistudio/')) {
          const rawPath = req.url.split('?')[0].split('#')[0];
          try {
            const decodedPath = decodeURIComponent(rawPath);
            const relativePath = decodedPath.replace(/^\//, '');
            const aistudioDir = path.resolve(
              __dirname,
              'public',
              'assets',
              'aistudio',
            );
            const filePath = path.resolve(__dirname, 'public', relativePath);
            if (
              filePath.startsWith(aistudioDir + path.sep) &&
              fs.existsSync(filePath) &&
              fs.statSync(filePath).isFile()
            ) {
              const ext = path.extname(filePath).toLowerCase();
              const mimeMap: Record<string, string> = {
                '.jpg': 'image/jpeg',
                '.jpeg': 'image/jpeg',
                '.png': 'image/png',
                '.gif': 'image/gif',
                '.webp': 'image/webp',
                '.svg': 'image/svg+xml',
                '.bmp': 'image/bmp',
                '.ico': 'image/x-icon',
                '.mp4': 'video/mp4',
                '.webm': 'video/webm',
                '.ogv': 'video/ogg',
                '.mp3': 'audio/mpeg',
                '.wav': 'audio/wav',
                '.ogg': 'audio/ogg',
                '.pdf': 'application/pdf',
              };
              res.setHeader(
                'Content-Type',
                mimeMap[ext] || 'application/octet-stream',
              );
              res.setHeader('Cache-Control', 'no-cache');
              fs.createReadStream(filePath).pipe(res);
              return;
            }
          } catch {
            // Fall through if URI decoding or file access fails
          }
        }
        next();
      });
    },
  };
}
// LINT.ThenChange(//depot/google3/java/com/google/alkali/boq/makersuite/applet_dev_service/templates/initializers/react_theme/vite.config.ts:aistudio_media_plugin)

function localFolderSyncPlugin(): Plugin {
  return {
    name: 'vite-plugin-local-folder-sync',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === '/api/pastas/sincronizar' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { caminho } = JSON.parse(body || '{}');
              if (!caminho) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ sucesso: false, erro: 'Caminho não fornecido' }));
                return;
              }

              if (!fs.existsSync(caminho)) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(
                  JSON.stringify({
                    sucesso: false,
                    caminho,
                    erro: `Diretório não encontrado: ${caminho}. Quando executado no computador local com drive de rede mapeado, a leitura é direta. No preview em nuvem, use o Seletor de Pastas do Navegador.`
                  })
                );
                return;
              }

              const files = fs.readdirSync(caminho);
              const xmlFiles = files.filter(f => f.toLowerCase().endsWith('.xml'));
              const arquivos: Array<{ nomeArquivo: string; tamanho: number; conteudoXml: string }> = [];

              for (const file of xmlFiles) {
                const fullPath = path.join(caminho, file);
                try {
                  const stat = fs.statSync(fullPath);
                  if (stat.isFile()) {
                    const conteudoXml = fs.readFileSync(fullPath, 'utf-8');
                    arquivos.push({
                      nomeArquivo: file,
                      tamanho: stat.size,
                      conteudoXml
                    });
                  }
                } catch {
                  // ignorar erros em arquivos individuais protegidos
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  sucesso: true,
                  caminho,
                  totalEncontrados: xmlFiles.length,
                  arquivos
                })
              );
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ sucesso: false, erro: err.message }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

function internalDatabasePlugin(): Plugin {
  const dataDir = path.resolve(__dirname, 'data');
  const vaultDir = path.resolve(dataDir, 'xml_vault');
  const dbFile = path.resolve(dataDir, 'banco_interno_fiscal.json');

  const ensureDirs = () => {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(vaultDir)) {
      fs.mkdirSync(vaultDir, { recursive: true });
    }
  };

  const getDbData = () => {
    ensureDirs();
    if (!fs.existsSync(dbFile)) {
      return null;
    }
    try {
      const raw = fs.readFileSync(dbFile, 'utf-8');
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const saveDbData = (data: any) => {
    ensureDirs();
    fs.writeFileSync(dbFile, JSON.stringify(data, null, 2), 'utf-8');
  };

  return {
    name: 'vite-plugin-internal-fiscal-database',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url || !req.url.startsWith('/api/banco/')) {
          return next();
        }

        const urlPath = req.url.split('?')[0];

        // 1. Status do banco interno
        if (urlPath === '/api/banco/status' && req.method === 'GET') {
          ensureDirs();
          const dbData = getDbData();
          let fileSize = 0;
          let mtime = new Date().toISOString();
          if (fs.existsSync(dbFile)) {
            const stat = fs.statSync(dbFile);
            fileSize = stat.size;
            mtime = stat.mtime.toISOString();
          }

          let vaultCount = 0;
          if (fs.existsSync(vaultDir)) {
            vaultCount = fs.readdirSync(vaultDir).filter(f => f.endsWith('.xml')).length;
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              sucesso: true,
              conectado: true,
              motor: 'Servidor Local Node.js + FileSystem Atômico',
              caminhoArquivo: 'data/banco_interno_fiscal.json',
              caminhoCofreXml: 'data/xml_vault/',
              tamanhoBytes: fileSize,
              ultimaModificacao: mtime,
              registros: {
                documentos: dbData?.documentos?.length || 0,
                arquivosXml: (dbData?.arquivosXml?.length || 0) + vaultCount,
                usuarios: dbData?.usuarios?.length || 0,
                logs: dbData?.logs?.length || 0,
                empresaConfigurada: !!dbData?.empresa
              }
            })
          );
          return;
        }

        // 2. Carregar dados do banco interno
        if (urlPath === '/api/banco/dados' && req.method === 'GET') {
          const dbData = getDbData();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              sucesso: true,
              dados: dbData || null
            })
          );
          return;
        }

        // 3. Salvar lote completo de dados no banco interno
        if (urlPath === '/api/banco/salvar' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const payload = JSON.parse(body || '{}');
              ensureDirs();
              const existing = getDbData() || {};
              const merged = {
                ...existing,
                ...payload,
                ultimaAtualizacao: new Date().toISOString(),
                versaoBanco: 'TAXAUDIT_DB_V2'
              };
              saveDbData(merged);

              // Salvar arquivos XML no cofre do disco se fornecidos
              if (Array.isArray(payload.arquivosXmlNovos)) {
                for (const item of payload.arquivosXmlNovos) {
                  if (item.nomeArquivo && item.conteudoXml) {
                    const safeName = item.nomeArquivo.replace(/[^a-zA-Z0-9_.-]/g, '_');
                    fs.writeFileSync(path.join(vaultDir, safeName), item.conteudoXml, 'utf-8');
                  }
                }
              }

              const stat = fs.statSync(dbFile);
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  sucesso: true,
                  mensagem: 'Dados cadastrados e documentos salvos com sucesso no Banco de Dados Interno!',
                  tamanhoBytes: stat.size,
                  timestamp: merged.ultimaAtualizacao
                })
              );
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ sucesso: false, erro: err.message }));
            }
          });
          return;
        }

        // 4. Salvar arquivo XML individual no cofre do banco interno
        if (urlPath === '/api/banco/xml/salvar' && req.method === 'POST') {
          let body = '';
          req.on('data', chunk => {
            body += chunk;
          });
          req.on('end', () => {
            try {
              const { arquivoXml } = JSON.parse(body || '{}');
              if (!arquivoXml || !arquivoXml.conteudoXml) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ sucesso: false, erro: 'Arquivo XML inválido' }));
                return;
              }

              ensureDirs();
              const safeName = (arquivoXml.nomeArquivo || `${arquivoXml.chaveAcesso || 'doc'}.xml`).replace(
                /[^a-zA-Z0-9_.-]/g,
                '_'
              );
              fs.writeFileSync(path.join(vaultDir, safeName), arquivoXml.conteudoXml, 'utf-8');

              // Atualizar no banco interno
              const db = getDbData() || { arquivosXml: [] };
              if (!Array.isArray(db.arquivosXml)) {
                db.arquivosXml = [];
              }
              const idx = db.arquivosXml.findIndex((x: any) => x.id === arquivoXml.id || x.chaveAcesso === arquivoXml.chaveAcesso);
              if (idx >= 0) {
                db.arquivosXml[idx] = arquivoXml;
              } else {
                db.arquivosXml.unshift(arquivoXml);
              }
              db.ultimaAtualizacao = new Date().toISOString();
              saveDbData(db);

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(
                JSON.stringify({
                  sucesso: true,
                  mensagem: `Arquivo XML ${safeName} guardado no Cofre de XMLs do Banco Interno!`,
                  arquivo: arquivoXml
                })
              );
            } catch (err: any) {
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ sucesso: false, erro: err.message }));
            }
          });
          return;
        }

        // 5. Listar arquivos do cofre XML
        if (urlPath === '/api/banco/xml/listar' && req.method === 'GET') {
          ensureDirs();
          const db = getDbData();
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              sucesso: true,
              arquivos: db?.arquivosXml || []
            })
          );
          return;
        }

        next();
      });
    }
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      aistudioMediaPlugin(),
      localFolderSyncPlugin(),
      internalDatabasePlugin(),
      VitePWA({
        registerType: 'autoUpdate',
        manifest: false,
        devOptions: {
          enabled: true,
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,webmanifest}'],
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
