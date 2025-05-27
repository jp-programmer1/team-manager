import { Box, Heading, VStack, Text, Button } from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { socket } from '../services/api';

export const RoomPage = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    if (!roomId) {
      navigate('/');
      return;
    }

    // Escuchar actualizaciones de usuarios en la sala
    socket.on('userJoined', (userList) => {
      setUsers(userList);
    });

    return () => {
      socket.off('userJoined');
    };
  }, [roomId, navigate]);

  return (
    <Box p={8}>
      <VStack spacing={6} align="stretch">
        <Heading>Sala: {roomId}</Heading>
        
        <Box>
          <Text fontSize="xl" mb={4}>Jugadores en la sala:</Text>
          {users.map((user) => (
            <Text key={user.id}>{user.name}</Text>
          ))}
        </Box>

        <Button 
          colorScheme="red" 
          onClick={() => navigate('/')}
          alignSelf="flex-start"
        >
          Abandonar sala
        </Button>
      </VStack>
    </Box>
  );
};