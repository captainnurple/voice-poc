<template>
  <div class="testing">
    <h1>This is a testing page</h1>
    <button v-on:click="pollForTranscript">Poll for Transcript</button>
    <br />
    <button v-on:click="testAuthToken">Test Auth Token</button>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import apiCalls from "../mixins/apiCalls.js";

export default {
  name: "Testing",
  mixins: [apiCalls],
  data: () => ({
    testResponse: null,
  }),
  computed: {
    ...mapGetters("user", ["getUser"]),
  },
  methods: {
    testAuthToken() {
      console.log(this.userAuthToken());
    },
    pollForTranscript: function (event) {
      console.log("polling");
      const filePrefix = "cb27daef_4bfc_4f69_9d44_113e4605bad2__1648936843898";
      fetch("/.netlify/functions/fetchRecordingUpdates", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + this.getUser.access_token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePrefix: `${filePrefix}`,
        }),
      })
        .then((res) => {
          return res.json();
        })
        .then((data) => {
          console.log("Data : ", data);
          this.testResponse = data;
        })
        .catch((err) => {
          console.error("Err : ", err);
        });
    },
  },
};
</script>