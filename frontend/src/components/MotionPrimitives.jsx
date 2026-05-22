import { motion } from "framer-motion"

export const pageMotion = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, ease: "easeOut" },
}

export const revealMotion = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.5, ease: "easeOut" },
}

export function MotionPage({ children, className = "" }) {
  return (
    <motion.div className={className} {...pageMotion}>
      {children}
    </motion.div>
  )
}

export function Reveal({ children, className = "", delay = 0 }) {
  return (
    <motion.div className={className} {...revealMotion} transition={{ ...revealMotion.transition, delay }}>
      {children}
    </motion.div>
  )
}

export function MotionCard({ children, className = "" }) {
  return (
    <motion.div
      className={className}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      {children}
    </motion.div>
  )
}
