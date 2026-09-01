import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import workerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url";
import * as pmtiles from "pmtiles";
import { layers, namedFlavor } from "@protomaps/basemaps";
import { railLinesLayer } from "./styles/overlays/railLines";
import type { OverlayDefinition } from "./styles/overlays/types";

maplibregl.setWorkerUrl(workerUrl);
const PMTILES_URL = "https://demo-bucket.protomaps.com/v4.pmtiles";
let protocolAdded = false;

const overlayRegistry: Record<string, OverlayDefinition> = {
	"rail-lines": railLinesLayer,
	// "satellite-imagery": satelliteImageryLayer,
	// "weather-radar": weatherRadarLayer,
};

export class MapManager {
	map: maplibregl.Map | null = null;
	activeOverlays = new Set(["rail-lines"]);

	initMap = (node: HTMLDivElement) => {
		if (!protocolAdded) {
			const protocol = new pmtiles.Protocol();
			maplibregl.addProtocol("pmtiles", protocol.tile);
			protocolAdded = true;
		}

		this.map = new maplibregl.Map({
			container: node,
			zoom: 10,
			center: [-83, 40],
			style: {
				version: 8,
				glyphs:
					"https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
				sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
				sources: {
					["protomaps"]: {
						type: "vector",
						url: `pmtiles://${PMTILES_URL}`,
						attribution:
							'<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
					},
				},
				layers: layers("protomaps", namedFlavor("light"), { lang: "en" }),
			},
			maplibreLogo: false,
		});
		this.map.on("load", this.addOverlays);

		return {
			destroy: () => {
				this.map?.remove();
				this.map = null;
			},
		};
	};

	addOverlays = () => {
		if (this.map == null) return;

		for (const overlayId of this.activeOverlays) {
			const overlay = overlayRegistry[overlayId];
			if (!overlay) {
				console.warn(`No overlay registered for id "${overlayId}"`);
				continue;
			}
			if (this.map.getSource(overlay.id)) continue;

			this.map.addSource(overlay.id, overlay.source);
			for (const layer of overlay.layers) this.map.addLayer(layer);
		}
	};

	switchBase = (styleUrlOrObject: string | maplibregl.StyleSpecification) => {
		if (this.map == null) return;
		this.map.setStyle(styleUrlOrObject);
		this.map.once("style.load", this.addOverlays);
	};
}
