module.exports = {
  apps : [{
    name: 'Express Server',
    script: 'express-server.js',

    // Options reference: https://pm2.io/doc/en/runtime/reference/ecosystem-file/
    node_args: '--inspect=7050',
    //instances: 'max',
    autorestart: true,
    watch: true,
    max_memory_restart: '500M',
	exp_backoff_restart_delay: 500,
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production'
    }
  }],

  deploy : {
    production : {
	  host: '167.99.195.184',
      ref  : 'origin/master',
      repo : 'https://github.com/Darren80/Chan_crypto.git',
      path : '/var/www/production',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production'
    }
  }
};
