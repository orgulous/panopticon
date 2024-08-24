import React, { useState } from "react";

import { WS_URL } from "../utils/constants";
import SingleplayerGame from "./SingleplayerGame";
import MultiplayerGame from "./MultiplayerGame";

// const ws = new WebSocket(WS_URL);

export default function GameSession() {
  const [isSingleplayerGame, setIsSingleplayerGame] = useState(true);

  return (
    <>
      {isSingleplayerGame && <SingleplayerGame></SingleplayerGame>}
      {/* {!isSingleplayerGame && ws && <MultiplayerGame ws={ws}></MultiplayerGame>} */}
    </>
  );
}
