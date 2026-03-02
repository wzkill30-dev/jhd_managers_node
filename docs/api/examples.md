# Exemplos de API

> Última atualização: 2024

## Visão Geral

Este documento fornece exemplos práticos de como usar a API REST do JHD Managers. Todos os exemplos incluem requisições completas e respostas esperadas, usando diferentes ferramentas e linguagens.

## Índice

- [POST /api/upload - Upload de Partida](#post-apiupload---upload-de-partida)
- [GET /api/matches - Listar Partidas](#get-apimatches---listar-partidas)
- [DELETE /api/matches/:id - Excluir Partida](#delete-apimatchesid---excluir-partida)
- [Tratamento de Erros](#tratamento-de-erros)

## POST /api/upload - Upload de Partida

### JavaScript (Fetch API)

**Exemplo Completo:**
```javascript
// Obter referências dos elementos
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
  
  const data = await response.json();
  
  if (data.success) {
    console.log('Partida adicionada com sucesso!');
    console.log('ID da partida:', data.matchId);
    console.log('Dados extraídos:', data.data);
  } else {
    console.error('Erro:', data.error);
  }
} catch (error) {
  console.error('Erro de rede:', error);
}
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Partida adicionada com sucesso!",
  "matchId": 42,
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
    "match_analysis": "O Manchester City dominou a partida com 62% de posse de bola e 542 passes completados, demonstrando seu estilo de jogo característico. A eficiência ofensiva foi superior, com 15 chutes e xG de 2.3, refletindo a qualidade das chances criadas. O Liverpool, apesar da menor posse, mostrou solidez defensiva com 15 interceptações e 8 bloqueios. A diferença no meio-campo foi decisiva, com o City vencendo mais duelos (28 vs 22) e mantendo maior precisão nos passes (89% vs 82%). A disciplina foi um ponto de atenção para ambos os times, com 24 faltas cometidas no total. O resultado justo reflete a superioridade técnica e tática do Manchester City nesta partida virtual do EA FC 26."
  }
}
```

### JavaScript (XMLHttpRequest)

```javascript
const fileInput = document.getElementById('imageInput');
const matchDateInput = document.getElementById('matchDate');

const formData = new FormData();
formData.append('image', fileInput.files[0]);
formData.append('matchDate', matchDateInput.value);

const xhr = new XMLHttpRequest();

xhr.onload = function() {
  if (xhr.status === 200) {
    const data = JSON.parse(xhr.responseText);
    console.log('Sucesso:', data);
  } else {
    console.error('Erro:', xhr.status);
  }
};

xhr.onerror = function() {
  console.error('Erro de rede');
};

xhr.open('POST', '/api/upload');
xhr.send(formData);
```

### cURL

```bash
curl -X POST http://localhost:3000/api/upload \
  -F "image=@/path/to/match-screenshot.jpg" \
  -F "matchDate=2024-01-15"
```

**Resposta:**
```json
{
  "success": true,
  "message": "Partida adicionada com sucesso!",
  "matchId": 42,
  "data": {
    "home_team": "Manchester City",
    "away_team": "Liverpool",
    "home_score": 2,
    "away_score": 1
  }
}
```

### Python (requests)

```python
import requests

# Preparar dados
files = {
    'image': open('match-screenshot.jpg', 'rb')
}
data = {
    'matchDate': '2024-01-15'
}

# Enviar requisição
response = requests.post(
    'http://localhost:3000/api/upload',
    files=files,
    data=data
)

# Processar resposta
if response.status_code == 200:
    result = response.json()
    if result['success']:
        print(f"Partida adicionada! ID: {result['matchId']}")
        print(f"Placar: {result['data']['home_team']} {result['data']['home_score']} x {result['data']['away_score']} {result['data']['away_team']}")
    else:
        print(f"Erro: {result['error']}")
else:
    print(f"Erro HTTP: {response.status_code}")
```

### Node.js (axios)

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function uploadMatch() {
  const formData = new FormData();
  formData.append('image', fs.createReadStream('match-screenshot.jpg'));
  formData.append('matchDate', '2024-01-15');
  
  try {
    const response = await axios.post('http://localhost:3000/api/upload', formData, {
      headers: formData.getHeaders()
    });
    
    console.log('Sucesso:', response.data);
    console.log('ID da partida:', response.data.matchId);
  } catch (error) {
    console.error('Erro:', error.response?.data || error.message);
  }
}

uploadMatch();
```

### Postman

**Configuração:**
1. Método: `POST`
2. URL: `http://localhost:3000/api/upload`
3. Body: `form-data`
4. Adicionar campos:
   - `image` (tipo: File) - Selecionar arquivo de imagem
   - `matchDate` (tipo: Text) - Valor: `2024-01-15`
5. Clicar em "Send"

## GET /api/matches - Listar Partidas

### JavaScript (Fetch API)

```javascript
async function loadMatches() {
  try {
    const response = await fetch('/api/matches');
    const matches = await response.json();
    
    console.log(`Total de partidas: ${matches.length}`);
    
    matches.forEach(match => {
      console.log(`#${match.match_id}: ${match.home_team} ${match.home_score} x ${match.away_score} ${match.away_team}`);
    });
    
    return matches;
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
  }
}

