import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, VStack, Input, Heading, Text, Box } from '@chakra-ui/react';

export const HomePage = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = useCallback(() => {
    if (!roomName.trim() || !userName.trim()) return;
    // navigate(`/room/create?userName=${encodeURIComponent(userName)}&roomName=${encodeURIComponent(roomName)}`);
  }, [roomName, userName]);

  const handleJoinRoom = useCallback(() => {
    console.log("roomName", roomName);
    
    if (!roomName.trim() || !userName.trim()) return;
    navigate(`/room/join?roomId=${encodeURIComponent(roomName)}&userName=${encodeURIComponent(userName)}`);
  }, [roomName, userName]);

  return (
    <Container centerContent maxW="container.md" height="100vh" display="flex" flexDirection="column" justifyContent="center">
      <VStack spacing={6} width="100%">
        <Heading as="h1" size="2xl" mb={8}>
          Planning Poker
        </Heading>
        
        <Box width="100%" maxW="md">
          <Text mb={2}>Tu nombre</Text>
          <Input
            placeholder="Ingresa tu nombre"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            mb={4}
          />
          
          <Text mb={2}>Nombre de la sala</Text>
          <Input
            placeholder="Ingresa el nombre de la sala"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            mb={6}
          />
          
          <Button
            colorScheme="blue"
            width="100%"
            mb={4}
            onClick={handleCreateRoom}
          >
            Crear sala
          </Button>
          
          <Button
            variant="outline"
            width="100%"
            onClick={handleJoinRoom}
          >
            Unirse a sala existente
          </Button>
        </Box>
      </VStack>
    </Container>
  );
};
