// Fix: Remove reference to vite/client to resolve "Cannot find type definition file" error.
// Fix: Augment NodeJS.ProcessEnv to add API_KEY instead of redeclaring 'process' to avoid type conflicts.
declare namespace NodeJS {
  interface ProcessEnv {
    API_KEY: string;
  }
}