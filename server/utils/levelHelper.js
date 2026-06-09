const levels = [
  { name: "Bronze I", minPoints: 0 },
  { name: "Bronze II", minPoints: 200 },
  { name: "Silver I", minPoints: 500 },
  { name: "Silver II", minPoints: 1000 },
  { name: "Gold I", minPoints: 1500 },
  { name: "Gold II", minPoints: 2000 },
  { name: "Platinum I", minPoints: 3000 },
  { name: "Platinum II", minPoints: 4000 },
  { name: "Diamond", minPoints: 5000 },
  { name: "Eco Legend", minPoints: 7000 },
];

function getLevelFromPoints(points) {
  for (let i = levels.length - 1; i >= 0; i--) {
    if (points >= levels[i].minPoints) return levels[i].name;
  }
  return levels[0].name;
}

module.exports = { getLevelFromPoints };
