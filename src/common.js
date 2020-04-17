

export const sign = (n) => {
    if (n > 0) {
        return 1;
    } else if (n < 0) {
        return -1;
    } else if (n === 0) {
        return 0;
    }
}

export const dist = (x1, y1, x2, y2) => Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2), 2);