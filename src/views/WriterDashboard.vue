<template>
  <div>
    <div class="text-center">
      <v-btn
        hidden="true"
        id="uppyModalOpenerButton"
        color="primary"
        class="ma-2 white--text"
      >
        Upload New Recording
        <v-icon right dark> mdi-cloud-upload </v-icon>
      </v-btn>
    </div>
    <v-sheet outlined class="d-flex justify-center mb-6 pa-2">
      <h3>Upload New Recording</h3>
      <div id="uppyDashboard"></div>
    </v-sheet>
    <div>
      <v-sheet outlined elevation="1" class="pa-2">
        <h1>Recent Uploads</h1>
        <v-card outlined class="mb-2">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Jan 23, 2022 Recording</div>
              <v-list-item-title class="text-h5 mb-1">
                Ethan Escape Scene
              </v-list-item-title>
              <v-list-item-subtitle
                >Ethan dove behind the bollard just as the car slammed into it.
                The vehicle cartwheeled over his head shedding bent metal,
                sparks, and fuel. He unloaded the rest of his clip at the
                driver's side window as it twisted into view, but Franklin
                jerked down out of the way just in time...</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>

          <v-card-actions>
            <v-btn icon x-large elevation="2">
              <v-icon>mdi-play</v-icon>
            </v-btn>
            <v-progress-linear></v-progress-linear>
          </v-card-actions>
        </v-card>
        <v-card outlined class="mb-2">
          <v-list-item three-line>
            <v-list-item-content>
              <div class="text-overline mb-4">Jan 22, 2022 Recording</div>
              <v-list-item-title class="text-h5 mb-1">
                Ethan Ambush Scene
              </v-list-item-title>
              <v-list-item-subtitle
                >Ethan dove behind the bollard just as the car slammed into it.
                The vehicle cartwheeled over his head shedding bent metal,
                sparks, and fuel. He unloaded the rest of his clip at the
                driver's side window as it twisted into view, but Franklin
                jerked down out of the way just in time...</v-list-item-subtitle
              >
            </v-list-item-content>
          </v-list-item>

          <v-card-actions>
            <v-btn icon x-large elevation="2">
              <v-icon>mdi-play</v-icon>
            </v-btn>
            <v-progress-linear></v-progress-linear>
          </v-card-actions>
        </v-card>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import Robodog from "@uppy/robodog";
import { mapGetters } from "vuex";

require("@uppy/core/dist/style.css");
require("@uppy/dashboard/dist/style.css");

var UPLOAD_KEYS = {};

// const TRANSLOADIT_KEY = process.env.TRANSLOADIT_KEY;
// const TRANSLOADIT_TEMPLATE_ID = process.env.TRANSLOADIT_TEMPLATE_ID;
// console.log(TRANSLOADIT_KEY);

export default {
  name: "WriterDashboard",
  components: {},
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  created: function created() {
    this.fetchUploadKeys();
  },
  mounted: function mounted() {
    console.log("mounted");
  },
  watch: {},
  methods: {
    fetchUploadKeys() {
      fetch("/.netlify/functions/uploadKeyAndID/", {
        headers: {
          Authorization: "Bearer " + this.getUser.access_token,
        },
      })
        .then((response) => {
          if (response.ok) {
            return response.json();
          } else {
            throw response.statusText;
          }
        })
        .then((data) => {
          UPLOAD_KEYS = data;
          console.log(UPLOAD_KEYS);
          this.initUppy();
        })
        .catch((error) => {
          console.log(error);
        });
    },
    initUppy() {
      const uppy = Robodog.dashboard("#uppyDashboard", {
        inline: true,
        waitForEncoding: true,
        height: 200,
        params: {
          // To avoid tampering, use Signature Authentication
          auth: { key: `${UPLOAD_KEYS.TRANSLOADIT_KEY}` },
          template_id: `${UPLOAD_KEYS.TRANSLOADIT_TEMPLATE_ID}`,
          // auth: { key: "58780b415f124c0f99f6da702e762ad7" },
          // template_id: "12cb3d91ded94271a7345c43b4784972",
        },
      });
      uppy.on("upload-success", (file, resp) => {
        console.log("upload-success");
        console.log(JSON.stringify(file, null, 2));
        console.log(JSON.stringify(resp, null, 2));
      });
      uppy.on("complete", (result) => {
        console.log("complete");
        console.log(JSON.stringify(result, null, 2));
      });
      uppy.on;
    },
  },
};
</script>