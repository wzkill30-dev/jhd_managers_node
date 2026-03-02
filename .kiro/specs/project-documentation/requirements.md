# Requirements Document

## Introduction

O JHD Managers é um sistema de análise automática de partidas do EA FC 26 que utiliza inteligência artificial para extrair dados de imagens de resumo de partidas e gerar análises táticas detalhadas. O sistema permite aos usuários fazer upload de screenshots do jogo, processar automaticamente as estatísticas visíveis, armazenar os dados em banco de dados NoSQL e visualizar histórico completo com dashboard de estatísticas.

Este documento define os requisitos para a documentação completa do projeto, incluindo arquitetura, APIs, guias de desenvolvimento e deploy.

## Glossary

- **System**: O sistema JHD Managers como um todo
- **Documentation_Generator**: Componente responsável por gerar a documentação
- **Architecture_Documentation**: Documentação da arquitetura do sistema
- **API_Documentation**: Documentação dos endpoints da API REST
- **Database_Schema**: Documentação da estrutura do Firestore
- **Development_Guide**: Guia para desenvolvedores configurarem o ambiente
- **Deployment_Guide**: Guia para deploy em produção
- **Troubleshooting_Guide**: Guia de resolução de problemas comuns
- **Data_Flow_Diagram**: Diagrama do fluxo de dados no sistema
- **User**: Desenvolvedor ou usuário final do sistema

## Requirements

### Requirement 1: Documentação de Arquitetura

**User Story:** Como desenvolvedor, eu quero entender a arquitetura do sistema, para que eu possa compreender como os componentes se integram.

#### Acceptance Criteria

1. THE Architecture_Documentation SHALL descrever a stack tecnológica completa (Node.js, Express, Groq SDK, Firebase Firestore, HTML/CSS/JavaScript)
2. THE Architecture_Documentation SHALL documentar todos os componentes principais (Backend, Frontend, Serviço de IA, Banco de Dados)
3. THE Architecture_Documentation SHALL explicar o padrão arquitetural utilizado (API REST com frontend estático)
4. THE Architecture_Documentation SHALL incluir diagrama visual da arquitetura de alto nível
5. THE Architecture_Documentation SHALL descrever as responsabilidades de cada camada do sistema

### Requirement 2: Documentação de Fluxo de Dados

**User Story:** Como desenvolvedor, eu quero visualizar o fluxo de dados no sistema, para que eu possa entender como as informações transitam entre os componentes.

#### Acceptance Criteria

1. THE Data_Flow_Diagram SHALL ilustrar o fluxo completo desde o upload da imagem até a visualização dos dados
2. THE Data_Flow_Diagram SHALL mostrar a integração com a Groq API para extração de dados via LLM Vision
3. THE Data_Flow_Diagram SHALL documentar o processo de armazenamento no Firebase Firestore
4. THE Data_Flow_Diagram SHALL incluir os pontos de transformação de dados (imagem → base64 → JSON → Firestore)
5. WHEN um User faz upload de uma imagem, THE Data_Flow_Diagram SHALL mostrar todos os passos até o armazenamento

### Requirement 3: Documentação da Estrutura do Banco de Dados

**User Story:** Como desenvolvedor, eu quero conhecer a estrutura do banco de dados, para que eu possa entender como os dados são organizados e relacionados.

#### Acceptance Criteria

1. THE Database_Schema SHALL documentar a coleção "matches" com todos os campos e tipos de dados
2. THE Database_Schema SHALL documentar a coleção "counters" e o sistema de ID incremental
3. THE Database_Schema SHALL especificar os campos obrigatórios e opcionais de cada documento
4. THE Database_Schema SHALL incluir exemplos de documentos JSON reais do Firestore
5. THE Database_Schema SHALL documentar os índices utilizados para ordenação (match_date desc)
6. THE Database_Schema SHALL listar todas as ~30 estatísticas extraídas (chutes, posse, passes, duelos, faltas, etc.)

### Requirement 4: Documentação de API Endpoints

**User Story:** Como desenvolvedor, eu quero documentação completa dos endpoints da API, para que eu possa integrar ou modificar o sistema corretamente.

#### Acceptance Criteria

1. THE API_Documentation SHALL documentar o endpoint POST /api/upload com parâmetros (image, matchDate)
2. THE API_Documentation SHALL documentar o endpoint GET /api/matches com formato de resposta
3. THE API_Documentation SHALL documentar o endpoint DELETE /api/matches/:id com parâmetros
4. THE API_Documentation SHALL incluir exemplos de requisições e respostas para cada endpoint
5. THE API_Documentation SHALL especificar os códigos de status HTTP retornados (200, 400, 500)
6. THE API_Documentation SHALL documentar os formatos de erro retornados pela API
7. THE API_Documentation SHALL especificar os headers necessários para cada requisição

### Requirement 5: Guia de Configuração do Ambiente de Desenvolvimento

**User Story:** Como novo desenvolvedor, eu quero um guia passo a passo para configurar o ambiente, para que eu possa começar a desenvolver rapidamente.

#### Acceptance Criteria

