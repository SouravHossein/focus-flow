import { useState } from 'react';
import { useTemplates, useCreateTemplate, useDeleteTemplate } from '@/hooks/use-templates';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, FileText, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { TemplateData } from '@/lib/templates/applyTemplate';

export default function TemplatesSettingsPage() {
  const { data: templates, isLoading } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();
  const { toast } = useToast();
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('General');
  const [templateTitle, setTemplateTitle] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [templatePriority, setTemplatePriority] = useState('4');

  const handleCreate = async () => {
    if (!name.trim() || !templateTitle.trim()) return;
    await createTemplate.mutateAsync({
      name: name.trim(),
      category,
      template_data: {
        title: templateTitle.trim(),
        description: templateDescription.trim() || undefined,
        priority: parseInt(templatePriority),
      } as TemplateData,
    });
    toast({ title: 'Template created' });
    setCreateOpen(false);
    setName('');
    setTemplateTitle('');
    setTemplateDescription('');
    setTemplatePriority('4');
  };

  const handleDuplicate = async (t: any) => {
    await createTemplate.mutateAsync({
      name: `${t.name} (copy)`,
      category: t.category,
      template_data: t.template_data,
    });
    toast({ title: 'Template duplicated' });
  };

  return (
    <div className="mx-auto max-w-xl p-4 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-foreground">Templates</h1>
        <Button size="sm" className="gap-1.5" onClick={() => setCreateOpen(true)}>
          <Plus className="h-3.5 w-3.5" />
          New template
        </Button>
      </div>

      {isLoading && <p className="text-sm text-muted-foreground">Loading...</p>}

      {!isLoading && (!templates || templates.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No templates yet. Create one to speed up task creation.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {templates?.map((t) => {
          const data = t.template_data as unknown as TemplateData;
          return (
            <Card key={t.id}>
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{t.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Badge variant="secondary" className="text-[10px]">{t.category}</Badge>
                    <span className="text-xs text-muted-foreground truncate">{data.title}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDuplicate(t)}>
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => deleteTemplate.mutate(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Create template</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Template name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Weekly report" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Task title</Label>
              <Input value={templateTitle} onChange={(e) => setTemplateTitle(e.target.value)} placeholder="Use {{var}} for variables" className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Description (optional)</Label>
              <Textarea value={templateDescription} onChange={(e) => setTemplateDescription(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Priority</Label>
              <Select value={templatePriority} onValueChange={setTemplatePriority}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Priority 1</SelectItem>
                  <SelectItem value="2">Priority 2</SelectItem>
                  <SelectItem value="3">Priority 3</SelectItem>
                  <SelectItem value="4">Priority 4</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreate} disabled={!name.trim() || !templateTitle.trim()}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
