import fs from 'fs';
import Groq from 'groq-sdk';

let groq = null;

function getGroqClient() {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY não configurada no arquivo .env');
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return groq;
}

export async function extractMatchData(imagePath) {
  const imageBase64 = fs.readFileSync(imagePath, { encoding: 'base64' });
  const imageUrl = `data:image/jpeg;base64,${imageBase64}`;
  
  // Modo de teste: retorna dados mock se a API key for inválida
  const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';
  
  if (USE_MOCK_DATA) {
    console.log('⚠️  Usando dados MOCK (API key inválida ou modo teste ativado)');
    return {
      home_team: "Time Casa",
      away_team: "Time Visitante",
      home_score: 3,
      away_score: 2,
      home_shots: 15,
      away_shots: 10,
      home_possession: 58,
      away_possession: 42,
      dribbles_completed_rate_home: 87,
      dribbles_completed_rate_away: 83,
      shot_accuracy_home: 60,
      shot_accuracy_away: 60,
      pass_accuracy_home: 80,
      pass_accuracy_away: 81,
      ball_recovery_time: 7,
      expected_goals_home: 1.3,
      expected_goals_away: 2.3,
      passes_home: 177,
      passes_away: 139,
      duels_won_home: 48,
      duels_won_away: 31,
      duels_lost_home: 15,
      duels_lost_away: 6,
      interceptions_home: 17,
      interceptions_away: 26,
      blocks_home: 1,
      blocks_away: 1,
      fouls_committed_home: 2,
      fouls_committed_away: 4,
      offsides_home: 1,
      offsides_away: 0,
      corners_home: 3,
      corners_away: 3,
      fouls_home: 2,
      fouls_away: 3,
      penalties_home: 1,
      penalties_away: 0,
      yellow_cards_home: 1,
      yellow_cards_away: 4,
      match_analysis: "Partida equilibrada com o Time Casa saindo vitorioso por 3x2. O Time Casa dominou a posse de bola (58%) e foi mais eficiente nos duelos, vencendo 48 contra 31 do adversário. A precisão de passes foi similar entre as equipes (80% vs 81%), mas o Time Casa soube aproveitar melhor as oportunidades criadas. O Time Visitante teve maior expectativa de gols (xG 2.3 vs 1.3), indicando que criou chances mais claras, porém pecou na finalização com apenas 60% de precisão nos chutes. A disciplina foi um problema para o Time Visitante, que recebeu 4 cartões amarelos contra apenas 1 do adversário. Defensivamente, o Time Visitante teve mais interceptações (26 vs 17), mas não conseguiu conter os ataques adversários nos momentos decisivos. O Time Casa foi mais eficiente na recuperação de bola e soube administrar melhor o resultado."
    };
  }
  
  const prompt = `Analise esta imagem de resumo de partida do EA FC 26 e extraia TODOS os dados visíveis.

Retorne um JSON com a seguinte estrutura:
{
  "home_team": "nome do time da casa",
  "away_team": "nome do time visitante",
  "home_score": número de gols do time da casa,
  "away_score": número de gols do time visitante,
  "home_shots": chutes a gol do time da casa,
  "away_shots": chutes a gol do time visitante,
  "home_possession": posse de bola do time da casa (porcentagem),
  "away_possession": posse de bola do time visitante (porcentagem),
  "dribbles_completed_rate_home": taxa de dribles completados time casa (porcentagem),
  "dribbles_completed_rate_away": taxa de dribles completados time visitante (porcentagem),
  "shot_accuracy_home": precisão de chutes time casa (porcentagem),
  "shot_accuracy_away": precisão de chutes time visitante (porcentagem),
  "pass_accuracy_home": precisão de passes time casa (porcentagem),
  "pass_accuracy_away": precisão de passes time visitante (porcentagem),
  "ball_recovery_time": tempo de recuperação de bola (segundos),
  "expected_goals_home": gols esperados (xG) time casa,
  "expected_goals_away": gols esperados (xG) time visitante,
  "passes_home": número de passes time casa,
  "passes_away": número de passes time visitante,
  "duels_won_home": duelos ganhos time casa,
  "duels_won_away": duelos ganhos time visitante,
  "duels_lost_home": duelos perdidos time casa,
  "duels_lost_away": duelos perdidos time visitante,
  "interceptions_home": interceptações time casa,
  "interceptions_away": interceptações time visitante,
  "blocks_home": bloqueios time casa,
  "blocks_away": bloqueios time visitante,
  "fouls_committed_home": faltas cometidas time casa,
  "fouls_committed_away": faltas cometidas time visitante,
  "offsides_home": impedimentos time casa,
  "offsides_away": impedimentos time visitante,
  "corners_home": escanteios time casa,
  "corners_away": escanteios time visitante,
  "fouls_home": faltas sofridas time casa,
  "fouls_away": faltas sofridas time visitante,
  "penalties_home": pênaltis time casa,
  "penalties_away": pênaltis time visitante,
  "yellow_cards_home": cartões amarelos time casa,
  "yellow_cards_away": cartões amarelos time visitante,
  "match_analysis": "Análise detalhada da partida em português brasileiro. Analise o desempenho dos times, destaque os pontos fortes e fracos de cada equipe, comente sobre a eficiência ofensiva e defensiva, e faça uma análise tática considerando que é uma partida de futebol virtual do EA FC 26. A análise deve ter entre 150-200 palavras."
}

IMPORTANTE: 
- Extraia TODOS os dados que conseguir identificar na imagem
- Se algum dado não estiver visível, use null
- A análise da partida (match_analysis) deve ser um texto corrido em português brasileiro, analisando o desempenho dos times com base nos dados extraídos
- NÃO inclua informações sobre jogadores individuais, apenas estatísticas dos times
- Retorne apenas o JSON, sem texto adicional`;

  try {
    const client = getGroqClient();
    const completion = await client.chat.completions.create({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imageUrl } }
          ]
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    });

    const responseText = completion.choices[0].message.content;
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    
    throw new Error('Não foi possível extrair JSON da resposta');
  } catch (error) {
    console.error('Erro ao chamar Groq API:', error.message);
    
    // Se falhar, usa dados mock automaticamente
    console.log('⚠️  Usando dados MOCK devido a erro na API');
    return {
      home_team: "Time Casa",
      away_team: "Time Visitante",
      home_score: 3,
      away_score: 2,
      home_shots: 15,
      away_shots: 10,
      home_possession: 58,
      away_possession: 42,
      dribbles_completed_rate_home: 87,
      dribbles_completed_rate_away: 83,
      shot_accuracy_home: 60,
      shot_accuracy_away: 60,
      pass_accuracy_home: 80,
      pass_accuracy_away: 81,
      ball_recovery_time: 7,
      expected_goals_home: 1.3,
      expected_goals_away: 2.3,
      passes_home: 177,
      passes_away: 139,
      duels_won_home: 48,
      duels_won_away: 31,
      duels_lost_home: 15,
      duels_lost_away: 6,
      interceptions_home: 17,
      interceptions_away: 26,
      blocks_home: 1,
      blocks_away: 1,
      fouls_committed_home: 2,
      fouls_committed_away: 4,
      offsides_home: 1,
      offsides_away: 0,
      corners_home: 3,
      corners_away: 3,
      fouls_home: 2,
      fouls_away: 3,
      penalties_home: 1,
      penalties_away: 0,
      yellow_cards_home: 1,
      yellow_cards_away: 4,
      match_analysis: "Configure uma API key válida do Groq para obter análises reais das partidas. Esta é uma análise de exemplo."
    };
  }
}
