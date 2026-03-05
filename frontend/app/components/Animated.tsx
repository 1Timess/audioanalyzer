"use client"

import { motion } from "framer-motion"
import { ReactNode } from "react"

interface AnimatedProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function FadeUp({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function FadeIn({ children, delay = 0, className }: AnimatedProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  )
}