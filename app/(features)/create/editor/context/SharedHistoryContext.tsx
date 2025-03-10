import { createEmptyHistoryState, HistoryState } from "@lexical/react/LexicalHistoryPlugin"
import * as React from "react";

import { createContext, ReactNode, useContext, useMemo } from "react";

type ContextShape = {
    historyState?: HistoryState;
}

const Context: React.Context<ContextShape> = createContext({});

export const SharedHistoryContext = ({ children }: { children: ReactNode }) => {
    const historyContext = useMemo(
        () => ({ historyState: createEmptyHistoryState() }),
        [],
    );
    return (
        (<Context value={historyContext}>
            {children}
        </Context>)
    );
}

export const useSharedHistoryContext = (): ContextShape => {
    return useContext(Context);
}