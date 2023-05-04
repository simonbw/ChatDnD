import { makeNoise2D } from "open-simplex-noise";
import React, { useMemo, useRef, useState } from "react";
import { useLoadImage } from "../hooks/useLoadImage";
import { classNames } from "../utils/classNames";

export function DissolveInImage({
  src,
  className,
  width,
  height,
  duration = 1500,
  fadeEdges = true,
  ref: _ref,
  ...rest
}: React.HTMLProps<HTMLCanvasElement> & {
  duration?: number;
  fadeEdges?: boolean;
}) {
  const [t, setT] = useState<number>(() => -1);
  const tRef = useRef(t);
  tRef.current = t;
  const lastUpdateRef = useRef<number>();

  const noise = useMemo(() => makeNoise2D(Date.now()), []);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const image = useLoadImage(src, () => {
    setT(() => 0);
  });

  return (
    <img
      src={src}
      className={classNames(
        className,
        "dissolve-in mix-blend-multiply",
        image ? "" : "opacity-0"
      )}
      style={{ transitionDuration: `${duration}ms` }}
    />
  );

  // useEffect(() => {
  //   if (t >= 0 && t <= 1) {
  //     requestAnimationFrame((now) => {
  //       const lastFrame = lastUpdateRef.current ?? now - 16;
  //       const dt = clamp(now - lastFrame, 0, 1000 / 15);
  //       setT((old) => clamp(old + dt / duration));
  //       lastUpdateRef.current = now;

  //       if (canvasRef.current) {
  //         const { width: canvasWidth, height: canvasHeight } =
  //           canvasRef.current;

  //         const ctx = canvasRef.current.getContext("2d", {
  //           willReadFrequently: true,
  //           alpha: true,
  //         });
  //         if (ctx && image) {
  //           ctx.clearRect(0, 0, canvasWidth, canvasHeight);
  //           ctx.drawImage(image, 0, 0);

  //           const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  //           for (let x = 0; x < canvasWidth; x++) {
  //             for (let y = 0; y < canvasHeight; y++) {
  //               const i = (x + y * canvasWidth) * 4;

  //               const cx = (2 * x) / canvasWidth - 1;
  //               const cy = (2 * y) / canvasHeight - 1;

  //               const noiseOctave = 0.02;
  //               const n = 0.5 + noise(x * noiseOctave, y * noiseOctave) * 0.5; // from 0 to 1
  //               const o = 1 - Math.sqrt(cx * cx + cy * cy) / Math.sqrt(2);
  //               const e = !fadeEdges
  //                 ? 0
  //                 : -4 * Math.max(cx * cx, cy * cy) ** 20;

  //               const t2 = smoothStep(t);
  //               imageData.data[i + 3] *= clamp(n * o + e + 2 * t2 - 1);
  //             }
  //           }
  //           ctx.putImageData(imageData, 0, 0);
  //         }
  //       }
  //     });
  //   }
  // }, [t]);

  // return (
  //   <canvas
  //     ref={canvasRef}
  //     width={width}
  //     height={height}
  //     className={classNames("bg-transparent", className)}
  //     {...rest}
  //   />
  // );
}
