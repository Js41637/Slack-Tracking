import React from 'react';

import AppActions from '../../actions/app-actions';
import AppStore from '../../stores/app-store';
import Component from '../../lib/component';
import Modal from '../../components/modal';

export default class BasicAuthView extends Component {
  constructor() {
    super();
    this.state = Object.assign({}, this.state, AppStore.getAuthCredentials() || {
      username: null,
      password: null
    });
  }

  static propTypes = {
    authInfo: React.PropTypes.object
  };

  handleSubmit() {
    AppActions.submitCredentials({
      username: this.state.username,
      password: this.state.password
    });
  }

  handleChange(event) {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  componentDidMount() {
    this.refs.username.focus();
  }

  render() {
    let {isProxy, host} = this.props.authInfo;
    let message = `To connect to Slack, you need to enter a username and password for the ${isProxy ? 'proxy' : 'server'} `;

    return (
      <Modal className="AuthView"
        width={360} height={340}
        transitionAppear={true}>
        <div className="AuthView-dialog" style={{height: '100%', backgroundColor: 'white'}}>
          <div className="AuthView-message">
            {message}
            <strong>{host}</strong>
          </div>
          <form onSubmit={this.handleSubmit.bind(this)}>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={this.state.username} onChange={this.handleChange.bind(this)} ref="username" />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={this.state.password} onChange={this.handleChange.bind(this)} ref="password" />
            <button type="submit" className="AuthView-button">Submit</button>
          </form>
        </div>
      </Modal>
    );
  }
}
