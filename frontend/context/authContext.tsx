import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { User, AuthContextType } from "@/types/auth";
import { registerUser, loginUser, logoutUser } from "@/api/authApi";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const restoreUser = async () => {
        try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            console.log("User session restored:", storedUser);
        }
        } catch (error) {
        console.error("Failed to restore user session:", error);
        } finally {
        setIsInitialized(true); // Mark initialization as complete
        }
    
    }

    const login = async (email: string, password: string): Promise<string | undefined> => {
        const response = await loginUser({ email, password });
    
        if (response) {
            if (response.success === true) {
                const userData = response.user || null;
    
                // Log userData before updating state
                console.log("Received user data:", userData);
    
                // Update state
                setUser(userData);
    
                // Save user data to AsyncStorage
                await AsyncStorage.setItem("user", JSON.stringify(userData));
    
                // Log after the state is set and saved
                console.log("User session saved to AsyncStorage");
                console.log("User state updated:", userData);
    
                return "login successfully";
            } else if (response.success === false) {
                return response.message;
            }
        }
    
        return "Unknown error";
    };
    

    const logout = async (id: Number, clearAsyncStorage: boolean): Promise<string | undefined> => {
        const response = await logoutUser(id);

        if (response) {
            if (response.success === true) {
                setUser(null);
                if (clearAsyncStorage){
                    // Remove user data from AsyncStorage
                    await AsyncStorage.removeItem("user");
                    console.log("User session cleared from AsyncStorage");
                    return "logout-true";
                }

            } else if (response.success === false) {
                console.log("logout-false");
                return "logout-false"; 
              } 
        }

        return "Unknown error";
    };

    const register = async (name: string, email: string, password: string): Promise<string | undefined> => {
        const response = await registerUser({ name, email, password });
    
        if (response) {
            if (response.message === "register-true") {
                const userData = response.user || null;
                setUser(userData);
    
                // Save user data to AsyncStorage
                await AsyncStorage.setItem("user", JSON.stringify(userData));
                console.log("User session saved to AsyncStorage after registration");
                return "register-true";
            } else if (response.message === "register-false") {
                return "register-false";
            }
        }
    
        return "Unknown error";
    };

    return (
        <AuthContext.Provider value={{ user, setUser, login, register, logout, isInitialized, restoreUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
