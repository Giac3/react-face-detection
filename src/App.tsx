import { useEffect, useRef, useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import * as faceapi from '@vladmandic/face-api';
import * as tf from '@tensorflow/tfjs'
function App() {
  const [count, setCount] = useState(0)
  const videoRef = useRef() as React.MutableRefObject<HTMLVideoElement>
  const [playing, setPlaying] = useState(false)

  const startVideo = async () => {
    try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {}
    })
    videoRef.current.srcObject = stream
  } catch (error) {
    console.error(error)
  }
  }

  const StopVideo = () => {
    videoRef.current.srcObject = null
  }

  useEffect(() => {}, [videoRef.current])

  useEffect(() => {
    
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(startVideo)
    
  },[])

  const faceRec = () => {
    setPlaying(true)
    const canvas = faceapi.createCanvasFromMedia(videoRef.current)
    canvas.style.position = "absolute"
    canvas.id = "canvas"
    document.getElementById("hold")!.append(canvas)
    const displaySize = {width: videoRef.current.width, height: videoRef.current.height} 
    faceapi.matchDimensions(canvas, displaySize )
    setInterval(async () => {
      const detections = await faceapi.detectAllFaces(videoRef.current, 
        new faceapi.TinyFaceDetectorOptions()).withFaceLandmarks().withFaceExpressions()
        console.log(detections)
        const resizedDetect = faceapi.resizeResults(detections, displaySize)
        canvas.getContext('2d')?.clearRect(0,0, canvas.width, canvas.height)
        faceapi.draw.drawDetections(canvas,resizedDetect)
    }, 100)
  }

  return (

    <div id='hold' className="bg-gray-5 gap-4 w-screen flex-col h-screen flex items-center justify-center">
      
      <div className='p-4 flex items-center justify-center bg-gray-200 rounded-md'>
        <video onPlay={faceRec} onAbort={() => {setPlaying(false)}} ref={videoRef} className='bg-gray-50' width="1000px" height="800px" autoPlay muted/>
      </div>
      <div className='flex flex-row items-center justify-center gap-4'>
      </div>
    </div>
  )
}

export default App
