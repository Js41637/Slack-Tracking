import {NOTIFICATIONS, APP} from '../actions';

// Here we store an array of all notifications as well as an event that
// includes the most recent. Why both? Because our cornucopia of notification
// implementations have different requirements. Native notifications (OS X,
// Windows 10) need only the most recent, and since we are unable to remove
// notifications after a timeout like we do with our HTML ones, if we try to
// use the array as the source of truth it quickly becomes bogus.
const initialState = {
  notifications: [],
  newNotification: {timestamp: 0, notification: {}}
};

export default function reduce(state = initialState, action) {
  switch (action.type) {
  case NOTIFICATIONS.NEW_NOTIFICATION:
    return newNotification(state, action.data);
  case NOTIFICATIONS.REMOVE_NOTIFICATION:
    return removeNotification(state, action.data);
  case NOTIFICATIONS.CLICK_NOTIFICATION:
    return removeNotification(state, action.data.notificationId);

  case APP.RESET_STORE:
    return Object.assign({}, initialState);
  default:
    return state;
  }
}

function newNotification(state, notification) {
  return {
    ...state,
    notifications: [...state.notifications, notification],
    newNotification: {
      timestamp: Date.now(),
      notification
    }
  };
}

function removeNotification(state, notificationId) {
  return {...state, notifications: state.notifications.filter((item) => item.id !== notificationId)};
}
