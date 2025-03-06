import { ConsoleLogger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as puppeteer from 'puppeteer';

export class FileLogger extends ConsoleLogger {
  private logDirectory = path.resolve(__dirname, '../../logger/file-logger'); 

  constructor() {
    super();
    this.ensureLogDirectoryExists();
    this.overrideConsole();
  }

  private getLogFile(): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDirectory, `${date}_application.log`);
  }

  log(message: string, context?: string) {
    super.log(message, context);
    this.writeToFile('LOG', message, context);
  }

  error(message: string, stack?: string, context?: string) {
    super.error(message, stack, context);
    this.writeToFile('ERROR', `${message} - ${stack}`, context);
  }

  warn(message: string, context?: string) {
    super.warn(message, context);
    this.writeToFile('WARN', message, context);
  }

  debug(message: string, context?: string) {
    super.debug(message, context);
    this.writeToFile('DEBUG', message, context);
  }

  verbose(message: string, context?: string) {
    super.verbose(message, context);
    this.writeToFile('VERBOSE', message, context);
  }

  async captureBrowserLogs(browser: puppeteer.Browser) {
    const pages = await browser.pages();
    for (const page of pages) {
      page.on('console', (msg) => {
        const logMessage = msg.text();
        this.log(`Puppeteer Console: ${logMessage}`);
      });
      page.on('error', (error) => {
        this.error(`Puppeteer Error: ${error.message}`);
      });
      page.on('pageerror', (pageError) => {
        this.error(`Puppeteer Page Error: ${pageError.message}`);
      });
    }
  }

  private writeToFile(level: string, message: string, context?: string) {
    const logMessage = `[${new Date().toISOString()}] [${level}] ${context ? `[${context}]` : ''} ${message}\n`;
    const logFile = this.getLogFile();
    try {
      fs.appendFileSync(logFile, logMessage);
    } catch (error) {
      console.error(`Failed to write to log file: ${error.message}`);
    }
  }

  private ensureLogDirectoryExists() {
    if (!fs.existsSync(this.logDirectory)) {
      try {
        fs.mkdirSync(this.logDirectory, { recursive: true });
        console.log(`Log directory created at: ${this.logDirectory}`);
      } catch (error) {
        console.error(`Failed to create log directory: ${error.message}`);
      }
    }
  }

  private overrideConsole() {
    const originalStdoutWrite = process.stdout.write.bind(process.stdout);
    const originalStderrWrite = process.stderr.write.bind(process.stderr);

    process.stdout.write = (chunk: any, encoding?: BufferEncoding | Function, callback?: Function): boolean => {
      this.writeToFile('CONSOLE', chunk.toString().trim());
      return originalStdoutWrite(chunk, encoding, callback);
    };

    process.stderr.write = (chunk: any, encoding?: BufferEncoding | Function, callback?: Function): boolean => {
      this.writeToFile('ERROR', chunk.toString().trim());
      return originalStderrWrite(chunk, encoding, callback);
    };
  }
}
