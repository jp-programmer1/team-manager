import { useCallback, useState, type FormEvent, type FormEventHandler } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Container,
  VStack,
  Input,
  Heading,
  Text,
  Box,
} from '@chakra-ui/react';
import { useToast } from '@chakra-ui/react';
import { api } from '../services/api';

export const HomePage = () => {
  const [roomName, setRoomName] = useState('');
  const [userName, setUserName] = useState(localStorage.getItem('username') || "");
  const navigate = useNavigate();
  const toast = useToast();

  const handleCreateRoom = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    localStorage.setItem('username', userName);
    const res = await api.createRoom(roomName, userName);
    if (!res.id) toast({title: "Error", description: "No se pudo crear la sala :c", status: 'error'})
    navigate(`/room/${res.id}`);
  }, [roomName, userName]);

  return (
    <Container
      centerContent
      maxW="container.md"
      height="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
    >
      <VStack spacing={6} width="100%">
        <Heading as="h1" size="2xl" mb={8}>
          Planning Poker
        </Heading>
        <form>
          <Box width="100%" maxW="md">
            <Text mb={2}>Tu nombre</Text>
            <Input
              placeholder="Ingresa tu nombre"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              mb={4}
              required
            />

            <Text mb={2}>Nombre de la sala</Text>
            <Input
              placeholder="Ingresa el nombre de la sala"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              mb={6}
              required
            />

            <Button
              colorScheme="blue"
              width="100%"
              mb={4}
              type="submit"
              onClick={handleCreateRoom}
            >
              Crear sala
            </Button>
          </Box>
        </form>
      </VStack>
    </Container>
  );
};
