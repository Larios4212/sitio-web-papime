// Función para generar todas las cards de modelos dinámicamente
function generateModelCards() {
  console.log('🏗️ Generando cards de modelos...');
  
  const container = document.getElementById('models-grid');
  if (!container) {
    console.error('❌ Contenedor de modelos no encontrado');
    return;
  }
  
  // Limpiar contenedor
  container.innerHTML = '';
  
  // Generar card para cada modelo
  Object.values(modelsData).forEach(model => {
    const card = createModelCard(model);
    container.appendChild(card);
  });
  
  console.log(`✅ ${Object.keys(modelsData).length} cards generadas`);
}

function createModelCard(model) {
  // Crear elemento de la card
  const article = document.createElement('article');
  article.className = 'card model-card';
  article.setAttribute('data-category', model.category.toLowerCase().replace(/\s+/g, '-'));
  
  // Mapear categorías a clases CSS
  const categoryMap = {
    'geomorfología': 'geomorfologia',
    'minería': 'mineria', 
    'vulcanología': 'vulcanologia',
    'hidrología': 'hidrologia',
    'geología costera': 'geologia-costera',
    'espeleología': 'espeleologia',
    'limnología': 'limnologia'
  };
  
  const categoryClass = categoryMap[model.category.toLowerCase()] || 'otros';
  article.setAttribute('data-category', categoryClass);
  
  // Generar imagen placeholder
  const imageUrl = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 300 200' fill='%23f1f5f9'><rect width='300' height='200' fill='%23e2e8f0'/><text x='150' y='110' text-anchor='middle' fill='%23475569' font-size='12'>${encodeURIComponent(model.name)}</text></svg>`;
  
  article.innerHTML = `
    <img src="${imageUrl}" alt="Vista previa de ${model.name}" class="model-preview">
    <div class="model-info">
      <h3 class="model-name">${model.name}</h3>
      <span class="chip">${model.category}</span>
      <p>${model.description}</p>
      <div class="model-actions">
        <button class="btn btn-primary view-3d-btn" data-model-id="${model.id}">🔍 Ver en 3D</button>
        <a href="${model.sketchfabUrl}" class="btn btn-ghost" rel="noopener" target="_blank">↗ Sketchfab</a>
      </div>
    </div>
  `;
  
  return article;
}

// Funcionalidad de filtros
function setupFilters() {
  console.log('🔧 Configurando filtros...');
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.getAttribute('data-filter');
      console.log('🔍 Filtro seleccionado:', filter);
      
      // Actualizar botones activos
      document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
      });
      e.target.classList.add('active');
      
      // Filtrar modelos
      filterModels(filter);
    }
  });
}

function filterModels(category) {
  const modelCards = document.querySelectorAll('.model-card');
  
  modelCards.forEach(card => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
      card.classList.remove('hidden');
    } else {
      card.style.display = 'none';  
      card.classList.add('hidden');
    }
  });
  
  console.log(`✅ Filtros aplicados: ${category}`);
}