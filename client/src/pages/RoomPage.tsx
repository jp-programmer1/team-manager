import {
  Box,
  Heading,
  VStack,
  Text,
  Button,
  useDisclosure,
  Input,
} from "@chakra-ui/react";
import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { api, socket } from "../services/api";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  AlertDialogCloseButton,
} from "@chakra-ui/react";
console.log("socket", socket);

export const RoomPage = () => {
  const username = localStorage.getItem("username");
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const cancelRef = useRef(null);

  useEffect(() => {
    if (roomId && username) {
      socket.emit("joinRoom", { roomId });
    }
  }, [roomId, username]);

  useEffect(() => {
    if (!roomId) {
      navigate("/");
      return;
    }
    if (!username) {
      console.log("ola");

      onOpen();
    }
    // Escuchar actualizaciones de usuarios en la sala
    socket.on("userJoined", (userList) => {
      console.log("userList", userList);
      setUsers(userList);
    });

    return () => {
      socket.off("userJoined");
    };
  }, [roomId, navigate, username, onOpen]);

  const onFinished = useCallback((newUsername: string) => {
    if (roomId && newUsername){
      localStorage.setItem('username', newUsername);
      api.joinRoom(roomId, newUsername);
    }
  }, [roomId]);

  return (
    <>
      <Box p={8} background={"GrayText"}>
        <VStack spacing={6} align="stretch">
          <Heading>Sala: {roomId}</Heading>

          <Box>
            <Text fontSize="xl" mb={4}>
              Usuarios en la sala:
            </Text>
            {users.map((user) => (
              <Text key={user.id}>{user.name}</Text>
            ))}
          </Box>

          <Button
            colorScheme="red"
            onClick={() => navigate("/")}
            alignSelf="flex-start"
          >
            Abandonar sala
          </Button>
        </VStack>
      </Box>
      <DialogNewUser
        isOpen={isOpen}
        onClose={onClose}
        cancelRef={cancelRef}
        onFinished={onFinished}
      />
    </>
  );
};

const DialogNewUser = ({ isOpen, onClose, cancelRef, onFinished }) => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState(
    localStorage.getItem("username") || ""
  );

  const onCloseModal = () => {
    navigate("/");
    onClose();
  };
  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onCloseModal}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Ingrese su nombre
          </AlertDialogHeader>

          <form>
            <AlertDialogBody>
              <Text mb={2}>Tu nombre</Text>
              <Input
                placeholder="Ingresa tu nombre"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                mb={4}
                required
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                colorScheme="blue"
                type="submit"
                onClick={() => {
                  onFinished(userName);
                }}
                ml={3}
              >
                Aceptar
              </Button>
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};
