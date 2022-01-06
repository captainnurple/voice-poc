<template>
  <v-parallax
    dark
    src="https://cdn.vuetifyjs.com/images/backgrounds/vbanner.jpg"
  >
    <v-row align="center" justify="center">
      <v-col class="text-center" cols="12">
        <h1 class="text-h4 font-weight-thin mb-4">Writer's Voice</h1>
        <div v-if="isLoggedIn">
          <p>Hello {{ username }}</p>
          <h4 class="subheading">
            <v-btn class="ma-2" outlined rounded color="white" to="/dashboard">
              Go to your dashboard.
            </v-btn>
          </h4>
          <v-btn
            class="ma-2"
            outlined
            rounded
            color="white"
            @click="triggerNetlifyIdentityAction('logout')"
          >
            Log Out
          </v-btn>
        </div>
        <div v-else>
          <p>You are not logged in.</p>
          <p>
            <v-btn
              class="ma-2"
              outlined
              rounded
              color="white"
              @click="triggerNetlifyIdentityAction('login')"
            >
              Log In
            </v-btn>
            <v-btn
              class="ma-2"
              outlined
              rounded
              color="white"
              @click="triggerNetlifyIdentityAction('signup')"
            >
              Sign Up
            </v-btn>
            <!-- <button @click="triggerNetlifyIdentityAction('login')">Log In</button> -->
            <!-- <button @click="triggerNetlifyIdentityAction('signup')">Sign Up</button> -->
          </p>
        </div>
      </v-col>
    </v-row>
  </v-parallax>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import netlifyIdentity from "netlify-identity-widget";

// Netlify Identity
netlifyIdentity.init({
  APIUrl: "https://boring-varahamihira-cc7a90.netlify.app/.netlify/identity",
  logo: true, // you can try false and see what happens
});

// Import sub-components here! e.g.
// import HelloWorld from '../components/HelloWorld'

export default {
  name: "Landing",
  components: {
    // Include sub-components here! e.g.
    // HelloWorld,
  },
  computed: {
    ...mapGetters("user", {
      isLoggedIn: "true",
      user: "getUser",
    }),
    username() {
      return this.user ? this.user.username : ", there!";
    },
  },
  data: () => ({
    currentUser: null,
  }),
  methods: {
    ...mapActions("user", {
      updateUser: "updateUser",
    }),
    triggerNetlifyIdentityAction(action) {
      if (action == "login" || action == "signup") {
        netlifyIdentity.open(action);
        netlifyIdentity.on(action, (user) => {
          this.currentUser = {
            username: user.user_metadata.full_name,
            email: user.email,
            access_token: user.token.access_token,
            expires_at: user.token.expires_at,
            refresh_token: user.token.refresh_token,
            token_type: user.token.token_type,
          };
          this.updateUser({
            currentUser: this.currentUser,
          });
          netlifyIdentity.close();
        });
      } else if (action == "logout") {
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
