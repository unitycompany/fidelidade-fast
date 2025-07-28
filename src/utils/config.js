export const POINTS_CONFIG_KEY = 'pointsPerReal';

export function getPointsPerReal() {
    return parseFloat(localStorage.getItem(POINTS_CONFIG_KEY) || '1');
}

export function setPointsPerReal(value) {
    localStorage.setItem(POINTS_CONFIG_KEY, value.toString());
}
