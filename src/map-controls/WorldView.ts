import { Map as MaplibreMap, LngLatBoundsLike } from 'maplibre-gl';
import type { ControlPosition, IControl } from 'maplibre-gl';

export default class WorldView implements IControl {
  private container: HTMLElement | undefined;
  private map: MaplibreMap | undefined;

  public getDefaultPosition(): ControlPosition {
    return 'top-right';
  }

  onAdd(map: MaplibreMap) {
    this.map = map;

    // Container
    this.container = document.createElement('div');
    this.container.className = 'maplibregl-ctrl';
    this.container.style.backgroundColor = 'white';
    this.container.style.padding = '4px 8px';
    this.container.style.border = '1px solid black';
    this.container.style.borderRadius = '4px';
    this.container.style.cursor = 'pointer';
    this.container.style.color = 'black';
    this.container.style.userSelect = 'none';

    this.container.textContent = '🌍';

    // Click → zoom to full world
    this.container.addEventListener('click', () => {
      if (!this.map) return;

      map.flyTo({
        center: [-40, 24],
        zoom: 2,
        duration: 100000,  // ms
      });

    });

    return this.container;
  }

  onRemove() {
    if (this.container) {
      this.container.parentNode?.removeChild(this.container);
    }
    this.map = undefined;
  }
}
