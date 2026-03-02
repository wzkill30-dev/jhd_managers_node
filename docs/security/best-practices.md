# Segurança e Boas Práticas

> Última atualização: 2024

## Visão Geral

Este documento descreve as práticas de segurança implementadas no JHD Managers e recomendações para manter o sistema seguro em produção.

## Índice

- [Gerenciamento de Credenciais](#gerenciamento-de-credenciais)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Validações de Entrada](#validações-de-entrada)
- [Segurança em Produção](#segurança-em-produção)
- [Tratamento de Erros](#tratamento-de-erros)
- [Rotação de API Keys](#rotação-de-api-keys)
- [Regras do Firestore](#regras-do-firestore)
- [Auditoria de Segurança](#auditoria-de-segurança)
- [Backup e Recuperação](#backup-e-recuperação)
- [Compliance e LGPD](#compliance-e-lgpd)

## Gerenciamento de Credenciais

### Credenciais Sensíveis

**Nunca commitar:**
- ❌ Arquivo `.env`
- ❌ Arquivo `firebase-credentials.json`
- ❌ API Keys em código
- ❌ Senhas ou tokens
- ❌ Certificados privados

**Sempre usar:**
- ✅ Variáveis de ambiente
- ✅ Secrets management da plataforma
- ✅ `.gitignore` configurado corretamente
- ✅ Credenciais diferentes para dev/prod

### Configuração do .gitignore

```gitignore
# Credenciais e configurações sensíveis
.env
.env.local
.env.production
firebase-credentials.json
*.pem
*.key

# Arquivos temporários
uploads/
node_modules/
*.log

# Sistema operacional
.DS_Store
Thumbs.db
```

### Verificar se Credenciais Foram Commitadas

```bash
# Verificar histórico do Git
git log --all --full-history -- .env
git log --all --full-history -- firebase-credentials.json

# Se encontrar commits com credenciais:
# 1. Rotacionar TODAS as credenciais imediatamente
# 2. Remover do histórico (use com cuidado):
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch .env" \
  --prune-empty --tag-name-filter cat -- --all
```

### Armazenamento Seguro

**Desenvolvimento:**
- Usar arquivo `.env` local (não commitado)
- Arquivo `firebase-credentials.json` local (não commitado)
- Documentar onde obter credenciais

**Produção:**
- Usar secrets management da plataforma (Render, Heroku, Railway)
- Ou usar serviços como AWS Secrets Manager, HashiCorp Vault
- Nunca armazenar em código ou repositório

## Variáveis de Ambiente

### Estrutura do .env

```bash
# API Keys
GROQ_API_KEY=gsk_sua_chave_aqui

# Firebase
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
# Ou em produção:
# FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Servidor
PORT=3000
NODE_ENV=development

# Opcional: Configurações de segurança
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Validação de Variáveis

```javascript
// config.js - Validar variáveis obrigatórias
function validateEnv() {
  const required = ['GROQ_API_KEY'];
  
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Variável de ambiente ${key} não configurada`);
    }
  }
  
  // Validar formato
  if (!process.env.GROQ_API_KEY.startsWith('gsk_')) {
    throw new Error('GROQ_API_KEY com formato inválido');
  }
}

validateEnv();
```

### Diferentes Ambientes

```javascript
// Usar configurações diferentes por ambiente
const config = {
  development: {
    port: 3000,
    logLevel: 'debug',
    corsOrigin: '*'
  },
  production: {
    port: process.env.PORT || 3000,
    logLevel: 'error',
    corsOrigin: ['https://seu-dominio.com']
  }
};

const env = process.env.NODE_ENV || 'development';
export default config[env];
```

## Validações de Entrada

### Validação de Upload

```javascript
// server.js
import multer from 'multer';

const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 1 // Apenas 1 arquivo por vez
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    const allowedMimes = ['image/jpeg', 'image/png', 'image/jpg'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não permitido. Use JPEG ou PNG.'));
    }
  }
});
```

### Validação de Dados

```javascript
// Validar data da partida
function validateMatchDate(dateStr) {
  // Verificar formato YYYY-MM-DD
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    throw new Error('Data inválida. Use formato YYYY-MM-DD');
  }
  
  const date = new Date(dateStr);
  
  // Verificar se é data válida
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }
  
  // Verificar se não é data futura
  if (date > new Date()) {
    throw new Error('Data não pode ser no futuro');
  }
  
  // Verificar se não é muito antiga (ex: mais de 1 ano)
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  
  if (date < oneYearAgo) {
    throw new Error('Data muito antiga');
  }
  
  return dateStr;
}

// Usar na rota
app.post('/api/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' });
    }
    
    const matchDate = validateMatchDate(req.body.matchDate);
    // ...
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

### Sanitização de Entrada

```javascript
// Instalar biblioteca de sanitização
// npm install validator

import validator from 'validator';

function sanitizeInput(input) {
  // Remover tags HTML
  let sanitized = validator.escape(input);
  
  // Remover caracteres especiais perigosos
  sanitized = sanitized.replace(/[<>\"\']/g, '');
  
  return sanitized;
}

// Usar em campos de texto
const teamName = sanitizeInput(req.body.teamName);
```

## Segurança em Produção

### CORS (Cross-Origin Resource Sharing)

```javascript
// server.js
import cors from 'cors';

// Desenvolvimento: Permitir todos
if (process.env.NODE_ENV === 'development') {
  app.use(cors());
}

// Produção: Restringir origens
if (process.env.NODE_ENV === 'production') {
  app.use(cors({
    origin: [
      'https://seu-dominio.com',
      'https://www.seu-dominio.com'
    ],
    methods: ['GET', 'POST', 'DELETE'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
}
```

### Rate Limiting

```javascript
// npm install express-rate-limit
import rateLimit from 'express-rate-limit';

// Limitar requisições gerais
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requisições por IP
  message: 'Muitas requisições deste IP, tente novamente mais tarde.',
  standardHeaders: true,
  legacyHeaders: false
});

app.use('/api/', generalLimiter);

// Limitar uploads mais rigorosamente
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // 10 uploads por hora
  message: 'Limite de uploads atingido. Tente novamente em 1 hora.'
});

app.post('/api/upload', uploadLimiter, upload.single('image'), async (req, res) => {
  // ...
});
```

### Helmet (Headers de Segurança)

```javascript
// npm install helmet
import helmet from 'helmet';

// Aplicar headers de segurança
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

### HTTPS

**Sempre usar HTTPS em produção:**

```javascript
// Redirecionar HTTP para HTTPS
app.use((req, res, next) => {
  if (req.header('x-forwarded-proto') !== 'https' && process.env.NODE_ENV === 'production') {
    res.redirect(`https://${req.header('host')}${req.url}`);
  } else {
    next();
  }
});
```

**Configurar no Nginx:**
```nginx
server {
    listen 80;
    server_name seu-dominio.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;
    
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;
    
    # Configurações SSL recomendadas
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    
    # ...
}
```

### Proteção contra Ataques Comuns

**SQL Injection:**
- ✅ Não aplicável (usando Firestore, não SQL)
- ✅ Firestore SDK já protege contra injection

**XSS (Cross-Site Scripting):**
```javascript
// Sanitizar saída no frontend
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// Usar ao renderizar dados do usuário
element.textContent = escapeHtml(userInput);
```

**CSRF (Cross-Site Request Forgery):**
```javascript
// npm install csurf
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

// Incluir token CSRF em formulários
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

## Tratamento de Erros

### Não Expor Informações Sensíveis

**❌ Ruim:**
```javascript
app.post('/api/upload', async (req, res) => {
  try {
    // ...
  } catch (error) {
    // Expõe stack trace e detalhes internos
    res.status(500).json({ error: error.stack });
  }
});
```

**✅ Bom:**
```javascript
app.post('/api/upload', async (req, res) => {
  try {
    // ...
  } catch (error) {
    // Log completo no servidor
    console.error('Erro no upload:', error);
    
    // Mensagem genérica para o cliente
    res.status(500).json({ 
      error: 'Erro ao processar upload. Tente novamente.' 
    });
  }
});
```

### Logging Seguro

```javascript
// logger.js
import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Não logar informações sensíveis
logger.info('Upload recebido', {
  userId: req.user?.id, // OK
  matchDate: req.body.matchDate, // OK
  // apiKey: req.headers.authorization // ❌ NUNCA
});

export default logger;
```

### Tratamento Global de Erros

```javascript
// Error handler middleware (deve ser o último)
app.use((err, req, res, next) => {
  // Log do erro completo
  console.error('Erro não tratado:', err);
  
  // Resposta baseada no ambiente
  if (process.env.NODE_ENV === 'production') {
    res.status(500).json({
      error: 'Erro interno do servidor'
    });
  } else {
    res.status(500).json({
      error: err.message,
      stack: err.stack
    });
  }
});
```

## Rotação de API Keys

### Quando Rotacionar

- ✅ Periodicamente (a cada 90 dias)
- ✅ Quando um desenvolvedor sai da equipe
- ✅ Após suspeita de comprometimento
- ✅ Após exposição acidental (commit, log, etc.)

### Como Rotacionar Groq API Key

1. **Gerar nova chave:**
   - Acesse: https://console.groq.com/keys
   - Clique em "Create API Key"
   - Copie a nova chave

2. **Atualizar em produção:**
```bash
# Render
# Vá em Environment → Editar GROQ_API_KEY

# Heroku
heroku config:set GROQ_API_KEY=nova_chave_aqui

# Railway
# Vá em Variables → Editar GROQ_API_KEY
```

3. **Testar nova chave:**
```bash
curl https://seu-dominio.com/api/matches
```

4. **Deletar chave antiga:**
   - Volte em https://console.groq.com/keys
   - Delete a chave antiga

### Como Rotacionar Firebase Credentials

1. **Gerar novo service account:**
   - Acesse: https://console.firebase.google.com
   - Vá em "Project Settings" → "Service Accounts"
   - Clique em "Generate New Private Key"

2. **Atualizar em produção:**
```bash
# Converter JSON para string (uma linha)
cat firebase-credentials-new.json | tr -d '\n'

# Atualizar variável de ambiente
heroku config:set FIREBASE_SERVICE_ACCOUNT_JSON='...'
```

3. **Testar novo service account:**
```bash
curl https://seu-dominio.com/api/matches
```

4. **Deletar service account antigo:**
   - Vá em https://console.cloud.google.com/iam-admin/serviceaccounts
   - Delete o service account antigo

### Checklist de Rotação

- [ ] Gerar nova credencial
- [ ] Atualizar em todos os ambientes (dev, staging, prod)
- [ ] Testar funcionamento
- [ ] Deletar credencial antiga
- [ ] Documentar data da rotação
- [ ] Agendar próxima rotação (90 dias)

## Regras do Firestore

### Regras para Desenvolvimento

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

> ⚠️ **Atenção**: Estas regras permitem acesso total. Use APENAS em desenvolvimento!

### Regras para Produção (Sem Autenticação)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura pública de partidas
    match /matches/{matchId} {
      allow read: if true;
      
      // Permitir escrita apenas de servidor (via Admin SDK)
      allow write: if false;
    }
    
    // Proteger counters
    match /counters/{counterId} {
      allow read, write: if false;
    }
  }
}
```

### Regras para Produção (Com Autenticação)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Funções auxiliares
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Partidas
    match /matches/{matchId} {
      // Qualquer um pode ler
      allow read: if true;
      
      // Apenas usuários autenticados podem criar
      allow create: if isAuthenticated();
      
      // Apenas dono pode atualizar/deletar
      allow update, delete: if isOwner(resource.data.userId);
    }
    
    // Counters (apenas Admin SDK)
    match /counters/{counterId} {
      allow read, write: if false;
    }
  }
}
```

### Validação de Dados nas Regras

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /matches/{matchId} {
      allow read: if true;
      
      allow create: if isAuthenticated() 
        && request.resource.data.keys().hasAll([
          'home_team', 'away_team', 'home_score', 'away_score', 'match_date'
        ])
        && request.resource.data.home_score is int
        && request.resource.data.away_score is int
        && request.resource.data.match_date is string;
    }
  }
}
```

### Testar Regras

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Testar regras localmente
firebase emulators:start --only firestore
```

## Auditoria de Segurança

### Checklist de Segurança

**Credenciais:**
- [ ] `.env` não está commitado
- [ ] `firebase-credentials.json` não está commitado
- [ ] `.gitignore` está configurado
- [ ] Credenciais diferentes para dev/prod
- [ ] API keys rotacionadas nos últimos 90 dias

**Código:**
- [ ] Validação de entrada implementada
- [ ] Sanitização de dados implementada
- [ ] Tratamento de erros sem expor detalhes
- [ ] Logs não contêm informações sensíveis
- [ ] Dependências atualizadas (sem vulnerabilidades)

**Infraestrutura:**
- [ ] HTTPS configurado
- [ ] CORS configurado corretamente
- [ ] Rate limiting implementado
- [ ] Headers de segurança (Helmet)
- [ ] Firewall configurado (se VPS)

**Firestore:**
- [ ] Regras de segurança configuradas
- [ ] Regras testadas
- [ ] Backup automático configurado
- [ ] Índices otimizados

### Verificar Vulnerabilidades

```bash
# Verificar vulnerabilidades nas dependências
npm audit

# Corrigir automaticamente (quando possível)
npm audit fix

# Ver detalhes
npm audit --json

# Verificar dependências desatualizadas
npm outdated
```

### Ferramentas de Análise

**SAST (Static Application Security Testing):**
```bash
# ESLint com plugins de segurança
npm install --save-dev eslint eslint-plugin-security

# .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:security/recommended"]
}

# Executar
npx eslint .
```

**Dependency Scanning:**
```bash
# Snyk
npm install -g snyk
snyk test
snyk monitor
```

### Auditoria Periódica

**Mensal:**
- [ ] Verificar logs de erro
- [ ] Revisar acessos ao Firestore
- [ ] Verificar uso de API (Groq)
- [ ] Atualizar dependências

**Trimestral:**
- [ ] Rotacionar API keys
- [ ] Revisar regras do Firestore
- [ ] Auditoria de código
- [ ] Teste de penetração básico

**Anual:**
- [ ] Auditoria de segurança completa
- [ ] Revisar arquitetura
- [ ] Atualizar documentação de segurança
- [ ] Treinamento de segurança para equipe

## Backup e Recuperação

### Estratégia de Backup

**Firestore:**
- Backup diário automático
- Retenção de 30 dias
- Armazenamento em Cloud Storage
- Teste de restauração mensal

**Código:**
- Versionamento no Git
- Branches protegidas (main, production)
- Tags para releases
- Backup do repositório (GitHub, GitLab)

**Configurações:**
- Documentar todas as variáveis de ambiente
- Backup de regras do Firestore
- Backup de configurações de DNS
- Backup de certificados SSL

### Plano de Recuperação de Desastres

**Cenário 1: Perda de Dados no Firestore**
1. Identificar último backup válido
2. Restaurar backup:
```bash
gcloud firestore import gs://seu-bucket/backups/2024-01-15
```
3. Verificar integridade dos dados
4. Notificar usuários (se necessário)

**Cenário 2: Comprometimento de API Key**
1. Rotacionar API key imediatamente
2. Revisar logs de acesso
3. Identificar uso não autorizado
4. Notificar usuários afetados
5. Implementar medidas preventivas

**Cenário 3: Servidor Comprometido**
1. Isolar servidor
2. Rotacionar TODAS as credenciais
3. Fazer deploy em novo servidor
4. Revisar logs e identificar vetor de ataque
5. Implementar correções
6. Notificar usuários

## Compliance e LGPD

### Dados Coletados

O JHD Managers coleta:
- ✅ Imagens de resumo de partidas (temporárias)
- ✅ Estatísticas extraídas das imagens
- ✅ Datas de partidas
- ✅ Timestamps de upload
- ❌ Não coleta dados pessoais identificáveis

### Retenção de Dados

**Imagens:**
- Armazenadas temporariamente em `uploads/`
- Deletadas após processamento (recomendado)
- Ou mantidas por período limitado (ex: 7 dias)

**Dados de Partidas:**
- Armazenados indefinidamente no Firestore
- Usuário pode excluir suas partidas
- Backup mantido por 30 dias

### Direitos dos Usuários

Se implementar autenticação, garantir:
- **Acesso**: Usuário pode ver seus dados
- **Retificação**: Usuário pode corrigir dados
- **Exclusão**: Usuário pode deletar seus dados
- **Portabilidade**: Usuário pode exportar dados

### Implementar Exclusão de Dados

```javascript
// Deletar imagem após processamento
import fs from 'fs';

app.post('/api/upload', upload.single('image'), async (req, res) => {
  const imagePath = req.file.path;
  
  try {
    const matchData = await extractMatchData(imagePath);
    const result = await db.insertMatch(matchData, matchDate);
    
    // Deletar imagem
    fs.unlinkSync(imagePath);
    
    res.json({ success: true, data: result });
  } catch (error) {
    // Deletar imagem mesmo em caso de erro
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }
    res.status(500).json({ error: error.message });
  }
});
```

### Política de Privacidade

Criar arquivo `PRIVACY.md` documentando:
- Quais dados são coletados
- Como são usados
- Quanto tempo são mantidos
- Como são protegidos
- Direitos dos usuários
- Contato para questões de privacidade

## Referências

- [Guia de Deploy](../guides/deployment.md)
- [Troubleshooting](../guides/troubleshooting.md)
- [Documentação de API](../api/endpoints.md)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Firebase Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [LGPD](http://www.planalto.gov.br/ccivil_03/_ato2015-2018/2018/lei/l13709.htm)

## Próximos Passos

- Implementar autenticação de usuários
- Adicionar logging estruturado
- Configurar monitoramento de segurança
- Realizar auditoria de segurança profissional
- Implementar testes de segurança automatizados
