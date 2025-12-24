import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import WorkspaceView from '@/components/WorkspaceView';
import { useToast } from '@/hooks/use-toast';

interface User {
  username: string;
  role: 'admin' | 'user';
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const handleLogin = () => {
    if (username === 'admin' && password === 'qwerty12+') {
      setCurrentUser({ username: 'admin', role: 'admin' });
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать, администратор!',
      });
    } else if (username && password) {
      setCurrentUser({ username, role: 'user' });
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: `Добро пожаловать, ${username}!`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите логин и пароль',
      });
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setUsername('');
    setPassword('');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-scale-in">
          <CardHeader className="space-y-2 text-center">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-2">
              <Icon name="LayoutDashboard" size={32} className="text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold">Управление проектами</CardTitle>
            <CardDescription>Войдите для доступа к рабочим пространствам</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Логин</label>
              <Input
                type="text"
                placeholder="Введите логин"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Пароль</label>
              <Input
                type="password"
                placeholder="Введите пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            <Button onClick={handleLogin} className="w-full" size="lg">
              <Icon name="LogIn" size={18} className="mr-2" />
              Войти
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Суперадмин: admin / qwerty12+
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <WorkspaceView user={currentUser!} onLogout={handleLogout} />
  );
};

export default Index;
