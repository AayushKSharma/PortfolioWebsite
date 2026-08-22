"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Linkedin, Mail } from "lucide-react"
import GithubIcon from "@/components/ui/GithubIcon"

const links = [
  {
    label: "Email",
    href: "mailto:aayushksharma1@gmail.com",
    icon: Mail,
    display: "aayushksharma1@gmail.com",
  },
  {
    label: "GitHub",
    href: "https://github.com/AayushKSharma",
    icon: GithubIcon,
    display: "github.com/AayushKSharma",
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/aayush-k-sharma/",
    icon: Linkedin,
    display: "linkedin.com/in/aayush-k-sharma/",
  },
]

export default function Contact() {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })

  return (
    <section ref={ref} id="contact" className="py-24 border-t border-[rgba(58,44,26,.28)] dark:border-[rgba(236,231,218,.28)]">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h2 className="text-2xl font-bold text-[#2a2117] dark:text-[#ece7da] mb-4">
          Get in touch
        </h2>
        <p className="text-[#3f3428] dark:text-[#b9b2a3] mb-8 max-w-md">
          I&apos;m always open to interesting conversations and opportunities. Also feel free to reach out about anything you find cool! I love listening to passionate people.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">

          
          {links.map(({ label, href, icon: Icon, display }) => (
            <a
              key={label}
              href={href}
              target={href.startsWith("mailto") ? undefined : "_blank"}
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[rgba(58,44,26,.28)] dark:border-[rgba(236,231,218,.28)] text-[#3f3428] dark:text-[#b9b2a3] hover:text-[#2a2117] dark:hover:text-[#ece7da] hover:border-[rgba(58,44,26,.55)] dark:hover:border-[rgba(236,231,218,.55)] transition-colors text-sm"
            >
              <Icon size={16} />
              {display}
            </a>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
