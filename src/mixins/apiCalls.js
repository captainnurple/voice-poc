// Mixin methods for API calls, especially ensuring that the JWT access_token is kept up to date.

import netlifyIdentity from "netlify-identity-widget";
import { mapGetters, mapActions } from "vuex";

export default {
  data() {
    return {
      testKey: "Hello Test"
    }
  },
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  methods: {
    ...mapActions("user", {
      updateUser: "updateUser",
    }),
    userAuthToken() {
      // Check whether auth token is expired
      // If it is, then refresh it
      // If it is not, then return it
      // If it is not set, then return null
      if (this.getUser.access_token) {
        if (this.getUser.access_token.expiresAt < Date.now()) {
          return this.refreshAuthToken()
        } else {
          return this.getUser.access_token
        }
      }
    },
    refreshAuthToken() {
      // Refresh auth token via netlifyIdentity.refresh()
      // Return new auth token
      // If it fails, then return null
      return netlifyIdentity.refresh().then((jwt) => {
        if (jwt) {
          temp_user = this.getUser;
          temp_user.access_token = jwt;
          this.updateUser({
            currentUser : temp_user
          });
          return jwt
        } else {
          return null
        }
      })
    }
  },
}