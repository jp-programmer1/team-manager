import { useCallback, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '../services/api';
import { toast } from 'sonner';

export const HomePage = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('username') || "");
  const navigate = useNavigate();

  const handleCreateRoom = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await api.createRoom(roomName, userName);
    if (!res.id) toast.error("No se pudo crear la sala :c")
    
    localStorage.setItem('username', userName);
    localStorage.setItem('userId', res.users[0].id);
    navigate(`/room/${res.id}`);
  }, [roomName, userName, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <form className="w-full max-w-md space-y-6">
        <h1 className="text-3xl font-bold">Planning Poker</h1>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Tu nombre</label>
            <Input
              placeholder="Ingresa tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium leading-6 text-gray-900">Nombre de la sala</label>
            <Input
              placeholder="Ingresa el nombre de la sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              required
              className="mt-2"
            />
          </div>

          <Button
            className="w-full"
            type="submit"
            onClick={handleCreateRoom}
          >
            Crear sala
          </Button>
        </div>
      </form>
    </div>
  );
};
