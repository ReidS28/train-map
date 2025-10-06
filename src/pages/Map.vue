<template>
	<div
		ref="mapContainer"
		class="map-container"
		id="map"
	></div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css';

import ZoomIndicator from "../map-controls/ZoomIndicator.ts";
import WorldView from "../map-controls/WorldView.ts";

import StylesControl from "@mapbox-controls/styles";
import "@mapbox-controls/styles/src/index.css";

// --- Base Styles (style.json URLs) ---
const baseMaps = {
	Dark: "/map-layers/basemap-styles/basemapStyleDark.json",
	"OSM Bright": "https://styles.trailsta.sh/osm-bright.json",
	Hybrid:
		"https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",
};

// --- Overlay Layers ---
const overlays = [
	{
		id: "openRailwayMap",
		name: "Railways",
		checked: true,
		source: {
			type: "raster",
			tiles: ["https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"],
			tileSize: 256,
			attribution: "OpenRailwayMap",
		},
		layer: {
			id: "openRailwayMap-layer",
			type: "raster",
			source: "openRailwayMap",
		},
	},
];

onMounted(async () => {
	// --- Load initial blank style ---
	const styleResponse = await fetch("/map-layers/blankStyle.json");
	const styleJson = await styleResponse.json();

	const map = new maplibregl.Map({
		container: "map",
		style: styleJson,
		center: [-83, 40],
		zoom: 10,
	});

	// --- Add controls once map loads ---
	map.on("load", () => {
		// 🔹 Base Style Switcher
		const stylesControl = new StylesControl({
			styles: Object.entries(baseMaps).map(([name, url]) => ({
				label: name,
				styleName: name,
				styleUrl: url,
			})),
			initialStyle: baseMaps.Dark,
		});

		map.addControl(stylesControl, "top-left");

		// 🔹 Navigation + Extras
		map.addControl(new maplibregl.NavigationControl(), "top-right");
		map.addControl(
			new maplibregl.GeolocateControl({
				positionOptions: { enableHighAccuracy: true },
				trackUserLocation: true,
			}),
			"top-right"
		);
		map.addControl(new WorldView(), "top-right");
		map.addControl(new maplibregl.GlobeControl(), "top-right");
		map.addControl(
			new maplibregl.ScaleControl({
				maxWidth: window.innerWidth * 0.2,
				unit: "metric",
			}),
			"bottom-left"
		);
		map.addControl(new ZoomIndicator(), "bottom-left");
	});

	// --- Reapply overlays after style switches ---
	map.on("styledata", () => {
		overlays.forEach((ol) => {
			if (!map.getSource(ol.id)) {
				map.addSource(ol.id, ol.source);
			}
			if (!map.getLayer(ol.layer.id)) {
				map.addLayer(ol.layer);
			}
		});
	});
});

onBeforeUnmount(() => {
	// Optional cleanup if needed
});
</script>

<style>
#map.map-container .maplibregl-ctrl-top-right,
#map.map-container .maplibregl-ctrl-top-left {
	top: 100px/*39px; /* Account for the navbar */
}

/*Map Control Style*/
.maplibregl-ctrl-attrib.maplibregl-compact,
.maplibregl-ctrl-group {
	background-color: #333333;
	color: #bebebe;
}

.maplibregl-ctrl-attrib-button,
.maplibregl-ctrl button .maplibregl-ctrl-icon {
	filter: invert(80%) hue-rotate(180deg) brightness(1.2);
}

/*Atribution Button*/
.maplibregl-ctrl-attrib-button {
	background-color: #ffffff;
}

/*Atribution Button*/
.maplibregl-ctrl-attrib.maplibregl-compact a {
	color: #dddddd;
}

.maplibregl-ctrl-scale {
	background-color: #444444;
	border-color: #282828;
	color: #dddddd;
	user-select: none;
}
</style>

<style scoped>
.map-container {
	width: 100vw;
	height: 100vh;
	position: absolute;
	bottom: 0;
	right: 0;
}
</style>
