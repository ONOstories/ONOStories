"use client";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/tracing-beam";

/** Landing-page explainer with a full-height tracing beam */
export function HowItWorks() {
  return (
    /* ❶ The beam must receive ONE child whose total height includes header + steps */
    <TracingBeam>
      <section className="px-6 max-w-3xl mx-auto">
        {/* ── HEADLINE ────────────────────────────── */}
        <header className="text-center mt-12 mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2E1065]">
            How ONOStories Works
          </h2>
          <p className="mt-4 text-xl text-gray-700/90">
            Turn simple photos into an unforgettable, personalized storybook in 3 quick steps.
          </p>
        </header>

        {/* ── VERTICAL STEPS ─────────────────────── */}
        {steps.map(step => (
          <StepCard key={step.id} {...step} />
        ))}
      </section>
    </TracingBeam>
  );
}

/* Reusable card */
function StepCard({ id, title, body, image }: (typeof steps)[number]) {
  return (
    <article className="mb-24 flex flex-col items-center text-center">
      <div
        className={twMerge(
          "w-52 h-52 rounded-3xl overflow-hidden shadow-xl mb-8 flex items-center justify-center",
          "bg-gray-100" // fallback bg so the number stays readable if no image
        )}
      >
        {image ? (
          <img
            src={image}
            alt={`${title} illustration`}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="text-5xl font-extrabold text-[#2E1065]">{id}</span>
        )}
      </div>

      <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
      <p className="text-gray-700/90 leading-relaxed max-w-md">{body}</p>
    </article>
  );
}

/* Step data ------------------------------------------------------ */
const steps = [
  {
    id: 1,
    title: "Upload Photos",
    body:
      "Pick 4–5 clear pictures of your child—our AI turns them into a lovable story character.",
    image: "src/assets/upload.png",
  },
  {
    id: 2,
    title: "Choose a Genre",
    body:
      "Select adventure, bedtime or moral tales; every option is packed with exciting sub-plots.",
    image: "src/assets/choose genre.png",
  },
  {
    id: 3,
    title: "Enjoy & Download",
    body:
      "Watch the tale unfold on-screen, then save it as a high-quality PDF to read anytime.",
    image: "src/assets/download story.png",
  },
];
