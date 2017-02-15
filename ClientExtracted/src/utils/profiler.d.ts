//since profiler is being used early stage of init,
//does not migrate to typescript but having ambient type definition to pass compiler
export const profiler: any;
export default profiler; //tslint:disable-line
export const shouldProfile: () => boolean;
export const startProfiling: () => void;
export const stopProfiling: (suffix: string) => void;
