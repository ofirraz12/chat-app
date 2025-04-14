import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  extra: {
    URL_backend: process.env.URL_backend,
    LLM_MODEL: process.env.LLM_MODEL,
    appState: process.env.APP_STATE,
  },
});
