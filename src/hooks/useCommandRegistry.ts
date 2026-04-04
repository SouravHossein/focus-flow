import { useEffect } from 'react';
import { CommandAction, commandRegistry } from '@/lib/commands/commandRegistry';

export function useCommandRegistry(actions: CommandAction[], deps: any[] = []) {
  useEffect(() => {
    if (actions.length === 0) return;
    return commandRegistry.registerMany(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
