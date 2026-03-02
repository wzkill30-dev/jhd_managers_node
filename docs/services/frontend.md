# Documentação do Frontend

> Última atualização: 2024

## Visão Geral

O frontend do JHD Managers é uma aplicação web responsiva construída com HTML5, CSS3 e JavaScript Vanilla (sem frameworks). A interface permite aos usuários fazer upload de imagens de partidas, visualizar histórico completo e acessar análises detalhadas geradas por IA.

### Características Principais

- **Interface Responsiva**: Adaptável para desktop e mobile
- **Navegação Intuitiva**: Menu hamburger para dispositivos móveis
- **Preview de Imagens**: Visualização antes do upload
- **Modal de Detalhes**: Exibição completa de estatísticas
- **Renderização Dinâmica**: Dados carregados via API REST
- **Feedback Visual**: Indicadores de carregamento e sucesso/erro

## Estrutura de Páginas

### 1. index.html - Página Principal

**Propósito:** Exibir histórico de partidas e dashboard de estatísticas.

**Componentes:**
- **Header**: Logo, título e navegação
- **Hamburger Menu**: Menu responsivo para mobile
- **Matches List**: Grid de cards de partidas
- **Modal**: Detalhes completos da partida selecionada

**Funcionalidades:**
- Listagem de todas as partidas ordenadas por data
- Cards visuais com placar e estatísticas resumidas
- Modal com estatísticas detalhadas (~30 campos)
- Botão de exclusão de partidas
- Estado vazio quando não há partidas

**Scripts Utilizados:**
- `matches.js` - Lógica de listagem e modal
- `nav.js` - Navegação responsiva

### 2. add_partida.html - Upload de Partidas

**Propósito:** Permitir upload de imagens de resumo de partidas.

**Componentes:**
- **Header**: Logo, título e navegação
- **Upload Form**: Formulário com data e seleção de arquivo
- **Preview Area**: Visualização da imagem selecionada
- **Result Area**: Exibição dos dados extraídos

**Funcionalidades:**
- Seleção de arquivo de imagem (JPEG/PNG)
- Input de data da partida (padrão: data atual)
- Preview da imagem antes do upload
- Feedback de progresso durante processamento
- Exibição dos dados extraídos pela IA
- Indicador de sucesso/erro

**Scripts Utilizados:**
- `app.js` - Lógica de upload e preview
- `nav.js` - Navegação responsiva

## Scripts JavaScript

### 1. app.js - Upload e Preview

**Responsabilidades:**
- Gerenciar upload de imagens
- Exibir preview da imagem selecionada
- Enviar dados para API via FormData
- Processar e exibir resposta da API
- Tratamento de erros

**Funções Principais:**

#### Inicialização da Data
```javascript
// Define data atual como padrão (timezone local)
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
matchDateInput.value = `${year}-${month}-${day}`;
```

#### Event Listener - Seleção de Arquivo
```javascript
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    
    // Gera preview usando FileReader
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
});
```

#### Event Listener - Submit do Formulário
```javascript
uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = imageInput.files[0];
  const matchDate = matchDateInput.value;
  
  if (!file) return;
  
  // Cria FormData para envio multipart
  const formData = new FormData();
  formData.append('image', file);
  formData.append('matchDate', matchDate);
  
  // Exibe indicador de carregamento
  result.className = 'loading show';
  result.innerHTML = '⏳ Analisando imagem...';
  
  try {
    // Envia para API
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Renderiza dados extraídos
      renderExtractedData(data);
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    // Exibe erro
    result.className = 'show';
    result.innerHTML = `<p style="color: red;">❌ Erro: ${error.message}</p>`;
  }
});
```

**Fluxo de Upload:**
1. Usuário seleciona imagem → Preview exibido
2. Usuário preenche data (ou usa padrão)
3. Submit do formulário
4. FormData criado com imagem e data
5. Requisição POST para `/api/upload`
6. Indicador de carregamento exibido
7. Resposta processada e dados renderizados
8. Feedback visual de sucesso ou erro

### 2. matches.js - Listagem e Modal

**Responsabilidades:**
- Carregar partidas da API
- Renderizar cards de partidas
- Gerenciar modal de detalhes
- Excluir partidas
- Tratamento de timezone

