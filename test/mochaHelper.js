/**
 * Зависимости модуля
 */
import chai, { expect } from 'chai';
import dirtyChai from 'dirty-chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';

chai.use(dirtyChai);
chai.use(sinonChai);

global.expect = expect;
global.sinon = sinon;
