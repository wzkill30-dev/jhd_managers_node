# Exemplos de Queries do Firestore

> Última atualização: 2024

## Visão Geral

Este documento fornece exemplos práticos de queries para o Firebase Firestore no JHD Managers, incluindo listagem, filtros, ordenação, agregações e transações.

## Índice

- [Queries Básicas](#queries-básicas)
- [Filtros e Ordenação](#filtros-e-ordenação)
- [Transações](#transações)
- [Agregações e Estatísticas](#agregações-e-estatísticas)
- [Queries Avançadas](#queries-avançadas)
- [Otimização de Performance](#otimização-de-performance)

## Queries Básicas

### Listar Todas as Partidas

```javascript
// database.js
async function getAllMatches() {
  const snapshot = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .get();
  
  const matches = [];
  snapshot.forEach(doc => {
    matches.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return matches;
}
```

### Obter Partida por ID

```javascript
async function getMatchById(matchId) {
  const doc = await db.collection('matches').doc(matchId).get();
  
  if (!doc.exists) {
    return null;
  }
  
  return {
    id: doc.id,
    ...doc.data()
  };
}
```

### Adicionar Nova Partida

```javascript
async function insertMatch(matchData, matchDate) {
  // Obter próximo ID
  const matchId = await getNextMatchId();
  
  // Criar documento
  const matchDoc = {
    match_id: matchId,
    match_date: matchDate,
    upload_date: admin.firestore.FieldValue.serverTimestamp(),
    ...matchData
  };
  
  // Adicionar ao Firestore
  const docRef = await db.collection('matches').add(matchDoc);
  
  return {
    firestoreId: docRef.id,
    matchId: matchId
  };
}
```

### Excluir Partida

```javascript
async function deleteMatch(matchId) {
  await db.collection('matches').doc(matchId).delete();
  return true;
}
```

## Filtros e Ordenação

### Filtrar por Data

```javascript
// Partidas de uma data específica
async function getMatchesByDate(date) {
  const snapshot = await db.collection('matches')
    .where('match_date', '==', date)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Partidas em um intervalo de datas
async function getMatchesByDateRange(startDate, endDate) {
  const snapshot = await db.collection('matches')
    .where('match_date', '>=', startDate)
    .where('match_date', '<=', endDate)
    .orderBy('match_date', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Filtrar por Time

```javascript
// Partidas de um time específico (casa ou visitante)
async function getMatchesByTeam(teamName) {
  // Firestore não suporta OR nativo, então fazemos 2 queries
  const homeMatches = await db.collection('matches')
    .where('home_team', '==', teamName)
    .get();
  
  const awayMatches = await db.collection('matches')
    .where('away_team', '==', teamName)
    .get();
  
  // Combinar resultados
  const matches = [];
  homeMatches.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
  awayMatches.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
  
  // Ordenar por data
  matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
  
  return matches;
}
```

### Filtrar por Resultado

```javascript
// Vitórias do time da casa
async function getHomeWins() {
  const snapshot = await db.collection('matches')
    .where('home_score', '>', 'away_score') // Não funciona diretamente
    .get();
  
  // Firestore não suporta comparação entre campos
  // Solução: filtrar no código
  const allMatches = await getAllMatches();
  return allMatches.filter(m => m.home_score > m.away_score);
}

// Empates
async function getDraws() {
  const allMatches = await getAllMatches();
  return allMatches.filter(m => m.home_score === m.away_score);
}
```

### Ordenação

```javascript
// Ordenar por data (mais recente primeiro)
async function getMatchesOrderedByDate() {
  const snapshot = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}

// Ordenar por upload_date
async function getMatchesOrderedByUpload() {
  const snapshot = await db.collection('matches')
    .orderBy('upload_date', 'desc')
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Paginação

```javascript
// Primeira página
async function getMatchesPage(pageSize = 20) {
  const snapshot = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .limit(pageSize)
    .get();
  
  const matches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  const lastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return {
    matches,
    lastDoc
  };
}

// Próxima página
async function getNextPage(lastDoc, pageSize = 20) {
  const snapshot = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .startAfter(lastDoc)
    .limit(pageSize)
    .get();
  
  const matches = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
  
  const newLastDoc = snapshot.docs[snapshot.docs.length - 1];
  
  return {
    matches,
    lastDoc: newLastDoc,
    hasMore: matches.length === pageSize
  };
}
```

## Transações

### Sistema de ID Incremental

```javascript
async function getNextMatchId() {
  const counterRef = db.collection('counters').doc('match_counter');
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterRef);
    
    if (!doc.exists) {
      // Criar counter se não existir
      transaction.set(counterRef, { current_id: 1 });
      return 1;
    }
    
    const currentId = doc.data().current_id;
    const newId = currentId + 1;
    
    // Incrementar counter
    transaction.update(counterRef, { current_id: newId });
    
    return newId;
  });
}
```

### Atualização Atômica

```javascript
// Atualizar múltiplos campos atomicamente
async function updateMatchAtomic(matchId, updates) {
  const matchRef = db.collection('matches').doc(matchId);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(matchRef);
    
    if (!doc.exists) {
      throw new Error('Partida não encontrada');
    }
    
    // Atualizar campos
    transaction.update(matchRef, {
      ...updates,
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    return true;
  });
}
```

### Transferência de Dados

```javascript
// Mover partida para collection de arquivo
async function archiveMatch(matchId) {
  const matchRef = db.collection('matches').doc(matchId);
  const archiveRef = db.collection('archived_matches').doc(matchId);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(matchRef);
    
    if (!doc.exists) {
      throw new Error('Partida não encontrada');
    }
    
    // Copiar para arquivo
    transaction.set(archiveRef, {
      ...doc.data(),
      archived_at: admin.firestore.FieldValue.serverTimestamp()
    });
    
    // Deletar original
    transaction.delete(matchRef);
    
    return true;
  });
}
```

## Agregações e Estatísticas

### Contar Partidas

```javascript
// Total de partidas
async function getTotalMatches() {
  const snapshot = await db.collection('matches').count().get();
  return snapshot.data().count;
}

// Partidas por time
async function getMatchCountByTeam(teamName) {
  const matches = await getMatchesByTeam(teamName);
  return matches.length;
}
```

### Estatísticas de Vitórias/Derrotas

```javascript
async function getTeamStats(teamName) {
  const matches = await getMatchesByTeam(teamName);
  
  let wins = 0;
  let draws = 0;
  let losses = 0;
  let goalsFor = 0;
  let goalsAgainst = 0;
  
  matches.forEach(match => {
    const isHome = match.home_team === teamName;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;
    
    goalsFor += teamScore;
    goalsAgainst += opponentScore;
    
    if (teamScore > opponentScore) {
      wins++;
    } else if (teamScore === opponentScore) {
      draws++;
    } else {
      losses++;
    }
  });
  
  return {
    team: teamName,
    matches: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: (wins * 3) + draws,
    winRate: matches.length > 0 ? (wins / matches.length * 100).toFixed(1) : 0
  };
}
```

### Médias de Estatísticas

```javascript
async function getAverageStats() {
  const matches = await getAllMatches();
  
  if (matches.length === 0) {
    return null;
  }
  
  const totals = matches.reduce((acc, match) => {
    return {
      goals: acc.goals + (match.home_score || 0) + (match.away_score || 0),
      shots: acc.shots + (match.home_shots || 0) + (match.away_shots || 0),
      possession: acc.possession + (match.home_possession || 0) + (match.away_possession || 0)
    };
  }, { goals: 0, shots: 0, possession: 0 });
  
  return {
    avgGoalsPerMatch: (totals.goals / matches.length).toFixed(2),
    avgShotsPerTeam: (totals.shots / (matches.length * 2)).toFixed(2),
    avgPossession: (totals.possession / (matches.length * 2)).toFixed(1)
  };
}
```

### Top Partidas

```javascript
// Partidas com mais gols
async function getHighestScoringMatches(limit = 10) {
  const matches = await getAllMatches();
  
  return matches
    .map(match => ({
      ...match,
      totalGoals: (match.home_score || 0) + (match.away_score || 0)
    }))
    .sort((a, b) => b.totalGoals - a.totalGoals)
    .slice(0, limit);
}

// Partidas com maior diferença de gols
async function getBiggestWins(limit = 10) {
  const matches = await getAllMatches();
  
  return matches
    .map(match => ({
      ...match,
      goalDifference: Math.abs((match.home_score || 0) - (match.away_score || 0))
    }))
    .sort((a, b) => b.goalDifference - a.goalDifference)
    .slice(0, limit);
}
```

## Queries Avançadas

### Busca por Texto

```javascript
// Buscar times por nome (case-insensitive)
async function searchTeams(searchTerm) {
  const lowerSearch = searchTerm.toLowerCase();
  const matches = await getAllMatches();
  
  // Filtrar no código (Firestore não tem full-text search nativo)
  return matches.filter(match => 
    match.home_team.toLowerCase().includes(lowerSearch) ||
    match.away_team.toLowerCase().includes(lowerSearch)
  );
}
```

### Queries Compostas

```javascript
// Partidas de um time em um período
async function getTeamMatchesInPeriod(teamName, startDate, endDate) {
  const homeMatches = await db.collection('matches')
    .where('home_team', '==', teamName)
    .where('match_date', '>=', startDate)
    .where('match_date', '<=', endDate)
    .get();
  
  const awayMatches = await db.collection('matches')
    .where('away_team', '==', teamName)
    .where('match_date', '>=', startDate)
    .where('match_date', '<=', endDate)
    .get();
  
  const matches = [];
  homeMatches.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
  awayMatches.forEach(doc => matches.push({ id: doc.id, ...doc.data() }));
  
  return matches.sort((a, b) => new Date(b.match_date) - new Date(a.match_date));
}
```

### Batch Operations

```javascript
// Atualizar múltiplas partidas
async function updateMultipleMatches(matchIds, updates) {
  const batch = db.batch();
  
  matchIds.forEach(matchId => {
    const matchRef = db.collection('matches').doc(matchId);
    batch.update(matchRef, updates);
  });
  
  await batch.commit();
  return true;
}

// Deletar múltiplas partidas
async function deleteMultipleMatches(matchIds) {
  const batch = db.batch();
  
  matchIds.forEach(matchId => {
    const matchRef = db.collection('matches').doc(matchId);
    batch.delete(matchRef);
  });
  
  await batch.commit();
  return true;
}
```

### Listeners em Tempo Real

```javascript
// Escutar mudanças em tempo real
function watchMatches(callback) {
  return db.collection('matches')
    .orderBy('match_date', 'desc')
    .onSnapshot(snapshot => {
      const matches = [];
      snapshot.forEach(doc => {
        matches.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(matches);
    });
}

// Uso:
const unsubscribe = watchMatches((matches) => {
  console.log('Partidas atualizadas:', matches.length);
});

// Parar de escutar
unsubscribe();
```

## Otimização de Performance

### Índices

**Criar índices para queries frequentes:**

```javascript
// Índice composto para filtro + ordenação
// Firestore cria automaticamente, mas pode ser necessário criar manualmente
// Via console: https://console.firebase.google.com/project/_/firestore/indexes

// Exemplo de índice necessário:
// Collection: matches
// Fields: match_date (Descending), upload_date (Descending)
```

**Verificar índices necessários:**
```bash
# Firestore mostra erro com link para criar índice quando necessário
# Exemplo:
# The query requires an index. You can create it here: https://console.firebase.google.com/...
```

### Cache

```javascript
// Usar cache do Firestore
const snapshot = await db.collection('matches')
  .orderBy('match_date', 'desc')
  .get({ source: 'cache' }); // Tentar cache primeiro

// Ou forçar servidor
const snapshot = await db.collection('matches')
  .orderBy('match_date', 'desc')
  .get({ source: 'server' }); // Sempre buscar do servidor
```

### Limitar Resultados

```javascript
// Sempre usar limit quando possível
async function getRecentMatches(limit = 50) {
  const snapshot = await db.collection('matches')
    .orderBy('match_date', 'desc')
    .limit(limit)
    .get();
  
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
}
```

### Projeção de Campos

```javascript
// Buscar apenas campos necessários (não suportado nativamente)
// Solução: filtrar no código
async function getMatchesSummary() {
  const matches = await getAllMatches();
  
  return matches.map(match => ({
    id: match.id,
    home_team: match.home_team,
    away_team: match.away_team,
    home_score: match.home_score,
    away_score: match.away_score,
    match_date: match.match_date
  }));
}
```

### Desnormalização

```javascript
// Armazenar dados agregados para evitar cálculos
async function insertMatchWithStats(matchData, matchDate) {
  const matchId = await getNextMatchId();
  
  // Calcular estatísticas
  const totalGoals = (matchData.home_score || 0) + (matchData.away_score || 0);
  const goalDifference = Math.abs((matchData.home_score || 0) - (matchData.away_score || 0));
  
  const matchDoc = {
    match_id: matchId,
    match_date: matchDate,
    upload_date: admin.firestore.FieldValue.serverTimestamp(),
    ...matchData,
    // Dados desnormalizados
    total_goals: totalGoals,
    goal_difference: goalDifference,
    result: matchData.home_score > matchData.away_score ? 'home_win' : 
            matchData.home_score < matchData.away_score ? 'away_win' : 'draw'
  };
  
  const docRef = await db.collection('matches').add(matchDoc);
  
  return {
    firestoreId: docRef.id,
    matchId: matchId
  };
}
```

## Exemplos de Uso Completo

### Dashboard de Estatísticas

```javascript
async function getDashboardStats() {
  const matches = await getAllMatches();
  
  if (matches.length === 0) {
    return {
      totalMatches: 0,
      totalGoals: 0,
      avgGoalsPerMatch: 0,
      highestScoring: null,
      recentMatches: []
    };
  }
  
  const totalGoals = matches.reduce((sum, m) => 
    sum + (m.home_score || 0) + (m.away_score || 0), 0
  );
  
  const highestScoring = matches
    .map(m => ({
      ...m,
      totalGoals: (m.home_score || 0) + (m.away_score || 0)
    }))
    .sort((a, b) => b.totalGoals - a.totalGoals)[0];
  
  return {
    totalMatches: matches.length,
    totalGoals,
    avgGoalsPerMatch: (totalGoals / matches.length).toFixed(2),
    highestScoring,
    recentMatches: matches.slice(0, 5)
  };
}
```

### Relatório de Time

```javascript
async function getTeamReport(teamName) {
  const matches = await getMatchesByTeam(teamName);
  const stats = await getTeamStats(teamName);
  
  // Últimas 5 partidas
  const recentForm = matches.slice(0, 5).map(match => {
    const isHome = match.home_team === teamName;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;
    
    if (teamScore > opponentScore) return 'W';
    if (teamScore === opponentScore) return 'D';
    return 'L';
  });
  
  return {
    team: teamName,
    stats,
    recentForm: recentForm.join(''),
    recentMatches: matches.slice(0, 5)
  };
}
```

## Referências

- [Schema do Banco de Dados](schema.md)
- [Documentação de API](../api/endpoints.md)
- [Firebase Firestore Docs](https://firebase.google.com/docs/firestore)
- [Guia de Desenvolvimento](../guides/development-setup.md)

## Próximos Passos

- Implementar cache de queries frequentes
- Criar índices compostos para queries complexas
- Implementar paginação no frontend
- Adicionar queries de agregação mais avançadas
