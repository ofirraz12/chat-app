module.exports = function (api) {
    api.cache(true);
    return {
      presets: [
        ["babel-preset-expo", { jsxImportSource: "nativewind" }],
        "nativewind/babel",
      ],
      plugins: [
        // ...other plugins if needed...
  
        // IMPORTANT: react-native-reanimated/plugin MUST be last
        [
          "react-native-reanimated/plugin",
          {
            // If you still get concurrency warnings, try setting concurrency to false
            // concurrency: false,
          },
        ],
      ],
    };
  };