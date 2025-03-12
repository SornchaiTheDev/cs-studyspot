import { RecordingType } from "@/types/recording-types";
import { ChangeEvent, useEffect, useRef, useState } from "react";

interface DeviceInfo {
  name: string;
  id: string;
}

export const useRecorder = () => {
  const [cameras, setCameras] = useState<DeviceInfo[]>([]);
  const [microphones, setMicrophones] = useState<DeviceInfo[]>([]);
  const [selectedType, setSelectedType] = useState<RecordingType | null>(null);
  const [selectedCamera, setSelectedCamera] = useState<MediaStream | null>(
    null,
  );
  const [selectedMicrophone, setSelectedMicrophone] =
    useState<MediaStream | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<MediaStream | null>(
    null,
  );

  // Gathering Devices part
  useEffect(() => {
    const getDevices = async () => {
      // request permission from user and then get devices list
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const devices = await navigator.mediaDevices.enumerateDevices();

      // extract camera from the devices list
      const cameras = devices
        .filter((device) => device.kind === "videoinput")
        .map((d) => ({ name: d.label, id: d.deviceId }));
      setCameras(cameras);

      // extract microphone from the devices list
      const microphones = devices
        .filter((device) => device.kind === "audioinput")
        .map((d) => ({ name: d.label, id: d.deviceId }));
      setMicrophones(microphones);

      // stop the stream
      stream.getTracks().forEach((track) => track.stop());
    };
    getDevices();
  }, []);

  const handleSelectCamera = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "none") return;

    if (value === "off") {
      selectedCamera?.getTracks().forEach((track) => track.stop());
      setSelectedCamera(null);
      return;
    }

    const cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: value } },
    });

    setSelectedCamera(cameraStream);
  };

  const handleSelectMicrophone = async (e: ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === "none") return;

    if (value === "off") {
      setSelectedMicrophone(null);
      selectedMicrophone?.getTracks().forEach((track) => track.stop());
      return;
    }

    const microphoneStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: value } },
    });

    setSelectedMicrophone(microphoneStream);
  };

  const handleSelectScreen = async () => {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true,
    });

    setSelectedScreen(screenStream);
  };

  // Record Part
  const [isRecording, setIsRecording] = useState(false);
  const [recordedStartedTime, setRecordedStartedTime] = useState<Date | null>(
    null,
  );
  const [elapsedTime, setElapsedTime] = useState<string>("00:00:00");
  const [recorder, setRecorder] = useState<MediaRecorder | null>(null);

  const mainScreenRef = useRef<HTMLVideoElement>(null);
  const subScreenRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (recordedStartedTime === null) return;

    const getElapsedTime = (startedAt: Date) => {
      const now = Date.now();
      const elapsed = (now - startedAt.getTime()) / 1000;
      const hour = Math.floor(elapsed / 3600);
      const minutes = Math.floor((elapsed % 3600) / 60);
      const seconds = Math.floor(elapsed % 60);

      return `${hour.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    };

    const interval = setInterval(() => {
      setElapsedTime(getElapsedTime(recordedStartedTime));
    }, 1000);

    return () => clearInterval(interval);
  }, [recordedStartedTime]);

  const handleRecording = () => {
    if (!isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    setIsRecording((prev) => !prev);
  };

  // Thanks ChatGPT
  const startRecording = () => {
    setRecordedStartedTime(new Date());

    const VIDEO_WIDTH = 1280;
    const VIDEO_HEIGHT = 720;

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = VIDEO_WIDTH;
    canvas.height = VIDEO_HEIGHT;

    const audioContext = new AudioContext();
    const destination = audioContext.createMediaStreamDestination();

    const screenAudio = selectedScreen?.getAudioTracks()[0];
    if (screenAudio) {
      const audio = audioContext.createMediaStreamSource(
        new MediaStream([screenAudio]),
      );
      audio.connect(destination);
    }

    const microphoneAudio = selectedMicrophone?.getAudioTracks()[0];
    if (microphoneAudio) {
      const audio = audioContext.createMediaStreamSource(
        new MediaStream([microphoneAudio]),
      );
      audio.connect(destination);
    }

    const hasAudioSources = screenAudio || microphoneAudio;

    const drawFrame = () => {
      if (ctx === null) return;

      // Draw the main screen (background)
      if (mainScreenRef.current !== null) {
        ctx.drawImage(mainScreenRef.current, 0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      }

      // Draw the sub-screen (camera) with a circular shape
      if (subScreenRef.current !== null) {
        const camSize = 100; // Circle diameter
        const camX = canvas.width - camSize - 20; // Bottom-right corner
        const camY = canvas.height - camSize - 20;

        const video = subScreenRef.current;
        const videoAspect = video.videoWidth / video.videoHeight;

        let cropWidth = video.videoWidth;
        let cropHeight = video.videoHeight;

        if (videoAspect > 1) {
          // Wider than tall (landscape) → Crop horizontally
          cropWidth = cropHeight * videoAspect;
        } else {
          // Taller than wide (portrait) → Crop vertically
          cropHeight = cropWidth / videoAspect;
        }

        // Save the current context state
        ctx.save();

        // Create a circular clipping path
        ctx.beginPath();
        ctx.arc(
          camX + camSize / 2, // Center X
          camY + camSize / 2, // Center Y
          camSize / 2, // Radius
          0,
          Math.PI * 2,
        );
        ctx.clip(); // Apply circular mask

        // Draw the camera feed inside the clipped circle, maintaining aspect ratio
        ctx.drawImage(
          video,
          (video.videoWidth - cropWidth) / 2, // Crop X
          (video.videoHeight - cropHeight) / 2, // Crop Y
          cropWidth, // Crop width
          cropHeight, // Crop height
          camX, // Position X on canvas
          camY, // Position Y on canvas
          camSize, // Fit to circle diameter
          camSize,
        );

        // Restore the original context state (remove clipping)
        ctx.restore();
      }
    };

    const interval = setInterval(() => drawFrame(), 1000 / 30);

    const canvasStream = canvas.captureStream(30);
    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...(hasAudioSources ? destination.stream.getAudioTracks() : []),
    ]);

    const recorder = new MediaRecorder(combinedStream);
    setRecorder(recorder);

    recorder.ondataavailable = (e) => {
      const blob = new Blob([e.data], { type: "video/webm" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "recording.webm";
      a.click();
      URL.revokeObjectURL(url);
    };

    recorder.start();

    recorder.onstop = () => clearInterval(interval);
  };

  const stopRecording = () => {
    if (recorder === null) return;
    setRecordedStartedTime(null);
    setElapsedTime("00:00:00");
    recorder.stop();
  };

  useEffect(() => {
    if (mainScreenRef.current === null || subScreenRef.current === null) return;
    if (selectedType === "Screen + Cam") {
      mainScreenRef.current.srcObject = selectedScreen;
      mainScreenRef.current.play();

      if (selectedCamera !== null) {
        subScreenRef.current.srcObject = selectedCamera;
        subScreenRef.current.play();
      }
    }

    if (selectedType === "Screen") {
      mainScreenRef.current.srcObject = selectedScreen;
      mainScreenRef.current.play();

      subScreenRef.current.srcObject = null;
      subScreenRef.current.pause();
    }
    if (selectedType === "Camera") {
      mainScreenRef.current.srcObject = selectedCamera;
      mainScreenRef.current.play();

      subScreenRef.current.srcObject = null;
      subScreenRef.current.pause();
    }
  }, [selectedType, selectedCamera, selectedScreen]);

  const handleSelectType = setSelectedType;

  return {
    selectedType,
    cameras,
    microphones,
    handleSelectType,
    handleSelectCamera,
    handleSelectMicrophone,
    handleSelectScreen,
    handleRecording,
    mainScreenRef,
    subScreenRef,
    isRecording,
    elapsedTime,
  };
};
