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
import ZoomIndicator from "../map-controls/ZoomIndicator.ts";
import LayerControl from "../map-controls/LayerControl.ts";
import WorldView from "../map-controls/WorldView.ts";

const baseMaps = {
  "Dark": "/map-layers/basemap-styles/basemapStyleDark.json",
  "OSM Bright": "https://styles.trailsta.sh/osm-bright.json",
  "Hybrid": "https://raw.githubusercontent.com/go2garret/maps/main/src/assets/json/arcgis_hybrid.json",  // or another satellite style
};

// https://github.com/ka7eh/maplibre-gl-basemaps ????


const overlays = [
  {
    id: "openRailwayMap",   // source id
    name: "Railways",
    checked: true,
    source: {
      type: "raster",
      tiles: ["https://tiles.openrailwaymap.org/standard/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "OpenRailwayMap",
    },
    layer: {
      id: "openRailwayMap-layer", // layer id
      type: "raster",
      source: "openRailwayMap",   // references the source id
    },
  },
];


  onMounted(async () => {
    const map = new maplibregl.Map({
      container: "map",
      style: Object.values(baseMaps)[0], // first base map as default
      center: [-83, 40],
      zoom: 10,
    });

    // add controls
    const layerControl = new LayerControl(baseMaps, overlays);
    map.addControl(layerControl, "top-left");
    map.addControl(new maplibregl.NavigationControl(), "top-right");
    map.addControl(new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
    }), "top-right");
    map.addControl(new WorldView(), "top-right");
    map.addControl(new maplibregl.GlobeControl(), "top-right");
    map.addControl(new maplibregl.ScaleControl({
      maxWidth: window.innerWidth * 0.2,
      unit: "metric",
    }), "bottom-left");
    map.addControl(new ZoomIndicator(), "bottom-left");
  });


onBeforeUnmount(() => {
  
});
</script>

<style>

#map.map-container .maplibregl-ctrl-top-right,
#map.map-container .maplibregl-ctrl-top-left {
    top: 39px; /* Account for the navbar */
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
.maplibregl-ctrl-attrib-button{
  background-color: #ffffff;
}

/*Atribution Button*/
.maplibregl-ctrl-attrib.maplibregl-compact a{
  color: #dddddd;
}

.maplibregl-ctrl-scale{
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