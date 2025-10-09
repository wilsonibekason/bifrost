// import { defineConfig } from "vite";

// export default defineConfig({
//   build: {
//     outDir: "dist",
//     rollupOptions: {
//       input: {
//         main: "./index.html",
//       },
//     },
//   },
//   server: {
//     port: 8080,
//   },
// });

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
      },
    },
  },
  server: {
    port: 8080,
  },
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
});
