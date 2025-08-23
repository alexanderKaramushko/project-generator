import chalk from 'chalk';
import { createWriteStream, existsSync, mkdirSync, WriteStream } from 'fs';
import os from 'os';
import path from 'path';

import { createRWFile } from 'lib/utils';

type Level = 'info' | 'error' | 'warning';

export class Logger {

  writeStream: WriteStream | null = null
  writeStreamOpened = false;
  pgDir: string = ''
  logFilePath: string = ''

  // eslint-disable-next-line no-empty-function, no-useless-constructor
  constructor(private fileName = 'pg-generator-debug', private dirName = '.pg') {
    this.createLogDir();

    this.logFilePath = path.join(this.pgDir, `${this.fileName}-${process.pid}.log`);

    createRWFile(this.logFilePath, '', () => {
      this.writeStream = createWriteStream(
        this.logFilePath,
        { flags: 'a' },
      );

      this.writeStream.on('open', () => {
        this.writeStreamOpened = true;
      });

      this.writeStream?.on('error', () => {
        this.end();
      });
    });
  }

  createLogDir() {
    const homeDir = os.homedir();

    this.pgDir = path.join(homeDir, this.dirName);

    if (!existsSync(this.pgDir)) {
      mkdirSync(this.pgDir);
    }
  }

  writeLog = (level: Level, message: string) => {
    if (this.writeStreamOpened) {
      const colorizedLevels: Record<Level, string> = {
        error: chalk.red(level),
        info: chalk.blue(level),
        warning: chalk.yellow(level),
      };

      this.writeStream?.write(`${colorizedLevels[level]}: ${message}${os.EOL}`);
    }
  }

  start() {
    process.on('log', this.writeLog);
  }

  end() {
    process.off('log', this.writeLog);
    this.writeStream?.close();
  }

  static logInfo(message: string) {
    process.emit('log', 'info', message);
  }

  static logWarning(message: string) {
    process.emit('log', 'warning', message);
  }

  static logError(message: string) {
    process.emit('log', 'error', message);
  }

}
