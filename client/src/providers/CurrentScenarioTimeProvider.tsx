import React, { createContext, useState } from 'react';

const CurrentScenarioTimeContext = createContext(0)
const SetCurrentScenarioTimeContext = createContext((time: number) => {})

const CurrentScenarioTimeProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentScenarioTime, setCurrentScenarioTime] = useState(0);

    return (
        <CurrentScenarioTimeContext.Provider value={currentScenarioTime}>
            <SetCurrentScenarioTimeContext.Provider value={setCurrentScenarioTime}>
                {children}
            </SetCurrentScenarioTimeContext.Provider>
        </CurrentScenarioTimeContext.Provider>
    );
};

export { CurrentScenarioTimeContext, SetCurrentScenarioTimeContext, CurrentScenarioTimeProvider };