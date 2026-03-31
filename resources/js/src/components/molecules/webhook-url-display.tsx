import * as React from 'react';

import { MonoText } from '@/src/components/atoms/mono-text';

interface WebhookUrlDisplayProps {
  url: string;
}

function WebhookUrlDisplay({ url }: WebhookUrlDisplayProps) {
  return (
    <div>
      <div className="mb-2 block text-sm font-medium text-virel-text">Webhook URL</div>
      <div className="flex items-center justify-between rounded-md border border-virel-border bg-virel-base p-3">
        <MonoText copyable className='text-virel-text'>{url}</MonoText>
      </div>
    </div>
  );
}

export { WebhookUrlDisplay };
export type { WebhookUrlDisplayProps };
