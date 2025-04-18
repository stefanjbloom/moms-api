import { app } from '../index';
import { Server } from 'http';

interface ServerError extends Error {
  code?: string;
}

class TestServer {
  private static instance: TestServer;
  private server: Server | null = null;
  private port: number = 5002;
  private isStarting: boolean = false;

  private constructor() {}

  public static getInstance(): TestServer {
    if (!TestServer.instance) {
      TestServer.instance = new TestServer();
    }
    return TestServer.instance;
  }

  public async start(): Promise<void> {
    if (this.server || this.isStarting) {
      return;
    }

    this.isStarting = true;

    return new Promise((resolve, reject) => {
      try {
        this.server = app.listen(this.port, () => {
          console.log(`Test server started on port ${this.port}`);
          this.isStarting = false;
          resolve();
        });

        this.server.on('error', (err: ServerError) => {
          if (err.code === 'EADDRINUSE') {
            console.log(`Port ${this.port} is in use, waiting for it to be released...`);
            setTimeout(() => {
              this.start().then(resolve).catch(reject);
            }, 1000);
          } else {
            this.isStarting = false;
            reject(err);
          }
        });
      } catch (error) {
        this.isStarting = false;
        reject(error);
      }
    });
  }

  public async stop(): Promise<void> {
    if (!this.server) {
      return;
    }

    return new Promise((resolve) => {
      this.server!.close(() => {
        console.log('Test server stopped');
        this.server = null;
        resolve();
      });
    });
  }

  public isRunning(): boolean {
    return this.server !== null;
  }
}

export const testServer = TestServer.getInstance(); 