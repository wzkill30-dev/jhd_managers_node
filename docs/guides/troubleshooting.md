# Guia de Troubleshooting

> Última atualização: 2024

## Visão Geral

Este guia ajuda a resolver problemas comuns no JHD Managers. Para cada problema, fornecemos sintomas, causas prováveis, soluções e comandos de diagnóstico.

## Índice

- [Problemas de Configuração](#problemas-de-configuração)
- [Problemas com Groq API](#problemas-com-groq-api)
- [Problemas com Firebase](#problemas-com-firebase)
- [Problemas de Upload](#problemas-de-upload)
- [Problemas de Extração de Dados](#problemas-de-extração-de-dados)
- [Problemas de Timezone](#problemas-de-timezone)
- [Problemas de Performance](#problemas-de-performance)
- [Problemas de Deploy](#problemas-de-deploy)

## Problemas de Configuração

### Erro: "GROQ_API_KEY não configurada"

**Sintoma:**
```
✗ Erro ao chamar Groq API: GROQ_API_KEY não configurada no arquivo .env
```

**Causa:**
- Variável de ambiente `GROQ_API_KEY` não está definida
- Arquivo `.env` não existe
- Arquivo `.env` não está sendo carregado

**Solução:**

1. Verificar se o arquivo `.env` existe:
```bash
ls -la .env
```

2. Verificar conteúdo do arquivo:
```bash
cat .env
```

3. Criar ou editar arquivo `.env`:
```bash
nano .env
```

Adicionar:
```
GROQ_API_KEY=sua_chave_aqui
```

4. Obter chave da API Groq:
   - Acesse: https://console.groq.com/keys
   - Faça login
   - Clique em "Create API Key"
   - Copie a chave

5. Reiniciar o servidor:
```bash
npm start
```

**Comandos de Diagnóstico:**
```bash
# Verificar se .env existe
test -f .env && echo "Arquivo .env existe" || echo "Arquivo .env NÃO existe"

# Verificar se GROQ_API_KEY está definida (sem expor o valor)
grep -q "GROQ_API_KEY" .env && echo "GROQ_API_KEY encontrada" || echo "GROQ_API_KEY NÃO encontrada"

# Verificar se a variável está sendo carregada
node -e "require('dotenv').config(); console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'Configurada' : 'NÃO configurada')"
```

---

### Erro: "Cannot find module 'dotenv'"

**Sintoma:**
```
Error: Cannot find module 'dotenv'
```

**Causa:**
- Dependências não foram instaladas
- `node_modules` foi deletado

**Solução:**
```bash
# Instalar dependências
npm install

# Verificar instalação
npm list dotenv
```

---

## Problemas com Groq API

### Erro: "Invalid API Key"

**Sintoma:**
```
✗ Erro ao chamar Groq API: Invalid API Key
```

**Causa:**
- API Key incorreta ou expirada
- API Key com formato inválido

**Solução:**

1. Verificar formato da chave (deve começar com `gsk_`):
```bash
grep GROQ_API_KEY .env
```

2. Gerar nova chave:
   - Acesse: https://console.groq.com/keys
   - Delete a chave antiga
   - Crie nova chave
   - Atualize o `.env`

3. Verificar se não há espaços extras:
```bash
# Remover espaços em branco
sed -i 's/GROQ_API_KEY = /GROQ_API_KEY=/g' .env
```

---

### Erro: "Rate limit exceeded"

**Sintoma:**
```
✗ Erro ao chamar Groq API: Rate limit exceeded
```

**Causa:**
- Muitas requisições em curto período
- Limite do plano gratuito atingido

**Solução:**

1. Aguardar alguns minutos antes de tentar novamente

2. Verificar limites do plano:
   - Acesse: https://console.groq.com/settings/limits

3. Implementar rate limiting no código:
```javascript
// Adicionar delay entre requisições
await new Promise(resolve => setTimeout(resolve, 1000));
```

4. Considerar upgrade do plano se necessário

---

### Erro: "Model not found"

**Sintoma:**
```
✗ Erro ao chamar Groq API: Model 'llama-4-scout-17b-16e-instruct' not found
```

**Causa:**
- Nome do modelo incorreto
- Modelo foi descontinuado

**Solução:**

1. Verificar modelos disponíveis:
   - Acesse: https://console.groq.com/docs/models

2. Atualizar modelo em `llm-service.js`:
```javascript
const chatCompletion = await groq.chat.completions.create({
  model: "meta-llama/llama-4-scout-17b-16e-instruct", // Verificar nome correto
  // ...
});
```

---

## Problemas com Firebase

### Erro: "Firebase Admin SDK initialization failed"

**Sintoma:**
```
✗ Erro ao inicializar Firebase: Firebase Admin SDK initialization failed
```

**Causa:**
- Arquivo `firebase-credentials.json` não encontrado
- Credenciais inválidas
- Permissões incorretas

**Solução:**

1. Verificar se o arquivo existe:
```bash
ls -la firebase-credentials.json
```

2. Verificar se é um JSON válido:
```bash
cat firebase-credentials.json | jq .
```

3. Baixar credenciais novamente:
   - Acesse: https://console.firebase.google.com
   - Selecione seu projeto
   - Vá em "Project Settings" → "Service Accounts"
   - Clique em "Generate New Private Key"
   - Salve como `firebase-credentials.json`

4. Verificar permissões do arquivo:
```bash
chmod 600 firebase-credentials.json
```

**Comandos de Diagnóstico:**
```bash
# Verificar se arquivo existe
test -f firebase-credentials.json && echo "Arquivo existe" || echo "Arquivo NÃO existe"

# Verificar se é JSON válido
cat firebase-credentials.json | jq . > /dev/null 2>&1 && echo "JSON válido" || echo "JSON INVÁLIDO"

# Verificar campos obrigatórios
jq -r '.project_id, .private_key, .client_email' firebase-credentials.json
```

---

### Erro: "Permission denied"

**Sintoma:**
```
✗ Erro ao acessar Firestore: Permission denied
```

**Causa:**
- Regras de segurança do Firestore muito restritivas
- Service account sem permissões adequadas

**Solução:**

1. Verificar regras do Firestore:
   - Acesse: https://console.firebase.google.com
   - Vá em "Firestore Database" → "Rules"

2. Regras recomendadas para desenvolvimento:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true; // APENAS PARA DESENVOLVIMENTO
    }
  }
}
```

3. Regras recomendadas para produção:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /matches/{matchId} {
      allow read: if true;
      allow write: if request.auth != null; // Requer autenticação
    }
    match /counters/{counterId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Verificar permissões do service account:
   - Acesse: https://console.cloud.google.com/iam-admin/iam
   - Verifique se o service account tem role "Cloud Datastore User"

---

### Erro: "Quota exceeded"

**Sintoma:**
```
✗ Erro ao acessar Firestore: Quota exceeded
```

**Causa:**
- Limite de leituras/escritas do plano gratuito atingido

**Solução:**

1. Verificar uso:
   - Acesse: https://console.firebase.google.com
   - Vá em "Firestore Database" → "Usage"

2. Limites do plano gratuito:
   - 50,000 leituras/dia
   - 20,000 escritas/dia
   - 20,000 exclusões/dia

3. Otimizar queries:
```javascript
// Evitar: Buscar todos os documentos
const allDocs = await db.collection('matches').get();

// Preferir: Limitar resultados
const limitedDocs = await db.collection('matches').limit(100).get();
```

4. Considerar upgrade para plano pago se necessário

---

## Problemas de Upload

### Erro: "Nenhuma imagem enviada"

**Sintoma:**
```
✗ Erro: Nenhuma imagem enviada
```

**Causa:**
- Campo `image` não está sendo enviado no FormData
- Nome do campo está incorreto

**Solução:**

1. Verificar código do frontend:
```javascript
const formData = new FormData();
formData.append('image', fileInput.files[0]); // Nome deve ser 'image'
formData.append('matchDate', matchDateInput.value);
```

2. Verificar se arquivo foi selecionado:
```javascript
if (!fileInput.files[0]) {
  alert('Selecione uma imagem');
  return;
}
```

3. Verificar configuração do multer no backend:
```javascript
app.post('/api/upload', upload.single('image'), async (req, res) => {
  // 'image' deve corresponder ao nome do campo no FormData
});
```

---

### Erro: "File too large"

**Sintoma:**
```
✗ Erro: File too large
```

**Causa:**
- Arquivo excede limite configurado no multer

**Solução:**

1. Aumentar limite no `server.js`:
```javascript
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

2. Comprimir imagem antes do upload (frontend):
```javascript
// Usar biblioteca como browser-image-compression
import imageCompression from 'browser-image-compression';

const options = {
  maxSizeMB: 5,
  maxWidthOrHeight: 1920
};

const compressedFile = await imageCompression(file, options);
```

---

### Erro: "ENOENT: no such file or directory"

**Sintoma:**
```
✗ Erro: ENOENT: no such file or directory, open 'uploads/...'
```

**Causa:**
- Diretório `uploads/` não existe
- Arquivo foi deletado antes do processamento

**Solução:**

1. Criar diretório `uploads/`:
```bash
mkdir -p uploads
```

2. Adicionar ao `.gitignore`:
```bash
echo "uploads/" >> .gitignore
```

3. Criar diretório automaticamente no código:
```javascript
import fs from 'fs';

// No início do server.js
if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}
```

---

## Problemas de Extração de Dados

### Erro: "Não foi possível extrair dados da imagem"

**Sintoma:**
```
✗ Erro: Não foi possível extrair dados da imagem
```

**Causa:**
- Imagem não contém resumo de partida do EA FC 26
- Imagem está muito escura ou borrada
- Formato da imagem não é suportado

**Solução:**

1. Verificar se a imagem é um screenshot válido do EA FC 26

2. Melhorar qualidade da imagem:
   - Usar resolução mínima de 1280x720
   - Evitar screenshots com baixa iluminação
   - Capturar tela completa do resumo

3. Testar com imagem de exemplo conhecida

4. Verificar logs para ver resposta da API:
```javascript
console.log('Resposta da Groq API:', chatCompletion.choices[0].message.content);
```

---

### Erro: "JSON parse error"

**Sintoma:**
```
✗ Erro ao processar resposta: Unexpected token in JSON
```

**Causa:**
- LLM retornou texto que não é JSON válido
- Resposta contém caracteres especiais

**Solução:**

1. Melhorar extração de JSON em `llm-service.js`:
```javascript
// Extrair JSON da resposta
const content = chatCompletion.choices[0].message.content;

// Tentar encontrar JSON entre ```json e ```
let jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
if (!jsonMatch) {
  // Tentar encontrar JSON entre { e }
  jsonMatch = content.match(/\{[\s\S]*\}/);
}

if (!jsonMatch) {
  throw new Error('Não foi possível encontrar JSON na resposta');
}

const jsonStr = jsonMatch[1] || jsonMatch[0];
const matchData = JSON.parse(jsonStr);
```

2. Adicionar tratamento de erro:
```javascript
try {
  const matchData = JSON.parse(jsonStr);
  return matchData;
} catch (error) {
  console.error('Erro ao fazer parse do JSON:', error);
  console.error('Conteúdo recebido:', content);
  throw new Error('Resposta da API não está em formato JSON válido');
}
```

---

### Campos com valor null

**Sintoma:**
- Alguns campos retornam `null` em vez de valores

**Causa:**
- LLM não conseguiu detectar o campo na imagem
- Campo não está visível no screenshot

**Solução:**

1. Isso é comportamento esperado - nem todos os campos são sempre visíveis

2. Tratar valores null no frontend:
```javascript
${match.home_shots !== null ? `
  <div class="stat">Chutes: ${match.home_shots} x ${match.away_shots}</div>
` : ''}
```

3. Melhorar prompt para campos específicos:
```javascript
const prompt = `
...
Se algum campo não estiver visível na imagem, retorne null para esse campo.
Priorize os seguintes campos: home_team, away_team, home_score, away_score, home_shots, away_shots, home_possession, away_possession.
`;
```

---

## Problemas de Timezone

### Erro: Data da partida aparece com dia anterior

**Sintoma:**
- Partida do dia 15/01 aparece como 14/01

**Causa:**
- Conversão de timezone incorreta
- `new Date()` interpreta string como UTC

**Solução:**

1. Usar tratamento correto de timezone no frontend:
```javascript
// Corrigir timezone - tratar data como local
const dateParts = match.match_date.split('T')[0].split('-');
const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

const formattedDate = date.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
```

2. Ou armazenar apenas a string de data (sem timestamp):
```javascript
// Backend - database.js
const matchDoc = {
  match_date: matchDate, // "2024-01-15" (string, não Date)
  // ...
};
```

**Comandos de Diagnóstico:**
```javascript
// Testar conversão de data
const testDate = "2024-01-15";
console.log('String original:', testDate);
console.log('new Date():', new Date(testDate));
console.log('Timezone offset:', new Date().getTimezoneOffset());

// Conversão correta
const parts = testDate.split('-');
const localDate = new Date(parts[0], parts[1] - 1, parts[2]);
console.log('Data local:', localDate);
```

---

## Problemas de Performance

### Servidor lento para responder

**Sintoma:**
- Upload demora mais de 30 segundos
- Listagem de partidas demora muito

**Causa:**
- Muitas partidas no banco de dados
- Processamento de imagem pesado
- Servidor com recursos limitados

**Solução:**

1. Implementar paginação:
```javascript
// Backend
app.get('/api/matches', async (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const offset = parseInt(req.query.offset) || 0;
  
  const matches = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .limit(limit)
    .offset(offset)
    .get();
  
  res.json(matches);
});
```

2. Adicionar índices no Firestore:
   - Acesse: https://console.firebase.google.com
   - Vá em "Firestore Database" → "Indexes"
   - Crie índice para `match_date desc`

3. Otimizar tamanho das imagens:
```javascript
// Comprimir antes de salvar
import sharp from 'sharp';

await sharp(imagePath)
  .resize(1920, 1080, { fit: 'inside' })
  .jpeg({ quality: 80 })
  .toFile(compressedPath);
```

4. Usar cache:
```javascript
// Cache de partidas no frontend
let cachedMatches = null;
let cacheTime = null;

async function loadMatches() {
  const now = Date.now();
  if (cachedMatches && (now - cacheTime < 60000)) {
    return cachedMatches;
  }
  
  const response = await fetch('/api/matches');
  cachedMatches = await response.json();
  cacheTime = now;
  return cachedMatches;
}
```

---

### Alto uso de memória

**Sintoma:**
- Servidor usa muita RAM
- Erro "JavaScript heap out of memory"

**Causa:**
- Muitas imagens sendo processadas simultaneamente
- Memory leak

**Solução:**

1. Limitar uploads simultâneos:
```javascript
// Usar fila de processamento
import Queue from 'bull';

const uploadQueue = new Queue('uploads');

uploadQueue.process(async (job) => {
  const { imagePath, matchDate } = job.data;
  return await extractMatchData(imagePath);
});
```

2. Limpar arquivos temporários:
```javascript
// Deletar imagem após processamento
import fs from 'fs';

try {
  const matchData = await extractMatchData(imagePath);
  // ... salvar no banco
  
  // Deletar arquivo
  fs.unlinkSync(imagePath);
} catch (error) {
  // ...
}
```

3. Aumentar limite de memória:
```bash
node --max-old-space-size=2048 server.js
```

---

## Problemas de Deploy

### Erro: "Application failed to start"

**Sintoma:**
- Deploy falha
- Aplicação não inicia

**Causa:**
- Variáveis de ambiente não configuradas
- Erro no código
- Dependências faltando

**Solução:**

1. Verificar logs da plataforma:
```bash
# Render
render logs -s seu-servico

# Heroku
heroku logs --tail

# Railway
# Ver logs no dashboard
```

2. Verificar variáveis de ambiente:
```bash
# Heroku
heroku config

# Verificar se GROQ_API_KEY e FIREBASE_SERVICE_ACCOUNT_JSON estão definidas
```

3. Testar localmente:
```bash
npm install
npm start
```

4. Verificar `package.json`:
```json
{
  "scripts": {
    "start": "node server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

---

### Erro: "Port already in use"

**Sintoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Causa:**
- Porta 3000 já está sendo usada por outro processo

**Solução:**

1. Encontrar processo usando a porta:
```bash
# macOS/Linux
lsof -ti:3000

# Windows
netstat -ano | findstr :3000
```

2. Matar processo:
```bash
# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Windows
taskkill /PID <PID> /F
```

3. Ou usar porta diferente:
```bash
PORT=3001 npm start
```

---

## Comandos de Diagnóstico Úteis

### Verificar Status do Sistema

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Verificar dependências instaladas
npm list --depth=0

# Verificar se servidor está rodando
curl http://localhost:3000/api/matches

# Verificar uso de memória
node -e "console.log(process.memoryUsage())"

# Verificar variáveis de ambiente (sem expor valores)
node -e "require('dotenv').config(); console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY ? 'OK' : 'FALTANDO'); console.log('FIREBASE_SERVICE_ACCOUNT_PATH:', process.env.FIREBASE_SERVICE_ACCOUNT_PATH || 'Padrão')"
```

### Testar Componentes Individualmente

```bash
# Testar conexão com Groq API
node -e "
import('groq-sdk').then(({ default: Groq }) => {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  groq.chat.completions.create({
    model: 'meta-llama/llama-4-scout-17b-16e-instruct',
    messages: [{ role: 'user', content: 'Hello' }]
  }).then(() => console.log('Groq API: OK')).catch(e => console.error('Groq API: ERRO', e.message));
});
"

# Testar conexão com Firebase
node -e "
import admin from 'firebase-admin';
import { readFileSync } from 'fs';
const serviceAccount = JSON.parse(readFileSync('./firebase-credentials.json', 'utf8'));
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
admin.firestore().collection('matches').limit(1).get()
  .then(() => console.log('Firebase: OK'))
  .catch(e => console.error('Firebase: ERRO', e.message));
"
```

### Logs de Exemplo

**Log de Sucesso:**
```
Servidor rodando em http://localhost:3000
API Key configurada: Sim
✓ Partida adicionada com sucesso! ID: 42
```

**Log de Erro - Groq API:**
```
✗ Erro ao chamar Groq API: Invalid API Key
    at extractMatchData (llm-service.js:45:11)
```

**Log de Erro - Firebase:**
```
✗ Erro ao inicializar Firebase: Firebase Admin SDK initialization failed
    at Object.<anonymous> (database.js:12:3)
```

## Obtendo Ajuda

Se você não conseguiu resolver o problema com este guia:

1. **Verificar Logs**: Sempre comece verificando os logs completos
2. **Documentação Oficial**:
   - [Groq API Docs](https://console.groq.com/docs)
   - [Firebase Docs](https://firebase.google.com/docs)
3. **Issues no GitHub**: Procure ou abra uma issue no repositório
4. **Stack Overflow**: Pesquise por erros similares

## Referências

- [Guia de Configuração do Ambiente](development-setup.md)
- [Guia de Deploy](deployment.md)
- [Documentação de API](../api/endpoints.md)
- [Segurança e Boas Práticas](../security/best-practices.md)

## Próximos Passos

- Implementar logging estruturado
- Adicionar monitoramento de erros (Sentry)
- Criar testes automatizados
- Documentar novos problemas encontrados
