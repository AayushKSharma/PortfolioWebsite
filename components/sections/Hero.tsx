"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { FileText, ArrowRight } from "lucide-react"
import GithubIcon from "@/components/ui/GithubIcon"

function FadeUp({ delay, children, className }: { delay: number; children: React.ReactNode; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Hero() {
  return (
    <section className="min-h-[90vh] flex flex-col justify-center pt-16">
      <div className="space-y-6">
        <FadeUp delay={0}>
          <p className="text-sm font-mono text-blue-500 tracking-wider">Hi, I&apos;m</p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
            Yush
          </h1>
        </FadeUp>

        <FadeUp delay={0.2}>
          <p className="text-xl sm:text-2xl text-neutral-500 dark:text-neutral-400 max-w-2xl leading-relaxed">
            Music-loving Software engineer who loves building on the web.
            <br />
            <span className="text-neutral-700 dark:text-neutral-300">
              TypeScript · PostgreSQL · Express.js
            </span>
          </p>
        </FadeUp>

        <FadeUp delay={0.3}>
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-sm font-medium hover:opacity-80 transition-opacity"
            >
              View Projects
              <ArrowRight size={16} />
            </Link>
            <a
              href="/files/Aayush-Kumar-Sharma_Resume.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <FileText size={16} />
              Resume
            </a>
            <a
              href="https://github.com/AayushKSharma"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 text-sm font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              <GithubIcon size={16} />
              GitHub
            </a>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
