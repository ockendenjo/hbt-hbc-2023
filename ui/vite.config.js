export default {
  plugins: [
    {
      name: "watch-extra-files",
      configureServer(server) {
        // Watch specific files or directories
        server.watcher.add("2025.json"); // adjust the glob as needed
        server.watcher.on("change", (path) => {
          if (path.endsWith(".json")) {
            server.ws.send({ type: "full-reload" });
          }
        });
      },
    },
  ],
};
