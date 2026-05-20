# Plugin Hide API Users

This plugin hides the API participants from the Roster list. In the two folders
you will find two versions depending on the Web App version that you are using.

This plugin should be deployed in the **same domain** as Web App 3 and for this
reason we have some additional steps to test it in a local environment.

## Run for development

- To be able to build the plugin, you need to comply with the following versions
  or higher:

  | NodeJS   | NPM     |
  | -------- | ------- |
  | v22.19.0 | v10.9.3 |

- Create a file `.env` in the root of the project with the following content:

```env
VITE_INFINITY_TARGET=<infinity_url>
VITE_INFINITY_PATH=<infinity_path>
VITE_DEV_SERVER_PORT=<dev_server_port>
```

The `VITE_INFINITY_TARGET` variable is **mandatory** and should contain the URL
of the Pexip Infinity system where you want to test the plugin.

The `VITE_INFINITY_PATH` variable is an optional variable used to specify the
path where Web App 3 is served on the Pexip Infinity system. If not provided, it
defaults to `/webapp3`.

The `VITE_DEV_SERVER_PORT` variable is an optional variable used to specify the
port on which the development server will run. If not provided, it defaults to
`5173`.

You can check an example in the provided `.env.example` file.

- Install all the dependencies:

```bash
$ npm i
```

- Run the dev environment:

```bash
$ npm start
```

The plugin will be served from https://localhost:5173 (visit that page and
accept the self-signed certificates), but you should access it through the Web
App 3 URL. You have more information about how to configure your environment in
the
[Developer Portal: Setup guide for plugin developers](https://developer.pexip.com/docs/plugins/webapp-3/setup-guide-for-plugin-developers).

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

## Considerations

- **Dependency on Web App 3 implementation:** This plugin manipulates the DOM of
  Web App 3 by relying on specific `data-testid` attributes and DOM structure.
  If the Web App 3 implementation changes, the plugin may stop working as
  expected.

- **Duplicate display names:** The plugin matches participant rows in the UI by
  their `displayName`. If two participants share the same display name but have
  different call types (e.g., one is an API user and the other is not), the
  plugin cannot distinguish between them. Both rows will be treated according to
  whichever participant is found first in the internal list, which may result in
  the API user being shown or the non-API user being hidden.
