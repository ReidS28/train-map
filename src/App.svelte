<script lang="ts">
	import Router from "svelte-spa-router";
	import Navbar from "./lib/navbar/Navbar.svelte";

	import Home from "./routes/Home.svelte";

	const routes = {
		"/": Home,
	};
</script>

<main>
	<Router {routes} />
</main>
