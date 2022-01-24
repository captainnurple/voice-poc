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

Deploy and create a user on the deployed site (I think you have to do it this way before you can use local dev sign-in). Verify your email and you should be able to log in now on the landing page.

If you didn't missing anything you should now be able to inspect the vuex user object from the Landing page to check login status.

Add the following to your router:

    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        layout: "logged_in_layout",
        requiresAuth: true
      },
      component: () => import(/* webpackChunkName: "dashboard" */ '../views/Dashboard.vue'),
    },

copy over `Dashboard.vue` and loggedInLayout `index.vue`. You should now see the HelloWorld landing page on the dashboard link. And if you log out you should be redirected to the Landing Page.

We don't have nav guard in though yet. So copy over the navigation guard code into the router file now. (make sure to also include `import store from '@/store'` at top)

Now you should be redirected to the Landing Page if you attempt direct navigation w/o being logged in.

Great milestone! We now have multiple layouts enabled. Netlify identity signup. And conditional content displayed based on whether or not user is signed in.

Next step: Add uppy widget and pull the transloading template ID via Netlify API call that only returns if the user has a valid logged in session.

---

# Netlify Functions

**Install netlify CLI if you haven't yet.
**
`npm install netlify-cli -g`

Create (if doesn't exist) `netlify.toml` file with 
```
[build]
  functions="/functions"
```

Create (if doesn't exit) directory `/functions` in root. This is where Netlify functions go.

See sample syntax in `/functions/hello.js`

Make sure you've saved all the files lol. Then you should be able to hit `GET http://localhost:8888/.netlify/functions/hello` in apitests.http using the REST Client plugin

# Transloadit ID via API call

Go to "Build & Deploy > Environment variables" in your Netlify dashboard.

Create:
- TRANSLOADIT_KEY
- TRANSLOADIT_TEMPLATE_ID

You'll access those in code via `process.env.{KEY_NAME}`

**Make sure you link your Netlify site so the ENV vars are injected at dev time. Just use `netlify link` on command line**

Now you can check for a `user` object within the function, and only return the keys for logged-in users. (This object only exists w/in Netlify functions if there is a logged-in Identity user)

Test on command line via, e.g.
`netlify functions:invoke uploadKey --identity`
`netlify functions:invoke uploadKey --no-identity`

You should now be able to conditionally provide the upload/transloadit keys at runtime *only* to logged-in users. Woohoo!

# Digression on User Verification

Netlify Identity makes it very easy to verify that a user is validly logged in. Just check for a user object! Per the forum answer linked below, you can verify a logged in user via:

```
exports.handler = async (event, context) => {
  if (context?.clientContext?.user) {
    // process the function
  } else {
    return {
      statusCode: 401,
      body: JSON.stringify('Unauthorized')
    }
  }
}
```

See **Approach 3: Using authorisation** here: https://answers.netlify.com/t/how-to-apply-access-control-for-netlify-functions/46519

And also docs on the user object etc here: https://docs.netlify.com/functions/functions-and-identity/

This is great! Because it means that from within our Netlify Function we just pull the user object at time of request and we can 1) Verify that we have a logged in user, and 2) Extract the userID object from the user object (I believe via `user.id`) to know who we're dealing with! (side-side note: the Gotrue API looks like there's email in the user object too.)

# Connect to Fauna and persist user registrations upon sign-up

Login to Fauna and click "Create Database."

Name your database, and then select GraphQL on the sidebar.

Locally, create a database folder with a schema in it `db/schema.gql` with the following schema (modify as necessary):


```
type User {
  netlifyID: ID! # ! means can't return null
  email: String!
}
```

After importing your schema, test the following GraphQL query to ensure functionality:

```
# Write your query or mutation here
mutation {
  createUser(data: {netlifyID: 1, email:"bob"}) {
    netlifyID
    email
  }
}
```

If it worked, you should see the new entry in your Collections (as an entry in a new "User" collection). Hooray! Go ahead and delete that entry, and now we can wire up the new user signup hooks.

