# API Endpoints

> Última atualização: 2024

## Visão Geral

A API REST do JHD Managers fornece endpoints para gerenciar partidas do EA FC 26. Todos os endpoints retornam JSON e seguem convenções REST padrão.

**Base URL:** `http://localhost:3000` (desenvolvimento)

**Content-Type:** `application/json` (exceto upload que usa `multipart/form-data`)

## Índice

- [POST /api/upload](#post-apiupload) - Upload e processamento de partida
- [GET /api/matches](#get-apimatches) - Listar todas as partidas
- [DELETE /api/matches/:id](#delete-apimatchesid) - Excluir partida

## Códigos de Status HTTP

A API utiliza os seguintes códigos de status HTTP:

| Código | Significado | Uso |
|--------|-------------|-----|
| 200 | OK | Requisição bem-sucedida |
| 400 | Bad Request | Parâmetros inválidos ou ausentes |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro no servidor |

## Formato de Erro Padrão

Todas as respostas de erro seguem o formato:

```json
{
  "error": "Descrição do erro"
}
```

**Exemplo:**
```json
{
  "error": "Nenhuma imagem enviada"
}
```

---

## POST /api/upload

Faz upload de uma imagem de resumo de partida do EA FC 26 e processa automaticamente usando IA para extrair estatísticas.

### Endpoint

```
POST /api/upload
```

### Content-Type

```
multipart/form-data
```

### Headers Necessários

Nenhum header especial é necessário. O navegador define automaticamente `Content-Type: multipart/form-data` ao enviar FormData.

### Parâmetros

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| image | File | Sim | Arquivo de imagem (JPEG/PNG) contendo o resumo da partida |
| matchDate | String | Não | Data da partida no formato YYYY-MM-DD. Se omitido, usa a data atual |

### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "matchId": 42,
  "firestoreId": "abc123xyz789",
  "data": {
    "home_team": "Manchester City",
    "away_team": "Liverpool",
    "home_score": 2,
    "away_score": 1,
    "home_shots": 15,
    "away_shots": 8,
    "home_possession": 62,
    "away_possession": 38,
    "shot_accuracy_home": 67,
    "shot_accuracy_away": 50,
    "pass_accuracy_home": 89,
    "pass_accuracy_away": 82,
    "dribbles_completed_rate_home": 75,
    "dribbles_completed_rate_away": 60,
    "expected_goals_home": 2.3,
    "expected_goals_away": 0.8,
    "passes_home": 542,
    "passes_away": 318,
    "duels_won_home": 28,
    "duels_won_away": 22,
    "duels_lost_home": 18,
    "duels_lost_away": 24,
    "interceptions_home": 12,
    "interceptions_away": 15,
    "blocks_home": 5,
    "blocks_away": 8,
    "ball_recovery_time": 8,
    "fouls_committed_home": 10,
    "fouls_committed_away": 14,
    "fouls_home": 14,
    "fouls_away": 10,
    "offsides_home": 2,
    "offsides_away": 4,
    "corners_home": 7,
    "corners_away": 3,
    "penalties_home": 0,
    "penalties_away": 0,
    "yellow_cards_home": 2,
    "yellow_cards_away": 3,
    "match_analysis": "O Manchester City dominou a partida com 62% de posse..."
  }
}
```

### Campos da Resposta

| Campo | Tipo | Descrição |
|-------|------|-----------|
| success | Boolean | Indica se a operação foi bem-sucedida |
| matchId | Number | ID incremental da partida (1, 2, 3...) |
| firestoreId | String | ID único do documento no Firestore |
| data | Object | Objeto contendo todas as estatísticas extraídas |

### Respostas de Erro

#### 400 Bad Request - Nenhuma imagem enviada

```json
{
  "error": "Nenhuma imagem enviada"
}
```

**Causa:** O campo `image` não foi incluído na requisição ou está vazio.

#### 500 Internal Server Error - Erro no processamento

```json
{
  "error": "Erro ao chamar Groq API: Invalid API key"
}
```

**Causas possíveis:**
- API key da Groq inválida ou não configurada
- Erro na extração de dados via LLM
- Erro ao salvar no Firestore
- Formato de imagem não suportado

### Exemplo de Uso (JavaScript)

```javascript
// Obter referência ao input de arquivo
const fileInput = document.getElementById('imageInput');
const matchDateInput = document.getElementById('matchDate');

// Criar FormData
const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('matchDate', matchDateInput.value);

// Enviar requisição
try {
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData
  });
  
  const result = await response.json();
  
  if (result.success) {
    console.log('Partida adicionada com sucesso!');
    console.log('Match ID:', result.matchId);
    console.log('Firestore ID:', result.firestoreId);
  } else {
    console.error('Erro:', result.error);
  }
} catch (error) {
  console.error('Erro na requisição:', error);
}
```

### Exemplo de Uso (cURL)

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@/path/to/match-screenshot.jpg" \
  -F "matchDate=2024-01-15"
```

