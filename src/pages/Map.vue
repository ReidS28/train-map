<template>
	<div
		ref="mapContainer"
		class="map-container"
		id="map"
	></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import ZoomIndicator from "../controls/ZoomIndicator.ts";

onMounted(async () => {

	const styleResponse = await fetch("/basemapStyle.json");
	const styleJson = await styleResponse.json();

	// Style Editor: https://maplibre.org/maputnik/?layer=1436849566%7E43#13.8/40.07632/-83.05067

	const map = new maplibregl.Map({
		container: "map",
		style: styleJson, 
		center: [-83, 40],
		zoom: 10,
	});

	map.on("load", () => {

		map.addSource("openRailwayMap", {
			type: "raster",
			tiles: [
				"https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"
			],
			tileSize: 256,//512,
			attribution:
				'<a href="https://www.openstreetmap.org/copyright">© OpenStreetMap contributors</a>, ' +
				'Style: <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA 2.0</a> ' +
				'<a href="http://www.openrailwaymap.org/">OpenRailwayMap</a>'
		});

		map.addLayer({
			id: "openRailwayMap-layer",
			type: "raster",
			source: "openRailwayMap",
			minzoom: 0,
			maxzoom: 19,
		});
	});

	
	map.addControl(new maplibregl.NavigationControl(), "top-right");

	let geolocate = new maplibregl.GeolocateControl({
		positionOptions: {
				enableHighAccuracy: true
		},
		trackUserLocation: true
	});
	map.addControl(geolocate, "top-right");

	map.addControl(new maplibregl.FullscreenControl({container: document.querySelector('body')}), "top-right");

	map.addControl(new maplibregl.GlobeControl(), "top-right");

	let scale = new maplibregl.ScaleControl({
		maxWidth: 240,
		unit: 'metric'
	});
	map.addControl(scale, "bottom-left");

	map.addControl(new ZoomIndicator(), "bottom-left");
	
});

onBeforeUnmount(() => {
	
});
</script>

<style scoped>
.map-container {
	width: 100%;
	height: 95vh;
}
	
</style>
