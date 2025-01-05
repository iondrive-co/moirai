export const calculateNodePosition = (index: number) => ({
    x: (index % 3) * 400 + 50,
    y: Math.floor(index / 3) * 300 + 50
});