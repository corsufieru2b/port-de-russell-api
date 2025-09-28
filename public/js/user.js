// public/js/users.js
const userToken = localStorage.getItem('token');
let users = [];

if (!userToken) {
    window.location.href = '/';
}

const apiConfig = {
    headers: {
        'Authorization': `Bearer ${userToken}`,
        'Content-Type': 'application/json'
    }
};

// Charger la liste des utilisateurs
async function loadUsers() {
    try {
        const response = await fetch('/api/users', {
            headers: apiConfig.headers
        });
        
        const data = await response.json();
        
        if (data.success) {
            users = data.data;
            displayUsers();
        } else {
            alert('Erreur lors du chargement: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Afficher les utilisateurs dans le tableau
function displayUsers() {
    const tbody = document.getElementById('usersTableBody');
    tbody.innerHTML = '';

    if (users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Aucun utilisateur trouvé</td></tr>';
        return;
    }

    users.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.email}</td>
            <td>${formatDate(user.createdAt)}</td>
            <td>${formatDate(user.updatedAt)}</td>
            <td>
                <button class="btn btn-sm btn-warning me-2" onclick="editUser('${user.email}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteUser('${user.email}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Formater une date
function formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Vérifier la correspondance des mots de passe
function validatePasswords() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const isEdit = !!document.getElementById('userEmail').value;
    
    // En mode édition, le mot de passe est optionnel
    if (isEdit && !password && !confirmPassword) {
        return true;
    }
    
    // En création ou si un mot de passe est fourni en édition
    if (password !== confirmPassword) {
        document.getElementById('confirmPassword').classList.add('is-invalid');
        return false;
    }
    
    document.getElementById('confirmPassword').classList.remove('is-invalid');
    return true;
}

// Ouvrir le modal pour ajouter un utilisateur
function openAddModal() {
    document.getElementById('userModalTitle').textContent = 'Nouvel Utilisateur';
    document.getElementById('userForm').reset();
    document.getElementById('userEmail').value = '';
    
    // Mode création : mot de passe requis
    document.getElementById('passwordRequired').style.display = 'inline';
    document.getElementById('confirmPasswordRequired').style.display = 'inline';
    document.getElementById('password').required = true;
    document.getElementById('confirmPassword').required = true;
    document.getElementById('passwordHelp').textContent = '6 caractères minimum';
    
    const modal = new bootstrap.Modal(document.getElementById('userModal'));
    modal.show();
}

// Ouvrir le modal pour modifier un utilisateur
function editUser(userEmail) {
    const user = users.find(u => u.email === userEmail);
    
    if (user) {
        document.getElementById('userModalTitle').textContent = 'Modifier l\'Utilisateur';
        document.getElementById('userEmail').value = user.email;
        document.getElementById('username').value = user.username;
        document.getElementById('email').value = user.email;
        
        // Mode édition : mot de passe optionnel
        document.getElementById('passwordRequired').style.display = 'none';
        document.getElementById('confirmPasswordRequired').style.display = 'none';
        document.getElementById('password').required = false;
        document.getElementById('confirmPassword').required = false;
        document.getElementById('passwordHelp').textContent = '6 caractères minimum. Laisser vide pour ne pas modifier.';
        
        // Rendre l'email non modifiable
        document.getElementById('email').readOnly = true;
        
        const modal = new bootstrap.Modal(document.getElementById('userModal'));
        modal.show();
    }
}

// Sauvegarder (créer ou modifier) un utilisateur
async function saveUser() {
    if (!validatePasswords()) {
        alert('Les mots de passe ne correspondent pas.');
        return;
    }

    const formData = {
        username: document.getElementById('username').value,
        email: document.getElementById('email').value
    };

    // Ajouter le mot de passe seulement s'il est fourni
    const password = document.getElementById('password').value;
    if (password) {
        formData.password = password;
    }

    const userEmail = document.getElementById('userEmail').value;
    const isEdit = !!userEmail;

    try {
        const url = isEdit ? `/api/users/${userEmail}` : '/api/users';
        const method = isEdit ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method: method,
            headers: apiConfig.headers,
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            // Fermer le modal et recharger la liste
            bootstrap.Modal.getInstance(document.getElementById('userModal')).hide();
            await loadUsers();
            alert(isEdit ? 'Utilisateur modifié avec succès!' : 'Utilisateur créé avec succès!');
        } else {
            alert('Erreur: ' + data.message);
        }
    } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur de connexion au serveur');
    }
}

// Supprimer un utilisateur
async function deleteUser(userEmail) {
    const user = users.find(u => u.email === userEmail);
    
    if (!user) return;
    
    // Empêcher l'utilisateur de se supprimer lui-même
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser && currentUser.email === userEmail) {
        alert('Vous ne pouvez pas supprimer votre propre compte.');
        return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur "${user.username}" (${userEmail}) ?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${userEmail}`, {
            method: 'DELETE',
            headers: apiConfig.headers
        });

        const data = await response.json();

        if (data.success) {
            await loadUsers();
            alert('Utilisateur supprimé avec succès!');
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
    loadUsers();
    
    // Écouteurs pour la validation des mots de passe
    document.getElementById('password').addEventListener('input', validatePasswords);
    document.getElementById('confirmPassword').addEventListener('input', validatePasswords);
    
    // Gérer l'ouverture du modal d'ajout
    document.querySelector('[data-bs-target="#userModal"]').addEventListener('click', openAddModal);
});