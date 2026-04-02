// DFS-based circular dependency detection

export function detectCircularDependency(
  existingDeps: { blocking_task_id: string; blocked_task_id: string }[],
  newBlockingId: string,
  newBlockedId: string
): boolean {
  if (newBlockingId === newBlockedId) return true;

  // Build adjacency list: blocking -> blocked
  const graph = new Map<string, Set<string>>();
  for (const dep of existingDeps) {
    if (!graph.has(dep.blocking_task_id)) graph.set(dep.blocking_task_id, new Set());
    graph.get(dep.blocking_task_id)!.add(dep.blocked_task_id);
  }

  // Add the proposed edge
  if (!graph.has(newBlockingId)) graph.set(newBlockingId, new Set());
  graph.get(newBlockingId)!.add(newBlockedId);

  // DFS from newBlockedId to see if we can reach newBlockingId
  const visited = new Set<string>();
  const stack = [newBlockedId];

  while (stack.length > 0) {
    const node = stack.pop()!;
    if (node === newBlockingId) return true;
    if (visited.has(node)) continue;
    visited.add(node);
    const neighbors = graph.get(node);
    if (neighbors) {
      for (const n of neighbors) stack.push(n);
    }
  }

  return false;
}
