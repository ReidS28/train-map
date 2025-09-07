<template>
	<div>
		<Navigation />
		<router-view />
	</div>
</template>

<script lang="ts">
import Navigation from "./components/Navigation.vue";

export default {
	name: "App",
	components: {
		Navigation,
	},
};
</script>