loadMatches();
```

**Resposta de Sucesso (200):**
```json
[
  {
    "id": "abc123def456",
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
    "match_analysis": "Análise tática detalhada...",
    "raw_data": "{\"home_team\":\"Manchester City\",\"away_team\":\"Liverpool\",...}"
  },
  {
    "id": "xyz789ghi012",
    "match_id": 41,
    "match_date": "2024-01-14",
    "upload_date": "2024-01-14T20:15:00.000Z",
    "home_team": "Real Madrid",
    "away_team": "Barcelona",
    "home_score": 3,
    "away_score": 2,
    "home_shots": 18,
    "away_shots": 12
  }
]
```

**Resposta Vazia (200):**
```json
[]
```

### cURL

```bash
curl http://localhost:3000/api/matches
```

### Python (requests)

```python
import requests

response = requests.get('http://localhost:3000/api/matches')

if response.status_code == 200:
    matches = response.json()
    print(f"Total de partidas: {len(matches)}")
    
    for match in matches:
        print(f"#{match['match_id']}: {match['home_team']} {match['home_score']} x {match['away_score']} {match['away_team']}")
else:
    print(f"Erro HTTP: {response.status_code}")
```

### Node.js (axios)

```javascript
const axios = require('axios');

async function getMatches() {
  try {
    const response = await axios.get('http://localhost:3000/api/matches');
    const matches = response.data;
    
    console.log(`Total de partidas: ${matches.length}`);
    
    matches.forEach(match => {
      console.log(`#${match.match_id}: ${match.home_team} ${match.home_score} x ${match.away_score} ${match.away_team}`);
    });
    
    return matches;
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

getMatches();
```

### Postman

**Configuração:**
1. Método: `GET`
2. URL: `http://localhost:3000/api/matches`
3. Clicar em "Send"

## DELETE /api/matches/:id - Excluir Partida

### JavaScript (Fetch API)

```javascript
async function deleteMatch(matchId) {
  // Confirmação do usuário
  if (!confirm('Tem certeza que deseja excluir esta partida?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/matches/${matchId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('Partida excluída com sucesso!');
      // Recarregar lista de partidas
      loadMatches();
    } else {
      console.error('Erro:', data.error);
    }
  } catch (error) {
    console.error('Erro de rede:', error);
  }
}

// Exemplo de uso
deleteMatch('abc123def456');
```

**Resposta de Sucesso (200):**
```json
{
  "success": true,
  "message": "Partida excluída com sucesso"
}
```

### cURL

```bash
curl -X DELETE http://localhost:3000/api/matches/abc123def456
```

### Python (requests)

```python
import requests

match_id = 'abc123def456'

response = requests.delete(f'http://localhost:3000/api/matches/{match_id}')

if response.status_code == 200:
    result = response.json()
    if result['success']:
        print('Partida excluída com sucesso!')
    else:
        print(f"Erro: {result['error']}")
else:
    print(f"Erro HTTP: {response.status_code}")
```

### Node.js (axios)

```javascript
const axios = require('axios');

async function deleteMatch(matchId) {
  try {
    const response = await axios.delete(`http://localhost:3000/api/matches/${matchId}`);
    
    if (response.data.success) {
      console.log('Partida excluída com sucesso!');
    } else {
      console.error('Erro:', response.data.error);
    }
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

deleteMatch('abc123def456');
```

### Postman

**Configuração:**
1. Método: `DELETE`
2. URL: `http://localhost:3000/api/matches/abc123def456`
3. Clicar em "Send"

## Tratamento de Erros

### Erro 400 - Bad Request

**Cenário:** Parâmetros inválidos ou ausentes

**Exemplo - Upload sem imagem:**
```javascript
const formData = new FormData();
formData.append('matchDate', '2024-01-15');
// Faltando o campo 'image'

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Resposta:**
```json
{
  "success": false,
  "error": "Imagem e data da partida são obrigatórios"
}
```

### Erro 404 - Not Found

**Cenário:** Partida não encontrada

**Exemplo:**
```javascript
const response = await fetch('/api/matches/id-inexistente', {
  method: 'DELETE'
});

const data = await response.json();
```

**Resposta:**
```json
{
  "success": false,
  "error": "Partida não encontrada"
}
```

### Erro 500 - Internal Server Error

**Cenário:** Erro no servidor (API Groq, Firebase, etc.)

**Exemplo:**
```javascript
// Upload com imagem corrompida ou erro na API Groq
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});

