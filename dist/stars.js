// Heart-shaped particles; shared by the selfie canvas and WebXR geometry.
export const starColors = ['#ff94c6','#e82a85'];
export const starPoints = Array.from({length:64}, (_, i) => {
  const t = -2*Math.PI*i/64;
  return [16*Math.sin(t)**3/17,
    (13*Math.cos(t)-5*Math.cos(2*t)-2*Math.cos(3*t)-Math.cos(4*t))/17];
});

export function starPulse(seconds, index) {
  const age = seconds % 6 - .50 - index*.095;
  if (age <= 0 || age >= 1) return 0;
  return Math.min(1,age/.18,(1-age)/.30);
}
