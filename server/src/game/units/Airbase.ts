import { DEFAULT_SIDE_COLOR } from "../utils/constants";
import Aircraft from "./Aircraft";

interface IAirbase {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number;
    longitude: number;
    altitude: number;
    sideColor?: string;
    aircraft?: Aircraft[];
}

export default class Airbase {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number;
    longitude: number;
    altitude: number; // FT ASL -- currently default -- need to reference from database
    sideColor: string;
    aircraft: Aircraft[] 

    constructor(parameters: IAirbase) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.sideName = parameters.sideName;
        this.className = parameters.className;
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.altitude = parameters.altitude;
        this.sideColor = parameters.sideColor ?? DEFAULT_SIDE_COLOR;
        this.aircraft = parameters.aircraft ?? [];
    }

}