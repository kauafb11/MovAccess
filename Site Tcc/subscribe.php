<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

// Somente POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Método não permitido']);
    exit;
}

// Coleta e validação básica
$name = isset($_POST['name']) ? trim($_POST['name']) : '';
$email = isset($_POST['email']) ? trim($_POST['email']) : '';

if ($name === '' || $email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Dados inválidos']);
    exit;
}

// Configuração de e-mail
$to = 'contato@movaccess.com.br'; // e-mail institucional da MovAccess
$subject = 'Nova inscrição nas atualizações (Site MovAccess)';
$message = "Nova inscrição:\n\nNome: {$name}\nE-mail: {$email}\nData/Hora: " . date('Y-m-d H:i:s');
$headers = "From: notificacoes@movaccess.com.br\r\n" .
           "Reply-To: {$email}\r\n" .
           "Content-Type: text/plain; charset=UTF-8\r\n";

$mailSent = @mail($to, $subject, $message, $headers);

// Salvar localmente (CSV) para campanhas futuras (opcional)
try {
    $csvLine = sprintf("%s,%s,%s\n", date('Y-m-d H:i:s'), str_replace(["\n","\r",","], ' ', $name), $email);
    @file_put_contents(__DIR__ . '/inscricoes.csv', $csvLine, FILE_APPEND | LOCK_EX);
} catch (Exception $e) { /* silencioso */ }

if ($mailSent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Falha ao enviar e-mail']);
}
?>

