# voice-proto

Created using `vue ui` and Boilerplate template (which I created).

Installed `vue-cli-plugin-vuetify` via vue ui tool. Default configuration.

Created empty `voice-poc` repo on github.

    git remote add origin https://github.com/captainnurple/voice-poc.git
    git branch -M master
    git push -u origin master
    git add .
    git commit -m "Initial commit."
    git push

Create a new site on Netlify via Import Existing Project and grabbing it from github (just use default settings).
Netlify will run the initial deploy and you can verify it worked.

suppress build dev spam in `vue.config.js` via

    devServer: { // suppresses the massive webpack.Progress terminal spam when running dev server
      progress: false
    }


Multiple layouts:
- Initialize layouts in `main.js` and add the vue files in src/layouts
- Set up routes in router.js, with a meta variable denoting whether it's a logged-in view or not.
- Implement dynamic layout switching in `App.vue` based on what router sets to `this.$route.meta.layout`;
- The above will require your layout views, Landing view (at least)
- Will throw errors if copying from other project until you set up Netlify Identity, so let's do that next...

Run npm add netlify-identity-widget on terminal.

Copy over store files from boilerplate and replace.

Enable Identity on your Netlify project and paste in the API endpoint in your init code (currently in Landing.vue).

Deploy and create a user on the deployed site (I think you have to do it this way before you can use local dev sign-in).