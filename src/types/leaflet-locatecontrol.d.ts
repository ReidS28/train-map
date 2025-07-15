declare module "leaflet.locatecontrol";

import "leaflet"; // extend the leaflet module

declare module "leaflet" {
	namespace control {
		function locate(options?: any): Control;
	}
}