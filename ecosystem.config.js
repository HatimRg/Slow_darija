module.exports = {
  apps: [
    {
      name: 'slow-darija',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      cwd: 'C:/Users/RAGHIB/Desktop/Slow_Darija',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      watch: false,
      restart_delay: 2000,
      max_restarts: 20,
    },
  ],
};