import Side from "../game/Side";
import Scenario from "../game/Scenario";
import Aircraft from "../game/units/Aircraft";
import Airbase from "../game/units/Airbase";
import Facility from "../game/units/Facility";
import Weapon from "../game/units/Weapon";
import Game from "../game/Game";

export const serverMessageTypesDef = {
  LOAD_DEFAULT_SCENARIO: "loaddefaultscenario",
  STEP_SCENARIO: "stepscenario",
  UPDATE_SCENARIO_CURRENT_TIME: "updatescenariocurrenttime",
};

export const clientMessageTypesDef = {
  LOAD_DEFAULT_SCENARIO: "loaddefaultscenario",
  STEP_SCENARIO: "stepscenario",
};

export function loadScenario(importScenario: any) {
  const savedSides = importScenario.sides?.map((side: any) => {
    const newSide = new Side({
      id: side.id,
      name: side.name,
      totalScore: side.totalScore,
      sideColor: side.sideColor,
    });
    return newSide;
  });
  const loadedScenario = new Scenario({
    id: importScenario.id,
    name: importScenario.name,
    startTime: importScenario.startTime,
    currentTime: importScenario.currentTime,
    duration: importScenario.duration,
    sides: savedSides,
    timeCompression: importScenario.timeCompression,
  });
  importScenario.aircraft?.forEach((aircraft: any) => {
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
      weapons: aircraft.weapons ?? [],
    });
    loadedScenario.aircraft.push(newAircraft);
  });
  importScenario.airbases?.forEach((airbase: any) => {
    const airbaseAircraft: Aircraft[] = [];
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
        weapons: aircraft.weapons ?? [],
      });
      airbaseAircraft.push(newAircraft);
    });
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
  importScenario.facilities?.forEach((facility: any) => {
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
      weapons: facility.weapons ?? [],
    });
    loadedScenario.facilities.push(newFacility);
  });
  importScenario.weapons?.forEach((weapon: any) => {
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
  });
  return loadedScenario;
}

export function loadGame(gameImport: any) {
  const loadedScenario = loadScenario(gameImport.currentScenario);
  const loadedGame = new Game(loadedScenario);
  loadedGame.currentSideName = gameImport.currentSideName;
  loadedGame.selectedUnitId = gameImport.selectedUnitId;
  loadedGame.mapView = gameImport.mapView;
  return loadedGame;
}
