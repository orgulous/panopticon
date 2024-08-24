import { v4 as uuidv4 } from "uuid";

import Aircraft from "./units/Aircraft";
import Facility from "./units/Facility";
import Scenario from "./Scenario";

import { getBearingBetweenTwoPoints, getNextCoordinates, getDistanceBetweenTwoPoints } from "./utils/utils";
import { checkIfAircraftIsWithinFacilityThreatRange, checkTargetTrackedByCount, launchWeapon, weaponEngagement } from "./engine/weaponEngagement";
import Airbase from "./units/Airbase";
import Side from "./Side";
import Weapon from "./units/Weapon";
import { GAME_SPEED_DELAY_MS } from "./utils/constants";

interface IMapView {
    defaultCenter: number[];
    currentCameraCenter: number[];
    defaultZoom: number;
    currentCameraZoom: number;
}

export default class Game {
    mapView: IMapView = {
        defaultCenter: [0, 0],
        currentCameraCenter: [0, 0],
        defaultZoom: 0,
        currentCameraZoom: 0,
    }
    currentScenario: Scenario;
    currentSideName: string = '';
    scenarioPaused: boolean = true;
    addingAircraft: boolean = false;
    addingAirbase: boolean = false;
    addingFacility: boolean = false;
    selectingTarget: boolean = false;
    currentAttackerId: string = '';
    selectedUnitId: string = '';
    numberOfWaypoints: number = 50;

    constructor(currentScenario: Scenario) {
        this.currentScenario = currentScenario;
    }

    addAircraft(aircraftName: string, className: string, latitude: number, longitude: number): Aircraft | undefined {
        if (!this.currentSideName) {
            return;
        }
        const aircraft = new Aircraft({
            id: uuidv4(), 
            name: aircraftName, 
            sideName: this.currentSideName, 
            className: className,
            latitude: latitude,
            longitude: longitude,
            altitude: 10000.0,
            heading: 90.0,
            speed: 300.0,
            fuel: 10000.0,
            range: 100,
            sideColor: this.currentScenario.getSideColor(this.currentSideName),
            weapons: [this.getSampleWeapon(10, 0.25)],
        });
        this.currentScenario.aircraft.push(aircraft);
        return aircraft
    }

    addAircraftToAirbase(aircraftName: string, className: string, airbaseId: string) {
        if (!this.currentSideName) {
            return;
        }
        const airbase = this.currentScenario.getAirbase(airbaseId);
        if (airbase) {
            const aircraft = new Aircraft({
                id: uuidv4(), 
                name: aircraftName, 
                sideName: this.currentSideName, 
                className: className,
                latitude: airbase.latitude - 0.5, 
                longitude: airbase.longitude - 0.5,
                altitude: 10000.0,
                heading: 90.0,
                speed: 300.0,
                fuel: 10000.0,
                range: 100,
                sideColor: this.currentScenario.getSideColor(this.currentSideName),
                weapons: [this.getSampleWeapon(10, 0.25)],
            });
            airbase.aircraft.push(aircraft);
        }
    }

    addAirbase(airbaseName: string, className: string, latitude: number, longitude: number) {
        if (!this.currentSideName) {
            return;
        }
        const airbase = new Airbase({
            id: uuidv4(), 
            name: airbaseName, 
            sideName: this.currentSideName, 
            className: className,
            latitude: latitude,
            longitude: longitude,
            altitude: 0.0,
            sideColor: this.currentScenario.getSideColor(this.currentSideName),
        });
        this.currentScenario.airbases.push(airbase);
        return airbase
    }

    removeAirbase(airbaseId: string) {
        this.currentScenario.airbases = this.currentScenario.airbases.filter((airbase) => airbase.id !== airbaseId);
    }

    removeFacility(facilityId: string) {
        this.currentScenario.facilities = this.currentScenario.facilities.filter((facility) => facility.id !== facilityId);
    }

    removeAircraft(aircraftId: string) {
        this.currentScenario.aircraft = this.currentScenario.aircraft.filter((aircraft) => aircraft.id !== aircraftId);
    }

    addFacility(facilityName: string, className: string, latitude: number, longitude: number) {
        if (!this.currentSideName) {
            return;
        }
        const facility = new Facility({
            id: uuidv4(), 
            name: facilityName, 
            sideName: this.currentSideName, 
            className: className,
            latitude: latitude,
            longitude: longitude,
            altitude: 0.0,
            range: 250,
            sideColor: this.currentScenario.getSideColor(this.currentSideName),
            weapons: [this.getSampleWeapon(30, 0.1)],
        });
        this.currentScenario.facilities.push(facility);
        return facility
    }

