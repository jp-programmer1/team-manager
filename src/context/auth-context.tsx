import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

export type User = {
  id: number;
  name: string;
  username: string;
  avatar_url: string;
  email: string;
  accessToken: string;
};

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  exchangeCodeForToken: (code: string) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un usuario en localStorage al cargar la aplicación
    const userData = localStorage.getItem('gitlab_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setIsLoading(false);
  }, []);

  const login = () => {
    const authUrl = `https://gitlab.com/oauth/authorize?client_id=${
      import.meta.env.VITE_GITLAB_CLIENT_ID
    }&redirect_uri=${
      import.meta.env.VITE_REDIRECT_URI
    }&response_type=code&scope=read_user+openid+api+read_api+write_repository+write_registry`;
    window.location.href = authUrl;
  };

  const logout = () => {
    localStorage.removeItem('gitlab_user');
    setUser(null);
  };

  const exchangeCodeForToken = async (code: string) => {
    console.log('Código de autorización recibido:', code);
    
    try {
      const tokenUrl = 'https://gitlab.com/oauth/token';
      const params = new URLSearchParams();
      params.append('client_id', import.meta.env.VITE_GITLAB_CLIENT_ID);
      params.append('client_secret', import.meta.env.VITE_GITLAB_CLIENT_SECRET);
      params.append('code', code);
      params.append('grant_type', 'authorization_code');
      params.append('redirect_uri', import.meta.env.VITE_REDIRECT_URI);

      console.log('Solicitando token a:', tokenUrl);
      console.log('Parámetros:', Object.fromEntries(params));

      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'application/json',
        },
        body: params,
      });


      if (!response.ok) {
        throw new Error('Error al obtener el token de acceso');
      }

      const data = await response.json();
      const { access_token } = data;

      // Obtener información del usuario
      const userResponse = await fetch('https://gitlab.com/api/v4/user', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
      });

      if (!userResponse.ok) {
        throw new Error('Error al obtener la información del usuario');
      }

      const userData = await userResponse.json();
      setUser({...userData, accessToken: access_token});
      localStorage.setItem('gitlab_user', JSON.stringify({...userData, accessToken: access_token}));
    } catch (error) {
      console.error('Error en la autenticación:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (!user) {
      const userData = localStorage.getItem('gitlab_user');
      if (userData) {
        setUser(JSON.parse(userData));
      }
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, exchangeCodeForToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
