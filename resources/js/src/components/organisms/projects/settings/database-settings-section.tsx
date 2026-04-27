import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle2, Upload, Database, Play, Loader2 } from 'lucide-react';

import { TextInput } from '@/src/components/atoms/text-input';
import { FormLabel } from '@/src/components/atoms/form-label';
import { FormError } from '@/src/components/atoms/form-error';
import { SectionDivider } from '@/src/components/atoms/section-divider';
import { Button } from '@/src/components/atoms/button';
import { environmentService } from '@/domains/environment/environment.service';

interface DatabaseSettingsSectionProps {
  projectId: string;
}

const REQUIRED_VARS = [
  { key: 'DB_NAME', label: 'Database Name', placeholder: 'your_database_name' },
  { key: 'DB_USER', label: 'Database User', placeholder: 'your_database_user' },
  { key: 'DB_PASSWORD', label: 'Database Password', placeholder: 'your_password', isPassword: true },
  { key: 'DB_HOST', label: 'Database Host', placeholder: 'localhost' },
  { key: 'DB_PREFIX', label: 'Table Prefix', placeholder: 'wp_' },
];

function DatabaseSettingsSection({ projectId }: DatabaseSettingsSectionProps) {
  const [envVars, setEnvVars] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const [sqlFile, setSqlFile] = useState<File | null>(null);
  const [sqlUploaded, setSqlUploaded] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadVars();
    checkSqlFile();
  }, [projectId]);

  const loadVars = async () => {
    try {
      const vars = await environmentService.getEnvVars(projectId);
      const varMap: Record<string, string> = {};
      vars.forEach((v) => {
        varMap[v.key] = v.value;
      });
      setEnvVars(varMap);
    } catch (error) {
      console.error('Failed to load env vars:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSqlFile = async () => {
    try {
      const status = await environmentService.getSqlFileStatus(projectId);
      setSqlUploaded(status.uploaded);
    } catch (error) {
      console.error('Failed to check SQL file:', error);
    }
  };

  const handleChange = (key: string, value: string) => {
    setEnvVars((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setErrors({});
    setMessage(null);

    try {
      for (const { key } of REQUIRED_VARS) {
        const value = envVars[key] || '';
        if (value) {
          await environmentService.createEnvVar(projectId, { key, value });
        }
      }
      setMessage('Database configuration saved successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to save';
      setErrors({ _general: msg });
    } finally {
      setSaving(false);
    }
  };

  const handleSqlFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.sql')) {
        setErrors({ _sql: 'Please select a .sql file' });
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setErrors({ _sql: 'File must be less than 50MB' });
        return;
      }
      setSqlFile(file);
      setSqlUploaded(true);
      setErrors({});
    }
  };

  const handleUploadSql = async () => {
    if (!sqlFile) return;

    setUploading(true);
    setErrors({});

    try {
      await environmentService.uploadSqlFile(projectId, sqlFile);
      setSqlFile(null);
      setMessage('SQL file uploaded successfully');
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to upload SQL file';
      setErrors({ _sql: msg });
    } finally {
      setUploading(false);
    }
  };

  const handleImportDatabase = async () => {
    if (!confirm('Are you sure you want to import the database? This will run the SQL file against your database.')) {
      return;
    }

    setImporting(true);
    setImportMessage(null);
    setErrors({});

    try {
      await environmentService.importDatabase(projectId);
      setImportMessage('Database imported successfully!');
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Failed to import database';
      setErrors({ _import: msg });
    } finally {
      setImporting(false);
    }
  };

  const missing = REQUIRED_VARS.filter(({ key }) => !envVars[key]);
  const isComplete = missing.length === 0;

  return (
    <SectionDivider heading="Database Configuration">
      <div className="mb-4 rounded-md border border-blue-500/30 bg-blue-500/10 p-4">
        <div className="flex items-center gap-3">
          {isComplete ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-green-400" />
          ) : (
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-400" />
          )}
          <p className="text-sm text-blue-200">
            {isComplete
              ? 'Database credentials configured. Deployments can proceed.'
              : `${missing.length} required credential(s) missing. Deployments will be blocked until configured.`}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-sm text-virel-textMuted">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REQUIRED_VARS.map(({ key, label, placeholder, isPassword }) => (
            <div key={key}>
              <FormLabel htmlFor={key} className="mb-1 block">
                {label}
              </FormLabel>
              <TextInput
                id={key}
                name={key}
                type={isPassword ? 'password' : 'text'}
                value={envVars[key] || ''}
                onChange={(e) => handleChange(key, e.target.value)}
                placeholder={placeholder}
              />
              <FormError message={errors[key]} />
            </div>
          ))}
        </div>
      )}

      {errors._general && (
        <div className="mt-4 rounded-md bg-red-500/10 p-3">
          <p className="text-sm text-red-400">{errors._general}</p>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-md bg-green-500/10 p-3">
          <p className="text-sm text-green-400">{message}</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={handleSave} disabled={saving} variant="default">
          {saving ? 'Saving...' : 'Save Database Configuration'}
        </Button>
      </div>

      <div className="mt-8 border-t border-virel-border pt-6">
        <div className="mb-4 flex items-center gap-2">
          <Database className="h-5 w-5 text-virel-textSecondary" />
          <h3 className="text-lg font-medium text-virel-text">Database Import</h3>
        </div>

        <div className="mb-4 rounded-md border border-virel-border bg-virel-surface p-4">
          <p className="mb-4 text-sm text-virel-textSecondary">
            Upload a SQL dump file to import your WordPress database. The SQL file will be imported after a deployment
            completes.
          </p>

          <input ref={fileInputRef} type="file" accept=".sql" onChange={handleSqlFileChange} className="hidden" />

          <div className="flex items-center gap-4">
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2"
            >
              <Upload className="h-4 w-4" />
              {sqlFile ? sqlFile.name : 'Select SQL File'}
            </Button>

            {sqlFile && <span className="text-sm text-virel-textMuted">({(sqlFile.size / 1024).toFixed(1)} KB)</span>}

            {sqlFile && (
              <Button onClick={handleUploadSql} disabled={uploading} variant="default">
                {uploading ? 'Uploading...' : 'Upload SQL'}
              </Button>
            )}

            {sqlUploaded && !sqlFile && <span className="text-sm text-green-400">SQL file ready</span>}
          </div>

          <FormError message={errors._sql} />

          {sqlUploaded && (
            <div className="mt-4 flex items-center gap-2">
              <Button
                onClick={handleImportDatabase}
                disabled={importing}
                variant="default"
                className="flex items-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Import Database
                  </>
                )}
              </Button>
              <span className="text-sm text-virel-textMuted">Import SQL to your database</span>
            </div>
          )}

          {importMessage && (
            <div className="mt-4 rounded-md bg-green-500/10 p-3">
              <p className="text-sm text-green-400">{importMessage}</p>
            </div>
          )}

          {errors._import && (
            <div className="mt-4 rounded-md bg-red-500/10 p-3">
              <p className="text-sm text-red-400">{errors._import}</p>
            </div>
          )}
        </div>
      </div>
    </SectionDivider>
  );
}

export { DatabaseSettingsSection };
