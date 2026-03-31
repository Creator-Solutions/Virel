import React, { useState } from 'react'
import { CopyIcon, CheckIcon } from 'lucide-react'
interface MonoTextProps {
  children: React.ReactNode
  className?: string
  truncate?: boolean
  copyable?: boolean
  copyValue?: string
}
export function MonoText({
  children,
  className = '',
  truncate = false,
  copyable = false,
  copyValue,
}: MonoTextProps) {
  const [copied, setCopied] = useState(false)
  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const textToCopy = copyValue || children?.toString() || ''
    navigator.clipboard.writeText(textToCopy)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  const baseClasses = `font-mono text-sm tracking-tight ${className}`
  const truncateClasses = truncate
    ? 'truncate max-w-[200px] inline-block align-bottom'
    : ''

  if (copyable) {
    return (
      <div className="group inline-flex items-center gap-2">
        <span
          className={`${baseClasses} ${truncateClasses}`}
          title={truncate ? children?.toString() : undefined}
        >
          {children}
        </span>
        <button
          onClick={handleCopy}
          className="text-virel-textMuted hover:text-virel-text transition-colors focus:outline-none"
          title="Copy to clipboard"
        >
          {copied ? (
            <CheckIcon className="w-3.5 h-3.5 text-virel-successText" />
          ) : (
            <CopyIcon className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </button>
      </div>
    )
  }

  return (
    <span
      className={`${baseClasses} ${truncateClasses}`}
      title={truncate ? children?.toString() : undefined}
    >
      {children}
    </span>
  )
}
