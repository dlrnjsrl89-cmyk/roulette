'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Gift, Lock, Unlock, ExternalLink, CheckCircle2, Sparkles } from 'lucide-react'
import confetti from 'canvas-confetti'

// Types
type AppState = 'IDLE' | 'SPINNING' | 'WON_LOCKED' | 'COUPON_ACTIVE'

interface Prize {
  id: number
  name: string
  nameKo: string
  color: string
  probability: number
  angle: number
}

interface StoredData {
  prizeResult: Prize | null
  timestamp: number
  isUnlocked: boolean
}

// Prize configuration with weighted probabilities
const PRIZES: Prize[] = [
  { id: 1, name: 'Canned Soda', nameKo: '캔 음료(or 1,000원 할인)', color: '#FF6B6B', probability: 80, angle: 0 },
  { id: 2, name: '2,000 KRW Discount', nameKo: '2,000원 할인', color: '#4ECDC4', probability: 15, angle: 120 },
  { id: 3, name: '3000 KRW Discount', nameKo: '3,000원 할인', color: '#FFD93D', probability: 5, angle: 240 },
]

// Naver Place URL (placeholder)
const NAVER_REVIEW_URL = 'https://naver.me/xOmvlCzr'

// LocalStorage key
const STORAGE_KEY = 'roulette_data'

// Weighted random selection
function selectPrize(): Prize {
  const random = Math.random() * 100
  let cumulative = 0

  for (const prize of PRIZES) {
    cumulative += prize.probability
    if (random <= cumulative) {
      return prize
    }
  }

  return PRIZES[0] // Fallback
}

// Confetti effect
function triggerConfetti() {
  const duration = 3000
  const end = Date.now() + duration

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0, y: 0.7 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#5D4037'],
    })
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1, y: 0.7 },
      colors: ['#FF6B6B', '#4ECDC4', '#FFD93D', '#5D4037'],
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  }
  frame()
}

