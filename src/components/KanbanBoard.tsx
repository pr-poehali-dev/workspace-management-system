import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface Workspace {
  id: string;
  name: string;
  statuses: string[];
  tags: string[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
  assignee?: string;
}

interface KanbanBoardProps {
  project: Project;
  workspace: Workspace;
  user: User;
  onBack: () => void;
}

const KanbanBoard = ({ project, workspace, user, onBack }: KanbanBoardProps) => {
  const { toast } = useToast();
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      title: 'Настроить окружение разработки',
      description: 'Установить все необходимые зависимости и инструменты',
      status: 'Готово',
      priority: 'high',
      tags: ['urgent'],
      assignee: 'admin',
    },
    {
      id: '2',
      title: 'Создать дизайн-систему',
      description: 'Разработать компоненты UI и цветовую палитру',
      status: 'В работе',
      priority: 'high',
      tags: ['feature'],
      assignee: 'user1',
    },
    {
      id: '3',
      title: 'Интеграция с API',
      description: 'Подключить бэкенд и настроить endpoints',
      status: 'Бэклог',
      priority: 'medium',
      tags: ['feature'],
    },
  ]);

  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState(workspace.statuses[0]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);

  const handleCreateTask = () => {
    if (!newTaskTitle) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      description: newTaskDesc,
      status: newTaskStatus,
      priority: newTaskPriority,
      tags: [],
      assignee: user.username,
    };

    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setIsTaskDialogOpen(false);
    toast({
      title: 'Задача создана',
      description: `Задача "${newTask.title}" добавлена в колонку "${newTask.status}"`,
    });
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (!draggedTask) return;

    setTasks(
      tasks.map((task) =>
        task.id === draggedTask.id ? { ...task, status } : task
      )
    );

    toast({
      title: 'Задача перемещена',
      description: `"${draggedTask.title}" → ${status}`,
    });

    setDraggedTask(null);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'AlertCircle';
      case 'medium':
        return 'Clock';
      case 'low':
        return 'CheckCircle2';
      default:
        return 'Circle';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={onBack}>
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-sm text-muted-foreground">
                  {workspace.name} • {project.description}
                </p>
              </div>
            </div>
            <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Новая задача
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать задачу</DialogTitle>
                  <DialogDescription>Добавьте новую задачу в проект</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="task-title">Название задачи</Label>
                    <Input
                      id="task-title"
                      placeholder="Например: Исправить баг в форме"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-desc">Описание</Label>
                    <Textarea
                      id="task-desc"
                      placeholder="Детали задачи"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="task-priority">Приоритет</Label>
                      <Select value={newTaskPriority} onValueChange={(v) => setNewTaskPriority(v as any)}>
                        <SelectTrigger id="task-priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Низкий</SelectItem>
                          <SelectItem value="medium">Средний</SelectItem>
                          <SelectItem value="high">Высокий</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="task-status">Колонка</Label>
                      <Select value={newTaskStatus} onValueChange={setNewTaskStatus}>
                        <SelectTrigger id="task-status">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {workspace.statuses.map((status) => (
                            <SelectItem key={status} value={status}>
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateTask}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {workspace.statuses.map((status) => (
            <div
              key={status}
              className="flex flex-col gap-4"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(status)}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{status}</h3>
                <Badge variant="secondary">
                  {tasks.filter((t) => t.status === status).length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      className="cursor-move hover:shadow-md transition-all animate-fade-in"
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <CardTitle className="text-sm font-medium leading-tight">
                            {task.title}
                          </CardTitle>
                          <Badge
                            variant="outline"
                            className={`${getPriorityColor(task.priority)} text-xs gap-1 flex-shrink-0`}
                          >
                            <Icon name={getPriorityIcon(task.priority)} size={12} />
                            {task.priority === 'high' && 'Высокий'}
                            {task.priority === 'medium' && 'Средний'}
                            {task.priority === 'low' && 'Низкий'}
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-2">
                          {task.assignee && (
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Icon name="User" size={12} />
                              <span>{task.assignee}</span>
                            </div>
                          )}
                          {task.tags.length > 0 && (
                            <div className="flex gap-1">
                              {task.tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default KanbanBoard;
