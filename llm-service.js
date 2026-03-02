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
  
  const prompt = `Analise esta imagem de resumo de partida do EA FC 26 em PORTUGUÊS BRASILEIRO e extraia TODOS os dados visíveis.

IMPORTANTE: A imagem está em PORTUGUÊS. Os campos aparecem com os seguintes nomes na tela:

ESTATÍSTICAS PRINCIPAIS:
- "Chutes a gol" ou "Finalizações" = shots
- "Posse de bola" = possession (%)
- "Precisão de chute" = shot_accuracy (%)
- "Precisão de passe" = pass_accuracy (%)
- "Passes" = passes (número total)
- "Dribles completos" ou "Taxa de dribles" = dribbles_completed_rate (%)
- "Gols esperados" ou "xG" = expected_goals

DUELOS E DEFESA:
- "Duelos ganhos" = duels_won
- "Duelos perdidos" = duels_lost
- "Interceptações" = interceptions
- "Bloqueios" = blocks
- "Tempo de recuperação" = ball_recovery_time (segundos)

DISCIPLINA E INFRAÇÕES:
- "Faltas cometidas" = fouls_committed (quando o time comete falta)
- "Faltas" (sem "cometidas") = fouls (quando o time sofre falta)
- ATENÇÃO: São DOIS campos DIFERENTES na imagem! "Faltas cometidas" e "Faltas"
- "Impedimentos" = offsides
- "Escanteios" = corners
- "Pênaltis" = penalties
- "Cartões amarelos" = yellow_cards

Retorne um JSON com a seguinte estrutura:
{
  "home_team": "nome do time da casa",
  "away_team": "nome do time visitante",
  "home_score": número de gols do time da casa,
  "away_score": número de gols do time visitante,
  "home_shots": chutes a gol do time da casa,
  "away_shots": chutes a gol do time visitante,
  "home_possession": posse de bola do time da casa (porcentagem sem o símbolo %),
  "away_possession": posse de bola do time visitante (porcentagem sem o símbolo %),
  "dribbles_completed_rate_home": taxa de dribles completados time casa (porcentagem sem o símbolo %),
  "dribbles_completed_rate_away": taxa de dribles completados time visitante (porcentagem sem o símbolo %),
  "shot_accuracy_home": precisão de chutes time casa (porcentagem sem o símbolo %),
  "shot_accuracy_away": precisão de chutes time visitante (porcentagem sem o símbolo %),
  "pass_accuracy_home": precisão de passes time casa (porcentagem sem o símbolo %),
  "pass_accuracy_away": precisão de passes time visitante (porcentagem sem o símbolo %),
  "ball_recovery_time": tempo de recuperação de bola (número em segundos),
  "expected_goals_home": gols esperados (xG) time casa (número decimal),
  "expected_goals_away": gols esperados (xG) time visitante (número decimal),
  "passes_home": número total de passes time casa,
  "passes_away": número total de passes time visitante,
  "duels_won_home": duelos ganhos time casa,
  "duels_won_away": duelos ganhos time visitante,
  "duels_lost_home": duelos perdidos time casa,
  "duels_lost_away": duelos perdidos time visitante,
  "interceptions_home": interceptações time casa,
  "interceptions_away": interceptações time visitante,
  "blocks_home": bloqueios time casa,
  "blocks_away": bloqueios time visitante,
  "fouls_committed_home": faltas COMETIDAS pelo time casa,
  "fouls_committed_away": faltas COMETIDAS pelo time visitante,
  "offsides_home": impedimentos time casa,
  "offsides_away": impedimentos time visitante,
  "corners_home": escanteios time casa,
  "corners_away": escanteios time visitante,
  "fouls_home": faltas SOFRIDAS pelo time casa,
  "fouls_away": faltas SOFRIDAS pelo time visitante,
  "penalties_home": pênaltis time casa,
  "penalties_away": pênaltis time visitante,
  "yellow_cards_home": cartões amarelos time casa,
  "yellow_cards_away": cartões amarelos time visitante,
  "match_analysis": "Análise detalhada da partida em português brasileiro. Analise o desempenho dos times, destaque os pontos fortes e fracos de cada equipe, comente sobre a eficiência ofensiva e defensiva, e faça uma análise tática considerando que é uma partida de futebol virtual do EA FC 26. A análise deve ter entre 150-200 palavras."
}

REGRAS IMPORTANTES: 
- A imagem está em PORTUGUÊS BRASILEIRO
- Extraia TODOS os dados que conseguir identificar
- Se algum dado não estiver visível na imagem, use null
- Números devem ser apenas números (sem %, sem unidades)
- ATENÇÃO: Existem DOIS campos de faltas diferentes na imagem:
  * "Faltas cometidas" → fouls_committed_home e fouls_committed_away
  * "Faltas" (sem "cometidas") → fouls_home e fouls_away
- Procure por TODOS os campos listados acima
- A análise da partida (match_analysis) deve ser um texto corrido em português brasileiro
- NÃO inclua informações sobre jogadores individuais, apenas estatísticas dos times
- Retorne apenas o JSON válido, sem texto adicional antes ou depois`;



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
    throw new Error(`Erro na extração: ${error.message}`);
  }
}
