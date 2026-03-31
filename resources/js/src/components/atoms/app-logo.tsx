import { TerminalSquareIcon } from "lucide-react"

interface AppLogoProps {
    collapsed?: boolean
    className?: string
    iconClassName?: string
    textClassName?: string
    text?: string
}

export function AppLogo({
    collapsed = false,
    className = '',
    iconClassName = 'h-8 w-8',
    textClassName = 'text-3xl font-bold tracking-tight text-virel-text',
    text = 'Virel',
}: AppLogoProps) {
    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            <TerminalSquareIcon className={`text-virel-text ${iconClassName}`} />
            {!collapsed && (
                <span className={textClassName}>
                    {text}
                </span>
            )}
        </div>
    )
}