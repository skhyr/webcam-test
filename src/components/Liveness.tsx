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
  > h3 {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    text-align: center;
  }
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
  const isCalculated = useRef(false);
  const isVertical = useRef(true);
  const x = useRef(2);

  const snapshot = async () => {
    if (!canvasRef.current || !videoRef.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    if (!isCalculated.current && dimensions.width) {
      isCalculated.current = true;
      const { videoHeight, videoWidth } = videoRef.current;
      console.log(dimensions);
      if (dimensions.width < dimensions.height) {
        console.log("isVertical.current = true");
        x.current =
          dimensions.height / (videoHeight / videoWidth) - dimensions.width;
        isVertical.current = true;
      } else {
        console.log("isVertical.current = false");
        isVertical.current = false;
        x.current = Math.abs(
          dimensions.width / (videoWidth / videoHeight) - dimensions.height
        );
      }
    }
    if (isVertical.current) {
      ctx.drawImage(
        videoRef.current,
        -0.5 * x.current,
        0,
        dimensions.width + x.current,
        dimensions.height
      );
    } else {
      ctx.drawImage(
        videoRef.current,
        0,
        -1 * x.current,
        dimensions.width,
        dimensions.height + x.current
      );
    }
    setTimeout(snapshot);
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
        videoRef.current.play().then(snapshot);

        // if (animationFrameRef.current)
        //   window.cancelAnimationFrame(animationFrameRef.current);
        // snapshot();
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
