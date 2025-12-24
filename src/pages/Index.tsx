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

interface RegisteredUser {
  username: string;
  password: string;
  workspaceId: string;
}

const Index = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const { toast } = useToast();

  const handleRegister = () => {
    if (!username || !password) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Введите логин и пароль',
      });
      return;
    }

    if (registeredUsers.some((u) => u.username === username)) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Пользователь с таким логином уже существует',
      });
      return;
    }

    const workspaceId = `ws_${Date.now()}`;
    const newUser: RegisteredUser = { username, password, workspaceId };
    setRegisteredUsers([...registeredUsers, newUser]);
    
    setCurrentUser({ username, role: 'user' });
    setIsAuthenticated(true);
    toast({
      title: 'Регистрация успешна',
      description: `Добро пожаловать, ${username}! Ваше рабочее пространство создано`,
    });
  };

  const handleLogin = () => {
    if (username === 'admin' && password === 'qwerty12+') {
      setCurrentUser({ username: 'admin', role: 'admin' });
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: 'Добро пожаловать, администратор!',
      });
      return;
    }

    const user = registeredUsers.find((u) => u.username === username && u.password === password);
    if (user) {
      setCurrentUser({ username: user.username, role: 'user' });
      setIsAuthenticated(true);
      toast({
        title: 'Вход выполнен',
        description: `Добро пожаловать, ${username}!`,
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Неверный логин или пароль',
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
            <CardDescription>
              {isRegisterMode
                ? 'Создайте аккаунт и получите свое рабочее пространство'
                : 'Войдите для доступа к рабочим пространствам'}
            </CardDescription>
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
            <Button onClick={isRegisterMode ? handleRegister : handleLogin} className="w-full" size="lg">
              <Icon name={isRegisterMode ? 'UserPlus' : 'LogIn'} size={18} className="mr-2" />
              {isRegisterMode ? 'Зарегистрироваться' : 'Войти'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setIsRegisterMode(!isRegisterMode)}
              className="w-full"
            >
              {isRegisterMode ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </Button>
            {!isRegisterMode && (
              <p className="text-xs text-center text-muted-foreground">
                Суперадмин: admin / qwerty12+
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  const getUserWorkspaceId = () => {
    if (currentUser?.role === 'admin') return null;
    const user = registeredUsers.find((u) => u.username === currentUser?.username);
    return user?.workspaceId || null;
  };

  return (
    <WorkspaceView
      user={currentUser!}
      onLogout={handleLogout}
      userWorkspaceId={getUserWorkspaceId()}
    />
  );
};

export default Index;