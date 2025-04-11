export interface AppSettingsType {
    UserSettings: Record<string, any>;
    updateSetting: (key: string, value: any) => void;
    isInitialized: boolean;
  }