### Notas Importantes

> ⚠️ **Atenção:** O processamento pode levar de 5 a 15 segundos dependendo da complexidade da imagem e da carga da API Groq.

> 💡 **Dica:** Certifique-se de que a imagem contém o resumo completo da partida com todas as estatísticas visíveis para melhor precisão na extração.

> ✅ **Formatos Suportados:** JPEG, PNG

---

## GET /api/matches

Retorna a lista de todas as partidas armazenadas, ordenadas por data de upload (mais recentes primeiro).

### Endpoint

```
GET /api/matches
```

### Headers Necessários

Nenhum header especial é necessário.

### Parâmetros

Este endpoint não aceita parâmetros. Retorna todas as partidas.

### Query Parameters

Atualmente não há suporte para filtros ou paginação. Todas as partidas são retornadas.

### Resposta de Sucesso (200 OK)

```json
[
  {
    "id": "abc123xyz789",
    "match_id": 42,
    "match_date": "2024-01-15",
    "upload_date": "2024-01-15T18:30:00.000Z",
    "home_team": "Manchester City",
    "away_team": "Liverpool",
    "home_score": 2,
    "away_score": 1,
    "home_shots": 15,
    "away_shots": 8,
    "home_possession": 62,
    "away_possession": 38,
    "shot_accuracy_home": 67,
    "shot_accuracy_away": 50,
    "pass_accuracy_home": 89,
    "pass_accuracy_away": 82,
    "dribbles_completed_rate_home": 75,
    "dribbles_completed_rate_away": 60,
    "expected_goals_home": 2.3,
    "expected_goals_away": 0.8,
    "passes_home": 542,
    "passes_away": 318,
    "duels_won_home": 28,
    "duels_won_away": 22,
    "duels_lost_home": 18,
    "duels_lost_away": 24,
    "interceptions_home": 12,
    "interceptions_away": 15,
    "blocks_home": 5,
    "blocks_away": 8,
    "ball_recovery_time": 8,
    "fouls_committed_home": 10,
    "fouls_committed_away": 14,
    "fouls_home": 14,
    "fouls_away": 10,
    "offsides_home": 2,
    "offsides_away": 4,
    "corners_home": 7,
    "corners_away": 3,
    "penalties_home": 0,
    "penalties_away": 0,
    "yellow_cards_home": 2,
    "yellow_cards_away": 3,
    "match_analysis": "O Manchester City dominou a partida...",
    "raw_data": "{\"home_team\":\"Manchester City\",...}"
  },
  {
    "id": "def456uvw012",
    "match_id": 41,
    "match_date": "2024-01-14",
    "upload_date": "2024-01-14T20:15:00.000Z",
    "home_team": "Real Madrid",
    "away_team": "Barcelona",
    "home_score": 3,
    "away_score": 2,
    ...
  }
]
```

### Formato da Resposta

