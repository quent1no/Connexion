document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault(); // Empêche la soumission du formulaire

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === 'Quentin' && password === 'Coucou') {
        // Redirection vers la page de succès
        window.location.href = 'success.html';
    } else {
        document.getElementById('error-message').style.display = 'block';
        document.getElementById('error-message').textContent = 'Utilisateur ou mot de passe incorrect.';
    }
});