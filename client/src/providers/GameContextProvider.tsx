import React, { createContext, useState } from "react";

const GameContext = createContext({
  addingAircraft: false,
  addingFacility: false,
  addingAirbase: false,
  paused: true,
  currentSideName: "",
  featureLabelVisibility: true,
});
const SetGameContext = createContext(
  (currentGameContextParameters: {
    addingAircraft: boolean;
    addingFacility: boolean;
    addingAirbase: boolean;
    paused: boolean;
    currentSideName: string;
    featureLabelVisibility: boolean;
  }) => {}
);

const GameContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [currentGameContext, setCurrentGameContext] = useState({
    addingAircraft: false,
    addingFacility: false,
    addingAirbase: false,
    paused: true,
    currentSideName: "",
    featureLabelVisibility: true,
  });

  return (
    <GameContext.Provider value={currentGameContext}>
      <SetGameContext.Provider value={setCurrentGameContext}>
        {children}
      </SetGameContext.Provider>
    </GameContext.Provider>
  );
};

export { GameContext, SetGameContext, GameContextProvider };
