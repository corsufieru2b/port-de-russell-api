// public/js/reservations.js
// Use existing 'token' if already declared elsewhere, otherwise declare it here
if (typeof token === 'undefined') {
    var token = localStorage.getItem('token');
}
let reservations = [];
let catways = [];

if (!token) {
    window.location.href = '/';
}

const apiConfig = {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
};

// Charger les données initiales
async function loadInitialData() {
    try {
        const [catwaysResponse, reservationsResponse] = await Promise.all([
            fetch('/api/catways', { headers: apiConfig.headers }),
            fetchAllReservations()
        ]);

        const catwaysData = await catwaysResponse.json();
        if (catwaysData.success) {
            catways = catwaysData.data;
            populateCatwayFilters();
        }

        if (reservationsResponse.success) {
            reservations = reservationsResponse.data;
            displayReservations();
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Récupérer toutes les réservations (tous les catways)
async function fetchAllReservations() {
    try {
        // Pour simplifier, on récupère les réservations du premier catway
        // Dans une vraie app, il faudrait une route pour toutes les réservations
        const response = await fetch('/api/catways/1/reservations', {
            headers: apiConfig.headers
        });
        return await response.json();
    } catch (error) {
        console.error('Erreur:', error);
        return { success: false, data: [] };
    }
}

// Peupler les filtres de catways
function populateCatwayFilters() {
    const filterSelect = document.getElementById('filterCatway');
    const modalSelect = document.getElementById('catwayNumber');
    
    const options = catways.map(catway => 
        <option value="${catway.catwayNumber}">Catway ${catway.catwayNumber} (${catway.catwayType})</option>
    ).join('');
    
    filterSelect.innerHTML = '<option value="">Tous les catways</option>' + options;
    modalSelect.innerHTML = '<option value="">Choisir un catway</option>' + options;
}

// Afficher les réservations dans le tableau
function displayReservations(filteredReservations = reservations) {
    const tbody = document.getElementById('reservationsTableBody');
    tbody.innerHTML = '';

    if (filteredReservations.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center">Aucune réservation trouvée</td></tr>';
        return;
    }

    filteredReservations.forEach(reservation => {
        const status = getReservationStatus(reservation);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>
                <span class="badge bg-primary">${reservation.catwayNumber}</span>
            </td>
            <td>${reservation.clientName}</td>
            <td>${reservation.boatName}</td>
            <td>${formatDate(reservation.startDate)}</td>
            <td>${formatDate(reservation.endDate)}</td>
            <td>${getStatusBadge(status)}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editReservation('${reservation._id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteReservation('${reservation._id}', '${reservation.catwayNumber}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Déterminer le statut d'une réservation
function getReservationStatus(reservation) {
    const now = new Date();
    const start = new Date(reservation.startDate);
    const end = new Date(reservation.endDate);
    
    if (now < start) return 'future';
    if (now > end) return 'past';
    return 'active';
}

// Générer le badge de statut
function getStatusBadge(status) {
    const badges = {
        'active': '<span class="badge bg-success">En cours</span>',
        'future': '<span class="badge bg-info">À venir</span>',
        'past': '<span class="badge bg-secondary">Terminée</span>'
    };
    return badges[status] || '';
}

// Formater une date
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}

// Appliquer les filtres
function applyFilters() {
    const catwayFilter = document.getElementById('filterCatway').value;
    const statusFilter = document.getElementById('filterStatus').value;
    
    let filtered = reservations;
    
    if (catwayFilter) {
        filtered = filtered.filter(r => r.catwayNumber === catwayFilter);
    }
    
    if (statusFilter) {
        filtered = filtered.filter(r => getReservationStatus(r) === statusFilter);
    }
    
    displayReservations(filtered);
}

// Réinitialiser les filtres
function resetFilters() {
    document.getElementById('filterCatway').value = '';
    document.getElementById('filterStatus').value = '';
    displayReservations();
}

// Ouvrir le modal pour ajouter une réservation
function openAddModal() {
    document.getElementById('reservationModalTitle').textContent = 'Nouvelle Réservation';
    document.getElementById('reservationForm').reset();
    document.getElementById('reservationId').value = '';
    document.getElementById('durationDisplay').textContent = '--';
    
    const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
    modal.show();
}

// Calculer et afficher la durée
function updateDuration() {
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById('durationDisplay').textContent = `${diffDays} jour(s)`;
    }
}

// Éditer une réservation
async function editReservation(reservationId) {
    const reservation = reservations.find(r => r._id === reservationId);
    
    if (reservation) {
        document.getElementById('reservationModalTitle').textContent = 'Modifier la Réservation';
        document.getElementById('reservationId').value = reservation._id;
        document.getElementById('catwayNumber').value = reservation.catwayNumber;
        document.getElementById('clientName').value = reservation.clientName;
        document.getElementById('boatName').value = reservation.boatName;
        document.getElementById('startDate').value = reservation.startDate.split('T')[0];
        document.getElementById('endDate').value = reservation.endDate.split('T')[0];
        
        updateDuration();
        
        const modal = new bootstrap.Modal(document.getElementById('reservationModal'));
        modal.show();
    }
}

// Sauvegarder une réservation
async function saveReservation() {
    const formData = {
        catwayNumber: document.getElementById('catwayNumber').value,
        clientName: document.getElementById('clientName').value,
        boatName: document.getElementById('boatName').value,
        startDate: document.getElementById('startDate').value,
        endDate: document.getElementById('endDate').value
    };

    const reservationId = document.getElementById('reservationId').value;
    const isEdit = !!reservationId;
    const catwayNumber = formData.catwayNumber;

    try {
        const url = isEdit 
            ? `/api/catways/${catwayNumber}/reservations/${reservationId}`
            : `/api/catways/${catwayNumber}/reservations`;
        
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: apiConfig.headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            bootstrap.Modal.getInstance(document.getElementById('reservationModal')).hide();
            await loadInitialData(); // Recharger les données
            alert(isEdit ? 'Réservation modifiée avec succès!' : 'Réservation créée avec succès!');
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Supprimer une réservation
async function deleteReservation(reservationId, catwayNumber) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette réservation ?')) {
        return;
    }

    try {
        const response = await fetch(`/api/catways/${catwayNumber}/reservations/${reservationId}`, {
            method: 'DELETE',
            headers: apiConfig.headers
        });

        const data = await response.json();

        if (data.success) {
            await loadInitialData();
            alert('Réservation supprimée avec succès!');
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Au chargement de la page
document.addEventListener('DOMContentLoaded', function() {
    loadInitialData();
    
    // Écouteurs d'événements pour les dates
    document.getElementById('startDate').addEventListener('change', updateDuration);
    document.getElementById('endDate').addEventListener('change', updateDuration);
    
    // Gérer l'ouverture du modal d'ajout
    document.querySelector('[data-bs-target="#reservationModal"]').addEventListener('click', openAddModal);
});