import { Eye } from 'lucide-react';

export function ViewerBanner() {
  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 border-b text-sm text-muted-foreground">
      <Eye className="h-4 w-4" />
      <span>You have view-only access</span>
      <span className="hidden sm:inline">· Contact an admin for edit access</span>
    </div>
  );
}
