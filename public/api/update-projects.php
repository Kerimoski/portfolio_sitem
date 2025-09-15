<?php
/**
 * Portfolio Projelerini Güncelleme API Endpoint'i
 * Dashboard'dan direkt JSON dosyasını günceller
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// CORS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Sadece POST isteklerini kabul et
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

// JSON verisini al
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['projects']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing projects or password']);
    exit();
}

// Basit şifre kontrolü (environment variable'dan alın)
$correctPassword = getenv('DASHBOARD_PASSWORD') ?: 'kerimoski2024';

if ($input['password'] !== $correctPassword) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid password']);
    exit();
}

try {
    // Projects array'ini al
    $projects = $input['projects'];
    
    if (!is_array($projects)) {
        throw new Exception('Projects must be an array');
    }
    
    // JSON dosyasını güncelle
    $jsonPath = '../data/projects.json';
    
    // data klasörü yoksa oluştur
    $dataDir = dirname($jsonPath);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    // Backup oluştur
    if (file_exists($jsonPath)) {
        $backupPath = $dataDir . '/projects-backup-' . date('Y-m-d-H-i-s') . '.json';
        copy($jsonPath, $backupPath);
    }
    
    // Yeni veriyi yaz
    $result = file_put_contents($jsonPath, json_encode($projects, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    
    if ($result === false) {
        throw new Exception('Failed to write file');
    }
    
    // Başarılı yanıt
    echo json_encode([
        'success' => true,
        'message' => 'Projects updated successfully',
        'count' => count($projects),
        'timestamp' => date('c')
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error: ' . $e->getMessage()
    ]);
}
?> 