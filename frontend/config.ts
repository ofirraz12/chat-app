import Constants from 'expo-constants';

const { URL_backend, LLM_MODEL, appState } = Constants.expoConfig?.extra || {};

// base user settings
export const appConfig = {
    saveUser: true,
  };

// the application settings

export const appSettings = {
  dev: {  
    URL_backend: "http://192.168.1.32:5000/api",
    LLM_MODEL: "ollama"
  },

  prod: {  
    URL_backend,
    LLM_MODEL
  }
}

export function getAppSettings() {
  return appSettings[appState === 'prod' ? 'prod' : 'dev'];
}
