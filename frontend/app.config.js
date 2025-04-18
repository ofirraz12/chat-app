import 'dotenv/config';

const eas = {
  "projectId": "8fc27180-0989-4489-be1d-0e62300eeb33"
}

export default ({ config }) => ({
  ...config,
  android: {
    package: "com.ofir2203.BetaTrainer"
  },
  extra: {
    eas: {
      projectId: '8fc27180-0989-4489-be1d-0e62300eeb33'
    },
    URL_backend: process.env.URL_backend,
    LLM_MODEL: process.env.LLM_MODEL,
    appState: process.env.APP_STATE,
  },
});
