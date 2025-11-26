// common/websocket.config.ts
export const websocketCorsConfig = {
  cors: {
    origin: [
      'http://localhost:3000',
      'http://165.232.134.100:3000'
    ],
    credentials: true,
  },
};