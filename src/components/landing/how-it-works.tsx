import { Scissors } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Set the scene",
    description: "Pick a paper, a tone, and how many frames.",
  },
  {
    number: "02",
    title: "Strike a pose",
    description:
      "A countdown, a few shots, and a retake for the ones you don't love.",
  },
  {
    number: "03",
    title: "Keep the strip",
    description: "Download it, share it, or keep it in this browser.",
  },
] as const;

export const HowItWorks = () => (
  <>
    <div
      aria-hidden="true"
      className="site-container flex items-center gap-3 py-2 text-ink-soft"
    >
      <span className="perforation flex-1" />
      <Scissors className="size-4 -rotate-90" />
      <span className="type-micro text-[0.58rem]">Cut here</span>
      <span className="perforation flex-1" />
    </div>

    <section id="how-it-works" className="site-container py-14 sm:py-20">
      <div className="mb-7 max-w-2xl">
        <p className="type-micro text-brick">01 · How it works</p>
        <h2 className="type-h2 mt-2">Three little steps</h2>
      </div>
      <ol className="ticket-stack grid gap-4 md:grid-cols-3 md:gap-5">
        {steps.map((step) => (
          <li key={step.number} className="film-ticket ml-6 md:ml-0">
            <p className="type-micro text-brick">{step.number}</p>
            <h3 className="type-h3 mt-4">{step.title}</h3>
            <p className="type-small mt-2 max-w-[34ch] text-ink-soft">
              {step.description}
            </p>
          </li>
        ))}
      </ol>
    </section>
  </>
);
