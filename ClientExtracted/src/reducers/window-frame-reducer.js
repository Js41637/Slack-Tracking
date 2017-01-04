import {WINDOW_FRAME, MIGRATIONS} from '../actions';

const initialState = {
  windowSettings: null, // Has {position: [x,y], size: [width,height], isMaximized: bool}
  noDragRegions: [],
  isFullScreen: false
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
  case WINDOW_FRAME.SAVE_WINDOW_SETTINGS:
    return Object.assign({}, state, {windowSettings: action.data});
  case WINDOW_FRAME.UPDATE_CHANNEL_EDIT_TOPIC_SIZE:
    return Object.assign({}, state, {channelEditTopicSize: action.data.newSizeAndPosition});
  case WINDOW_FRAME.UPDATE_NO_DRAG_REGION:
    return updateNoDragRegion(state, action.data.region);
  case WINDOW_FRAME.SET_FULL_SCREEN:
    return {...state, isFullScreen: action.data};

  case MIGRATIONS.REDUX_STATE:
    return {
      ...state,
      windowSettings: action.data.app.windowSettings ?
        action.data.app.windowSettings : null
    };
  default:
    return state;
  }
}

function updateNoDragRegion(state, region) {
  return {
    ...state,
    noDragRegions: [
      ...state.noDragRegions.filter((r) => r.id !== region.id),
      region
    ]
  };
}
