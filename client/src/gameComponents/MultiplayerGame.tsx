import React from "react";

import ScenarioMap from "../gui/map/ScenarioMap";
import { GameContextProvider } from "../providers/GameContextProvider";
import ToolBar from "../gui/map/ToolBar";
import { CurrentScenarioTimeProvider } from "../providers/CurrentScenarioTimeProvider";

interface MultiplayerGameProps {
  ws: WebSocket;
}

export default function MultiplayerGame(props: Readonly<MultiplayerGameProps>) {
  return (
    // <GameContextProvider>
    //   <CurrentScenarioTimeProvider>
    //     <ToolBar ws={props.ws}></ToolBar>
    //     <ScenarioMap
    //       center={props.center}
    //       zoom={props.zoom}
    //       projection={props.projection}
    //       ws={props.ws}
    //     ></ScenarioMap>
    //   </CurrentScenarioTimeProvider>
    // </GameContextProvider>
    <></>
  );
}
