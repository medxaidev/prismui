import postcssPresetEnv from 'postcss-preset-env';

const config = {
  plugins: [
    postcssPresetEnv({
      stage: 3,
      features: {
        'nesting-rules': true,
      },
    }),
  ],
};

export default config;