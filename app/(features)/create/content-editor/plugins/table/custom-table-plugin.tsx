import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    INSERT_TABLE_COMMAND,
    TableCellNode,
    TableNode,
    TableRowNode,
} from '@lexical/table';
import {
    EditorThemeClasses,
    Klass,
    LexicalEditor,
    LexicalNode,
} from 'lexical';
import { createContext, JSX, useContext, useEffect, useMemo, useState } from 'react';
import * as React from 'react';

export type InsertTableCommandPayload = Readonly<{
    columns: string;
    rows: string;
    includeHeaders?: boolean;
}>;

export type CellContextShape = {
    cellEditorConfig: null | CellEditorConfig;
    cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
    set: (
        cellEditorConfig: null | CellEditorConfig,
        cellEditorPlugins: null | JSX.Element | Array<JSX.Element>,
    ) => void;
};

export type CellEditorConfig = Readonly<{
    namespace: string;
    nodes?: ReadonlyArray<Klass<LexicalNode>>;
    onError: (error: Error, editor: LexicalEditor) => void;
    readOnly?: boolean;
    theme?: EditorThemeClasses;
}>;

export const CellContext = createContext<CellContextShape>({
    cellEditorConfig: null,
    cellEditorPlugins: null,
    set: () => {
        // Empty
    },
});

export function TableContext({ children }: { children: JSX.Element }) {
    const [contextValue, setContextValue] = useState<{
        cellEditorConfig: null | CellEditorConfig;
        cellEditorPlugins: null | JSX.Element | Array<JSX.Element>;
    }>({
        cellEditorConfig: null,
        cellEditorPlugins: null,
    });
    return (
        (<CellContext
            value={useMemo(
                () => ({
                    cellEditorConfig: contextValue.cellEditorConfig,
                    cellEditorPlugins: contextValue.cellEditorPlugins,
                    set: (cellEditorConfig, cellEditorPlugins) => {
                        setContextValue({ cellEditorConfig, cellEditorPlugins });
                    },
                }),
                [contextValue.cellEditorConfig, contextValue.cellEditorPlugins],
            )}>
            {children}
        </CellContext>)
    );
}

export function InsertTableDialog({
    activeEditor,
    onClose,
}: {
    activeEditor: LexicalEditor;
    onClose: () => void;
}): JSX.Element {
    const [rows, setRows] = useState('5');
    const [columns, setColumns] = useState('5');
    const [isDisabled, setIsDisabled] = useState(true);

    useEffect(() => {
        const row = Number(rows);
        const column = Number(columns);
        if (row && row > 0 && row <= 500 && column && column > 0 && column <= 50) {
            setIsDisabled(false);
        } else {
            setIsDisabled(true);
        }
    }, [rows, columns]);

    const onClick = () => {
        activeEditor.dispatchCommand(INSERT_TABLE_COMMAND, {
            columns,
            rows,
        });

        onClose();
    };

    return (
        <>
            <div className="flex-col space-y-1">
                <div className="flex items-center">
                    <Label className="w-1/3">Rows</Label>
                    <Input
                        className="w-24"
                        type="number"
                        placeholder="# of rows (1-500)"
                        onChange={(e) => setRows(e.target.value)}
                        value={rows}
                    />
                </div>
                <div className="flex items-center">
                    <Label className=" w-1/3">Columns</Label>
                    <Input
                        className=" w-24"
                        type="number"
                        placeholder="# of columns (1-50)"
                        value={columns}
                        onChange={(e) => setColumns(e.target.value)}
                    />
                </div>
            </div>
            <div className="flex justify-center mt-5">
                <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={onClick}
                >
                    Confirm
                </Button>
            </div>
        </>
    );
}

export function CustomTablePlugin({
    cellEditorConfig,
    children,
}: {
    cellEditorConfig: CellEditorConfig;
    children: JSX.Element | Array<JSX.Element>;
}): JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    const cellContext = useContext(CellContext);
    useEffect(() => {
        if (!editor.hasNodes([TableNode, TableRowNode, TableCellNode])) {
            throw new Error(
                'TablePlugin: TableNode, TableRowNode, or TableCellNode is not registered on editor',
            );
        }
    }, [editor]);
    useEffect(() => {
        cellContext.set(cellEditorConfig, children);
    }, [cellContext, cellEditorConfig, children]);
    return null;
}