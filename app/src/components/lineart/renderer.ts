// WebGL2 line-art renderer with depth-buffer hidden-line removal.
//
// Two passes per frame:
//  1. depth-only pass draws the shape's triangle mesh (offset away from camera)
//  2. line pass draws the art paths as screen-space quads (offset toward camera)
// Lines on visible surfaces win the depth test; lines behind the solid lose it —
// the same hidden-line result ln produces in Go, at interactive frame rates.

import { lookAt, perspective, type Vec3 } from './math';
import { getGeometry, type LineArtGeometry, type ShapeName } from './shapes';

const SURFACE_VS = `#version 300 es
in vec3 aPos;
uniform mat4 uPV;
void main() {
  gl_Position = uPV * vec4(aPos, 1.0);
}`;

const SURFACE_FS = `#version 300 es
precision highp float;
out vec4 o;
void main() {
  o = vec4(0.0);
}`;

const LINE_VS = `#version 300 es
in vec3 aP0;
in vec3 aP1;
in float aWhich;
in float aSide;
uniform mat4 uPV;
uniform vec2 uRes;
uniform float uHalfWidth; // pixels
void main() {
  vec4 c0 = uPV * vec4(aP0, 1.0);
  vec4 c1 = uPV * vec4(aP1, 1.0);
  if (c0.w < 1e-5 || c1.w < 1e-5) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0); // behind camera → clip
    return;
  }
  vec2 n0 = c0.xy / c0.w;
  vec2 n1 = c1.xy / c1.w;
  vec2 dPx = (n1 - n0) * uRes * 0.5;
  vec2 dir = length(dPx) > 1e-6 ? normalize(dPx) : vec2(1.0, 0.0);
  vec2 nrm = vec2(-dir.y, dir.x);
  vec4 c = mix(c0, c1, aWhich);
  vec2 n = mix(n0, n1, aWhich);
  // offset perpendicular to the segment + extend ends by half width (butt cap)
  vec2 offPx = nrm * aSide * uHalfWidth + dir * (aWhich * 2.0 - 1.0) * uHalfWidth;
  n += offPx * 2.0 / uRes;
  gl_Position = vec4(n * c.w, c.z, c.w);
}`;

const LINE_FS = `#version 300 es
precision highp float;
uniform vec4 uColor; // premultiplied
out vec4 o;
void main() {
  o = uColor;
}`;

export interface LineArtOptions {
  lineColor?: string;
  background?: string | null;
  lineWidth?: number; // css pixels
  yaw?: number;
  pitch?: number;
}

function compile(gl: WebGL2RenderingContext, type: number, src: string): WebGLShader {
  const sh = gl.createShader(type);
  if (!sh) throw new Error('createShader failed');
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(sh);
    gl.deleteShader(sh);
    throw new Error(`shader compile: ${log}`);
  }
  return sh;
}

function link(gl: WebGL2RenderingContext, vs: string, fs: string): WebGLProgram {
  const p = gl.createProgram();
  if (!p) throw new Error('createProgram failed');
  const v = compile(gl, gl.VERTEX_SHADER, vs);
  const f = compile(gl, gl.FRAGMENT_SHADER, fs);
  gl.attachShader(p, v);
  gl.attachShader(p, f);
  gl.linkProgram(p);
  gl.deleteShader(v);
  gl.deleteShader(f);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(p);
    gl.deleteProgram(p);
    throw new Error(`program link: ${log}`);
  }
  return p;
}

function parseColor(css: string): [number, number, number, number] {
  const probe = document.createElement('span');
  probe.style.color = css;
  document.body.appendChild(probe);
  const computed = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  const m = computed.match(/rgba?\(([^)]+)\)/);
  if (!m) return [1, 1, 1, 1];
  const parts = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255, parts.length > 3 ? parts[3] : 1];
}

interface GpuShape {
  positions: Float32Array;
  indices: Uint32Array;
  lineVerts: Float32Array;
  lineVertCount: number;
}

