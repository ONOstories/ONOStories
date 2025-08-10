"use client";
import { twMerge } from "tailwind-merge";
import { TracingBeam } from "./ui/tracing-beam";
import uploadImg from "/public/upload.png";
import chooseGenreImg from "/public/choose genre.png";
import downloadStoryImg from "/public/download story.png";
/** Landing-page explainer with a full-height tracing beam */
export function HowItWorks() {
  return (
    /* ❶ The beam must receive ONE child whose total height includes header + steps */
    <TracingBeam>
      <section className="px-6 max-w-5xl mx-auto py-4 md:py-8">
        {/* ── HEADLINE ────────────────────────────── */}
        <header className="text-center mt-8 mb-8 md:mt-10 md:mb-10">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2E1065]">
            How ONOStories Works
          </h2>
          <p className="mt-4 text-xl text-gray-700/90">
            Turn simple photos into an unforgettable, personalized storybook in 3 quick steps.
          </p>
        </header>

        {/* ── STEPS ──────────────────────────────── */}
        {steps.map(step => (
          <StepCard key={step.id} {...step} />
        ))}
      </section>
    </TracingBeam>
  );
}

/* Reusable card */
function StepCard({ id, title, body, image }: (typeof steps)[number]) {
  // For the second step, use md:flex-row (image left, text right), otherwise md:flex-row-reverse
  const isSecond = id === 2;
  return (
    <article
      className={`mb-24 flex flex-col ${isSecond ? "md:flex-row" : "md:flex-row-reverse"} md:items-center md:text-left text-center`}
    >
      {/* IMAGE */}
      <div
        className={twMerge(
          "w-72 h-72 md:w-80 md:h-80 rounded-3xl overflow-hidden shadow-xl",
          "bg-gray-100 flex-shrink-0 mx-auto md:mx-0"
        )}
      >
        {image ? (
          <img
            src={image}
            alt={`${title} illustration`}
            className="object-cover w-full h-full"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-5xl font-extrabold text-[#2E1065]">
            {id}
          </span>
        )}
      </div>

      {/* TEXT */}
      <div className={`mt-8 md:mt-0 ${isSecond ? "md:ml-10" : "md:mr-10"}`}>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">{title}</h3>
        <p className="text-gray-700/90 leading-relaxed max-w-md md:max-w-none">
          {body}
        </p>
      </div>
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
    image: uploadImg,
  },
  {
    id: 2,
    title: "Choose a Genre",
    body:
      "Select adventure, bedtime or moral tales; every option is packed with exciting sub-plots.",
    image: chooseGenreImg,
  },
  {
    id: 3,
    title: "Enjoy & Download",
    body:
      "Watch the tale unfold on-screen, then save it as a high-quality PDF to read anytime.",
    image: downloadStoryImg,
  },
];
