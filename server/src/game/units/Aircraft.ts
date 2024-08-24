import { DEFAULT_SIDE_COLOR } from "../utils/constants";
import Weapon from "./Weapon";

interface IAircraft {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number;
    longitude: number;
    altitude: number;
    heading: number;
    speed: number;
    fuel: number;
    range: number;
    route?: number[][];
    selected?: boolean;
    sideColor?: string;
    weapons?: Weapon[];
}

export default class Aircraft {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number
    longitude: number
    altitude: number // FT ASL -- currently default -- need to reference from database
    heading: number
    speed: number // KTS -- currently default -- need to reference from database
    fuel: number
    range: number // NM -- currently default -- need to reference from database
    route: number[][] 
    selected: boolean
    sideColor: string
    weapons: Weapon[] 

    constructor(parameters: IAircraft) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.sideName = parameters.sideName;
        this.className = parameters.className;
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.altitude = parameters.altitude;
        this.heading = parameters.heading;
        this.speed = parameters.speed;
        this.fuel = parameters.fuel;
        this.range = parameters.range;
        this.route = parameters.route ?? [];
        this.selected = parameters.selected ?? false;
        this.sideColor = parameters.sideColor ?? DEFAULT_SIDE_COLOR;
        this.weapons = parameters.weapons ?? [];
    }

    getTotalWeaponQuantity(): number {
        let sum = 0;
        this.weapons.forEach(weapon => {
            sum += weapon.currentQuantity;
        });
        return sum;
    }

}