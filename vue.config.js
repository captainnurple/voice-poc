module.exports = {
  transpileDependencies: [
    'vuetify'
  ],
  devServer: { // suppresses the massive webpack.Progress terminal spam when running dev server
    progress: false
  }
}
