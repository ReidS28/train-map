<template>
	<div
		ref="mapContainer"
		class="map-container"
	></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl, { Map } from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Protocol } from "pmtiles";

const mapContainer = ref<HTMLDivElement | null>(null);
let map: Map | null = null;

onMounted(() => {
	if (!mapContainer.value) return;

	// Initialize PMTiles protocol
	const protocol = new Protocol();
	maplibregl.addProtocol("pmtiles", protocol.tile);

	// Create MapLibre GL map
	map = new maplibregl.Map({
		container: mapContainer.value,
		style: {
			version: 8,
			sources: {
				protomaps: {
					type: "vector",
					url: "pmtiles://https://demo-bucket.protomaps.com/v4.pmtiles",
				},
			},
			layers: [
				{
					id: "land-layer",
					type: "fill",
					source: "protomaps",
					"source-layer": "land", // This is a default layer in the PMTiles file
					paint: {
						"fill-color": "#e0e0e0",
						"fill-opacity": 1,
					},
				},
				{
					id: "water-layer",
					type: "fill",
					source: "protomaps",
					"source-layer": "water",
					paint: {
						"fill-color": "#a0c8f0",
						"fill-opacity": 1,
					},
				},
				{
					id: "road-layer",
					type: "line",
					source: "protomaps",
					"source-layer": "road",
					paint: {
						"line-color": "#c0c0c0",
						"line-width": 1,
					},
				},
			],
		},
		center: [0, 0],
		zoom: 2,
	});

	// Add zoom controls
	map.addControl(new maplibregl.NavigationControl());
});

onBeforeUnmount(() => {
	map?.remove();
});
</script>

<style scoped>
.map-container {
	width: 100%;
	height: 100vh;
}
</style>