**Funções Principais:**

#### loadMatches()
```javascript
async function loadMatches() {
  const matchesList = document.getElementById('matchesList');
  
  try {
    // Busca partidas da API
    const response = await fetch('/api/matches');
    const matches = await response.json();
    
    // Estado vazio
    if (matches.length === 0) {
      matchesList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚽</div>
          <div class="empty-state-text">Nenhuma partida registrada ainda</div>
          <a href="add_partida.html" class="btn-primary">Adicionar Primeira Partida</a>
        </div>
      `;
      return;
    }
    
    // Renderiza grid de partidas
    const matchesGrid = document.createElement('div');
    matchesGrid.className = 'matches-grid';
    
    matches.forEach(match => {
      const card = createMatchCard(match);
      matchesGrid.appendChild(card);
    });
    
    matchesList.appendChild(matchesGrid);
    
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
    // Exibe estado de erro
  }
}
```

**Características:**
- Busca assíncrona de partidas
- Estado vazio com CTA para adicionar partida
- Renderização dinâmica de cards
- Tratamento de erros com feedback visual

#### showMatchDetails(match)
```javascript
function showMatchDetails(match) {
  currentMatchId = match.id;
  const modal = document.getElementById('matchModal');
  const modalBody = document.getElementById('modalBody');
  const rawData = JSON.parse(match.raw_data);
  
  // Renderiza todas as estatísticas
  let html = `
    <div class="detail-section">
      <h3>📊 Informações da Partida</h3>
      <!-- Dados básicos -->
    </div>
    
    <div class="detail-section">
      <h3>⚽ Placar Final</h3>
      <!-- Placar -->
    </div>
    
    <div class="detail-section">
      <h3>📈 Estatísticas Gerais</h3>
      <!-- ~30 estatísticas -->
    </div>
    
    <div class="detail-section">
      <h3>📝 Análise da Partida</h3>
      <!-- Análise gerada por IA -->
    </div>
  `;
  
  modalBody.innerHTML = html;
  modal.classList.add('show');
}
```

**Características:**
- Exibe todas as ~30 estatísticas extraídas
- Organização em seções temáticas
- Análise tática gerada por IA
- Verificação de campos null/undefined

#### deleteMatch()
```javascript
async function deleteMatch() {
  if (!currentMatchId) return;
  
  // Confirmação do usuário
  if (!confirm('Tem certeza que deseja excluir esta partida?')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/matches/${currentMatchId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeModal();
      // Recarrega lista
      loadMatches();
    } else {
      alert('Erro ao excluir partida: ' + data.error);
    }
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    alert('Erro ao excluir partida: ' + error.message);
  }
}
```

**Características:**
- Confirmação antes de excluir
- Requisição DELETE para API
- Atualização automática da lista
- Feedback de erro

#### closeModal()
```javascript
function closeModal() {
  const modal = document.getElementById('matchModal');
  modal.classList.remove('show');
  currentMatchId = null;
}
```

**Formas de Fechar o Modal:**
- Botão X no header
- Clique fora do modal (overlay)
- Tecla ESC
- Após exclusão bem-sucedida

**Tratamento de Timezone:**
```javascript
// Corrige problema de timezone - trata data como local
const dateParts = match.match_date.split('T')[0].split('-');
const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

const formattedDate = date.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
```

### 3. nav.js - Navegação Responsiva

**Responsabilidades:**
- Gerenciar menu hamburger
- Toggle do menu mobile
- Fechar menu ao clicar em link
- Controlar overlay

**Funções Principais:**

#### toggleMenu()
```javascript
function toggleMenu() {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('active');
  navOverlay.classList.toggle('active');
  document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
}
```

**Características:**
- Toggle de classes CSS para animação
- Previne scroll do body quando menu aberto
- Overlay escurece o fundo

#### closeMenu()
```javascript
function closeMenu() {
  hamburger.classList.remove('active');
  navLinks.classList.remove('active');
  navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}
```

**Event Listeners:**
```javascript
// Abre/fecha menu ao clicar no hamburger
hamburger.addEventListener('click', toggleMenu);

// Fecha menu ao clicar no overlay
navOverlay.addEventListener('click', closeMenu);

