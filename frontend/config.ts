import Constants from 'expo-constants';

// base user settings
export const appConfig = {
    saveUser: true,
  };

  type AppSettings = {
    URL_backend: string;
    LLM_MODEL: string;
    APP_STATE: 'dev' | 'prod';
    WS_URL_backend: string;
  };
  
  const extra = Constants.expoConfig?.extra ?? {};
  
  export const getAppSettings = (): AppSettings => {
    return {
      URL_backend: extra.URL_backend || '',
      WS_URL_backend: extra.WS_URL_backend || '',
      LLM_MODEL: extra.LLM_MODEL || '',
      APP_STATE: (extra.APP_STATE === 'prod' ? 'prod' : 'dev'), // default to 'dev'
    };
  };
