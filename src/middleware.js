/**
 * Миделвейр для Redux, позваляющий получать данные из удалённый источников и
 * диспатчить нужные события с этими данными
 *
 * @module middleware
 * @type {Function}
 */

import { forCurrentMiddleware, validateRSAA } from './validation';
import { InvalidRSAA, RequestError, ApiError } from './errors' ;
import { normalizeTypeDescriptors } from './util';
import DETERMINANT from './determinant';
import request from 'superagent-bluebird-promise';
import BPromise from 'bluebird';

/**
 * Redux middleware module config
 *
 * @param {{}} configMiddleware - объект конфига миделвейра
 * @returns {Function} - функция содержащая миделвейр
 * @access public
 */
export default apiMiddlewareConfig = (configMiddleware = {}) => store => next => action => {
  /**
   * Пропускаем дальше экшен если в нём нет специального детерминанта
   */
  if (!forCurrentMiddleware(action)) {
    return BPromise.resolve(next(action));
  }

  /**
   * Валидирует данные из action, если имеются ошибки отрабатываем действие с ошибкой
   *
   * @type {Array}
   */
  const validationErrors = validateRSAA(action);
  const callAPI = action[ DETERMINANT ];

  if (validationErrors.length) {
    if (callAPI.types && Array.isArray(callAPI.types)) {
      const type = callAPI.types[0] && callAPI.types[0].type || callAPI.types[0];
      next({
        type,
        payload: new InvalidRSAA(validationErrors),
        error: true
      });
    }
    return Promise.resolve();
  }

  /**
   * Получаем отдельные переменные из RSAA экшена
   */
  let { endpoint, headers = {} } = callAPI;
  const { method, body, credentials, bailout, types, params = {}, enchantRequest } = callAPI;
  let [requestType, successType, failureType] = normalizeTypeDescriptors(types);

  /**
   * Если есть специальное поле bailout и оно равняется true, прерываем все наши действия
   */
  try {
    if (bailout === true || typeof bailout === 'function' && bailout(store.getState())) {
      return Promise.resolve();
    }
  } catch (e) {
    return Promise.resolve(next(Object.assign({}, requestType, {
      payload: new RequestError('[CALL_API].bailout function failed'),
      error: true
    })));
  }

  /**
   * Если .endpoint функция, то отработаем её и вернём результат отбратно в переменную .endpoint
   */
  if (typeof endpoint === 'function') {
    try {
      endpoint = endpoint(store.getState());
    } catch (e) {
      return Promise.resolve(next(Object.assign({}, requestType, {
        payload: new RequestError('[CALL_API].endpoint function failed'),
        error: true
      })));
    }

    /**
     * Если в endpoint не встречается 'http://domain.name', 'https://domain.name', '//domain.name', то
     * считаем что мы идём на хост из конфига миделвейра
     */
  } else if (typeof endpoint === 'string' && /^(https?:\/\/|\/\/).+\..+$/.test(endpoint) === false) {
    const host = configMiddleware.host;
    if (typeof host === 'string' && host !== '') {
      endpoint = (host[ host.length - 1 ] === '/' ? host.slice(0, -1) : host) +
        '/' + (endpoint[ 0 ] === '/' ? endpoint.slice(1) : endpoint);
    }
  }

  /**
   * Если .headers функция, то отработаем её и вернём результат отбратно в переменную .headers
   */
  if (typeof headers === 'function') {
    try {
      headers = headers(store);
    } catch (e) {
      return BPromise.resolve(next(Object.assign({}, requestType, {
        payload: new RequestError('[CALL_API].headers function failed'),
        error: true
      })));
    }
  }

  /**
   * Отрабатываем метод .before из конфига миделвейра
   */
  if (typeof configMiddleware.before === 'function') {
    configMiddleware.before.apply(null, [ next, store, action ]);
  }

  /**
   * Отрабатываем экшен { type: 'REQUEST' }
   */
  next(Object.assign({}, requestType, { params }));


  let requestPromise = request(method, endpoint);

  /**
   * Устанавливаем заголовки в запрос из конфига мидделвейра
   */
  if (typeof configMiddleware.setHeader === 'function') {
    requestPromise.set(configMiddleware.setHeader());
  }

  requestPromise = requestPromise.set(headers);

  const methodLowCase = method.toLowerCase();
  requestPromise = (methodLowCase === 'post' || methodLowCase === 'put') ?
    requestPromise.send(body) : requestPromise.query(body);

  if (credentials) {
    requestPromise.withCredentials();
  }

  /**
   * Если нужно как-то перенастроить запрос до отправки на сервер, вызываем функцию [CALL_API].enchantRequest
   */
  if (typeof enchantRequest === 'function') {
    const enchantedRequest = enchantRequest.call(null, {
      currentRequest: requestPromise,
      next,
      store,
      action,
      callAPI
    });

    if (enchantedRequest && enchantedRequest instanceof request.Request) {
      requestPromise = enchantedRequest;
    }
  }

  let requestResult = null;
  return requestPromise.then((response) => {
    const { errorCode = response.statusCode, errorMessage = response.status, result = [] } = response.body;

    requestResult = {
      response,
      result,
      params,
      errorCode,
      errorMessage
    };

    return next(Object.assign({},
      (response.ok === true && errorCode === 0) ? successType : failureType,
      requestResult,
      response.ok !== true ? {
        payload: new ApiError(response.status, response.statusCode, response.body),
        error: true
      } : {}
    ));
  }).catch((err) => {
    return next(Object.assign({},
      failureType,
      {
        payload: new RequestError(err.message),
        error: true
      }
    ));
  }).finally(() => {
    if (typeof configMiddleware.after === 'function') {
      configMiddleware.after.apply(null, [ next, store, action, requestResult ]);
    }
  });
};
