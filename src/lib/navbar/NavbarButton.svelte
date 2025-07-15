<script lang="ts">
	export let herf: string;
</script>

<div class="glass button">
    <a href={herf}><slot /></a>
</div>

<style>
	a {
		color: white;
		text-decoration: none;
        font-size: 1.3rem;
	}
</style>
