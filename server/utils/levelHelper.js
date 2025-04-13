function getLevelFromPoints(points) {
  const thresholds = [0, 100, 250, 450, 700, 1100, 1600, 2200, 2900, 3700];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (points >= thresholds[i]) return i + 1;
  }
  return 1;
}

module.exports = { getLevelFromPoints };
