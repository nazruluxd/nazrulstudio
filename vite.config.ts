import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'node:fs';
import path from 'node:path';
import { generateSitemapXml, generateRobotsTxt } from './src/utils/sitemapGenerator';
import { initialData } from './src/data/initialData';

function dynamicSitemapPlugin(): Plugin {
  const siteUrl = process.env.APP_URL || 'https://nazrulstudio.uk';

  return {
    name: 'dynamic-sitemap-generator',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const cleanUrl = req.url?.split('?')[0];
        if (cleanUrl === '/sitemap.xml') {
          const xml = generateSitemapXml(initialData, siteUrl);
          res.setHeader('Content-Type', 'application/xml; charset=utf-8');
          res.setHeader('Cache-Control', 'public, max-age=3600');
          res.statusCode = 200;
          res.end(xml);
          return;
        }
        if (cleanUrl === '/robots.txt') {
          const robots = generateRobotsTxt(siteUrl);
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.statusCode = 200;
          res.end(robots);
          return;
        }
        next();
      });
    },
    buildStart() {
      try {
        const publicDir = path.resolve(process.cwd(), 'public');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }
        fs.writeFileSync(
          path.join(publicDir, 'sitemap.xml'),
          generateSitemapXml(initialData, siteUrl),
          'utf-8'
        );
        fs.writeFileSync(
          path.join(publicDir, 'robots.txt'),
          generateRobotsTxt(siteUrl),
          'utf-8'
        );
      } catch (err) {
        console.warn('Notice: Could not write sitemap to public directory:', err);
      }
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: generateSitemapXml(initialData, siteUrl),
      });
      this.emitFile({
        type: 'asset',
        fileName: 'robots.txt',
        source: generateRobotsTxt(siteUrl),
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), dynamicSitemapPlugin()],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
});
