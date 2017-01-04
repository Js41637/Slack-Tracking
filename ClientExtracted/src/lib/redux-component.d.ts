//ReduxComponent is not migrated into TypeScript at this moment for reason
//- TS does not support rest/spread property yet (planned in 2.1), better to wait instead move to Object.assign and back again
//(https://github.com/Microsoft/TypeScript/issues/2103)

declare abstract class ReduxComponent { }

export default ReduxComponent; //tslint:disable-line
