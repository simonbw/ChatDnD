import React, { useEffect, useRef, useState } from "react";
import { mod, smoothStep } from "../../common/utils/mathUtils";
import { number } from "zod";

export function LoadingIndicator({
  duration = 2000,
  thickness = 5,
  size = 128,
  color = "#6B5B47",
  fadePercent = 0.02,
}: {
  duration?: number;
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
      setT((old) => mod(old + dt / duration, 1));

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
          ctx.globalCompositeOperation = "source-over";
          ctx.lineWidth = thickness * window.devicePixelRatio;
          ctx.strokeStyle = color;

          const cx = width / 2;
          const cy = height / 2;
          const r = Math.min(width, height * 2) * 0.5 - thickness * 2;
          const theta = t * Math.PI * 2;
          const [x1, y1] = lemniscateOfBernoulli(theta, r);
          const [x2, y2] = lemniscateOfBernoulli(theta + 0.1, r);

          ctx.beginPath();
          ctx.moveTo(x1 + cx, y1 + cy);
          ctx.lineTo(x2 + cx, y2 + cy);
          ctx.stroke();
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
