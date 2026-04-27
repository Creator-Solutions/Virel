import * as React from 'react';
import { router } from '@inertiajs/react';
import { toast } from 'sonner';

import { AppBreadcrumb as Breadcrumbs } from '@/src/components/molecules/common/breadcrumbs';
import { PageHeader } from '@/src/components/molecules/common/page-header';
import { AlertBanner } from '@/src/components/molecules/alert-banner';
import { EnvVariableFilter } from '@/src/components/molecules/env-variable-filter';
import { EnvVariableTable } from '@/src/components/molecules/env-variable-table';
import { EnvVariableModal } from '@/src/components/molecules/env-variable-modal';
import type { EnvironmentVariable } from '@/domains/environment/environment.types';
import { environmentService } from '@/domains/environment/environment.service';

interface EnvVariablesOrganismProps {
  project: { id: string; name: string };
  environmentVariables: EnvironmentVariable[];
  hasDecryptionErrors?: boolean;
  canManage: boolean;
}

function EnvVariablesOrganism({
  project,
  environmentVariables: initialVariables,
  hasDecryptionErrors,
  canManage,
}: EnvVariablesOrganismProps) {
  const [variables, setVariables] = React.useState<EnvironmentVariable[]>(initialVariables || []);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showModal, setShowModal] = React.useState(false);
  const [editingVariable, setEditingVariable] = React.useState<EnvironmentVariable | null>(null);
  const [revealedValues, setRevealedValues] = React.useState<Record<string, string>>({});
  const [confirmingDelete, setConfirmingDelete] = React.useState<string | null>(null);
  const [globalError, setGlobalError] = React.useState('');
  const [formData, setFormData] = React.useState({
    key: '',
    value: '',
    environment: 'production' as string,
  });
  const [formError, setFormError] = React.useState('');
  const [filterEnvironment, setFilterEnvironment] = React.useState<string>('all');

  React.useEffect(() => {
    if (hasDecryptionErrors) {
      setGlobalError(
        'Some environment variables could not be decrypted. The APP_KEY may have changed since they were created. Please update those variables with new values.',
      );
    }
  }, [hasDecryptionErrors]);

  const filteredVariables = React.useMemo(() => {
    if (filterEnvironment === 'all') {
      return variables;
    }

    return variables.filter((v) => v.environment === filterEnvironment);
  }, [variables, filterEnvironment]);

  const handleOpenModal = (variable?: EnvironmentVariable) => {
    if (variable) {
      const isDecryptionFailed = variable.value === '****DECRYPTION_ERROR****';
      setEditingVariable(variable);
      setFormData({
        key: variable.key,
        value: '',
        environment: variable.environment,
      });

      if (isDecryptionFailed) {
        setFormError('This value could not be decrypted due to an encryption key change. Please enter a new value.');
      }
    } else {
      setEditingVariable(null);
      setFormData({ key: '', value: '', environment: 'production' });
    }

    setFormError('');
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingVariable(null);
    setFormData({ key: '', value: '', environment: 'production' });
    setFormError('');
  };

  const handleKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, key: e.target.value.toUpperCase() }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!project.id) {
      toast.error('Project ID not found');

      return;
    }

    setIsLoading(true);
    setFormError('');

    try {
      if (editingVariable) {
        if (!formData.value) {
          setFormError('Value is required');
          setIsLoading(false);

          return;
        }

        await environmentService.updateVariable(project.id, editingVariable.id, formData.value);
        toast.success('Environment variable updated');
      } else {
        const result = await environmentService.createVariable(project.id, {
          ...formData,
          environment: formData.environment as 'production' | 'development' | 'staging',
        });
        setVariables((prev) => [...prev, result]);
        toast.success('Environment variable created');
      }

      handleCloseModal();
      router.reload();
    } catch (error: unknown) {
      const err = error as { message?: string; field?: string };

      if (err.field) {
        setFormError(err.message || 'An error occurred');
      } else {
        toast.error(err.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (variableId: string) => {
    if (!project.id) {
      toast.error('Project ID not found');

      return;
    }

    if (confirmingDelete === variableId) {
      try {
        await environmentService.deleteVariable(project.id, variableId);
        setVariables((prev) => prev.filter((v) => v.id !== variableId));
        toast.success('Environment variable deleted');
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to delete');
      } finally {
        setConfirmingDelete(null);
      }
    } else {
      setConfirmingDelete(variableId);
    }
  };

  const handleCancelDelete = () => {
    setConfirmingDelete(null);
  };

  const handleReveal = async (variableId: string) => {
    if (!project.id) {
      toast.error('Project ID not found');

      return;
    }

    if (revealedValues[variableId]) {
      setRevealedValues((prev) => {
        const next = { ...prev };
        delete next[variableId];

        return next;
      });

      return;
    }

    try {
      const data = await environmentService.revealValue(project.id, variableId);
      setRevealedValues((prev) => ({ ...prev, [variableId]: data.value }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reveal');
    }
  };

  const getEnvironmentBadge = (env: string) => {
    const colors: Record<string, string> = {
      development: 'bg-blue-500/20 text-blue-400',
      staging: 'bg-yellow-500/20 text-yellow-400',
      production: 'bg-green-500/20 text-green-400',
    };

    return colors[env] || 'bg-gray-500/20 text-gray-400';
  };

  return (
    <>
      <Breadcrumbs />

      <PageHeader title="Environment Variables" />

      {globalError && <AlertBanner variant="warning">{globalError}</AlertBanner>}

      <div className="mt-6">
        <EnvVariableFilter
          value={filterEnvironment}
          onChange={setFilterEnvironment}
          canManage={canManage}
          onAdd={() => handleOpenModal()}
        />
      </div>

      <div className="mt-4">
        <EnvVariableTable
          variables={filteredVariables}
          revealedValues={revealedValues}
          confirmingDelete={confirmingDelete}
          canManage={canManage}
          onReveal={handleReveal}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
          onConfirmDelete={handleDelete}
          onCancelDelete={handleCancelDelete}
          getEnvironmentBadge={getEnvironmentBadge}
        />
      </div>

      <EnvVariableModal
        isOpen={showModal}
        isEditing={!!editingVariable}
        isLoading={isLoading}
        formData={formData}
        formError={formError}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
        onKeyChange={handleKeyChange}
        onValueChange={(e) => setFormData((prev) => ({ ...prev, value: e.target.value }))}
        onEnvironmentChange={(e) => setFormData((prev) => ({ ...prev, environment: e.target.value }))}
      />
    </>
  );
}

export { EnvVariablesOrganism };
export type { EnvVariablesOrganismProps };
