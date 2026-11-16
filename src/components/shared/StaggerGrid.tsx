'use client'

import { Children, type ReactNode } from 'react'
import { motion, type HTMLMotionProps, type Variants, useReducedMotion } from 'motion/react'

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
} satisfies Variants

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2, ease: 'easeOut' as const } },
} satisfies Variants

type StaggerGridProps = HTMLMotionProps<'section'> & {
  children: ReactNode
}

export function StaggerGrid({ children, className, ...props }: StaggerGridProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.section
      {...props}
      className={className}
      variants={containerVariants}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? undefined : 'visible'}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="h-full"
          initial={reduceMotion ? false : undefined}
          animate={reduceMotion ? undefined : undefined}
        >
          {child}
        </motion.div>
      ))}
    </motion.section>
  )
}
