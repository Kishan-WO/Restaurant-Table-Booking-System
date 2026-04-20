/**
 * Creates a delay for a specified number of milliseconds.
 *
 * Useful for pausing execution in async functions (e.g., with `await`).
 *
 * @param ms - The number of milliseconds to wait before resolving.
 * @returns A Promise that resolves after the given delay.
 *
 * @example
 * await delay(1000); // waits for 1 second
 */

export const delay = (ms: number): Promise<void> => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};
