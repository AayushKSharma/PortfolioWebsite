import WhiteboardHero from "@/components/sections/WhiteboardHero"
import About from "@/components/sections/About"
import Contact from "@/components/sections/Contact"

export default function Home() {
  return (
    <>
      <WhiteboardHero />
      <main className="max-w-4xl mx-auto px-4 sm:px-6">
        <About />
        <Contact />
      </main>
    </>
  )
}
