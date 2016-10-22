import ReduxComponent from '../../lib/redux-component';

export default class WindowBehavior extends ReduxComponent{
  setup(hostWindow) { // eslint-disable-line
    throw new Error('Override this!');
  }
}
