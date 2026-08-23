"use client"

import Link from "next/link"
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
        <h2 className="text-2xl font-bold text-[#2a2117] dark:text-[#ece7da] mb-8">
          About
        </h2>
        <div className="max-w-2xl space-y-4 text-[#3f3428] dark:text-[#b9b2a3] leading-relaxed">
          <p>
            I&apos;m a software engineer based in Dallas, Texas. I greatly enjoy discovering and listening to music (see my work for <Link href="/projects/aotw" style={{ textDecoration: "underline" }}>Album of the Week</Link> or my <a href="https://open.spotify.com/user/meowmaster6400?si=2d52bb77274947b4" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Spotify</a>).  
          </p>
          <p>
            During my mathematics undergrad at Texas A&M University, I was working on <Link href="/projects/aotw" style={{ textDecoration: "underline" }}>Album of the Week</Link>. Now I'm forward deployed in AI systems at <a href="https://valiantresidential.com/" target="_blank" rel="noopener noreferrer"  style={{ textDecoration: "underline" }}>Valiant Residential</a>.
            When I&apos;m not coding, I&apos;m most likely playing Brawl Stars or working on my Obsidian clone.
          </p>
          <p>
            I care a lot about developer experience, backend / systems engineering, and writing software that
            other people actually enjoy using.
          </p>
        </div>
      </motion.div>
    </section>
  )
}
