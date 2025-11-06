// Debugging: JavaScript simplificado para visor 3D
console.log('🚀 Cargando model-viewer.js...');

// Cargar datos de modelos
let modelsData = {};

async function loadModelsData() {
  try {
    console.log('📊 Cargando datos de modelos...');
    const response = await fetch('/data/modelos.json');
    const data = await response.json();
    
    // Crear mapa de ID -> datos
    data.models.forEach(model => {
      modelsData[model.id] = model;
    });
    
    console.log('✅ Datos de modelos cargados:', Object.keys(modelsData));
    
    // Generar cards dinámicamente
    generateModelCards();
    
    return true;
  } catch (error) {
    console.error('❌ Error cargando modelos:', error);
    return false;
  }
}

function extractSketchfabId(url) {
  const match = url.match(/\/3d-models\/[^\/]+-([a-f0-9]{32})$/);
  return match ? match[1] : null;
}

// Verificar que el DOM esté cargado
document.addEventListener('DOMContentLoaded', async function() {
  console.log('✅ DOM cargado');
  
  // Verificar si existe el contenedor de modelos
  const container = document.getElementById('models-grid');
  console.log('Contenedor encontrado:', container ? '✅' : '❌');
  
  if (!container) {
    console.error('❌ No se encontró el contenedor models-grid');
    return;
  }
  
  try {
    // Cargar datos de modelos
    await loadModelsData();
    console.log('📊 Modelos disponibles:', Object.keys(modelsData));
    
    // Verificar si existe el modal
    const modal = document.getElementById('model-viewer-modal');
    console.log('Modal encontrado:', modal ? '✅' : '❌');
  } catch (error) {
    console.error('❌ Error en la inicialización:', error);
  }
  
  // Agregar event listener para botones
  document.addEventListener('click', function(e) {
    console.log('🖱️ Click detectado en:', e.target);
    
    if (e.target.classList.contains('view-3d-btn')) {
      e.preventDefault();
      console.log('🎯 Click en botón Ver en 3D');
      
      const modelId = e.target.getAttribute('data-model-id');
      console.log('📋 Model ID:', modelId);
      
      // Buscar datos del modelo
      const modelData = modelsData[modelId];
      if (!modelData) {
        console.error('❌ Modelo no encontrado:', modelId);
        return;
      }
      
      console.log('📄 Datos del modelo:', modelData);
      
      // Extraer ID de Sketchfab
      const sketchfabId = extractSketchfabId(modelData.sketchfabUrl);
      if (!sketchfabId) {
        console.error('❌ No se pudo extraer ID de Sketchfab:', modelData.sketchfabUrl);
        return;
      }
      
      console.log('🔗 Sketchfab ID:', sketchfabId);
      
      // Mostrar modal simple
      const modal = document.getElementById('model-viewer-modal');
      if (modal) {
        modal.style.display = 'flex';
        modal.classList.add('active');
        console.log('✅ Modal mostrado');
        
        // Actualizar título
        const title = document.getElementById('modal-title');
        if (title) {
          title.textContent = modelData.name;
        }
        
        // Configurar enlace a Sketchfab
        const sketchfabLink = document.getElementById('sketchfab-link');
        if (sketchfabLink) {
          sketchfabLink.href = modelData.sketchfabUrl;
        }
        
        // Mostrar loading
        const loadingElement = document.querySelector('.model-loading');
        if (loadingElement) {
          loadingElement.style.display = 'flex';
          console.log('⏳ Mostrando loading...');
        }
        
        // Cargar iframe de Sketchfab
        const iframe = document.getElementById('model-iframe');
        if (iframe) {
          const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=1`;
          iframe.src = embedUrl;
          iframe.style.display = 'none'; // Ocultar hasta que cargue
          
          // Evento cuando el iframe carga
          iframe.onload = function() {
            console.log('✅ Iframe cargado, ocultando loading...');
            if (loadingElement) {
              loadingElement.style.display = 'none';
            }
            iframe.style.display = 'block';
          };
          
          // Timeout de seguridad
          setTimeout(() => {
            console.log('⏰ Timeout: ocultando loading por seguridad');
            if (loadingElement) {
              loadingElement.style.display = 'none';
            }
            iframe.style.display = 'block';
          }, 8000);
          
          console.log('🖼️ Iframe configurado:', embedUrl);
        }
      } else {
        console.error('❌ Modal no encontrado');
      }
    }
  });
  
  // Event listener para cerrar modal
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-close') || e.target.classList.contains('modal-backdrop')) {
      console.log('❌ Cerrando modal');
      const modal = document.getElementById('model-viewer-modal');
      if (modal) {
        modal.style.display = 'none';
        modal.classList.remove('active');
        
        // Limpiar iframe y mostrar loading para la próxima vez
        const iframe = document.getElementById('model-iframe');
        const loadingElement = document.querySelector('.model-loading');
        if (iframe) {
          iframe.src = '';
          iframe.style.display = 'none';
        }
        if (loadingElement) {
          loadingElement.style.display = 'flex';
        }
      }
    }
  });
  
  // Cerrar con tecla Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      console.log('⌨️ Escape presionado');
      const modal = document.getElementById('model-viewer-modal');
      if (modal && modal.classList.contains('active')) {
        modal.style.display = 'none';
        modal.classList.remove('active');
      }
    }
  });
  
  // Configurar filtros
  setupFilters();
  
  console.log('🎉 Event listeners configurados');
  
  // Timeout para mostrar fallback si JavaScript falla
  setTimeout(() => {
    const container = document.getElementById('models-grid');
    const loadingDiv = container.querySelector('.loading-models');
    
    if (loadingDiv && loadingDiv.style.display !== 'none') {
      console.log('⚠️ Mostrando cards estáticas como fallback');
      loadingDiv.style.display = 'none';
      const fallbackCard = document.getElementById('fallback-cards');
      if (fallbackCard) {
        fallbackCard.style.display = 'block';
      }
    }
  }, 3000);
});

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
  
  // Verificar si tenemos datos
  if (!modelsData || Object.keys(modelsData).length === 0) {
    console.error('❌ No hay datos de modelos disponibles');
    container.innerHTML = '<p>No se pudieron cargar los modelos. Revisa la consola para más detalles.</p>';
    return;
  }
  
  // Generar card para cada modelo
  try {
    Object.values(modelsData).forEach((model, index) => {
      console.log(`🏗️ Generando card ${index + 1}:`, model.name);
      const card = createSimpleModelCard(model);
      container.appendChild(card);
    });
    
    console.log(`✅ ${Object.keys(modelsData).length} cards generadas`);
  } catch (error) {
    console.error('❌ Error generando cards:', error);
    container.innerHTML = '<p>Error generando las cards de modelos.</p>';
  }
}

function createModelCard(model) {
  console.log('🎨 Creando card para:', model);
  
  // Crear elemento de la card
  const article = document.createElement('article');
  article.className = 'card model-card';
  
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
  
  // Usar siempre SVG personalizado como vista previa
  const imageUrl = generateModelPreviewSVG(model);
  console.log('🖼️ Imagen generada:', imageUrl.substring(0, 100) + '...');
  
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
  
  // Verificar que existen los botones de filtro
  const filterButtons = document.querySelectorAll('.filter-btn');
  console.log(`🎛️ Encontrados ${filterButtons.length} botones de filtro`);
  
  filterButtons.forEach(btn => {
    console.log(`🔘 Botón: "${btn.textContent}" - data-filter: "${btn.getAttribute('data-filter')}"`);
  });
  
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('filter-btn')) {
      const filter = e.target.getAttribute('data-filter');
      console.log('🎯 Filtro clickeado:', filter, 'por botón:', e.target.textContent);
      
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
  let visibleCount = 0;
  
  console.log(`🔍 Aplicando filtro: ${category}`);
  
  modelCards.forEach(card => {
    const cardCategory = card.dataset.category;
    console.log(`📋 Card categoría: ${cardCategory}`);
    
    if (category === 'all' || cardCategory === category) {
      card.style.display = '';
      card.classList.remove('hidden');
      visibleCount++;
      
      // Animar aparición
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, visibleCount * 50);
      
    } else {
      card.style.display = 'none';  
      card.classList.add('hidden');
    }
  });
  
  console.log(`✅ Filtros aplicados: ${category} - ${visibleCount} modelos visibles`);
}

// Generar SVG de vista previa simple
function generateModelPreviewSVG(model) {
  const categoryColors = {
    'Geomorfología': '#22c55e',
    'Minería': '#f59e0b', 
    'Vulcanología': '#ef4444',
    'Hidrología': '#3b82f6',
    'Geología Costera': '#14b8a6',
    'Espeleología': '#64748b',
    'Limnología': '#0ea5e9'
  };
  
  const color = categoryColors[model.category] || '#64748b';
  const shortName = model.name.length > 25 ? model.name.substring(0, 22) + '...' : model.name;
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200">
    <rect width="300" height="200" fill="#f1f5f9"/>
    <rect width="300" height="60" fill="${color}" opacity="0.1"/>
    <circle cx="150" cy="80" r="20" fill="${color}" opacity="0.2"/>
    <text x="150" y="85" text-anchor="middle" font-size="16" fill="${color}">🏔️</text>
    <text x="150" y="120" text-anchor="middle" font-size="12" font-weight="bold" fill="#1f2937">${shortName}</text>
    <text x="150" y="140" text-anchor="middle" font-size="10" fill="${color}">${model.category}</text>
    <rect x="10" y="10" width="25" height="12" rx="6" fill="${color}"/>
    <text x="22.5" y="18" text-anchor="middle" font-size="7" fill="white">3D</text>
  </svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Función simple para crear cards con vista previa 3D real
function createSimpleModelCard(model) {
  const article = document.createElement('article');
  article.className = 'card model-card';
  
  // Mapear correctamente las categorías
  const categoryMap = {
    'Geomorfología': 'geomorfologia',
    'Minería': 'mineria', 
    'Vulcanología': 'vulcanologia',
    'Hidrología': 'hidrologia',
    'Geología Costera': 'geologia-costera',
    'Espeleología': 'espeleologia',
    'Limnología': 'limnologia'
  };
  
  const categoryClass = categoryMap[model.category] || 'otros';
  article.setAttribute('data-category', categoryClass);
  console.log(`🏷️ Card creada con categoría: ${model.category} -> ${categoryClass}`);
  
  // Extraer ID de Sketchfab para thumbnail
  const sketchfabId = extractSketchfabId(model.sketchfabUrl);
  
  // Crear vista previa embebida de Sketchfab
  const previewContent = sketchfabId ? 
    `<div class="model-preview-container" style="position: relative;">
      <iframe 
        src="https://sketchfab.com/models/${sketchfabId}/embed?ui_controls=0&ui_infos=0&ui_inspector=0&ui_watermark=0&ui_stop=0&ui_animations=0&ui_annotations=0&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_sound=0&preload=1&autostart=1&camera=0" 
        width="100%" 
        height="220" 
        frameborder="0" 
        allow="autoplay; fullscreen; xr-spatial-tracking" 
        xr-spatial-tracking 
        execution-while-out-of-viewport 
        execution-while-not-rendered 
        web-share
        style="border-bottom: 1px solid #e2e8f0;"
        loading="lazy">
      </iframe>
      <div class="model-3d-badge" style="position: absolute; top: 8px; right: 8px; background: rgba(0,0,0,0.7); color: white; padding: 4px 8px; border-radius: 4px; font-size: 0.75rem; font-weight: 600;">
        🔮 3D
      </div>
    </div>` :
    `<div style="width: 100%; height: 220px; background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%); display: flex; flex-direction: column; align-items: center; justify-content: center; border-bottom: 1px solid #e2e8f0;">
      <div style="font-size: 2rem; margin-bottom: 8px;">🏔️</div>
      <div style="font-size: 0.875rem; font-weight: 600; color: #1f2937; text-align: center; padding: 0 16px;">${model.name}</div>
      <div style="font-size: 0.75rem; color: #64748b; margin-top: 4px;">${model.category}</div>
    </div>`;
  
  article.innerHTML = `
    ${previewContent}
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

console.log('📝 Script model-viewer.js cargado completamente');