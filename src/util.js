/**
 * Blow up string or symbol types into full-fledged type descriptors,
 *   and add defaults
 *
 * @function normalizeTypeDescriptors
 * @access private
 * @param {Array} types - The [CALL_API].types from a validated RSAA
 * @returns {Array}
 */
function normalizeTypeDescriptors(types) {
    let [requestType, successType, failureType] = types;

    if (typeof requestType === 'string' || typeof requestType === 'symbol') {
        requestType = { type: requestType };
    }

    if (typeof successType === 'string' || typeof successType === 'symbol') {
        successType = { type: successType };
    }

    if (typeof failureType === 'string' || typeof failureType === 'symbol') {
        failureType = { type: failureType };
    }

    return [requestType, successType, failureType];
}

export { normalizeTypeDescriptors };
