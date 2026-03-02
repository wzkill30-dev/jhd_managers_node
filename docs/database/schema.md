# Schema do Banco de Dados

> Última atualização: 2024

## Visão Geral

O JHD Managers utiliza o Firebase Firestore como banco de dados NoSQL para armazenar dados de partidas do EA FC 26. O schema é composto por duas collections principais:

- **matches**: Armazena todos os dados das partidas, incluindo ~30 estatísticas extraídas automaticamente
- **counters**: Gerencia IDs incrementais para garantir identificadores únicos e sequenciais

O Firestore foi escolhido por sua escalabilidade, facilidade de integração com Node.js via Firebase Admin SDK, e capacidade de armazenar documentos JSON flexíveis.

## Collection: matches

A collection `matches` armazena todos os dados de partidas processadas pelo sistema. Cada documento representa uma partida única com estatísticas completas extraídas via IA.

### Campos da Collection matches

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| **match_id** | number | Sim | ID incremental único gerado pelo sistema | `42` |
| **match_date** | string | Sim | Data da partida no formato YYYY-MM-DD | `"2024-01-15"` |
| **upload_date** | Timestamp | Sim | Timestamp automático do Firestore (momento do upload) | `2024-01-15T18:30:00.000Z` |
| **home_team** | string | Sim | Nome do time da casa | `"Manchester City"` |
| **away_team** | string | Sim | Nome do time visitante | `"Liverpool"` |
| **home_score** | number | Sim | Gols marcados pelo time da casa | `2` |
| **away_score** | number | Sim | Gols marcados pelo time visitante | `1` |
| **home_shots** | number | Não | Total de chutes a gol do time da casa | `15` |
| **away_shots** | number | Não | Total de chutes a gol do time visitante | `8` |
| **home_possession** | number | Não | Porcentagem de posse de bola do time da casa | `62` |
| **away_possession** | number | Não | Porcentagem de posse de bola do time visitante | `38` |
| **dribbles_completed_rate_home** | number | Não | Taxa de dribles completados (%) do time da casa | `75` |
| **dribbles_completed_rate_away** | number | Não | Taxa de dribles completados (%) do time visitante | `60` |
| **shot_accuracy_home** | number | Não | Precisão de chutes (%) do time da casa | `67` |
| **shot_accuracy_away** | number | Não | Precisão de chutes (%) do time visitante | `50` |
| **pass_accuracy_home** | number | Não | Precisão de passes (%) do time da casa | `89` |
| **pass_accuracy_away** | number | Não | Precisão de passes (%) do time visitante | `82` |
| **ball_recovery_time** | number | Não | Tempo médio de recuperação da bola (segundos) | `8` |
| **expected_goals_home** | number | Não | Expected Goals (xG) do time da casa | `2.3` |
| **expected_goals_away** | number | Não | Expected Goals (xG) do time visitante | `0.8` |
| **passes_home** | number | Não | Total de passes do time da casa | `542` |
| **passes_away** | number | Não | Total de passes do time visitante | `318` |
| **duels_won_home** | number | Não | Duelos ganhos pelo time da casa | `28` |
| **duels_won_away** | number | Não | Duelos ganhos pelo time visitante | `22` |
| **duels_lost_home** | number | Não | Duelos perdidos pelo time da casa | `18` |
| **duels_lost_away** | number | Não | Duelos perdidos pelo time visitante | `24` |
| **interceptions_home** | number | Não | Interceptações do time da casa | `12` |
| **interceptions_away** | number | Não | Interceptações do time visitante | `15` |
| **blocks_home** | number | Não | Bloqueios defensivos do time da casa | `5` |
| **blocks_away** | number | Não | Bloqueios defensivos do time visitante | `8` |
| **fouls_committed_home** | number | Não | Faltas cometidas pelo time da casa | `10` |
| **fouls_committed_away** | number | Não | Faltas cometidas pelo time visitante | `14` |
| **offsides_home** | number | Não | Impedimentos do time da casa | `2` |
| **offsides_away** | number | Não | Impedimentos do time visitante | `4` |
| **corners_home** | number | Não | Escanteios do time da casa | `7` |
| **corners_away** | number | Não | Escanteios do time visitante | `3` |
| **fouls_home** | number | Não | Faltas sofridas pelo time da casa | `14` |
| **fouls_away** | number | Não | Faltas sofridas pelo time visitante | `10` |
| **penalties_home** | number | Não | Pênaltis do time da casa | `0` |
| **penalties_away** | number | Não | Pênaltis do time visitante | `0` |
| **yellow_cards_home** | number | Não | Cartões amarelos do time da casa | `2` |
| **yellow_cards_away** | number | Não | Cartões amarelos do time visitante | `3` |
| **match_analysis** | string | Não | Análise tática gerada por IA (150-200 palavras em português) | `"O Manchester City dominou..."` |
| **raw_data** | string | Não | JSON original da extração (para debug e auditoria) | `"{\"home_team\":\"Manchester City\",...}"` |

