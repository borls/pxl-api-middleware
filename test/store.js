import { compose, createStore, applyMiddleware } from 'redux';
import reduxThunk from 'redux-thunk';
import apiMiddleware from '../src/middleware';

export const middlewareConfig = {
    host: 'http://127.0.0.1',
    setHeader() {
        return {
            mycustomname: '1234.authCode'
        };
    },
    before(next) {
        return next({
            type: 'BEFORE'
        });
    },
    after(next) {
        return next({
            type: 'AFTER'
        });
    }
};

const createStoreWithMiddleware = compose(
    applyMiddleware(
        reduxThunk,
        apiMiddleware(middlewareConfig)
    )
)(createStore);

const initialState = {
    sending: false,
    first: 0,
    second: 0,
    completed: false,
    error: {
        errorCode: 0,
        errorMessage: ''
    },
    beforeFn: false,
    afterFn: false
};

export const store = createStoreWithMiddleware((state = initialState, action) => {
    switch (action.type) {
        case 'REQUEST':
            return Object.assign(state, {
                sending: true,
                completed: false
            });

        case 'SUCCESS':
            return Object.assign(state, {
                sending: false,
                first: state.first + action.result[0],
                second: state.second + action.result[1],
                completed: true
            });

        case 'FAILURE':
            return Object.assign(state, {
                sending: false,
                completed: false,
                error: {
                    errorCode: action.errorCode,
                    errorMessage: action.errorMessage
                }
            });

        case 'BEFORE':
            return Object.assign(state, {
                beforeFn: true
            });

        case 'AFTER':
            return Object.assign(state, {
                afterFn: true
            });

        case 'RESET_STORE':
            return Object.assign({}, initialState);
        default:
            return state;
    }
});
