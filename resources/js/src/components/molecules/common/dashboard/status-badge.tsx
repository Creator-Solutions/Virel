import type { DeploymentStatus } from '@/domains/projects/projects.types'
import React from 'react'

interface StatusBadgeProps {
  status: DeploymentStatus | 'never'
  size?: 'sm' | 'md'
}
export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-full border'
  const sizeClasses =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
  let colorClasses = ''
  let label = ''
  let showPulse = false
  
  switch (status) {
    case 'success':
      colorClasses =
        'bg-virel-successBg text-virel-successText border-virel-successBg/50'
      label = 'Success'
      break
    case 'failed':
      colorClasses =
        'bg-virel-errorBg text-virel-errorText border-virel-errorBg/50'
      label = 'Failed'
      break
    case 'running':
      colorClasses =
        'bg-virel-warningBg text-virel-warningText border-virel-warningBg/50'
      label = 'Running'
      showPulse = true
      break
    case 'pending':
      colorClasses =
        'bg-virel-pendingBg text-virel-pendingText border-virel-border'
      label = 'Pending'
      break
    case 'never':
      colorClasses =
        'bg-transparent text-virel-textMuted border-virel-border border-dashed'
      label = 'Never deployed'
      break
  }

  return (
    <span className={`${baseClasses} ${sizeClasses} ${colorClasses}`}>
      {showPulse && (
        <span className="relative flex h-2 w-2 mr-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-virel-warningText opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-virel-warningText"></span>
        </span>
      )}
      {label}
    </span>
  )
}
