/**
 * Unit-тестирование модуля validation
 */

import CALL_API from '../../src/determinant';

import { forCurrentMiddleware, isValidTypeDescriptor, validateRSAA } from '../../src/validation';

const types = ['REQUEST', 'SUCCESS', 'FAILURE'];

describe('Validation: ', () => {
    describe('forCurrentMiddleware', () => {
        it('true если, первый параметр (action) plain-объект и имеет специальный символ [CALL_APP]', () => {
            const action = {
                [CALL_API]: {}
            };
            expect(forCurrentMiddleware(action)).to.be.true();
        });
    });

    describe('isValidTypeDescriptor: ', () => {
        it('Возвращает false, если первый параметр не plain-объект', () => {
            expect(isValidTypeDescriptor('str')).to.be.false();
        });

        it('Вовращает false, если в переданном объекте есть ' +
            'другие поля кроме: \'type\', \'payload\', \'meta\'', () => {
            const obj = {
                someFailedField: 'str'
            };
            expect(isValidTypeDescriptor(obj)).to.be.false();
        });

        it('Возвращает false, если нет ноды \'type\' в первом параметре', () => {
            const obj = {
                payload: '',
                meta: ''
            };
            expect(isValidTypeDescriptor(obj)).to.be.false();
        });

        it('Возвращает false, если нода \'type\' не строка и не символ в первом параметре', () => {
            const obj = {
                type: {},
                payload: '',
                meta: ''
            };
            expect(isValidTypeDescriptor(obj)).to.be.false();
        });
    });

    describe('validateRSAA: ', () => {
        it('endpoint должна быть строкой в ноде [CALL_API]', () => {
            const action = {
                [CALL_API]: {
                    endpoint: {},
                    method: 'GET',
                    types
                }
            };
            expect(validateRSAA(action).length === 1).to.be.true();
        });

        it('[CALL_API].endpoint должна быть определена и может быть строкой', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].endpoint должна быть определена и может быть функцией', () => {
            const action = {
                [CALL_API]: {
                    endpoint: () => {},
                    method: 'GET',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].method должен являться строкой', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].method может строго принимать значения ' +
            '\'GET\', \'HEAD\', \'POST\', \'PUT\', \'PATCH\', \'DELETE\', \'OPTIONS\'', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'FAKE',
                    types
                }
            };
            expect(validateRSAA(action).length === 1).to.be.true();
        });

        it('[CALL_API].headers может являться объектом', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    headers: {},
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].headers может являться функцией', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    headers: () => {},
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].credentials должна быть строкой', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    credentials: 'omit',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].credentials может строго принимать значения \'omit\', \'same-origin\', \'include\'', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    credentials: 'fakeValue',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.false();
        });

        it('[CALL_API].bailout может являться булевым значением', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    bailout: true,
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].bailout может являться функцией', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    bailout: () => {},
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].params может являться объектом', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    params: { par1: 'str', par2: 'str' },
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].params может являться функцией', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    params: () => {},
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].types должна быть определена', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    params: { par1: 'str', par2: 'str' }
                }
            };
            expect(validateRSAA(action).length === 0).to.be.false();
        });

        it('[CALL_API].types должна быть массивом', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    types
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });

        it('[CALL_API].types должна быть массивом из 3-х элементов', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    types: ['', '', '', '']
                }
            };
            expect(validateRSAA(action).length === 0).to.be.false();
        });

        it('[CALL_API].types должна содержать только строки или символы', () => {
            const action = {
                [CALL_API]: {
                    endpoint: '',
                    method: 'GET',
                    types: ['REQUEST', Symbol('name'), 'FAILURE']
                }
            };
            expect(validateRSAA(action).length === 0).to.be.true();
        });
    });
});
