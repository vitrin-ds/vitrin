import {
  Controls,
  Description,
  Primary,
  Stories,
  Title,
  useOf,
} from "@storybook/addon-docs/blocks";

/** `parameters.figma` of a story file: what the component's Figma page says. */
export interface FigmaDoc {
  do?: string[];
  dont?: string[];
}

function Guidelines() {
  const { preparedMeta } = useOf("meta", ["meta"]);
  const figma = preparedMeta.parameters.figma as FigmaDoc | undefined;
  return (
    <>
      {figma?.do?.length ? <Guideline title="Do" items={figma.do} /> : null}
      {figma?.dont?.length ? <Guideline title="Don't" items={figma.dont} /> : null}
    </>
  );
}

function Guideline({ title, items }: { title: string; items: string[] }) {
  return (
    <>
      <h3>{title}</h3>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </>
  );
}

/** Title, what it is, the live example, its properties, the Figma guidelines, then every story. */
export function DocsPage() {
  return (
    <>
      <Title />
      <Description />
      <Primary />
      <Controls />
      <Guidelines />
      <Stories />
    </>
  );
}
