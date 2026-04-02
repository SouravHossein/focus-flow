import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variables: string[];
  onResolve: (values: Record<string, string>) => void;
}

export function TemplateVariablePrompt({ open, onOpenChange, variables, onResolve }: Props) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    setValues(Object.fromEntries(variables.map((v) => [v, ''])));
  }, [variables]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onResolve(values);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Fill in template values</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {variables.map((v) => (
            <div key={v}>
              <Label className="text-sm capitalize">{v.replace(/_/g, ' ')}</Label>
              <Input
                value={values[v] || ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [v]: e.target.value }))}
                placeholder={v}
                className="mt-1"
              />
            </div>
          ))}
          <DialogFooter>
            <Button type="submit" size="sm">Apply</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
