import * as React from "react"
import {Context, createContext, useContext, useState} from "react";
import {Session} from "@toolpad/core/AppProvider";

interface SessionContextType {
    customSession: Session,
    setCustomSession: (session: Session | null) => void;
}

const SessionContext: Context<SessionContextType | undefined> = createContext<SessionContextType | undefined>(undefined)

export const SessionProvider = ({ children }) => {
    const [customSession, setCustomSession] = useState<Session>(null)

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