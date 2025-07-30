#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('node:path');

const rawPackageDir = process.argv[2];
const packageDir = path.join(process.cwd(), rawPackageDir);

const packagesDir = path.join(process.cwd(), 'packages');
const packageJSON = path.join(packageDir, 'package.json');

// eslint-disable-next-line import/no-dynamic-require
const { dependencies } = require(packageJSON);

Object.keys(dependencies).forEach((workspacePackage) => {
  if (workspacePackage.startsWith('pg')) {
    const dependencyDir = path.join(packagesDir, workspacePackage);

    execSync(`
      cd ${dependencyDir} && npm link && cd ${packageDir} && npm link ${workspacePackage}
    `);
  }
});
