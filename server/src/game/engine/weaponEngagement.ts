import { v4 as uuidv4 } from "uuid";
import { NAUTICAL_MILES_TO_METERS } from "../utils/constants"
import Aircraft from "../units/Aircraft"
import Facility from "../units/Facility"
import Scenario from "../Scenario"
import Weapon from "../units/Weapon"
import { getBearingBetweenTwoPoints, getDistanceBetweenTwoPoints, getNextCoordinates, randomFloat } from "../utils/utils"
import Airbase from "../units/Airbase";

type Target = Aircraft | Facility | Weapon | Airbase

export function checkIfAircraftIsWithinFacilityThreatRange(aircraft: Aircraft, facility: Facility): boolean {
    const distance = getDistanceBetweenTwoPoints(aircraft.latitude, aircraft.longitude, facility.latitude, facility.longitude)
    return distance < ((facility.range * NAUTICAL_MILES_TO_METERS) / 1000)
}

export function checkTargetTrackedByCount(currentScenario: Scenario, target: Target) {
    let count = 0;
    currentScenario.weapons.forEach((weapon) => {
        if (weapon.targetId === target.id) count += 1;
    })
    return count
}

export function weaponEndgame(currentScenario: Scenario, weapon: Weapon, target: Target): boolean {
    currentScenario.weapons = currentScenario.weapons.filter((currentScenarioWeapon) => currentScenarioWeapon.id !== weapon.id);
    if (randomFloat() <= weapon.lethality) {
        if (target instanceof Aircraft) {
            currentScenario.aircraft = currentScenario.aircraft.filter((currentScenarioAircraft) => currentScenarioAircraft.id !== target.id);
        } else if (target instanceof Facility) {
            currentScenario.facilities = currentScenario.facilities.filter((currentScenarioFacility) => currentScenarioFacility.id !== target.id)
        } else if (target instanceof Weapon) {
            currentScenario.weapons = currentScenario.weapons.filter((currentScenarioWeapon) => currentScenarioWeapon.id !== target.id)
        } else if (target instanceof Airbase) {
            currentScenario.airbases = currentScenario.airbases.filter((currentScenarioAirbase) => currentScenarioAirbase.id !== target.id)
        }
        return true
    }
    return false
}

export function launchWeapon(currentScenario: Scenario, origin: Aircraft | Facility, target: Target) {
    if (origin.weapons.length === 0) return

    const weaponPrototype = origin.weapons[0]
    const nextWeaponCoordinates = getNextCoordinates(origin.latitude, origin.longitude, target.latitude, target.longitude, weaponPrototype.speed);
    const nextWeaponLatitude = nextWeaponCoordinates[0];
    const nextWeaponLongitude = nextWeaponCoordinates[1];
    const newWeapon = new Weapon({
        id: uuidv4(), 
        name: weaponPrototype.name, 
        sideName: origin.sideName, 
        className: weaponPrototype.className,
        latitude: nextWeaponLatitude,
        longitude: nextWeaponLongitude,
        altitude: weaponPrototype.altitude,
        heading: getBearingBetweenTwoPoints(nextWeaponLatitude, nextWeaponLongitude, target.latitude, target.longitude),
        speed: weaponPrototype.speed,
        fuel: weaponPrototype.fuel,
        range: weaponPrototype.range,
        route: [[target.latitude, target.longitude]],
        sideColor: weaponPrototype.sideColor,
        targetId: target.id,
        lethality: weaponPrototype.lethality,
        maxQuantity: weaponPrototype.maxQuantity,
        currentQuantity: weaponPrototype.currentQuantity,
    });
    currentScenario.weapons.push(newWeapon);
    origin.weapons[0].currentQuantity -= 1
    if (origin.weapons[0].currentQuantity < 1) origin.weapons.shift()
}

export function weaponEngagement(currentScenario: Scenario, weapon: Weapon) {
    const target = currentScenario.getAircraft(weapon.targetId) ?? currentScenario.getFacility(weapon.targetId) ?? currentScenario.getWeapon(weapon.targetId) ?? currentScenario.getAirbase(weapon.targetId);
    if (target) {
        const weaponRoute = weapon.route;
        if (weaponRoute.length > 0) {
            if (getDistanceBetweenTwoPoints(weapon.latitude, weapon.longitude, target.latitude, target.longitude) < 0.5) {
                weaponEndgame(currentScenario, weapon, target)
            } else {
                const nextWeaponCoordinates = getNextCoordinates(weapon.latitude, weapon.longitude, target.latitude, target.longitude, weapon.speed);
                const nextWeaponLatitude = nextWeaponCoordinates[0];
                const nextWeaponLongitude = nextWeaponCoordinates[1];
                weapon.heading = getBearingBetweenTwoPoints(nextWeaponLatitude, nextWeaponLongitude, target.latitude, target.longitude);
                weapon.latitude = nextWeaponLatitude;
                weapon.longitude = nextWeaponLongitude;
            }
        }
    } else {
        currentScenario.weapons = currentScenario.weapons.filter((currentScenarioWeapon) => currentScenarioWeapon.id !== weapon.id)
    }
}
