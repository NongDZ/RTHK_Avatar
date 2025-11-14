import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF } from '@react-three/drei';
import { GLBModelViewer } from './GLBModelViewer';
import React from 'react';
import { set } from 'react-hook-form';
import { is } from '@react-three/fiber/dist/declarations/src/core/utils';

interface AnimationControllerProps {
  modelPath: string;
  transitionDuration?: number;
  play_duration?: number;
  play_list?: string[];
  play_index?: number;
  setPlayIndex?: (index: number) => void;
}

export const AnimationController = ({ 
  modelPath,
  transitionDuration = 1, // fade duration
  play_duration = 5,
  play_list = [],
  play_index = -1,
  setPlayIndex
}: AnimationControllerProps) => {
  const [currentAnimationIndex, setCurrentAnimationIndex] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const playList = play_list.length > 0 ? play_list : null;
  // const [play_now_index, setPlayNowIndex] = useState(0);
  const { animations } = useGLTF(modelPath);
  const [currentPlayIndex, setCurrentPlayIndex] = useState(play_index);
  useEffect(() => {
    console.log('AnimationController useEffect triggered - modelPath:', modelPath, 'playList:', playList, 'play_index:', play_index);
    // if (play_index == 0) {
    //   console.log('Setting initial play_now_index to play_index:', play_index);
    //   setPlayNowIndex(play_index);
    // }
    if (play_duration / transitionDuration < 5) {
      // Adjust play duration or transition duration as needed
      console.warn('Warning: For smooth transitions, play_duration should be at least 5 times transitionDuration.');
    }
    console.log(play_index);
    if (play_index === 0) {
      console.log('Setting initial play_now_index to play_index:', play_index);
      setCurrentAnimationIndex(
      playList ? playList[0] : (() => {
        return animations.length > 0 ? "default" : "";
      })()
    );
    // if (setPlayIndex) setPlayIndex(play_index);
    setCurrentPlayIndex(0);
    setIsTransitioning(false);
    }
    
    console.log('AnimationController mounted - initial animation index:', currentAnimationIndex);
  }, [currentAnimationIndex, modelPath, playList, play_index, animations, transitionDuration, play_duration]);

  // Handle animation completion (triggered at 90% of animation)
  const handleAnimationComplete = useCallback(() => {
    console.log('=== Animation reached 80%, current index:', currentAnimationIndex, " play_now_index:", currentPlayIndex, " isTransitioning:", isTransitioning);
    
    if (!isTransitioning) {
      // console.log('Total animations available:', animations.length);
      
      setIsTransitioning(true);
      
      // Determine next animation index
      // const nextIndex = currentAnimationIndex < animations.length - 1 ? currentAnimationIndex + 1 : 0;
      let play_now_index_next = 0;
      // if (play_now_index < playList!.length) {
      if (playList && currentPlayIndex < playList.length-1) {
        play_now_index_next = currentPlayIndex + 1;
        if (setPlayIndex) {
          setPlayIndex(play_now_index_next);
        }
        setCurrentPlayIndex(play_now_index_next);
        console.log('Next play_now_index set to:', play_now_index_next);
        
        const nextAnimationName = playList
          ? (play_now_index_next < playList.length ? playList[play_now_index_next] : playList[playList.length - 1])
          : (play_now_index_next < animations.length - 1 ? animations[play_now_index_next].name : animations[0].name);
        console.log('Switching to next animation index:', nextAnimationName, play_now_index_next);
        
        // Directly switch to next animation (fadeOut/fadeIn will handle the transition)
        setCurrentAnimationIndex(nextAnimationName);
      } else {
        console.log('No playList or reached end of playList, looping back to start.');
        // play_now_index_next = currentPlayIndex;
        // setIsTransitioning(false);
      }
     
      

      
      // 不需要在这里设置timeout，因为GLBModelViewer会通过setIsTransitioning通知我们
      // setTimeout(() => {
      //   setIsTransitioning(false);
      // }, transitionDuration * 1000);
    }
  }, [currentAnimationIndex, modelPath, transitionDuration, isTransitioning, currentPlayIndex]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 2], fov: 30 }} >
        <ambientLight intensity={1.5} />
        <directionalLight position={[10, 10, 5]} intensity={1.5} />
        <GLBModelViewer
          modelPath={modelPath}
          animationIndex={currentAnimationIndex}
          onAnimationComplete={handleAnimationComplete}
          setIsTransitioning={setIsTransitioning}
          transitionDuration={transitionDuration}
          play_duration={play_duration}
          play_index={currentPlayIndex}
        />
        {/* <OrbitControls /> */} {/* 可选，启用/禁用轨道控制器 */}
      </Canvas>
    </div>
  );
};