1. THE Development_Guide SHALL listar todos os pré-requisitos (Node.js >= 18.0.0, npm, conta Groq, conta Firebase)
2. THE Development_Guide SHALL documentar o processo de clonagem e instalação de dependências
3. THE Development_Guide SHALL explicar como obter e configurar a GROQ_API_KEY no arquivo .env
4. THE Development_Guide SHALL explicar como configurar as credenciais do Firebase (firebase-credentials.json)
5. THE Development_Guide SHALL documentar os comandos para iniciar o servidor (npm start, npm run dev)
6. THE Development_Guide SHALL incluir instruções para testar se o ambiente está funcionando corretamente
7. THE Development_Guide SHALL documentar a estrutura de diretórios do projeto

### Requirement 6: Guia de Deploy em Produção

**User Story:** Como DevOps, eu quero instruções para fazer deploy do sistema, para que eu possa colocá-lo em produção de forma segura.

#### Acceptance Criteria

1. THE Deployment_Guide SHALL documentar as variáveis de ambiente necessárias em produção
2. THE Deployment_Guide SHALL incluir instruções para deploy em plataformas comuns (Heroku, Railway, Render, VPS)
3. THE Deployment_Guide SHALL documentar as configurações de segurança necessárias (CORS, rate limiting)
4. THE Deployment_Guide SHALL especificar os requisitos de recursos (memória, CPU, storage)
5. THE Deployment_Guide SHALL incluir checklist de verificação pós-deploy
6. THE Deployment_Guide SHALL documentar estratégias de backup do Firebase Firestore
7. THE Deployment_Guide SHALL explicar como configurar domínio customizado e HTTPS

### Requirement 7: Guia de Troubleshooting

**User Story:** Como desenvolvedor, eu quero um guia de resolução de problemas, para que eu possa resolver erros comuns rapidamente.

#### Acceptance Criteria

1. THE Troubleshooting_Guide SHALL documentar erros comuns de configuração da GROQ_API_KEY
2. THE Troubleshooting_Guide SHALL documentar erros de conexão com Firebase Firestore
3. THE Troubleshooting_Guide SHALL incluir soluções para problemas de upload de imagens
4. THE Troubleshooting_Guide SHALL documentar erros de extração de dados via LLM
5. THE Troubleshooting_Guide SHALL incluir comandos de diagnóstico para verificar o sistema
6. THE Troubleshooting_Guide SHALL documentar problemas de timezone nas datas das partidas
7. THE Troubleshooting_Guide SHALL incluir logs de exemplo para facilitar debugging

### Requirement 8: Documentação do Serviço de IA (LLM)

**User Story:** Como desenvolvedor, eu quero entender como funciona a extração de dados via IA, para que eu possa ajustar ou melhorar o prompt.

#### Acceptance Criteria

1. THE Documentation_Generator SHALL documentar o modelo LLM utilizado (llama-4-scout-17b-16e-instruct)
2. THE Documentation_Generator SHALL explicar o processo de conversão de imagem para base64
3. THE Documentation_Generator SHALL documentar a estrutura do prompt enviado para a Groq API
4. THE Documentation_Generator SHALL listar todos os campos extraídos pelo LLM (~30 estatísticas)
5. THE Documentation_Generator SHALL documentar os parâmetros da API (temperature: 0.3, max_tokens: 3000)
6. THE Documentation_Generator SHALL explicar como o sistema lida com campos não detectados (null values)
7. THE Documentation_Generator SHALL incluir exemplos de respostas da API Groq

### Requirement 9: Documentação do Frontend

**User Story:** Como desenvolvedor frontend, eu quero entender a estrutura do frontend, para que eu possa modificar ou estender a interface.

#### Acceptance Criteria

1. THE Documentation_Generator SHALL documentar a estrutura de páginas (index.html, add_partida.html)
2. THE Documentation_Generator SHALL documentar os scripts JavaScript (app.js, matches.js, nav.js)
3. THE Documentation_Generator SHALL explicar o sistema de modal para detalhes de partidas
4. THE Documentation_Generator SHALL documentar o sistema de navegação responsiva (hamburger menu)
5. THE Documentation_Generator SHALL listar as funcionalidades de cada página
6. THE Documentation_Generator SHALL documentar o sistema de preview de imagens antes do upload
7. THE Documentation_Generator SHALL explicar como os dados são renderizados dinamicamente

### Requirement 10: Documentação de Segurança e Boas Práticas

**User Story:** Como desenvolvedor, eu quero conhecer as práticas de segurança implementadas, para que eu possa manter o sistema seguro.

#### Acceptance Criteria

1. THE Documentation_Generator SHALL documentar o uso de variáveis de ambiente para credenciais sensíveis
2. THE Documentation_Generator SHALL explicar a importância de não commitar firebase-credentials.json
3. THE Documentation_Generator SHALL documentar as validações de entrada implementadas
4. THE Documentation_Generator SHALL recomendar práticas de segurança para produção (rate limiting, CORS)
5. THE Documentation_Generator SHALL documentar o tratamento de erros sem expor informações sensíveis
6. THE Documentation_Generator SHALL incluir recomendações para rotação de API keys
7. THE Documentation_Generator SHALL documentar as regras de segurança do Firebase Firestore recomendadas
