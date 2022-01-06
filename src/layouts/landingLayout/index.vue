<template>
  <v-app>
    <router-view></router-view>
  </v-app>
</template>

<script>
export default {
  name: "LandingLayout",
  components: {
    // This is where you would import sub-components as you refactor, e.g.
    // LandingBar: () => import("./appbar"),
  },
};
</script>