export class LineArtRenderer {
  readonly canvas: HTMLCanvasElement;
  private gl: WebGL2RenderingContext;
  private surfProg: WebGLProgram;
  private lineProg: WebGLProgram;
  private surfVAO: WebGLVertexArrayObject | null = null;
  private lineVAO: WebGLVertexArrayObject | null = null;
  private indexCount = 0;
  private lineVertCount = 0;
  private uSurfPV: WebGLUniformLocation | null;
  private uLinePV: WebGLUniformLocation | null;
  private uRes: WebGLUniformLocation | null;
  private uHalfWidth: WebGLUniformLocation | null;
  private uColor: WebGLUniformLocation | null;
  private disposed = false;

  yaw: number;
  pitch = 0.45;
  radius: number;
  private color: [number, number, number, number];
  private bg: [number, number, number, number] | null;
  private lineWidth: number; // css px
  private shapeName: ShapeName;

  constructor(canvas: HTMLCanvasElement, shape: ShapeName, opts: LineArtOptions = {}) {
    this.canvas = canvas;
    const gl = canvas.getContext('webgl2', {
      antialias: true,
      alpha: true,
      premultipliedAlpha: true,
      depth: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) throw new Error('WebGL2 not available');
    this.gl = gl;

    this.surfProg = link(gl, SURFACE_VS, SURFACE_FS);
    this.lineProg = link(gl, LINE_VS, LINE_FS);
    this.uSurfPV = gl.getUniformLocation(this.surfProg, 'uPV');
    this.uLinePV = gl.getUniformLocation(this.lineProg, 'uPV');
    this.uRes = gl.getUniformLocation(this.lineProg, 'uRes');
    this.uHalfWidth = gl.getUniformLocation(this.lineProg, 'uHalfWidth');
    this.uColor = gl.getUniformLocation(this.lineProg, 'uColor');

    this.yaw = opts.yaw ?? 0.6;
    this.pitch = opts.pitch ?? 0.42;
    this.lineWidth = opts.lineWidth ?? 1.4;
    this.color = parseColor(opts.lineColor ?? '#ffffff');
    this.bg = opts.background ? parseColor(opts.background) : null;
    this.shapeName = shape;
    this.radius = 1;
    this.loadShape(shape);

    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.CULL_FACE);
  }

  private loadShape(name: ShapeName): void {
    const gl = this.gl;
    const geo = getGeometry(name);
    this.disposeShape();
    this.radius = geo.radius;
    this.indexCount = geo.indices.length;
    this.lineVertCount = geo.lineVertCount;

    // surface VAO
    const svao = gl.createVertexArray();
    gl.bindVertexArray(svao);
    const posBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.positions, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(this.surfProg, 'aPos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
    const idxBuf = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, idxBuf);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geo.indices, gl.STATIC_DRAW);
    gl.bindVertexArray(null);

