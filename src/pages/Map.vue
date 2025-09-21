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

onMounted(async () => {

	const styleResponse = await fetch("/mapStyle.json");
	const styleJson = await styleResponse.json();

	// Style Editor: https://maplibre.org/maputnik/?layer=1436849566%7E43#13.8/40.07632/-83.05067

	const map = new maplibregl.Map({
		container: "map",
		style: styleJson, 
		center: [-83, 40],
		zoom: 10,
	});


	map.addControl(new maplibregl.NavigationControl(), "top-right");
});

onBeforeUnmount(() => {
	
});
</script>

<style scoped>
.map-container {
	width: 100%;
	height: 100vh;
}
</style>
