<template>
  <v-card outlined elevation="2" shaped class="mb-3">
    <v-card-title>
      {{ recTitle }}
    </v-card-title>
    <v-card-subtitle>
      {{ recDate }}
    </v-card-subtitle>
    <v-card-text v-if="recTranscript" style="white-space: pre-line">
      {{ recTranscript }}
    </v-card-text>
    <v-card-actions>
      <v-btn icon x-large elevation="2">
        <v-icon>mdi-play</v-icon>
      </v-btn>
      <v-progress-linear></v-progress-linear>
    </v-card-actions>
  </v-card>
</template>

<script>
module.exports = {
  name: "recording",
  props: {
    // key,
    recDate: String,
    recTitle: String,
    recTranscript: String,
  },
  // data: function () {
  //   // return {
  //   //   recTitle: "Jan 23, 2022 Recording",
  //   // };
  // },
};
</script>