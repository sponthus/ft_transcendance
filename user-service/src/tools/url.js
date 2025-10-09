import env from '../../config/env.js';

let prefix = 'http';
if (env.nodeEnv === 'production') {
	prefix = 'https';
}

export default prefix;