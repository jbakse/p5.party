/// WARNING. This file is not used.

const { Deepstream } = require("@deepstream/server");

/*
The server can take
1) a configuration file path
2) null to explicitly use defaults to be overriden by server.set()
3) left empty to load the base configuration from the config file located within the conf directory.
4) pass some options, missing options will be merged from the base configuration.
*/
const server = new Deepstream();

// start the server
server.start();
