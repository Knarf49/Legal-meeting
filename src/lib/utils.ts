import { clsx, type ClassValue } from "clsx";
import { AIMessage } from "@langchain/core/messages";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isAIMessage(message: unknown): boolean {
  // Early return for falsy values or non-objects
  if (!message || typeof message !== "object") return false;

  const msg = message as Record<string, unknown>;

  // Check SDK serialized format first (most common in streaming scenarios)
  if (msg.type === "assistant") return true;

  // Fallback to LangChain Core instance check
  return AIMessage.isInstance(message);
}

export function isToolMessage(message: unknown): boolean {
  // Early return for falsy values or non-objects
  if (!message || typeof message !== "object") return false;

  const msg = message as Record<string, unknown>;

  // Tool messages are identified by their type property
  return msg.type === "tool";
}

export function isHumanMessage(message: unknown): boolean {
  // Early return for falsy values or non-objects
  if (!message || typeof message !== "object") return false;

  const msg = message as Record<string, unknown>;

  // Human messages are identified by their type property
  return msg.type === "human";
}

export function extractTextContent(content: unknown): string {
  // Handle simple string content (most common case)
  if (typeof content === "string") {
    return content;
  }

  // Handle array content (can be array of strings or objects)
  if (Array.isArray(content)) {
    return content
      .map((item) => {
        // Array item is a string
        if (typeof item === "string") {
          return item;
        }
        // Array item is an object with text property
        if (item && typeof item === "object" && "text" in item) {
          return String(item.text);
        }
        // Skip invalid array items
        return "";
      })
      .join("");
  }

  // Handle object with text property
  if (content && typeof content === "object" && "text" in content) {
    return String(content.text);
  }

  // Fallback: convert any other type to string
  return String(content || "");
}
