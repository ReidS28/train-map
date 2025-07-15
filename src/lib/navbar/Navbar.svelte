<script>
	import NavbarButton from "./NavbarButton.svelte";

</script>

<nav class="navbar glass">
	<NavbarButton herf="#/">Home</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
	<NavbarButton herf="#/about">About</NavbarButton>
</nav>

<style>
	.navbar {
		padding: 0.4rem;
		display: flex;
		gap: 0.2rem;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		z-index: 10;
	}
	a {
		color: white;
		text-decoration: none;
	}
</style>
