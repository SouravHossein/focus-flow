/** Simple longest-path algorithm for task dependency chains */
export function findCriticalPath(
  tasks: { id: string }[],
  dependencies: { blocking_task_id: string; blocked_task_id: string }[]
): Set<string> {
  const adjList = new Map<string, string[]>();
  const taskSet = new Set(tasks.map((t) => t.id));

  for (const dep of dependencies) {
    if (!taskSet.has(dep.blocking_task_id) || !taskSet.has(dep.blocked_task_id)) continue;
    const existing = adjList.get(dep.blocking_task_id) || [];
    existing.push(dep.blocked_task_id);
    adjList.set(dep.blocking_task_id, existing);
  }

  let longestPath: string[] = [];
  const memo = new Map<string, string[]>();

  function dfs(nodeId: string, visited: Set<string>): string[] {
    if (memo.has(nodeId)) return memo.get(nodeId)!;
    if (visited.has(nodeId)) return [nodeId]; // cycle
    visited.add(nodeId);

    const neighbors = adjList.get(nodeId) || [];
    let best: string[] = [nodeId];
    for (const next of neighbors) {
      const path = dfs(next, visited);
      if (path.length + 1 > best.length) {
        best = [nodeId, ...path];
      }
    }
    visited.delete(nodeId);
    memo.set(nodeId, best);
    return best;
  }

  for (const task of tasks) {
    const path = dfs(task.id, new Set());
    if (path.length > longestPath.length) longestPath = path;
  }

  return new Set(longestPath);
}
