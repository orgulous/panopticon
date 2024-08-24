import { v4 as uuidv4 } from "uuid";

import Scenario from "../game/Scenario";
import Game from "../game/Game";
import ClientMessageHandler from "./ClientMessageHandler";
import { WS_URL } from "../utils/constants";
import { loadGame, serverMessageTypesDef } from "./clientUtils";
import { WebSocketLike } from "react-use-websocket/dist/lib/types";

interface IClient {
  id?: string;
  ws?: WebSocket;
}

export default class Client {
  id: string;
  ws: WebSocket;

  constructor(parameters: IClient) {
    this.id = parameters.id ?? uuidv4();
    this.ws = parameters.ws ?? new WebSocket(WS_URL);
  }

  decodeMessage(message: MessageEvent<any>): [string, any] {
    const [type, content] = ClientMessageHandler.processMessage(message.data);
    console.log(
      `Client received message of type ${type} from server with content ${content}.`
    );
    return [type, content];
  }

  sendMessage(messageType: string, messageContet: any): void {
    const message = ClientMessageHandler.createMessage(
      messageType,
      messageContet
    );
    this.ws.send(message);
  }
}

export class ScenarioMapClient extends Client {
  constructor(parameters: IClient) {
    super(parameters);
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({ type: "loaddefaultscenario" }));
    };
  }
}
