import { useState } from 'react';

import { MonoText } from '@/src/components/atoms/mono-text';

interface WebhookSecretDisplayProps {
  secret: string | null;
}

function WebhookSecretDisplay({ secret }: WebhookSecretDisplayProps) {
  const [show, setShow] = useState(false);

  return (
    <div>
      <div className="mb-2 block text-sm font-medium text-virel-text">Webhook Secret</div>
      <div className="flex items-center justify-between rounded-md border border-virel-border bg-virel-base p-3">
        <MonoText className='text-virel-text'>{show ? secret || '' : '••••••••••••••••••••••••'}</MonoText>
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="text-sm text-virel-textSecondary transition-colors hover:text-virel-text"
        >
          {show ? 'Hide' : 'Reveal'}
        </button>
      </div>
    </div>
  );
}

export { WebhookSecretDisplay };
export type { WebhookSecretDisplayProps };
