import L, { point } from "leaflet";

const RAILROAD_API_URL =
	"https://data.transportation.gov/resource/ugux-y9xm.json?$limit=200000";

/**
 * Represents a railroad point with its distance from a target location.
 */
interface RailroadPointWithDistance {
	data: any; // The original railroad data object
	distance: number; // Distance in meters from the target location
}

interface simplifiedPoint {
	lat: number;
	lon: number;
	milepost: number;
	data: any;
}

/**
 * Fetches railroad crossing data, finds the nearest points within a distance limit,
 * groups them by railroad, sorts each group by milepost, adds markers,
 * and draws polylines for each railroad.
 *
 * @param layerGroup The Leaflet LayerGroup to add the markers and polylines to.
 * @param targetLat The latitude of the location to measure distance from.
 * @param targetLon The longitude of the location to measure distance from.
 * @param nearbyPoints The maximum number of nearest points overall to display (default: 1000).
 * @param distanceLimit The maximum distance in miles from the target to include points (default: 10 miles).
 * @param milepostGapThreshold The maximum allowed milepost difference for points to be considered part of the same line segment (default: 2 miles).
 * @param spatialProximityThreshold The maximum allowed distance in meters between two points for them to be considered part of the same continuous line (default: 1.4 miles, approx 2253 meters).
 */
export async function addMilepostPointsAndLines(
	layerGroup: L.LayerGroup,
	targetLat: number,
	targetLon: number,
	nearbyPoints: number = 1000,
	distanceLimit: number = 10
): Promise<void> {
	try {
		const response = await fetch(RAILROAD_API_URL);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const railroadData = await response.json();

		const targetLatLng = L.latLng(targetLat, targetLon);

		const nearbyPointsWithDistance: RailroadPointWithDistance[] = [];

		// Filter out extra points
		railroadData.forEach((point: any) => {
			if (
				point.lat &&
				point.long &&
				point.railroad &&
				point.milepost !== undefined
			) {
				const lat = parseFloat(point.lat);
				const lon = parseFloat(point.long);
				const milepost = parseFloat(point.milepost);

				const pointLatLng = L.latLng(lat, lon);
				const distance = targetLatLng.distanceTo(pointLatLng) / 1609.34;

				if (distance <= distanceLimit && !isNaN(milepost)) {
					point.milepost = milepost;
					nearbyPointsWithDistance.push({ data: point, distance: distance });
				}
			}
		});

		nearbyPointsWithDistance.sort((a, b) => a.distance - b.distance);
		const finalNearestPoints = nearbyPointsWithDistance.slice(0, nearbyPoints);

		// Group by railroad
		const railroadGroups: {
			[railroadName: string]: RailroadPointWithDistance[];
		} = {};

		finalNearestPoints.forEach((item: RailroadPointWithDistance) => {
			const point = item.data;
			const lat = parseFloat(point.lat);
			const lon = parseFloat(point.long);
			const railroadName = point.railroad || "Unknown Railroad";

			/*const marker = L.marker([lat, lon]);

			const popupContent = `
				<b>Railroad:</b> ${railroadName}<br>
				<b>Milepost:</b> ${
										Number.isFinite(point.milepost) ? point.milepost : "N/A"
									}<br>
				<b>State:</b> ${point.stateab || "N/A"}<br>
				<b>Distance:</b> ${item.distance.toLocaleString(undefined, {
										maximumFractionDigits: 0,
									})} meters<br>
				<small>ID: ${point.objectid || "N/A"}</small>
			`;
			marker.bindPopup(popupContent);

			layerGroup.addLayer(marker);*/

			if (!railroadGroups[railroadName]) {
				railroadGroups[railroadName] = [];
			}
			railroadGroups[railroadName].push(item);
		});

		// Group by railLine
		const railLineGroups = Array<simplifiedPoint[][]>();
		Object.values(railroadGroups).forEach(
			(railroadGroup: RailroadPointWithDistance[]) => {
				const simplifiedPoints = railroadGroup.map((p) => ({
					lat: parseFloat(p.data.lat),
					lon: parseFloat(p.data.long),
					milepost: p.data.milepost,
					data: p.data,
				}));
				railLineGroups.push(splitRailroadToRailLines(simplifiedPoints));
			}
		);

		layerGroup.clearLayers();

		drawPolylinesForRailLines(railLineGroups, layerGroup);

		for (const railroadName in railroadGroups) {
			if (railroadGroups.hasOwnProperty(railroadName)) {
				const railroadPoints = railroadGroups[railroadName];

				drawPolylinesForRailLines(railLineGroups, layerGroup);
			}
		}

		console.log(
			`Loaded and displayed ${finalNearestPoints.length} nearest railroad points.`
		);
	} catch (error) {
		console.error("Error fetching or processing railroad data:", error);
	}
}

