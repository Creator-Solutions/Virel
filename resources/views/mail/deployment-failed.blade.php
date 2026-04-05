<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Deployment Failed</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1f2937; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #ef4444; color: white; padding: 20px; border-radius: 8px 8px 0 0; text-align: center; }
        .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
        .details { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #f3f4f6; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #6b7280; }
        .value { color: #1f2937; }
        .log { background: #1f2937; color: #10b981; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; overflow-x: auto; margin-top: 15px; }
        .footer { background: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb; border-top: none; }
        a { color: #3b82f6; text-decoration: none; }
    </style>
</head>
<body>
    <div class="header">
        <h1 style="margin: 0; font-size: 24px;">Deployment Failed</h1>
    </div>
    <div class="content">
        <p>Your deployment for <strong>{{ $deployment->project->name }}</strong> has failed.</p>
        
        <div class="details">
            <div class="detail-row">
                <span class="label">Project</span>
                <span class="value">{{ $deployment->project->name }}</span>
            </div>
            <div class="detail-row">
                <span class="label">Branch</span>
                <span class="value">{{ $deployment->branch ?? 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="label">Commit</span>
                <span class="value">{{ $deployment->commit_sha ? substr($deployment->commit_sha, 0, 7) : 'N/A' }}</span>
            </div>
            <div class="detail-row">
                <span class="label">Failed At</span>
                <span class="value">{{ $deployment->completed_at->format('M j, Y g:i A') }}</span>
            </div>
        </div>
        
        @if($deployment->log)
        <p><strong>Error Log:</strong></p>
        <div class="log">{{ $deployment->log }}</div>
        @endif
        
        <p style="margin-top: 20px;">
            <a href="{{ config('app.url') }}/home/projects/{{ $deployment->project->id }}/deployments/{{ $deployment->id }}">View Deployment Details</a>
        </p>
    </div>
    <div class="footer">
        <p style="margin: 0;">Powered by Virel</p>
    </div>
</body>
</html>
