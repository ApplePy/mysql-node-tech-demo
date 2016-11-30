/**
 * Created by danazagar on 2016-11-21.
 */
var mysql = require('mysql');

/**
 * Set database.
 * @type {string}
 */
var PRODUCTION_DB = 'apollo'
    , TEST_DB = 'v2';

/**
 * Set database mode.
 * @type {string}
 */
exports.MODE_TEST = 'mode_test';
exports.MODE_PRODUCTION = 'mode_production';

/**
 * Represent state of database.
 * @type {{pool: null, mode: null}}
 */
var state = {
    pool: null,
    mode: null,
};

/**
 * Connect to database via createPool.
 * @param mode
 * @param done
 */
exports.connect = function(mode, done) {
    state.pool = mysql.createPool({
        host: 'puddleglum.murrayweb.ca',
        user: 'root',
        password: 'se3309a',
        database: mode === exports.MODE_PRODUCTION ? PRODUCTION_DB : TEST_DB
    });

    state.mode = mode;
    done();
}

/**
 * Convenience function to query.
 * @param query
 * @param cb
 */
exports.query = function(query, cb) {
    state.pool.query(query, cb);
};

/**
 * Convenience function to get pool.
 * @returns {null}
 */
exports.get = function() {
    return state.pool;
};