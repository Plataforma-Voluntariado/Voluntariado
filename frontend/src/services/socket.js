import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_URL_SERVER_VOLUNTARIADO;

export const createSocketConnection = (namespace = '') => {
  const url = namespace ? `${SOCKET_URL}${namespace}` : SOCKET_URL;
  
  return io(url, {
    withCredentials: true,
    autoConnect: false,
  });
};

export default createSocketConnection;