import { serverMessageTypesDef } from "./clientUtils";

export default abstract class ClientMessageHandler {
  public static processMessage(message: string): any {
    const convertedMessage = JSON.parse(message);
    const { type, content } = convertedMessage;
    switch (type) {
      case serverMessageTypesDef.LOAD_DEFAULT_SCENARIO:
        return [type, content];
      case serverMessageTypesDef.STEP_SCENARIO:
        return [type, content];
      case serverMessageTypesDef.UPDATE_SCENARIO_CURRENT_TIME:
        return [type, content];
      default:
        return ["unknown", {}];
    }
  }

  public static createMessage(type: string, content: any): any {
    return JSON.stringify({ type, content });
  }
}
