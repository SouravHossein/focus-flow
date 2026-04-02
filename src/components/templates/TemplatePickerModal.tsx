import { useState } from 'react';
import { useTemplates } from '@/hooks/use-templates';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, FileText } from 'lucide-react';
import type { TemplateData } from '@/lib/templates/applyTemplate';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (template: TemplateData, templateName: string) => void;
}

export function TemplatePickerModal({ open, onOpenChange, onSelect }: Props) {
  const { data: templates, isLoading } = useTemplates();
  const [search, setSearch] = useState('');

  const filtered = (templates || []).filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(filtered.map((t) => t.category))];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Use a template</DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
            autoFocus
          />
        </div>
        <div className="max-h-64 overflow-y-auto space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground py-4 text-center">Loading...</p>}
          {!isLoading && filtered.length === 0 && (
            <div className="py-8 text-center">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">No templates yet</p>
              <p className="text-xs text-muted-foreground mt-1">Save a task as template from the task detail drawer</p>
            </div>
          )}
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{cat}</p>
              {filtered
                .filter((t) => t.category === cat)
                .map((t) => {
                  const data = t.template_data as unknown as TemplateData;
                  return (
                    <button
                      key={t.id}
                      className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-accent/50 transition-colors"
                      onClick={() => { onSelect(data, t.name); onOpenChange(false); }}
                    >
                      <FileText className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{t.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{data.title}</p>
                        {data.subtasks && data.subtasks.length > 0 && (
                          <Badge variant="secondary" className="text-[10px] mt-1">
                            {data.subtasks.length} subtask{data.subtasks.length > 1 ? 's' : ''}
                          </Badge>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
