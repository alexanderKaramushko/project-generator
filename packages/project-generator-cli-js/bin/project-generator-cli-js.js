#!/usr/bin/env node
// eslint-disable-next-line @typescript-eslint/no-var-requires
const lib = require('../dist/index');

const args = process.argv.slice(2);

if (args.some((arg) => ['-i', '--interactive'].includes(arg))) {
  const CLIPromptsParser = new lib.CLIPromptsParser();
  const core = new lib.Core(CLIPromptsParser);

  CLIPromptsParser.parseInput().then(() => {
    CLIPromptsParser.logArgs();
    core.createApp();
  });
} else {
  const CLIInputParser = new lib.CLIInputParser();
  const core = new lib.Core(CLIInputParser);

  CLIInputParser.parseInput().then(() => {
    CLIInputParser.logArgs();
    core.createApp();
  });
}

