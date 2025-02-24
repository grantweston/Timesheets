"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-gradient-to-r group-[.toast]:from-violet-600 group-[.toast]:to-indigo-600 group-[.toast]:text-white group-[.toast]:hover:from-violet-700 group-[.toast]:hover:to-indigo-700 group-[.toast]:shadow-lg group-[.toast]:shadow-violet-500/25",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground group-[.toast]:hover:bg-violet-50 group-[.toast]:dark:hover:bg-violet-900/10",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
