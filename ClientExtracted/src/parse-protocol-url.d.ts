//since parse-protocol-url is being used early stage of init(es6-init),
//does not migrate to typescript but having ambient type definition to pass compiler
export const parseProtocolUrl: (protoUrl: string) => any;
