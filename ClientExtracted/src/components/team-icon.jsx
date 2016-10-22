import _ from 'lodash';
import Color from 'color';
import React from 'react';
import Component from '../lib/component';

const isDarwin = process.platform === 'darwin';

export default class TeamIcon extends Component {

  static defaultProps = {
    size: 36,
    color: 'black',
    darkened: false
  };

  static propTypes = {
    team: React.PropTypes.shape({
      icons: React.PropTypes.oneOfType([
        React.PropTypes.object,
        React.PropTypes.bool
      ]),
      initials: React.PropTypes.string,
    }).isRequired,
    size: React.PropTypes.number,
    color: React.PropTypes.string,
    darkened: React.PropTypes.bool
  };

  state = {
    imgError: false
  };

  extractSourceSet(icons, targetSize) {
    let digit = new RegExp("\\d+");
    let iconData = [];

    // Store all the parsed data
    for (let id in icons) {
      let url = icons[id];
      // Images are keyed with the identifier "image_<size>", e.g., "image_68".
      // We need to extract the sizes and build a srcset attribute using them.
      let match = digit.exec(id);
      if (!match) continue;
      let size = match[0];
      iconData.push({url: url, size: size});
    }

    // Determine the closest size to the target size
    let src = iconData.reduce((prev, curr) =>
      Math.abs(targetSize - curr.size) < Math.abs(targetSize - prev.size) ? curr : prev
    ).url;

    // Generate the source set
    let srcset = "";
    for (let icon of iconData) {
      // NB: For whatever reason, we're serving up some truly jank crappy scaled
      // icons.
      if (icon.size < 100) continue;
      srcset += `${icon.url} ${icon.size}w,\n`;
    }

    return {src: src, srcset: srcset};
  }


  getScaledBorderRadius() {
    let rounding = isDarwin ? 6.0 : 2.0;

    // Linearly scale the border radius based on 36px == 6px border, but clamp
    // the scale at 2.5x so we don't turn into a circle at hugebig sizes
    let scale = Math.min((this.props.size / 36.0), 2.5);
    return Math.floor(scale * rounding /*px*/);
  }

  render() {
    let {team, size, color, darkened} = this.props;
    let initialsStyle = {
      color: 'white',
      backgroundColor: Color(color).alpha(0.3).rgbaString(),
      height: size,
      width: size
    };

    let display = <span className="TeamIcon-initials" style={initialsStyle}>{team.initials}</span>;

    // If there is a custom icon we display it instead of initials.
    // Icon defaults don't give any indication of what team it is, so we ignore them.
    if (!this.state.imgError && !_.isEmpty(team.icons) && !team.icons.image_default) {
      let {src, srcset} = this.extractSourceSet(team.icons, size);
      let img =
        <img
          className="TeamIcon-icon"
          src={src}
          draggable={false}
          srcSet={srcset}
          width={size}
          style={{ opacity: darkened ? 0.4 : 1.0}}
          onError={() => this.setState({imgError: true})}
        />;
      display = img;
    }

    return (
      <span className="TeamIcon" ref="icon" style={{borderRadius: this.getScaledBorderRadius()}}>
        {display}
      </span>
    );
  }
}
