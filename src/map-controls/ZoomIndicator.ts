import { Map as MaplibreMap } from 'maplibre-gl';
import type { ControlPosition, IControl } from 'maplibre-gl';

export default class ZoomIndicator implements IControl {
  private container: HTMLElement | undefined;
  private map: MaplibreMap | undefined;

  public getDefaultPosition(): ControlPosition {
    return 'top-right';
  }

  onAdd(map: MaplibreMap) {
    this.map = map;
    
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl maplibregl-ctrl-group';

    // Match built-in MapLibre controls
    this.container.style.display = "flex";
    this.container.style.alignItems = "center";
    this.container.style.justifyContent = "center";
    this.container.style.padding = "4px 6px";
    this.container.style.cursor = "pointer";
    this.container.style.userSelect = "none";
    this.container.style.fontFamily = "Arial, sans-serif";
    this.container.style.fontSize = "13px";
    this.container.style.lineHeight = "1";


    // Text span
    const zoomLevel = document.createElement('span');

    this.container.appendChild(zoomLevel);

    // Update on zoom
    map.on('zoom', () => {
      const currentZoom = map.getZoom().toFixed(2);
      zoomLevel.textContent = `Z: ${currentZoom}`;
    });

    this.container.addEventListener("click", () => {
      const currentZoom = this.map?.getZoom();
      if (currentZoom !== undefined) {
          const targetZoom = Math.round(currentZoom);
          this.map?.zoomTo(targetZoom, { duration: 500 });
      }
    });

    // Initial value
    zoomLevel.textContent = `Z: ${map.getZoom().toFixed(2)}`;

    return this.container;
  }

  onRemove() {
    if (this.container) {
      this.container.parentNode?.removeChild(this.container);
    }
  }
}
