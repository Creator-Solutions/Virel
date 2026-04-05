# Virel Release Build

## Prerequisites

- PHP 8.2+
- Composer
- Node.js 20+

## Steps

### 1. Install dependencies

```bash
composer install --no-dev --optimize-autoloader
npm ci && npm run build
```

### 2. Generate install.sql

Run all migrations against a clean database and export the schema:

```bash
php artisan migrate:fresh
mysqldump -u root -p --no-data virel_db > database/install.sql
```

Or use a migration SQL export package if available.

### 3. Build the zip

```bash
zip -r virel-VERSION.zip . \
  --exclude=".git/*" \
  --exclude="node_modules/*" \
  --exclude=".env" \
  --exclude="tests/*" \
  --exclude="*.test.*" \
  --exclude=".installed"
```

### 4. Upload to GitHub Releases

Attach `virel-VERSION.zip` to the GitHub release for the tag.

## Post-Install Notes

After extracting the zip on shared hosting:

1. Create a MySQL database
2. Visit `https://your-domain.com/install.php`
3. Follow the installation wizard
4. The installer will self-delete after successful installation
