import React, { useEffect } from "react";
import useWebSocket from "react-use-websocket";
import { WS_URL } from "../utils/constants";

interface ClientProps {
  wsMessageFilter: (message: any) => boolean;
  wsOnOpen: () => void;
  wsOnMessage: (message: any) => boolean;
}

export default function ClientComponent(props: Readonly<ClientProps>) {
  const { lastJsonMessage, sendJsonMessage } = useWebSocket(WS_URL, {
    share: true,
    filter: props.wsMessageFilter,
    onOpen: props.wsOnOpen,
    onMessage: props.wsOnMessage,
  });

  useEffect(() => {
    if (lastJsonMessage === null) return;
    const shouldReturnMessage = props.wsOnMessage(lastJsonMessage);
    if (shouldReturnMessage) {
      const returnMessage = props.wsOnMessage(lastJsonMessage);
      sendJsonMessage(returnMessage);
    }
  }, [lastJsonMessage]);

  return null;
}
