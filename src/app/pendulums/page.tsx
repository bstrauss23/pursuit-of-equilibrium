import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PendulumsInterviewVideo } from "@/components/pendulums-interview-video";
import { PendulumsSystemSection } from "@/components/pendulums-system-section";

const perfectionTabs = [
  { name: "Emergent", images: [1, 2, 3, 4] },
  { name: "Forming", images: [1, 2, 3, 4] },
  { name: "Proficient", images: [1, 2, 3, 4] },
  { name: "Notable", images: [1, 2, 3, 4] },
  { name: "Advanced", images: [1, 2, 3, 4] },
  { name: "Superior", images: [1, 2, 3, 4] },
  { name: "Perfect", images: [1, 2, 3, 4] },
];

function Figure({
  src,
  alt,
  caption,
}: {
  src: string;
  alt: string;
  caption: string;
}) {
  return (
    <figure className="my-8 space-y-3">
      <div className="w-full shadow-[0_2px_5px_#0003]">
        <Image
          src={src}
          alt={alt}
          width={2400}
          height={1350}
          className="block h-auto w-full object-contain"
        />
      </div>
      <figcaption className="text-sm text-muted-foreground">{caption}</figcaption>
    </figure>
  );
}

function SectionDivider() {
  return (
    <div aria-hidden className="my-[calc(var(--section-gap)/2)] w-full px-4 md:px-6">
      <div className="h-px w-full bg-gradient-to-r from-transparent via-foreground/35 to-transparent" />
    </div>
  );
}