A resposta é um array de objetos, onde cada objeto representa uma partida.

### Campos do Objeto Match

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | String | ID único do documento no Firestore |
| match_id | Number | ID incremental da partida |
| match_date | String | Data da partida (YYYY-MM-DD) |
| upload_date | String | Data e hora do upload (ISO 8601) |
| home_team | String | Nome do time da casa |
| away_team | String | Nome do time visitante |
| home_score | Number | Gols do time da casa |
| away_score | Number | Gols do time visitante |
| home_shots | Number | Chutes a gol (casa) |
| away_shots | Number | Chutes a gol (visitante) |
| home_possession | Number | Posse de bola % (casa) |
| away_possession | Number | Posse de bola % (visitante) |
| shot_accuracy_home | Number | Precisão de chute % (casa) |
| shot_accuracy_away | Number | Precisão de chute % (visitante) |
| pass_accuracy_home | Number | Precisão de passe % (casa) |
| pass_accuracy_away | Number | Precisão de passe % (visitante) |
| dribbles_completed_rate_home | Number | Taxa de dribles % (casa) |
| dribbles_completed_rate_away | Number | Taxa de dribles % (visitante) |
| expected_goals_home | Number | xG - Expected Goals (casa) |
| expected_goals_away | Number | xG - Expected Goals (visitante) |
| passes_home | Number | Total de passes (casa) |
| passes_away | Number | Total de passes (visitante) |
| duels_won_home | Number | Duelos ganhos (casa) |
| duels_won_away | Number | Duelos ganhos (visitante) |
| duels_lost_home | Number | Duelos perdidos (casa) |
| duels_lost_away | Number | Duelos perdidos (visitante) |
| interceptions_home | Number | Interceptações (casa) |
| interceptions_away | Number | Interceptações (visitante) |
| blocks_home | Number | Bloqueios (casa) |
| blocks_away | Number | Bloqueios (visitante) |
| ball_recovery_time | Number | Tempo de recuperação (segundos) |
| fouls_committed_home | Number | Faltas cometidas (casa) |
| fouls_committed_away | Number | Faltas cometidas (visitante) |
| fouls_home | Number | Faltas sofridas (casa) |
| fouls_away | Number | Faltas sofridas (visitante) |
| offsides_home | Number | Impedimentos (casa) |
| offsides_away | Number | Impedimentos (visitante) |
| corners_home | Number | Escanteios (casa) |
| corners_away | Number | Escanteios (visitante) |
| penalties_home | Number | Pênaltis (casa) |
| penalties_away | Number | Pênaltis (visitante) |
| yellow_cards_home | Number | Cartões amarelos (casa) |
| yellow_cards_away | Number | Cartões amarelos (visitante) |
| match_analysis | String | Análise tática gerada por IA (150-200 palavras) |
| raw_data | String | JSON original da extração (para debug) |

### Ordenação

As partidas são retornadas ordenadas por `upload_date` em ordem decrescente (mais recentes primeiro).

### Respostas de Erro

#### 500 Internal Server Error

```json
{
  "error": "Erro ao buscar partidas: Connection timeout"
}
```

**Causas possíveis:**
- Erro de conexão com o Firestore
- Credenciais do Firebase inválidas
- Problemas de rede

### Exemplo de Uso (JavaScript)

```javascript
// Buscar todas as partidas
async function loadMatches() {
  try {
    const response = await fetch('/api/matches');
    const matches = await response.json();
    
    console.log(`Total de partidas: ${matches.length}`);
    
    matches.forEach(match => {
      console.log(`${match.home_team} ${match.home_score} x ${match.away_score} ${match.away_team}`);
    });
    
    return matches;
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
  }
}

// Usar a função
loadMatches();
```

### Exemplo de Uso (cURL)

```bash
curl -X GET http://localhost:3000/api/matches
```

### Exemplo de Uso (Fetch com tratamento de erro)

