import Image from "next/image";

export default function PendulumsPage() {
  return (
    <section className="relative -mt-8 -mx-4 flex flex-col items-start justify-start md:-mx-6">
      <div className="relative h-[55vh] w-full md:h-[75vh]">
        <Image
          src="/hero-image-new.jpg"
          alt="Pendulums hero"
          fill
          priority
          className="object-cover brightness-70"
        />
        <div className="pointer-events-none absolute inset-x-0 top-2/5 flex -translate-y-1/2 flex-col items-center gap-6 px-4 text-center md:gap-8">
          <h1 className="text-9xl tracking-[0.2em] text-white">PENDULUMS</h1>
          <h3 className="text-2xl tracking-[0.08em] text-white">by BEN STRAUSS</h3>
          <h2 className="text-4xl tracking-[0.08em] text-white">
            A PHYSICS-BASED GENERATIVE ART COLLECTION
          </h2>
        </div>
        <div className="pointer-events-none absolute top-0 right-0 left-0 h-24 bg-gradient-to-b from-black/20 to-transparent" />
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 h-1/3 bg-gradient-to-b from-transparent to-background" />
      </div>
    </section>
  );
}
