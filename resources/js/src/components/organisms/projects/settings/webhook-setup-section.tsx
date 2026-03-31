import * as React from 'react';

import { WebhookUrlDisplay } from '@/src/components/molecules/webhook-url-display';
import { WebhookSecretDisplay } from '@/src/components/molecules/webhook-secret-display';
import { GitHubSetupInstructions } from '@/src/components/molecules/github-setup-instructions';

interface WebhookSetupSectionProps {
  webhookUrl: string;
  webhookSecret: string | null;
}

function WebhookSetupSection({ webhookUrl, webhookSecret }: WebhookSetupSectionProps) {
  return (
    <section className="border-t border-virel-border pt-8">
      <h2 className="mb-4 text-lg font-medium text-virel-text">Webhook Setup</h2>
      <div className="space-y-6 rounded-lg border border-virel-border bg-virel-surface p-6">
        <WebhookUrlDisplay url={webhookUrl} />
        <WebhookSecretDisplay secret={webhookSecret} />
        <GitHubSetupInstructions />
      </div>
    </section>
  );
}

export { WebhookSetupSection };
export type { WebhookSetupSectionProps };
