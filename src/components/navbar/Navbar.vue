<template>
  <div class="navbar">
    
    <nav>
     <NavbarButton to="/" exact>Home</NavbarButton>
      <NavbarButton to="/about">About</NavbarButton>
      <NavbarButton to="/contact">Contact</NavbarButton>
      <NavbarButton to="/map">Map</NavbarButton>
  
    </nav>
    
  </div>
  
</template>

<script lang="ts">
import NavbarButton from "./NavbarButton.vue";

export default {
  name: "Navbar",
  components: {
    NavbarButton,
  },
};
</script>

<style scoped>
  
.navbar nav {
  display: flex;
  gap: .3rem;
  padding: .3rem;        
  background-color: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(4px);
  position: relative;
  z-index: 1000;
}

</style>
