"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app_1 = require("./app");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
const httpServer = http_1.default.createServer(app);
// Temps réel (notifications, présence live, etc.) — utilisé par les modules
// suivants (Communication, Présence, Caisse).
exports.io = new socket_io_1.Server(httpServer, {
    cors: { origin: env_1.env.corsOrigin, credentials: true },
});
exports.io.on("connection", (socket) => {
    socket.on("join:school", (schoolId) => {
        socket.join(`school:${schoolId}`);
    });
});
httpServer.listen(env_1.env.port, () => {
    // eslint-disable-next-line no-console
    console.log(`✅ e-sekooly API démarrée sur http://localhost:${env_1.env.port}`);
});
//# sourceMappingURL=server.js.map