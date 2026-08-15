import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { createApp } from "./app";
import { env } from "./config/env";

const app = createApp();
const httpServer = http.createServer(app);

// Temps réel (notifications, présence live, etc.) — utilisé par les modules
// suivants (Communication, Présence, Caisse).
export const io = new SocketIOServer(httpServer, {
  cors: { origin: env.corsOrigin, credentials: true },
});

io.on("connection", (socket) => {
  socket.on("join:school", (schoolId: string) => {
    socket.join(`school:${schoolId}`);
  });
});

httpServer.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`✅ e-sekooly API démarrée sur http://localhost:${env.port}`);
});
