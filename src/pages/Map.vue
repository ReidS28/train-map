<template>
        <div
                ref="mapContainer"
                class="map-container"
        ></div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const mapContainer = ref<HTMLDivElement>();
let map: maplibregl.Map | null = null;

onMounted(async () => {
        try {
                // Use a default style instead of fetching from basemapStyle.json
                // You can replace this with your custom style later
                const defaultStyle = {
                        "version": 8,
                        "sources": {
                                "osm": {
                                        "type": "raster",
                                        "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                                        "tileSize": 256,
                                        "attribution": "© OpenStreetMap contributors"
                                }
                        },
                        "layers": [
                                {
                                        "id": "osm",
                                        "type": "raster",
                                        "source": "osm"
                                }
                        ]
                };

                // Style Editor: https://maplibre.org/maputnik/?layer=1436849566%7E43#13.8/40.07632/-83.05067

                map = new maplibregl.Map({
                        container: mapContainer.value!,
                        style: defaultStyle,
                        center: [-83, 40],
                        zoom: 10,
                });

                // Wait for the style to load before adding sources and controls
                map.on('style.load', () => {
                        if (!map) return;

                        // Add terrain source
                        map.addSource('raster-dem-source', {
                                type: 'raster-dem',
                                url: 'https://demotiles.maplibre.org/terrain-tiles/tiles.json',
                                tileSize: 256
                        });

                        /*map.addSource("openRailwayMap", {
                                "attribution": "<a href=\"https://www.openstreetmap.org/copyright\">© OpenStreetMap contributors</a>, Style: <a href=\"http://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA 2.0</a> <a href=\"http://www.openrailwaymap.org/\">OpenRailwayMap</a>",
                                "type": "raster",
                                "tiles" : ['https://tiles.openrailwaymap.org/${style}/${z}/${x}/${y}.png'],
                                "tileSize": 512
                        });*/
                });

                // Add controls immediately (these don't depend on style loading)
                map.addControl(new maplibregl.NavigationControl(), "top-right");

                const geolocate = new maplibregl.GeolocateControl({
                        positionOptions: {
                                enableHighAccuracy: true
                        },
                        trackUserLocation: true
                });
                map.addControl(geolocate, "top-right");

                map.addControl(new maplibregl.FullscreenControl({container: document.querySelector('body')}), "top-right");

                map.addControl(new maplibregl.GlobeControl(), "top-right");

                const scale = new maplibregl.ScaleControl({
                        maxWidth: 240,
                        unit: 'metric'
                });
                map.addControl(scale);

                // Add marker
                const marker = new maplibregl.Marker({
                        color: "#FFFFFF",
                        draggable: true
                }).setLngLat([-83, 40])
                .addTo(map);

        } catch (error) {
                console.error('Error initializing map:', error);
        }
});

onBeforeUnmount(() => {
        if (map) {
                map.remove();
                map = null;
        }
});
</script>

<style scoped>
.map-container {
        width: 100%;
        height: 95vh
}
</style>
