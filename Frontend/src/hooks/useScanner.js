import { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';

export default function useScanner({ onScan, scanDelay = 500 }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [devices, setDevices] = useState([]);
  const [activeDeviceId, setActiveDeviceId] = useState(null);
  const [error, setError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const animationFrameRef = useRef(null);
  const lastScanTime = useRef(0);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setIsScanning(false);
  }, []);

  const getDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((device) => device.kind === 'videoinput');
      setDevices(videoDevices);
      return videoDevices;
    } catch (err) {
      console.error('Error enumerating devices:', err);
      return [];
    }
  }, []);

  const startStream = useCallback(async (deviceId = null) => {
    stopStream();
    setError(null);
    try {
      const constraints = {
        video: deviceId 
          ? { deviceId: { exact: deviceId } } 
          : { facingMode: 'environment' }
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setHasPermission(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required to tell iOS Safari we don't want fullscreen
        await videoRef.current.play();
        setIsScanning(true);
        setIsPaused(false);
        tick();
      }

      // Update devices list after getting permission
      const videoDevices = await getDevices();
      if (videoDevices.length > 0) {
        const activeTrack = stream.getVideoTracks()[0];
        const activeDevice = videoDevices.find(d => d.label === activeTrack.label);
        if (activeDevice) setActiveDeviceId(activeDevice.deviceId);
        else if (deviceId) setActiveDeviceId(deviceId);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setHasPermission(false);
      setError('Camera access denied or unavailable. Please check permissions.');
    }
  }, [stopStream, getDevices]);

  const switchCamera = useCallback(async (deviceId) => {
    if (deviceId !== activeDeviceId) {
      await startStream(deviceId);
    }
  }, [activeDeviceId, startStream]);

  const tick = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video.readyState === video.HAVE_ENOUGH_DATA && !isPaused) {
      canvas.height = video.videoHeight;
      canvas.width = video.videoWidth;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code) {
        const now = Date.now();
        if (now - lastScanTime.current > scanDelay) {
          lastScanTime.current = now;
          onScan(code.data);
        }
      }
    }
    
    // Only continue the loop if we are still conceptually "scanning"
    // (We keep the loop going even if paused, just skipping the jsQR check, so it can resume instantly)
    if (streamRef.current) {
      animationFrameRef.current = requestAnimationFrame(tick);
    }
  }, [isPaused, onScan, scanDelay]);

  // Handle manual image scan fallback
  const scanImage = useCallback((file) => {
    if (!file) return;
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, img.width, img.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        if (code) {
          onScan(code.data);
        } else {
          setError('No QR code found in the image.');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }, [onScan]);

  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stopStream();
    };
  }, [stopStream]);

  return {
    videoRef,
    canvasRef,
    hasPermission,
    devices,
    activeDeviceId,
    error,
    isScanning,
    isPaused,
    start: startStream,
    stop: stopStream,
    pause,
    resume,
    switchCamera,
    scanImage,
  };
}
