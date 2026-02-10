import { ThemeProvider } from '@/contexts/ThemeContext.tsx'
import { ThemeToggle } from '@/components/ui/ThemeToggle.tsx'
import { Logo } from '@/components/ui/Logo.tsx'

export default function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-bg-primary text-text-primary">
        <div className="flex items-center justify-center min-h-screen flex-col gap-6">
          <Logo className="text-4xl" />
          <ThemeToggle />
        </div>
      </div>
    </ThemeProvider>
  )
}
