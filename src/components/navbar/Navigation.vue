<template>
        <div class="navbar">
                        
                <nav>
                        <router-link to="/" exact>Home</router-link>
                        | <router-link to="/about">About</router-link>
                        | <router-link to="/contact">Contact</router-link>
                        | <router-link to="/map">Map</router-link>
        
                </nav>
                
        </div>
    
</template>

<script lang="ts">
export default {
        name: "Navigation",
};
</script>

<style scoped>
        
.navbar nav {
        padding: 0.2rem;        
        background-color: rgba(64, 64, 64, 0.8);
        backdrop-filter: blur(10px);
        position: relative;
        z-index: 1000;
}
        
.navbar a {
        font-size: 1.2rem;
        text-decoration: none;
        color: blue;
        margin-right: 1rem;
}
        
.navbar a.router-link-active {
        color: teal;
}

</style>
