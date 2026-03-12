import Hero from "@/components/sections/Hero"
import About from "@/components/sections/About"
import Contact from "@/components/sections/Contact"

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6">
      <Hero />
      <About />
      <Contact />
    </main>
  )
}
