/**
 * @module MemoryUsage
 */ /** for typedoc */

export interface CombinedStats {
  memory: Electron.ProcessMemoryInfo;
  resources?: Electron.ResourceUsage;
}

export type TeamLoadedState =
  'full_client' | // The full client is loaded
  'unloaded' |    // The client is unloaded, aka min-web
  'signed_out' |  // The client has been signed out
  'error';        // We were unable to collect stats

export interface TeamMemoryStats {
  teamId: string;
  memory?: Electron.ProcessMemoryInfo;
  state: TeamLoadedState;
  reason?: string;
  teamName: string;
  isBooted: boolean;
  isUnloaded: boolean;
}

/**
 * Returns information about the current process' memory and resource usage.
 *
 * @return {CombinedStats}  The stats object
 */
export function getMemoryUsage(): CombinedStats {
  const memory = process.getProcessMemoryInfo();

  if (process.type === 'renderer') {
    return {
      memory,
      resources: require('electron').webFrame.getResourceUsage()
    };
  }

  return { memory };
}
