<template>
	<nav>
		<router-link to="/" exact>Home</router-link>
		| <router-link to="/about">About</router-link>
		| <router-link to="/contact">Contact</router-link>
		| <router-link to="/map">Map</router-link>

	</nav>
    
</template>

<script lang="ts">
export default {
	name: "Navigation",
};
</script>

<style scoped>
nav {
	margin-bottom: 1rem;
}
nav a {
	text-decoration: none;
	color: blue;
	margin-right: 1rem;
}
nav a.router-link-active {
	color: teal;
}

</style>
