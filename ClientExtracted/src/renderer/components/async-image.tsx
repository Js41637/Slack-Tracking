import {Observable} from 'rxjs/Observable';
import {Observer} from 'rxjs/Observer';
import {Component} from '../../lib/component';
import {logger} from '../../logger';
import {omit} from '../../utils/omit';
import {shallowEqual} from '../../utils/shallow-equal';

import * as React from 'react'; // tslint:disable-line

type imageStatusType = 'pending' | 'loaded' | 'error' | 'loading';
const IMAGE_STATUS = {
  PENDING: 'pending' as imageStatusType,
  LOADED: 'loaded' as imageStatusType,
  LOADING: 'loading' as imageStatusType,
  ERROR: 'error' as imageStatusType,
};

export interface AsyncImageProps {
  className?: string;
  draggable?: boolean;
  onError?: () => void;
  onLoad?: () => void;
  renderPending: () => JSX.Element;
  srcSet?: string;
  src: string;
  style?: Object;
  width: number;
}

export interface AsyncImageState {
  status?: string;
}

/**
 * Displays a placeholder element while loading an image asynchronously.
 */
export class AsyncImage extends Component<AsyncImageProps, AsyncImageState> {
  public static readonly state: AsyncImageState = {
    status: IMAGE_STATUS.PENDING
  };

  constructor() {
    super();
    this.handleError = this.handleError.bind(this);
    this.handleLoad = this.handleLoad.bind(this);
  }

  public componentDidMount() {
    const {srcSet, src} = this.props;

    this.fetchImage(src, srcSet).subscribe(() => {
      this.handleLoad();
    }, (err: Error) => {
      this.handleError(err);
    });
  }

  public shouldComponentUpdate(nextProps: AsyncImageProps, nextState: AsyncImageState) {
    // Don't re-render if we're fetching the new image in the background
    const shouldItUpdate = !(shallowEqual(this.props, nextProps) && nextState.status !== IMAGE_STATUS.LOADING)
      || !shallowEqual(this.state, nextState);
    return shouldItUpdate;
  }

  public componentWillReceiveProps(nextProps: any) {
    if (nextProps.src !== this.props.src || nextProps.srcSet !== this.props.srcSet) {
      this.setState({
        status: IMAGE_STATUS.LOADING
      });
    }
  }

  public fetchImage(src: string, srcSet: string | void) {
    return Observable.create((observer: Observer<string>) => {
      const asyncLoader = new Image();

      asyncLoader.src = src;
      if (srcSet) asyncLoader.srcset = srcSet;

      asyncLoader.onerror = (err) => {
        observer.error(err);
      };
      asyncLoader.onload = () => {
        observer.next(src);
        observer.complete();
      };
    });
  }

  public componentDidUpdate(prevProps: AsyncImageProps) {
    if (prevProps.src !== this.props.src || prevProps.srcSet !== this.props.srcSet) {
      this.fetchImage(this.props.src, this.props.srcSet).subscribe(() => {
        this.handleLoad();
      }, (err: Error) => {
        this.handleError(err);
      });
    }
  }

  public render(): JSX.Element | null {
    const {status} = this.state;

    if (status === IMAGE_STATUS.LOADED || status === IMAGE_STATUS.LOADING) {
      const props = omit(this.props, 'renderPending');

      return (
        <img
          {...props}
        />
      );
    }

    return this.props.renderPending();
  }

  private handleLoad() {
    this.setState({
      status: IMAGE_STATUS.LOADED
    });

    const {onLoad} = this.props;
    if (onLoad) onLoad();
  }

  private handleError(err: Error) {
    logger.error(err.message);

    this.setState({
      status: IMAGE_STATUS.ERROR
    });

    const {onError} = this.props;
    if (onError) onError();
  }
}
