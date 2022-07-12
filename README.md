# Plugin Hide API Users


## Prerequisites

The only prerequisite for building this project is to have `node` and `npm` in your system. At this moment we are using the following versions:

- node: `16.14.2`
- npm:  `8.5.0`

Other `node` and `npm` could work, but it's recommended to use the same versions.

## Generate a production package

For generating the production package we need follow the next steps:

Install the `node` dependencies:

    $ npm install

Build a production package:

    $ npm run build

This will create a  `dist` folder with the follow architecture:

```
📁 dist
↳ 📁 plugins
  ↳ 📁 hide-api-users
    ↳ 📄 index.js
    ↳ 📄 index.js.LICENSE.txt
    ↳ 📄 plugin.json
```

The main files are these two:

- `index.js`: Contains the whole minified JavaScript code for this plugin.
  
- `plugin.json`: Defines the plugin configuration.

## Testing in local

The first step before testing in local is to configure the file `.npmrc`. In this file we will have to define the following parameters:

- `CONFERENCING_NODE_URL`: The URL of the Conferencing Node that you want to use for testing.
- `PORT`: The local port for using for testing.

The first step is to compile the node dependencies:

    $ npm install

For launching the webapp with the plugin, we use the following command:

    $ npm run start
