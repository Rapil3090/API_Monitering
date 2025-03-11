module.exports = {
  apps: [
    {
      name: 'api-monitoring-3000',
      script: 'dist/main.js',
      instances: 1,
      env: {
        PORT: 3000
      },
      watch: false,
      ignore_watch: ["logger", "node_modules"]
    },
    {
      name: 'api-monitoring-20000',
      script: 'dist/main.js',
      instances: 1,
      env: {
        PORT: 20000
      },
      watch: false,
      ignore_watch: ["logger", "node_modules"]
    },
    {
      name: 'api-monitoring-20001',
      script: 'dist/main.js',
      instances: 1,
      env: {
        PORT: 20001
      },
      watch: false,
      ignore_watch: ["logger", "node_modules"]
    }
  ],

  deploy : {
    production : {
      user : 'SSH_USERNAME',
      host : 'SSH_HOSTMACHINE',
      ref  : 'origin/master',
      repo : 'GIT_REPOSITORY',
      path : 'DESTINATION_PATH',
      'pre-deploy-local': '',
      'post-deploy' : 'npm install && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
};
