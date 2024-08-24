import React from "react";
import { get as getProjection, transform } from "ol/proj.js";
import { v4 as uuidv4 } from "uuid";

import ScenarioMap from "../gui/map/ScenarioMap";
import { DEFAULT_OL_PROJECTION_CODE } from "../utils/constants";
import { GameContextProvider } from "../providers/GameContextProvider";
import ToolBar from "../gui/map/ToolBar";
import { CurrentScenarioTimeProvider } from "../providers/CurrentScenarioTimeProvider";
import Side from "../game/Side";
import Scenario from "../game/Scenario";
import Game from "../game/Game";
import defaultScenarioJson from "../scenarios/default_scenario.json";
import SCSScenarioJson from "../scenarios/SCS.json";

const defaultProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);
const defaultCenter = transform(
  [0, 0],
  "EPSG:4326",
  DEFAULT_OL_PROJECTION_CODE
);
const defaultZoom = 5;

const sideBlue = new Side({
  id: uuidv4(),
  name: "BLUE",
  sideColor: "blue",
});
const sideRed = new Side({
  id: uuidv4(),
  name: "RED",
  sideColor: "red",
});
const currentScenario = new Scenario({
  id: uuidv4(),
  name: "Test Scenario",
  startTime: 1699073110,
  currentTime: 1699073110,
  duration: 14400,
  sides: [sideBlue, sideRed],
  timeCompression: 1,
});
const theGame = new Game(currentScenario);
theGame.currentSideName = sideBlue.name;

theGame.loadScenario(JSON.stringify(SCSScenarioJson));
const theGameProjection = getProjection(DEFAULT_OL_PROJECTION_CODE);
const theGameCenter = transform(
  theGame.mapView.currentCameraCenter,
  "EPSG:4326",
  DEFAULT_OL_PROJECTION_CODE
);
const theGameZoom = theGame.mapView.currentCameraZoom;

export default function SingleplayerGame() {
  return (
    <GameContextProvider>
      <CurrentScenarioTimeProvider>
        <ToolBar></ToolBar>
        <ScenarioMap
          game={theGame}
          center={theGameCenter ?? defaultCenter}
          zoom={theGameZoom ?? defaultZoom}
          projection={theGameProjection ?? defaultProjection!}
        ></ScenarioMap>
      </CurrentScenarioTimeProvider>
    </GameContextProvider>
  );
}