// Fecha menu ao clicar em qualquer link
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', closeMenu);
});
```

## Sistema de Modal

### Estrutura HTML
```html
<div id="matchModal" class="modal">
  <div class="modal-content">
    <div class="modal-header">
      <h2 class="modal-title">Detalhes da Partida</h2>
      <div class="modal-actions">
        <button class="btn-delete" onclick="deleteMatch()">🗑️ Excluir</button>
        <button class="close-btn" onclick="closeModal()">&times;</button>
      </div>
    </div>
    <div class="modal-body" id="modalBody">
      <!-- Conteúdo dinâmico -->
    </div>
  </div>
</div>
```

### Funcionalidades

**Abertura:**
- Clique em qualquer card de partida
- Classe `show` adicionada ao modal
- Conteúdo renderizado dinamicamente

**Fechamento:**
- Botão X no header
- Clique no overlay (fora do modal)
- Tecla ESC
- Após exclusão bem-sucedida

**Conteúdo Dinâmico:**
- Informações básicas (data, ID, times, placar)
- Estatísticas gerais (chutes, posse, passes, etc.)
- Duelos e defesa (interceptações, bloqueios, etc.)
- Disciplina (faltas, cartões, impedimentos, etc.)
- Análise tática gerada por IA

### Seções do Modal

1. **📊 Informações da Partida**
   - Data da partida
   - ID da partida

2. **⚽ Placar Final**
   - Times e placar

3. **📈 Estatísticas Gerais**
   - Chutes a gol
   - Posse de bola
   - Precisão de chutes
   - Precisão de passes
   - Taxa de dribles
   - Gols esperados (xG)
   - Total de passes
   - Tempo de recuperação de bola

4. **⚔️ Duelos e Defesa**
   - Duelos ganhos/perdidos
   - Interceptações
   - Bloqueios

5. **⚠️ Disciplina e Infrações**
   - Faltas cometidas/sofridas
   - Cartões amarelos
   - Impedimentos
   - Escanteios
   - Pênaltis

6. **📝 Análise da Partida**
   - Texto gerado por IA (150-200 palavras)

## Sistema de Preview de Imagens

### Implementação

**HTML:**
```html
<input type="file" id="imageInput" accept="image/*" required>
<div id="preview"></div>
```

**JavaScript:**
```javascript
imageInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) {
    fileName.textContent = file.name;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
    };
    reader.readAsDataURL(file);
  }
});
```

### Funcionamento

1. **Seleção de Arquivo**: Usuário clica no input e seleciona imagem
2. **FileReader**: API nativa do navegador lê o arquivo
3. **Data URL**: Arquivo convertido para base64 data URL
4. **Renderização**: Imagem exibida no elemento preview
5. **Feedback**: Nome do arquivo exibido

### Validações

- **Tipo de Arquivo**: `accept="image/*"` limita a imagens
- **Obrigatoriedade**: `required` garante seleção
- **Tamanho**: Validado no backend (limite de upload)

## Renderização Dinâmica de Dados

### Padrão de Renderização

**1. Buscar Dados da API:**
```javascript
const response = await fetch('/api/matches');
const matches = await response.json();
```

**2. Criar Elementos DOM:**
```javascript
const card = document.createElement('div');
card.className = 'match-card';
```

**3. Preencher com Template Literal:**
```javascript
card.innerHTML = `
  <div class="match-header">
    <div class="match-date">📅 ${formattedDate}</div>
  </div>
  <div class="match-score">
    <!-- Placar -->
  </div>
`;
```

**4. Adicionar ao DOM:**
```javascript
matchesGrid.appendChild(card);
```

### Tratamento de Dados Null/Undefined

**Verificação Condicional:**
```javascript
${match.home_shots !== null ? `
  <div class="stat">
    <div class="stat-label">Chutes</div>
    <div class="stat-value">${match.home_shots} × ${match.away_shots}</div>
  </div>
` : ''}
```

**Valores Padrão:**
```javascript
<div class="team-name">${match.home_team || 'Time Casa'}</div>
<div class="score">${match.home_score || 0}</div>
```

### Formatação de Dados

**Datas:**
```javascript
const formattedDate = date.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});
```

**Timestamps:**
```javascript
const formattedUploadDate = uploadDate.toLocaleDateString('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
});
```

**JSON Parsing:**
```javascript
const rawData = JSON.parse(match.raw_data);
```

## Funcionalidades por Página

### index.html - Página Principal

| Funcionalidade | Descrição |
|----------------|-----------|
| Listagem de Partidas | Exibe todas as partidas em grid de cards |
| Ordenação | Partidas ordenadas por data (mais recente primeiro) |
| Cards Visuais | Cada card mostra placar e estatísticas resumidas |
| Modal de Detalhes | Clique no card abre modal com todas as estatísticas |
| Exclusão de Partidas | Botão de excluir no modal com confirmação |
| Estado Vazio | Mensagem e CTA quando não há partidas |
| Estado de Erro | Feedback visual em caso de erro na API |
| Navegação Responsiva | Menu hamburger para mobile |

### add_partida.html - Upload de Partidas

| Funcionalidade | Descrição |
|----------------|-----------|
| Seleção de Arquivo | Input para escolher imagem (JPEG/PNG) |
| Input de Data | Campo de data com valor padrão (hoje) |
| Preview de Imagem | Visualização da imagem antes do upload |
| Nome do Arquivo | Exibição do nome do arquivo selecionado |
| Indicador de Progresso | "⏳ Analisando imagem..." durante processamento |
| Exibição de Resultados | Dados extraídos renderizados após sucesso |
| Feedback de Erro | Mensagem de erro em caso de falha |
| Navegação Responsiva | Menu hamburger para mobile |

## Estilos CSS

### Organização

O arquivo `style.css` contém todos os estilos da aplicação, organizados em seções:

1. **Reset e Variáveis**: Reset CSS e variáveis de cores
2. **Layout Global**: Body, container, header
3. **Navegação**: Menu, hamburger, overlay
4. **Cards**: Estilos dos cards de partidas
5. **Modal**: Estilos do modal de detalhes
6. **Formulários**: Inputs, botões, upload
7. **Estados**: Loading, empty state, error
8. **Responsividade**: Media queries para mobile

### Variáveis de Cores

```css
:root {
  --primary-color: #F5C842;
  --background-dark: #0A0A0A;
  --card-background: #1a1a1a;
  --text-primary: #FFFFFF;
  --text-secondary: #CCCCCC;
  --border-color: #333333;
  --success-color: #4CAF50;
  --error-color: #f44336;
}
```

### Responsividade

**Breakpoints:**
- Desktop: > 768px
- Mobile: ≤ 768px

**Adaptações Mobile:**
- Menu hamburger visível
- Grid de cards em coluna única
- Modal ocupa tela inteira
- Fontes e espaçamentos ajustados

## Acessibilidade

### Práticas Implementadas

1. **Atributos ARIA:**
```html
<button class="hamburger" id="hamburger" aria-label="Menu">
```

2. **Semântica HTML:**
- Tags semânticas (`<header>`, `<nav>`, `<main>`)
- Hierarquia de headings correta

3. **Navegação por Teclado:**
- Tecla ESC fecha modal
- Todos os elementos interativos são focáveis

4. **Contraste de Cores:**
- Texto branco (#FFFFFF) em fundo escuro (#0A0A0A)
- Amarelo (#F5C842) para destaques

5. **Alt Text:**
```html
<img src="logo.png" alt="JHD Managers" class="logo">
```

### Melhorias Futuras

- [ ] Adicionar `role` e `aria-expanded` no menu
- [ ] Implementar `aria-live` para feedback de ações
- [ ] Adicionar `aria-describedby` em formulários
- [ ] Testar com leitores de tela

## Fluxo de Interação do Usuário

### Fluxo de Upload

```
1. Usuário acessa add_partida.html
2. Clica em "Escolher imagem"
3. Seleciona arquivo do sistema
4. Preview da imagem é exibido
5. Usuário preenche data (ou mantém padrão)
6. Clica em "Enviar"
7. Indicador de carregamento aparece
8. Aguarda processamento da IA
9. Dados extraídos são exibidos
10. Usuário pode voltar para página principal
```

### Fluxo de Visualização

```
1. Usuário acessa index.html
2. Partidas são carregadas automaticamente
3. Grid de cards é renderizado
4. Usuário clica em um card
5. Modal abre com detalhes completos
6. Usuário visualiza estatísticas e análise
7. Usuário pode excluir partida (com confirmação)
8. Usuário fecha modal (X, ESC ou overlay)
```

### Fluxo de Exclusão

```
1. Usuário abre modal de detalhes
2. Clica em botão "🗑️ Excluir"
3. Confirmação é solicitada
4. Usuário confirma exclusão
5. Requisição DELETE enviada para API
6. Modal é fechado
7. Lista de partidas é recarregada
8. Card da partida excluída desaparece
```

## Integração com Backend

### Endpoints Utilizados

**1. POST /api/upload**
```javascript
const formData = new FormData();
formData.append('image', file);
formData.append('matchDate', matchDate);

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData
});
```

**2. GET /api/matches**
```javascript
const response = await fetch('/api/matches');
const matches = await response.json();
```

**3. DELETE /api/matches/:id**
```javascript
const response = await fetch(`/api/matches/${currentMatchId}`, {
  method: 'DELETE'
});
```

### Formato de Resposta

**Sucesso:**
```json
{
  "success": true,
  "message": "Partida adicionada com sucesso!",
  "data": {
    "firestoreId": "abc123",
    "matchId": 42,
    "home_team": "Manchester City",
    "away_team": "Liverpool",
    "home_score": 2,
    "away_score": 1,
    "match_analysis": "Análise tática..."
  }
}
```

**Erro:**
```json
{
  "success": false,
  "error": "Mensagem de erro"
}
```

## Tratamento de Erros

### Tipos de Erro

**1. Erro de Rede:**
```javascript
try {
  const response = await fetch('/api/matches');
} catch (error) {
  console.error('Erro de rede:', error);
  // Exibe mensagem de erro
}
```

**2. Erro da API:**
```javascript
const data = await response.json();
if (!data.success) {
  throw new Error(data.error);
}
```

**3. Erro de Validação:**
```html
<input type="file" id="imageInput" accept="image/*" required>
<input type="date" id="matchDate" name="matchDate" required>
```

### Feedback Visual

**Loading:**
```javascript
result.className = 'loading show';
result.innerHTML = '⏳ Analisando imagem...';
```

**Sucesso:**
```javascript
result.className = 'show';
result.innerHTML = '<h3>✅ Dados Extraídos da Imagem</h3>';
```

**Erro:**
```javascript
result.className = 'show';
result.innerHTML = `<p style="color: red;">❌ Erro: ${error.message}</p>`;
```

## Performance

### Otimizações Implementadas

1. **Carregamento Assíncrono:**
   - Fetch API com async/await
   - Não bloqueia a UI durante requisições

2. **Renderização Eficiente:**
   - Template literals para HTML
   - Manipulação direta do DOM

3. **Event Delegation:**
   - Event listeners em elementos pai quando possível

4. **Lazy Loading:**
   - Partidas carregadas apenas quando necessário
   - Modal renderizado sob demanda

### Melhorias Futuras

- [ ] Implementar paginação para muitas partidas
- [ ] Cache de partidas no localStorage
- [ ] Lazy loading de imagens
- [ ] Service Worker para offline support
- [ ] Compressão de imagens antes do upload

## Debugging

### Console Logs

**Upload:**
```javascript
console.log('Resposta do servidor:', data);
```

**Listagem:**
```javascript
console.error('Erro ao carregar partidas:', error);
```

**Exclusão:**
```javascript
console.error('Erro ao excluir partida:', error);
```

### DevTools

**Network Tab:**
- Verificar requisições para `/api/upload`, `/api/matches`
- Inspecionar payloads e respostas
- Verificar status codes

**Console Tab:**
- Ver logs de erro
- Testar funções manualmente

**Elements Tab:**
- Inspecionar estrutura do DOM
- Verificar classes CSS aplicadas
- Testar responsividade

## Referências

- [Guia de Configuração do Ambiente](../guides/development-setup.md)
- [Documentação de API](../api/endpoints.md)
- [Exemplos de API](../api/examples.md)
- [Fluxo de Dados](../architecture/data-flow.md)

## Próximos Passos

- Implementar testes automatizados do frontend
- Adicionar mais validações de entrada
- Melhorar acessibilidade
- Implementar PWA features
- Adicionar animações e transições
