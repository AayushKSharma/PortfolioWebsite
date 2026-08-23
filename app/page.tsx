import WhiteboardHero from "@/components/sections/WhiteboardHero"
import About from "@/components/sections/About"
import AboutBoard from "@/components/sections/AboutBoard"
import BoardSwitch from "@/components/board/BoardSwitch"

export default function Home() {
  return (
    <>
      <WhiteboardHero />
      <div id="about">
        <BoardSwitch
          board={
            <main className="mx-auto w-full max-w-[1180px] px-4 sm:px-6 pb-24">
              <AboutBoard />
            </main>
          }
          fallback={
            <main className="max-w-4xl mx-auto px-4 sm:px-6">
              <About />
            </main>
          }
        />
      </div>
    </>
  )
}