    getSampleWeapon(quantity: number, lethality: number, sideName: string = this.currentSideName) {
        const weapon = new Weapon({
            id: uuidv4(), 
            name: 'Sample Weapon', 
            sideName: sideName, 
            className: 'Sample Weapon',
            latitude: 0.0,
            longitude: 0.0,
            altitude: 10000.0,
            heading: 90.0,
            speed: 1000.0,
            fuel: 10000.0,
            range: 100,
            sideColor: this.currentScenario.getSideColor(sideName),
            targetId: null,
            lethality: lethality,
            maxQuantity: quantity,
            currentQuantity: quantity,
        });
        return weapon;
    }

    moveAircraft(aircraftId: string, newLatitude: number, newLongitude: number) {
        const aircraft = this.currentScenario.getAircraft(aircraftId);
        if (aircraft) {
            aircraft.route = [[newLatitude, newLongitude]];
            aircraft.heading = getBearingBetweenTwoPoints(aircraft.latitude, aircraft.longitude, newLatitude, newLongitude);
            return aircraft
        }
    }

    launchAircraftFromAirbase(airbaseId: string) {
        if (!this.currentSideName) {
            return;
        }
        const airbase = this.currentScenario.getAirbase(airbaseId);
        if (airbase && airbase.aircraft.length > 0) {
            const aircraft = airbase.aircraft.pop()
            if (aircraft) {
                this.currentScenario.aircraft.push(aircraft);
                return aircraft
            }
        }
    }

    handleAircraftAttack(aircraftId: string, targetId: string) {
        const target = this.currentScenario.getAircraft(targetId) ?? this.currentScenario.getFacility(targetId) ?? this.currentScenario.getWeapon(targetId) ?? this.currentScenario.getAirbase(targetId);
        const aircraft = this.currentScenario.getAircraft(aircraftId)
        if (target && aircraft && target?.sideName !== aircraft?.sideName) {
            launchWeapon(this.currentScenario, aircraft, target)
        }
    }

    switchCurrentSide() {
        for (let i = 0; i < this.currentScenario.sides.length; i++) {
            if (this.currentScenario.sides[i].name === this.currentSideName) {
                this.currentSideName = this.currentScenario.sides[(i + 1) % this.currentScenario.sides.length].name;
                break;
            }
        }
    }

    switchScenarioTimeCompression() {
        const timeCompressions = Object.keys(GAME_SPEED_DELAY_MS).map((speed) => parseInt(speed));
        for (let i = 0; i < timeCompressions.length; i++) {
            if (this.currentScenario.timeCompression === timeCompressions[i]) {
                this.currentScenario.timeCompression = timeCompressions[(i + 1) % timeCompressions.length];
                break;
            }
        }
    }

    exportCurrentScenario(): string {
        const exportObject = {
            "currentScenario": this.currentScenario,
            "currentSideName": this.currentSideName,
            "selectedUnitId": this.selectedUnitId,
            "mapView": this.mapView,
        }
        return JSON.stringify(exportObject);
    }