```javascript
fetch('/api/matches')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(matches => {
    console.log('Partidas carregadas:', matches);
  })
  .catch(error => {
    console.error('Erro:', error);
  });
```

### Notas Importantes

> 💡 **Dica:** Se você precisa filtrar partidas por data ou time, faça a filtragem no lado do cliente após receber todas as partidas.

> ⚠️ **Performance:** Com muitas partidas (>1000), considere implementar paginação no futuro.

---

## DELETE /api/matches/:id

Exclui uma partida específica do banco de dados.

### Endpoint

```
DELETE /api/matches/:id
```

### Headers Necessários

Nenhum header especial é necessário.

### Parâmetros de Rota

| Nome | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| id | String | Sim | ID do documento no Firestore (campo `id` retornado por GET /api/matches) |

> ⚠️ **Importante:** Use o campo `id` (Firestore document ID), não o `match_id` (ID incremental).

### Resposta de Sucesso (200 OK)

```json
{
  "success": true,
  "message": "Partida excluída com sucesso"
}
```

### Respostas de Erro

#### 400 Bad Request - ID inválido

```json
{
  "error": "ID da partida inválido"
}
```

**Causas:**
- ID não foi fornecido
- ID é `undefined` ou `null`
- ID está vazio

#### 404 Not Found - Partida não encontrada

Atualmente, o endpoint retorna sucesso mesmo se a partida não existir (comportamento do Firestore). Em versões futuras, pode retornar 404.

#### 500 Internal Server Error

```json
{
  "error": "Erro ao excluir partida: Permission denied"
}
```

**Causas possíveis:**
- Erro de conexão com o Firestore
- Permissões insuficientes no Firebase
- Problemas de rede

### Exemplo de Uso (JavaScript)

```javascript
// Excluir uma partida
async function deleteMatch(firestoreId) {
  // Confirmar com o usuário
  if (!confirm('Tem certeza que deseja excluir esta partida?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/matches/${firestoreId}`, {
      method: 'DELETE'
    });
    
    const result = await response.json();
    
    if (result.success) {
      console.log('Partida excluída com sucesso!');
      // Recarregar lista de partidas
      loadMatches();
    } else {
      console.error('Erro:', result.error);
      alert('Erro ao excluir partida: ' + result.error);
    }
  } catch (error) {
    console.error('Erro na requisição:', error);
    alert('Erro ao excluir partida');
  }
}

