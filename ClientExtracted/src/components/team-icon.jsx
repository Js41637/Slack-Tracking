import Color from 'color';
import React from 'react';
import Component from '../lib/component';

export default class TeamIcon extends Component {

  static defaultProps = {
    size: 36,
    color: 'black',
    darkened: false,
    borderRadius: 6
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
    darkened: React.PropTypes.bool,
    borderRadius: React.PropTypes.number
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

  render() {
    let {team, size, color, darkened} = this.props;
    let initialsStyle = {
      color: 'white',
      backgroundColor: Color(color).alpha(0.3).rgbaString(),
      height: size,
      width: size,
      opacity: darkened ? 0.4 : 1.0
    };

    let initials = team.initials || '';
    let display = <span className="TeamIcon-initials" style={initialsStyle}>{initials}</span>;

    // If there is a custom icon we display it instead of initials.
    // Icon defaults don't give any indication of what team it is, so we ignore them.
    if (!this.state.imgError && (team.icons && Object.keys(team.icons).length > 0) && !team.icons.image_default) {
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
      <span className="TeamIcon" ref="icon" style={{borderRadius: this.props.borderRadius}}>
        {display}
      </span>
    );
  }
}
