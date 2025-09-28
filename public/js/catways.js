// public/js/catways.js
var token = localStorage.getItem('token');
let catways = [];

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

// Charger la liste des catways
async function loadCatways() {
    try {
        const response = await fetch('/api/catways', {
            headers: apiConfig.headers
        });
        
        const data = await response.json();
        
        if (data.success) {
            catways = data.data;
            displayCatways();
        } else {
            alert('Erreur lors du chargement: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Afficher les catways dans le tableau
function displayCatways() {
    const tbody = document.getElementById('catwaysTableBody');
    tbody.innerHTML = '';

    if (catways.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center">Aucun catway trouvé</td></tr>';
        return;
    }

    catways.forEach(catway => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${catway.catwayNumber}</td>
            <td>
                <span class="badge ${catway.catwayType === 'long' ? 'bg-primary' : 'bg-info'}">
                    ${catway.catwayType}
                </span>
            </td>
            <td>${catway.catwayState}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editCatway('${catway.catwayNumber}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteCatway('${catway.catwayNumber}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Ouvrir le modal pour ajouter un catway
function openAddModal() {
    document.getElementById('catwayModalTitle').textContent = 'Ajouter un Catway';
    document.getElementById('catwayForm').reset();
    document.getElementById('catwayId').value = '';
    
    const modal = new bootstrap.Modal(document.getElementById('catwayModal'));
    modal.show();
}

// Ouvrir le modal pour modifier un catway
function editCatway(catwayNumber) {
    const catway = catways.find(c => c.catwayNumber === catwayNumber);
    
    if (catway) {
        document.getElementById('catwayModalTitle').textContent = 'Modifier le Catway';
        document.getElementById('catwayId').value = catway.catwayNumber;
        document.getElementById('catwayNumber').value = catway.catwayNumber;
        document.getElementById('catwayType').value = catway.catwayType;
        document.getElementById('catwayState').value = catway.catwayState;
        
        // Rendre le numéro non modifiable en édition
        document.getElementById('catwayNumber').readOnly = true;
        
        const modal = new bootstrap.Modal(document.getElementById('catwayModal'));
        modal.show();
    }
}

// Sauvegarder (créer ou modifier) un catway
async function saveCatway() {
    const formData = {
        catwayNumber: document.getElementById('catwayNumber').value,
        catwayType: document.getElementById('catwayType').value,
        catwayState: document.getElementById('catwayState').value
    };

    const catwayNumber = document.getElementById('catwayId').value;
    const isEdit = !!catwayNumber;

    try {
        const url = isEdit ? `/api/catways/${catwayNumber}` : '/api/catways';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: apiConfig.headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Fermer le modal et recharger la liste
            bootstrap.Modal.getInstance(document.getElementById('catwayModal')).hide();
            await loadCatways();
            alert(isEdit ? 'Catway modifié avec succès!' : 'Catway créé avec succès!');
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Supprimer un catway
async function deleteCatway(catwayNumber) {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le catway ${catwayNumber} ?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/catways/${catwayNumber}`, {
            method: 'DELETE',
            headers: apiConfig.headers
        });

        const data = await response.json();

        if (data.success) {
            await loadCatways();
            alert('Catway supprimé avec succès!');
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
    loadCatways();
    
    // Gérer l'ouverture du modal d'ajout
    document.querySelector('[data-bs-target="#catwayModal"]').addEventListener('click', openAddModal);
});