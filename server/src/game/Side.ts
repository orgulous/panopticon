import { DEFAULT_SIDE_COLOR } from "./utils/constants";

interface ISide {
    id: string;
    name: string;
    totalScore?: number;
    sideColor?: string;
}

export default class Side {
    id: string;
    name: string;
    totalScore: number;
    sideColor: string;

    constructor(parameters: ISide) {  
        this.id = parameters.id;
        this.name = parameters.name;
        this.totalScore = parameters.totalScore ?? 0;
        this.sideColor = parameters.sideColor ?? DEFAULT_SIDE_COLOR;
    }

}