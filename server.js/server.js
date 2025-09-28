const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const { swaggerUi, specs } = require('./swagger');
require('dotenv').config();

 //import des routes
const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/user');
const catwayRoutes = require('../routes/catway');
const reservationRoutes = require('../routes/reservation');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // Pour parser le JSON dans les requêtes
app.use(express.static('public')); // Pour servir les fichiers statiques ( CSS, JS )
app.set('view engine', 'ejs'); // Pour le moteur de template
app.set('views', path.join(__dirname, 'views')); // Dossier des vues

// Connexion à la base de données MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,})
    .then(() => console.log('Connected to MongoDB reussie !'))
    .catch(() => console.log('Connexion à MongoDB echouée !'));

    //Routes des API
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/catways', catwayRoutes);
app.use('/api/catways', reservationRoutes); // Notez ques les reservations sont liees aux catways

// Middleware pour vérifier l'authentification sur les pages protégées
const requireAuth = (req, res, next) => {
    // Ici, nous devrions vérifier le token JWT de manière plus sécurisée
    // Pour simplifier, nous vérifions juste si l'utilisateur est dans la session
    // Nous améliorerons cela plus tard
    next();
};

// Page d'accueil
app.get('/', (req, res) => {
    res.render('pages/index', { message: undefined });
});

// Tableau de bord (protégé)
app.get('/dashboard', requireAuth, (req, res) => {
    // Pour l'instant, nous passons des données mockées
    // Nous récupérerons les vraies données plus tard
    res.render('pages/dashboard', { 
        user: { username: 'Capitainerie' } 
    });
});

//server.js-ajoutez cette route
app.get('/reservations', requireAuth, async (req, res) => {
    try {
        res.render('pages/reservations', {
            user: { username: 'Capitainerie' },
        });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
});

app.get('/users', requireAuth, async (req, res) => {
    try {
        res.render('pages/users', {
            user: { username: 'Capitainerie' },
        });
    } catch (error) {
        console.error(error);
        res.redirect('/dashboard');
    }
});

// Pages CRUD (protégées)
app.get('/catways', requireAuth, (req, res) => {
    res.render('pages/catways', { user: { username: 'Capitainerie' } });
});

app.get('/reservations', requireAuth, (req, res) => {
    res.render('pages/reservations', { user: { username: 'Capitainerie' } });
});

app.get('/users', requireAuth, (req, res) => {
    res.render('pages/users', { user: { username: 'Capitainerie' } });
});

// Page de documentation API
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true,
customCss: 'swagger-ui .topbar { display: none }',
customSiteTitle: 'API port de russell'
}));
app.get('/api-docs', (req, res) => {
    res.render('pages/api-docs');
});

// Route pour la page de documentation
app.get('/api-docs', (req, res) => {
    res.render('pages/api-docs');
});

//Route frontale (pour rendres les pages HTML)
app.get('/', (req, res) => {
  res.render('index'); // cela rendra views/pages/index.ejs
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
    console.log(`Serveur demarré sur le port ${PORT}`)
);