# Guia de Configuração do Ambiente de Desenvolvimento

> Última atualização: Janeiro 2025

## Visão Geral

Este guia fornece instruções passo a passo para configurar o ambiente de desenvolvimento local do JHD Managers. Ao final deste guia, você terá um ambiente completo e funcional para desenvolver e testar o sistema.

## Pré-requisitos

Antes de começar, certifique-se de ter os seguintes requisitos instalados:

### Software Necessário

- **Node.js >= 18.0.0** - Runtime JavaScript
  - Verifique a versão: `node --version`
  - Download: https://nodejs.org/

- **npm >= 9.0.0** - Gerenciador de pacotes (incluído com Node.js)
  - Verifique a versão: `npm --version`

- **Git** - Controle de versão
  - Verifique a versão: `git --version`
  - Download: https://git-scm.com/

### Contas Necessárias

- **Conta Groq** (gratuita)
  - Necessária para acessar a API de IA (LLM Vision)
  - Cadastro: https://console.groq.com/

- **Conta Firebase** (plano gratuito)
  - Necessária para o banco de dados Firestore
  - Cadastro: https://console.firebase.google.com/

## Passo 1: Clonar o Repositório

Clone o repositório do projeto para sua máquina local:

```bash
# Clone o repositório
git clone <URL_DO_REPOSITORIO>

# Entre no diretório do projeto
cd jhd-managers
```

## Passo 2: Instalar Dependências

Instale todas as dependências do projeto usando npm:

```bash
npm install
```

Este comando instalará as seguintes dependências principais:
- `express` - Framework web
- `firebase-admin` - SDK do Firebase
- `groq-sdk` - SDK da Groq API
- `multer` - Middleware para upload de arquivos
- `dotenv` - Gerenciamento de variáveis de ambiente

## Passo 3: Configurar Groq API Key

### 3.1 Obter a API Key

1. Acesse https://console.groq.com/
2. Faça login ou crie uma conta gratuita
3. Navegue até a seção "API Keys"
4. Clique em "Create API Key"
5. Dê um nome para sua chave (ex: "JHD Managers Dev")
6. Copie a chave gerada (ela começa com `gsk_`)

> ⚠️ **Importante:** Guarde sua API key em local seguro. Ela não será exibida novamente!

### 3.2 Configurar no Projeto

1. Na raiz do projeto, copie o arquivo de exemplo:

```bash
cp .env.example .env
```

2. Abra o arquivo `.env` em seu editor de texto:

```bash
# Windows
notepad .env

# macOS/Linux
nano .env
# ou
code .env
```

3. Adicione sua API key no arquivo `.env`:

```env
GROQ_API_KEY=gsk_sua_chave_aqui
PORT=3000
USE_MOCK_DATA=false
```

Substitua `gsk_sua_chave_aqui` pela chave que você copiou do console Groq.

## Passo 4: Configurar Firebase (Service Account)

### 4.1 Criar Projeto no Firebase

1. Acesse https://console.firebase.google.com/
2. Clique em "Adicionar projeto" ou "Create a project"
3. Dê um nome ao projeto (ex: "JHD Managers")
4. Siga os passos do assistente (pode desabilitar Google Analytics se preferir)
5. Aguarde a criação do projeto

### 4.2 Ativar o Firestore

1. No menu lateral, clique em "Firestore Database"
2. Clique em "Criar banco de dados" ou "Create database"
3. Escolha o modo de produção (Production mode)
4. Selecione a localização mais próxima (ex: `southamerica-east1` para Brasil)
5. Clique em "Ativar" ou "Enable"

### 4.3 Gerar Credenciais de Service Account

1. No console do Firebase, clique no ícone de engrenagem ⚙️ ao lado de "Visão geral do projeto"
2. Selecione "Configurações do projeto" ou "Project settings"
3. Vá para a aba "Contas de serviço" ou "Service accounts"
4. Clique em "Gerar nova chave privada" ou "Generate new private key"
5. Confirme clicando em "Gerar chave" ou "Generate key"
6. Um arquivo JSON será baixado automaticamente

