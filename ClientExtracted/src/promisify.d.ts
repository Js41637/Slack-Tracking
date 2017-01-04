//since promisify is being used externally in build script,
//does not migrate to typescript but having ambient type definition to pass compiler
export const promisify: any;
export default promisify; //tslint:disable-line
