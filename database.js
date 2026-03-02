import admin from 'firebase-admin';
import { readFileSync } from 'fs';

// Inicializa o Firebase Admin
let db;

try {
  // Tenta carregar as credenciais do Firebase
  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || './firebase-credentials.json';
  const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  db = admin.firestore();
  console.log('✓ Firestore conectado com sucesso');
} catch (error) {
  console.error('✗ Erro ao conectar ao Firestore:', error.message);
  console.error('Configure o arquivo firebase-credentials.json ou a variável FIREBASE_SERVICE_ACCOUNT_PATH');
  process.exit(1);
}

const matchesCollection = db.collection('matches');
const countersCollection = db.collection('counters');

// Função para obter o próximo ID incremental
async function getNextMatchId() {
  const counterDoc = countersCollection.doc('match_counter');
  
  try {
    const result = await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(counterDoc);
      
      let newId;
      if (!doc.exists) {
        // Primeira partida - inicializa o contador
        newId = 1;
        transaction.set(counterDoc, { current_id: newId });
      } else {
        // Incrementa o contador
        newId = doc.data().current_id + 1;
        transaction.update(counterDoc, { current_id: newId });
      }
      
      return newId;
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao obter próximo ID:', error);
    throw new Error('Erro ao gerar ID da partida');
  }
}

const database = {
  async insertMatch(matchData, matchDate) {
    try {
      // Obtém o próximo ID incremental
      console.log('Obtendo próximo match_id...');
      const matchId = await getNextMatchId();
      console.log('Match ID gerado:', matchId);
      
      const newMatch = {
        match_id: matchId,
        match_date: matchDate,
        upload_date: admin.firestore.FieldValue.serverTimestamp(),
        home_team: matchData.home_team || '',
        away_team: matchData.away_team || '',
        home_score: matchData.home_score || 0,
        away_score: matchData.away_score || 0,
        home_shots: matchData.home_shots || 0,
        away_shots: matchData.away_shots || 0,
        home_possession: matchData.home_possession || 0,
        away_possession: matchData.away_possession || 0,
        dribbles_completed_rate_home: matchData.dribbles_completed_rate_home || 0,
        dribbles_completed_rate_away: matchData.dribbles_completed_rate_away || 0,
        shot_accuracy_home: matchData.shot_accuracy_home || 0,
        shot_accuracy_away: matchData.shot_accuracy_away || 0,
        pass_accuracy_home: matchData.pass_accuracy_home || 0,
        pass_accuracy_away: matchData.pass_accuracy_away || 0,
        ball_recovery_time: matchData.ball_recovery_time || 0,
        expected_goals_home: matchData.expected_goals_home || 0,
        expected_goals_away: matchData.expected_goals_away || 0,
        passes_home: matchData.passes_home || 0,
        passes_away: matchData.passes_away || 0,
        duels_won_home: matchData.duels_won_home || 0,
        duels_won_away: matchData.duels_won_away || 0,
        duels_lost_home: matchData.duels_lost_home || 0,
        duels_lost_away: matchData.duels_lost_away || 0,
        interceptions_home: matchData.interceptions_home || 0,
        interceptions_away: matchData.interceptions_away || 0,
        blocks_home: matchData.blocks_home || 0,
        blocks_away: matchData.blocks_away || 0,
        fouls_committed_home: matchData.fouls_committed_home || 0,
        fouls_committed_away: matchData.fouls_committed_away || 0,
        offsides_home: matchData.offsides_home || 0,
        offsides_away: matchData.offsides_away || 0,
        corners_home: matchData.corners_home || 0,
        corners_away: matchData.corners_away || 0,
        fouls_home: matchData.fouls_home || 0,
        fouls_away: matchData.fouls_away || 0,
        penalties_home: matchData.penalties_home || 0,
        penalties_away: matchData.penalties_away || 0,
        yellow_cards_home: matchData.yellow_cards_home || 0,
        yellow_cards_away: matchData.yellow_cards_away || 0,
        match_analysis: matchData.match_analysis || '',
        raw_data: JSON.stringify(matchData)
      };
      
      console.log('Salvando partida com match_id:', matchId);
      const docRef = await matchesCollection.add(newMatch);
      console.log('Partida salva com sucesso. Firestore ID:', docRef.id, 'Match ID:', matchId);
      
      return {
        firestoreId: docRef.id,
        matchId: matchId
      };
    } catch (error) {
      console.error('Erro ao inserir partida:', error);
      throw error;
    }
  },
  
  async getAllMatches() {
    const snapshot = await matchesCollection
      .orderBy('match_date', 'desc')
      .get();
    
    const matches = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      // Converte Timestamp do Firestore para ISO string
      if (data.upload_date && data.upload_date.toDate) {
        data.upload_date = data.upload_date.toDate().toISOString();
      }
      matches.push({
        id: doc.id,
        ...data
      });
    });
    
    // Ordena por upload_date em memória (mais recente primeiro)
    matches.sort((a, b) => {
      const dateA = new Date(a.upload_date);
      const dateB = new Date(b.upload_date);
      return dateB - dateA;
    });
    
    return matches;
  },
  
  async getMatchById(id) {
    if (!id) {
      return null;
    }
    
    const doc = await matchesCollection.doc(id).get();
    
    if (!doc.exists) {
      return null;
    }
    
    const data = doc.data();
    // Converte Timestamp do Firestore para ISO string
    if (data.upload_date && data.upload_date.toDate) {
      data.upload_date = data.upload_date.toDate().toISOString();
    }
    
    return {
      id: doc.id,
      ...data
    };
  },
  
  async deleteMatch(matchId) {
    if (!matchId) {
      throw new Error('ID da partida é obrigatório');
    }
    
    await matchesCollection.doc(matchId).delete();
    return true;
  }
};

export default database;
