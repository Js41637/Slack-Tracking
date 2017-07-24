/**
 * Return actual data object attached in action, based on origin of action.
 * redux-electron-store dispatches action in updated/deleted field via IPC instead of as-is, need to pick it up
 * (https://github.com/samiskin/redux-electron-store#runtime). actual interop is occur in events-reducer's `reduceEpicEvent`
 * @param data {object} data object attached in action.
 */
export const pickActionData = <T = any>(data: any): T => {
  if (!!data) {
    const { updated, deleted } = data;
    if (updated && deleted) {
      const eventData = data.updated.events;
      return eventData ? eventData[eventData.eventId] : null;
    }
  }

  return data;
};
