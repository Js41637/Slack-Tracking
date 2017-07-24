/**
 * @module Reducers
 */ /** for typedoc */

import * as assert from 'assert';
import { flatMap, omit } from 'lodash';
import { Store } from 'redux';
import { createAction, createReducer } from 'redux-act';
import { REHYDRATE } from 'redux-persist/constants';
import { RootState } from '../reducers';
import { StringMap } from '../utils/shared-constants';

export const startDownload = createAction<DownloadInfo, void>('Start a download');
export const updateDownload = createAction<UpdateDownloadPayload, void>('Update an existing download');
export const removeDownload = createAction<DownloadKey, void>('Remove a single download');
export const removeDownloads = createAction<Array<string>, void>('Remove multiple downloads');

const legacyEventKeys = [
  'startDownload',
  'cancelDownload',
  'clearDownloads',
  'retryDownload',
  'revealDownload',
  'downloadStarted',
  'downloadFinished'
];

/**
 * We need both a file ID and the team ID to retrieve a download.
 */
export interface DownloadKey {
  id: string;
  teamId: string;
}

/**
 * A download is composed of the two IDs, its URL, and some optional state.
 */
export type DownloadInfo = DownloadKey & OptionalDownloadProps & { url: string };
export type UpdateDownloadPayload = DownloadKey & { newProps: OptionalDownloadProps };

export interface OptionalDownloadProps {
  startTime?: number;
  endTime?: number;
  downloadState?: 'not_started' | 'progressing' | 'completed' | 'cancelled' | 'interrupted';
  downloadPath?: string;
  progress?: number;
  isPaused?: boolean;
  highlight?: boolean;
  requestState?: 'cancel' | 'pause' | 'resume';
}

/**
 * Downloads are a map of team IDs to secondary maps, which map file IDs to
 * download objects.
 */
export type DownloadsList = StringMap<DownloadInfo>;
export type DownloadsState = StringMap<DownloadsList>;

const reduce = createReducer<DownloadsState>({
  [startDownload as any]: (state, download: DownloadInfo) => {
    assert(download && download.id && download.teamId && download.url);
    return {
      ...state,
      [download.teamId]: {
        ...state[download.teamId],
        [download.id]: {
          ...download,
          downloadState: 'not_started',
          startTime: Date.now()
        }
      }
    };
  },

  [updateDownload as any]: (state, { id, teamId, ...newProps }: UpdateDownloadPayload) => {
    assert(id && teamId && newProps);
    if (!state[teamId] || !state[teamId][id]) return state;
    return {
      ...state,
      [teamId]: {
        ...state[teamId],
        [id]: {
          ...state[teamId][id],
          ...newProps
        }
      }
    };
  },

  [removeDownload as any]: (state, { id, teamId }: DownloadKey) => {
    assert(id && teamId);
    return {
      ...state,
      [teamId]: omit<StringMap<DownloadInfo>, StringMap<DownloadInfo>>(state[teamId], id)
    };
  },

  [removeDownloads as any]: (state, ids: Array<string>) => {
    assert(ids);
    return Object.keys(state).reduce<DownloadsState>((newState, teamId) => {
      newState[teamId] = omit<StringMap<DownloadInfo>, StringMap<DownloadInfo>>(state[teamId], ids);
      return newState;
    }, {});
  },

  /**
   * It shouldn't be possible, but if folks somehow get themselves wedged with
   * state from the previous downloads reducer (that was event-based), clear it
   * out on rehydrate.
   *
   * TODO: Remove this when 99% users are >= version 2.7.0.
   */
  [REHYDRATE]: (state, payload: RootState) => {
    if (payload.downloads) {
      return {
        ...state,
        ...omit(payload.downloads, legacyEventKeys)
      };
    } else {
      return state;
    }
  },
}, {});

export { reduce };

export function getDownloads(store: Store<RootState>) {
  return store.getState().downloads;
}

export function getDownloadsForTeam(store: Store<RootState>, teamId: string) {
  return getDownloads(store)[teamId] || {};
}

export function getDownloadById(store: Store<RootState>, { id, teamId }: DownloadKey) {
  return getDownloadsForTeam(store, teamId)[id];
}

/**
 * Downloads are stored per team & by file ID, so we use this helper to flatten
 * them out into one array.
 */
export function getAllDownloads(store: Store<RootState>): Array<DownloadInfo> {
  return flatMap<DownloadInfo>(getDownloads(store), (downloadsPerTeam: DownloadsList) => {
    return flatMap<DownloadInfo>(downloadsPerTeam);
  });
}

/**
 * Returns the maximum download progress.
 */
export function getMaxDownloadProgress(allDownloads: Array<DownloadInfo>) {
  const progressValues = allDownloads.filter(({ downloadState }) => {
    return downloadState === 'progressing';
  }).map(({ progress }) => progress!);

  return Math.max(...progressValues);
}

/**
 * We only want to clear finished downloads (where finished could be cancelled,
 * interrupted, or completed).
 */
export function getDownloadsToClear(store: Store<RootState>, teamId: string) {
  return getAllDownloads(store).filter((download) => {
    return download.teamId === teamId &&
      !!download.downloadState &&
      download.downloadState !== 'progressing';
  });
}
