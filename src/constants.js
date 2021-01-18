// @ts-check

export const ERROR_MSGS = {
  key: 'key is invaild: key can not contain prefix',
  expireIn: 'expireIn is invaild: must like 30d/30h/30m/30s',
  promise: 'SyncFn MUST return a Promise!',
  syncMethod: 'This storageEngine does not support Sync methods!',
  storageEngine: 'There is NO valid storageEngine specified! ' +
    'Please use:\n' +
    '* wx/Taro (for Mini Program),\n' +
    '* localStorage (for Web),\n' +
    '* AsyncStorage (for React Native)\n' +
    'as the storageEngine',
  storageType: 'storageType must be WX/RN/WEB'
};

export const TIME_IN_MS = {
  'd' : 24 * 60 * 60 * 1000,
  'h' : 60 * 60 * 1000,
  'm' : 60 * 1000,
  's' : 1000
};

export const DELIMITER = '::';

export const STORAGE_TYPE = ['WEB', 'WX', 'RN'];
