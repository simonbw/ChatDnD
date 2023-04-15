import React, { useEffect, useMemo, useRef, useState } from "react";
import { clamp } from "../../common/utils/mathUtils";
import { useLoadImage } from "../hooks/useLoadImage";
import { classNames } from "./classNames";
import { makeNoise2D } from "open-simplex-noise";

export function DissolveInImage({
  src,
  className,
  width,
  height,
  duration = 2000,
  ref: _ref,
  ...rest
}: React.HTMLProps<HTMLCanvasElement> & { duration?: number }) {
  const [t, setT] = useState<number>(() => -1);
  const tRef = useRef(t);
  tRef.current = t;

  const noise = useMemo(() => makeNoise2D(Date.now()), []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const image = useLoadImage(src, () => {
    console.log("image loaded, starting transition");
    setT(() => 0);
  });

  useEffect(() => {
    if (t >= 0 && t <= 1) {
      requestAnimationFrame(() => {
        const dt = 16; // TODO: Actual elapsed time
        setT((old) => clamp(old + dt / duration));

        if (canvasRef.current) {
          const { width: canvasWidth, height: canvasHeight } =
            canvasRef.current;

          const ctx = canvasRef.current.getContext("2d");
          if (ctx && image) {
            ctx.clearRect(0, 0, canvasWidth, canvasHeight);
            ctx.drawImage(image, 0, 0);

            const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
            for (let x = 0; x < canvasWidth; x++) {
              for (let y = 0; y < canvasHeight; y++) {
                const i = (x + y * canvasWidth) * 4;

                const cx = (2 * x) / canvasWidth - 1;
                const cy = (2 * y) / canvasHeight - 1;

                const noiseOctave = 0.02;
                const n = 0.5 + noise(x * noiseOctave, y * noiseOctave) * 0.5; // from 0 to 1
                const o = 1 - Math.sqrt(cx * cx + cy * cy) / Math.sqrt(2);

                imageData.data[i + 3] *= clamp(n * o + 2 * t - 1);
              }
            }
            ctx.putImageData(imageData, 0, 0);
          }
        }
      });
    }
  }, [t]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className={classNames("bg-transparent", className)}
      {...rest}
    />
  );
}
