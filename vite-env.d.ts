// Augmented NodeJS.ProcessEnv to include API_KEY.
// This allows strict typing for process.env.API_KEY while avoiding conflicts with @types/node.
declare namespace NodeJS {
  interface ProcessEnv {
    readonly API_KEY: string;
  }
}