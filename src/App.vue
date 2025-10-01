<template>
	<div>
		<Navbar />
		<router-view />
	</div>
</template>

<script lang="ts">
import Navbar from "./components/navbar/Navbar.vue"

export default {
	name: "App",
	components: {
		Navbar,
	},
};
</script>
