<template>
	<div>
		<Navigation />
		<router-view />
	</div>
</template>

<script lang="ts">
import Navigation from "./components/navbar/Navigation.vue"

export default {
	name: "App",
	components: {
		Navigation,
	},
};
</script>
