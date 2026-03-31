import * as React from 'react';

import { Button } from '@/src/components/atoms/button';
import { ConfirmModal } from '@/src/components/atoms/confirm-modal';
import { DangerZoneCard } from '@/src/components/molecules/danger-zone-card';
import { ActionRow } from '@/src/components/molecules/action-row';
import { AlertBanner } from '@/src/components/molecules/alert-banner';

interface DangerZoneSectionProps {
  projectName: string;
  newSecret: string | null;
  isRegenerating: boolean;
  onRegenerate: () => void;
  onDelete: () => void;
  onRegenerateConfirm: () => void;
  onDeleteConfirm: () => void;
  regenerateModalOpen: boolean;
  deleteModalOpen: boolean;
  onRegenerateModalClose: () => void;
  onDeleteModalClose: () => void;
}

function DangerZoneSection({
  projectName,
  newSecret,
  isRegenerating,
  onRegenerate,
  onDelete,
  onRegenerateConfirm,
  onDeleteConfirm,
  regenerateModalOpen,
  deleteModalOpen,
  onRegenerateModalClose,
  onDeleteModalClose,
}: DangerZoneSectionProps) {
  return (
    <section className="border-t border-virel-border pt-8">
      <h2 className="mb-4 text-lg font-medium text-virel-errorText">Danger Zone</h2>
      <DangerZoneCard>
        {newSecret && (
          <AlertBanner variant="success">
            <div>
              <h4 className="mb-1 text-sm font-medium text-virel-successText">New Secret Generated</h4>
            </div>
          </AlertBanner>
        )}

        <ActionRow
          title="Regenerate Webhook Secret"
          description="Invalidates the current secret. You will need to update GitHub with the new one."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={onRegenerate}
              disabled={isRegenerating}
              className="whitespace-nowrap"
            >
              Regenerate Secret
            </Button>
          }
        />

        <ActionRow
          title="Delete Project"
          description="Permanently remove this project and all its deployment history."
          action={
            <Button type="button" variant="destructive" onClick={onDelete} className="btn-danger whitespace-nowrap">
              Delete Project
            </Button>
          }
          hideDivider
        />
      </DangerZoneCard>

      <ConfirmModal
        open={regenerateModalOpen}
        onClose={onRegenerateModalClose}
        onConfirm={onRegenerateConfirm}
        title="Regenerate Webhook Secret"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to regenerate the webhook secret? This will invalidate the current secret.
            </p>
            <p className="text-sm text-virel-textSecondary">
              You will need to update your GitHub webhook configuration with the new secret.
            </p>
          </div>
        }
        confirmLabel="Regenerate"
        variant="default"
      />

      <ConfirmModal
        open={deleteModalOpen}
        onClose={onDeleteModalClose}
        onConfirm={onDeleteConfirm}
        title="Delete Project"
        description={
          <div>
            <p className="mb-4">
              Are you sure you want to delete <strong>{projectName}</strong>? This action cannot be undone.
            </p>
            <p className="text-sm text-virel-textSecondary">
              All deployments, artifacts, and environment variables associated with this project will also be deleted.
            </p>
          </div>
        }
        confirmLabel="Delete"
        variant="danger"
      />
    </section>
  );
}

export { DangerZoneSection };
export type { DangerZoneSectionProps };
