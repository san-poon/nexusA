/**
 * When you see `invariant` in the codebase, read it as "this condition must be true, or our program has a bug"

 * function divide(a: number, b: number): number {
    invariant(b !== 0, "Cannot divide by zero");
    return a / b;
}
 */
export default function invariant(
    cond?: boolean,
    message?: string,
    ...args: string[]
): asserts cond {
    if (cond) {
        return;
    }

    throw new Error(
        'Internal Lexical error: invariant() is meant to be replaced at compile ' +
        'time. There is no runtime version. Error: ' +
        message,
    );
}