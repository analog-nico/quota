'use strict';

module.exports = (function() {
    function unimplemented() {
        throw new Error('unimplemented');
    }

    return {
        unimplemented
    };
})();