const data = await response.json();
```

**Resposta:**
```json
{
  "success": false,
  "error": "Erro ao processar imagem: API Groq indisponível"
}
```

### Tratamento Completo de Erros

**JavaScript:**
```javascript
async function uploadMatchWithErrorHandling(file, matchDate) {
  try {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('matchDate', matchDate);
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    // Verificar status HTTP
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Verificar resposta da API
    if (!data.success) {
      throw new Error(data.error);
    }
    
    // Sucesso
    console.log('Partida adicionada:', data.matchId);
    return data;
    
  } catch (error) {
    // Tratamento de erros
    if (error.message.includes('Failed to fetch')) {
      console.error('Erro de rede: Verifique sua conexão');
    } else if (error.message.includes('HTTP 400')) {
      console.error('Erro de validação: Verifique os dados enviados');
    } else if (error.message.includes('HTTP 500')) {
      console.error('Erro no servidor: Tente novamente mais tarde');
    } else {
      console.error('Erro:', error.message);
    }
    
    throw error;
  }
}
```

**Python:**
```python
import requests

def upload_match_with_error_handling(image_path, match_date):
    try:
        files = {'image': open(image_path, 'rb')}
        data = {'matchDate': match_date}
        
        response = requests.post(
            'http://localhost:3000/api/upload',
            files=files,
            data=data,
            timeout=30
        )
        
        # Verificar status HTTP
        response.raise_for_status()
        
        result = response.json()
        
        # Verificar resposta da API
        if not result['success']:
            raise Exception(result['error'])
        
        print(f"Partida adicionada: {result['matchId']}")
        return result
        
    except requests.exceptions.Timeout:
        print("Erro: Timeout - Servidor demorou muito para responder")
    except requests.exceptions.ConnectionError:
        print("Erro: Não foi possível conectar ao servidor")
    except requests.exceptions.HTTPError as e:
        print(f"Erro HTTP: {e.response.status_code}")
    except Exception as e:
        print(f"Erro: {str(e)}")
```

## Exemplos de Integração Completa

### Aplicação Web Simples

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>JHD Managers - Exemplo</title>
</head>
<body>
  <h1>Upload de Partida</h1>
  
  <form id="uploadForm">
    <input type="file" id="imageInput" accept="image/*" required>
    <input type="date" id="matchDate" required>
    <button type="submit">Enviar</button>
  </form>
  
  <div id="result"></div>
  
  <h2>Partidas</h2>
  <div id="matchesList"></div>
  
  <script>
    // Upload
    document.getElementById('uploadForm').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append('image', document.getElementById('imageInput').files[0]);
      formData.append('matchDate', document.getElementById('matchDate').value);
      
      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          document.getElementById('result').innerHTML = `
            <p>✅ Partida adicionada! ID: ${data.matchId}</p>
            <p>${data.data.home_team} ${data.data.home_score} x ${data.data.away_score} ${data.data.away_team}</p>
          `;
          loadMatches();
        } else {
          document.getElementById('result').innerHTML = `<p>❌ Erro: ${data.error}</p>`;
        }
      } catch (error) {
        document.getElementById('result').innerHTML = `<p>❌ Erro: ${error.message}</p>`;
      }
    });
    
    // Listar partidas
    async function loadMatches() {
      try {
        const response = await fetch('/api/matches');
        const matches = await response.json();
        
        const html = matches.map(match => `
          <div>
            <strong>#${match.match_id}</strong>: 
            ${match.home_team} ${match.home_score} x ${match.away_score} ${match.away_team}
            <button onclick="deleteMatch('${match.id}')">Excluir</button>
          </div>
        `).join('');
        
        document.getElementById('matchesList').innerHTML = html;
      } catch (error) {
        console.error('Erro ao carregar partidas:', error);
      }
    }
    
    // Excluir partida
    async function deleteMatch(id) {
      if (!confirm('Excluir partida?')) return;
      
      try {
        const response = await fetch(`/api/matches/${id}`, {
          method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
          loadMatches();
        } else {
          alert('Erro: ' + data.error);
        }
      } catch (error) {
        alert('Erro: ' + error.message);
      }
    }
    
    // Carregar partidas ao iniciar
    loadMatches();
  </script>
</body>
</html>
```

### Script Node.js Completo

