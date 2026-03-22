import { Section } from "../../_components/section";

export interface SectionHeroProps {
  name: string;
  description: string;
  email: string;
}

export const SectionHero = ({ name, description, email }: SectionHeroProps) => (
  <Section className="h-[80vh] md:h-[70vh] items-center justify-center text-accent text-center gap-12 -mb-8">
    <h1 className="text-6xl md:text-9xl font-serif font-semibold tracking-tighter">
      {name}
    </h1>

    <div className="flex flex-col items-center gap-8 px-8">
      <p>{description}</p>

      <a className="underline" href={`mailto:${email}`}>
        {email}
      </a>
    </div>
  </Section>
);
