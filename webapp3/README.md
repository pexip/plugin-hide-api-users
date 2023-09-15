# Plugin Hide API Users

This plugin hide the API participants from the Roster list. In the two folders you will find two versions depending on the Web App version that you are using.

This plugin should be deployed in the **same domain** as Web App 3 and for this reason we have some additional steps to test it in a local environment.

## Run for development

Once the branding is deployed we need to configure some parameters: 

- Edit `vite.json` with your environment parameters. You only have to modify the `infinityUrl` parameter with the URL of your Infinity deployment:

- Install all the dependencies:

```bash
$ npm i
```

- Run the dev environment:

```bash
$ npm start
```

## Build for production

To create a package you need to install first all the dependencies:

```bash
$ npm i
```

And now to create the package itself:

```bash
$ npm run build
```

Congrats! Your package is ready and it will be available in the `dist` folder.