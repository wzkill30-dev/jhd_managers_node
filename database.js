import fs from 'fs';
import path from 'path';

const DB_FILE = 'eafc26.json';

// Inicializa o banco de dados JSON
function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify({ matches: [], players: [] }, null, 2));
  }
}

function readDB() {
  initDB();
  return JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

const db = {
  insertMatch(matchData, matchDate) {
    const data = readDB();
    const newMatch = {
      id: data.matches.length + 1,
      match_date: matchDate,
      upload_date: new Date().toISOString(),
      home_team: matchData.home_team,
      away_team: matchData.away_team,
      home_score: matchData.home_score,
      away_score: matchData.away_score,
      home_shots: matchData.home_shots,
      away_shots: matchData.away_shots,
      home_possession: matchData.home_possession,
      away_possession: matchData.away_possession,
      // Novos campos
      dribbles_completed_rate_home: matchData.dribbles_completed_rate_home,
      dribbles_completed_rate_away: matchData.dribbles_completed_rate_away,
      shot_accuracy_home: matchData.shot_accuracy_home,
      shot_accuracy_away: matchData.shot_accuracy_away,
      pass_accuracy_home: matchData.pass_accuracy_home,
      pass_accuracy_away: matchData.pass_accuracy_away,
      ball_recovery_time: matchData.ball_recovery_time,
      expected_goals_home: matchData.expected_goals_home,
      expected_goals_away: matchData.expected_goals_away,
      passes_home: matchData.passes_home,
      passes_away: matchData.passes_away,
      duels_won_home: matchData.duels_won_home,
      duels_won_away: matchData.duels_won_away,
      duels_lost_home: matchData.duels_lost_home,
      duels_lost_away: matchData.duels_lost_away,
      interceptions_home: matchData.interceptions_home,
      interceptions_away: matchData.interceptions_away,
      blocks_home: matchData.blocks_home,
      blocks_away: matchData.blocks_away,
      fouls_committed_home: matchData.fouls_committed_home,
      fouls_committed_away: matchData.fouls_committed_away,
      offsides_home: matchData.offsides_home,
      offsides_away: matchData.offsides_away,
      corners_home: matchData.corners_home,
      corners_away: matchData.corners_away,
      fouls_home: matchData.fouls_home,
      fouls_away: matchData.fouls_away,
      penalties_home: matchData.penalties_home,
      penalties_away: matchData.penalties_away,
      yellow_cards_home: matchData.yellow_cards_home,
      yellow_cards_away: matchData.yellow_cards_away,
      match_analysis: matchData.match_analysis,
      raw_data: JSON.stringify(matchData)
    };
    data.matches.push(newMatch);
    
    writeDB(data);
    return newMatch.id;
  },
  
  getAllMatches() {
    const data = readDB();
    return data.matches;
  },
  
  getMatchById(id) {
    const data = readDB();
    return data.matches.find(m => m.id === id);
  },
  
  getPlayersByMatchId(matchId) {
    const data = readDB();
    return data.players.filter(p => p.match_id === matchId);
  },
  
  deleteMatch(matchId) {
    const data = readDB();
    
    // Remove a partida
    data.matches = data.matches.filter(m => m.id !== matchId);
    
    // Remove os jogadores associados
    data.players = data.players.filter(p => p.match_id !== matchId);
    
    writeDB(data);
    return true;
  }
};

export default db;
