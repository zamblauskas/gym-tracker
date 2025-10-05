import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

export interface BreadcrumbItem {
  label: string
  onClick: () => void
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (items.length === 0) return null

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 text-sm mb-6 overflow-x-auto scrollbar-hide"
      aria-label="Breadcrumb"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1

        return (
          <div key={index} className="flex items-center gap-2 flex-shrink-0">
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-[hsl(var(--color-muted-foreground))]" />
            )}
            {index === 0 ? (
              <button
                onClick={item.onClick}
                className="flex items-center gap-1.5 text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))] transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            ) : (
              <button
                onClick={item.onClick}
                className={`transition-colors ${
                  isLast
                    ? 'text-[hsl(var(--color-foreground))] font-medium cursor-default'
                    : 'text-[hsl(var(--color-muted-foreground))] hover:text-[hsl(var(--color-foreground))]'
                }`}
                disabled={isLast}
              >
                {item.label}
              </button>
            )}
          </div>
        )
      })}
    </motion.nav>
  )
}
