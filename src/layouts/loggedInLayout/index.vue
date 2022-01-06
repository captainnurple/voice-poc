<template>
  <v-app id="inspire">
    <!-- Sizes your content based upon application components -->
    <v-main>
      <!-- Provides the application the proper gutter -->
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  name: "LoggedInLayout",
  components: {
    // This is where you would import sub-components as you refactor, e.g.
    // LandingBar: () => import("./appbar"),
  },
  computed: {
    ...mapGetters("user", {
      isLoggedIn: "getUserStatus",
      user: "getUser",
    }),
    username() {
      // return this.user ? this.user.username : ", there!";
    },
    firstName() {
      // return this.user ? this.user.username.split(' ')[0] : null;
    },
    // currentUser() {
    //   return this.user ? this.user : null;
    // }
  },
  data: () => ({}),
  methods: {},
};
</script>