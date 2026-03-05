export default function PendulumsPlaygroundPage() {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 py-8 md:px-6">
      <div className="mb-12 flex items-center justify-center gap-4 md:mb-16 md:gap-6">
        <span className="h-[2px] w-16 bg-gradient-to-r from-transparent to-foreground/40 md:w-60" />
        <h1 className="text-3xl text-foreground/80 md:text-5xl">The Playground</h1>
        <span className="h-[2px] w-16 bg-gradient-to-l from-transparent to-foreground/40 md:w-60" />
      </div>

      <p className="mb-10 text-lg leading-8 text-foreground/80">
        This is an interactive playground for exploring the Pendulums system. Use the control panel to dial in every
        parameter, from timing and amplitude to damping and line style, and build your own physical configurations.
        You can generate fully random systems, fine-tune them by hand, and watch each piece come to life in real
        time using the Animate button. Every interaction reveals how small changes shape the final form.
      </p>

      <div className="overflow-hidden border border-border bg-[#fffcf7] shadow-[0_2px_5px_#0003]">
        <iframe
          id="playground-iframe"
          src="/pendulum-playground-15.html"
          title="Pendulum Playground"
          className="block h-[calc(75vh)] min-h-[800px] w-full border-0"
          allow="autoplay; microphone; camera; encrypted-media; gyroscope; picture-in-picture"
        />
      </div>
    </section>
  );
}
