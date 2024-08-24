import { EARTH_RADIUS_KM, KILOMETERS_TO_NAUTICAL_MILES } from "./constants";

export function toRadians(degrees: number): number {
    return degrees * Math.PI / 180;
};

function toDegrees(radians: number): number {
    return radians * 180 / Math.PI;
}

export function getBearingBetweenTwoPoints(startLatitude: number, startLongitude: number, destinationLatitude: number, destinationLongitude: number): number {
    startLatitude = toRadians(startLatitude);
    startLongitude = toRadians(startLongitude);
    destinationLatitude = toRadians(destinationLatitude);
    destinationLongitude = toRadians(destinationLongitude);

    const y = Math.sin(destinationLongitude - startLongitude) * Math.cos(destinationLatitude);
    const x = Math.cos(startLatitude) * Math.sin(destinationLatitude) - Math.sin(startLatitude) * Math.cos(destinationLatitude) * Math.cos(destinationLongitude - startLongitude);
    const bearing = (toDegrees(Math.atan2(y, x)) + 360) % 360;

    return bearing;
}

export function getDistanceBetweenTwoPoints(startLatitude: number, startLongitude: number, destinationLatitude: number, destinationLongitude: number): number {
    const φ1 = toRadians(startLatitude);
    const φ2 = toRadians(destinationLatitude);
    const Δφ = toRadians(destinationLatitude-startLatitude);
    const Δλ = toRadians(destinationLongitude-startLongitude);

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = EARTH_RADIUS_KM * c; // in kilometres

    return d;
}

export function getTerminalCoordinatesFromDistanceAndBearing(startLatitude: number, startLongitude: number, distance: number, bearing: number): number[] {
    const bearingInRadians = toRadians(bearing);

    const initialLatitude = toRadians(startLatitude);
    const initialLongitude = toRadians(startLongitude);

    const finalLatitude = toDegrees(Math.asin(Math.sin(initialLatitude)*Math.cos(distance/EARTH_RADIUS_KM) + Math.cos(initialLatitude)*Math.sin(distance/EARTH_RADIUS_KM)*Math.cos(bearingInRadians)));

    const finalLongitude = toDegrees(initialLongitude + Math.atan2(Math.sin(bearingInRadians)*Math.sin(distance/EARTH_RADIUS_KM)*Math.cos(initialLatitude), Math.cos(distance/EARTH_RADIUS_KM)-Math.sin(initialLatitude)*Math.sin(finalLatitude)));

    return [finalLatitude, finalLongitude]; 
}

export function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export function unixToLocalTime(unixTimestamp: number): string {
    // Create a new JavaScript Date object based on the timestamp
    // multiplied by 1000 so that the argument is in milliseconds, not seconds
    const date = new Date(unixTimestamp * 1000);

    // Hours part from the timestamp
    const hours = date.getHours();

    // Minutes part from the timestamp
    const minutes = "0" + date.getMinutes();

    // Seconds part from the timestamp
    const seconds = "0" + date.getSeconds();

    // Will display time in 10:30:23 format
    const formattedTime = hours + ':' + minutes.substring(minutes.length-2) + ':' + seconds.substring(seconds.length-2);

    return formattedTime;
}

export function randomFloat(min: number=0, max: number=1): number {
    return (Math.random() * (max - min) + min);
}

export function randomInt(min: number=0, max: number=100): number {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

export function generateRoute(originLatitude: number, originLongitude: number, destinationLatitude: number, destinationLongitude: number, numberOfWaypoints: number): number[][] {
    const route: number[][] = [];

    const heading = getBearingBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const totalDistance = getDistanceBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const legDistance = totalDistance / numberOfWaypoints;

    route.push(getTerminalCoordinatesFromDistanceAndBearing(originLatitude, originLongitude, legDistance, heading))

    for (let waypointIndex = 1; waypointIndex < numberOfWaypoints; waypointIndex++) {
        const newWaypoint = getTerminalCoordinatesFromDistanceAndBearing(route[waypointIndex - 1][0], route[waypointIndex - 1][1], legDistance, heading);
        route.push(newWaypoint);
    }

    route.push([destinationLatitude, destinationLongitude]);
    return route
}

export function generateRouteRealistic(originLatitude: number, originLongitude: number, destinationLatitude: number, destinationLongitude: number, platformSpeed: number): number[][] {
    const route: number[][] = [];

    const heading = getBearingBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const totalDistance = getDistanceBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const totalTimeHours = (totalDistance * KILOMETERS_TO_NAUTICAL_MILES) / platformSpeed; // hours
    const totalTimeSeconds = Math.floor(totalTimeHours * 3600); // seconds
    const legDistance = totalDistance / totalTimeSeconds;

    route.push(getTerminalCoordinatesFromDistanceAndBearing(originLatitude, originLongitude, legDistance, heading))

    for (let waypointIndex = 1; waypointIndex < totalTimeSeconds; waypointIndex++) {
        const newWaypoint = getTerminalCoordinatesFromDistanceAndBearing(route[waypointIndex - 1][0], route[waypointIndex - 1][1], legDistance, heading);
        route.push(newWaypoint);
    }

    route.push([destinationLatitude, destinationLongitude]);
    return route
}

export function getNextCoordinates(originLatitude: number, originLongitude: number, destinationLatitude: number, destinationLongitude: number, platformSpeed: number) {
    const heading = getBearingBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const totalDistance = getDistanceBetweenTwoPoints(originLatitude, originLongitude, destinationLatitude, destinationLongitude);
    const totalTimeHours = (totalDistance * KILOMETERS_TO_NAUTICAL_MILES) / platformSpeed; // hours
    const totalTimeSeconds = Math.floor(totalTimeHours * 3600); // seconds
    const legDistance = totalDistance / totalTimeSeconds;

    return getTerminalCoordinatesFromDistanceAndBearing(originLatitude, originLongitude, legDistance, heading);
}
