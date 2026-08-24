"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { SKILL_GROUPS } from "@/lib/skills"

export default function Skills() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <div ref={ref} className="mt-20">
      <h2 className="text-2xl font-bold text-neutral-950 dark:text-neutral-100 mb-8">
        Skills
      </h2>
      <div className="grid sm:grid-cols-2 gap-8">
        {SKILL_GROUPS.map((group, i) => (
          <motion.div
            key={group.id}
            initial={{ opacity: 0, y: 24 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
          >
            <h3 className="text-sm font-semibold text-neutral-700 dark:text-neutral-500 uppercase tracking-widest mb-3">
              {group.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1.5 rounded-lg text-sm bg-[var(--chip)] text-neutral-900 dark:text-neutral-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