### Campos Obrigatórios vs Opcionais

**Campos Obrigatórios:**
- `match_id` - Gerado automaticamente pelo sistema
- `match_date` - Fornecido pelo usuário no upload
- `upload_date` - Gerado automaticamente pelo Firestore
- `home_team` - Extraído da imagem via IA
- `away_team` - Extraído da imagem via IA
- `home_score` - Extraído da imagem via IA
- `away_score` - Extraído da imagem via IA

**Campos Opcionais:**
Todas as estatísticas (chutes, posse, passes, etc.) são opcionais pois podem não estar visíveis na imagem ou não serem detectadas pelo LLM. O sistema define valor padrão `0` para campos numéricos não detectados e string vazia `""` para campos de texto.

### Lista Completa de Estatísticas Extraídas

O sistema extrai aproximadamente 30 estatísticas de cada partida, organizadas nas seguintes categorias:

#### 1. Informações Básicas (4 campos)
- Times (casa e visitante)
- Placar (gols de cada time)

#### 2. Estatísticas de Ataque (6 campos)
- Chutes a gol (home/away)
- Precisão de chutes % (home/away)
- Expected Goals - xG (home/away)

#### 3. Posse e Passes (6 campos)
- Posse de bola % (home/away)
- Total de passes (home/away)
- Precisão de passes % (home/away)

#### 4. Dribles (2 campos)
- Taxa de dribles completados % (home/away)

#### 5. Duelos e Defesa (9 campos)
- Duelos ganhos (home/away)
- Duelos perdidos (home/away)
- Interceptações (home/away)
- Bloqueios (home/away)
- Tempo de recuperação da bola

#### 6. Disciplina (6 campos)
- Faltas cometidas (home/away)
- Faltas sofridas (home/away)
- Cartões amarelos (home/away)

#### 7. Outras Estatísticas (6 campos)
- Impedimentos (home/away)
- Escanteios (home/away)
- Pênaltis (home/away)

#### 8. Análise e Metadados (2 campos)
- Análise tática gerada por IA
- Dados brutos da extração

**Total: ~40 campos** (incluindo IDs, datas e metadados)

## Collection: counters

A collection `counters` gerencia IDs incrementais para garantir que cada partida tenha um `match_id` único e sequencial.

### Estrutura da Collection counters

**Document ID:** `match_counter` (documento único)

| Campo | Tipo | Obrigatório | Descrição | Exemplo |
|-------|------|-------------|-----------|---------|
| **current_id** | number | Sim | Último ID utilizado para uma partida | `42` |

### Sistema de ID Incremental

O sistema utiliza transações do Firestore para garantir atomicidade na geração de IDs:

1. **Primeira Partida:**
   - Documento `match_counter` não existe
   - Sistema cria documento com `current_id: 1`
   - Partida recebe `match_id: 1`

2. **Partidas Subsequentes:**
   - Sistema lê `current_id` atual em uma transação
   - Incrementa o valor: `new_id = current_id + 1`
   - Atualiza documento com novo valor
   - Partida recebe o novo `match_id`

3. **Garantias:**
   - **Atomicidade:** Transação garante que não há race conditions
   - **Unicidade:** Cada partida tem ID único
   - **Sequencialidade:** IDs são sempre crescentes (1, 2, 3, ...)
   - **Confiabilidade:** Mesmo com múltiplos uploads simultâneos, não há duplicação

**Implementação (database.js):**
```javascript
async function getNextMatchId() {
  const counterDoc = countersCollection.doc('match_counter');
  
  const result = await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(counterDoc);
    
    let newId;
    if (!doc.exists) {
      newId = 1;
      transaction.set(counterDoc, { current_id: newId });
    } else {
      newId = doc.data().current_id + 1;
      transaction.update(counterDoc, { current_id: newId });
    }
    
    return newId;
  });
  
  return result;
}
```