### 4.4 Configurar Credenciais no Projeto

1. Renomeie o arquivo baixado para `firebase-credentials.json`

2. Mova o arquivo para a raiz do projeto:

```bash
# Exemplo no Windows
move C:\Users\SeuUsuario\Downloads\jhd-managers-*.json firebase-credentials.json

# Exemplo no macOS/Linux
mv ~/Downloads/jhd-managers-*.json firebase-credentials.json
```

3. Verifique se o arquivo está na raiz do projeto:

```bash
# Windows
dir firebase-credentials.json

# macOS/Linux
ls -la firebase-credentials.json
```

> ⚠️ **Segurança:** O arquivo `firebase-credentials.json` contém credenciais sensíveis e **NUNCA** deve ser commitado no Git. Ele já está incluído no `.gitignore`.

### 4.5 Estrutura do Arquivo de Credenciais

O arquivo `firebase-credentials.json` deve ter a seguinte estrutura:

```json
{
  "type": "service_account",
  "project_id": "seu-projeto-id",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@seu-projeto.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

## Passo 5: Estrutura do Arquivo .env

O arquivo `.env` na raiz do projeto deve conter as seguintes variáveis:

```env
# API Key da Groq (obrigatória)
GROQ_API_KEY=gsk_sua_chave_groq_aqui

# Porta do servidor (opcional, padrão: 3000)
PORT=3000

# Modo de desenvolvimento (opcional)
USE_MOCK_DATA=false

# Caminho customizado para credenciais Firebase (opcional)
# FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-credentials.json
```

### Descrição das Variáveis

| Variável | Obrigatória | Descrição | Exemplo |
|----------|-------------|-----------|---------|
| `GROQ_API_KEY` | Sim | Chave de API da Groq para processamento de imagens | `gsk_abc123...` |
| `PORT` | Não | Porta onde o servidor será executado | `3000` |
| `USE_MOCK_DATA` | Não | Usar dados mockados (para testes sem API) | `false` |
| `FIREBASE_SERVICE_ACCOUNT_PATH` | Não | Caminho customizado para credenciais Firebase | `./firebase-credentials.json` |

## Passo 6: Iniciar o Servidor

### 6.1 Comandos Disponíveis

O projeto oferece os seguintes comandos npm:

```bash
# Iniciar o servidor em modo produção
npm start

# Iniciar o servidor em modo desenvolvimento
npm run dev
```

> 💡 **Dica:** Ambos os comandos fazem a mesma coisa neste projeto. Use `npm start` por padrão.

### 6.2 Iniciar o Servidor

Execute o comando:

```bash
npm start
```

Você deverá ver a seguinte saída:

```
✓ Firestore conectado com sucesso
Servidor rodando em http://localhost:3000
API Key configurada: Sim
```

> ✅ **Sucesso:** Se você viu essas mensagens, o ambiente está configurado corretamente!

### 6.3 Possíveis Erros

Se você encontrar erros, consulte a seção [Verificação do Ambiente](#verificação-do-ambiente) abaixo.

## Verificação do Ambiente

### Checklist de Verificação

Use este checklist para garantir que tudo está funcionando:

- [ ] Node.js >= 18.0.0 instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Dependências instaladas (`node_modules/` existe)
- [ ] Arquivo `.env` criado com `GROQ_API_KEY`
- [ ] Arquivo `firebase-credentials.json` na raiz do projeto
- [ ] Servidor inicia sem erros (`npm start`)
- [ ] Mensagem "Firestore conectado com sucesso" aparece
- [ ] Mensagem "API Key configurada: Sim" aparece

### Testar a Aplicação

1. **Abra o navegador** e acesse: http://localhost:3000

2. **Você deverá ver** a página principal do JHD Managers

3. **Teste o upload:**
   - Clique em "Adicionar Partida" no menu
   - Selecione uma imagem de resumo de partida do EA FC 26
   - Escolha a data da partida
   - Clique em "Adicionar Partida"
   - Aguarde o processamento (pode levar 10-30 segundos)
   - Você será redirecionado para a página principal com a partida adicionada

4. **Teste a listagem:**
   - Na página principal, você deverá ver a partida que acabou de adicionar
   - Clique no card da partida para ver os detalhes completos

5. **Teste a exclusão:**
   - Clique no botão "Excluir" em uma partida
   - Confirme a exclusão
   - A partida deverá desaparecer da lista

### Comandos de Diagnóstico

Se algo não estiver funcionando, use estes comandos para diagnosticar:

```bash
# Verificar versão do Node.js
node --version