    loadScenario(scenarioString: string) {
        const importObject = JSON.parse(scenarioString);
        this.currentSideName = importObject.currentSideName;
        this.selectedUnitId = importObject.selectedUnitId;
        this.mapView = importObject.mapView;

        const savedScenario = importObject.currentScenario;
        const savedSides = savedScenario.sides.map((side: any) => {
            const newSide = new Side({
                id: side.id,
                name: side.name,
                totalScore: side.totalScore,
                sideColor: side.sideColor,
            });
            return newSide;
        });
        const loadedScenario = new Scenario({
            id: savedScenario.id,
            name: savedScenario.name,
            startTime: savedScenario.startTime,
            currentTime: savedScenario.currentTime,
            duration: savedScenario.duration,
            sides: savedSides,
            timeCompression: savedScenario.timeCompression,
        });
        savedScenario.aircraft.forEach((aircraft: any) => {
            const newAircraft = new Aircraft({
                id: aircraft.id, 
                name: aircraft.name, 
                sideName: aircraft.sideName, 
                className: aircraft.className,
                latitude: aircraft.latitude,
                longitude: aircraft.longitude,
                altitude: aircraft.altitude,
                heading: aircraft.heading,
                speed: aircraft.speed,
                fuel: aircraft.fuel,
                range: aircraft.range,
                route: aircraft.route,
                selected: aircraft.selected,
                sideColor: aircraft.sideColor,
                weapons: aircraft.weapons ?? [this.getSampleWeapon(10, 0.25, aircraft.sideName)],
            });
            loadedScenario.aircraft.push(newAircraft);
        });
        savedScenario.airbases.forEach((airbase: any) => {
            const airbaseAircraft: Aircraft[] = []
            airbase.aircraft.forEach((aircraft: any) => {
                const newAircraft = new Aircraft({
                    id: aircraft.id, 
                    name: aircraft.name, 
                    sideName: aircraft.sideName, 
                    className: aircraft.className,
                    latitude: aircraft.latitude,
                    longitude: aircraft.longitude,
                    altitude: aircraft.altitude,
                    heading: aircraft.heading,
                    speed: aircraft.speed,
                    fuel: aircraft.fuel,
                    range: aircraft.range,
                    route: aircraft.route,
                    selected: aircraft.selected,
                    sideColor: aircraft.sideColor,
                    weapons: aircraft.weapons ?? [this.getSampleWeapon(10, 0.25, aircraft.sideName)],
                });
                airbaseAircraft.push(newAircraft);
            })
            const newAirbase = new Airbase({
                id: airbase.id, 
                name: airbase.name, 
                sideName: airbase.sideName, 
                className: airbase.className,
                latitude: airbase.latitude,
                longitude: airbase.longitude,
                altitude: airbase.altitude,
                sideColor: airbase.sideColor,
                aircraft: airbaseAircraft,
            });
            loadedScenario.airbases.push(newAirbase);
        });
        savedScenario.facilities.forEach((facility: any) => {
            const newFacility = new Facility({
                id: facility.id, 
                name: facility.name, 
                sideName: facility.sideName, 
                className: facility.className,
                latitude: facility.latitude,
                longitude: facility.longitude,
                altitude: facility.altitude,
                range: facility.range,
                sideColor: facility.sideColor,
                weapons: facility.weapons ?? [this.getSampleWeapon(30, 0.1, facility.sideName)],
            });
            loadedScenario.facilities.push(newFacility);
        });
        savedScenario.weapons.forEach((weapon: any) => {
            const newWeapon = new Weapon({
                id: weapon.id, 
                name: weapon.name, 
                sideName: weapon.sideName, 
                className: weapon.className,
                latitude: weapon.latitude,
                longitude: weapon.longitude,
                altitude: weapon.altitude,
                heading: weapon.heading,
                speed: weapon.speed,
                fuel: weapon.fuel,
                range: weapon.range,
                route: weapon.route,
                sideColor: weapon.sideColor,
                targetId: weapon.targetId,
                lethality: weapon.lethality,
                maxQuantity: weapon.maxQuantity,
                currentQuantity: weapon.currentQuantity,
            });
            loadedScenario.weapons.push(newWeapon);
        })
        this.currentScenario = loadedScenario;
    }

    facilityAutoDefense() {
        this.currentScenario.facilities.forEach((facility) => {
            this.currentScenario.aircraft.forEach((aircraft) => {
                if (facility.sideName !== aircraft.sideName) {
                    if (checkIfAircraftIsWithinFacilityThreatRange(aircraft, facility) && checkTargetTrackedByCount(this.currentScenario, aircraft) < 10) {
                        launchWeapon(this.currentScenario, facility, aircraft)
                    }
                }
            })
        })
    }

    updateGameState() {
        this.currentScenario.currentTime += 1;

        this.facilityAutoDefense()

        this.currentScenario.weapons.forEach((weapon) => {
            weaponEngagement(this.currentScenario, weapon)
        });

        this.currentScenario.aircraft.forEach((aircraft) => {
            const route = aircraft.route;
            if (route.length > 0) {
                const nextWaypoint = route[route.length - 1];
                const nextWaypointLatitude = nextWaypoint[0];
                const nextWaypointLongitude = nextWaypoint[1];
                if (getDistanceBetweenTwoPoints(aircraft.latitude, aircraft.longitude, nextWaypointLatitude, nextWaypointLongitude) < 0.5) {
                    aircraft.latitude = nextWaypointLatitude;
                    aircraft.longitude = nextWaypointLongitude;
                    aircraft.route.shift();
                } else {
                    const nextAircraftCoordinates = getNextCoordinates(aircraft.latitude, aircraft.longitude, nextWaypointLatitude, nextWaypointLongitude, aircraft.speed);
                    const nextAircraftLatitude = nextAircraftCoordinates[0];
                    const nextAircraftLongitude = nextAircraftCoordinates[1];
                    aircraft.latitude = nextAircraftLatitude;
                    aircraft.longitude = nextAircraftLongitude;
                    aircraft.heading = getBearingBetweenTwoPoints(aircraft.latitude, aircraft.longitude, nextWaypointLatitude, nextWaypointLongitude);
                }
            }
        });
    }

    _getObservation(): Scenario {
        return this.currentScenario;
    }

    _getInfo() {
        return null;
    }

    step(): [Scenario, number, boolean, boolean, any] {
        this.updateGameState();
        const terminated = false;
        const truncated = this.checkGameEnded();
        const reward = 0;
        const observation = this._getObservation();
        const info = this._getInfo();
        return [observation, reward, terminated, truncated, info];
    }

    reset() {

    }

    checkGameEnded(): boolean {
        return false;
    }

}
