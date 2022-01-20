<template>
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="text-h6"> Application </v-list-item-title>
          <v-list-item-subtitle> subtext </v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense nav>
        <v-list-item v-for="item in items" :key="item.title" :to="item.to" link>
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app>
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title>Application</v-toolbar-title>
      <v-spacer></v-spacer>
      Logged in as {{ this.firstName }}
      <v-btn icon to="/profile">
        <v-icon>mdi-account</v-icon>
      </v-btn>
      <v-btn
        class="ma-2"
        outlined
        rounded
        color="primary"
        @click="triggerNetlifyIdentityAction('logout')"
      >
        Log Out
      </v-btn>
    </v-app-bar>

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
import { mapGetters, mapActions } from "vuex";

import netlifyIdentity from "netlify-identity-widget";

// // Netlify Identity
// netlifyIdentity.init({
//   APIUrl: "https://frosty-meninsky-ba8176.netlify.app/.netlify/identity",
//   logo: true // you can try false and see what happens
// });

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
      return this.user ? this.user.username : ", there!";
    },
    firstName() {
      return this.user ? this.user.username.split(" ")[0] : null;
    },
    // currentUser() {
    //   return this.user ? this.user : null;
    // }
  },
  data: () => ({
    drawer: null,
    items: [
      { title: "Dashboard", icon: "mdi-view-dashboard", to: "/dashboard" },
      { title: "About", icon: "mdi-help-box", to: "/about" },
      { title: "Profile", icon: "mdi-account", to: "/profile" },
      { title: "Fauna Testing", icon: "mdi-database", to: "/faunaTesting" },
    ],
    // currentUser: null,
  }),
  methods: {
    ...mapActions("user", {
      updateUser: "updateUser",
    }),
    triggerNetlifyIdentityAction(action) {
      if (action == "logout") {
        this.currentUser = null;
        this.updateUser({
          currentUser: this.currentUser,
        });
        netlifyIdentity.logout();
        this.$router.push({ name: "Landing" }).catch((err) => {
          // Ignore the vuex err regarding  navigating to the page they are already on.
          if (
            err.name !== "NavigationDuplicated" &&
            !err.message.includes(
              "Avoided redundant navigation to current location"
            )
          ) {
            // But print any other errors to the console
            logError(err);
          }
        });
      }
    },
  },
};
</script>