export default function PendulumsPage() {
  return (
    <section className="relative -mx-4 -mt-8 flex flex-col items-start justify-start overflow-x-clip md:-mx-6">
      <div className="relative h-[min(50vh,100vw)] w-full md:h-[min(85vh,100vw)]">
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            WebkitMaskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 24%, rgba(0,0,0,0.995) 30%, rgba(0,0,0,0.985) 36%, rgba(0,0,0,0.965) 43%, rgba(0,0,0,0.93) 51%, rgba(0,0,0,0.875) 60%, rgba(0,0,0,0.79) 69%, rgba(0,0,0,0.66) 78%, rgba(0,0,0,0.48) 86%, rgba(0,0,0,0.24) 93%, rgba(0,0,0,0.08) 97%, rgba(0,0,0,0) 100%)",
            maskImage:
              "linear-gradient(to bottom, rgba(0,0,0,1) 24%, rgba(0,0,0,0.995) 30%, rgba(0,0,0,0.985) 36%, rgba(0,0,0,0.965) 43%, rgba(0,0,0,0.93) 51%, rgba(0,0,0,0.875) 60%, rgba(0,0,0,0.79) 69%, rgba(0,0,0,0.66) 78%, rgba(0,0,0,0.48) 86%, rgba(0,0,0,0.24) 93%, rgba(0,0,0,0.08) 97%, rgba(0,0,0,0) 100%)",
          }}
        >
          <Image
            src="/temp-background-hero-light.jpg"
            alt=""
            fill
            priority
            aria-hidden
            className="object-cover opacity-90"
          />
          <iframe
            src="/pendulums-hero-script.html?v=10"
            title="Pendulums hero background"
            className="absolute inset-0 h-full w-full border-0 opacity-75"
            loading="eager"
          />
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-1/3 flex -translate-y-1/2 flex-col items-center gap-6 px-4 text-center md:gap-8">
          <div className="flex w-full max-w-[1700px] items-center gap-3 md:gap-6">
            <span className="h-[2px] flex-1 bg-gradient-to-r from-transparent to-foreground/40" />
            <h1 className="text-4xl tracking-[0.2em] text-[#333333] md:text-9xl">PENDULUMS</h1>
            <span className="h-[2px] flex-1 bg-gradient-to-l from-transparent to-foreground/40" />
          </div>
          <h2 className="text-lg tracking-[0.08em] text-[#333333] md:text-3xl">
            A PHYSICS-BASED GENERATIVE ART COLLECTION
          </h2>
          <h3 className="text-lg tracking-[0.08em] text-[#333333] md:text-xl">by BEN STRAUSS</h3>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 left-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />
      </div>

      <section className="relative z-10 mx-auto content-width -mt-34 px-4 pt-14 pb-4 md:-mt-48 md:px-6 md:pt-20 md:pb-8">
        <h2 className="mb-8 text-2xl tracking-[0.08em] text-foreground/80 md:mb-10 md:text-4xl md:text-center">
          Motion Carries Structure
        </h2>
        <div className="space-y-8 text-lg leading-9 text-foreground/80">
          <p>
            <strong>Pendulums</strong> is a physics-driven generative art system modeled after a Blackburn pendulum.
            Each artwork emerges from a unique configuration of forces including period ratios, amplitudes, damping,
            and phase offsets.
          </p>
          <p>
            Once initialized, the system runs deterministically. The motion unfolds stroke by stroke, revealing
            patterns that are not drawn by hand but discovered through the behavior of the system itself.
          </p>
          <p>
            The collection contains 512 outputs from this system, each representing a different physical
            configuration.
          </p>
        </div>
      </section>

      <SectionDivider />

      <PendulumsSystemSection />

      <SectionDivider />

      <div id="about" className="scroll-mt-28 mb-12 flex w-full items-center justify-center gap-4 md:mb-16 md:gap-6">
        <span className="h-[2px] w-16 md:w-60 bg-gradient-to-r from-transparent to-foreground/40" />
        <h2 className="text-3xl text-foreground/80 md:text-5xl">About Pendulums</h2>
        <span className="h-[2px] w-16 md:w-60 bg-gradient-to-l from-transparent to-foreground/40" />
      </div>

      <article className="mx-auto content-width px-4 pt-0 pb-10 md:px-6 md:pb-12">
        <div className="space-y-5 text-lg leading-8 text-foreground">
          <h3 className="text-2xl tracking-[0.08em]">MOTION AS MEMORY</h3>
          <p>
            Motion is not just movement. It is memory and math. It is the quiet
            negotiation between chaos and order, friction and flow.
          </p>
          <p>
            Chapter II of Pursuit of Equilibrium did not begin as art, it began as a
            tool. I needed a way to preview pendulum motion, to plan exposures,
            fine-tune ratios, and avoid hours in the dark chasing perfection. But the
            more I built, the more the system started to feel like a collaborator. It
            was not just solving problems anymore. It was making choices. Expressing
            something.
          </p>

          <div id="the-gallery" className="scroll-mt-28 my-8">
            <PendulumsInterviewVideo
              src="https://transientlabs.b-cdn.net/curated/Pendulums/pendulumsdraft4.mp4"
              className="block h-auto w-full shadow-[0_2px_5px_#0003]"
            />
          </div>

          <h3 className="pt-8 text-2xl tracking-[0.08em]">FROM LIGHT TO CODE</h3>
          <p>
            Chapter I, Lux, was entirely physical. Real pendulums swung in silence.
            Long exposures etched their paths onto sensors, capturing motion that
            would otherwise remain invisible.
          </p>
          <p>
            But precision required dozens of failed attempts. Swing ratios had to be
            dialed in manually. A few millimeters of slack could destroy symmetry. The
            work was meditative, but exhausting.
          </p>
          <p>
            So I built a simulator. Just to preview motion. Nothing more. Then the
            code started surprising me.
          </p>
          <Figure
            src="/figure-1.jpg"
            alt="A real-world pendulum exposure beside an early simulation preview"
            caption="A real-world pendulum exposure, Lux No. 6 (left) vs. an early simulation preview (right) used to plan swing ratios."
          />

          <h3 className="pt-8 text-2xl tracking-[0.08em]">THE BLACKBURN PENDULUM</h3>
          <p>
            Most pendulums swing along one axis. A Blackburn pendulum swings in two,
            with one axis swinging at a faster rate than the other. When released
            together, they produce interferance patterns that fold into elegant designs
            known as Lissajous figures.
          </p>
          <p>
            No motors. No effects. Just the raw outcome of natural ratios. It is a
            system that creates complexity from simplicity and rhythm from physics.
            What you see in this collection is that same system, modeled, coded, and
            reborn.
          </p>
          <Figure
            src="/figure-2.jpg"
            alt="Historic harmonograph Lissajous pattern beside an algorithmic output"
            caption="An early Lissajous pattern produced via a harmonograph by S.C. Tisley, circa late 1800s (left), alongside a simplified, similar output generated by my algorithm (right). The pattern above is from a 3:4 period ratio."
          />

          <h3 className="pt-8 text-2xl tracking-[0.08em]">A SYSTEM WITH IMPERFECTIONS</h3>
          <p>
            This is not a clean or idealized simulation. It is a digital twin of the
            real thing, with damping, friction, asymmetry, and entropy. Each drawing
            is a fossilized memory of a system in motion, shaped by variables like
            period, amplitude, phase offset, and decay. Some systems swing cleanly.
            Others drift or collapse.
          </p>
          <p>
            That tension, between precision and collapse, is where the beauty lives.
            The code does not simulate reality. It mirrors it.
          </p>
          <Figure
            src="/figure-3.jpg"
            alt="Algorithm controls for pendulum system parameters"
            caption="Screen shots from the algorithm, showing tunable physical parameters like damping, amplitude, period offset, period lengths, and phase offsets, all of which shape the final aesthetic of the output."
          />

          <h3 className="pt-8 text-2xl tracking-[0.08em]">THE PERFECTION SCORE</h3>
          <p>
            Not all systems are equal. Some yield minimal, balanced loops. Others
            spiral into dense and expressive tangles.
          </p>
          <p>
            To make the structure of the system visible, I created a rating method.
            Every piece starts with a score of 100. Deductions are applied for
            imperfections like asymmetry, imbalance, short runtimes, and high period
            offsets. Bonus points are awarded for elegant ratios with low least common
            multiples.
          </p>
          <p>
            The result is a Perfection Score, and a System Rating from Emergent to
            Perfect. It does not dictate taste. It reveals the path the system took.
          </p>
          <p>
            Emergent: below 60
            <br />
            Forming: 60-69
            <br />
            Proficient: 70-79
            <br />
            Notable: 80-84
            <br />
            Advanced: 85-89
            <br />
            Superior: 90-94
            <br />
            Perfect: 95+
          </p>
          <p>Click the buttons below to see example outputs for each category:</p>

          <Tabs defaultValue="Emergent" className="mt-6 w-full gap-6">
            <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-transparent p-0">
              {perfectionTabs.map((tab) => (
                <TabsTrigger
                  key={tab.name}
                  value={tab.name}
                  className="h-auto rounded border border-border px-3 py-2 data-[state=active]:border-foreground"
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {perfectionTabs.map((tab) => (
              <TabsContent key={tab.name} value={tab.name} className="mt-0">
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                  {tab.images.map((imageNumber) => (
                    <div
                      key={`${tab.name}-${imageNumber}`}
                      className="shadow-[0_2px_5px_#0003]"
                    >
                      <Image
                        src={`/perfection-score-examples/${tab.name}-${imageNumber}-p-1080.jpg`}
                        alt={`${tab.name} system example ${imageNumber}`}
                        width={1080}
                        height={1080}
                        className="block h-auto w-full object-contain"
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
          <p className="text-sm text-muted-foreground">
            Example outputs for each of the 7 system perfection categories.
          </p>

          <h3 className="pt-8 text-2xl tracking-[0.08em]">AN ACT THAT PERFORMS</h3>
          <p>
            These are not just static images. Each piece animates itself in real time.
            When activated, the algorithm draws the artwork stroke by stroke using its
            own pendulum logic.
          </p>
          <p>
            Some systems draw in under 30 seconds. Others take over 30 minutes. Once
            complete, the image erases itself and begins again. This loop continues
            indefinitely.
          </p>
          <p>
            This is not a replay. It is the original system performing its own
            creation. What you are watching is motion encoded in code and expressed
            over time.
          </p>
          <Figure
            src="/figure-5.jpg"
            alt="Time progression snapshots of an animated pendulum output"
            caption="Snapshots from the progression of a pendulum output in animated mode, showing the drawing as it unfolds in real time."
          />

          <h3 className="pt-8 text-2xl tracking-[0.08em]">FROM THE UNIVERSE TO THE CANVAS</h3>
          <p>
            This project is not about randomness. It is not aesthetic trickery. It is
            the re-creation of physical law in code, rendered with just enough
            imperfection to make it human. The code does not pretend to be a pendulum.
            It is one.
          </p>
          <p>
            Behind each image is a simulation unfolding in time. In animated mode, you
            are not watching a replay, you are watching the algorithm perform the
            drawing, governed by its own rules. The result is not a representation. It
            is a trace of motion. A system coming to rest.
          </p>
          <p>
            This is Chapter II. The universe is the algorithm. The code is the
            pendulum. And you are the witness.
          </p>
        </div>
      </article>

      <div id="playground" className="scroll-mt-28" />
    </section>
  );
}
