"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"

export default function About() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} id="about" className="py-24">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
          About
        </h2>
        <div className="max-w-2xl space-y-4 text-neutral-600 dark:text-neutral-400 leading-relaxed">
          <p>
            I&apos;m a software engineer based in Dallas, Texas. I greatly enjoy discovering and listening to music.  
          </p>
          <p>
            Currently working on [blank]. Previously at [blank].
            When I&apos;m not coding, I&apos;m probably [blank].
          </p>
          <p>
            I care a lot about developer experience, clean APIs, and writing software that
            other people actually enjoy working with.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