## Índices e Ordenação

### Índices Configurados

O sistema utiliza os seguintes índices para otimizar queries:

1. **Índice em match_date (desc):**
   - Permite ordenação eficiente por data da partida
   - Usado na listagem principal de partidas
   - Ordem decrescente (mais recentes primeiro)

**Query utilizada:**
```javascript
await matchesCollection.orderBy('match_date', 'desc').get();
```

### Ordenação Adicional

Além da ordenação por `match_date` no Firestore, o sistema também ordena por `upload_date` em memória para garantir que partidas adicionadas mais recentemente apareçam primeiro:

```javascript
matches.sort((a, b) => {
  const dateA = new Date(a.upload_date);
  const dateB = new Date(b.upload_date);
  return dateB - dateA; // Mais recente primeiro
});
```

## Exemplos de Documentos JSON

### Exemplo 1: Partida Completa com Todas as Estatísticas

```json
{
  "match_id": 1,
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
  "match_analysis": "O Manchester City dominou a partida com 62% de posse de bola e 542 passes completados, demonstrando seu estilo de jogo característico. A eficiência ofensiva foi superior, com 15 chutes e xG de 2.3, refletindo a qualidade das chances criadas. O Liverpool, apesar da menor posse, mostrou solidez defensiva com 15 interceptações e 8 bloqueios. A diferença no meio-campo foi decisiva, com o City vencendo mais duelos (28 vs 22) e mantendo maior precisão nos passes (89% vs 82%). A disciplina foi um ponto de atenção para ambos os times, com 24 faltas cometidas no total. O resultado justo reflete a superioridade técnica e tática do Manchester City nesta partida virtual do EA FC 26.",
  "raw_data": "{\"home_team\":\"Manchester City\",\"away_team\":\"Liverpool\",\"home_score\":2,\"away_score\":1,\"home_shots\":15,\"away_shots\":8,\"home_possession\":62,\"away_possession\":38,\"shot_accuracy_home\":67,\"shot_accuracy_away\":50,\"pass_accuracy_home\":89,\"pass_accuracy_away\":82,\"dribbles_completed_rate_home\":75,\"dribbles_completed_rate_away\":60,\"expected_goals_home\":2.3,\"expected_goals_away\":0.8,\"passes_home\":542,\"passes_away\":318,\"duels_won_home\":28,\"duels_won_away\":22,\"duels_lost_home\":18,\"duels_lost_away\":24,\"interceptions_home\":12,\"interceptions_away\":15,\"blocks_home\":5,\"blocks_away\":8,\"ball_recovery_time\":8,\"fouls_committed_home\":10,\"fouls_committed_away\":14,\"fouls_home\":14,\"fouls_away\":10,\"offsides_home\":2,\"offsides_away\":4,\"corners_home\":7,\"corners_away\":3,\"penalties_home\":0,\"penalties_away\":0,\"yellow_cards_home\":2,\"yellow_cards_away\":3,\"match_analysis\":\"O Manchester City dominou a partida...\"}"
}
```

### Exemplo 2: Partida com Estatísticas Parciais

```json
{
  "match_id": 2,
  "match_date": "2024-01-16",
  "upload_date": "2024-01-16T20:15:00.000Z",
  "home_team": "Real Madrid",
  "away_team": "Barcelona",
  "home_score": 3,
  "away_score": 3,
  "home_shots": 12,
  "away_shots": 14,
  "home_possession": 48,
  "away_possession": 52,
  "shot_accuracy_home": 58,
  "shot_accuracy_away": 64,
  "pass_accuracy_home": 85,
  "pass_accuracy_away": 87,
  "dribbles_completed_rate_home": 0,
  "dribbles_completed_rate_away": 0,
  "expected_goals_home": 2.8,
  "expected_goals_away": 3.1,
  "passes_home": 456,
  "passes_away": 498,
  "duels_won_home": 25,
  "duels_won_away": 27,
  "duels_lost_home": 22,
  "duels_lost_away": 20,
  "interceptions_home": 10,
  "interceptions_away": 11,
  "blocks_home": 6,
  "blocks_away": 7,
  "ball_recovery_time": 0,
  "fouls_committed_home": 12,
  "fouls_committed_away": 11,
  "fouls_home": 11,
  "fouls_away": 12,
  "offsides_home": 3,
  "offsides_away": 2,
  "corners_home": 5,
  "corners_away": 6,
  "penalties_home": 1,
  "penalties_away": 0,
  "yellow_cards_home": 3,
  "yellow_cards_away": 2,
  "match_analysis": "Clássico eletrizante entre Real Madrid e Barcelona terminou em empate justo por 3 a 3. A posse de bola foi equilibrada (48% vs 52%), refletindo a paridade técnica entre as equipes. O Barcelona teve ligeira vantagem em chutes (14 vs 12) e precisão (64% vs 58%), mas o Real Madrid foi mais eficiente na conversão. Os xG próximos (2.8 vs 3.1) confirmam que ambos criaram chances de qualidade. O meio-campo foi disputado, com duelos equilibrados e muitas faltas (23 no total). O pênalti convertido pelo Real Madrid foi decisivo para o empate. Partida de alto nível técnico que honrou a rivalidade histórica no mundo virtual do EA FC 26.",
  "raw_data": "{\"home_team\":\"Real Madrid\",\"away_team\":\"Barcelona\",\"home_score\":3,\"away_score\":3,...}"
}
```

