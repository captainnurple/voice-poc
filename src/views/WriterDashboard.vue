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

        <recording
          v-for="recording in recordings"
          v-bind:key="recording.id"
          v-bind:recDate="recording.recDate"
          v-bind:recTitle="recording.recTitle"
        />
      </v-sheet>
    </div>
  </div>
</template>

<script>
import Robodog from "@uppy/robodog";
import { mapGetters } from "vuex";
import jwt_decode from "jwt-decode";
import Recording from "../components/Recording.vue";

require("@uppy/core/dist/style.css");
require("@uppy/dashboard/dist/style.css");

var UPLOAD_KEYS = {};

const notifyURL =
  process.env.NODE_ENV == "development"
    ? "http://b1cb-204-128-192-33.ngrok.io"
    : "https://boring-varahamihira-cc7a90.netlify.app";

// const TRANSLOADIT_KEY = process.env.TRANSLOADIT_KEY;
// const TRANSLOADIT_TEMPLATE_ID = process.env.TRANSLOADIT_TEMPLATE_ID;
// console.log(TRANSLOADIT_KEY);

export default {
  name: "WriterDashboard",
  data: () => ({
    // recordings: {
    //   recDate: null,
    //   recTitle: null,
    // },
    recordings: [],
  }),
  components: {
    Recording,
  },
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  created: function created() {
    this.fetchUploadKeys();
  },
  mounted: function mounted() {
    console.log("mounted");
    console.log(this.getUser.access_token);
    const decoded = jwt_decode(this.getUser.access_token);
    console.log(decoded);
    console.log(decoded.sub);
    console.log(jwt_decode(this.getUser.access_token).sub);
    this.fetchRecordings(this.recordings);
    // this.recordings.push({
    //   key: 2,
    //   recDate: "March 2, 2022",
    //   keyTitle: "Ethan Arrives",
    // });
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
        getAssemblyOptions(file) {
          return {
            params: {
              auth: { key: `${UPLOAD_KEYS.TRANSLOADIT_KEY}` },
              template_id: `${UPLOAD_KEYS.TRANSLOADIT_TEMPLATE_ID}`,
              notify_url: `${notifyURL}/.netlify/functions/onboardRecording`,
            },
            fields: {
              netlifyUserToken: file.meta.netlifyUserToken,
              netlifyID: file.meta.netlifyID,
              filePrefix: file.meta.filePrefix,
            },
          };
        },
        // params: {
        //   // To avoid tampering, use Signature Authentication
        //   auth: { key: `${UPLOAD_KEYS.TRANSLOADIT_KEY}` },
        //   template_id: `${UPLOAD_KEYS.TRANSLOADIT_TEMPLATE_ID}`,
        //   // auth: { key: "58780b415f124c0f99f6da702e762ad7" },
        //   // template_id: "12cb3d91ded94271a7345c43b4784972",
        // }
      });
      uppy.on("upload-success", (file, resp) => {
        console.log("upload-success");
        // console.log(JSON.stringify(file, null, 2));
        // console.log(JSON.stringify(resp, null, 2));
      });
      uppy.on("complete", (result) => {
        console.log("complete");
        // console.log(JSON.stringify(result, null, 2));
        // Format data for display
        const options = { year: "numeric", month: "long", day: "numeric" };
        const today = new Date();
        const dateStr = today.toLocaleDateString("en-US", options);
        // const resObj = JSON.parse(result);
        const uploadedFileName = result.transloadit[0].uploads[0].name;

        console.log(`Recording date : ${dateStr}`);
        console.log(`Recording Title : ${uploadedFileName}`);
      });
      uppy.on("file-added", (file) => {
        console.log("File added");
        const niid = jwt_decode(this.getUser.access_token).sub;
        const timeStamp = Date.now();
        const prefix = `${niid.replaceAll("-", "_")}__${timeStamp}`;
        console.log(`filePrefix: ${prefix}`);
        uppy.setFileMeta(file.id, {
          netlifyUserToken: this.getUser.access_token,
          netlifyID: niid,
          filePrefix: prefix,
        });
      });
    },
    fetchRecordings(recordings) {
      fetch("/.netlify/functions/fetchUserRecordings", {
        headers: {
          Authorization: "Bearer " + this.getUser.access_token,
        },
      })
        .then((response) => {
          if (response.ok) {
            console.log(response);
            return response;
          } else {
            throw response.statusText;
          }
        })
        .then((data) => {
          console.log(data);
        })
        .catch((error) => {
          console.log(error);
        });
      // fetch("/.netlify/functions/uploadKeyAndID/", {
      //   headers: {
      //     Authorization: "Bearer " + this.getUser.access_token,
      //   },
      // })
      //   .then((response) => {
      //     if (response.ok) {
      //       return response.json();
      //     } else {
      //       throw response.statusText;
      //     }
      //   })
      //   .then((data) => {
      //     UPLOAD_KEYS = data;
      //     console.log(UPLOAD_KEYS);
      //     this.initUppy();
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
      const recs = [
        {
          id: 3,
          recDate: "March 3, 2022",
          recTitle: "Ethan Runs Away",
        },
        {
          id: 2,
          recDate: "March 2, 2022",
          recTitle: "Ethan Arrives",
        },
        {
          id: 1,
          recDate: "March 1, 2022",
          recTitle: "Ethan Sleeps",
        },
      ];
      recs.forEach((item) => recordings.push(item));
    },
  },
};
</script>