import type { OverlayDefinition } from "./types";

export const railLinesLayer: OverlayDefinition = {
	id: 'rail-lines',
	source: {
		type: 'raster' as const,
		tiles: ['https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png'],
		tileSize: 256,
	},
	layers: [
		{ id: 'rail-lines', type: 'raster', source: 'rail-lines'}]
};
