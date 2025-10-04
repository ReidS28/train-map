import { Map as MaplibreMap } from 'maplibre-gl';
import type { ControlPosition, IControl } from 'maplibre-gl';

export default class WorldView implements IControl {
  private container: HTMLButtonElement | undefined; // Changed to HTMLButtonElement for clarity
  private map: MaplibreMap | undefined;

  public getDefaultPosition(): ControlPosition {
    return 'top-right';
  }

  onAdd(map: MaplibreMap) {
    this.map = map;

    // Group wrapper (maplibregl-ctrl maplibregl-ctrl-group)
    const group = document.createElement("div");
    group.className = "maplibregl-ctrl maplibregl-ctrl-group";

    // Button (The clickable element)
    this.container = document.createElement("button");
    this.container.title = "Zoom to world";

    // Icon Element (The inner div/span with the icon class and image)
    const icon = document.createElement("div");
    // This is the class that MapLibre controls use for the icon element
    icon.className = "maplibregl-ctrl-icon"; 

    // Move all icon styles to the dedicated icon element
    icon.style.backgroundImage = "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NDAgNjQwIj48IS0tIUZvbnQgQXdlc29tZSBGcmVlIHY3LjAuMSBieSBAZm9udGF3ZXNvbWUgLSBodHRwczovL2ZvbnRhd2Vzb21lLmNvbSBMaWNlbnNlIC0gaHR0cHM6Ly9mb250YXdlc29tZS5jb20vbGljZW5zZS9mcmVlIENvcHlyaWdodCAyMDI1IEZvbnRpY29ucywgSW5jLi0tPjxwYXRoIGQ9Ik0xMTkuNyAyNjMuN0wxNTAuNiAyOTQuNkMxNTYuNiAzMDAuNiAxNjQuNyAzMDQgMTczLjIgMzA0TDE5NC43IDMwNEMyMDMuMiAzMDQgMjExLjMgMzA3LjQgMjE3LjMgMzEzLjRMMjQ2LjYgMzQyLjdDMjUyLjYgMzQ4LjcgMjU2IDM1Ni44IDI1NiAzNjUuM0wyNTYgNDAyLjhDMjU2IDQxMS4zIDI1OS40IDQxOS40IDI2NS40IDQyNS40TDI3OC43IDQzOC43QzI4NC43IDQ0NC43IDI4OC4xIDQ1Mi44IDI4OC4xIDQ2MS4zTDI4OC4xIDQ4MEMyODguMSA0OTcuNyAzMDIuNCA1MTIgMzIwLjEgNTEyQzMzNy44IDUxMiAzNTIuMSA0OTcuNyAzNTIuMSA0ODBMMzUyLjEgNDc3LjNDMzUyLjEgNDY4LjggMzU1LjUgNDYwLjcgMzYxLjUgNDU0LjdMNDA2LjggNDA5LjRDNDEyLjggNDAzLjQgNDE2LjIgMzk1LjMgNDE2LjIgMzg2LjhMNDE2LjIgMzUyLjFDNDE2LjIgMzM0LjQgNDAxLjkgMzIwLjEgMzg0LjIgMzIwLjFMMzAxLjUgMzIwLjFDMjkzIDMyMC4xIDI4NC45IDMxNi43IDI3OC45IDMxMC43TDI2Mi45IDI5NC43QzI1OC43IDI5MC41IDI1Ni4zIDI4NC43IDI1Ni4zIDI3OC43QzI1Ni4zIDI2Ni4yIDI2Ni40IDI1Ni4xIDI3OC45IDI1Ni4xTDMxMy42IDI1Ni4xQzMyNi4xIDI1Ni4xIDMzNi4yIDI0NiAzMzYuMiAyMzMuNUMzMzYuMiAyMjcuNSAzMzMuOCAyMjEuNyAzMjkuNiAyMTcuNUwzMDkuOSAxOTcuOEMzMDYgMTk0IDMwNCAxODkuMSAzMDQgMTg0QzMwNCAxNzguOSAzMDYgMTc0IDMwOS43IDE3MC4zTDMyNyAxNTNDMzMyLjggMTQ3LjIgMzM2LjEgMTM5LjMgMzM2LjEgMTMxLjFDMzM2LjEgMTIzLjkgMzMzLjcgMTE3LjQgMzI5LjcgMTEyLjJDMzI2LjUgMTEyLjEgMzIzLjMgMTEyIDMyMC4xIDExMkMyMjQuNyAxMTIgMTQ0LjQgMTc2LjIgMTE5LjggMjYzLjd6TTUyOCAzMjBDNTI4IDI4NS40IDUxOS42IDI1Mi44IDUwNC42IDIyNC4yQzQ5OC4yIDIyNS4xIDQ5MS45IDIyOC4xIDQ4Ni43IDIzMy4zTDQ3My4zIDI0Ni43QzQ2Ny4zIDI1Mi43IDQ2My45IDI2MC44IDQ2My45IDI2OS4zTDQ2My45IDMwNEM0NjMuOSAzMjEuNyA0NzguMiAzMzYgNDk1LjkgMzM2TDUyMCAzMzZDNTIyLjUgMzM2IDUyNSAzMzUuNyA1MjcuMyAzMzUuMkM1MjcuNyAzMzAuMiA1MjcuOCAzMjUuMSA1MjcuOCAzMjB6TTY0IDMyMEM2NCAxNzguNiAxNzguNiA2NCAzMjAgNjRDNDYxLjQgNjQgNTc2IDE3OC42IDU3NiAzMjBDNTc2IDQ2MS40IDQ2MS40IDU3NiAzMjAgNTc2QzE3OC42IDU3NiA2NCA0NjEuNCA2NCAzMjB6Ii8+PC9zdmc+\")"
    icon.style.backgroundRepeat = "no-repeat";
    icon.style.backgroundPosition = "50% 50%";
    icon.style.backgroundSize = "74% 74%";

    // Assemble the elements
    this.container.appendChild(icon); // Icon inside the button

    // Click action
    this.container.addEventListener("click", () => {
      this.map?.flyTo({ center: [-30, 24], zoom: 2, duration: 2000 });
    });

    group.appendChild(this.container); // Button inside the group
    return group;
  }

  onRemove() {
    if (this.container) {
      this.container.parentNode?.removeChild(this.container);
    }
    this.map = undefined;
  }
}