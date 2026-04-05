<?php

declare(strict_types=1);

if (file_exists(__DIR__.'/../.env') && file_exists(__DIR__.'/../.installed')) {
    header('Location: /login');
    exit;
}

$protocol = (! empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? 'https' : 'http';
$host = $_SERVER['HTTP_HOST'] ?? 'localhost';
$virelUrl = rtrim($protocol.'://'.$host, '/');
$basePath = dirname(__DIR__);

$errors = [];
$formData = [
    'db_host' => 'localhost',
    'db_port' => '3306',
    'db_name' => '',
    'db_user' => 'root',
    'db_pass' => '',
    'admin_name' => '',
    'admin_email' => '',
    'admin_password' => '',
    'admin_password_confirm' => '',
];

function generateUlid(): string
{
    $timeMs = (int) (microtime(true) * 1000);
    $timeHex = str_pad(dechex($timeMs), 12, '0', STR_PAD_LEFT);
    $randomBytes = random_bytes(10);
    $randomHex = bin2hex($randomBytes);
    $raw = $timeHex.$randomHex;
    $encoded = base32Encode(hex2bin($raw));

    return strtoupper(substr($encoded, 0, 26));
}

function base32Encode(string $data): string
{
    $alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    $binary = '';
    foreach (str_split($data) as $char) {
        $binary .= str_pad(decbin(ord($char)), 8, '0', STR_PAD_LEFT);
    }
    $result = '';
    foreach (str_split(str_pad($binary, (int) (ceil(strlen($binary) / 5) * 5), '0'), 5) as $chunk) {
        $result .= $alphabet[bindec($chunk)];
    }

    return $result;
}

function sanitize(string $value): string
{
    return trim(htmlspecialchars($value, ENT_QUOTES, 'UTF-8'));
}

function validateDbConnection(string $host, string $port, string $db, string $user, string $pass): PDO
{
    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
    $pdo = new PDO($dsn, $user, $pass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);

    return $pdo;
}

function runSqlFile(PDO $pdo, string $sqlPath): void
{
    if (! file_exists($sqlPath)) {
        throw new RuntimeException("install.sql not found at: {$sqlPath}");
    }
    $sql = file_get_contents($sqlPath);
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        fn ($s) => ! empty($s) && ! str_starts_with($s, '--')
    );
    foreach ($statements as $statement) {
        $pdo->exec($statement);
    }
}

function createAdminUser(PDO $pdo, string $name, string $email, string $password): void
{
    $id = generateUlid();
    $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare(
        "INSERT INTO users (id, name, email, password, role, is_github_account, notify_deployment_success, notify_deployment_failure, created_at, updated_at)
         VALUES (:id, :name, :email, :password, 'pm', 0, 0, 0, :created_at, :updated_at)"
    );
    $stmt->execute([
        ':id' => $id,
        ':name' => $name,
        ':email' => $email,
        ':password' => $hash,
        ':created_at' => $now,
        ':updated_at' => $now,
    ]);
}

function seedSettings(PDO $pdo, string $virelUrl): void
{
    $now = date('Y-m-d H:i:s');
    $stmt = $pdo->prepare(
        "INSERT INTO settings (`key`, value, created_at, updated_at)
         VALUES ('virel_url', :url, :created_at, :updated_at)
         ON DUPLICATE KEY UPDATE value = :url2, updated_at = :updated_at2"
    );
    $stmt->execute([
        ':url' => $virelUrl,
        ':created_at' => $now,
        ':updated_at' => $now,
        ':url2' => $virelUrl,
        ':updated_at2' => $now,
    ]);
}