// Usar a função
deleteMatch('abc123xyz789');
```

### Exemplo de Uso (cURL)

```bash
curl -X DELETE http://localhost:3000/api/matches/abc123xyz789
```

### Exemplo Completo com Confirmação

```javascript
// Adicionar event listener ao botão de exclusão
document.querySelectorAll('.delete-button').forEach(button => {
  button.addEventListener('click', async (e) => {
    const matchId = e.target.dataset.matchId;
    const matchName = e.target.dataset.matchName;
    
    if (confirm(`Excluir partida: ${matchName}?`)) {
      try {
        const response = await fetch(`/api/matches/${matchId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Remover elemento da DOM
            e.target.closest('.match-card').remove();
            console.log('Partida excluída com sucesso');
          }
        } else {
          throw new Error('Erro ao excluir');
        }
      } catch (error) {
        console.error('Erro:', error);
        alert('Não foi possível excluir a partida');
      }
    }
  });
});
```

### Notas Importantes

> ⚠️ **Atenção:** A exclusão é permanente e não pode ser desfeita. Sempre confirme com o usuário antes de excluir.

> 💡 **Dica:** Implemente um sistema de "soft delete" (marcação como excluído) se precisar manter histórico.

> ✅ **Boas Práticas:** Sempre mostre uma confirmação ao usuário antes de executar a exclusão.

---

## Resumo dos Endpoints

| Método | Endpoint | Descrição | Content-Type |
|--------|----------|-----------|--------------|
| POST | /api/upload | Upload e processamento de partida | multipart/form-data |
| GET | /api/matches | Listar todas as partidas | application/json |
| DELETE | /api/matches/:id | Excluir partida específica | application/json |

## Headers Globais

### Request Headers

Nenhum header especial é necessário para os endpoints atuais. O navegador configura automaticamente:

- `Content-Type: multipart/form-data` para POST /api/upload
- `Content-Type: application/json` para outros endpoints (quando aplicável)

### Response Headers

Todos os endpoints retornam:

```
Content-Type: application/json; charset=utf-8
```

## Tratamento de Erros

### Estrutura de Erro Padrão

Todos os erros seguem o formato:

```json
{
  "error": "Mensagem descritiva do erro"
}
```

### Códigos de Status por Tipo de Erro

| Código | Tipo | Quando Ocorre |
|--------|------|---------------|
| 400 | Bad Request | Parâmetros inválidos, ausentes ou malformados |
| 404 | Not Found | Recurso não encontrado (futuro) |
| 500 | Internal Server Error | Erro no servidor, API externa, ou banco de dados |

### Exemplos de Erros Comuns

#### Erro 400 - Imagem não enviada

```json
{
  "error": "Nenhuma imagem enviada"
}
```

**Solução:** Certifique-se de incluir o campo `image` no FormData.

#### Erro 400 - ID inválido

```json
{
  "error": "ID da partida inválido"
}
```

**Solução:** Verifique se o ID está correto e não é `undefined` ou `null`.

#### Erro 500 - API Key não configurada

```json
{
  "error": "Erro ao chamar Groq API: GROQ_API_KEY não configurada no arquivo .env"
}
```

**Solução:** Configure a variável `GROQ_API_KEY` no arquivo `.env`.

#### Erro 500 - Erro no Firestore

```json
{
  "error": "Erro ao inserir partida: Permission denied"
}
```

**Solução:** Verifique as credenciais do Firebase e as regras de segurança do Firestore.

## Limitações Atuais

### Funcionalidades Não Implementadas

As seguintes funcionalidades podem ser adicionadas em versões futuras:

- **GET /api/matches/:id** - Buscar partida específica por ID
- **PUT /api/matches/:id** - Atualizar dados de uma partida
- **Paginação** - Limitar número de resultados em GET /api/matches
- **Filtros** - Filtrar por data, time, resultado em GET /api/matches
- **Ordenação customizada** - Permitir ordenar por diferentes campos
- **Busca** - Buscar partidas por nome de time
- **Autenticação** - Proteger endpoints com autenticação
- **Rate Limiting** - Limitar número de requisições por IP

### Workarounds

**Para buscar partida específica:**
```javascript
// Buscar todas e filtrar no cliente
const matches = await fetch('/api/matches').then(r => r.json());
const match = matches.find(m => m.id === 'abc123');
```

**Para filtrar por data:**
```javascript
const matches = await fetch('/api/matches').then(r => r.json());
const filtered = matches.filter(m => m.match_date === '2024-01-15');
```

**Para buscar por time:**
```javascript
const matches = await fetch('/api/matches').then(r => r.json());
const filtered = matches.filter(m => 
  m.home_team.includes('Manchester') || m.away_team.includes('Manchester')
);
```

## Segurança

### Boas Práticas

> ⚠️ **Produção:** Em ambiente de produção, considere implementar:

1. **Rate Limiting:** Limitar requisições por IP para prevenir abuso
2. **CORS:** Configurar CORS adequadamente para permitir apenas origens confiáveis
3. **Validação de Entrada:** Validar tamanho e tipo de arquivo no upload
4. **Autenticação:** Proteger endpoints com autenticação (JWT, OAuth)
5. **HTTPS:** Sempre usar HTTPS em produção
6. **Sanitização:** Sanitizar dados antes de armazenar no banco

### Validações Implementadas

Atualmente, a API implementa as seguintes validações:

- ✅ Verificação de presença de arquivo no upload
- ✅ Verificação de ID válido na exclusão
- ✅ Tratamento de erros da API Groq
- ✅ Tratamento de erros do Firestore

## Performance

### Tempos de Resposta Esperados

| Endpoint | Tempo Médio | Observações |
|----------|-------------|-------------|
| POST /api/upload | 5-15 segundos | Depende da API Groq e complexidade da imagem |
| GET /api/matches | 100-500ms | Depende do número de partidas |
| DELETE /api/matches/:id | 100-300ms | Operação rápida no Firestore |

### Otimizações

Para melhorar a performance:

1. **Cache:** Implementar cache para GET /api/matches
2. **Paginação:** Limitar resultados retornados
3. **Índices:** Criar índices no Firestore para queries frequentes
4. **CDN:** Servir assets estáticos via CDN
5. **Compressão:** Habilitar compressão gzip/brotli

## Versionamento

Atualmente a API não possui versionamento. Em versões futuras, considere:

```
/api/v1/matches
/api/v2/matches
```

Isso permite manter compatibilidade com clientes antigos ao introduzir mudanças.

## Testando a API

### Usando o Navegador

Para testar GET /api/matches, simplesmente acesse:

```
http://localhost:3000/api/matches
```

### Usando cURL

```bash
# Listar partidas
curl http://localhost:3000/api/matches

# Upload de partida
curl -X POST http://localhost:3000/api/upload \
  -F "image=@screenshot.jpg" \
  -F "matchDate=2024-01-15"

# Excluir partida
curl -X DELETE http://localhost:3000/api/matches/abc123xyz789
```

### Usando Postman

1. **GET /api/matches:**
   - Method: GET
   - URL: `http://localhost:3000/api/matches`
   - Send

2. **POST /api/upload:**
   - Method: POST
   - URL: `http://localhost:3000/api/upload`
   - Body: form-data
   - Key: `image` (type: File)
   - Key: `matchDate` (type: Text, value: `2024-01-15`)
   - Send

3. **DELETE /api/matches/:id:**
   - Method: DELETE
   - URL: `http://localhost:3000/api/matches/abc123xyz789`
   - Send

### Usando JavaScript Fetch

Veja os exemplos de código em cada seção de endpoint acima.

## Referências

### Documentação Relacionada

- [Estrutura do Banco de Dados](../database/schema.md) - Schema completo do Firestore
- [Exemplos de API](examples.md) - Exemplos práticos de uso
- [Serviço de IA](../services/llm-service.md) - Como funciona a extração de dados
- [Guia de Desenvolvimento](../guides/development-setup.md) - Configurar ambiente
- [Troubleshooting](../guides/troubleshooting.md) - Resolver problemas comuns

### Links Externos

- [Express.js Documentation](https://expressjs.com/)
- [Firebase Firestore Documentation](https://firebase.google.com/docs/firestore)
- [Groq API Documentation](https://console.groq.com/docs)
- [Multer Documentation](https://github.com/expressjs/multer)

## Changelog

### Versão Atual (2024)

- ✅ POST /api/upload - Upload e processamento de partidas
- ✅ GET /api/matches - Listar todas as partidas
- ✅ DELETE /api/matches/:id - Excluir partida

### Futuras Melhorias

- [ ] GET /api/matches/:id - Buscar partida específica
- [ ] PUT /api/matches/:id - Atualizar partida
- [ ] Paginação em GET /api/matches
- [ ] Filtros e busca
- [ ] Autenticação e autorização
- [ ] Rate limiting
- [ ] Versionamento da API

---

## Suporte

Se você encontrar problemas ou tiver dúvidas sobre a API:

1. Consulte o [Guia de Troubleshooting](../guides/troubleshooting.md)
2. Verifique os logs do servidor para mensagens de erro detalhadas
3. Abra uma issue no repositório do projeto

---

**Documentação gerada para o projeto JHD Managers**
