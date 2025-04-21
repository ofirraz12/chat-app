import 'dotenv/config';

export default ({ config }) => {
  const APP_STATE = process.env.EXPO_PUBLIC_APP_STATE ?? 'dev';

  const URL_backend =
    APP_STATE === 'prod'
      ? process.env.EXPO_PUBLIC_PROD_URL_BACKEND
      : process.env.EXPO_PUBLIC_DEV_URL_BACKEND;

  return {
    ...config,
    android: {
      package: "com.ofir2203.BetaTrainer",
      permissions: ["INTERNET"],
    },
    extra: {
      eas: {
        projectId: '8fc27180-0989-4489-be1d-0e62300eeb33',
      },
      URL_backend,
      LLM_MODEL: process.env.EXPO_PUBLIC_LLM_MODEL,
      APP_STATE,
    },
  };
};
