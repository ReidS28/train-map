import { Map as MaplibreMap } from 'maplibre-gl';
import type { ControlPosition, IControl } from 'maplibre-gl';

export default class ZoomIndicator implements IControl {
  private container: HTMLElement | undefined;

  public getDefaultPosition(): ControlPosition {
    return 'top-right';
  }

  onAdd(map: MaplibreMap) {
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl';
    this.container.style.backgroundColor = 'white';
    this.container.style.padding = '0px';
    this.container.style.border = '1px solid black';
    this.container.style.borderRadius = '4px';
    this.container.style.cursor = 'pointer';

    const zoomLevel = document.createElement('span');
    zoomLevel.style.padding = '0 8px';

    this.container.appendChild(zoomLevel);

    map.on('zoom', () => {
      const currentZoom = map.getZoom().toFixed(2);
      zoomLevel.textContent = `Z: ${currentZoom}`;
    });

    zoomLevel.textContent = `Z: ${map.getZoom().toFixed(2)}`;

    return this.container;
  }

  onRemove() {
    if (this.container) {
      this.container.parentNode?.removeChild(this.container);
    }
  }

}