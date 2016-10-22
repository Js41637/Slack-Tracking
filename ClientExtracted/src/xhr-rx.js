const rx = require('rx-dom');

module.exports =
class XmlHttpRequestRx {
  // Public: Creates a new instance of {XmlHttpRequestRx}, which wraps an
  // {XMLHttpRequest} in an {Observable}
  constructor() {
    this.request = new XMLHttpRequest();
    this.subj = new rx.Subject();

    let onError = () => this.subj.onError({reason: 'failed', status: this.request.status});
    let onAbort = () => this.subj.onError({reason: 'canceled'});

    // NB: Report percentage if we have a Content-Length, otherwise send -1,
    // which indicates indeterminate progress
    let onProgress = (e) => {
      if (e.lengthComputable) {
        this.subj.onNext({progress: e.loaded / e.total});
      } else {
        this.subj.onNext({progress: -1});
      }
    };

    let onLoad = () => {
      if (this.request.status !== 200) {
        onError();
      } else {
        this.subj.onNext({response: this.request.response});
        this.subj.onCompleted();
      }
    };

    // NB: `loadend` fires for all ending conditions (`load`, `error`, and
    // `abort`), so we can use it to clean up our listeners
    let onEnded = () => {
      this.request.removeEventListener('progress', onProgress);
      this.request.removeEventListener('load', onLoad);
      this.request.removeEventListener('error', onError);
      this.request.removeEventListener('abort', onAbort);
      this.request.removeEventListener('loadend', onEnded);
    };

    this.request.addEventListener('progress', onProgress);
    this.request.addEventListener('load', onLoad);
    this.request.addEventListener('error', onError);
    this.request.addEventListener('abort', onAbort);
    this.request.addEventListener('loadend', onEnded);
  }

  // Public: Initiates a GET request for the given URL, and translates that
  // request into an {Observable}
  //
  // url - The URL of the resource being retrieved
  // responseType - (Optional) How to receive the response, defaults to a
  //                           byte array
  //
  // Returns an {Observable} that will report progress until the resource is
  // loaded, at which point the response will be returned. If the request is
  // canceled or the resource is unavailable, `onError` will be thrown
  get(url, responseType='arraybuffer') {
    this.request.open('GET', url, true);
    this.request.responseType = responseType;
    this.request.send();

    return this.subj;
  }

  // Public: Aborts this request
  cancel() {
    this.request.abort();
  }

  // Public: Retrieves a named response header for the given URL.
  //
  // url - The URL of the resource
  // name - The name of the header to get
  //
  // Returns a {Promise} that will resolve with the response header if the
  // request was successful or reject with the status code on failure
  static getResponseHeader(url, name) {
    return new Promise((resolve, reject) => {
      let request = new XMLHttpRequest();
      request.open('HEAD', url);

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            let header = request.getResponseHeader(name);
            resolve(header);
          } else {
            reject(request.status);
          }
        }
      };

      request.send();
    });
  }
};
