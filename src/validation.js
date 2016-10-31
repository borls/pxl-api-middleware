import _isPlainObject from 'lodash.isplainobject';
import CALL_API from './determinant';

/**
 * Функция проверяет на принадлежность к redux action данному middleware
 *
 * @param action
 * @returns {boolean}
 */
function forCurrentMiddleware(action) {
  return _isPlainObject(action) && action.hasOwnProperty(CALL_API);
}

/**
 * Is the given object a valid type descriptor?
 *
 * @function isValidTypeDescriptor
 * @access private
 * @param {object} obj - The object to check agains the type descriptor definition
 * @returns {boolean}
 */
function isValidTypeDescriptor(obj) {
  const validKeys = [
    'type',
    'payload',
    'meta'
  ];

  if (!_isPlainObject(obj)) return false;

  for (let key in obj) {
    if (!~validKeys.indexOf(key)) return false;
  }
  return ('type' in obj) && (typeof obj.type === 'string' || typeof obj.type === 'symbol')
}

/**
 * Checks an action against the RSAA definition, returning a (possibly empty)
 * array of validation errors.
 *
 * @function validateRSAA
 * @access public
 * @param {object} action - The action to check against the RSAA definition
 * @returns {Array}
 */
function validateRSAA(action) {
  /**
   * Накапливает ошибки валидации
   *
   * @type {Array}
   */
  const validationErrors = [];

  /**
   * Все допустимые поля, которые могут быть в объекте [CALL_API]
   *
   * @type {Array.<string>}
   */
  const validCallAPIKeys = [
    'endpoint',
    'method',
    'body',
    'headers',
    'credentials',
    'enchantRequest',
    'bailout',
    'types',
    'options',
    'params'
  ];

  /**
   * Допустимые методы http-запросов
   *
   * @type {Array.<string>}
   */
  const validMethods = [
    'GET',
    'HEAD',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS'
  ];

  /**
   * Определяет отправку кук на сервер
   *
   * @type {Array.<string>}
   */
  const validCredentials = [
    'omit',
    'same-origin',
    'include'
  ];

  const callAPI = action[ CALL_API ];

  if (!_isPlainObject(callAPI)) {
    validationErrors.push('[CALL_API] property must be a plain JavaScript object');
  }
  for (let key in callAPI) {
    if (!~validCallAPIKeys.indexOf(key)) {
      validationErrors.push(`Invalid [CALL_API] key: ${key}`);
    }
  }

  const { endpoint, method, headers, credentials, types, bailout, params, enchantRequest } = callAPI;
  if (typeof endpoint === 'undefined') {
    validationErrors.push('[CALL_API] must have an endpoint property');
  } else if (typeof endpoint !== 'string' && typeof endpoint !== 'function') {
    validationErrors.push('[CALL_API].endpoint property must be a string or a function');
  }
  if (typeof method === 'undefined') {
    validationErrors.push('[CALL_API] must have a method property');
  } else if (typeof method !== 'string') {
    validationErrors.push('[CALL_API].method property must be a string');
  } else if (!~validMethods.indexOf(method.toUpperCase())) {
    validationErrors.push(`Invalid [CALL_API].method: ${method.toUpperCase()}`);
  }

  if (typeof headers !== 'undefined' && !_isPlainObject(headers) && typeof headers !== 'function') {
    validationErrors.push('[CALL_API].headers property must be undefined, a plain JavaScript object, or a function');
  }
  if (typeof credentials !== 'undefined') {
    if (typeof credentials !== 'string') {
      validationErrors.push('[CALL_API].credentials property must be undefined, or a string');
    } else if (!~validCredentials.indexOf(credentials)) {
      validationErrors.push(`Invalid [CALL_API].credentials: ${credentials}`);
    }
  }
  if (typeof bailout !== 'undefined' && typeof bailout !== 'boolean' && typeof bailout !== 'function') {
    validationErrors.push('[CALL_API].bailout property must be undefined, a boolean, or a function');
  }

  if (typeof enchantRequest !== 'undefined' && typeof enchantRequest !== 'function') {
    validationErrors.push('[CALL_API].enchantRequest property must be undefined or a function');
  }

  if (typeof params !== 'undefined' && !_isPlainObject(params) && typeof params !== 'function') {
    validationErrors.push('[CALL_API].params property must be undefined, a plain JavaScript object, or a function');
  }
  if (typeof types === 'undefined') {
    validationErrors.push('[CALL_API] must have a types property');
  } else if (!Array.isArray(types) || types.length !== 3) {
    validationErrors.push('[CALL_API].types property must be an array of length 3');
  } else {
    const [requestType, successType, failureType] = types;
    if (typeof requestType !== 'string' && typeof requestType !== 'symbol' && !isValidTypeDescriptor(requestType)) {
      validationErrors.push('Invalid request type');
    }
    if (typeof successType !== 'string' && typeof successType !== 'symbol' && !isValidTypeDescriptor(successType)) {
      validationErrors.push('Invalid success type');
    }
    if (typeof failureType !== 'string' && typeof failureType !== 'symbol' && !isValidTypeDescriptor(failureType)) {
      validationErrors.push('Invalid failure type');
    }
  }

  return validationErrors;
}

export { forCurrentMiddleware, isValidTypeDescriptor, validateRSAA };
