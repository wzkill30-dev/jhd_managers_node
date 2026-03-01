import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';
import { extractMatchData } from './llm-service.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const upload = multer({ dest: 'uploads/' });

// Middlewares - JSON deve vir antes das rotas
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API devem vir ANTES do static
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }

    const imagePath = req.file.path;
    const matchDate = req.body.matchDate || new Date().toISOString().split('T')[0];
    const matchData = await extractMatchData(imagePath);
    
    const matchId = db.insertMatch(matchData, matchDate);

    res.json({ success: true, matchId, data: matchData });
  } catch (error) {
    console.error('Erro:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/matches', (req, res) => {
  const matches = db.getAllMatches();
  res.json(matches.reverse());
});

app.delete('/api/matches/:id', (req, res) => {
  try {
    const matchId = parseInt(req.params.id);
    console.log('Excluindo partida ID:', matchId);
    db.deleteMatch(matchId);
    res.json({ success: true, message: 'Partida excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    res.status(500).json({ error: error.message });
  }
});

// Static files por último
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`API Key configurada: ${process.env.GROQ_API_KEY ? 'Sim' : 'Não'}`);
});
