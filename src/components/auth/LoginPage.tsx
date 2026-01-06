import { useState } from 'react';
import { Cloud, Eye, EyeOff, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'owner@cloud.io', label: 'Owner', role: 'Acesso total ao sistema' },
    { email: 'admin@cloud.io', label: 'Admin', role: 'Gerencia usuários e storage' },
    { email: 'staff@cloud.io', label: 'Staff', role: 'Visualiza usuários' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-card via-background to-secondary relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="relative z-10 flex flex-col justify-center p-12 lg:p-20">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary animate-float">
              <Cloud className="w-9 h-9 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">CloudStore</h1>
              <p className="text-muted-foreground">Enterprise Storage System</p>
            </div>
          </div>

          <h2 className="text-4xl lg:text-5xl font-bold text-foreground mb-6 leading-tight">
            Armazenamento<br />
            <span className="gradient-text">Seguro e Rápido</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-8 max-w-md">
            Sistema completo de cloud storage com gerenciamento de usuários, 
            controle de acesso por níveis e banco de dados isolado por usuário.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            {[
              { label: 'Hierarquia', value: 'Owner → Admin → Staff → User' },
              { label: 'Banco Local', value: 'SQLite por usuário' },
              { label: 'Upload', value: 'Drag & Drop' },
              { label: 'Segurança', value: 'Criptografia E2E' },
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-background">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Cloud className="w-7 h-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">CloudStore</h1>
              <p className="text-xs text-muted-foreground">Enterprise Storage</p>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-8 animate-scale-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {isLogin ? 'Bem-vindo de volta' : 'Criar conta'}
              </h2>
              <p className="text-muted-foreground">
                {isLogin
                  ? 'Entre com suas credenciais'
                  : 'Preencha os dados para começar'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div className="space-y-2">
                  <Label className="text-foreground">Nome</Label>
                  <Input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-secondary border-border h-12"
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label className="text-foreground">Email</Label>
                <Input
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-secondary border-border h-12"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Senha</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-secondary border-border h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium gap-2"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <>
                    {isLogin ? 'Entrar' : 'Criar conta'}
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
                <span className="text-primary font-medium">
                  {isLogin ? 'Criar agora' : 'Fazer login'}
                </span>
              </button>
            </div>

            {/* Demo Accounts */}
            {isLogin && (
              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                  <Sparkles className="w-3 h-3 text-primary" />
                  Contas demo para teste:
                </p>
                <div className="space-y-2">
                  {demoAccounts.map((account) => (
                    <button
                      key={account.email}
                      onClick={() => {
                        setEmail(account.email);
                        setPassword('demo123');
                      }}
                      className="w-full text-left p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-foreground">{account.label}</span>
                        <span className="text-xs text-muted-foreground">{account.email}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{account.role}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
