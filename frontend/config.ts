// base user settings
export const appConfig = {
    saveUser: true,
  };

// the application settings
const appState = "dev" // dev or prod

export const appSettings = {
  dev: {  
    URL_backend: "http://192.168.1.32:5000/api",
    URL_LLM: "http://192.168.1.32:11434/api"
  },

  prod: {  
    URL_backend: "http://localhost:5000/api",
    URL_LLM: "http://localhost:11434/api"
  }
}

export function getAppSettings(){
  return appSettings[appState]
}
