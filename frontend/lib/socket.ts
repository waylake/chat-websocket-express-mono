import { io, Socket } from "socket.io-client";

const SOCKET_IO_URL = process.env.NEXT_PUBLIC_SOCKET_IO_URL;

let socket: Socket;

export const initSocket = () => {
  if (!SOCKET_IO_URL) {
    throw new Error("Socket.io URL is not defined");
  }
  socket = io(SOCKET_IO_URL);
  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};
