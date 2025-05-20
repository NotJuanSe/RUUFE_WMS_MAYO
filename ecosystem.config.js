module.exports = {
  apps: [{
    name: "wms-mayoristas",
    script: "node_modules/next/dist/bin/next",
    args: "start -p 4000 -H 0.0.0.0",
    cwd: "./",
    watch: false,
    env: {
      NODE_ENV: "production",
    }
  }]
}