### Exemplo 3: Documento do Counter

```json
{
  "current_id": 42
}
```

Este documento indica que a última partida adicionada recebeu `match_id: 42`, e a próxima partida receberá `match_id: 43`.

## Regras de Validação

### Validações Implementadas no Backend

O sistema implementa as seguintes validações antes de inserir documentos:

1. **match_date:**
   - Deve estar no formato `YYYY-MM-DD`
   - Não pode ser vazio
   - Validado no frontend e backend

2. **Campos Numéricos:**
   - Valores padrão `0` para campos não detectados
   - Não aceita valores negativos (exceto quando faz sentido)
   - Porcentagens devem estar entre 0 e 100

3. **Campos de Texto:**
   - `home_team` e `away_team` não podem ser vazios
   - `match_analysis` pode ser vazio se não gerado
   - Strings vazias `""` como padrão

4. **upload_date:**
   - Gerado automaticamente pelo Firestore
   - Usa `admin.firestore.FieldValue.serverTimestamp()`
   - Garante timestamp consistente do servidor

### Regras de Segurança Recomendadas (Firestore Rules)

Para produção, recomenda-se configurar as seguintes regras de segurança no Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Collection matches - apenas leitura pública, escrita via backend
    match /matches/{matchId} {
      allow read: if true;  // Leitura pública
      allow write: if false; // Escrita apenas via Admin SDK
    }
    
    // Collection counters - apenas backend pode acessar
    match /counters/{counterId} {
      allow read, write: if false; // Apenas Admin SDK
    }
  }
}
```

> ⚠️ **Importante:** Estas regras garantem que apenas o backend (via Admin SDK) pode escrever dados, prevenindo manipulação direta do banco de dados por clientes.

## Considerações de Performance

### Otimizações Implementadas

1. **Índice em match_date:**
   - Permite queries rápidas ordenadas por data
   - Evita full collection scans

2. **Transações para IDs:**
   - Garante atomicidade sem locks desnecessários
   - Escalável para múltiplos uploads simultâneos

3. **Timestamps do Servidor:**
   - Usa `serverTimestamp()` para evitar problemas de timezone
   - Garante consistência temporal

### Limitações e Escalabilidade

1. **Limite de Documentos:**
   - Firestore não tem limite prático de documentos
   - Plano gratuito: 50.000 leituras/dia, 20.000 escritas/dia

2. **Tamanho de Documentos:**
   - Limite máximo: 1 MB por documento
   - Documentos de partidas: ~5-10 KB (bem abaixo do limite)

3. **Queries:**
   - Ordenação por `match_date` é eficiente com índice
   - Para queries complexas, considerar índices compostos

## Referências

- [Documentação da API](../api/endpoints.md) - Endpoints que interagem com o banco
- [Exemplos de Queries](queries.md) - Exemplos práticos de queries Firestore
- [Guia de Desenvolvimento](../guides/development-setup.md) - Como configurar o Firebase
- [Fluxo de Dados](../architecture/data-flow.md) - Como dados fluem até o Firestore

## Próximos Passos

Após entender o schema do banco de dados:

1. Consulte [Exemplos de Queries](queries.md) para aprender a consultar dados
2. Veja [Documentação da API](../api/endpoints.md) para entender os endpoints
3. Leia [Serviço de IA](../services/llm-service.md) para entender como dados são extraídos
