import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/auth-context';
import { Loader2 } from 'lucide-react';

export const GitLabCallback = () => {
  const [searchParams] = useSearchParams();
  const { exchangeCodeForToken } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      const authenticate = async () => {
        try {
          await exchangeCodeForToken(code);
          // Redirigir al home después de autenticación exitosa
          navigate('/');
        } catch (error) {
          console.error('Error en la autenticación:', error);
          navigate('/login');
        }
      };

      authenticate();
    } else {
      navigate('/');
    }
  }, [searchParams, exchangeCodeForToken, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="mt-4 text-lg">Iniciando sesión con GitLab...</p>
      </div>
    </div>
  );
};
