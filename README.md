# JHD Managers

Sistema de análise automática de partidas do EA FC 26 usando IA.

## 🚀 Funcionalidades

- Upload de imagens de resumo de partidas
- Extração automática de dados usando LLM (Groq)
- Análise tática gerada por IA
- Histórico completo de partidas
- Dashboard com estatísticas detalhadas
- Design responsivo (mobile-friendly)

## 📋 Pré-requisitos

- Node.js 18 ou superior
- Conta no Groq (API gratuita)

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone https://github.com/wzkill30-dev/jhd_managers_node.git
cd jhd_managers_node
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Adicione sua API key do Groq no arquivo `.env`:
```
GROQ_API_KEY=sua_chave_aqui
PORT=3000
```

5. Inicie o servidor:
```bash
npm start
```

6. Acesse: http://localhost:3000

## 🌐 Deploy

O projeto está configurado para deploy no Render, Railway ou Fly.io.

### Variáveis de Ambiente Necessárias:
- `GROQ_API_KEY`: Chave da API Groq
- `PORT`: Porta do servidor (opcional, padrão: 3000)

## 📊 Tecnologias

- Node.js + Express
- Groq SDK (LLM Vision)
- SQLite (JSON)
- HTML/CSS/JavaScript

## 📝 Licença

MIT

## 👤 Autor

JHD Managers Team
