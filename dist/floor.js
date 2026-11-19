const WIDTH = 200;
const PATCH = 3;
const SEARCH = 9;
const clamp = (value, low, high) => Math.min(high, Math.max(low, value));

function median(values) {
  values.sort((a, b) => a - b);
  return values[Math.floor(values.length / 2)];
}

function texture(frame, x, y) {
  const i = y * WIDTH + x;
  return Math.abs(frame[i - 2] - frame[i + 2]) + Math.abs(frame[i - 2 * WIDTH] - frame[i + 2 * WIDTH]);
}

function match(previous, current, x, y) {
  let best = Infinity;
  let runnerUp = Infinity;
  let bestX = 0;
  let bestY = 0;
  const sample = (dx, dy) => {
    let difference = 0;
    for (let j = -PATCH; j <= PATCH; j += 2) {
      const a = (y + j) * WIDTH + x;
      const b = a + dy * WIDTH + dx;
      for (let i = -PATCH; i <= PATCH; i += 2) difference += Math.abs(previous[a + i] - current[b + i]);
    }
    return difference;
  };
  for (let dy = -SEARCH; dy <= SEARCH; dy++) {
    for (let dx = -SEARCH; dx <= SEARCH; dx++) {
      const value = sample(dx, dy);
      if (value < best) {
        runnerUp = best;
        best = value;
        bestX = dx;
        bestY = dy;
      } else if (value < runnerUp) runnerUp = value;
    }
  }
  return best < 380 && best < runnerUp * .86 + 1 ? {x, y, dx:bestX, dy:bestY} : null;
}

export class FloorTracker {
  constructor() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = WIDTH;
    this.context = this.canvas.getContext('2d', {willReadFrequently:true});
    this.clear();
  }

  clear() {
    this.previous = null;
    this.anchor = null;
    this.lastTime = -1;
  }

  place(x, y) {
    this.anchor = {x, y, scale:1};
    this.previous = null;
  }

  update(video, now) {
    if (!this.anchor || now - this.lastTime < 34 || this.videoTime === video.currentTime) return;
    this.lastTime = now;
    this.videoTime = video.currentTime;

    const height = Math.round(WIDTH * video.videoHeight / video.videoWidth);
    if (this.canvas.height !== height) {
      this.canvas.height = height;
      this.previous = null;
    }
    this.context.drawImage(video, 0, 0, WIDTH, height);
    const {data} = this.context.getImageData(0, 0, WIDTH, height);
    const gray = new Uint8Array(WIDTH * height);
    for (let i = 0; i < gray.length; i++) gray[i] = (data[i*4]*77 + data[i*4+1]*150 + data[i*4+2]*29) >> 8;
    if (this.previous) this.follow(this.previous, gray, height);
    this.previous = gray;
  }

  follow(previous, next, height) {
    const anchor = this.anchor;
    const x = Math.round(anchor.x * WIDTH);
    const y = Math.round(anchor.y * height);
    const margin = PATCH + SEARCH + 2;
    const points = [];
    for (let row = -1; row <= 1; row++) {
      for (let column = -2; column <= 2; column++) {
        const cx = x + column * 18;
        const cy = y + row * 12 + 5;
        let strongest = 32;
        let selected;
        for (let v = cy-5; v <= cy+5; v++) {
          for (let u = cx-5; u <= cx+5; u++) {
            if (u < margin || u >= WIDTH-margin || v < margin || v >= height-margin) continue;
            const score = texture(previous, u, v);
            if (score > strongest) {
              strongest = score;
              selected = [u,v];
            }
          }
        }
        if (selected) {
          const found = match(previous, next, ...selected);
          if (found) points.push(found);
        }
      }
    }
    if (points.length < 3) return;
    const dx = median(points.map(p => p.dx));
    const dy = median(points.map(p => p.dy));
    const aligned = points.filter(p => Math.hypot(p.dx - dx, p.dy - dy) <= 3.5);
    if (aligned.length < 3) return;

    // Fit a small scale/rotation change around the feature centroid, then map the tap.
    const average = key => aligned.reduce((sum, p) => sum + p[key], 0) / aligned.length;
    const originX = average('x');
    const originY = average('y');
    const shiftX = average('dx');
    const shiftY = average('dy');
    let radial = 0;
    let tangent = 0;
    let variance = 0;
    for (const p of aligned) {
      const u = p.x - originX;
      const v = p.y - originY;
      radial += u*(p.dx-shiftX) + v*(p.dy-shiftY);
      tangent += u*(p.dy-shiftY) - v*(p.dx-shiftX);
      variance += u*u + v*v;
    }
    const scale = variance > 100 ? clamp(radial/variance, -.04, .04) : 0;
    const spin = variance > 100 ? clamp(tangent/variance, -.06, .06) : 0;
    anchor.x += (shiftX + scale*(x-originX) - spin*(y-originY)) / WIDTH;
    anchor.y += (shiftY + scale*(y-originY) + spin*(x-originX)) / height;
    anchor.scale = clamp(anchor.scale * (1 + scale), .45, 2.3);
  }
}
