/**
 * Script pour corriger les données incorrectes dans les posts
 * Corrige le problème du double deux-points dans movieId
 */

require('dotenv').config();
const mongoose = require('mongoose');
const Post = require('../models/postModel');

async function fixPostsData() {
    try {
        // Connexion à MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB connecté');

        // Chercher les posts avec double deux-points dans movieId
        const posts = await Post.find({});
        let fixedCount = 0;

        for (const post of posts) {
            let needsUpdate = false;

            // Corriger le movieId si contient ::
            if (post.movieId && post.movieId.includes('::')) {
                console.log(`❌ Post ${post._id} a un movieId incorrect: ${post.movieId}`);
                post.movieId = post.movieId.replace('::', ':');
                needsUpdate = true;
            }

            if (needsUpdate) {
                await post.save();
                fixedCount++;
                console.log(`✅ Post ${post._id} corrigé`);
            }
        }

        console.log(`\n✅ Processus terminé: ${fixedCount} posts corrigés sur ${posts.length} posts totaux`);
        
        // Fermer la connexion
        await mongoose.connection.close();
        console.log('🔌 Connexion MongoDB fermée');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

// Exécuter le script
fixPostsData();