/**
 * Helper function to generate a random hex color.
 * @returns A random hex color string (e.g., "#RRGGBB").
 */
function getRandomColor(): string {
	const letters = "0123456789ABCDEF";
	let color = "#";
	for (let i = 0; i < 6; i++) {
		color += letters[Math.floor(Math.random() * 16)];
	}
	return color;
}

/*function placeMarkers(points: ){

}*/

/**
 * Split all points from a given railroad into seprate rail lines
 * @param points all points from a given railroad
 */
function splitRailroadToRailLines(
	points: simplifiedPoint[]
): Array<simplifiedPoint[]> {
	const railLines: Array<simplifiedPoint[]> = [];

	if (points.length === 0) {
		return railLines;
	}

	points.sort((a, b) => b.milepost - a.milepost);

	let loopCount = 0;
	let lastLength = Infinity;
	while (points.length > 0 && points.length != lastLength) {
		lastLength = points.length;

		let currentPoint = points[points.length - 1];

		if (railLines.length === 0) {
			railLines.push([currentPoint]);
		} else {
			const currentPointLatLng = L.latLng(currentPoint.lat, currentPoint.lon);

			let foundTarget = false;
			for (let railLine of railLines) {
				const lastLatLon = L.latLng(
					railLine[railLine.length - 1].lat,
					railLine[railLine.length - 1].lon
				);
				if (
					Math.abs(
						railLine[railLine.length - 1].milepost - currentPoint.milepost
					) <= 1 &&
					currentPointLatLng.distanceTo(lastLatLon) / 1609.34 <= 1.4
				) {
					railLine.push(currentPoint);
					foundTarget = true;
					break;
				}
			}
			if (!foundTarget) {
				railLines.push([currentPoint]);
			}
		}
		points.pop();

		loopCount++;
	}

	return railLines;
}

/**
 * Draws all polylines for a given railroad by first segmenting its points.
 * @param railroadPoints An array of points for a single railroad, assumed to be sorted by milepost.
 * @param railroadName The name of the railroad.
 * @param layerGroup The Leaflet LayerGroup to add the polylines to.
 * @param railroadColor The color to use for all segments of this railroad.
 */
function drawPolylinesForRailLines(
	railLines: simplifiedPoint[][][],
	layerGroup: L.LayerGroup
) {
	railLines.forEach((railroad) => {
		railroad.forEach((railLine) => {
			railLine.sort((a, b) => a.milepost - b.milepost);
			drawSinglePolylineSegment(railLine, layerGroup, getRandomColor());
		});
	});
}

/**
 * Helper function to draw a single polyline segment.
 * @param segmentPoints An array of points for the current line segment.
 * @param railroadName The name of the railroad for the segment.
 * @param layerGroup The Leaflet LayerGroup to add the polyline to.
 * @param lineColor The color for this polyline segment.
 */
function drawSinglePolylineSegment(
	segmentPoints: simplifiedPoint[],
	layerGroup: L.LayerGroup,
	lineColor: string
) {
	const latlngs = segmentPoints.map((p) => L.latLng(p.lat, p.lon));

	if (latlngs.length > 1) {
		const polyline = L.polyline(latlngs, {
			color: lineColor,
			weight: 3,
			opacity: 0.7,
		});

		const firstPointData = segmentPoints[0].data;
		const lastPointData = segmentPoints[segmentPoints.length - 1].data;
		polyline.bindPopup(
			`Milepost Segment: ${
				Number.isFinite(firstPointData.milepost)
					? firstPointData.milepost
					: "N/A"
			} - ${
				Number.isFinite(lastPointData.milepost) ? lastPointData.milepost : "N/A"
			}
			`
		);

		layerGroup.addLayer(polyline);
	}
}
