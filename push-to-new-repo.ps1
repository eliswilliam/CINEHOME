# Script pour pousser le code vers le nouveau depot GitHub
# Repository: https://github.com/eliswilliam/cinehome1

Write-Host "Deploiement vers le nouveau depot GitHub..." -ForegroundColor Cyan
Write-Host ""

# Verifier si git est initialise
if (-not (Test-Path ".git")) {
    Write-Host "Initialisation de Git..." -ForegroundColor Yellow
    git init
}

# Ajouter tous les fichiers
Write-Host "Ajout des fichiers..." -ForegroundColor Yellow
git add .

# Creer un commit
Write-Host "Creation du commit..." -ForegroundColor Yellow
$commitMessage = "Migration vers Vercel - Mise a jour des URLs"
git commit -m $commitMessage

# Verifier si le remote existe deja
$remoteExists = git remote | Select-String -Pattern "origin" -Quiet

if ($remoteExists) {
    Write-Host "Mise a jour du remote origin..." -ForegroundColor Yellow
    git remote set-url origin https://github.com/eliswilliam/cinehome1.git
} else {
    Write-Host "Ajout du remote origin..." -ForegroundColor Yellow
    git remote add origin https://github.com/eliswilliam/cinehome1.git
}

# Pousser vers le nouveau depot
Write-Host "Push vers GitHub..." -ForegroundColor Yellow
Write-Host ""

# Essayer de push (peut necessiter une authentification)
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploiement reussi!" -ForegroundColor Green
    Write-Host "Nouveau depot: https://github.com/eliswilliam/cinehome1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "Si vous avez une erreur d'authentification, configurez vos credentials GitHub" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Script termine!" -ForegroundColor Green
