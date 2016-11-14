import traverse from 'traverse';
import safeRequire from '../utils/safe-require';

const keytar = safeRequire('keytar', `Check to make sure that all native keytar dependencies are installed properly (especially libgnome-keyring on Linux)`);

const SERVICE_PREFIX = 'com.slack';

/**
 * This class abstracts save / load interactions with the OS Keychain, so we can
 * add new credentials to the Keychain declaratively.
 */
class KeychainStorage {
  /**
   * Constructs an instance of KeychainStorage.
   * @param  {LocalStorage} [localStorage={}] - An instance of LocalStorage to
   * use for getting / setting extra state (account names) we have to store due
   * to keytar / keychain API limitations.
   * @param {string} [servicePrefix=null] - A string to use as the prefix for
   * service names.
   */
  constructor(localStorage={}, servicePrefix=null) {
    this.localStorage = localStorage;
    this.servicePrefix = servicePrefix || SERVICE_PREFIX;
  }

  /**
   * Saves credentials to the keychain for every set of credentials in the data
   * to be saved. Also saves account information for every set of credentials
   * in localStorage.
   * @param {Object} dataToSave - A piece of Redux state, containing credential
   * objects as leaf nodes. Credential objects should have the shape:
   * {
   *   [account|username]: 'accountName',
   *   password: 'password'
   * }
   */
  save(dataToSave) {
    let services = this.convertToServices(dataToSave);
    let sanitizedDataToSave = this.sanitize(services);

    if (sanitizedDataToSave && sanitizedDataToSave.length) {
      this.localStorage.setItemSync('keychain', JSON.stringify(sanitizedDataToSave));
    }

    for (let service of services) {
      if (service.account && service.password) {
        keytar.replacePassword(service.serviceName, service.account, service.password);
      }
    }
    return services;
  }

  saveSync(dataToSave) {
    let services = this.convertToServices(dataToSave);
    let sanitizedDataToSave = this.sanitize(services);

    if (sanitizedDataToSave && sanitizedDataToSave.length) {
      this.localStorage.setItemSync('keychain', sanitizedDataToSave);
    }

    for (let service of services) {
      keytar.replacePassword(service.serviceName, service.account, service.password);
    }

    return services;
  }

  /**
   * Converts a piece of Redux state into an array of Service objects,
   * containing only exactly what is needed to save to the Keychain.
   * @param {Object} dataToConvert - A piece of Redux state, containing credential
   * objects as leaf nodes.
   * @param {Object} [options] - Options for configuring
   * the conversion.
   * @param {boolean} [options.normalize=true] - Whether or not to normalize
   * common synonyms of of credential keys (ie. username for account).
   *
   * @return {Object[]} - An {Array} of Service objects.
   * @property {string} serviceName - The name of the service, corresponding to
   * 'com.slack.{path.to.credentials.in.dataToConvert}'
   * @property {string} account - The username with which to associate the password.
   * @property {string} password - The password.
   * @property {Object} map - A map of the credentials' original property names.
   */
  convertToServices(dataToConvert, options={normalize: true}) {
    let services = [];
    let filteredServices = [];
    // :'( Unfortunate, but necessary – if you save copies of functions from
    // this, and those functions also reference this, that reference will be undefined.
    let _this = this;

    traverse(dataToConvert).forEach(function() {
      if (this.isLeaf && this.node) {
        let parentNode = options.normalize ? _this.normalizeCredentials(this.parent.node) : this.parent.node;

        services.push({
          serviceName: `${_this.servicePrefix}.${this.parent.path.join('.')}`,
          ...parentNode
        });
      }
    });
  
    // Filter out duplicates and services with any falsy properties
    services.forEach((service) => {
      let seen = filteredServices.find((filteredService) => filteredService.serviceName === service.serviceName);
      let noFalsyProps = Object.keys(service).every((key) => !!service[key]);

      if (!seen && noFalsyProps) filteredServices.push(service);
    });

    return filteredServices;
  }

  /**
   * Converts an Array of Service objects into a piece of Redux state,
   * based on their Service names.
   * @param {Object[]} services - An array of Service objects.
   * @return {Object} - A piece of Redux state.
   */
  convertFromServices(services) {
    let keychainState = {};

    services.forEach((service) => {
      let path = service.serviceName.replace(`${this.servicePrefix}.`, '').split('.');
      traverse(keychainState).set(path, {
        [service.map.account]: service.account,
        [service.map.password]: service.password
      });
    });

    return keychainState;
  }

  /**
   * Loads all passwords from the Keychain based on account data stored in
   * Local Storage.
   * @return {Object} - A piece of Redux state.
   */
  load() {
    let services = JSON.parse(this.localStorage.getItem('keychain'));

    for (let service of services) {
      if (service.account) {
        service.password = keytar.getPassword(service.serviceName, service.account);
      }
    }

    return this.convertFromServices(services);
  }

  /**
   * Takes a Credentials object and maps its original properties (e.g. username,
   * passphrase) to normalized equivalents (account, password). This allows us
   * to use slightly different property names in our Redux state if need be.
   * @param {Object} - A Credentials object.
   * @return {Object} - A normalized Credentials Object.
   */
  normalizeCredentials(credentials) {
    let matchedCredentialAliases = this.matchCredentialAliases(credentials);

    return Object.assign({}, credentials, {
      account: credentials[matchedCredentialAliases.account],
      password: credentials[matchedCredentialAliases.password],
      map: matchedCredentialAliases
    });
  }

  /**
   * Takes a Credentials object and returns a map of property aliases. for
   * example, if a Credentials object were {username: 'user', passphrase: 'pass'},
   * this would return {account: 'username', password: 'passphrase'}, where
   * each value is an alias for `account` and `property` respectively.
   * @param {Object} - A Credentials object.
   * @return {Object} - A map of the original Credential object's property
   * aliases.
   */
  matchCredentialAliases(credentials) {
    let accountAliases = ['username', 'account'];
    let passwordAliases = ['passphrase', 'password'];
    let aliasMaps = {};

    for (let alias of accountAliases) {
      if (credentials.hasOwnProperty(alias)) {
        aliasMaps.account = alias;
      }
    }

    for (let alias of passwordAliases) {
      if (credentials.hasOwnProperty(alias)) {
        aliasMaps.password = alias;
      }
    }

    return aliasMaps;
  }

  /**
   * Takes an Array of Service objects and returns a new Array of all passwords
   * removed. This is so we don't accidentally save private information in
   * Local Storage.
   * @param {Object[]} - An Array of Service objects.
   * @return {Object[]} - A sanitized Array of Service objects.
   */
  sanitize(services) {
    return services.map((service) => {
      let serviceToSanitize = {...service};
      delete serviceToSanitize.password;
      return serviceToSanitize;
    });
  }

  isPassword(str) {
    return str === 'password';
  }
}

export default KeychainStorage;