function writeEnvFile(string $basePath, string $virelUrl, string $dbHost, string $dbPort, string $dbName, string $dbUser, string $dbPass): void
{
    $examplePath = $basePath.'/.env.example';
    $envPath = $basePath.'/.env';
    if (! file_exists($examplePath)) {
        throw new RuntimeException('.env.example not found.');
    }
    $appKey = 'base64:'.base64_encode(random_bytes(32));
    $env = file_get_contents($examplePath);
    $replacements = [
        '/^APP_KEY=.*$/m' => 'APP_KEY='.$appKey,
        '/^APP_URL=.*$/m' => 'APP_URL='.$virelUrl,
        '/^APP_ENV=.*$/m' => 'APP_ENV=production',
        '/^APP_DEBUG=.*$/m' => 'APP_DEBUG=false',
        '/^DB_HOST=.*$/m' => 'DB_HOST='.$dbHost,
        '/^DB_PORT=.*$/m' => 'DB_PORT='.$dbPort,
        '/^DB_DATABASE=.*$/m' => 'DB_DATABASE='.$dbName,
        '/^DB_USERNAME=.*$/m' => 'DB_USERNAME='.$dbUser,
        '/^DB_PASSWORD=.*$/m' => 'DB_PASSWORD='.$dbPass,
    ];
    foreach ($replacements as $pattern => $replacement) {
        $env = preg_replace($pattern, $replacement, $env);
    }
    file_put_contents($envPath, $env);
}

