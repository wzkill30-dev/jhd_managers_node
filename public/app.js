const uploadForm = document.getElementById('uploadForm');
const imageInput = document.getElementById('imageInput');
const matchDateInput = document.getElementById('matchDate');
const fileName = document.getElementById('fileName');
const preview = document.getElementById('preview');
const result = document.getElementById('result');

// Define a data atual como padrão (corrigido para timezone local)
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, '0');
const day = String(today.getDate()).padStart(2, '0');
matchDateInput.value = `${year}-${month}-${day}`;

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

uploadForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const file = imageInput.files[0];
  const matchDate = matchDateInput.value;
  
  if (!file) return;
  
  const formData = new FormData();
  formData.append('image', file);
  formData.append('matchDate', matchDate);
  
  result.className = 'loading show';
  result.innerHTML = '⏳ Analisando imagem...';
  
  try {
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    
    if (data.success) {
      result.className = 'show';
      
      let html = '<h3>✅ Dados Extraídos da Imagem</h3>';
      
      // Informações básicas da partida
      html += '<div class="match-info">';
      html += `<h4>📊 Placar</h4>`;
      html += `<p><strong>${data.data.home_team || 'Time Casa'}</strong> ${data.data.home_score || 0} x ${data.data.away_score || 0} <strong>${data.data.away_team || 'Time Visitante'}</strong></p>`;
      html += '</div>';
      
      // Estatísticas gerais
      html += '<div class="stats-grid">';
      if (data.data.home_shots !== undefined) {
        html += `<div class="stat-item"><span>Chutes a Gol:</span> <strong>${data.data.home_shots} x ${data.data.away_shots}</strong></div>`;
      }
      if (data.data.home_possession !== undefined) {
        html += `<div class="stat-item"><span>Posse de Bola:</span> <strong>${data.data.home_possession}% x ${data.data.away_possession}%</strong></div>`;
      }
      html += '</div>';
      
      // Estatísticas adicionais
      if (data.data.additional_stats && Object.keys(data.data.additional_stats).length > 0) {
        html += '<h4>📈 Estatísticas Adicionais</h4>';
        html += '<div class="additional-stats">';
        for (const [key, value] of Object.entries(data.data.additional_stats)) {
          html += `<div class="stat-item"><span>${key}:</span> <strong>${value}</strong></div>`;
        }
        html += '</div>';
      }
      
      // Análise da partida
      if (data.data.match_analysis) {
        html += '<h4>📝 Análise da Partida</h4>';
        html += `<div style="background: #1a1a1a; padding: 15px; border-radius: 8px; color: #FFFFFF; line-height: 1.6; text-align: justify; margin-top: 10px;">${data.data.match_analysis}</div>`;
      }
      
      html += `<p class="match-id">ID da Partida: ${data.matchId}</p>`;
      
      result.innerHTML = html;
    } else {
      throw new Error(data.error);
    }
  } catch (error) {
    result.className = 'show';
    result.innerHTML = `<p style="color: red;">❌ Erro: ${error.message}</p>`;
  }
});
