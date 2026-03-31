import type { ReactNode } from "react"
import { AppLogo } from "@/src/components/atoms"

interface AuthLayoutProps {
    title: string
    children: ReactNode
}

export function AuthLayout({ title, children }: AuthLayoutProps) {
    return (
        <div className="min-h-screen bg-virel-base flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <AppLogo />
                <h2 className="mt-8 text-center text-xl font-medium text-virel-textSecondary">
                    {title}
                </h2>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-virel-surface py-8 px-4 shadow-xl border border-virel-border sm:rounded-lg sm:px-10">
                    {children}
                </div>
            </div>
        </div>
    )
}