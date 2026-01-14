export type ChatRole = "user" | "assistant" | "tool";

export type ChatMessage = {
  id: string;
  role: ChatRole;
  content?: string;
  parsed?: ParsedAnswer;
};

export type Section = {
  title: string;
  content: string[];
};

export type ParsedAnswer = {
  title?: string;
  sections: Section[];
  references: string[];
};

export type LegalSection = {
  title: string;
  bullets: string[];
};

export type LegalResponse = {
  answerTitle?: string;
  sections: LegalSection[];
  references: {
    path: string;
    node_id: string;
  }[];
};

export function createStreamParser(onUpdate: (data: LegalResponse) => void) {
  let buffer = "";

  const state: LegalResponse = {
    sections: [],
    references: [],
  };

  return (chunk: string) => {
    buffer += chunk;

    // ANSWER_TITLE
    const titleMatch = buffer.match(/<ANSWER_TITLE>([\s\S]*?)<\/ANSWER_TITLE>/);
    if (titleMatch && !state.answerTitle) {
      state.answerTitle = titleMatch[1].trim();
      onUpdate({ ...state });
    }

    // SECTION
    const sectionRegex = /<SECTION title="([^"]+)">([\s\S]*?)<\/SECTION>/g;

    let sectionMatch;
    while ((sectionMatch = sectionRegex.exec(buffer)) !== null) {
      const [_, title, body] = sectionMatch;

      if (state.sections.some((s) => s.title === title)) continue;

      const bullets = body
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-"))
        .map((l) => l.replace(/^- /, ""));

      state.sections.push({ title, bullets });
      onUpdate({ ...state });
    }

    // REFERENCES
    const refMatch = buffer.match(/<REFERENCES>([\s\S]*?)<\/REFERENCES>/);
    if (refMatch && state.references.length === 0) {
      const refs = refMatch[1]
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("-"))
        .map((l) => {
          const pathMatch = l.match(/path:\s*(.*?)\s*\|/);
          const nodeMatch = l.match(/node_id:\s*(.*)$/);

          return {
            path: pathMatch?.[1] ?? "",
            node_id: nodeMatch?.[1] ?? "",
          };
        });

      state.references = refs;
      onUpdate({ ...state });
    }
  };
}
