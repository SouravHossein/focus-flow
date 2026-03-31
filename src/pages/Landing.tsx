import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckSquare, Inbox, CalendarDays, BarChart3, Zap, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Inbox, title: 'Smart Inbox', description: 'Capture tasks instantly and organize later' },
  { icon: CalendarDays, title: 'Due Dates & Recurring', description: 'Schedule once, repeat automatically' },
  { icon: BarChart3, title: 'Productivity Dashboard', description: 'Track streaks, trends, and progress' },
  { icon: Zap, title: 'Quick Add & Shortcuts', description: 'Press Q to add tasks in a flash' },
  { icon: Shield, title: 'Projects & Labels', description: 'Organize work your way with flexible grouping' },
  { icon: CheckSquare, title: 'Subtasks & Priorities', description: 'Break big tasks into manageable steps' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <CheckSquare className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold text-foreground">TaskFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/auth')}>
              Log in
            </Button>
            <Button size="sm" onClick={() => navigate('/auth')}>
              Get started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 py-20 text-center md:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-6xl">
            Your tasks,
            <br />
            <span className="text-primary">beautifully organized</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-lg text-muted-foreground">
            A calm, powerful task manager built for people who value clarity.
            Capture everything, focus on what matters.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Button size="lg" className="gap-2" onClick={() => navigate('/auth')}>
              Start for free <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.08, duration: 0.4 }}
              className="rounded-xl border bg-card p-6"
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-foreground">{f.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{f.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} TaskFlow. Built with care.</p>
      </footer>
    </div>
  );
}
