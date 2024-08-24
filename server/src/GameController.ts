import { v4 as uuidv4 } from "uuid";

import Side from './game/Side';
import Scenario from './game/Scenario';
import Game from './game/Game';
import defaultScenarioJson from '../../client/src/scenarios/default_scenario.json';
import SCSScenarioJson from '../../client/src/scenarios/SCS.json';

export default abstract class GameController {        
    public static getDefaultScenario() {
        const sideBlue = new Side({
            id: uuidv4(),
            name: 'BLUE',
            sideColor: 'blue'
        });
        const sideRed = new Side({
            id: uuidv4(),
            name: 'RED',
            sideColor: 'red'
        });
        const currentScenario = new Scenario({
            id: uuidv4(),
            name: 'Test Scenario',
            startTime: 1699073110,
            currentTime: 1699073110,
            duration: 14400,
            sides: [sideBlue, sideRed],
            timeCompression: 1
        });
        const theGame = new Game(currentScenario);
        theGame.currentSideName = sideBlue.name;
    
        theGame.loadScenario(JSON.stringify(SCSScenarioJson)); // loads default scenario for easier testing
        return theGame
    }
    
    public static stepGameForStepSize(game: Game, stepSize: number = 1): [Scenario, number, boolean, boolean, any] {
        let steps = 1
        let [observation, reward, terminated, truncated, info] = game.step()
        while (steps < stepSize) {
            [observation, reward, terminated, truncated, info] = game.step();
            steps++
        }
        return [observation, reward, terminated, truncated, info]
    }
}