export default function RoulettePage() {
  const [appState, setAppState] = useState<AppState>('IDLE')
  const [selectedPrize, setSelectedPrize] = useState<Prize | null>(null)
  const [rotation, setRotation] = useState(0)
  const [isClient, setIsClient] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    const stored = localStorage.getItem(STORAGE_KEY)

    if (stored) {
      try {
        const data: StoredData = JSON.parse(stored)
        if (data.prizeResult) {
          setSelectedPrize(data.prizeResult)
          if (data.isUnlocked) {
            setAppState('COUPON_ACTIVE')
          } else {
            setAppState('WON_LOCKED')
          }
        }
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Trigger confetti when coupon becomes active
  useEffect(() => {
    if (appState === 'COUPON_ACTIVE' && isClient) {
      triggerConfetti()
    }
  }, [appState, isClient])

  // Save to localStorage
  const saveToStorage = useCallback((prize: Prize, unlocked: boolean) => {
    const data: StoredData = {
      prizeResult: prize,
      timestamp: Date.now(),
      isUnlocked: unlocked,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [])

  // Spin the wheel
  const handleSpin = useCallback(() => {
    if (appState !== 'IDLE') return

    setAppState('SPINNING')
    const prize = selectPrize()
    setSelectedPrize(prize)

    // Calculate target rotation (multiple full rotations + prize angle)
    const prizeIndex = PRIZES.findIndex(p => p.id === prize.id)
    const segmentAngle = 360 / PRIZES.length
    const targetAngle = 360 - (prizeIndex * segmentAngle) - (segmentAngle / 2)
    const totalRotation = rotation + 360 * 5 + targetAngle // 5 full rotations

    setRotation(totalRotation)

    // After animation ends
    setTimeout(() => {
      setAppState('WON_LOCKED')
      saveToStorage(prize, false)
    }, 3000)
  }, [appState, rotation, saveToStorage])

  // Handle review button click
  const handleReviewClick = useCallback(() => {
    if (selectedPrize) {
      saveToStorage(selectedPrize, true)
      setAppState('COUPON_ACTIVE')
      window.open(NAVER_REVIEW_URL, '_blank')
    }
  }, [selectedPrize, saveToStorage])

  // Reset function (for testing - can be removed in production)
  const handleReset = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setAppState('IDLE')
    setSelectedPrize(null)
    setRotation(0)
  }, [])

  if (!isClient) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-beige">
        <div className="animate-pulse text-wood-dark">로딩 중...</div>
      </div>
    )
  }

  return (
    <main className="relative min-h-[100dvh] flex flex-col items-center justify-center px-4 py-8 z-10">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-wood-dark mb-2">
          리뷰 이벤트
        </h1>
        <p className="text-wood-medium text-sm">
          룰렛 돌리고 선물 받아가세요!
        </p>
      </div>

      {/* Roulette Wheel */}
      <div className="relative mb-8">
        {/* Pointer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
          <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-wood-dark drop-shadow-lg" />
        </div>

        {/* Wheel */}
        <motion.div
          className="relative w-72 h-72 rounded-full shadow-2xl overflow-hidden"
          style={{
            background: `conic-gradient(
              ${PRIZES[0].color} 0deg 120deg,
              ${PRIZES[1].color} 120deg 240deg,
              ${PRIZES[2].color} 240deg 360deg
            )`,
          }}
          animate={{ rotate: rotation }}
          transition={{
            duration: 3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* Prize Labels */}
          {PRIZES.map((prize, index) => {
            const angle = index * 120 + 60 // Center of each segment
            return (
              <div
                key={prize.id}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  transform: `rotate(${angle}deg)`,
                }}
              >
                <span
                  className="absolute text-white font-bold text-sm drop-shadow-md"
                  style={{
                    transform: `translateY(-100px) rotate(0deg)`,
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  {prize.nameKo}
                </span>
              </div>
            )
          })}

          {/* Center Circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-white shadow-inner flex items-center justify-center">
            <Gift className="w-8 h-8 text-wood-dark" />
          </div>
        </motion.div>
      </div>

      {/* Spin Button - Only show in IDLE state */}
      {appState === 'IDLE' && (
        <motion.button
          onClick={handleSpin}
          className="bg-accent-orange text-white font-bold py-4 px-10 rounded-full text-xl shadow-lg hover:shadow-xl transition-shadow"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-6 h-6" />
            돌려서 선물 받기!
          </span>
        </motion.button>
      )}

      {/* Spinning State */}
      {appState === 'SPINNING' && (
        <div className="text-wood-dark font-bold text-xl animate-pulse">
          행운을 빕니다...
        </div>
      )}

      {/* Won Modal - WON_LOCKED State */}
      <AnimatePresence>
        {appState === 'WON_LOCKED' && selectedPrize && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="text-center">
                <div className="text-4xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-wood-dark mb-2">
                  축하합니다!
                </h2>
                <p className="text-wood-medium mb-6">
                  <span className="font-bold" style={{ color: selectedPrize.color }}>
                    {selectedPrize.nameKo}
                  </span>
                  에 당첨되셨습니다!
                </p>

                {/* Locked Coupon Preview */}
                <div
                  className="relative bg-gray-100 rounded-2xl p-6 mb-6 opacity-60"
                  style={{ borderColor: selectedPrize.color, borderWidth: 3 }}
                >
                  <div className="absolute top-2 right-2">
                    <Lock className="w-6 h-6 text-gray-400" />
                  </div>
                  <div className="text-6xl mb-2">🎁</div>
                  <div className="font-bold text-xl text-gray-600">
                    {selectedPrize.nameKo}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    리뷰 작성 후 사용 가능
                  </div>
                </div>

                {/* Review Button */}
                <motion.button
                  onClick={handleReviewClick}
                  className="w-full bg-[#03C75A] text-white font-bold py-4 px-6 rounded-full text-lg shadow-lg flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ExternalLink className="w-5 h-5" />
                  네이버 리뷰 작성하고 쿠폰 받기
                </motion.button>

                <p className="text-xs text-gray-400 mt-4">
                  리뷰 작성 페이지로 이동합니다
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Coupon - COUPON_ACTIVE State */}
      <AnimatePresence>
        {appState === 'COUPON_ACTIVE' && selectedPrize && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-0 bg-gradient-to-b from-ivory to-beige flex items-center justify-center z-40 px-4"
          >
            <div className="text-center max-w-sm w-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5, delay: 0.2 }}
                className="mb-6"
              >
                <CheckCircle2 className="w-20 h-20 mx-auto text-accent-mint" />
              </motion.div>

              <h2 className="text-2xl font-bold text-wood-dark mb-2">
                쿠폰이 활성화되었습니다!
              </h2>
              <p className="text-wood-medium mb-8">
                직원에게 이 화면을 보여주세요
              </p>

              {/* Active Coupon Card */}
              <motion.div
                className="bg-white rounded-3xl p-8 shadow-2xl pulse-glow"
                style={{ borderColor: selectedPrize.color, borderWidth: 4 }}
                animate={{
                  scale: [1, 1.02, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Unlock className="w-6 h-6 text-accent-mint" />
                  <span className="text-accent-mint font-bold">사용 가능</span>
                </div>

                <div className="text-7xl mb-4">
                  {selectedPrize.id === 1 ? '🥤' : selectedPrize.id === 2 ? '💰' : '🥟'}
                </div>

                <div
                  className="font-bold text-3xl mb-2"
                  style={{ color: selectedPrize.color }}
                >
                  {selectedPrize.nameKo}
                </div>

                <div className="text-wood-medium text-sm">
                  당첨 쿠폰
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-xs text-gray-400">
                    * 1회 사용 가능
                  </div>
                  <div className="text-xs text-gray-400">
                    * 다른 쿠폰과 중복 사용 불가
                  </div>
                </div>
              </motion.div>

              {/* Reset Button (for testing) */}
              <button
                onClick={handleReset}
                className="mt-8 text-sm text-gray-400 underline"
              >
                (테스트용) 초기화
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-wood-light">
        리뷰 작성 이벤트
      </div>
    </main>
  )
}
