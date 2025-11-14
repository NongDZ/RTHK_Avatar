"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Play, Volume2, RotateCcw } from "lucide-react"
import Image from "next/image"
import dynamic from 'next/dynamic'
import PhrasesMapFree from "../packages/3d_avatar/src/utils/segmenter"

const AvatarClient = dynamic(() => import('./components/AvatarClient'), { ssr: false })

export default function HomePage() {
  const [inputText, setInputText] = useState("")
  const [translation, setTranslation] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [ids_array, setIds_array] = useState<string[]>([])
  const [segments_for_show, setSegments_for_show] = useState<{ text: string; id: string }[]>([])
  const [currentPlayIndex, setCurrentPlayIndex] = useState(0) // 当前播放索引

  const handleTranslate = async () => {
    if (!inputText.trim()) return

    setIsTranslating(true)
    
    try {

        if (!inputText || inputText.trim().length === 0) {
            return
          }

      
        // Fetch the word DB that we copied to public/assets
        const res = await fetch('/assets/word_db_rthk.txt')
        if (!res.ok) throw new Error('Failed to load word DB')
        const dbText = await res.text()

        const phrases = new PhrasesMapFree(dbText)
        const segments = phrases.sentenceSegment(inputText)

        // Convert segments to play_list (use matched ids only)
        
        console.log("segments:",segments)
        const ids: string[] = []
        const segs_for_show: { text: string; id: string }[] = []
        for (const seg of segments) {
          if (seg.id && seg.id !== 'none') {
            // Ensure ID is zero-padded to 3 digits if numeric-like (to match existing IDs like '001')
            const asNum = Number(seg.id)
            const idStr = !isNaN(asNum) ? asNum.toString().padStart(3, '0') : seg.id
            ids.push(idStr)
            segs_for_show.push({ text: seg.str, id: idStr })
          }
        }
        ids.push("default") // Always add default at the end
        segs_for_show.push({ text: "。", id: "default" })
        setIds_array(ids)
        setSegments_for_show(segs_for_show)
        handlePlayIndexChange(0)

        // const response = await fetch('/translation/grammar-translation', {
        //   method: 'POST',
        //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ text: inputText }),
      // })
      
      // if (!response.ok) {
      //   const error = await response.json()
      //   throw new Error(error.detail || 'Translation failed')
      // }
      
      // const data = await response.json()
      setTranslation(inputText)
    } catch (error) {
      console.error('Translation error:', error)
      // setTranslation('翻譯出錯，請再試一遍')
      setTranslation(inputText)
    } 
    finally {
      setIsTranslating(false)
    }
  }

  const handleClear = () => {
    setInputText("")
    setTranslation("")
  }

  // 处理播放索引变化的回调
  const handlePlayIndexChange = (index: number) => {
    console.log('Current play index changed to:', index)
    setCurrentPlayIndex(index)
  }

  // 渲染带高亮的分段文字
  const renderHighlightedSegments = () => {
    return segments_for_show.map((segment, index) => (
      <span
        key={index}
        className={`inline-block px-2 py-1 mx-1 rounded transition-colors duration-300 ${
          index === currentPlayIndex 
            ? index === segments_for_show.length - 1 ? 'bg-green-100 text-green-800' : 'bg-yellow-300 text-black font-semibold' // 当前播放的分段高亮
            : index < currentPlayIndex
            ? 'bg-green-100 text-green-800' // 已播放的分段
            : 'bg-gray-100 text-gray-700' // 未播放的分段
        }`}
      >
        {segment.text}
      </span>
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Image src="/images/rthk-logo.png" alt="RTHK Logo" width={120} height={60} className="rounded-lg" />
            </div>
            <div className="text-center flex-1 ml-8">
              <h1 className="text-3xl font-bold text-slate-800 mb-2">Hong Kong Sign Language Translation</h1>
              <p className="text-slate-600">Translate Chinese text to Hong Kong Sign Language</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-5 gap-8 h-full">
          {/* Left Side - Input and Translation (40% width) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Input Section */}
            <Card className="rounded-2xl border-slate-200 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  Chinese Text Input
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="輸入中文文字..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-32 rounded-xl border-slate-200 focus:border-red-400 focus:ring-red-400/20 resize-none text-lg"
                />
                <div className="flex gap-3">
                  <Button
                    onClick={handleTranslate}
                    disabled={!inputText.trim() || isTranslating}
                    className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium py-3"
                  >
                    {isTranslating ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Translating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Play className="w-4 h-4" />
                        Translate
                      </div>
                    )}
                  </Button>
                  <Button
                    onClick={handleClear}
                    variant="outline"
                    className="rounded-xl border-slate-300 hover:bg-slate-50 bg-transparent"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200 shadow-lg bg-white/90 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  Hong Kong Sign Language
                  <span className="ml-auto text-sm text-gray-500">
                  ({currentPlayIndex + 1}/{segments_for_show.length})
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 min-h-24">
                  {translation ? (
                    <div className="space-y-3">
                      <div className="text-slate-700 text-lg leading-relaxed">
                        {renderHighlightedSegments()}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-slate-300 hover:bg-slate-100 bg-transparent"
                      >
                        <Volume2 className="w-4 h-4 mr-2" />
                        Play Audio
                      </Button>
                    </div>
                  ) : (
                    <p className="text-slate-500 italic">Translation will appear here...</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Side - Video Container (60% width) */}
          <div className="lg:col-span-3">
            <Card className="rounded-2xl border-slate-200 shadow-lg bg-white/90 backdrop-blur-sm sticky top-24 h-full">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-700 flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  Sign Language Video
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden">
                  {translation != null ? (
                    // When a translation exists, render the 3D avatar client component
                    <div className="w-full h-full">
                      <AvatarClient ids={ids_array} 
                      onPlayIndexChange={handlePlayIndexChange}
                      />
                    </div>
                  ) : (
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 bg-slate-400 rounded-full flex items-center justify-center mx-auto">
                        <Play className="w-8 h-8 text-white ml-1" />
                      </div>
                      <p className="text-slate-500 font-medium">Video will appear after translation</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
