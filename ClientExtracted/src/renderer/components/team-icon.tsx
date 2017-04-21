/**
 * @module RendererComponents
 */ /** for typedoc */

import * as Color from 'color';

import { Component } from '../../lib/component';
import { AsyncImage } from './async-image';

import * as React from 'react'; // tslint:disable-line

export interface TeamProps {
  team?: {
    icons: any | boolean;
    initials: string;
  };
  size: number;
  color: string;
  darkened?: boolean;
  boxShadow?: string;
  borderRadius: number;
}

export interface TeamState {
  imgError?: boolean;
}

/**
 * Displays a team's custom icon if it exists, or the team's initials.
 */
export class TeamIcon extends Component<TeamProps, TeamState> {
  public static readonly defaultProps: TeamProps = {
    size: 36,
    color: 'black',
    darkened: false,
    borderRadius: 6
  };

  public readonly state: TeamState = {
    imgError: false,
  };

  private iconElement: HTMLElement;
  private readonly refHandlers = {
    icon: (ref: HTMLElement) => this.iconElement = ref
  };

  private readonly eventHandlers = {
    onError: () => this.setState({ imgError: true }),
  };

  constructor() {
    super();
    this.renderTextIcon = this.renderTextIcon.bind(this);
  }

  public render(): JSX.Element | null {
    const { team, size, darkened, boxShadow, borderRadius } = this.props;

    let display = this.renderTextIcon();

    // If there is a custom icon we display it instead of initials.
    // Icon defaults don't give any indication of what team it is, so we ignore them.
    if (!this.state.imgError && (team!.icons && Object.keys(team!.icons).length > 0) && !team!.icons.image_default) {
      const { src, srcset } = this.extractSourceSet(team!.icons, size);
      display = (
        <AsyncImage
          className='TeamIcon-icon'
          src={src}
          draggable={false}
          srcSet={srcset}
          width={size}
          style={{ opacity: darkened ? 0.4 : 1.0 }}
          renderPending={this.renderTextIcon}
          onError={this.eventHandlers.onError}
        />
      );
    }

    return (
      <span
        className='TeamIcon'
        ref={this.refHandlers.icon}
        style={{ boxShadow, borderRadius }}
      >
        {display}
      </span>
    );
  }

  private extractSourceSet(icons: any, targetSize: number) {
    const digit = new RegExp('\\d+');
    const iconData: Array<{url: any, size: any}> = [];

    // Store all the parsed data
    for (let id in icons) { // tslint:disable-line
      const url = icons[id];
      // Images are keyed with the identifier "image_<size>", e.g., "image_68".
      // We need to extract the sizes and build a srcset attribute using them.
      const match = digit.exec(id);
      if (!match) continue;
      const size = match[0];
      iconData.push({ url, size });
    }

    // Determine the closest size to the target size
    const src = iconData.reduce((prev, curr) =>
      Math.abs(targetSize - curr.size) < Math.abs(targetSize - prev.size) ? curr : prev
    ).url;

    // Generate the source set
    let srcset = '';
    for (const icon of iconData) {
      // NB: For whatever reason, we're serving up some truly jank crappy scaled
      // icons.
      if (icon.size < 100) continue;
      srcset += `${icon.url} ${icon.size}w,\n`;
    }

    return {
      src,
      srcset
    };
  }

  private renderTextIcon(): JSX.Element {
    const { team, size, color, darkened } = this.props;
    const initials = team!.initials || '';
    const initialsStyle = {
      color: 'white',
      backgroundColor: Color(color).alpha(0.3).rgbaString(),
      height: size,
      width: size,
      opacity: darkened ? 0.4 : 1.0
    };

    return (
      <span className='TeamIcon-initials' style={initialsStyle}>{initials}</span>
    );
  }
}
