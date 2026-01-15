const fs = require('fs');
const path = require('path');
const os = require('os');

class StaticSiteBuilder {
  constructor() {
    this.srcDir = './project/src';
    // Use temp folder to avoid OneDrive locking issues, then copy back
    this.distDir = './project/dist';
    this.pagesDir = path.join(this.srcDir, 'html/pages');
    this.partialsDir = path.join(this.srcDir, 'html/partials');
    this.cssDir = path.join(this.srcDir, 'css');
    this.assetsDir = path.join(this.srcDir, 'assets');
  }

  // Leer archivo con encoding UTF-8
  readFile(filePath) {
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.warn(`Warning: Could not read ${filePath}`);
      return '';
    }
  }

  // Motor de includes simple - busca <!-- include partials/nombre.html -->
  processIncludes(content, basePath = '') {
    const includeRegex = /<!-- include\s+(.+?)\s*-->/g;
    
    return content.replace(includeRegex, (match, includePath) => {
      const fullPath = path.join(this.srcDir, 'html', includePath);
      const includeContent = this.readFile(fullPath);
      
      if (includeContent) {
        console.log(`  ✓ Included: ${includePath}`);
        // Procesar includes anidados recursivamente
        return this.processIncludes(includeContent, path.dirname(fullPath));
      } else {
        console.warn(`  ✗ Include not found: ${includePath}`);
        return `<!-- Include not found: ${includePath} -->`;
      }
    });
  }

  // Procesar variables simples {{ variable }}
  processVariables(content, variables = {}) {
    const defaultVars = {
      year: new Date().getFullYear(),
      buildTime: new Date().toISOString(),
      siteName: 'PAPIME - Visualización 3D'
    };
    
    const allVars = { ...defaultVars, ...variables };
    
    return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, varName) => {
      return allVars[varName] || match;
    });
  }

  // Convertir rutas absolutas a relativas para GitHub Pages
  convertToRelativePaths(content) {
    // Convertir href="/..." a href="..."
    content = content.replace(/href="\/([^"]+)"/g, 'href="$1"');
    // Convertir src="/..." a src="..."
    content = content.replace(/src="\/([^"]+)"/g, 'src="$1"');
    return content;
  }

  // Crear directorio si no existe
  ensureDir(dirPath) {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    }
  }

  // Copiar archivos (CSS, assets)
  copyFile(src, dest) {
    this.ensureDir(path.dirname(dest));
    fs.copyFileSync(src, dest);
  }

  // Copiar directorio recursivamente
  copyDir(src, dest) {
    if (!fs.existsSync(src)) return;

    this.ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        this.copyDir(srcPath, destPath);
      } else {
        this.copyFile(srcPath, destPath);
      }
    }
  }

  // Construir páginas HTML
  buildPages() {
    console.log('\\n🏗️  Building HTML pages...');
    
    if (!fs.existsSync(this.pagesDir)) {
      console.error(`Pages directory not found: ${this.pagesDir}`);
      return;
    }

    // Procesar todas las páginas HTML
    const processDirectory = (dir, relativePath = '') => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });

      for (const entry of entries) {
        const srcPath = path.join(dir, entry.name);
        const relativeFilePath = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
          // Procesar subdirectorios (ej: catalogos/)
          processDirectory(srcPath, relativeFilePath);
        } else if (entry.name.endsWith('.html')) {
          console.log(`Processing: ${relativeFilePath}`);
          
          // Leer contenido de la página
          let content = this.readFile(srcPath);
          
          // Procesar includes
          content = this.processIncludes(content);
          
          // Procesar variables
          content = this.processVariables(content, {
            pageName: path.basename(entry.name, '.html'),
            relativePath: relativePath
          });

          // Convertir rutas absolutas a relativas
          content = this.convertToRelativePaths(content);

          // Escribir al directorio dist
          const destPath = path.join(this.distDir, relativeFilePath);
          this.ensureDir(path.dirname(destPath));
          this.safeWriteFile(destPath, content);
          
          console.log(`  ✓ Built: ${destPath}`);
        }
      }
    };

    processDirectory(this.pagesDir);
  }

  // Construir CSS
  buildCSS() {
    console.log('\\n🎨 Copying CSS files...');
    const destCSSDir = path.join(this.distDir, 'css');
    this.copyDir(this.cssDir, destCSSDir);
    console.log(`  ✓ CSS copied to ${destCSSDir}`);
  }

  // Construir assets
  buildAssets() {
    console.log('\\n📁 Copying assets...');
    const destAssetsDir = path.join(this.distDir, 'assets');
    this.copyDir(this.assetsDir, destAssetsDir);
    console.log(`  ✓ Assets copied to ${destAssetsDir}`);
  }

  // Construir data (JSON files)
  buildData() {
    console.log('\\n📊 Copying data files...');
    const srcDataDir = path.join(this.srcDir, 'html/data');
    const destDataDir = path.join(this.distDir, 'data');
    
    if (fs.existsSync(srcDataDir)) {
      this.copyDir(srcDataDir, destDataDir);
      console.log(`  ✓ Data copied to ${destDataDir}`);
    } else {
      console.log(`  ⚠️  No data directory found at ${srcDataDir}`);
    }
  }

  // Limpiar directorio dist
  clean() {
    if (fs.existsSync(this.distDir)) {
      try {
        fs.rmSync(this.distDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 1000 });
        console.log(`🗑️  Cleaned ${this.distDir}`);
      } catch (err) {
        console.log(`⚠️  Could not clean dist folder, trying to overwrite files...`);
      }
    }
  }

  // Write file with retry for OneDrive locked files
  safeWriteFile(filePath, content) {
    try {
      fs.writeFileSync(filePath, content, 'utf8');
      return true;
    } catch (err) {
      // If file is locked, try to delete and recreate
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
      } catch (retryErr) {
        console.log(`  ⚠️  Could not write ${filePath} - file may be locked`);
        return false;
      }
    }
  }

  // Build completo
  build() {
    console.log('🚀 Starting build process...');
    
    this.clean();
    this.ensureDir(this.distDir);
    this.buildPages();
    this.buildCSS();
    this.buildAssets();
    this.buildData();
    
    console.log('\\n✅ Build completed successfully!');
    console.log(`📂 Output: ${this.distDir}`);
  }

  // Watch para desarrollo
  watch() {
    const chokidar = require('chokidar');
    
    console.log('👀 Watching for changes...');
    
    // Build inicial
    this.build();
    
    // Watch archivos
    const watcher = chokidar.watch([
      this.pagesDir,
      this.partialsDir,
      this.cssDir,
      this.assetsDir,
      path.join(this.srcDir, 'html/data')
    ], {
      ignoreInitial: true
    });

    watcher.on('change', (filePath) => {
      console.log(`\\n📝 File changed: ${filePath}`);
      this.build();
    });

    watcher.on('add', (filePath) => {
      console.log(`\\n➕ File added: ${filePath}`);
      this.build();
    });

    watcher.on('unlink', (filePath) => {
      console.log(`\\n🗑️  File deleted: ${filePath}`);
      this.build();
    });
  }
}

// Script principal
function main() {
  const builder = new StaticSiteBuilder();
  const args = process.argv.slice(2);

  if (args.includes('--watch') || args.includes('-w')) {
    builder.watch();
  } else {
    builder.build();
  }
}

// Ejecutar si es el archivo principal
if (require.main === module) {
  main();
}

module.exports = StaticSiteBuilder;