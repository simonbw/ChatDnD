import React, { useEffect, useRef, useState } from "react";
import { mod, smoothStep } from "../../common/utils/mathUtils";
import { number } from "zod";

export function LoadingIndicator({
  duration = 2000,
  segments = 5,
  thickness: maxThickness = 10 * window.devicePixelRatio,
  size = 128,
  color = "#6B5B47",
  fadePercent = 0.0,
}: {
  duration?: number;
  segments?: number;
  fadePercent?: number;
  thickness?: number;
  color?: string;
  size?: number;
}) {
  const [t, setT] = useState<number>(() => 0);
  const tRef = useRef(t);
  tRef.current = t;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    requestAnimationFrame(() => {
      const dt = 16; // TODO: Actual elapsed time
      setT((old) => old + dt / duration);
      const iterations = 3;
      const iteration = Math.floor(mod(t, iterations * 2));
      const isErasePass = iteration >= iterations;

      if (canvasRef.current) {
        const { width, height } = canvasRef.current;

        const ctx = canvasRef.current.getContext("2d", {
          willReadFrequently: true,
          alpha: true,
        });
        if (ctx) {
          ctx.globalCompositeOperation = "destination-in";
          ctx.fillStyle = color;
          ctx.globalAlpha = 1 - fadePercent;
          ctx.fillRect(0, 0, width, height);

          ctx.lineCap = "round";
          ctx.globalAlpha = 1;
          ctx.strokeStyle = color;

          const thickness =
            (maxThickness * mod(t, iterations)) / iterations +
            (isErasePass ? 1 : 0.1);
          ctx.globalCompositeOperation = isErasePass
            ? "destination-out" // erase
            : "source-over"; // draw

          const sx = 1.0;
          const sy = 0.8;

          const cx = width / 2;
          const cy = height / 2;
          const r = Math.min(width, height * 2) * 0.5 - maxThickness;
          const theta = -Math.PI / 2 + t * Math.PI * 2;

          const dTheta = 0.05;
          for (let i = 0; i < segments; i++) {
            ctx.beginPath();
            ctx.lineWidth = thickness;
            const [x1, y1] = lemniscateOfBernoulli(theta - dTheta * i, r);
            const [x2, y2] = lemniscateOfBernoulli(theta - dTheta * (i + 1), r);
            ctx.moveTo(x1 * sx + cx, y1 * sy + cy);
            ctx.lineTo(x2 * sx + cx, y2 * sy + cy);
            ctx.stroke();
          }
        }
      }
    });
  }, [t]);

  return (
    <canvas
      width={size * 2}
      height={size * 2}
      ref={canvasRef}
      style={{ width: size, height: size }}
    />
  );
}

function lemniscateOfGerono(t: number, a: number): [number, number] {
  // https://en.wikipedia.org/wiki/Lemniscate_of_Gerono
  const x = a * Math.cos(t);
  const y = a * Math.sin(t) * Math.cos(t);
  return [x, y];
}

function lemniscateOfBernoulli(t: number, a: number): [number, number] {
  // https://en.wikipedia.org/wiki/Lemniscate_of_Bernoulli
  const sinT = Math.sin(t);
  const x = (a * Math.cos(t)) / (1 + sinT ** 2);
  const y = sinT * x;
  return [x, y];
}
