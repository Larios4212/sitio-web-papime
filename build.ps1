# build.ps1 - Motor de includes simple en PowerShell
param(
    [switch]$Watch = $false
)

$srcDir = "project/src"
$distDir = "project/dist"
$pagesDir = "$srcDir/html/pages"
$partialsDir = "$srcDir/html/partials"
$cssDir = "$srcDir/css"
$assetsDir = "$srcDir/assets"

function Write-Log {
    param([string]$message, [string]$color = "White")
    Write-Host $message -ForegroundColor $color
}

function Get-PartialContent {
    param([string]$partialPath, [string]$basePath)
    
    $fullPath = Join-Path $srcDir "html/$partialPath"
    if (Test-Path $fullPath) {
        Write-Log "  ✓ Included: $partialPath" -color Green
        return Get-Content $fullPath -Raw -Encoding UTF8
    } else {
        Write-Log "  ✗ Partial not found: $partialPath" -color Red
        return "<!-- Partial not found: $partialPath -->"
    }
}

function Process-Includes {
    param([string]$content)
    
    # Buscar includes: <!-- include partials/nombre.html -->
    $pattern = '<!-- include\s+(.+?)\s*-->'
    
    while ($content -match $pattern) {
        $matches = [regex]::Matches($content, $pattern)
        foreach ($match in $matches) {
            $includePath = $match.Groups[1].Value
            $partialContent = Get-PartialContent -partialPath $includePath
            $content = $content -replace [regex]::Escape($match.Value), $partialContent
        }
    }
    
    return $content
}

function Process-Variables {
    param([string]$content, [hashtable]$variables = @{})
    
    $defaultVars = @{
        'year' = (Get-Date).Year
        'buildTime' = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ssZ')
        'siteName' = 'PAPIME - Visualización 3D'
    }
    
    # Combinar variables por defecto con las específicas
    $allVars = $defaultVars + $variables
    
    foreach ($var in $allVars.GetEnumerator()) {
        $pattern = "\{\{\s*$($var.Key)\s*\}\}"
        $content = $content -replace $pattern, $var.Value
    }
    
    return $content
}

function Build-Pages {
    Write-Log "`n🏗️  Building HTML pages..." -color Cyan
    
    if (!(Test-Path $pagesDir)) {
        Write-Log "Pages directory not found: $pagesDir" -color Red
        return
    }

    # Crear directorio dist si no existe
    if (!(Test-Path $distDir)) {
        New-Item -Path $distDir -ItemType Directory -Force | Out-Null
    }

    # Procesar todas las páginas HTML
    Get-ChildItem -Path $pagesDir -Recurse -Filter "*.html" | ForEach-Object {
        $relativePath = $_.FullName.Substring((Get-Item $pagesDir).FullName.Length + 1)
        Write-Log "Processing: $relativePath" -color Yellow
        
        # Leer contenido
        $content = Get-Content $_.FullName -Raw -Encoding UTF8
        
        # Procesar includes
        $content = Process-Includes -content $content
        
        # Procesar variables
        $pageName = [System.IO.Path]::GetFileNameWithoutExtension($_.Name)
        $variables = @{
            'pageName' = $pageName
        }
        $content = Process-Variables -content $content -variables $variables
        
        # Crear directorio de destino si no existe
        $destPath = Join-Path $distDir $relativePath
        $destDir = Split-Path $destPath -Parent
        if (!(Test-Path $destDir)) {
            New-Item -Path $destDir -ItemType Directory -Force | Out-Null
        }
        
        # Escribir archivo procesado
        $content | Set-Content -Path $destPath -Encoding UTF8
        Write-Log "  ✓ Built: $destPath" -color Green
    }
}

function Copy-Directory {
    param([string]$source, [string]$destination)
    
    if (Test-Path $source) {
        if (!(Test-Path $destination)) {
            New-Item -Path $destination -ItemType Directory -Force | Out-Null
        }
        Copy-Item -Path "$source/*" -Destination $destination -Recurse -Force
        Write-Log "  ✓ Copied: $source -> $destination" -color Green
    }
}

function Build-CSS {
    Write-Log "`n🎨 Copying CSS files..." -color Cyan
    $destCSS = Join-Path $distDir "css"
    Copy-Directory -source $cssDir -destination $destCSS
}

function Build-Assets {
    Write-Log "`n📁 Copying assets..." -color Cyan
    $destAssets = Join-Path $distDir "assets"
    Copy-Directory -source $assetsDir -destination $destAssets
}

function Clean-Dist {
    if (Test-Path $distDir) {
        Remove-Item -Path $distDir -Recurse -Force
        Write-Log "🗑️  Cleaned $distDir" -color Yellow
    }
}

function Build-All {
    Write-Log "🚀 Starting build process..." -color Cyan
    
    Clean-Dist
    Build-Pages
    Build-CSS
    Build-Assets
    
    Write-Log "`n✅ Build completed successfully!" -color Green
    Write-Log "📂 Output: $distDir" -color White
    Write-Log "💡 You can now run: start project/dist/index.html" -color Yellow
}

# Ejecutar build
if ($Watch) {
    Write-Log "👀 Watch mode not implemented in PowerShell version" -color Yellow
    Write-Log "💡 Install Node.js and use 'npm run build --watch' for watch mode" -color Yellow
}

Build-All