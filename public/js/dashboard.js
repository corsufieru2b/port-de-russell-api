// public/js/dashboard.js
if (typeof token === 'undefined') {
    var token = localStorage.getItem('token');
}

if (!token) {
    window.location.href = '/';
}

// Configuration pour les appels API
const apiConfig = {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

// Afficher la date du jour
function displayCurrentDate() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDate').textContent = 
        now.toLocaleDateString('fr-FR', options);
}

// Afficher les informations utilisateur
function displayUserInfo() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        document.getElementById('userEmail').textContent = user.email;
    }
}

// Fonction utilitaire pour les appels API
async function apiCall(url, options = {}) {
    const defaultOptions = {
        headers: apiConfig.headers
    };
    
    const finalOptions = { ...defaultOptions, ...options };
    const response = await fetch(url, finalOptions);
    return await response.json();
}

// Calculer les jours restants
function getDaysRemaining(endDate) {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
}

// Formater une date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
}

// Charger les statistiques
async function loadStats() {
    try {
        const [catwaysData, usersData, allReservations] = await Promise.all([
            apiCall('/api/catways'),
            apiCall('/api/users'),
            apiCall('/api/catways/1/reservations') // On prend toutes les réservations du catway 1 pour l'exemple
        ]);

        // Mettre à jour les compteurs
        document.getElementById('catwaysCount').textContent = catwaysData.count || 0;
        document.getElementById('usersCount').textContent = usersData.count || 0;
        document.getElementById('reservationsCount').textContent = allReservations.count || 0;

        // Calculer les réservations en cours
        const now = new Date();
        const activeReservations = allReservations.data.filter(reservation => {
            const startDate = new Date(reservation.startDate);
            const endDate = new Date(reservation.endDate);
            return startDate <= now && endDate >= now;
        });

        document.getElementById('activeReservationsCount').textContent = activeReservations.length;

        // Afficher les réservations en cours
        displayActiveReservations(activeReservations);

    } catch (error) {
        console.error('Erreur lors du chargement des stats:', error);
        document.getElementById('currentReservationsBody').innerHTML = 
            '<tr><td colspan="6" class="text-center text-danger">Erreur lors du chargement des réservations</td></tr>';
    }
}

// Afficher les réservations en cours
function displayActiveReservations(reservations) {
    const tbody = document.getElementById('currentReservationsBody');
    
    if (reservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">Aucune réservation en cours</td></tr>';
        return;
    }

    tbody.innerHTML = reservations.map(reservation => `
        <tr>
            <td>
                <span class="badge bg-primary">${reservation.catwayNumber}</span>
            </td>
            <td>${reservation.clientName}</td>
            <td>${reservation.boatName}</td>
            <td>${formatDate(reservation.startDate)}</td>
            <td>${formatDate(reservation.endDate)}</td>
            <td>
                <span class="badge ${getDaysRemaining(reservation.endDate) <= 2 ? 'bg-warning' : 'bg-success'}">
                    ${getDaysRemaining(reservation.endDate)} jour(s)
                </span>
            </td>
        </tr>
    `).join('');
}

// Fonction de déconnexion
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    displayCurrentDate();
    displayUserInfo();
    loadStats();
});