<template>
  <v-card outlined class="mb-2">
    <v-list-item three-line>
      <v-list-item-content>
        <div class="text-overline mb-4">{{ recDate }}</div>
        <v-list-item-title class="text-h5 mb-1">
          {{ recTitle }}
        </v-list-item-title>
        <v-list-item-subtitle
          >Ethan dove behind the bollard just as the car slammed into it. The
          vehicle cartwheeled over his head shedding bent metal, sparks, and
          fuel. He unloaded the rest of his clip at the driver's side window as
          it twisted into view, but Franklin jerked down out of the way just in
          time...</v-list-item-subtitle
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
</template>

<script>
module.exports = {
  name: "recording",
  props: {
    // key,
    recDate: String,
    recTitle: String,
  },
  // data: function () {
  //   // return {
  //   //   recTitle: "Jan 23, 2022 Recording",
  //   // };
  // },
};
</script>