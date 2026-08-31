export async function initDevtools() {
	if (!import.meta.env.DEV) return;

	const eruda = (await import("eruda")).default;

	const container = document.createElement("div");
	container.id = "eruda-container";
	document.body.appendChild(container);

	eruda.init({
		container,
		tool: ["console", "elements", "network", "resources"],
		useShadowDom: false,
	});
}