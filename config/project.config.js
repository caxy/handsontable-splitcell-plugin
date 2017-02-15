const path = require('path');

const config = {
    path_base: path.resolve(__dirname, '..'),
    dir_client: 'src',
    dir_dist: 'dist'
};

// ------------------------------------
// Utilities
// ------------------------------------
function base () {
    const args = [config.path_base].concat([].slice.call(arguments));
    return path.resolve.apply(path, args)
}

config.paths = {
    base   : base,
    client : base.bind(null, config.dir_client),
    dist   : base.bind(null, config.dir_dist)
};

module.exports = config;
