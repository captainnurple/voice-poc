<template>
  <v-fade-transition mode="out-in">
    <component :is="currentLayout"> </component>
  </v-fade-transition>
</template>

<script>
export default {
  name: "AppVue",
  computed: {
    currentLayout() {
      return this.$route.meta.layout;
    },
  },
};
</script>