function finalise(string $basePath): void
{
    $storagePublic = $basePath.'/public/storage';
    $storageTarget = $basePath.'/storage/app/public';
    if (! file_exists($storagePublic) && is_dir($storageTarget)) {
        @symlink($storageTarget, $storagePublic);
    }
    @chmod($basePath.'/storage', 0775);
    @chmod($basePath.'/bootstrap/cache', 0775);
    file_put_contents($basePath.'/.installed', date('Y-m-d H:i:s'));
    @unlink(__FILE__);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $formData = [
        'db_host' => sanitize($_POST['db_host'] ?? 'localhost'),
        'db_port' => sanitize($_POST['db_port'] ?? '3306'),
        'db_name' => sanitize($_POST['db_name'] ?? ''),
        'db_user' => sanitize($_POST['db_user'] ?? 'root'),
        'db_pass' => $_POST['db_pass'] ?? '',
        'admin_name' => sanitize($_POST['admin_name'] ?? ''),
        'admin_email' => sanitize($_POST['admin_email'] ?? ''),
        'admin_password' => $_POST['admin_password'] ?? '',
        'admin_password_confirm' => $_POST['admin_password_confirm'] ?? '',
    ];

    if (empty($formData['db_host'])) {
        $errors[] = 'DB Host is required.';
    }
    if (empty($formData['db_port'])) {
        $errors[] = 'DB Port is required.';
    }
    if (empty($formData['db_name'])) {
        $errors[] = 'DB Name is required.';
    }
    if (empty($formData['db_user'])) {
        $errors[] = 'DB Username is required.';
    }
    if (! is_numeric($formData['db_port']) || $formData['db_port'] < 1 || $formData['db_port'] > 65535) {
        $errors[] = 'DB Port must be a number between 1 and 65535.';
    }
    if (empty($formData['admin_name'])) {
        $errors[] = 'Full Name is required.';
    }
    if (empty($formData['admin_email'])) {
        $errors[] = 'Email is required.';
    }
    if (! filter_var($formData['admin_email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Invalid email format.';
    }
    if (strlen($formData['admin_password']) < 8) {
        $errors[] = 'Password must be at least 8 characters.';
    }
    if ($formData['admin_password'] !== $formData['admin_password_confirm']) {
        $errors[] = 'Passwords do not match.';
    }

    if (empty($errors)) {
        try {
            $pdo = validateDbConnection(
                $formData['db_host'],
                $formData['db_port'],
                $formData['db_name'],
                $formData['db_user'],
                $formData['db_pass']
            );
            runSqlFile($pdo, $basePath.'/database/install.sql');
            createAdminUser($pdo, $formData['admin_name'], $formData['admin_email'], $formData['admin_password']);
            seedSettings($pdo, $virelUrl);
            writeEnvFile(
                $basePath,
                $virelUrl,
                $formData['db_host'],
                $formData['db_port'],
                $formData['db_name'],
                $formData['db_user'],
                $formData['db_pass']
            );
            finalise($basePath);
            $success = true;
        } catch (Throwable $e) {
            $errors[] = $e->getMessage();
        }
    }
}
?><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Install Virel</title>
    <style>
        :root {
            --bg: #0f1117;
            --surface: #1a1d27;
            --border: #2a2d3a;
            --text: #e2e8f0;
            --text-secondary: #94a3b8;
            --accent: #6366f1;
            --accent-hover: #818cf8;
            --error: #ef4444;
            --success: #22c55e;
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: var(--bg);
            color: var(--text);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 32px;
            width: 100%;
            max-width: 480px;
        }
        h1 {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 8px;
        }
        .subtitle {
            color: var(--text-secondary);
            margin-bottom: 24px;
        }
        .section {
            margin-bottom: 24px;
        }
        .section-title {
            font-size: 14px;
            font-weight: 600;
            color: var(--text-secondary);
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 16px;
        }
        .form-group {
            margin-bottom: 16px;
        }
        label {
            display: block;
            font-size: 14px;
            margin-bottom: 6px;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"],
        input[type="number"] {
            width: 100%;
            padding: 10px 12px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text);
            font-size: 14px;
        }
        input:focus {
            outline: none;
            border-color: var(--accent);
        }
        .row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        .btn {
            width: 100%;
            padding: 12px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s;
        }
        .btn:hover {
            background: var(--accent-hover);
        }
        .btn-secondary {
            background: var(--border);
            margin-top: 12px;
        }
        .btn-secondary:hover {
            background: #3a3d4a;
        }
        .error-list {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid var(--error);
            border-radius: 6px;
            padding: 12px;
            margin-bottom: 20px;
        }
        .error-list li {
            color: var(--error);
            font-size: 14px;
            list-style: none;
        }
        .success-screen {
            text-align: center;
        }
        .success-icon {
            width: 64px;
            height: 64px;
            background: rgba(34, 197, 94, 0.1);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
        }
        .success-icon svg {
            width: 32px;
            height: 32px;
            color: var(--success);
        }
    </style>
</head>
<body>
    <div class="card">
        <?php if (isset($success)) { ?>
            <div class="success-screen">
                <div class="success-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h1>Virel Installed Successfully</h1>
                <p class="subtitle">Redirecting to login in 3 seconds...</p>
            </div>
            <meta http-equiv="refresh" content="3;url=/login">
        <?php } else { ?>
            <h1>Install Virel</h1>
            <p class="subtitle">Set up your CI/CD platform</p>
            <?php if (! empty($errors)) { ?>
                <div class="error-list">
                    <?php foreach ($errors as $error) { ?>
                        <li><?= htmlspecialchars($error) ?></li>
                    <?php } ?>
                </div>
            <?php } ?>
            <form method="POST">
                <div class="section">
                    <div class="section-title">Database</div>
                    <div class="form-group">
                        <label for="db_host">DB Host</label>
                        <input type="text" id="db_host" name="db_host" value="<?= htmlspecialchars($formData['db_host']) ?>" required>
                    </div>
                    <div class="row">
                        <div class="form-group">
                            <label for="db_port">DB Port</label>
                            <input type="number" id="db_port" name="db_port" value="<?= htmlspecialchars($formData['db_port']) ?>" required>
                        </div>
                        <div class="form-group">
                            <label for="db_name">DB Name</label>
                            <input type="text" id="db_name" name="db_name" value="<?= htmlspecialchars($formData['db_name']) ?>" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="db_user">DB Username</label>
                        <input type="text" id="db_user" name="db_user" value="<?= htmlspecialchars($formData['db_user']) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="db_pass">DB Password</label>
                        <input type="password" id="db_pass" name="db_pass">
                    </div>
                </div>
                <div class="section">
                    <div class="section-title">Admin Account</div>
                    <div class="form-group">
                        <label for="admin_name">Full Name</label>
                        <input type="text" id="admin_name" name="admin_name" value="<?= htmlspecialchars($formData['admin_name']) ?>" required>
                    </div>
                    <div class="form-group">
                        <label for="admin_email">Email Address</label>
                        <input type="email" id="admin_email" name="admin_email" value="<?= htmlspecialchars($formData['admin_email']) ?>" required>
                    </div>
                    <div class="row">
                        <div class="form-group">
                            <label for="admin_password">Password</label>
                            <input type="password" id="admin_password" name="admin_password" minlength="8" required>
                        </div>
                        <div class="form-group">
                            <label for="admin_password_confirm">Confirm Password</label>
                            <input type="password" id="admin_password_confirm" name="admin_password_confirm" minlength="8" required>
                        </div>
                    </div>
                </div>
                <button type="submit" class="btn">Install Virel</button>
            </form>
        <?php } ?>
    </div>
</body>
</html>
