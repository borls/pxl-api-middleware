/**
 * Unit-тестирование модуля apiMiddleware
 */

import { store, middlewareConfig } from '../store';
import CALL_API from '../../src/determinant';
import nock from 'nock';
import request from 'superagent-bluebird-promise';

const types = ['REQUEST', 'SUCCESS', 'FAILURE'],
    host = middlewareConfig.host,
    path = '/api/users/1',
    endpoint = host + path,
    { dispatch, getState } = store;

describe('Middleware::API: ', () => {
    describe('отработа экшенов при запросах на сервер и получение данных', () => {
        beforeEach(() => {
            dispatch({
                type: 'RESET_STORE'
            });

            nock(host)
                .get(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });
        });


        it('ожидаем store.completed === true при указании относительного пути', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().completed).to.be.true();
                done();
            });
        });

        it('store.sending === true при начале получения данных', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then(() => {
                done();
            });

            expect(getState().sending).to.be.true();
        });

        it('store.sending === false, когда запрос закончен', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().sending).to.be.false();
                done();
            });
        });

        it('store.completed === false при начале получения данных', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then(() => {
                done();
            });

            expect(getState().completed).to.be.false();
        });

        it('store.completed === true при успешном получении даных', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().completed).to.be.true();
                done();
            });
        });

        it('store.completed === false при потери соединения или какой-либо сетевой ошибке', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'POST',
                    types
                }
            }).then(() => {
                expect(getState().completed).to.be.false();
                done();
            });
        });

        it('store.first === 10 && store.second === 20, при успешном получении данных и ' +
            'отработки экшена по стору', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().first === 10 && getState().second === 20).to.be.true();
                done();
            });
        });

        it('экшен имеет поля .errorCode, .errorMessage, .result, при успешном получении данных', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then((res) => {
                expect(typeof res.errorCode === 'number' &&
                    typeof res.errorMessage === 'string' &&
                    Array.isArray(res.result) === true).to.be.true();
                done();
            });
        });
    });

    describe('проверка получения ответов разными методами', () => {
        beforeEach(() => {
            dispatch({
                type: 'RESET_STORE'
            });
        });

        it('GET запрос отрабатывает', (done) => {
            nock(host)
                .get(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });

            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'GET',
                    types
                }
            }).then((res) => {
                expect(getState().completed && res.type === 'SUCCESS').to.be.true();
                done();
            });
        });

        it('POST запрос отрабатывает', (done) => {
            nock(host)
                .post(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });

            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'POST',
                    types
                }
            }).then((res) => {
                expect(getState().completed && res.type === 'SUCCESS').to.be.true();
                done();
            });
        });

        it('DELETE запрос отрабатывает', (done) => {
            nock(host)
                .delete(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });

            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'DELETE',
                    types
                }
            }).then((res) => {
                expect(getState().completed && res.type === 'SUCCESS').to.be.true();
                done();
            });
        });

        it('PUT запрос отрабатывает', (done) => {
            nock(host)
                .put(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });

            dispatch({
                [CALL_API]: {
                    endpoint,
                    method: 'PUT',
                    types
                }
            }).then((res) => {
                expect(getState().completed && res.type === 'SUCCESS').to.be.true();
                done();
            });
        });
    });

    describe('before и after методы из конгифа мидделвейра:', () => {
        beforeEach(() => {
            dispatch({
                type: 'RESET_STORE'
            });

            sinon.spy(middlewareConfig, 'before');
            sinon.spy(middlewareConfig, 'after');

            nock(host)
                .get(path)
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });
        });

        afterEach(() => {
            middlewareConfig.before.restore();
            middlewareConfig.after.restore();
        });

        it('метод before() должен менять стор store.beforeFn === true', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().beforeFn).to.be.true();
                done();
            });
        });

        it('метод before() должен быть вызван один раз', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(middlewareConfig.before.calledOnce).to.be.true();
                done();
            });
        });

        it('метод before() должен быть вызван c 3-я аргументами', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(middlewareConfig.before.firstCall.args.length === 3).to.be.true();
                done();
            });
        });


        it('метод after() должен менять стор store.afterFn === true', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(getState().afterFn).to.be.true();
                done();
            });
        });

        it('метод after() должен быть вызван один раз', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(middlewareConfig.after.calledOnce).to.be.true();
                done();
            });
        });

        it('метод after() должен быть вызван c 4-я аргументами', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then(() => {
                expect(middlewareConfig.after.firstCall.args.length === 4).to.be.true();
                done();
            });
        });

        it('метод after() должен вернуть результат запроса на сервер 4-ым параметром', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            }).then((res) => {
                const afterArg4 = Object.assign({}, { type: 'SUCCESS' }, middlewareConfig.after.firstCall.args[3]);
                expect(afterArg4).to.deep.equal(res);
                done();
            });
        });
    });

    describe('enchantRequest: ', () => {
        beforeEach(() => {
            dispatch({
                type: 'RESET_STORE'
            });
            nock(host)
                .get('/api/users/1')
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });
        });

        it('ожидаем store.completed === true при переопределении request запроса', (done) => {
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/666',
                    method: 'GET',
                    types,
                    enchantRequest: () => {
                        return request('GET', 'http://127.0.0.1/api/users/1');
                    }
                }
            }).then(() => {
                expect(getState().completed).to.be.true();
                done();
            });
        });

        it('ожидаем store.completed === true при изменении request запроса', (done) => {
            nock(host)
                .get('/api/users/2' + '?param=Manny')
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });
            dispatch({
                [CALL_API]: {
                    endpoint: '/api/users/2',
                    method: 'GET',
                    types,
                    enchantRequest: ({ currentRequest }) => {
                        return currentRequest.query({ param: 'Manny' });
                    }
                }
            }).then(() => {
                expect(getState().completed).to.be.true();
                done();
            });
        });
    });

    describe('ответ миддервейра: ', () => {
        beforeEach(() => {
            dispatch({
                type: 'RESET_STORE'
            });
            nock(host)
                .get('/api/users/1')
                .reply(200, {
                    errorCode: 0,
                    errorMessage: '',
                    result: [10, 20]
                });
        });

        it('всегда возвращает промис', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            };
            expect(dispatch(action).then).to.be.a('function');
        });

        it('Экшен должен сожержать ответ от сервера в поле .response', (done) => {
            const action = {
                [CALL_API]: {
                    endpoint: '/api/users/1',
                    method: 'GET',
                    types
                }
            };

            dispatch(action).then((res) => {
                expect(res.response).to.be.a('object');
                done();
            });
        });

        it('В запросе должен быть установлен header авторизации', (done) => {
            const action = {
                [CALL_API]: {
                    endpoint: '/api/users/2',
                    method: 'GET',
                    types
                }
            };

            const reqHeader = middlewareConfig.setHeader();

            nock(host, {
                reqheaders: {
                    mycustomname: reqHeader.mycustomname
                }
            }).get('/api/users/2').reply(200);

            dispatch(action).then((res) => {
                expect(res.response.request.header).to.have.property(
                    'mycustomname',
                    reqHeader.mycustomname
                );
                done();
            });
        });

    });


});
