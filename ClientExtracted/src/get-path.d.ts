//since getPath is being used externally in build script,
//does not migrate to typescript but having ambient type definition to pass compiler
export const getPath: Function;
export const p: (literals: TemplateStringsArray, ...placeholders: Array<string| Array<string>>) => any;
export const pn: Function;