```javascript
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const API_URL = 'http://localhost:3000';

// Upload de partida
async function uploadMatch(imagePath, matchDate) {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(imagePath));
  formData.append('matchDate', matchDate);
  
  try {
    const response = await axios.post(`${API_URL}/api/upload`, formData, {
      headers: formData.getHeaders()
    });
    
    console.log('✅ Partida adicionada!');
    console.log(`ID: ${response.data.matchId}`);
    console.log(`Placar: ${response.data.data.home_team} ${response.data.data.home_score} x ${response.data.data.away_score} ${response.data.data.away_team}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao fazer upload:', error.response?.data || error.message);
    throw error;
  }
}

// Listar partidas
async function listMatches() {
  try {
    const response = await axios.get(`${API_URL}/api/matches`);
    const matches = response.data;
    
    console.log(`\n📊 Total de partidas: ${matches.length}\n`);
    
    matches.forEach(match => {
      console.log(`#${match.match_id}: ${match.home_team} ${match.home_score} x ${match.away_score} ${match.away_team}`);
      console.log(`   Data: ${match.match_date}`);
      console.log(`   Chutes: ${match.home_shots} x ${match.away_shots}`);
      console.log('');
    });
    
    return matches;
  } catch (error) {
    console.error('❌ Erro ao listar partidas:', error.message);
    throw error;
  }
}

// Excluir partida
async function deleteMatch(matchId) {
  try {
    const response = await axios.delete(`${API_URL}/api/matches/${matchId}`);
    
    if (response.data.success) {
      console.log('✅ Partida excluída com sucesso!');
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Erro ao excluir partida:', error.response?.data || error.message);
    throw error;
  }
}

// Exemplo de uso
async function main() {
  try {
    // Upload de partida
    const uploadResult = await uploadMatch('match-screenshot.jpg', '2024-01-15');
    
    // Listar todas as partidas
    await listMatches();
    
    // Excluir partida (opcional)
    // await deleteMatch(uploadResult.data.firestoreId);
    
  } catch (error) {
    console.error('Erro na execução:', error.message);
  }
}

main();
```

## Dicas e Boas Práticas

### 1. Validação de Dados

**Antes de enviar:**
```javascript
function validateUpload(file, matchDate) {
  // Validar arquivo
  if (!file) {
    throw new Error('Nenhum arquivo selecionado');
  }
  
  // Validar tipo
  const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Tipo de arquivo inválido. Use JPEG ou PNG.');
  }
  
  // Validar tamanho (ex: máximo 10MB)
  const maxSize = 10 * 1024 * 1024;
  if (file.size > maxSize) {
    throw new Error('Arquivo muito grande. Máximo: 10MB');
  }
  
  // Validar data
  if (!matchDate) {
    throw new Error('Data da partida é obrigatória');
  }
  
  const date = new Date(matchDate);
  if (isNaN(date.getTime())) {
    throw new Error('Data inválida');
  }
  
  return true;
}
```

### 2. Timeout e Retry

**Configurar timeout:**
```javascript
const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
  signal: AbortSignal.timeout(30000) // 30 segundos
});
```

**Implementar retry:**
```javascript
async function uploadWithRetry(formData, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      console.log(`Tentativa ${i + 1} falhou, tentando novamente...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. Feedback de Progresso

**Indicador de carregamento:**
```javascript
async function uploadWithProgress(formData) {
  const resultDiv = document.getElementById('result');
  
  // Mostrar loading
  resultDiv.innerHTML = '⏳ Analisando imagem...';
  resultDiv.className = 'loading';
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    // Mostrar sucesso
    resultDiv.innerHTML = '✅ Partida adicionada com sucesso!';
    resultDiv.className = 'success';
    
    return data;
  } catch (error) {
    // Mostrar erro
    resultDiv.innerHTML = `❌ Erro: ${error.message}`;
    resultDiv.className = 'error';
    throw error;
  }
}
```

### 4. Cache de Dados

**Implementar cache simples:**
```javascript
let matchesCache = null;
let cacheTime = null;
const CACHE_DURATION = 60000; // 1 minuto

async function getMatchesWithCache() {
  const now = Date.now();
  
  // Usar cache se válido
  if (matchesCache && cacheTime && (now - cacheTime < CACHE_DURATION)) {
    console.log('Usando cache');
    return matchesCache;
  }
  
  // Buscar novos dados
  const response = await fetch('/api/matches');
  matchesCache = await response.json();
  cacheTime = now;
  
  return matchesCache;
}
```

## Referências

- [Documentação de Endpoints](endpoints.md)
- [Fluxo de Dados](../architecture/data-flow.md)
- [Guia de Desenvolvimento](../guides/development-setup.md)
- [Troubleshooting](../guides/troubleshooting.md)

## Próximos Passos

- Testar exemplos em seu ambiente
- Implementar tratamento de erros robusto
- Adicionar validações de entrada
- Implementar feedback visual adequado
