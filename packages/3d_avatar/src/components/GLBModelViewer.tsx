import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations } from '@react-three/drei';
import * as THREE from 'three';
import React from 'react';

interface GLBModelViewerProps {
  modelPath: string;
  animationIndex: string;
  onAnimationComplete?: () => void;
  setIsTransitioning: (isTransitioning: boolean) => void;
  transitionDuration?: number;
  play_duration?: number;
  play_index?: number;
  setPlayIndex?: (index: number) => void;
}

export const GLBModelViewer = ({ 
  modelPath, 
  animationIndex,
  onAnimationComplete,
  setIsTransitioning,
  transitionDuration = 0.5,
  play_duration = 5,
  play_index = 0,
  setPlayIndex
}: GLBModelViewerProps) => {
  const group = useRef<THREE.Group>(null);
  const [currentAction, setCurrentAction] = useState<THREE.AnimationAction | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const hasTriggeredTransitionRef = useRef<boolean>(false);
  const isTransitioningRef = useRef<boolean>(false);
  const nextModelAnimation = useRef<THREE.AnimationAction | null>(null);
  const playing_index=useRef<number>(0);
  const fadeStartTimeRef = useRef<number>(0);
  const fadeInProgressRef = useRef<boolean>(false);
  // const [currentPlayIndex, setCurrentPlayIndex] = useState(play_index);
  const currentPlayIndex=play_index;
  


  console.log('GLBModelViewer render - Animation index:', animationIndex, 'Play index:', currentPlayIndex);

  // Load the GLB model and animations
  const { scene, animations } = useGLTF(modelPath);
  const { actions, names } = useAnimations(animations, scene);


  // Debug log when component mounts
  useEffect(() => {
    console.log('=== GLBModelViewer mounted ===');
    console.log('Model path:', modelPath);
    console.log('Animations found:', animations.length);
    console.log('Animation names:', names);
    console.log('Actions available:', Object.keys(actions || {}));
  }, [modelPath, animations, names, actions]);

  useEffect(() => {
    console.log(currentPlayIndex, playing_index.current)
    if (names.length > 0 && actions) {
      // console.log('Available animations:', names);
      if (!names.includes(animationIndex)) {
        // throw new Error(`Animation index "${animationIndex}" not found in model animations.`);
        console.warn(`Animation index "${animationIndex}" not found in model animations.`);
        return;
      }
      console.log('Setting up animation index:', animationIndex, 'Animation name:', animationIndex);
      
      // Get the requested animation
      const action = actions[animationIndex];
      console.log('Retrieved action for animation:', action);
      if (action) {
        nextModelAnimation.current = action;
        // Store mixer reference
        mixerRef.current = action.getMixer();
        
        // If there's a current action and it's different, fade transition
        console.log('Current action:', currentAction ? currentAction.getClip().name : 'None');
        console.log('New action:', action.getClip().name);
        console.log('Is transitioning:', isTransitioningRef.current);
        if (currentAction && !isTransitioningRef.current && (currentPlayIndex !== playing_index.current || (currentPlayIndex === 0 && playing_index.current === 0))) {
          console.log(`Fading from ${currentAction.getClip().name} to ${action.getClip().name}`);
          isTransitioningRef.current = true;
          setIsTransitioning(true); // 通知父组件开始过渡
          // 记录淡化开始时间
          fadeStartTimeRef.current = performance.now();
          fadeInProgressRef.current = true;
          // Fade out current animation
          // currentAction.fadeOut(transitionDuration);
          action.reset();
          action.setDuration(play_duration);
          action.clampWhenFinished = true;
          action.loop = THREE.LoopRepeat;
          action.play();
          currentAction.crossFadeTo(action, transitionDuration, false);
          
          // Set up and fade in new animation

          // action.fadeIn(transitionDuration);
          // Reset transition flag after fade duration
          // setTimeout(() => {
          //   isTransitioningRef.current = false;
          //   setIsTransitioning(false); // 通知父组件过渡完成
          //   setCurrentAction(action);
          //   console.log('Transition completed to animation:', animationIndex);
          // }, transitionDuration * 1000-10);

          playing_index.current = currentPlayIndex;

        } else if (!currentAction) {
          // First animation - just start it
          action.reset();
          action.weight = 1;
          action.clampWhenFinished = true;
          action.loop = THREE.LoopRepeat;
          action.setDuration(play_duration);
          action.play();
          setCurrentAction(action);
          console.log('First animation started:', animationIndex);
          playing_index.current = 0;
          fadeStartTimeRef.current = performance.now();
          fadeInProgressRef.current = false;
          setPlayIndex && setPlayIndex(0);
          // setTimeout(() => {
          //   isTransitioningRef.current = false;
          //   setIsTransitioning(false); // 通知父组件过渡完成
          //   // setCurrentAction(action);
          // }, transitionDuration * 1000);
        }
        
        // Reset transition trigger for progress monitoring
        // hasTriggeredTransitionRef.current = false;
      }
    }
  }, [play_index, actions, names, animationIndex, currentPlayIndex]);

  // Monitor animation progress for triggering next animation at 90%
  useFrame((state, delta) => {
    // Update the animation mixer
    if (mixerRef.current) {
      mixerRef.current.update(delta);
    }

      // 检查淡化是否完成
    if (fadeInProgressRef.current) {
      const elapsed = (performance.now() - fadeStartTimeRef.current) / 1000;
      if (elapsed >= transitionDuration) {
        console.log("CrossFade completed based on elapsed time:", elapsed);
        
        fadeInProgressRef.current = false;
        isTransitioningRef.current = false;
        setIsTransitioning(false);
        
        if (nextModelAnimation.current) {
          setCurrentAction(nextModelAnimation.current);
          console.log('Transition completed to animation:', animationIndex);
        }
      }
    }
    
    // Check animation progress and trigger transition at 90%
    let progress=0;
    if (currentAction ) {
      const duration = currentAction.getClip().duration;
      if (isTransitioningRef.current && nextModelAnimation.current) {
        const currentTime = nextModelAnimation.current.time % duration; // Handle looping
        progress = currentTime / duration;
      }
      else {
        const currentTime = currentAction.time % duration;
        progress = currentTime / duration;
      }

      // console.log(`Current animation progress: ${progress.toFixed(2)}`);
      
      // Trigger transition when animation reaches 90%
      const threshold = 1 - transitionDuration / play_duration;
      // console.log('Transition threshold:', threshold);
      // console.log('Current progress:', progress);
      if (progress >= threshold && !isTransitioningRef.current) {
        // hasTriggeredTransitionRef.current = true;
        // console.log(`Animation reached ${threshold * 100}% (${progress.toFixed(2)}), triggering transition`);
        if (onAnimationComplete) {
          // console.log('Calling onAnimationComplete callback');
          onAnimationComplete();
        }
      }
    }
  });

  return <primitive ref={group} object={scene} scale={1.15} position={[0, -1.75, 0]} />;
};

// Pre-load the model
// useGLTF.preload('/models/RTHK-weather-with-facial.glb');