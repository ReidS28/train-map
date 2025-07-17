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
	distanceLimit: number = 10, // In miles
	milepostGapThreshold: number = 2,
	spatialProximityThreshold: number = 1609.34 * 1.4 // 1.4 miles in meters
): Promise<void> {
	try {
		const response = await fetch(RAILROAD_API_URL);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}
		const railroadData = await response.json();

		const targetLatLng = L.latLng(targetLat, targetLon);

		const nearbyPointsWithDistance: RailroadPointWithDistance[] = [];

		railroadData.forEach((point: any) => {
			// Ensure essential properties exist for calculation and grouping/line drawing
			if (
				point.lat &&
				point.long &&
				point.railroad &&
				point.milepost !== undefined
			) {
				const lat = parseFloat(point.lat);
				const lon = parseFloat(point.long);
				const milepost = parseFloat(point.milepost); // Ensure milepost is a number

				const pointLatLng = L.latLng(lat, lon);
				const distance = targetLatLng.distanceTo(pointLatLng) / 1609.34;

				// Check distance limit (converted to meters from miles)
				if (distance <= distanceLimit && !isNaN(milepost)) {
					point.milepost = milepost;
					nearbyPointsWithDistance.push({ data: point, distance: distance });
				}
			}
		});

		nearbyPointsWithDistance.sort((a, b) => a.distance - b.distance);
		const finalNearestPoints = nearbyPointsWithDistance.slice(0, nearbyPoints);

		layerGroup.clearLayers();

		const pointsGroupedByRailroad: {
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

			if (!pointsGroupedByRailroad[railroadName]) {
				pointsGroupedByRailroad[railroadName] = [];
			}
			pointsGroupedByRailroad[railroadName].push(item);
		});

		// Loop through each railroad group, sort its points, and then draw its polylines
		for (const railroadName in pointsGroupedByRailroad) {
			if (pointsGroupedByRailroad.hasOwnProperty(railroadName)) {
				const railroadPoints = pointsGroupedByRailroad[railroadName];

				// --- CALL TO DRAW POLYLINES FOR THIS RAILROAD ---
				// Pass the generated color for this entire railroad
				drawPolylinesForRailLines(
					railroadPoints,
					railroadName,
					layerGroup,
					milepostGapThreshold,
					spatialProximityThreshold,
					getRandomColor()
				);
			}
		}

		console.log(
			`Loaded and displayed ${finalNearestPoints.length} nearest railroad points.`
		);
	} catch (error) {
		console.error("Error fetching or processing railroad data:", error);
	}
}

// --- HELPER FUNCTIONS FOR DRAWING POLYLINES ---

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

/**
 * Draws all polylines for a given railroad by first segmenting its points.
 * @param railroadPoints An array of points for a single railroad, assumed to be sorted by milepost.
 * @param railroadName The name of the railroad.
 * @param layerGroup The Leaflet LayerGroup to add the polylines to.
 * @param milepostGapThreshold The threshold for milepost continuity.
 * @param spatialProximityThreshold The threshold for spatial continuity.
 * @param railroadColor The color to use for all segments of this railroad.
 */
function drawPolylinesForRailLines(
	railroadPoints: RailroadPointWithDistance[],
	railroadName: string,
	layerGroup: L.LayerGroup,
	milepostGapThreshold: number,
	spatialProximityThreshold: number,
	railroadColor: string
) {
	const simplifiedPoints = railroadPoints.map((p) => ({
		lat: parseFloat(p.data.lat),
		lon: parseFloat(p.data.long),
		milepost: p.data.milepost,
		data: p.data,
	}));

	const railLines = splitRailroadToRailLines(simplifiedPoints);

	railLines.forEach((railLine) => {
		railLine.sort((a, b) => a.milepost - b.milepost);
		drawSinglePolylineSegment(
			railLine,
			railroadName,
			layerGroup,
			getRandomColor() //railroadColor
		);
	});
}

/**
 * Split all points from a given railroad into seprate rail lines
 * @param points all points from a given railroad
 */
function splitRailroadToRailLines(
	points: { lat: number; lon: number; milepost: number; data: any }[]
): Array<{ lat: number; lon: number; milepost: number; data: any }[]> {
	const railLines: Array<
		{ lat: number; lon: number; milepost: number; data: any }[]
	> = [];

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
                const lastLatLon = L.latLng(railLine[railLine.length - 1].lat, railLine[railLine.length - 1].lon);
				if (
					(Math.abs(
						railLine[railLine.length - 1].milepost - currentPoint.milepost
					) <= 1) && (currentPointLatLng.distanceTo(lastLatLon) / 1609.34 <= 1.4)
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
 * Helper function to draw a single polyline segment.
 * @param segmentPoints An array of points for the current line segment.
 * @param railroadName The name of the railroad for the segment.
 * @param layerGroup The Leaflet LayerGroup to add the polyline to.
 * @param lineColor The color for this polyline segment.
 */
function drawSinglePolylineSegment(
	segmentPoints: { lat: number; lon: number; milepost: number; data: any }[],
	railroadName: string,
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
			`<b>Railroad:</b> ${railroadName || "N/A"}
            <br>Milepost Segment: ${
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
