"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const VERTEX_SHADER_SRC = `
attribute vec2 a_position;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER_SRC = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;
uniform float u_dark;

void main() {
  // Exact 1:1 aspect-ratio corrected coordinates
  vec2 p = (gl_FragCoord.xy - 0.5 * u_resolution) / min(u_resolution.x, u_resolution.y);
  float t = u_time * 0.32;

  // 5 autonomous, de-synchronised wide orbits (completely independent of cursor)
  vec2 c1 = vec2(0.55 * sin(t * 0.45 + 0.5), 0.34 * cos(t * 0.35 + 1.2));
  vec2 c2 = vec2(0.62 * cos(t * 0.38 + 2.4), 0.38 * sin(t * 0.52 + 0.8));
  vec2 c3 = vec2(0.48 * sin(t * 0.62 + 4.2), 0.40 * cos(t * 0.41 + 3.3));
  vec2 c4 = vec2(0.58 * cos(t * 0.32 + 5.0), 0.36 * sin(t * 0.58 + 2.7));
  vec2 c5 = vec2(0.42 * sin(t * 0.55 + 1.8), 0.42 * cos(t * 0.46 + 4.5));

  // Radii of the 5 circles
  float r1 = 0.22;
  float r2 = 0.18;
  float r3 = 0.25;
  float r4 = 0.16;
  float r5 = 0.20;

  // Euclidean distance inverse-square field (clean perfect circles, no domain warp)
  float eps = 0.003;
  float f1 = (r1 * r1) / (dot(p - c1, p - c1) + eps);
  float f2 = (r2 * r2) / (dot(p - c2, p - c2) + eps);
  float f3 = (r3 * r3) / (dot(p - c3, p - c3) + eps);
  float f4 = (r4 * r4) / (dot(p - c4, p - c4) + eps);
  float f5 = (r5 * r5) / (dot(p - c5, p - c5) + eps);

  float field = f1 + f2 + f3 + f4 + f5;

  // Anti-aliased thresholded circular surface
  float threshold = 1.0;
  float surface = smoothstep(0.96, 1.04, field);
  float innerCore = smoothstep(1.25, 2.6, field);
  float aura = smoothstep(0.20, 0.96, field);
  float rim = smoothstep(0.92, 1.0, field) * (1.0 - smoothstep(1.0, 1.15, field));

  // Lime Color Palette (#C4F167)
  vec3 darkGround = vec3(0.008, 0.012, 0.006);
  vec3 lightGround = vec3(0.97, 0.98, 0.96);
  vec3 ground = mix(lightGround, darkGround, u_dark);

  vec3 limeAura = mix(vec3(0.78, 0.92, 0.38), vec3(0.12, 0.26, 0.04), u_dark);
  vec3 limeBody = mix(vec3(0.55, 0.82, 0.12), vec3(0.77, 0.95, 0.40), u_dark); // #C4F167
  vec3 limeCore = mix(vec3(0.45, 0.72, 0.08), vec3(0.90, 1.0, 0.65), u_dark);  // #E0FE9E

  // Composite generative color layers
  vec3 col = ground;
  col = mix(col, limeAura, aura * (u_dark > 0.5 ? 0.72 : 0.20));
  col = mix(col, limeBody, surface * (u_dark > 0.5 ? 0.88 : 0.35));
  col = mix(col, limeCore, innerCore * (u_dark > 0.5 ? 0.95 : 0.45));
  col += limeBody * (rim * (u_dark > 0.5 ? 0.45 : 0.20));

  gl_FragColor = vec4(col, 1.0);
}
`;

export const MetaballsBackground: React.FC<{ className?: string }> = ({ className = "" }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasWebGL, setHasWebGL] = useState(true);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

    // Initialize WebGL context
    const gl = (canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      powerPreference: "high-performance",
    }) ||
      canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;

    if (!gl) {
      setHasWebGL(false);
      return;
    }

    const createShader = (type: number, src: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER_SRC);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER_SRC);
    if (!vert || !frag) {
      setHasWebGL(false);
      return;
    }

    const program = gl.createProgram();
    if (!program) {
      setHasWebGL(false);
      return;
    }

    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      setHasWebGL(false);
      return;
    }

    gl.useProgram(program);

    // Quad geometry covering full clip-space
    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0]),
      gl.STATIC_DRAW
    );

    const aPosLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPosLoc);
    gl.vertexAttribPointer(aPosLoc, 2, gl.FLOAT, false, 0, 0);

    const uResLoc = gl.getUniformLocation(program, "u_resolution");
    const uTimeLoc = gl.getUniformLocation(program, "u_time");
    const uDarkLoc = gl.getUniformLocation(program, "u_dark");

    let animationFrameId: number;
    const startTime = performance.now();

    // Responsive resize handler with 1:1 aspect ratio mapping
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5) * 0.9;
      const width = window.innerWidth;
      const height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const isDark = theme === "dark";

    // Autonomous render loop (no cursor tracking)
    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;

      gl.useProgram(program);
      gl.uniform2f(uResLoc, canvas.width, canvas.height);
      gl.uniform1f(uTimeLoc, elapsed);
      gl.uniform1f(uDarkLoc, isDark ? 1.0 : 0.0);

      gl.drawArrays(gl.TRIANGLES, 0, 6);

      if (!prefersReducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (prefersReducedMotion) {
      render(startTime);
    } else {
      animationFrameId = requestAnimationFrame(render);
    }

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      gl.deleteProgram(program);
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteBuffer(posBuffer);
    };
  }, [theme]);

  return (
    <>
      {!hasWebGL && (
        <div
          className="fixed inset-0 z-[-1] pointer-events-none bg-gradient-to-br from-[#02050D] via-[#051206] to-[#02050D]"
          aria-hidden="true"
        />
      )}

      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`fixed inset-0 w-full h-full pointer-events-none z-[-1] transition-opacity duration-700 ${
          hasWebGL ? "opacity-100" : "opacity-0"
        } ${className}`}
      />
    </>
  );
};

export default MetaballsBackground;
