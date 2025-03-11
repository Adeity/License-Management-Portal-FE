import * as React from "react"
import {Context, createContext, useContext, useState} from "react";
import {Session} from "@toolpad/core/AppProvider";

// Extended user type with roles
interface ExtendedUser {
    id?: string | null;
    name?: string | null;
    image?: string | null;
    email?: string | null;
    role: string | null;
}

// Extended Session interface
export interface ExtendedSession extends Session {
    user?: ExtendedUser;
}

interface SessionContextType {
    customSession: ExtendedSession,
    setCustomSession: (session: ExtendedSession | null) => void;
}

const SessionContext: Context<SessionContextType | undefined> = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({ children }) => {
    const [customSession, setCustomSession] = useState<ExtendedSession>(null)

    return (
        <SessionContext.Provider value={{customSession, setCustomSession }}>
            {children}
        </SessionContext.Provider>
    )
}

export const useCustomSession = () => {
    const context = useContext(SessionContext);
    if (context === undefined) {
        throw new Error("useSession must be used within a SessionProvider")
    }
    return context;
}