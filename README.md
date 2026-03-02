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
- Conta no Firebase (plano gratuito)

## 🔧 Instalação

### 1. Clone o repositório:
```bash
git clone https://github.com/wzkill30-dev/jhd_managers_node.git
cd jhd_managers_node
```

### 2. Instale as dependências:
```bash
npm install
```

### 3. Configure o Firebase:

#### 3.1. Crie um projeto no Firebase:
1. Acesse [Firebase Console](https://console.firebase.google.com/)
2. Clique em "Adicionar projeto"
3. Dê um nome ao projeto (ex: "jhd-managers")
4. Desabilite o Google Analytics (opcional)
5. Clique em "Criar projeto"

#### 3.2. Ative o Firestore:
1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados"
3. Escolha "Iniciar no modo de produção"
4. Selecione a localização (ex: southamerica-east1 para São Paulo)
5. Clique em "Ativar"

#### 3.3. Gere as credenciais:
1. No Firebase Console, clique no ícone de engrenagem ⚙️ → "Configurações do projeto"
2. Vá na aba "Contas de serviço"
3. Clique em "Gerar nova chave privada"
4. Salve o arquivo JSON baixado como `firebase-credentials.json` na raiz do projeto

### 4. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

Edite o arquivo `.env`:
```
GROQ_API_KEY=sua_chave_groq_aqui
PORT=3000
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
```

### 5. Inicie o servidor:
```bash
npm start
```

### 6. Acesse: 
http://localhost:3000

## 🌐 Deploy no Render

### Passo a Passo:

1. **Prepare o repositório:**
   - Faça commit de todas as alterações (exceto firebase-credentials.json)
   - Push para o GitHub

2. **Crie um Web Service no Render:**
   - Acesse [Render](https://render.com)
   - Dashboard → New → Web Service
   - Conecte seu repositório GitHub
   - Configurações:
     - Name: `jhd-managers`
     - Environment: `Node`
     - Build Command: `npm install`
     - Start Command: `npm start`
     - Plan: Free

3. **Configure as variáveis de ambiente:**
   - `GROQ_API_KEY`: Sua chave da API Groq
   - `FIREBASE_SERVICE_ACCOUNT_PATH`: `/etc/secrets/firebase-credentials.json`
   - `NODE_ENV`: `production`

4. **Adicione o arquivo de credenciais como Secret File:**
   - No painel do seu Web Service no Render
   - Vá em "Environment" → "Secret Files"
   - Clique em "Add Secret File"
   - Filename: `firebase-credentials.json`
   - Contents: Cole todo o conteúdo do seu arquivo firebase-credentials.json
   - Clique em "Save"

5. **Deploy automático será iniciado!**

### Alternativa: Variável de ambiente única

Se preferir, pode colocar todo o JSON das credenciais em uma única variável:

1. No Render, adicione a variável `FIREBASE_CREDENTIALS` com o conteúdo completo do JSON
2. Modifique o `database.js` para ler desta variável (se necessário)

## 📊 Tecnologias

- Node.js + Express
- Groq SDK (LLM Vision - llama-4-scout-17b-16e-instruct)
- Firebase Firestore (banco de dados NoSQL)
- HTML/CSS/JavaScript

## 🔒 Segurança

- Nunca commite o arquivo `firebase-credentials.json`
- Mantenha suas chaves de API seguras
- Use variáveis de ambiente em produção

## 📝 Licença

MIT

## 👤 Autor

JHD Managers Team
