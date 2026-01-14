/**
 * Visualizador 3D para modelos de Sketchfab
 * Maneja la apertura del modal, carga de iframes y controles
 */

class ModelViewer {
  constructor() {
    this.modal = null;
    this.iframe = null;
    this.currentModelId = null;
    this.modelsData = {};
    
    this.init();
  }

  async init() {
    // Cargar datos de modelos
    await this.loadModelsData();
    
    // Configurar elementos del DOM
    this.setupDOM();
    
    // Configurar event listeners
    this.setupEventListeners();
  }

  async loadModelsData() {
    try {
      const response = await fetch('/data/modelos.json');
      const data = await response.json();
      
      // Crear un mapa de ID -> datos del modelo para fácil acceso
      data.models.forEach(modelo => {
        this.modelsData[modelo.id] = modelo;
      });
    } catch (error) {
      console.error('Error cargando los datos del modelo:', error);
    }
  }

  setupDOM() {
    this.modal = document.getElementById('model-viewer-modal');
    this.iframe = document.getElementById('model-iframe');
    this.loadingElement = document.querySelector('.model-loading');
    this.modalTitle = document.getElementById('modal-title');
    this.sketchfabLink = document.getElementById('sketchfab-link');
  }

  setupEventListeners() {
    // Botones "Ver en 3D" en las tarjetas
    document.addEventListener('click', (e) => {
      if (e.target.matches('.view-3d-btn') || e.target.closest('.view-3d-btn')) {
        e.preventDefault();
        const btn = e.target.closest('.view-3d-btn');
        const modelId = btn.dataset.modelId;
        this.openModel(modelId);
      }
    });

    // Cerrar modal
    document.addEventListener('click', (e) => {
      if (e.target.matches('.modal-close') || e.target.matches('.modal-backdrop')) {
        this.closeModal();
      }
    });

    // Tecla Escape para cerrar
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.closeModal();
      }
    });

    // Botón de pantalla completa
    document.getElementById('fullscreen-btn')?.addEventListener('click', () => {
      this.toggleFullscreen();
    });

    // Botón compartir
    document.getElementById('share-btn')?.addEventListener('click', () => {
      this.shareModel();
    });
  }

  openModel(modelId) {
    const modelData = this.modelsData[modelId];
    if (!modelData) {
      console.error('Modelo no encontrado:', modelId);
      return;
    }

    // Extraer ID de Sketchfab de la URL
    const sketchfabId = this.extractSketchfabId(modelData.url);
    if (!sketchfabId) {
      console.error('No se pudo extraer ID de Sketchfab de:', modelData.url);
      return;
    }

    this.currentModelId = modelId;
    
    // Actualizar título del modal
    this.modalTitle.textContent = modelData.name;
    
    // Configurar enlace a Sketchfab
    this.sketchfabLink.href = modelData.sketchfabUrl;
    
    // Mostrar loading
    this.showLoading();
    
    // Configurar iframe embebido
    const embedUrl = `https://sketchfab.com/models/${sketchfabId}/embed?autostart=1&ui_controls=1&ui_infos=1&ui_inspector=1&ui_stop=1&ui_watermark=1`;
    
    this.iframe.src = embedUrl;
    
    // Mostrar modal
    this.showModal();
    
    // Configurar evento de carga del iframe
    this.iframe.onload = () => {
      this.hideLoading();
      this.iframe.classList.add('loaded');
    };

    // Timeout de seguridad para ocultar loading
    setTimeout(() => {
      this.hideLoading();
      this.iframe.classList.add('loaded');
    }, 5000);
  }

  extractSketchfabId(url) {
    // Extraer ID de URLs como: https://sketchfab.com/3d-models/nombre-modelo-{ID}
    const match = url.match(/\/3d-models\/[^\/]+-([a-f0-9]{32})$/);
    return match ? match[1] : null;
  }

  showModal() {
    document.body.style.overflow = 'hidden';
    this.modal.classList.add('active');
    this.modal.setAttribute('aria-hidden', 'false');
  }

  closeModal() {
    document.body.style.overflow = '';
    this.modal.classList.remove('active');
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Limpiar iframe
    setTimeout(() => {
      this.iframe.src = '';
      this.iframe.classList.remove('loaded');
      this.showLoading();
    }, 300);
  }

  showLoading() {
    this.loadingElement.classList.remove('hidden');
  }

  hideLoading() {
    this.loadingElement.classList.add('hidden');
  }

  toggleFullscreen() {
    if (this.iframe.requestFullscreen) {
      this.iframe.requestFullscreen();
    } else if (this.iframe.webkitRequestFullscreen) {
      this.iframe.webkitRequestFullscreen();
    } else if (this.iframe.msRequestFullscreen) {
      this.iframe.msRequestFullscreen();
    }
  }

  shareModel() {
    if (this.currentModelId && this.modelsData[this.currentModelId]) {
      const modelData = this.modelsData[this.currentModelId];
      const shareData = {
        title: `Modelo 3D: ${modelData.name}`,
        text: `Explora este modelo 3D de ${modelData.description}`,
        url: window.location.href
      };

      if (navigator.share) {
        navigator.share(shareData);
      } else {
        // Fallback: copiar al portapapeles
        navigator.clipboard.writeText(
          `${shareData.title}\n${shareData.text}\n${shareData.url}`
        ).then(() => {
          alert('Información del modelo copiada al portapapeles');
        });
      }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  new ModelViewer();
});

// Sistema de filtros para los modelos
class ModelFilters {
  constructor() {
    this.init();
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    document.addEventListener('click', (e) => {
      if (e.target.matches('.filter-btn')) {
        this.handleFilterClick(e.target);
      }
    });
  }

  handleFilterClick(button) {
    const filter = button.dataset.filter;
    
    // Actualizar botones activos
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    button.classList.add('active');

    // Filtrar modelos
    this.filterModels(filter);
  }

  filterModels(category) {
    const modelCards = document.querySelectorAll('.model-card');
    
    modelCards.forEach(card => {
      if (category === 'all' || card.dataset.category === category) {
        card.classList.remove('hidden');
        card.style.display = '';
      } else {
        card.classList.add('hidden');
        card.style.display = 'none';
      }
    });

    // Animar la aparición de los modelos filtrados
    this.animateFilteredModels();
  }

  animateFilteredModels() {
    const visibleCards = document.querySelectorAll('.model-card:not(.hidden)');
    
    visibleCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, index * 50);
    });
  }
}

// Inicializar filtros
document.addEventListener('DOMContentLoaded', () => {
  new ModelFilters();
});