//teams reducer is not migrated into TypeScript at this moment for 2 reason
//- TS does not support rest/spread property yet (planned in 2.1), better to wait instead move to Object.assign and back again
//(https://github.com/Microsoft/TypeScript/issues/2103)
//- reducer's input - output types are highly polymorphic, better to shape once other components are done
export const reduce: any;
export default reduce; //tslint:disable-line
export const getInitialsOfName: (name: string, maxLength?: number) => string;
