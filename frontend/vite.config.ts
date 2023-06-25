import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteTsconfigPaths from "vite-tsconfig-paths";
import svgrPlugin from "vite-plugin-svgr";
import vitePluginRequire from "vite-plugin-require";
import vitePluginCheck from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
    server: {
        host: "0.0.0.0",
        port: 3000,
    },
    plugins: [react(), viteTsconfigPaths(), svgrPlugin(), vitePluginRequire(), vitePluginCheck({typescript: true,})],
    resolve: {
        preserveSymlinks: true
    }
});
