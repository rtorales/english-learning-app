'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import type { MapNode as MapNodeType } from '@/types'

interface MapNodeProps {
  node: MapNodeType
}

const NODE_SIZE = 70

export function MapNode({ node }: MapNodeProps) {
  const { isCompleted, isCurrent, isUnlocked, isBoss, isCheckpoint } = node

  // Determine visual state
  const getNodeStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      width: NODE_SIZE,
      height: NODE_SIZE,
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column' as const,
      gap: 2,
      cursor: isUnlocked ? 'pointer' : 'default',
      transition: 'transform 120ms ease, box-shadow 120ms ease',
      position: 'relative',
      flexShrink: 0,
    }

    if (isBoss && isCompleted) {
      return { ...base, background: 'var(--accent)', border: '3px solid #d4973a', boxShadow: '0 4px 0 #b37a2a' }
    }
    if (isBoss && isUnlocked) {
      return { ...base, background: 'var(--accent)', border: '3px solid var(--accent-2)', boxShadow: '0 4px 0 var(--accent-2)' }
    }
    if (isBoss) {
      return { ...base, background: 'var(--bg-soft)', border: '3px solid var(--card-ring)', opacity: 0.5 }
    }

    if (isCheckpoint && isCompleted) {
      return { ...base, background: 'var(--sage)', border: '3px solid #5b8a6e', boxShadow: '0 4px 0 #4a7a5e' }
    }
    if (isCheckpoint && isUnlocked) {
      return { ...base, background: 'var(--sage)', border: '3px solid #5b8a6e', boxShadow: '0 4px 0 #4a7a5e' }
    }
    if (isCheckpoint) {
      return { ...base, background: 'var(--bg-soft)', border: '3px solid var(--card-ring)', opacity: 0.5 }
    }

    if (isCompleted) {
      return { ...base, background: 'var(--primary)', border: '3px solid var(--primary-2)', boxShadow: '0 4px 0 var(--primary-2)' }
    }
    if (isCurrent) {
      return { ...base, background: 'var(--primary)', border: '3px solid var(--primary-2)', boxShadow: '0 4px 0 var(--primary-2)' }
    }
    if (isUnlocked) {
      return { ...base, background: 'var(--card)', border: '3px solid var(--primary-soft)', boxShadow: '0 3px 0 var(--card-ring)' }
    }
    // Locked
    return { ...base, background: 'var(--bg-soft)', border: '3px solid var(--card-ring)', opacity: 0.55 }
  }

  const getIcon = () => {
    if (isCompleted) return <CheckIcon />
    if (isBoss) return <TrophyIcon />
    if (isCheckpoint) return <StarIcon />
    if (!isUnlocked) return <LockIcon />
    return <BookIcon color={isCurrent ? '#fff' : 'var(--primary)'} />
  }

  const iconColor = (isCompleted || isCurrent || (isBoss && isUnlocked) || (isCheckpoint && isUnlocked))
    ? '#fff'
    : 'var(--ink-3)'

  const nodeEl = (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <motion.div
        className={isCurrent ? 'node-current' : undefined}
        style={getNodeStyle()}
        whileHover={isUnlocked ? { scale: 1.08 } : undefined}
        whileTap={isUnlocked ? { scale: 0.94 } : undefined}
        title={isUnlocked ? node.title : `Requiere nivel ${node.cefrLevel}`}
      >
        <span style={{ color: iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {getIcon()}
        </span>
        {!isCompleted && !isCurrent && isUnlocked && (
          <span style={{
            fontSize: 9, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase',
            color: 'var(--primary-2)', fontFamily: 'var(--f-sans)',
          }}>
            {node.cefrLevel}
          </span>
        )}
      </motion.div>

      {/* Node label */}
      <div style={{
        width: NODE_SIZE + 20,
        textAlign: 'center',
        overflow: 'hidden',
      }}>
        <p style={{
          fontSize: 11, fontWeight: 700, color: isUnlocked ? 'var(--ink-2)' : 'var(--ink-4)',
          lineHeight: 1.3, fontFamily: 'var(--f-sans)',
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {node.title}
        </p>
        <p style={{ fontSize: 10, color: 'var(--ink-3)', margin: '2px 0 0', fontFamily: 'var(--f-sans)' }}>
          +{node.xpReward} XP
        </p>
      </div>
    </div>
  )

  if (!isUnlocked) return nodeEl

  return (
    <Link href={`/learn/${node.moduleId}`} style={{ textDecoration: 'none', display: 'block' }}>
      {nodeEl}
    </Link>
  )
}

function CheckIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5"/>
    </svg>
  )
}

function TrophyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0z"/>
      <path d="M17 4h3v2a3 3 0 0 1-3 3M7 4H4v2a3 3 0 0 0 3 3"/>
    </svg>
  )
}

function StarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="#fff" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function BookIcon({ color = 'var(--primary)' }: { color?: string }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/>
      <path d="M4 19a2 2 0 0 1 2-2h13"/>
    </svg>
  )
}
