import express from 'express';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const httpServer = http.createServer(app);

// Vite middleware for development or static file serving for production
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const isHmrDisabled = process.env.DISABLE_HMR === 'true';

  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: isHmrDisabled ? false : { server: httpServer },
      watch: isHmrDisabled ? null : {},
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

const PORT = Number(process.env.PORT) || 3000;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`Sama3 offline static server running on port ${PORT}`);
});