# Verificar versão do npm
npm --version

# Verificar se dependências estão instaladas
npm list --depth=0

# Verificar se arquivo .env existe
ls -la .env

# Verificar se firebase-credentials.json existe
ls -la firebase-credentials.json

# Verificar conteúdo do .env (sem expor a chave)
grep GROQ_API_KEY .env | cut -d'=' -f1
```

### Erros Comuns

#### Erro: "GROQ_API_KEY não configurada"

**Causa:** Variável de ambiente não está definida ou arquivo `.env` não existe.

**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Abra o arquivo e verifique se contém: `GROQ_API_KEY=sua_chave_aqui`
3. Reinicie o servidor após configurar

#### Erro: "Erro ao conectar ao Firestore"

**Causa:** Arquivo `firebase-credentials.json` não encontrado ou inválido.

**Solução:**
1. Verifique se o arquivo `firebase-credentials.json` está na raiz do projeto
2. Verifique se o arquivo é um JSON válido
3. Baixe novamente as credenciais do Firebase Console se necessário

#### Erro: "Cannot find module"

**Causa:** Dependências não foram instaladas corretamente.

**Solução:**
```bash
# Remova node_modules e reinstale
rm -rf node_modules package-lock.json
npm install
```

#### Erro: "Port 3000 already in use"

**Causa:** Outra aplicação está usando a porta 3000.

**Solução:**
1. Altere a porta no arquivo `.env`: `PORT=3001`
2. Ou encerre o processo que está usando a porta 3000

## Estrutura de Diretórios do Projeto

Entenda a organização dos arquivos do projeto:

```
jhd-managers/
├── .env                          # Variáveis de ambiente (não commitar)
├── .env.example                  # Exemplo de variáveis de ambiente
├── .gitignore                    # Arquivos ignorados pelo Git
├── package.json                  # Dependências e scripts npm
├── package-lock.json             # Lock de versões das dependências
├── README.md                     # Documentação principal
├── firebase-credentials.json     # Credenciais Firebase (não commitar)
├── firebase-credentials.example.json  # Exemplo de credenciais
├── FIREBASE_SETUP.md            # Guia de configuração do Firebase
│
├── server.js                     # Servidor Express e rotas da API
├── database.js                   # Camada de acesso ao Firestore
├── llm-service.js               # Integração com Groq API (LLM Vision)
│
├── public/                       # Frontend (arquivos estáticos)
│   ├── index.html               # Página principal (listagem de partidas)
│   ├── add_partida.html         # Página de upload de partidas
│   ├── style.css                # Estilos globais
│   ├── app.js                   # Lógica de upload e preview
│   ├── matches.js               # Renderização de partidas e modal
│   ├── nav.js                   # Navegação responsiva
│   └── logo.png                 # Logo do projeto
│
├── uploads/                      # Diretório temporário para uploads
│   └── (arquivos temporários)   # Imagens enviadas pelos usuários
│
├── docs/                         # Documentação técnica
│   ├── README.md                # Índice da documentação
│   ├── architecture/            # Documentação de arquitetura
│   │   ├── overview.md          # Visão geral da arquitetura
│   │   └── data-flow.md         # Fluxo de dados
│   ├── api/                     # Documentação da API
│   │   ├── endpoints.md         # Referência de endpoints
│   │   └── examples.md          # Exemplos de uso
│   ├── database/                # Documentação do banco de dados
│   │   ├── schema.md            # Schema do Firestore
│   │   └── queries.md           # Exemplos de queries
│   ├── guides/                  # Guias práticos
│   │   ├── development-setup.md # Este guia
│   │   ├── deployment.md        # Guia de deploy
│   │   └── troubleshooting.md   # Resolução de problemas
│   ├── services/                # Documentação de serviços
│   │   ├── llm-service.md       # Serviço de IA
│   │   └── frontend.md          # Frontend
│   └── security/                # Segurança
│       └── best-practices.md    # Boas práticas
│
├── images/                       # Imagens e logos do projeto
│   └── (arquivos de imagem)
│
├── .kiro/                        # Configurações do Kiro (IDE)
│   └── specs/                   # Especificações de features
│
└── node_modules/                 # Dependências instaladas (não commitar)
    └── (pacotes npm)
