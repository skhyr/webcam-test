import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import * as faceapi from "face-api.js";

const Container = styled.div`
  min-height: 100%;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  min-height: 100vh;
  flex-wrap: wrap;
`;

const Canvas = styled.canvas`
  background: #ffffff;
`;

export const Liveness = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const animationFrameRef = useRef<number>();
  const [detection, setDetection] = useState("");

  const snapshot = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    const { videoHeight, videoWidth } = videoRef.current;

    let rectWidth = 0;

    if (dimensions.width < dimensions.height) {
      rectWidth = 0.75 * dimensions.width;
      const x =
        dimensions.height / (videoHeight / videoWidth) - dimensions.width;
      ctx.drawImage(
        videoRef.current,
        -0.5 * x,
        0,
        dimensions.width + x,
        dimensions.height
      );
    } else {
      rectWidth = 0.5 * dimensions.height;
      const x = Math.abs(
        dimensions.width / (videoWidth / videoHeight) - dimensions.height
      );
      ctx.drawImage(
        videoRef.current,
        0,
        -1 * x,
        dimensions.width,
        dimensions.height + x
      );
    }

    const rectHeight = 1.5 * rectWidth;

    ctx.strokeRect(
      (dimensions.width - rectWidth) / 2,
      (dimensions.height - rectHeight) / 2,
      rectWidth,
      rectHeight
    );
    animationFrameRef.current = requestAnimationFrame(snapshot);
  };

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({
        video: {
          facingMode: "user",
        },
        audio: false,
      })
      .then((stream) => {
        if (!videoRef.current) return;
        videoRef.current.srcObject = stream;
        videoRef.current.play();

        if (animationFrameRef.current)
          window.cancelAnimationFrame(animationFrameRef.current);
        snapshot();
      });
  }, [dimensions]);

  useLayoutEffect(() => {
    setDimensions({
      width: containerRef.current!.clientWidth,
      height: containerRef.current!.clientHeight,
    });
  }, [setDimensions]);

  useEffect(() => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ])
      .then(() => {
        setInterval(async () => {
          if (!faceapi) return;
          const res = await faceapi
            .detectAllFaces(
              videoRef.current!,
              new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks()
            .withFaceExpressions();
          setDetection(res[0]?.expressions.asSortedArray()[0].expression);
        }, 200);
      })
      .catch((err) => console.log([err]));
  }, []);

  return (
    <Container ref={containerRef}>
      <h3>{detection || "no detection"}</h3>
      <video
        autoPlay
        ref={videoRef}
        controls
        muted
        loop
        hidden
        playsInline
        onPause={() => videoRef.current?.play()}
      />
      {containerRef.current && (
        <Canvas
          height={dimensions.height}
          width={dimensions.width}
          ref={canvasRef}
        />
      )}
    </Container>
  );
};
