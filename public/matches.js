async function loadMatches() {
  const matchesList = document.getElementById('matchesList');
  
  try {
    const response = await fetch('/api/matches');
    const matches = await response.json();
    
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
    
    const matchesGrid = document.createElement('div');
    matchesGrid.className = 'matches-grid';
    
    matches.forEach(match => {
      const rawData = JSON.parse(match.raw_data);
      
      // Corrige o problema de timezone - trata a data como local
      const dateParts = (match.match_date || match.upload_date).split('T')[0].split('-');
      const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
      
      const formattedDate = date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      
      const uploadDate = new Date(match.upload_date);
      const formattedUploadDate = uploadDate.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      
      const card = document.createElement('div');
      card.className = 'match-card';
      card.onclick = () => showMatchDetails(match);
      card.innerHTML = `
        <div class="match-header">
          <div class="match-date">📅 ${formattedDate}</div>
        </div>
        
        <div class="match-score">
          <div class="team">
            <div class="team-name">${match.home_team || 'Time Casa'}</div>
            <div class="score">${match.home_score || 0}</div>
          </div>
          <div class="vs">×</div>
          <div class="team">
            <div class="team-name">${match.away_team || 'Time Visitante'}</div>
            <div class="score">${match.away_score || 0}</div>
          </div>
        </div>
        
        <div class="match-stats">
          ${match.home_shots !== null ? `
            <div class="stat">
              <div class="stat-label">Chutes</div>
              <div class="stat-value">${match.home_shots} × ${match.away_shots}</div>
            </div>
          ` : ''}
          ${rawData.home_possession ? `
            <div class="stat">
              <div class="stat-label">Posse</div>
              <div class="stat-value">${rawData.home_possession}% × ${rawData.away_possession}%</div>
            </div>
          ` : ''}
        </div>
      `;
      
      matchesGrid.appendChild(card);
    });
    
    matchesList.appendChild(matchesGrid);
    
  } catch (error) {
    console.error('Erro ao carregar partidas:', error);
    matchesList.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">❌</div>
        <div class="empty-state-text">Erro ao carregar partidas</div>
      </div>
    `;
  }
}

let currentMatchId = null;

function showMatchDetails(match) {
  currentMatchId = match.id;
  const modal = document.getElementById('matchModal');
  const modalBody = document.getElementById('modalBody');
  const rawData = JSON.parse(match.raw_data);
  
  // Corrige o problema de timezone - trata a data como local
  const dateParts = (match.match_date || match.upload_date).split('T')[0].split('-');
  const matchDate = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  
  const formattedDate = matchDate.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  
  let html = `
    <div class="detail-section">
      <h3>📊 Informações da Partida</h3>
      <div class="detail-grid">
        <div class="detail-item">
          <div class="detail-label">Data da Partida</div>
          <div class="detail-value">${formattedDate}</div>
        </div>
        <div class="detail-item">
          <div class="detail-label">ID da Partida</div>
          <div class="detail-value">#${match.match_id || match.id}</div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>⚽ Placar Final</h3>
      <div class="match-score" style="margin: 20px 0;">
        <div class="team">
          <div class="team-name">${match.home_team || 'Time Casa'}</div>
          <div class="score">${match.home_score || 0}</div>
        </div>
        <div class="vs">×</div>
        <div class="team">
          <div class="team-name">${match.away_team || 'Time Visitante'}</div>
          <div class="score">${match.away_score || 0}</div>
        </div>
      </div>
    </div>

    <div class="detail-section">
      <h3>📈 Estatísticas Gerais</h3>
      <div class="detail-grid">
        ${match.home_shots !== null ? `
          <div class="detail-item">
            <div class="detail-label">Chutes a Gol</div>
            <div class="detail-value highlight">${match.home_shots} × ${match.away_shots}</div>
          </div>
        ` : ''}
        ${rawData.home_possession ? `
          <div class="detail-item">
            <div class="detail-label">Posse de Bola</div>
            <div class="detail-value highlight">${rawData.home_possession}% × ${rawData.away_possession}%</div>
          </div>
        ` : ''}
        ${rawData.shot_accuracy_home !== null && rawData.shot_accuracy_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Precisão de Chutes</div>
            <div class="detail-value highlight">${rawData.shot_accuracy_home || 0}% × ${rawData.shot_accuracy_away || 0}%</div>
          </div>
        ` : ''}
        ${rawData.pass_accuracy_home !== null && rawData.pass_accuracy_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Precisão de Passes</div>
            <div class="detail-value highlight">${rawData.pass_accuracy_home || 0}% × ${rawData.pass_accuracy_away || 0}%</div>
          </div>
        ` : ''}
        ${rawData.dribbles_completed_rate_home !== null && rawData.dribbles_completed_rate_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Taxa de Dribles Completados</div>
            <div class="detail-value highlight">${rawData.dribbles_completed_rate_home || 0}% × ${rawData.dribbles_completed_rate_away || 0}%</div>
          </div>
        ` : ''}
        ${rawData.expected_goals_home !== null && rawData.expected_goals_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Gols Esperados (xG)</div>
            <div class="detail-value highlight">${rawData.expected_goals_home || 0} × ${rawData.expected_goals_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.passes_home !== null && rawData.passes_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Total de Passes</div>
            <div class="detail-value highlight">${rawData.passes_home || 0} × ${rawData.passes_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.ball_recovery_time !== null && rawData.ball_recovery_time !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Tempo de Recuperação de Bola</div>
            <div class="detail-value highlight">${rawData.ball_recovery_time || 0}s</div>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="detail-section">
      <h3>⚔️ Duelos e Defesa</h3>
      <div class="detail-grid">
        ${rawData.duels_won_home !== null && rawData.duels_won_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Duelos Ganhos</div>
            <div class="detail-value highlight">${rawData.duels_won_home || 0} × ${rawData.duels_won_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.duels_lost_home !== null && rawData.duels_lost_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Duelos Perdidos</div>
            <div class="detail-value highlight">${rawData.duels_lost_home || 0} × ${rawData.duels_lost_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.interceptions_home !== null && rawData.interceptions_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Interceptações</div>
            <div class="detail-value highlight">${rawData.interceptions_home || 0} × ${rawData.interceptions_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.blocks_home !== null && rawData.blocks_home !== undefined ? `
          <div class="detail-item">
            <div class="detail-label">Bloqueios</div>
            <div class="detail-value highlight">${rawData.blocks_home || 0} × ${rawData.blocks_away || 0}</div>
          </div>
        ` : ''}
      </div>
    </div>

    <div class="detail-section">
      <h3>⚠️ Disciplina e Infrações</h3>
      <div class="detail-grid">
        ${rawData.fouls_committed_home !== undefined && rawData.fouls_committed_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Faltas Cometidas</div>
            <div class="detail-value highlight">${rawData.fouls_committed_home || 0} × ${rawData.fouls_committed_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.fouls_home !== undefined && rawData.fouls_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Faltas Sofridas</div>
            <div class="detail-value highlight">${rawData.fouls_home || 0} × ${rawData.fouls_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.yellow_cards_home !== undefined && rawData.yellow_cards_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Cartões Amarelos</div>
            <div class="detail-value highlight">${rawData.yellow_cards_home || 0} × ${rawData.yellow_cards_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.offsides_home !== undefined && rawData.offsides_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Impedimentos</div>
            <div class="detail-value highlight">${rawData.offsides_home || 0} × ${rawData.offsides_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.corners_home !== undefined && rawData.corners_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Escanteios</div>
            <div class="detail-value highlight">${rawData.corners_home || 0} × ${rawData.corners_away || 0}</div>
          </div>
        ` : ''}
        ${rawData.penalties_home !== undefined && rawData.penalties_home !== null ? `
          <div class="detail-item">
            <div class="detail-label">Pênaltis</div>
            <div class="detail-value highlight">${rawData.penalties_home || 0} × ${rawData.penalties_away || 0}</div>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Análise da Partida
  if (rawData.match_analysis) {
    html += `
      <div class="detail-section">
        <h3>📝 Análise da Partida</h3>
        <div class="analysis-text">
          ${rawData.match_analysis}
        </div>
      </div>
    `;
  }

  modalBody.innerHTML = html;
  modal.classList.add('show');
}

async function deleteMatch() {
  if (!currentMatchId) return;
  
  if (!confirm('Tem certeza que deseja excluir esta partida? Esta ação não pode ser desfeita.')) {
    return;
  }
  
  try {
    const response = await fetch(`/api/matches/${currentMatchId}`, {
      method: 'DELETE'
    });
    
    const data = await response.json();
    
    if (data.success) {
      closeModal();
      // Recarrega a lista de partidas
      document.getElementById('matchesList').innerHTML = '';
      loadMatches();
    } else {
      alert('Erro ao excluir partida: ' + data.error);
    }
  } catch (error) {
    console.error('Erro ao excluir partida:', error);
    alert('Erro ao excluir partida: ' + error.message);
  }
}

function closeModal() {
  const modal = document.getElementById('matchModal');
  modal.classList.remove('show');
  currentMatchId = null;
}

// Fecha o modal ao clicar fora dele
window.onclick = function(event) {
  const modal = document.getElementById('matchModal');
  if (event.target === modal) {
    closeModal();
  }
}

// Fecha o modal com a tecla ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
});

loadMatches();
