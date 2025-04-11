export interface User {
    id?: number;
    name?: string;
    email: string;
    password: string;
    activity?: Number;
    token?: string;
}

export interface AuthContextType {
    user: User | null;
    setUser: React.Dispatch<React.SetStateAction<User | null>>;
    login: (email: string, password: string) => Promise<string | undefined>;
    register: (name: string, email: string, password: string) => Promise<string | undefined>;
    logout: (id: Number, clearAsyncStorage: boolean) => Promise<string | undefined>;
    isInitialized: boolean;
    restoreUser: () => void;
}