    // line VAO
    const lvao = gl.createVertexArray();
    gl.bindVertexArray(lvao);
    const lineBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
    gl.bufferData(gl.ARRAY_BUFFER, geo.lineVerts, gl.STATIC_DRAW);
    const stride = 8 * 4;
    const locs: [string, number, number][] = [
      ['aP0', 3, 0],
      ['aP1', 3, 3],
      ['aWhich', 1, 6],
      ['aSide', 1, 7],
    ];
    for (const [uname, size, off] of locs) {
      const loc = gl.getAttribLocation(this.lineProg, uname);
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride, off * 4);
    }
    gl.bindVertexArray(null);

    this.surfVAO = svao;
    this.lineVAO = lvao;
    // keep buffer refs alive via VAO; stored to avoid GC edge cases
    this.buffers.push(posBuf, idxBuf, lineBuf);
  }

  private buffers: WebGLBuffer[] = [];

  private disposeShape(): void {
    const gl = this.gl;
    if (this.surfVAO) gl.deleteVertexArray(this.surfVAO);
    if (this.lineVAO) gl.deleteVertexArray(this.lineVAO);
    this.surfVAO = null;
    this.lineVAO = null;
    for (const b of this.buffers) gl.deleteBuffer(b);
    this.buffers = [];
  }

  setShape(name: ShapeName): void {
    if (name === this.shapeName) return;
    this.shapeName = name;
    this.loadShape(name);
  }

  setLineColor(css: string): void {
    this.color = parseColor(css);
  }

  setBackground(css: string | null): void {
    this.bg = css ? parseColor(css) : null;
  }

  setLineWidth(px: number): void {
    this.lineWidth = px;
  }

  get aspect(): number {
    return this.canvas.width / Math.max(1, this.canvas.height);
  }

  resize(): void {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(1, Math.round(this.canvas.clientWidth * dpr));
    const h = Math.max(1, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = w;
      this.canvas.height = h;
    }
  }

  private camera(): { eye: Vec3; proj: Float32Array; view: Float32Array } {
    const d = this.radius * 3.8;
    const cp = Math.cos(this.pitch);
    const eye: Vec3 = [
      d * cp * Math.cos(this.yaw),
      d * cp * Math.sin(this.yaw),
      d * Math.sin(this.pitch),
    ];
    const proj = perspective(40, this.aspect, 0.1, 100);
    const view = lookAt(eye, [0, 0, 0], [0, 0, 1]);
    return { eye, proj, view };
  }

  render(): void {
    if (this.disposed) return;
    const gl = this.gl;
    this.resize();
    const w = this.canvas.width;
    const h = this.canvas.height;
    gl.viewport(0, 0, w, h);

    if (this.bg) {
      gl.clearColor(this.bg[0], this.bg[1], this.bg[2], this.bg[3]);
    } else {
      gl.clearColor(0, 0, 0, 0);
    }
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const { proj, view } = this.camera();
    const pv = new Float32Array(16);
    // pv = proj * view (column-major)
    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        let sum = 0;
        for (let k = 0; k < 4; k++) sum += proj[k * 4 + r] * view[c * 4 + k];
        pv[c * 4 + r] = sum;
      }
    }

    // pass 1: depth only (surfaces pushed away from camera)
    gl.useProgram(this.surfProg);
    gl.uniformMatrix4fv(this.uSurfPV, false, pv);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(1, 1);
    gl.colorMask(false, false, false, false);
    gl.bindVertexArray(this.surfVAO);
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_INT, 0);
    gl.colorMask(true, true, true, true);
    gl.disable(gl.POLYGON_OFFSET_FILL);

    // pass 2: lines (pulled toward camera so surface lines pass depth test)
    gl.useProgram(this.lineProg);
    gl.uniformMatrix4fv(this.uLinePV, false, pv);
    gl.uniform2f(this.uRes, w, h);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    gl.uniform1f(this.uHalfWidth, (this.lineWidth * dpr) / 2);
    const c = this.color;
    gl.uniform4f(this.uColor, c[0] * c[3], c[1] * c[3], c[2] * c[3], c[3]);
    gl.enable(gl.BLEND);
    gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.POLYGON_OFFSET_FILL);
    gl.polygonOffset(-1, -1);
    gl.bindVertexArray(this.lineVAO);
    gl.drawArrays(gl.TRIANGLES, 0, this.lineVertCount);
    gl.disable(gl.POLYGON_OFFSET_FILL);
    gl.disable(gl.BLEND);
    gl.bindVertexArray(null);
  }

  dispose(): void {
    if (this.disposed) return;
    this.disposed = true;
    const gl = this.gl;
    this.disposeShape();
    gl.deleteProgram(this.surfProg);
    gl.deleteProgram(this.lineProg);
    // NOTE: do not call loseContext() — React StrictMode remounts effects,
    // and a second renderer on the same canvas must get a live context.
  }
}

export type { LineArtGeometry };
