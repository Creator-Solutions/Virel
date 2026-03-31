import * as React from 'react';

function GitHubSetupInstructions() {
  return (
    <div className="rounded-md bg-virel-base/50 p-4 text-sm text-virel-textSecondary">
      <h4 className="mb-2 font-medium text-virel-text">How to configure GitHub:</h4>
      <ol className="list-inside list-decimal space-y-1.5">
        <li>Go to your GitHub repository settings</li>
        <li>
          Navigate to <strong>Webhooks</strong> and click <strong>Add webhook</strong>
        </li>
        <li>
          Paste the Webhook URL above into the <strong>Payload URL</strong> field
        </li>
        <li>
          Set Content type to <strong>application/json</strong>
        </li>
        <li>
          Paste the Webhook Secret into the <strong>Secret</strong> field
        </li>
        <li>
          Select <strong>Just the push event</strong> and click Add webhook
        </li>
      </ol>
    </div>
  );
}

export { GitHubSetupInstructions };
