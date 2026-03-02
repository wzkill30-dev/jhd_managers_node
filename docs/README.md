# Documentação JHD Managers

![Status](https://img.shields.io/badge/status-active-success.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

Bem-vindo à documentação técnica completa do **JHD Managers**, um sistema de análise automática de partidas do EA FC 26 que utiliza inteligência artificial para extrair dados de imagens e gerar análises táticas detalhadas.

## 📖 Sobre o Projeto

O JHD Managers permite que usuários façam upload de screenshots de resumo de partidas do EA FC 26, processa automaticamente as estatísticas visíveis usando LLM Vision (Groq API), armazena os dados em Firebase Firestore e disponibiliza um dashboard completo com histórico e análises táticas geradas por IA.

### Principais Características

- 🤖 **Extração Automática de Dados**: Utiliza LLM Vision para extrair ~30 estatísticas de imagens
- 📊 **Dashboard Completo**: Visualização de histórico com estatísticas detalhadas
- 🎯 **Análise Tática por IA**: Análises táticas geradas automaticamente em português brasileiro
- 📱 **Design Responsivo**: Interface adaptada para desktop e mobile
- 🔥 **Firebase Firestore**: Armazenamento NoSQL escalável
- ⚡ **API REST**: Backend Node.js + Express com endpoints bem definidos

## 🚀 Quick Start

### Configuração Rápida (5 minutos)

```bash
# 1. Clone o repositório
git clone https://github.com/wzkill30-dev/jhd_managers_node.git
cd jhd_managers_node

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais Groq e Firebase

# 4. Inicie o servidor
npm start

# 5. Acesse no navegador
# http://localhost:3000
```

> 💡 **Primeira vez?** Siga o [Guia de Configuração do Ambiente](guides/development-setup.md) para instruções detalhadas.

### Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Conta no [Groq](https://console.groq.com/) (gratuita)
- Conta no [Firebase](https://console.firebase.google.com/) (plano gratuito)

## 📚 Índice da Documentação

### 🎯 Começando

Documentação essencial para iniciar com o projeto:

- **[Guia de Configuração do Ambiente](guides/development-setup.md)**  
  Passo a passo completo para configurar o ambiente de desenvolvimento local
  
- **[Guia de Deploy](guides/deployment.md)**  
  Instruções para fazer deploy em produção (Render, Heroku, Railway, VPS)

### 🏗️ Arquitetura

Entenda como o sistema foi construído:

- **[Visão Geral da Arquitetura](architecture/overview.md)**  
  Stack tecnológica, componentes principais, padrões arquiteturais e diagramas
  
- **[Fluxo de Dados](architecture/data-flow.md)**  
  Diagramas de sequência e transformações de dados (imagem → base64 → JSON → Firestore)

### 📡 Referência Técnica

Documentação detalhada de APIs e banco de dados:

- **[API Endpoints](api/endpoints.md)**  
  Referência completa de todos os endpoints REST (POST /api/upload, GET /api/matches, DELETE /api/matches/:id)
  
- **[Exemplos de API](api/examples.md)**  
  Exemplos práticos de requisições e respostas usando JavaScript, curl e Postman
  
- **[Schema do Banco de Dados](database/schema.md)**  
  Estrutura completa do Firestore (collections, campos, tipos, índices)
  
- **[Queries do Firestore](database/queries.md)**  
  Exemplos de queries, filtros, ordenação e transações

### 🤖 Serviços

Documentação dos componentes especializados:

- **[Serviço de IA (LLM)](services/llm-service.md)**  
  Como funciona a extração de dados via Groq API (modelo, prompt, parâmetros, campos extraídos)
  
- **[Frontend](services/frontend.md)**  
  Estrutura do frontend (páginas, scripts, modal, navegação responsiva)

### 🔧 Operações

Guias para manutenção e resolução de problemas:

- **[Troubleshooting](guides/troubleshooting.md)**  
  Soluções para problemas comuns (erros de API, Firebase, upload, timezone)
  
- **[Segurança e Boas Práticas](security/best-practices.md)**  
  Práticas de segurança, gestão de credenciais, validações e configurações recomendadas

## 🛠️ Stack Tecnológica

### Backend
- **Node.js 18+**: Runtime JavaScript
- **Express.js**: Framework web minimalista
- **Multer**: Middleware para upload de arquivos
- **Firebase Admin SDK**: Integração com Firestore
- **Groq SDK**: Cliente para API de LLM Vision

### Frontend
- **HTML5**: Estrutura semântica
- **CSS3**: Estilização responsiva
- **JavaScript Vanilla**: Lógica do cliente (sem frameworks)

### Serviços Externos
- **Groq API**: Processamento de imagens com LLM (llama-4-scout-17b-16e-instruct)
- **Firebase Firestore**: Banco de dados NoSQL em tempo real

## 📊 Fluxo de Dados Simplificado

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Usuário   │─────▶│   Frontend  │─────▶│   Backend   │─────▶│  Groq API   │
│  (Upload)   │      │  (Preview)  │      │  (Express)  │      │ (LLM Vision)│
└─────────────┘      └─────────────┘      └──────┬──────┘      └──────┬──────┘
                                                  │                     │
                                                  │                     │
                                                  ▼                     ▼
                                          ┌─────────────┐      ┌─────────────┐
                                          │  Firestore  │◀─────│  Extração   │
                                          │  (Storage)  │      │  de Dados   │
                                          └─────────────┘      └─────────────┘
```

> 📖 Veja o [Fluxo de Dados Detalhado](architecture/data-flow.md) para diagramas de sequência completos.

## 🎯 Casos de Uso Principais

### 1. Upload de Partida
```javascript
// Frontend envia imagem + data
const formData = new FormData();
formData.append('image', imageFile);
formData.append('matchDate', '2024-01-15');

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

### 2. Listar Partidas
```javascript
// Backend retorna partidas ordenadas por data
const response = await fetch('/api/matches');
const { data: matches } = await response.json();
```

### 3. Visualizar Detalhes
```javascript
// Modal exibe estatísticas completas e análise tática
showMatchDetails(match);
```

> 📖 Veja mais exemplos em [Exemplos de API](api/examples.md).

## 🔗 Links Úteis

### Recursos Externos
- [Groq Console](https://console.groq.com/) - Gerenciar API keys
- [Firebase Console](https://console.firebase.google.com/) - Gerenciar projeto Firebase
- [Render Dashboard](https://dashboard.render.com/) - Deploy e monitoramento
- [Node.js Documentation](https://nodejs.org/docs/) - Documentação oficial do Node.js
- [Express.js Guide](https://expressjs.com/en/guide/routing.html) - Guia do Express

### Repositório
- [GitHub Repository](https://github.com/wzkill30-dev/jhd_managers_node) - Código fonte
- [Issues](https://github.com/wzkill30-dev/jhd_managers_node/issues) - Reportar bugs ou sugerir melhorias
- [Pull Requests](https://github.com/wzkill30-dev/jhd_managers_node/pulls) - Contribuições

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

> ⚠️ **Importante**: Ao modificar código, atualize a documentação correspondente.

## 📝 Estrutura da Documentação

```
docs/
├── README.md                    # Este arquivo (índice principal)
├── architecture/
│   ├── overview.md             # Visão geral da arquitetura
│   └── data-flow.md            # Fluxo de dados detalhado
├── api/
│   ├── endpoints.md            # Documentação de endpoints
│   └── examples.md             # Exemplos de uso da API
├── database/
│   ├── schema.md               # Estrutura do Firestore
│   └── queries.md              # Exemplos de queries
├── guides/
│   ├── development-setup.md    # Configuração do ambiente
│   ├── deployment.md           # Guia de deploy
│   └── troubleshooting.md      # Resolução de problemas
├── services/
│   ├── llm-service.md          # Documentação do serviço de IA
│   └── frontend.md             # Documentação do frontend
└── security/
    └── best-practices.md       # Segurança e boas práticas
```

## 🔒 Segurança

> ⚠️ **Atenção**: Nunca commite credenciais sensíveis no repositório!

Arquivos que **NUNCA** devem ser commitados:
- `firebase-credentials.json`
- `.env`
- Qualquer arquivo contendo API keys

> 📖 Leia o guia completo de [Segurança e Boas Práticas](security/best-practices.md).

## 📊 Estatísticas do Projeto

- **~30 estatísticas** extraídas por partida
- **3 endpoints** REST principais
- **2 collections** no Firestore
- **100% JavaScript** (Node.js + Vanilla JS)
- **0 frameworks** frontend (HTML/CSS/JS puro)

## 🆘 Precisa de Ajuda?

### Problemas Comuns

- **Erro de API Key**: Veja [Troubleshooting - GROQ_API_KEY](guides/troubleshooting.md#erro-groq_api_key-não-configurada)
- **Erro de Firebase**: Veja [Troubleshooting - Firebase](guides/troubleshooting.md#erro-de-conexão-com-firebase)
- **Erro de Upload**: Veja [Troubleshooting - Upload](guides/troubleshooting.md#erro-no-upload-de-imagens)

### Suporte

- 📖 Consulte a [documentação completa](https://github.com/wzkill30-dev/jhd_managers_node/tree/main/docs)
- 🐛 Reporte bugs via [GitHub Issues](https://github.com/wzkill30-dev/jhd_managers_node/issues)
- 💬 Discussões no [GitHub Discussions](https://github.com/wzkill30-dev/jhd_managers_node/discussions)

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](../LICENSE) para mais detalhes.

## 👥 Autores

**JHD Managers Team**

---

> 💡 **Dica**: Marque esta página nos favoritos para acesso rápido à documentação!

**Última atualização**: Janeiro 2024
