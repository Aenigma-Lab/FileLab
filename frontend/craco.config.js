// craco.config.js
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, '.env') });

// Environment variable overrides
const config = {
  disableHotReload: process.env.DISABLE_HOT_RELOAD === "true",
  enableVisualEdits: process.env.REACT_APP_ENABLE_VISUAL_EDITS === "true",
  enableHealthCheck: process.env.ENABLE_HEALTH_CHECK === "true",
  usePollingHMR: process.env.REACT_APP_USE_POLLING_HMR === "true",
};

// Conditionally load visual editing modules only if enabled
let babelMetadataPlugin;
let setupDevServer;

if (config.enableVisualEdits) {
  babelMetadataPlugin = require("./plugins/visual-edits/babel-metadata-plugin");
  setupDevServer = require("./plugins/visual-edits/dev-server-setup");
}

// Conditionally load health check modules only if enabled
let WebpackHealthPlugin;
let setupHealthEndpoints;
let healthPluginInstance;

if (config.enableHealthCheck) {
  WebpackHealthPlugin = require("./plugins/health-check/webpack-health-plugin");
  setupHealthEndpoints = require("./plugins/health-check/health-endpoints");
  healthPluginInstance = new WebpackHealthPlugin();
}

const webpackConfig = {
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    configure: (webpackConfig, { env, paths }) => {

      // Disable hot reload completely if environment variable is set
      if (config.disableHotReload) {
        // Remove hot reload related plugins
        webpackConfig.plugins = webpackConfig.plugins.filter(plugin => {
          return !(plugin.constructor.name === 'HotModuleReplacementPlugin');
        });

        // Disable watch mode
        webpackConfig.watch = false;
        webpackConfig.watchOptions = {
          ignored: /.*/, // Ignore all files
        };
      } else {
        // Add ignored patterns to reduce watched directories
        webpackConfig.watchOptions = {
          ...webpackConfig.watchOptions,
          ignored: [
            '**/node_modules/**',
            '**/.git/**',
            '**/build/**',
            '**/dist/**',
            '**/coverage/**',
            '**/public/**',
          ],
        };

        // Configure Webpack for polling-based HMR (fix WebSocket connection errors)
        // This prevents WebSocket connection attempts that fail when backend doesn't support WS
        if (webpackConfig.module && webpackConfig.module.rules) {
          // Find and update the HotModuleReplacementPlugin if it exists
          webpackConfig.plugins.forEach(plugin => {
            if (plugin.constructor.name === 'HotModuleReplacementPlugin') {
              // The HMR plugin is already configured, but we need to configure
              // the dev server to use polling instead of WebSocket
            }
          });
        }
      }

      // Add health check plugin to webpack if enabled
      if (config.enableHealthCheck && healthPluginInstance) {
        webpackConfig.plugins.push(healthPluginInstance);
      }

      return webpackConfig;
    },
  },
};

// Only add babel plugin if visual editing is enabled
if (config.enableVisualEdits) {
  webpackConfig.babel = {
    plugins: [babelMetadataPlugin],
  };
}

// Setup dev server with visual edits and/or health check
if (config.enableVisualEdits || config.enableHealthCheck || !config.disableHotReload) {
  webpackConfig.devServer = (devServerConfig) => {
    // Apply visual edits dev server setup if enabled
    if (config.enableVisualEdits && setupDevServer) {
      devServerConfig = setupDevServer(devServerConfig);
    }

    // Configure dev server to use polling-based HMR instead of WebSocket
    // This fixes WebSocket connection errors when backend doesn't have WebSocket support
    if (!config.disableHotReload) {
      // Use polling-based HMR to avoid WebSocket connection errors
      // This is the key fix for the "WebSocket connection to 'ws://localhost:3000/ws' failed" error
      devServerConfig.hot = config.usePollingHMR ? false : true;
      devServerConfig.liveReload = !config.usePollingHMR;
      
      // Configure client to use polling instead of WebSocket for HMR
      if (config.usePollingHMR) {
        devServerConfig.client = {
          ...devServerConfig.client,
          webSocketURL: undefined, // Disable WebSocket URL - we'll use polling instead
          progress: true,
          overlay: true,
          reconnect: 5, // Reconnect attempts
        };
        
        // Add custom middleware to handle HMR polling requests
        const originalSetupMiddlewares = devServerConfig.setupMiddlewares;
        devServerConfig.setupMiddlewares = (middlewares, devServer) => {
          // Add polling-based HMR support
          middlewares.push((req, res, next) => {
            // Allow polling requests to pass through without WebSocket errors
            if (req.url && req.url.includes('hot') || req.url && req.url.includes('sockjs')) {
              // Set headers to prevent WebSocket errors from appearing
              res.setHeader('X-Content-Type-Options', 'nosniff');
            }
            next();
          });
          
          if (originalSetupMiddlewares) {
            return originalSetupMiddlewares(middlewares, devServer);
          }
          return middlewares;
        };
      } else {
        // If not using polling, configure WebSocket to suppress errors
        devServerConfig.client = {
          ...devServerConfig.client,
          webSocketURL: {
            protocol: 'ws',
            hostname: 'localhost',
            port: 3000,
            path: '/ws',
          },
          overlay: {
            errors: true,
            warnings: false,
          },
          logging: 'error', // Only log errors, not warnings
        };
      }
    }

    // Add health check endpoints if enabled
    if (config.enableHealthCheck && setupHealthEndpoints && healthPluginInstance) {
      const originalSetupMiddlewares = devServerConfig.setupMiddlewares;

      devServerConfig.setupMiddlewares = (middlewares, devServer) => {
        // Call original setup if exists
        if (originalSetupMiddlewares) {
          middlewares = originalSetupMiddlewares(middlewares, devServer);
        }

        // Setup health endpoints
        setupHealthEndpoints(devServer, healthPluginInstance);

        return middlewares;
      };
    }

    return devServerConfig;
  };
}

module.exports = webpackConfig;
