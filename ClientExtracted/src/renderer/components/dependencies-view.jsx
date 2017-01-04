import {logger} from '../../logger';
import path from 'path';
import {parseLicenses} from '../../parse-licenses';
import {VirtualScroll} from 'react-virtualized';

import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ReactHeight from 'react-height';
import Component from '../../lib/component';
import {settingStore} from '../../stores/setting-store';

const DEFAULT_ROW_HEIGHT = 60;
const HORIZONTAL_PADDING = 24;

export default class DependenciesView extends Component {

  static propTypes = {
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired
  }

  constructor() {
    super();

    Object.assign(this.state, {
      visibleLicenses: [],
      rowHeights: []
    });
  }

  syncState() {
    return {
      resourcePath: settingStore.getSetting('resourcePath'),
      isDevMode: settingStore.getSetting('isDevMode'),
      isMac: settingStore.isMac()
    };
  }

  async componentDidMount() {
    let licensePath = this.getLicensePath();

    try {
      let dependencies = await parseLicenses(licensePath);
      this.setState({ dependencies });
    } catch (error) {
      logger.error(`Unable to read licenses file: ${error.message}`);
      this.setState({ dependencies: [] });
    }
  }

  getLicensePath() {
    let {resourcePath, isDevMode, isMac} = this.state;

    let pathChanges = isDevMode ? [] : isMac ? ['..'] : ['..', '..'] ;
    let licensePath = path.resolve(resourcePath, ...pathChanges, 'LICENSE');

    return licensePath;
  }

  getHeightForRow({index}) {
    return this.state.rowHeights[index] || DEFAULT_ROW_HEIGHT;
  }

  /**
   * When a license is expanded, we'll receive a new height. We need to notify
   * the `VirtualScroll` component that a row height changed.
   *
   * @param  {Number} index            The index of the row that changed
   * @param  {Number} additionalHeight The height of the expanded license
   */
  rowMeasured(index, additionalHeight) {
    if (!this.state.rowHeights[index]) {
      let rowHeights = [...this.state.rowHeights];
      rowHeights[index] = DEFAULT_ROW_HEIGHT + additionalHeight;

      this.setState({ rowHeights });
      this.refs.virtualScroll.recomputeRowHeights();
    }
  }

  /**
   * Expands the license text at the given index.
   */
  viewLicense(index) {
    let visibleLicenses = [...this.state.visibleLicenses];
    visibleLicenses.push(index);
    this.setState({ visibleLicenses });
  }

  /**
   * Renders a single license. In order to preserve the license formatting, we
   * break the text across CR LF lines and insert `<br />` for each. We use
   * `ReactHeight` to calculate the expanded height, which the virtualized list
   * needs in order to calculate offsets.
   *
   * @param  {Number} index       The index of this dependency
   * @param  {String} licenseText The text of the license
   * @return {Node}               A DOM node representing the license
   */
  renderLicense(index, licenseText) {
    let width = this.props.width - (HORIZONTAL_PADDING * 2);
    let renderLicenseLine = (line) => {
      return [
        line.trim().length > 0 ? <span>{line}</span> : null,
        <br />
      ];
    };

    return (
      <ReactHeight onHeightReady={(height) => this.rowMeasured(index, height)}>
        <div className="Dependency-licenseText" style={{width}}>
          {licenseText.split('\r\n').map(renderLicenseLine)}
        </div>
      </ReactHeight>
    );
  }

  /**
   * Renders a single row, or dependency, in the virtualized list.
   *
   * @param  {Number} {index} The index of this dependency in the list
   * @return {Node}           A DOM node representing the dependency
   */
  renderRow({index}) {
    let visibleLicenses = this.state.visibleLicenses || [];
    let dependencies = this.state.dependencies || [];
    let dependency = dependencies[index];

    let hasLicenseText = dependency.licenseText &&
      dependency.licenseText.length > 0 &&
      dependency.licenseText !== '<content omitted>';

    let isLicenseVisible = visibleLicenses.includes(index);

    let viewLicenseButton = hasLicenseText && !isLicenseVisible ?
      <input type="button" value="…"
        className="Dependency-viewLicense"
        onClick={() => this.viewLicense(index)} /> :
      null;

    let licenseText = isLicenseVisible ?
      this.renderLicense(index, dependency.licenseText) :
      null;

    return (
      <div className="Dependency" key={index}>
        <span className="Dependency-name">{dependency.name}</span>
        <span className="Dependency-licenseName">{dependency.licenseName}</span>
        <ReactCSSTransitionGroup
          transitionName="Dependency-viewLicense"
          transitionLeaveTimeout={200}
          transitionEnter={false}>
          {viewLicenseButton}
        </ReactCSSTransitionGroup>
        <ReactCSSTransitionGroup
          transitionName="Dependency-licenseText"
          transitionEnterTimeout={400}
          transitionLeave={false}>
          {licenseText}
        </ReactCSSTransitionGroup>
      </div>
    );
  }

  render() {
    let {dependencies} = this.state;

    return dependencies ? (
      <VirtualScroll
        {...this.props}
        ref="virtualScroll"
        rowCount={dependencies.length}
        rowHeight={this.getHeightForRow.bind(this)}
        rowRenderer={this.renderRow.bind(this)} />
      ) : null;
  }
}
