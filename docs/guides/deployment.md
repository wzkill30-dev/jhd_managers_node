# Guia de Deploy em Produção

> Última atualização: 2024

## Visão Geral

Este guia fornece instruções completas para fazer deploy do JHD Managers em produção. O sistema pode ser implantado em diversas plataformas, incluindo Render, Heroku, Railway e VPS próprio.

## Índice

- [Preparação para Deploy](#preparação-para-deploy)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy no Render](#deploy-no-render)
- [Deploy no Heroku](#deploy-no-heroku)
- [Deploy no Railway](#deploy-no-railway)
- [Deploy em VPS](#deploy-em-vps)
- [Configurações de Segurança](#configurações-de-segurança)
- [Requisitos de Recursos](#requisitos-de-recursos)
- [Checklist Pós-Deploy](#checklist-pós-deploy)
- [Backup do Firestore](#backup-do-firestore)
- [Domínio Customizado e HTTPS](#domínio-customizado-e-https)

## Preparação para Deploy

### Checklist Pré-Deploy

Antes de fazer deploy, verifique:

- [ ] Código testado localmente e funcionando
- [ ] Todas as dependências listadas no `package.json`
- [ ] Variáveis de ambiente documentadas
- [ ] Credenciais do Firebase obtidas
- [ ] API Key do Groq obtida
- [ ] `.gitignore` configurado corretamente
- [ ] Arquivo `firebase-credentials.json` NÃO commitado
- [ ] Arquivo `.env` NÃO commitado

### Arquivos Necessários

**package.json:**
```json
{
  "name": "jhd-managers",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "dotenv": "^16.0.0",
    "express": "^4.18.0",
    "firebase-admin": "^11.0.0",
    "groq-sdk": "^0.3.0",
    "multer": "^1.4.5-lts.1"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**.gitignore:**
```
node_modules/
uploads/
.env
firebase-credentials.json
*.log
.DS_Store
```

## Variáveis de Ambiente

### Variáveis Necessárias em Produção

| Variável | Descrição | Obrigatória | Exemplo |
|----------|-----------|-------------|---------|
| `PORT` | Porta do servidor | Não (padrão: 3000) | `3000` |
| `GROQ_API_KEY` | Chave da API Groq | Sim | `gsk_...` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Caminho para credenciais Firebase | Não (padrão: `./firebase-credentials.json`) | `./firebase-credentials.json` |

### Configuração de Credenciais do Firebase

**Opção 1: Arquivo JSON (Recomendado para VPS)**

1. Faça upload do arquivo `firebase-credentials.json` para o servidor
2. Configure a variável `FIREBASE_SERVICE_ACCOUNT_PATH` com o caminho

**Opção 2: Variável de Ambiente (Recomendado para PaaS)**

1. Converta o conteúdo do arquivo JSON para string:
```bash
cat firebase-credentials.json | tr -d '\n'
```

2. Configure a variável `FIREBASE_SERVICE_ACCOUNT_JSON` com o conteúdo

3. Modifique `database.js` para usar a variável:
```javascript
let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
  // Produção: usar variável de ambiente
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  // Desenvolvimento: usar arquivo
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-credentials.json';
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
}
```

## Deploy no Render

### Passo 1: Preparar Repositório

1. Certifique-se de que o código está no GitHub
2. Verifique se `.gitignore` está configurado corretamente

### Passo 2: Criar Web Service

1. Acesse [render.com](https://render.com)
2. Clique em "New +" → "Web Service"
3. Conecte seu repositório GitHub
4. Configure:
   - **Name**: `jhd-managers`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (ou pago para melhor performance)

### Passo 3: Configurar Variáveis de Ambiente

No painel do Render, vá em "Environment":

```
GROQ_API_KEY=sua_chave_groq_aqui
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

> ⚠️ **Importante**: Cole o JSON do Firebase em uma única linha, sem quebras.

### Passo 4: Deploy

1. Clique em "Create Web Service"
2. Aguarde o build e deploy (5-10 minutos)
3. Acesse a URL fornecida pelo Render

### Passo 5: Verificar

```bash
curl https://seu-app.onrender.com/api/matches
```

### Configurações Adicionais no Render

**Disco Persistente (para uploads):**
1. Vá em "Disks"
2. Adicione um disco montado em `/uploads`
3. Tamanho: 1GB (suficiente para ~1000 imagens)

**Auto-Deploy:**
- Ativado por padrão
- Cada push no GitHub faz deploy automático

**Health Checks:**
- Render verifica automaticamente se o servidor está respondendo
- Reinicia automaticamente em caso de falha

## Deploy no Heroku

### Passo 1: Instalar Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows
# Baixar instalador em: https://devcenter.heroku.com/articles/heroku-cli

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Passo 2: Login e Criar App

```bash
# Login
heroku login

# Criar app
heroku create jhd-managers

# Ou usar nome customizado
heroku create seu-nome-unico
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Groq API Key
heroku config:set GROQ_API_KEY=sua_chave_groq_aqui

# Firebase Credentials (JSON em uma linha)
heroku config:set FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"..."}'
```

### Passo 4: Adicionar Buildpack

```bash
heroku buildpacks:set heroku/nodejs
```

### Passo 5: Deploy

```bash
# Adicionar remote do Heroku (se não foi criado automaticamente)
heroku git:remote -a jhd-managers

# Deploy
git push heroku main
```

### Passo 6: Verificar

```bash
# Ver logs
heroku logs --tail

# Abrir app no navegador
heroku open

# Testar API
curl https://jhd-managers.herokuapp.com/api/matches
```

### Configurações Adicionais no Heroku

**Escalar Dynos:**
```bash
# Ver status
heroku ps

# Escalar para 1 dyno web
heroku ps:scale web=1
```

**Adicionar Add-ons (opcional):**
```bash
# Papertrail para logs
heroku addons:create papertrail

# New Relic para monitoramento
heroku addons:create newrelic
```

## Deploy no Railway

### Passo 1: Criar Conta

1. Acesse [railway.app](https://railway.app)
2. Faça login com GitHub

### Passo 2: Criar Projeto

1. Clique em "New Project"
2. Selecione "Deploy from GitHub repo"
3. Escolha seu repositório

### Passo 3: Configurar Variáveis

1. Vá em "Variables"
2. Adicione:
```
GROQ_API_KEY=sua_chave_groq_aqui
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}
```

### Passo 4: Deploy

- Deploy acontece automaticamente
- Railway detecta Node.js e executa `npm install` e `npm start`

### Passo 5: Obter URL

1. Vá em "Settings"
2. Clique em "Generate Domain"
3. Acesse a URL fornecida

### Configurações Adicionais no Railway

**Volumes (para uploads):**
1. Vá em "Volumes"
2. Adicione volume montado em `/uploads`

**Custom Domain:**
1. Vá em "Settings" → "Domains"
2. Adicione seu domínio customizado

## Deploy em VPS

### Requisitos do Servidor

- **OS**: Ubuntu 20.04+ ou similar
- **RAM**: Mínimo 512MB (recomendado 1GB+)
- **CPU**: 1 vCPU
- **Disco**: 10GB
- **Node.js**: 18.0.0+

### Passo 1: Preparar Servidor

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar PM2 (gerenciador de processos)
sudo npm install -g pm2
```

### Passo 2: Clonar Repositório

```bash
# Criar diretório
mkdir -p /var/www
cd /var/www

# Clonar repositório
git clone https://github.com/seu-usuario/jhd-managers.git
cd jhd-managers

# Instalar dependências
npm install --production
```

### Passo 3: Configurar Variáveis de Ambiente

```bash
# Criar arquivo .env
nano .env
```

Adicione:
```
GROQ_API_KEY=sua_chave_groq_aqui
FIREBASE_SERVICE_ACCOUNT_PATH=/var/www/jhd-managers/firebase-credentials.json
PORT=3000
```

### Passo 4: Adicionar Credenciais do Firebase

```bash
# Criar arquivo de credenciais
nano firebase-credentials.json
```

Cole o conteúdo do JSON do Firebase.

```bash
# Proteger arquivo
chmod 600 firebase-credentials.json
```

### Passo 5: Iniciar com PM2

```bash
# Iniciar aplicação
pm2 start server.js --name jhd-managers

# Configurar para iniciar no boot
pm2 startup
pm2 save

# Ver logs
pm2 logs jhd-managers

# Ver status
pm2 status
```

### Passo 6: Configurar Nginx (Proxy Reverso)

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração
sudo nano /etc/nginx/sites-available/jhd-managers
```

Adicione:
```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Ativar site
sudo ln -s /etc/nginx/sites-available/jhd-managers /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### Passo 7: Configurar Firewall

```bash
# Permitir HTTP e HTTPS
sudo ufw allow 'Nginx Full'

# Permitir SSH
sudo ufw allow OpenSSH

# Ativar firewall
sudo ufw enable
```

### Passo 8: Configurar HTTPS com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificado
sudo certbot --nginx -d seu-dominio.com

# Renovação automática já está configurada
```

## Configurações de Segurança

### 1. CORS (Cross-Origin Resource Sharing)

Se você precisar permitir acesso de outros domínios:

```javascript
// server.js
import cors from 'cors';

// Permitir apenas domínios específicos
app.use(cors({
  origin: ['https://seu-dominio.com', 'https://www.seu-dominio.com'],
  methods: ['GET', 'POST', 'DELETE'],
  credentials: true
}));
```

### 2. Rate Limiting

Proteger contra abuso da API:

```bash
npm install express-rate-limit
```

```javascript
// server.js
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.'
});

// Aplicar a todas as rotas
app.use('/api/', limiter);

// Limitar upload mais rigorosamente
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10 // Máximo 10 uploads por hora
});

app.post('/api/upload', uploadLimiter, upload.single('image'), async (req, res) => {
  // ...
});
```

### 3. Helmet (Segurança de Headers)

```bash
npm install helmet
```

```javascript
// server.js
import helmet from 'helmet';

app.use(helmet());
```

### 4. Validação de Entrada

```javascript
// Validar tamanho de arquivo
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});
```

### 5. Variáveis de Ambiente Seguras

- Nunca commitar `.env` ou `firebase-credentials.json`
- Usar secrets management em produção
- Rotacionar API keys periodicamente

## Requisitos de Recursos

### Mínimo (Free Tier)

- **CPU**: 0.5 vCPU
- **RAM**: 512MB
- **Disco**: 1GB
- **Bandwidth**: 100GB/mês
- **Adequado para**: Testes, desenvolvimento, baixo tráfego

### Recomendado (Produção)

- **CPU**: 1-2 vCPU
- **RAM**: 1-2GB
- **Disco**: 10GB (SSD)
- **Bandwidth**: 500GB/mês
- **Adequado para**: Produção, médio tráfego (100-1000 usuários/dia)

### Alto Desempenho

- **CPU**: 2-4 vCPU
- **RAM**: 4GB+
- **Disco**: 50GB (SSD)
- **Bandwidth**: 1TB/mês
- **Adequado para**: Alto tráfego (1000+ usuários/dia)

### Estimativas de Uso

**Por Upload:**
- Processamento: ~5-10 segundos
- Memória: ~50-100MB
- Disco: ~2-5MB (imagem + dados)

**Por Requisição GET:**
- Processamento: ~100ms
- Memória: ~10MB

## Checklist Pós-Deploy

### Verificações Funcionais

- [ ] Servidor está respondendo na URL de produção
- [ ] Página principal carrega corretamente
- [ ] Upload de imagem funciona
- [ ] Extração de dados via IA funciona
- [ ] Listagem de partidas funciona
- [ ] Exclusão de partidas funciona
- [ ] Modal de detalhes abre corretamente

### Verificações de API

```bash
# Testar endpoint de listagem
curl https://seu-dominio.com/api/matches

# Testar upload (com arquivo de teste)
curl -X POST https://seu-dominio.com/api/upload \
  -F "image=@test-match.jpg" \
  -F "matchDate=2024-01-15"
```

### Verificações de Segurança

- [ ] HTTPS configurado e funcionando
- [ ] Certificado SSL válido
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] CORS configurado corretamente
- [ ] Credenciais não expostas no código

### Verificações de Performance

- [ ] Tempo de resposta < 2s para páginas
- [ ] Tempo de upload < 15s
- [ ] Logs sem erros críticos
- [ ] Uso de memória estável
- [ ] Uso de CPU < 80%

### Verificações de Monitoramento

- [ ] Logs acessíveis e legíveis
- [ ] Alertas configurados (opcional)
- [ ] Backup automático configurado
- [ ] Uptime monitoring ativo (opcional)

## Backup do Firestore

### Backup Manual

**Via Console do Firebase:**
1. Acesse [console.firebase.google.com](https://console.firebase.google.com)
2. Selecione seu projeto
3. Vá em "Firestore Database"
4. Clique em "Import/Export"
5. Clique em "Export"
6. Escolha bucket do Cloud Storage
7. Clique em "Export"

### Backup Automático

**Usando Cloud Scheduler (Recomendado):**

1. Ative Cloud Scheduler no GCP
2. Crie um job:
```bash
gcloud firestore export gs://seu-bucket/backups/$(date +%Y%m%d)
```

3. Configure para executar diariamente

**Script Node.js:**
```javascript
// backup.js
import { exec } from 'child_process';

const bucket = 'gs://seu-bucket/backups';
const date = new Date().toISOString().split('T')[0];
const command = `gcloud firestore export ${bucket}/${date}`;

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error('Erro no backup:', error);
    return;
  }
  console.log('Backup concluído:', stdout);
});
```

**Agendar com cron (VPS):**
```bash
# Editar crontab
crontab -e

# Adicionar linha (backup diário às 2h)
0 2 * * * cd /var/www/jhd-managers && node backup.js
```

### Restauração de Backup

```bash
# Listar backups disponíveis
gsutil ls gs://seu-bucket/backups/

# Restaurar backup específico
gcloud firestore import gs://seu-bucket/backups/2024-01-15
```

### Estratégia de Backup Recomendada

- **Frequência**: Diária (2h da manhã)
- **Retenção**: 30 dias
- **Localização**: Cloud Storage (mesma região do Firestore)
- **Teste de Restauração**: Mensal

## Domínio Customizado e HTTPS

### Configurar Domínio no Render

1. Vá em "Settings" → "Custom Domain"
2. Adicione seu domínio: `seu-dominio.com`
3. Configure DNS no seu provedor:
```
Type: CNAME
Name: @
Value: seu-app.onrender.com
```
4. Aguarde propagação (até 48h)
5. HTTPS é configurado automaticamente

### Configurar Domínio no Heroku

```bash
# Adicionar domínio
heroku domains:add seu-dominio.com

# Ver configuração DNS necessária
heroku domains

# Configurar DNS no provedor
# Type: CNAME
# Name: @
# Value: fornecido-pelo-heroku.herokudns.com
```

### Configurar Domínio no Railway

1. Vá em "Settings" → "Domains"
2. Clique em "Custom Domain"
3. Adicione `seu-dominio.com`
4. Configure DNS:
```
Type: CNAME
Name: @
Value: fornecido-pelo-railway.app
```

### Configurar Domínio em VPS

Já configurado no passo de Nginx + Let's Encrypt acima.

### Forçar HTTPS

**Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}
```

**Express (se não usar proxy):**
```javascript
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

## Monitoramento e Logs

### Ver Logs no Render

```bash
# Via dashboard: Logs tab
# Ou via CLI:
render logs -s seu-servico
```

### Ver Logs no Heroku

```bash
heroku logs --tail
heroku logs --tail --source app
```

### Ver Logs no Railway

- Via dashboard: Logs tab
- Logs em tempo real

### Ver Logs em VPS

```bash
# PM2 logs
pm2 logs jhd-managers

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Ferramentas de Monitoramento (Opcional)

- **Uptime Robot**: Monitoramento de uptime gratuito
- **New Relic**: APM e monitoramento de performance
- **Sentry**: Rastreamento de erros
- **LogDNA**: Agregação de logs

## Troubleshooting de Deploy

### Erro: "Application Error"

**Causa**: Servidor não está iniciando

**Solução**:
1. Verificar logs
2. Verificar variáveis de ambiente
3. Verificar se `npm start` funciona localmente

### Erro: "GROQ_API_KEY não configurada"

**Causa**: Variável de ambiente não definida

**Solução**:
```bash
# Render/Railway: Adicionar em Environment Variables
# Heroku:
heroku config:set GROQ_API_KEY=sua_chave
```

### Erro: "Firebase Admin SDK initialization failed"

**Causa**: Credenciais do Firebase inválidas ou não configuradas

**Solução**:
1. Verificar se `FIREBASE_SERVICE_ACCOUNT_JSON` está configurada
2. Verificar se JSON está em uma linha
3. Verificar se JSON é válido

### Erro: "Port already in use"

**Causa**: Porta 3000 já está em uso

**Solução**:
- Plataformas PaaS definem `PORT` automaticamente
- Em VPS, usar porta diferente ou matar processo:
```bash
lsof -ti:3000 | xargs kill -9
```

## Referências

- [Guia de Configuração do Ambiente](development-setup.md)
- [Troubleshooting](troubleshooting.md)
- [Segurança e Boas Práticas](../security/best-practices.md)
- [Documentação de API](../api/endpoints.md)

## Próximos Passos

- Configurar monitoramento de uptime
- Implementar CI/CD automático
- Configurar alertas de erro
- Implementar backup automático
- Adicionar testes de integração
