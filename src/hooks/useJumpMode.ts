import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationStore } from '@/stores/navigation-store';
import { useProjects } from '@/hooks/use-projects';

const JUMP_TARGETS: Record<string, string> = {
  i: '/app/inbox',
  t: '/app/today',
  u: '/app/upcoming',
  d: '/app/dashboard',
  a: '/app/activity',
  s: '/app/settings',
  m: '/app/myday',
  f: '/app/focus',
  j: '/app/journey',
};

const TIMEOUT = 1500;

export function useJumpMode() {
  const navigate = useNavigate();
  const { data: projects } = useProjects();
  const jumpMode = useNavigationStore((s) => s.jumpMode);
  const setJumpMode = useNavigationStore((s) => s.setJumpMode);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const cancel = useCallback(() => {
    setJumpMode(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, [setJumpMode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isInput =
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target instanceof HTMLElement && e.target.isContentEditable);
      if (isInput) return;

      if (jumpMode) {
        e.preventDefault();
        const key = e.key.toLowerCase();

        if (key === 'escape') {
          cancel();
          return;
        }

        // Letter-based targets
        if (JUMP_TARGETS[key]) {
          navigate(JUMP_TARGETS[key]);
          cancel();
          return;
        }

        // Number-based project shortcuts (1-9)
        const num = parseInt(key);
        if (num >= 1 && num <= 9 && projects) {
          const project = projects[num - 1];
          if (project) {
            navigate(`/app/project/${project.id}`);
          }
          cancel();
          return;
        }

        // Unknown key — cancel
        cancel();
        return;
      }

      // Enter jump mode on 'g'
      if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        setJumpMode(true);
        timerRef.current = setTimeout(cancel, TIMEOUT);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [jumpMode, navigate, projects, cancel, setJumpMode]);

  return { jumpMode, cancel };
}
