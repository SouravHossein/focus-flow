import { useNavigationStore } from '@/stores/navigation-store';
import { AnimatePresence, motion } from 'framer-motion';

const hints = [
  { key: 'I', label: 'Inbox' },
  { key: 'T', label: 'Today' },
  { key: 'U', label: 'Upcoming' },
  { key: 'M', label: 'My Day' },
  { key: 'D', label: 'Dashboard' },
  { key: 'A', label: 'Activity' },
  { key: 'S', label: 'Settings' },
  { key: '1-9', label: 'Projects' },
];

export function JumpModeHUD() {
  const jumpMode = useNavigationStore((s) => s.jumpMode);

  return (
    <AnimatePresence>
      {jumpMode && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-popover border rounded-xl px-4 py-2.5 shadow-xl"
        >
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground font-medium">Go to...</span>
            {hints.map((h) => (
              <span key={h.key} className="flex items-center gap-1">
                <kbd className="bg-muted text-foreground px-1.5 py-0.5 rounded text-xs font-mono font-medium">
                  {h.key}
                </kbd>
                <span className="text-muted-foreground text-xs">{h.label}</span>
              </span>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
