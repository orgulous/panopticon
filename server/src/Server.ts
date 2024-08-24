import { RawData, WebSocket, WebSocketServer } from "ws";
import * as http from "http";
import { v4 as uuidv4 } from "uuid";

import Game from "./game/Game";
import GameController from "./GameController";
import ServerMessageHandler from "./ServerMessageHandler";
import { messageTypesDef } from "./serverUtils";

export default class WebSocketServerWrapper {
  private server: http.Server;
  public wsServer: WebSocketServer;
  private port: number;
  private clients: { [key: string]: WebSocket } = {};
  private sessions: string[] = [];
  private sessionGames: { [key: string]: Game } = {};
  private sessionClients: { [key: string]: string[] } = {};

  constructor() {
    this.server = http.createServer();
    this.wsServer = new WebSocketServer({ server: this.server });
    this.port = 8080;
    this.server.listen(this.port, () => {
      console.log(`WebSocket server is running on port ${this.port}`);
    });
    this.wsServer.on("connection", (connection) => {
      const userId = this.registerNewClient(connection);
      const sessionId = this.createSession();
      this.addClientToSession(sessionId, userId);
      console.log("Active clients: ", Object.keys(this.clients));
      console.log("Active sessions: ", this.sessions);
    });
  }

  registerNewClient(connection: WebSocket, userId?: string) {
    const finalUserId = userId ?? uuidv4();
    this.clients[finalUserId] = connection;
    console.log(`Registered new client with id ${finalUserId}.`);

    connection.on("message", (message) =>
      this.handleMessage(message, finalUserId)
    );
    connection.on("close", () => this.handleClientDisconnect(finalUserId));

    return finalUserId;
  }

  createSession() {
    const sessionId = uuidv4();
    this.sessions.push(sessionId);
    console.log(`Created session ${sessionId}.`);
    return sessionId;
  }

  addClientToSession(sessionId: string, userId: string) {
    if (!this.sessionClients[sessionId]) {
      this.sessionClients[sessionId] = [];
    }
    if (!this.sessionClients[sessionId].includes(userId))
      this.sessionClients[sessionId].push(userId);
    console.log(`Added ${userId} to session ${sessionId}.`);
  }

  removeClientFromSession(userId: string, sessionId?: string) {
    const finalSessonId = sessionId ?? this.findSessionForClient(userId);
    if (finalSessonId && this.sessionClients[finalSessonId]) {
      const index = this.sessionClients[finalSessonId].indexOf(userId);
      if (index > -1) {
        this.sessionClients[finalSessonId].splice(index, 1);
        console.log(`Removed ${userId} from session ${finalSessonId}.`);
        return finalSessonId;
      }
    }
  }

  removeSession(sessionId: string) {
    const index = this.sessions.indexOf(sessionId);
    if (index > -1) {
      this.sessions.splice(index, 1);
      delete this.sessionGames[sessionId];
      delete this.sessionClients[sessionId];
      console.log(`Removed session ${sessionId}.`);
    }
  }

  addGameToSession(scenario: Game, sessionId: string) {
    this.sessionGames[sessionId] = scenario;
    console.log(
      `Added game ${scenario.currentScenario.id} to session ${sessionId}.`
    );
  }

  findSessionForClient(userId: string) {
    return this.sessions.find((sessionId) =>
      this.sessionClients[sessionId].includes(userId)
    );
  }

  broadcastMessage(data: string) {
    console.log(`Server broadcasting message`);
    for (let userId in this.clients) {
      let client = this.clients[userId];
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    }
  }

  handleMessage(message: RawData, userId: string) {
    const sessionId = this.findSessionForClient(userId);
    if (!sessionId) return;

    const returnMessages = [];

    const [type, content] = ServerMessageHandler.processMessage(message);
    console.log(`Server received message of type ${type} from ${userId}`);
    if (type === messageTypesDef.LOAD_DEFAULT_SCENARIO) {
      console.log("Loading default scenario");
      const defaultScenario = GameController.getDefaultScenario();
      this.addGameToSession(defaultScenario, sessionId);
      returnMessages.push(
        ServerMessageHandler.createMessage(type, defaultScenario)
      );
      returnMessages.push(
        ServerMessageHandler.createMessage(
          messageTypesDef.UPDATE_SCENARIO_CURRENT_TIME,
          defaultScenario.currentScenario.currentTime
        )
      );
    } else if (type === messageTypesDef.STEP_SCENARIO) {
      console.log("Stepping scenario");
      const stepSize = content.stepSize;
      const [observation, reward, terminated, truncated, info] =
        GameController.stepGameForStepSize(
          this.sessionGames[sessionId],
          stepSize
        );
      returnMessages.push(
        ServerMessageHandler.createMessage(type, observation)
      );
      returnMessages.push(
        ServerMessageHandler.createMessage(
          messageTypesDef.UPDATE_SCENARIO_CURRENT_TIME,
          observation.currentTime
        )
      );
    }

    returnMessages.forEach((message) => this.broadcastMessage(message));
  }

  handleClientDisconnect(userId: string) {
    const clientSession = this.removeClientFromSession(userId);
    if (clientSession && this.sessionClients[clientSession].length === 0)
      this.removeSession(clientSession);
    delete this.clients[userId];
    console.log(`${userId} disconnected.`);
  }
}
