import React, { useEffect } from 'react'
import { AnimationController } from './components/AnimationController'
import { ModelErrorBoundary } from './components/ModelErrorBoundary'
import { useGLTF } from '@react-three/drei'
import ModelPreloader from './utils/ModelPreloader'


export interface AvatarProps {
  modelPath?: string
  transitionDuration?: number
  play_duration?: number
  play_list?: string[]
  play_index?: number
  setPlayIndex?: (index: number) => void
}

function App({
  modelPath = '/models/RTHK-weather-with-facial.glb',
  transitionDuration = 1.0,
  play_duration = 5.0,
  play_list = [],
  play_index = 0,
  setPlayIndex,
}: AvatarProps) {

  // 使用预加载管理器
  useEffect(() => {
    if (modelPath) {
      ModelPreloader.preload(modelPath)
    }
  }, [modelPath])


  return (
    <div className="App">
      <ModelErrorBoundary>
        <AnimationController
          modelPath={modelPath}
          transitionDuration={transitionDuration}
          play_duration={play_duration}
          play_list={play_list}
          play_index={play_index}
          setPlayIndex={setPlayIndex}
        />
      </ModelErrorBoundary>
    </div>
  )
}

export default App
