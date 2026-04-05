export interface OptimisticMutationOptions<T> {
  optimisticUpdate: () => void;
  mutation: () => Promise<T>;
  rollback: () => void;
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
}

export async function optimisticMutation<T>(options: OptimisticMutationOptions<T>): Promise<T> {
  const { optimisticUpdate, mutation, rollback, onSuccess, onError } = options;

  // Apply optimistic update immediately
  optimisticUpdate();

  try {
    const result = await mutation();
    onSuccess?.(result);
    return result;
  } catch (error) {
    // Rollback on failure
    rollback();
    onError?.(error as Error);
    throw error;
  }
}
