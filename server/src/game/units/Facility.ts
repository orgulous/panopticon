import { DEFAULT_SIDE_COLOR } from "../utils/constants";
import Weapon from "./Weapon";

interface IFacility {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number;
    longitude: number;
    altitude: number;
    range: number;
    sideColor?: string;
    weapons?: Weapon[];
}

export default class Facility {
    id: string;
    name: string;
    sideName: string;
    className: string;
    latitude: number = 0.0;
    longitude: number = 0.0;
    altitude: number = 0.0; // FT ASL -- currently default -- need to reference from database
    range: number = 250; // NM -- currently default -- need to reference from database
    sideColor: string = 'black';
    weapons: Weapon[] = [];

    constructor(parameters: IFacility) {
        this.id = parameters.id;
        this.name = parameters.name;
        this.sideName = parameters.sideName;
        this.className = parameters.className;
        this.latitude = parameters.latitude;
        this.longitude = parameters.longitude;
        this.altitude = parameters.altitude;
        this.range = parameters.range;
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