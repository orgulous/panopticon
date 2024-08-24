import Aircraft from "./units/Aircraft";
import Airbase from "./units/Airbase";
import Facility from "./units/Facility";
import Side from "./Side";
import Weapon from "./units/Weapon";

interface IScenario {
    id: string;
    name: string;
    startTime: number;
    currentTime?: number;
    duration: number;
    sides: Side[];
    timeCompression?: number;
    aircraft?: Aircraft[];
    facilities?: Facility[];
    airbases?: Airbase[];
    weapons?: Weapon[];
}

export default class Scenario {
    id: string;
    name: string;
    startTime: number;
    currentTime: number;
    duration: number;
    sides: Side[];
    timeCompression: number;
    aircraft: Aircraft[];
    facilities: Facility[];
    airbases: Airbase[]
    weapons: Weapon[]

    constructor(parameters: IScenario) {  
        this.id = parameters.id;
        this.name = parameters.name;
        this.startTime = parameters.startTime;
        this.currentTime = parameters.currentTime ?? parameters.startTime;
        this.duration = parameters.duration;
        this.sides = parameters.sides;
        this.timeCompression = parameters.timeCompression ?? 1;
        this.aircraft = parameters.aircraft ?? [];
        this.facilities = parameters.facilities ?? [];
        this.airbases = parameters.airbases ?? [];
        this.weapons = parameters.weapons ?? [];
    }

    getSide(sideName: string): Side | undefined {
        return this.sides.find((side) => side.name === sideName);
    }

    getSideColor(sideName: string): string {
        const side = this.getSide(sideName);
        if (side) {
            return side.sideColor;
        }
        return 'black';
    }

    getAircraft(aircraftId: string | null): Aircraft | undefined {
        return this.aircraft.find((aircraft) => aircraft.id === aircraftId);
    }

    getFacility(facilityId: string | null): Facility | undefined {
        return this.facilities.find((facility) => facility.id === facilityId);
    }

    getAirbase(airbaseId: string | null): Airbase | undefined {
        return this.airbases.find((airbase) => airbase.id === airbaseId);
    }

    getWeapon(weaponId: string | null): Weapon | undefined {
        return this.weapons.find((weapon) => weapon.id === weaponId);
    }

    updateAircraft(aircraftId: string, aircraftName: string, aircraftClassName: string, aircraftSpeed: number, aircraftWeaponQuantity: number) {
        const aircraft = this.getAircraft(aircraftId);
        if (aircraft) {
            aircraft.name = aircraftName;
            aircraft.className = aircraftClassName;
            aircraft.speed = aircraftSpeed;
            aircraft.weapons.forEach((weapon) => {
                weapon.currentQuantity = aircraftWeaponQuantity;
            })
        }
    }

    updateFacility(facilityId: string, facilityName: string, facilityClassName: string, facilityRange: number, facilityWeaponQuantity: number) {
        const facility = this.getFacility(facilityId);
        if (facility) {
            facility.name = facilityName;
            facility.className = facilityClassName;
            facility.range = facilityRange;
            facility.weapons.forEach((weapon) => {
                weapon.currentQuantity = facilityWeaponQuantity;
            })
        }
    }

    updateAirbase(airbaseId: string, airbaseName: string) {
        const airbase = this.getAirbase(airbaseId);
        if (airbase) {
            airbase.name = airbaseName;
        }
    }
}