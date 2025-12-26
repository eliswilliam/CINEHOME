# 🚀 Script de démarrage du serveur CINEHOME
# Ce script garde le serveur en cours d'exécution

Clear-Host

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "║              🎬 SERVEUR CINEHOME 🎬                      ║" -ForegroundColor Cyan
Write-Host "║                                                          ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📍 Adresse du serveur  : " -NoNewline -ForegroundColor Yellow
Write-Host "http://localhost:10000" -ForegroundColor White
Write-Host "🧠 Système de mémoire  : " -NoNewline -ForegroundColor Yellow
Write-Host "ACTIF ✅" -ForegroundColor Green
Write-Host "🔒 Filtro TMDB         : " -NoNewline -ForegroundColor Yellow
Write-Host "ACTIF ✅" -ForegroundColor Green
Write-Host "💾 Base de données     : " -NoNewline -ForegroundColor Yellow
Write-Host "MongoDB Atlas" -ForegroundColor White

Write-Host "`n" -NoNewline
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  ⚠️  IMPORTANT: NE FERMEZ PAS CETTE FENÊTRE! ⚠️          ║" -ForegroundColor Red
Write-Host "║                                                          ║" -ForegroundColor Red
Write-Host "║  Pour arrêter le serveur, appuyez sur Ctrl+C            ║" -ForegroundColor Red
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

Write-Host "🔄 Démarrage du serveur en cours..." -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Changer vers le répertoire du backend
Set-Location -Path $PSScriptRoot

# Fonction pour relancer le serveur en cas d'erreur
$restartCount = 0
$maxRestarts = 5

while ($true) {
    try {
        # Démarrer Node.js
        node app.js
        
        # Si on arrive ici, c'est que le serveur s'est arrêté normalement
        Write-Host "`n✅ Serveur arrêté normalement." -ForegroundColor Yellow
        break
        
    } catch {
        $restartCount++
        
        if ($restartCount -ge $maxRestarts) {
            Write-Host "`n❌ Trop de redémarrages. Arrêt du script." -ForegroundColor Red
            Write-Host "   Vérifiez les logs pour plus d'informations." -ForegroundColor Yellow
            break
        }
        
        Write-Host "`n⚠️  Erreur détectée. Redémarrage... ($restartCount/$maxRestarts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 3
    }
}

Write-Host "`nAppuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
