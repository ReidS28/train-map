<template>
  <router-link :to="to" class="navbar-button" exact>
    <slot></slot>
  </router-link>
</template>

<script lang="ts">
export default {
  name: "NavbarButton",
  props: {
    to: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped>
.navbar-button {
  font-size: 1.6rem;
  padding: 0.1rem 0.4rem;
  background-color: rgba(64, 64, 64, 0.4);
  backdrop-filter: blur(4px);
  border-radius: 0.4rem;
  border: 0.1rem solid rgba(32, 32, 32, 0.6);
  display: inline-block;
  cursor: pointer;
  text-decoration: none;
  color: rgba(180, 180, 180, 0.6);
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
}

/* Active link styles */
.navbar-button.router-link-active,
.navbar-button.router-link-exact-active {
  background-color: rgba(64, 64, 128, 0.6);
  color: rgba(192, 192, 192, 0.8);
}
</style>
