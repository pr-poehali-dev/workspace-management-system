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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  members: string[];
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
  isActive: boolean;
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
      isActive: false,
    },
    {
      id: '2',
      title: 'Создать дизайн-систему',
      description: 'Разработать компоненты UI и цветовую палитру',
      status: 'В работе',
      priority: 'high',
      tags: ['feature'],
      assignee: 'user1',
      isActive: true,
    },
    {
      id: '3',
      title: 'Интеграция с API',
      description: 'Подключить бэкенд и настроить endpoints',
      status: 'Бэклог',
      priority: 'medium',
      tags: ['feature'],
      isActive: true,
    },
  ]);

  const [availableTags, setAvailableTags] = useState<string[]>(workspace.tags);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskStatus, setNewTaskStatus] = useState(workspace.statuses[0]);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskFilter, setTaskFilter] = useState<'all' | 'active' | 'closed'>('all');
  const [newTagInput, setNewTagInput] = useState('');

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
      isActive: true,
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

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)));
    toast({
      title: 'Задача обновлена',
      description: 'Изменения сохранены',
    });
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleAddTag = () => {
    if (!newTagInput.trim() || !selectedTask) return;

    const tagName = newTagInput.trim();
    
    if (!availableTags.includes(tagName)) {
      setAvailableTags([...availableTags, tagName]);
    }

    if (!selectedTask.tags.includes(tagName)) {
      const updatedTask = { ...selectedTask, tags: [...selectedTask.tags, tagName] };
      setSelectedTask(updatedTask);
      handleUpdateTask(updatedTask);
    }

    setNewTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    if (!selectedTask) return;
    const updatedTask = { ...selectedTask, tags: selectedTask.tags.filter((t) => t !== tagToRemove) };
    setSelectedTask(updatedTask);
    handleUpdateTask(updatedTask);
  };

  const handleToggleTaskTag = (tag: string) => {
    if (!selectedTask) return;
    
    const updatedTags = selectedTask.tags.includes(tag)
      ? selectedTask.tags.filter((t) => t !== tag)
      : [...selectedTask.tags, tag];
    
    const updatedTask = { ...selectedTask, tags: updatedTags };
    setSelectedTask(updatedTask);
    handleUpdateTask(updatedTask);
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

  const getFilteredTasks = () => {
    switch (taskFilter) {
      case 'active':
        return tasks.filter((task) => task.isActive);
      case 'closed':
        return tasks.filter((task) => !task.isActive);
      default:
        return tasks;
    }
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
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

          <Tabs value={taskFilter} onValueChange={(v) => setTaskFilter(v as any)} className="w-full">
            <TabsList>
              <TabsTrigger value="all">Все задачи</TabsTrigger>
              <TabsTrigger value="active">Активные</TabsTrigger>
              <TabsTrigger value="closed">Закрытые</TabsTrigger>
            </TabsList>
          </Tabs>
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
                  {filteredTasks.filter((t) => t.status === status).length}
                </Badge>
              </div>

              <div className="space-y-3 min-h-[200px]">
                {filteredTasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <Card
                      key={task.id}
                      draggable
                      onDragStart={() => handleDragStart(task)}
                      onClick={() => handleTaskClick(task)}
                      className={`cursor-pointer hover:shadow-md transition-all animate-fade-in ${
                        !task.isActive ? 'opacity-60' : ''
                      }`}
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
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {task.description}
                          </p>
                        )}
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            {task.assignee && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Icon name="User" size={12} />
                                <span>{task.assignee}</span>
                              </div>
                            )}
                          </div>
                          {!task.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              <Icon name="Check" size={12} className="mr-1" />
                              Закрыта
                            </Badge>
                          )}
                        </div>
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {task.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </main>

      <Dialog open={isTaskDetailOpen} onOpenChange={setIsTaskDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedTask && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedTask.title}</DialogTitle>
                <DialogDescription>Детали и управление задачей</DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                <div className="space-y-2">
                  <Label>Описание</Label>
                  <Textarea
                    value={selectedTask.description}
                    onChange={(e) => {
                      const updated = { ...selectedTask, description: e.target.value };
                      setSelectedTask(updated);
                      handleUpdateTask(updated);
                    }}
                    rows={4}
                    placeholder="Описание задачи"
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div className="flex items-center gap-2">
                    <Icon name={selectedTask.isActive ? 'CircleDot' : 'CheckCircle2'} size={20} />
                    <div>
                      <p className="font-medium">Статус задачи</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedTask.isActive ? 'Активная' : 'Закрытая'}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={selectedTask.isActive}
                    onCheckedChange={(checked) => {
                      const updated = { ...selectedTask, isActive: checked };
                      setSelectedTask(updated);
                      handleUpdateTask(updated);
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Статус колонки</Label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) => {
                        const updated = { ...selectedTask, status: value };
                        setSelectedTask(updated);
                        handleUpdateTask(updated);
                      }}
                    >
                      <SelectTrigger>
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

                  <div className="space-y-2">
                    <Label>Приоритет</Label>
                    <Select
                      value={selectedTask.priority}
                      onValueChange={(value) => {
                        const updated = { ...selectedTask, priority: value as any };
                        setSelectedTask(updated);
                        handleUpdateTask(updated);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Низкий</SelectItem>
                        <SelectItem value="medium">Средний</SelectItem>
                        <SelectItem value="high">Высокий</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Исполнитель</Label>
                  <Select
                    value={selectedTask.assignee || ''}
                    onValueChange={(value) => {
                      const updated = { ...selectedTask, assignee: value };
                      setSelectedTask(updated);
                      handleUpdateTask(updated);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите исполнителя" />
                    </SelectTrigger>
                    <SelectContent>
                      {workspace.members.map((member) => (
                        <SelectItem key={member} value={member}>
                          {member}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Теги</Label>
                  <div className="flex flex-wrap gap-2 p-3 bg-muted rounded-lg min-h-[60px]">
                    {selectedTask.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <Icon name="X" size={12} />
                        </button>
                      </Badge>
                    ))}
                    {selectedTask.tags.length === 0 && (
                      <p className="text-sm text-muted-foreground">Теги не добавлены</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">Добавить тег</Label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Название тега"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                      />
                      <Button onClick={handleAddTag} size="sm">
                        <Icon name="Plus" size={16} />
                      </Button>
                    </div>
                  </div>

                  {availableTags.length > 0 && (
                    <div className="space-y-2">
                      <Label className="text-sm">Доступные теги</Label>
                      <div className="flex flex-wrap gap-2">
                        {availableTags.map((tag) => (
                          <Badge
                            key={tag}
                            variant={selectedTask.tags.includes(tag) ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => handleToggleTaskTag(tag)}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsTaskDetailOpen(false)}>
                  Закрыть
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoard;
