export function wait(milliseconds: number): Promise<string> {
    return new Promise((resolve) => {
        if (isNaN(milliseconds)) { 
            throw new Error('milleseconds not a number'); 
        }
        setTimeout(() => resolve(), milliseconds)
    });
}
