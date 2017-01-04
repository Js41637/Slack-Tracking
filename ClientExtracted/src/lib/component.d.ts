//Derived class implementation based on ES2015 does not work along with
//base component class written in TypeScript,
//bypassing it via ambient declaration until migration completes
import React = require('react');
import {Subscription} from 'rxjs/Subscription';

export abstract class Component<P, S> extends React.Component<P, S> {
  protected disposables: Subscription;
}
export default Component; //tslint:disable-line
