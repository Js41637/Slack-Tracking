import * as path from 'path';
import {logger} from '../../logger';
import {parseLicenses, License} from '../../parse-licenses';
import {VirtualScroll} from 'react-virtualized';

import * as ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import * as ReactHeight from 'react-height';
import {Component} from '../../lib/component';
import {settingStore} from '../../stores/setting-store';

import * as React from 'react'; // tslint:disable-line

const DEFAULT_ROW_HEIGHT = 60;
const HORIZONTAL_PADDING = 24;

export interface DependenciesViewProps {
  width: number;
  height: number;
  className?: string;
  style?: any;
}

export interface DependenciesViewState {
  resourcePath: string;
  isDevMode: boolean;
  isMac: boolean;
  visibleLicenses: Array<any>;
  rowHeights: Array<number>;
  dependencies: Array<License>;
}

export class DependenciesView extends Component<DependenciesViewProps, Partial<DependenciesViewState>> {
  private virtualScrollElement: VirtualScroll;
  private readonly refHandlers = {
    virtualScroll: (ref: VirtualScroll) => this.virtualScrollElement = ref
  };

  constructor() {
    super();

    Object.assign(this.state, {
      visibleLicenses: [],
      rowHeights: []
    });
  }

  public syncState(): Partial<DependenciesViewState> {
    return {
      resourcePath: settingStore.getSetting<string>('resourcePath'),
      isDevMode: settingStore.getSetting<boolean>('isDevMode'),
      isMac: settingStore.isMac()
    };
  }

  public async componentDidMount(): Promise<void> {
    const licensePath = this.getLicensePath();

    try {
      const dependencies = await parseLicenses(licensePath);
      this.setState({ dependencies });
    } catch (error) {
      logger.error(`Unable to read licenses file: ${error.message}`);
      this.setState({ dependencies: [] });
    }
  }

  public render(): JSX.Element | null {
    const {dependencies} = this.state;

    return dependencies ? (
      <VirtualScroll
        {...this.props}
        ref={this.refHandlers.virtualScroll}
        rowCount={dependencies.length}
        rowHeight={this.getHeightForRow.bind(this)}
        rowRenderer={this.renderRow.bind(this)}
      />
      ) : null;
  }

  private getLicensePath(): string {
    const {resourcePath, isDevMode, isMac} = this.state;

    const pathChanges = isDevMode ? [] : isMac ? ['..'] : ['..', '..'] ;
    const licensePath = path.resolve(resourcePath, ...pathChanges, 'LICENSE');

    return licensePath;
  }

  private getHeightForRow({index}: {index: number}): number {
    return this.state.rowHeights![index] || DEFAULT_ROW_HEIGHT;
  }

  /**
   * When a license is expanded, we'll receive a new height. We need to notify
   * the `VirtualScroll` component that a row height changed.
   *
   * @param  {Number} index            The index of the row that changed
   * @param  {Number} additionalHeight The height of the expanded license
   */
  private rowMeasured(index: number, additionalHeight: number): void {
    if (!this.state.rowHeights![index]) {
      const rowHeights = [...this.state.rowHeights!];
      rowHeights[index] = DEFAULT_ROW_HEIGHT + additionalHeight;

      this.setState({ rowHeights });
      (this.virtualScrollElement as any).recomputeRowHeights();
    }
  }

  /**
   * Expands the license text at the given index.
   */
  private viewLicense(index: number): void {
    const visibleLicenses = [...this.state.visibleLicenses!];
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
  private renderLicense(index: number, licenseText: string): JSX.Element {
    const width = this.props.width - (HORIZONTAL_PADDING * 2);
    const renderLicenseLine = (line: string) => {
      return [
        line.trim().length > 0 ? <span>{line}</span> : null,
        <br />
      ];
    };

    return (
      <ReactHeight onHeightReady={this.rowMeasured.bind(this, index)}>
        <div className='Dependency-licenseText' style={{width}}>
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
  private renderRow({index}: {index: number}): JSX.Element {
    const visibleLicenses = this.state.visibleLicenses || [];
    const dependencies = this.state.dependencies || [];
    const dependency = dependencies[index];

    const hasLicenseText = dependency.licenseText &&
      dependency.licenseText.length > 0 &&
      dependency.licenseText !== '<content omitted>';

    const isLicenseVisible = visibleLicenses.includes(index);

    const viewLicenseButton = hasLicenseText && !isLicenseVisible ?
      (
      <input
        type='button'
        value='…'
        className='Dependency-viewLicense'
        onClick={this.viewLicense.bind(this, index)}
      />
      ) : null;

    const licenseText = isLicenseVisible ?
      this.renderLicense(index, dependency.licenseText) :
      null;

    return (
      <div className='Dependency' key={index}>
        <span className='Dependency-name'>{dependency.name}</span>
        <span className='Dependency-licenseName'>{dependency.licenseName}</span>
        <ReactCSSTransitionGroup
          transitionName='Dependency-viewLicense'
          transitionLeaveTimeout={200}
          transitionEnter={false}
        >
          {viewLicenseButton}
        </ReactCSSTransitionGroup>
        <ReactCSSTransitionGroup
          transitionName='Dependency-licenseText'
          transitionEnterTimeout={400}
          transitionLeave={false}
        >
          {licenseText}
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}
