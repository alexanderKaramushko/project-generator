#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('../../dist/index');

const CLI = new lib.CLIStorage();

CLI.logArgs();
