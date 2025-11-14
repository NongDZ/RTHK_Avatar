"use client"
import React, { useEffect, useState } from "react"
// Import the avatar App component from the package
// Path is relative to this file: app/components -> ../../packages/3d_avatar/src/App
import AvatarApp from "../../packages/3d_avatar/src/App"
import PhrasesMapFree from "../../packages/3d_avatar/src/utils/segmenter"

type Props = {
  ids: string[]
  onPlayIndexChange: (index: number) => void
}

export default function AvatarClient({ ids, onPlayIndexChange }: Props) {
  const [loading, setLoading] = useState(false)
  const [playList, setPlayList] = useState<string[] | null>()
  const [playIndex, setPlayIndex] = useState(0)
   // 当 playIndex 变化时调用回调函数
  const handleSetPlayIndex = (index: number) => {
    setPlayIndex(index)
    if (onPlayIndexChange) {
      onPlayIndexChange(index)
    }
  }

  useEffect(() => {
    if (!ids || ids.length === 0) {
      setPlayList(["default"])
      return
    }

    let cancelled = false
    function getRandomInt(max: number) {
      return Math.floor(Math.random() * max);
    }
    const run = async () => {
      setLoading(true)
      try {
        if (!cancelled && !loading) {
          console.log("ids:",ids)
          setPlayList(ids)
          setPlayIndex(0)
        }
      } catch (e) {
        console.error('AvatarClient segmentation error', e)
        setPlayIndex(0)
        if (!cancelled) setPlayList(["default"])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    run()

    return () => {
      cancelled = true
    }
  }, [ids])

  // Loading UI while converting the sentence -> play_list
  // if (loading) {
  //   return (
  //     <div className="w-full h-full flex items-center justify-center bg-black/10">
  //       <div className="animate-spin rounded-full h-12 w-12 border-4 border-t-red-500 border-gray-200" />
  //     </div>
  //   )
  // }

  // If we have a computed playList, render the AvatarApp with it; otherwise show placeholder
  return (
    <div className="w-full h-full">
      {playList && playList.length > 0 ? (
        <AvatarApp play_list={playList} play_index={playIndex} setPlayIndex={handleSetPlayIndex} 
        play_duration={2.5} transitionDuration={0.5}/>
      ) : (
        <div className="w-full h-full flex items-center justify-center text-slate-500">
          <div>No matching animations found for the sentence.</div>
        </div>
      )}
      {loading ? (
        <div className="absolute top-2 right-2 p-2 bg-black/50 rounded-full" style={{ pointerEvents: 'none', position: 'absolute', top: '50%', right: '50%' }}>
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-t-red-500 border-gray-200" />
        </div>
      ) : (
        <></>
      )}
    </div>
  )
}