## Identity Function Hooks

We can now bring Netlify fuctions together with FaunaDB, using [Identity Function hooks](https://docs.netlify.com/functions/functions-and-identity/).

Create your signup hook in `functions/identity-signup.js`. This will get called every time a new user signs up via Identity.

See discussion [here](https://youtu.be/wqQ6kF-psu4?t=2635)

Test via the following: 
```
exports.handler = async (event) => {
  const { user } = JSON.parse(event.body);
  console.log(JSON.stringify(user, null, 2));

  return {
    statusCode: 200,
    // body: JSON.stringify({ app_metadata: { roles: ["user"] } }), // Optional metadata args; see docs
  };
};

```

Commit and push to test live.

If everything is working, you should be able to register a new user, and AFTER clicking the confirmation email, the Netlify function log should output the user object for that new signup! (To view the function log you go to the Functions page and select the identity signup function).

## Wiring it up to Fauna

Netlify can now include anything you npm install in root, so add the following:

`npm i node-fetch@2.6.2`

(node-fetch v3 requires different syntax so avoid it for now)

Navigate to your database in Fauna and go to the "Security" tab on the left. Select create a new key, and select "Server" key in the Role dropdown. Give it a name and the Key will appear.

Copy the key and go back over to Netlify.

Go to Site Settings > Build & Deploy > Environment > Edit Variables

Add an environment variable called FAUNA_SERVER_KEY and paste in the Key you copied above.

(Note for local dev you have to kill and restart `netlify dev` to update these keys I think.)

Now modify `identity-signup` as follows:

```
const fetch = require("node-fetch");

exports.handler = async (event) => {
  const { user } = JSON.parse(event.body);
  console.log(JSON.stringify(user, null, 2));

  const netlifyID = user.id;
  const email = user.email;

  const response = await fetch("https://graphql.us.fauna.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.FAUNA_SERVER_KEY}`,
    },
    body: JSON.stringify({
      query: `
        mutation ($netlifyID: ID! $email: String!) {
          createUser(data: {netlifyID: $netlifyID, email: $email}) {
            netlifyID
            email
          }
        }
      `,
      variables: {
        netlifyID,
        email,
      },
    }),
  })
    .then((res) => res.json())
    .catch((err) => console.error(JSON.stringify(err, null, 2)));

  console.log(JSON.stringify(response, null, 2));

  return {
    statusCode: 200,
    // body: JSON.stringify({ app_metadata: { roles: ["user"] } }), // Optional metadata args; see docs
  };
};
```

Depending on Fauna region you may need to modify endpoint.

Don't forget to commit and push!!!

Now run through a test user signup. If all goes well, you should see a new entry in your FaunaDB containing that user's email and netlifyID!

Woohoo!!

Next step: fix landing page login wiring. Set up logged-in dashboard.

# Landing Page & Dashboard

This time the Dashboard will be simpler. I can keep the general template for future expansion. But for now the dashboard should be simplified to focus on the file upload interface.

## Landing Page Wiring

Get the right hooks for logged-in/out UI.

### Vuex login bindings

Need to bind to Identity events in all the relevant places. Possibly the best place is in the layout *templates* themselves. Essentially need to check for a persisted logged in cookie (Identity itself checks for this) and if it's there go ahead and load it into vuex. Otherwise need to bind to login event and update all requisite UI elements accordingly. And of course Vue bindings are a core design principle here so it shouldn't be too difficult.

See current implementation in voice-v2 for an approach that seems to work and successfully load logged-in user into vuex store even after page close/refresh (I think I really worked it out pretty well in that).

Remember: security in depth. Build in security checks/verifications at multiple layers so that even if e.g. a user modifies the logged in state to `true` they still can't see anything valuable on those pages.

**NOTE:** This actually seems to be working now. I think I copied over a bunch of boilerplate code and nav guards already, and it looks like vuex store is being properly set/unset at login. So for now I'm going to move on. Can test more later.