import { messageTypesDef } from "./constants";

export default abstract class ServerMessageHandler {
    public static processMessage(message: any): [string, any] {
        const convertedMessage = JSON.parse(message.toString());
        const { type, content } = convertedMessage;
        switch (type) {
            case messageTypesDef.LOAD_DEFAULT_SCENARIO:
                return [type, content];
            case messageTypesDef.STEP_SCENARIO:
                return [type, content];
            default:
                return ['unknown', {}];
        }
    }

    public static createMessage(type: string, content: any): any {
        return JSON.stringify({ type, content });
    }
}
