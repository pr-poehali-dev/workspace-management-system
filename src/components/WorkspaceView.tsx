import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import KanbanBoard from './KanbanBoard';
import { useToast } from '@/hooks/use-toast';

interface User {
  username: string;
  role: 'admin' | 'user';
}

interface Workspace {
  id: string;
  name: string;
  description: string;
  members: string[];
  tags: string[];
  statuses: string[];
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  description: string;
}

interface WorkspaceViewProps {
  user: User;
  onLogout: () => void;
  userWorkspaceId: string | null;
}

const WorkspaceView = ({ user, onLogout, userWorkspaceId }: WorkspaceViewProps) => {
  const { toast } = useToast();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(
    user.role === 'admin'
      ? [
          {
            id: '1',
            name: 'Основное пространство',
            description: 'Главное рабочее пространство команды',
            members: ['admin', 'user1', 'user2'],
            tags: ['urgent', 'feature', 'bug'],
            statuses: ['Бэклог', 'В работе', 'На проверке', 'Готово'],
            projects: [
              { id: '1', name: 'Веб-приложение', description: 'Разработка основного продукта' },
              { id: '2', name: 'Мобильное приложение', description: 'iOS и Android версии' },
            ],
          },
        ]
      : []
  );

  const getVisibleWorkspaces = () => {
    if (user.role === 'admin') return workspaces;
    return workspaces.filter((ws) => ws.id === userWorkspaceId);
  };

  const visibleWorkspaces = getVisibleWorkspaces();

  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');
  const [newWorkspaceDesc, setNewWorkspaceDesc] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [isWorkspaceDialogOpen, setIsWorkspaceDialogOpen] = useState(false);
  const [isProjectDialogOpen, setIsProjectDialogOpen] = useState(false);

  const handleCreateWorkspace = () => {
    if (!newWorkspaceName) return;
    
    const newWorkspace: Workspace = {
      id: userWorkspaceId || Date.now().toString(),
      name: newWorkspaceName,
      description: newWorkspaceDesc,
      members: [user.username],
      tags: [],
      statuses: ['Бэклог', 'В работе', 'Готово'],
      projects: [],
    };

    setWorkspaces([...workspaces, newWorkspace]);
    setNewWorkspaceName('');
    setNewWorkspaceDesc('');
    setIsWorkspaceDialogOpen(false);
    toast({
      title: 'Пространство создано',
      description: `Рабочее пространство "${newWorkspace.name}" успешно создано`,
    });
  };

  const handleCreateProject = () => {
    if (!newProjectName || !selectedWorkspace) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc,
    };

    const updatedWorkspaces = workspaces.map((ws) =>
      ws.id === selectedWorkspace.id
        ? { ...ws, projects: [...ws.projects, newProject] }
        : ws
    );

    setWorkspaces(updatedWorkspaces);
    setSelectedWorkspace({
      ...selectedWorkspace,
      projects: [...selectedWorkspace.projects, newProject],
    });
    setNewProjectName('');
    setNewProjectDesc('');
    setIsProjectDialogOpen(false);
    toast({
      title: 'Проект создан',
      description: `Проект "${newProject.name}" добавлен в пространство`,
    });
  };

  const handleWorkspaceUpdate = (updatedWorkspace: Workspace) => {
    setWorkspaces(workspaces.map((ws) => (ws.id === updatedWorkspace.id ? updatedWorkspace : ws)));
    setSelectedWorkspace(updatedWorkspace);
  };

  if (selectedProject && selectedWorkspace) {
    return (
      <KanbanBoard
        project={selectedProject}
        workspace={selectedWorkspace}
        user={user}
        onBack={() => setSelectedProject(null)}
        onWorkspaceUpdate={handleWorkspaceUpdate}
      />
    );
  }

  if (selectedWorkspace) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setSelectedWorkspace(null)}>
                <Icon name="ArrowLeft" size={18} />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{selectedWorkspace.name}</h1>
                <p className="text-sm text-muted-foreground">{selectedWorkspace.description}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <Icon name="Users" size={14} />
                {selectedWorkspace.members.length}
              </Badge>
              <Button variant="ghost" size="sm" onClick={onLogout}>
                <Icon name="LogOut" size={18} />
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Проекты</h2>
            <Dialog open={isProjectDialogOpen} onOpenChange={setIsProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Новый проект
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Создать проект</DialogTitle>
                  <DialogDescription>Добавьте новый проект в рабочее пространство</DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="project-name">Название проекта</Label>
                    <Input
                      id="project-name"
                      placeholder="Например: Веб-приложение"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project-desc">Описание</Label>
                    <Input
                      id="project-desc"
                      placeholder="Краткое описание проекта"
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateProject}>Создать</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedWorkspace.projects.map((project) => (
              <Card
                key={project.id}
                className="cursor-pointer hover:shadow-lg transition-all hover-scale"
                onClick={() => setSelectedProject(project)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                      <Icon name="FolderKanban" size={24} className="text-primary" />
                    </div>
                    <Badge variant="secondary">Проект</Badge>
                  </div>
                  <CardTitle className="text-lg">{project.name}</CardTitle>
                  <CardDescription>{project.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          {selectedWorkspace.projects.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Icon name="FolderOpen" size={48} className="text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">Проектов пока нет</p>
                <Button onClick={() => setIsProjectDialogOpen(true)}>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать первый проект
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Icon name="LayoutDashboard" size={24} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Управление проектами</h1>
              <p className="text-sm text-muted-foreground">
                {user.username} • {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout}>
            <Icon name="LogOut" size={18} />
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Рабочие пространства</h2>
          {(user.role === 'admin' || visibleWorkspaces.length === 0) && (
            <Dialog open={isWorkspaceDialogOpen} onOpenChange={setIsWorkspaceDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Icon name="Plus" size={18} className="mr-2" />
                  Создать пространство
                </Button>
              </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Новое рабочее пространство</DialogTitle>
                <DialogDescription>Создайте пространство для организации проектов команды</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name">Название</Label>
                  <Input
                    id="workspace-name"
                    placeholder="Например: Команда разработки"
                    value={newWorkspaceName}
                    onChange={(e) => setNewWorkspaceName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workspace-desc">Описание</Label>
                  <Input
                    id="workspace-desc"
                    placeholder="Краткое описание пространства"
                    value={newWorkspaceDesc}
                    onChange={(e) => setNewWorkspaceDesc(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreateWorkspace}>Создать</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleWorkspaces.map((workspace) => (
            <Card
              key={workspace.id}
              className="cursor-pointer hover:shadow-lg transition-all hover-scale"
              onClick={() => setSelectedWorkspace(workspace)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                    <Icon name="Building2" size={24} className="text-primary" />
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <Icon name="Users" size={12} />
                      {workspace.members.length}
                    </Badge>
                    <Badge variant="outline" className="gap-1">
                      <Icon name="FolderKanban" size={12} />
                      {workspace.projects.length}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="text-lg">{workspace.name}</CardTitle>
                <CardDescription>{workspace.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default WorkspaceView;