'use client'

import { Children, type ReactNode } from 'react'
import { motion, type HTMLMotionProps, type Variants, useReducedMotion } from 'motion/react'

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.18, ease: 'easeOut' as const } },
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
      variants={{ hidden: {}, visible: {} }}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? undefined : 'visible'}
    >
      {Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={itemVariants}
          className="h-full"
          initial={reduceMotion ? false : 'hidden'}
          animate={reduceMotion ? undefined : 'visible'}
        >
          {child}
        </motion.div>
      ))}
    </motion.section>
  )
}
