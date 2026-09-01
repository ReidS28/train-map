<script lang="ts">
    import { MapManager } from "./map.svelte.ts";

    const manager = new MapManager();
</script>

<div
    use:manager.initMap
    class="w-full h-full bg-blue-500"
>
</div>