import WhiteboardHero from "@/components/sections/WhiteboardHero"
import AboutBoard from "@/components/sections/AboutBoard"

export default function Home() {
  return (
    <>
      <WhiteboardHero />
      <div id="about">
        <main className="mx-auto w-full max-w-[1180px] px-[14px] sm:px-6 pb-24">
          <AboutBoard />
        </main>
      </div>
    </>
  )
}
