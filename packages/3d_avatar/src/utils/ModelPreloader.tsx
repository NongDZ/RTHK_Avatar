import { useGLTF } from '@react-three/drei'

class ModelPreloader {
  private static preloadedModels = new Set<string>()
  
  static preload(modelPath: string): void {
    if (!this.preloadedModels.has(modelPath)) {
      useGLTF.preload(modelPath)
      this.preloadedModels.add(modelPath)
      console.log('Preloaded model:', modelPath)
    }
  }
  
  static isPreloaded(modelPath: string): boolean {
    return this.preloadedModels.has(modelPath)
  }
  
  static clear(): void {
    this.preloadedModels.clear()
  }
}

export default ModelPreloader