```

### Descrição dos Arquivos Principais

#### Backend

- **`server.js`** - Servidor HTTP Express com rotas da API REST
  - `POST /api/upload` - Upload e processamento de partidas
  - `GET /api/matches` - Listar todas as partidas
  - `DELETE /api/matches/:id` - Excluir partida

- **`database.js`** - Camada de acesso ao Firebase Firestore
  - Operações CRUD (Create, Read, Update, Delete)
  - Sistema de IDs incrementais
  - Conversão de Timestamps

- **`llm-service.js`** - Integração com Groq API
  - Conversão de imagem para base64
  - Extração de dados via LLM Vision
  - Geração de análise tática

#### Frontend

- **`public/index.html`** - Página principal
  - Listagem de partidas
  - Dashboard com estatísticas
  - Modal de detalhes

- **`public/add_partida.html`** - Página de upload
  - Formulário de upload
  - Preview de imagem
  - Seleção de data

- **`public/app.js`** - Lógica de upload
  - Envio de FormData
  - Preview de imagem
  - Feedback de progresso

- **`public/matches.js`** - Renderização de partidas
  - Carregamento de dados da API
  - Renderização de cards
  - Modal de detalhes
  - Exclusão de partidas

- **`public/nav.js`** - Navegação
  - Menu responsivo (hamburger)
  - Destaque da página ativa

- **`public/style.css`** - Estilos
  - Design responsivo
  - Tema visual
  - Animações

#### Configuração

- **`.env`** - Variáveis de ambiente (não commitar)
  - Credenciais sensíveis
  - Configurações do servidor

- **`firebase-credentials.json`** - Credenciais Firebase (não commitar)
  - Service account do Firebase
  - Chaves privadas

- **`package.json`** - Configuração do projeto
  - Dependências
  - Scripts npm
  - Metadados do projeto

## Próximos Passos

Agora que seu ambiente está configurado, você pode:

1. **Explorar a arquitetura:**
   - Leia [Visão Geral da Arquitetura](../architecture/overview.md)
   - Entenda o [Fluxo de Dados](../architecture/data-flow.md)

2. **Conhecer a API:**
   - Consulte [Documentação de Endpoints](../api/endpoints.md)
   - Veja [Exemplos de API](../api/examples.md)

3. **Entender o banco de dados:**
   - Leia [Schema do Firestore](../database/schema.md)
   - Veja [Exemplos de Queries](../database/queries.md)

4. **Aprender sobre os serviços:**
   - [Serviço de IA (LLM)](../services/llm-service.md)
   - [Frontend](../services/frontend.md)

5. **Preparar para produção:**
   - [Guia de Deploy](deployment.md)
   - [Segurança e Boas Práticas](../security/best-practices.md)

## Suporte

Se você encontrar problemas não cobertos neste guia:

1. Consulte o [Guia de Troubleshooting](troubleshooting.md)
2. Verifique a documentação do [Firebase](https://firebase.google.com/docs)
3. Consulte a documentação da [Groq API](https://console.groq.com/docs)
4. Abra uma issue no repositório do projeto

## Contribuindo

Para contribuir com o projeto:

1. Faça um fork do repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

Lembre-se de atualizar a documentação quando fizer mudanças no código!
