/**
 * Script de vérification de configuration - CINEMAF
 * Vérifie que tous les fichiers utilisent les bonnes URLs
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification de la configuration de production...\n');

// Fichiers à vérifier
const filesToCheck = [
    {
        path: './public/config.js',
        shouldContain: 'https://cinemaf.onrender.com',
        description: 'Configuration principale'
    },
    {
        path: './public/user-reviews.js',
        shouldContain: 'https://cinemaf.onrender.com/api/reviews',
        description: 'Système de reviews'
    },
    {
        path: './public/test-reviews.html',
        shouldContain: 'https://cinemaf.onrender.com/api/reviews',
        description: 'Page de test'
    }
];

let allChecksPass = true;

filesToCheck.forEach(file => {
    try {
        const content = fs.readFileSync(file.path, 'utf8');
        const hasCorrectUrl = content.includes(file.shouldContain);
        
        if (hasCorrectUrl) {
            console.log(`✅ ${file.description}`);
            console.log(`   Fichier: ${file.path}`);
            console.log(`   URL: ${file.shouldContain}\n`);
        } else {
            console.log(`❌ ${file.description}`);
            console.log(`   Fichier: ${file.path}`);
            console.log(`   URL attendue: ${file.shouldContain}`);
            console.log(`   ⚠️  URL de production non trouvée!\n`);
            allChecksPass = false;
        }
    } catch (error) {
        console.log(`❌ Erreur lors de la lecture de ${file.path}`);
        console.log(`   ${error.message}\n`);
        allChecksPass = false;
    }
});

// Vérification du .env
console.log('\n📋 Vérification des variables d\'environnement...');
try {
    const envContent = fs.readFileSync('./.env', 'utf8');
    const requiredVars = ['MONGO_URI', 'PORT', 'EMAIL_USER'];
    
    requiredVars.forEach(varName => {
        if (envContent.includes(varName)) {
            console.log(`✅ ${varName} configuré`);
        } else {
            console.log(`⚠️  ${varName} non trouvé dans .env`);
        }
    });
} catch (error) {
    console.log('⚠️  Fichier .env non trouvé ou inaccessible');
}

// Résumé
console.log('\n' + '='.repeat(50));
if (allChecksPass) {
    console.log('✅ TOUTES LES VÉRIFICATIONS SONT PASSÉES!');
    console.log('🚀 Votre application est prête pour la production!');
    console.log('\nPour déployer sur Render:');
    console.log('  git add .');
    console.log('  git commit -m "Configuration production"');
    console.log('  git push origin main');
} else {
    console.log('❌ CERTAINES VÉRIFICATIONS ONT ÉCHOUÉ');
    console.log('⚠️  Veuillez corriger les problèmes ci-dessus');
}
console.log('='.repeat(50) + '\n');

console.log('📝 URLs de votre application:');
console.log('  Local:      http://localhost:3001');
console.log('  Production: https://cinemaf.onrender.com');
console.log('');
