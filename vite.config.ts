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

// vite.config.js
// import { defineConfig } from 'vite';
// import { resolve } from 'path';

// export default defineConfig({
//   server: {
//     port: 8080,
//     open: '/window/private.html', // auto-open this path in dev
//   },
//   build: {
//     rollupOptions: {
//       input: {
//         private: resolve(__dirname, 'window/private.html'),
//       },
//     },
//   },
// });

import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "dist",
    rollupOptions: {
      input: {
        main: "./index.html",
        // main: "./window/private.html",
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
