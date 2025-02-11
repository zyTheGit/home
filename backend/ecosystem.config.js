module.exports = {
    apps: [
      {
        name: "backend",
        script: "dist/main.js",
        env: {
          NODE_ENV: "production",
          PORT: 3000,
        },
        env_file: ".env.production"
      },
    ],
  };