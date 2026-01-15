"use client";

import { useMemo, useCallback, useEffect, useRef } from "react";
import { type Message } from "@langchain/langgraph-sdk";
import {
  useStream,
  FetchStreamTransport,
} from "@langchain/langgraph-sdk/react";
import { AIMessage, ToolCall, ToolMessage } from "@langchain/core/messages";
import { ToolCallBubble, type ToolCallState } from "../ToolCall";
import { ChatInput } from "./ChatInput";
import TextType from "../TextType";

import {
  extractTextContent,
  isAIMessage,
  isHumanMessage,
  isToolMessage,
} from "@/lib/utils";
import { toast } from "react-toastify";

interface ChatWindowProps {
  chatId: string;
  initialValues?: { messages: Array<{ type: string; content: string }> } | null;
}

//TODO: implement checkpointer for chat history

export default function ChatWindow({
  chatId,
  initialValues = null,
}: ChatWindowProps) {
  const apiKey = process.env.OPENAI_API_KEY as string;
  const lastMessageCountRef = useRef(0);

  const transport = useMemo(() => {
    return new FetchStreamTransport({
      apiUrl: "/api/ask",
      onRequest: async (url: string, init: RequestInit) => {
        const customBody = JSON.stringify({
          ...(JSON.parse(init.body as string) || {}),
          apiKey: apiKey,
        });

        return {
          ...init,
          body: customBody,
        };
      },
    });
  }, [apiKey]);

  const stream = useStream({
    transport,
    initialValues: initialValues,
    threadId: chatId,
  });

  useEffect(() => {
    const saveMessage = async () => {
      if (stream.isLoading || stream.messages.length === 0) return;

      // ตรวจสอบว่ามี message ใหม่หรือไม่
      if (stream.messages.length <= lastMessageCountRef.current) return;

      const lastMessage = stream.messages[stream.messages.length - 1];

      // บันทึกเฉพาะ AI response
      if (isAIMessage(lastMessage)) {
        const content = extractTextContent(lastMessage.content);
        if (content) {
          try {
            await fetch("/api/chat/message", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                chatId,
                role: "assistant",
                content,
                updateTitle: stream.messages.length === 2, // Update title เมื่อมี 2 messages
              }),
            });
            lastMessageCountRef.current = stream.messages.length;
          } catch (error) {
            console.error("Failed to save message:", error);
          }
        }
      }
    };

    saveMessage();
  }, [stream.isLoading, stream.messages, chatId]);

  const toolCallsByMessage = useMemo(() => {
    const map = new Map<Message, ToolCallState[]>();

    stream.messages.forEach((message) => {
      // Only process AI messages (check both SDK format and LangChain Core format)
      if (!isAIMessage(message)) {
        return;
      }
      const aiMessage = message as AIMessage;

      // Extract tool calls from AIMessage - check both direct property and kwargs
      let toolCalls: ToolCall[] = [];

      // Check for tool_calls directly on message (SDK format)
      if (aiMessage.tool_calls && Array.isArray(aiMessage.tool_calls)) {
        toolCalls = aiMessage.tool_calls as ToolCall[];
      }

      // Extract tool messages (responses) - find ToolMessage type messages
      const toolMessages: ToolMessage[] = [];
      for (const msg of stream.messages) {
        if (isToolMessage(msg)) {
          const toolMessage = msg as ToolMessage;
          const toolCallId = toolMessage.tool_call_id;

          if (toolCallId && toolCalls.some((tc) => tc.id === toolCallId)) {
            toolMessages.push(msg as ToolMessage);
          }
        }
      }

      // Build tool call states
      if (toolCalls.length > 0) {
        const toolCallStates: ToolCallState[] = [];
        for (const toolCall of toolCalls) {
          const toolMessage = toolMessages.find((tm) => {
            return tm.tool_call_id === toolCall.id;
          });

          toolCallStates.push({
            toolCall,
            toolMessage,
          });
        }
        map.set(message, toolCallStates);
      }
    });

    return map;
  }, [stream.messages]);

  const handleSend = useCallback(
    async (messageOverride?: string) => {
      const messageToSend = messageOverride || "";

      if (!messageToSend.trim() || stream.isLoading) {
        return;
      }

      try {
        await fetch("/api/chat/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatId,
            role: "user",
            content: messageToSend.trim(),
          }),
        });
      } catch (err) {
        toast.error("Failed to save message");
      }

      // Submit message using stream API
      stream.submit({
        messages: [{ content: messageToSend, type: "human" }],
      });
    },
    [chatId, stream]
  );

  const handleInputSubmit = useCallback(
    (message: string) => {
      handleSend(message);
    },
    [handleSend]
  );

  const isLoading = stream.isLoading;
  const errorMessage =
    stream.error instanceof Error
      ? stream.error.message
      : typeof stream.error === "string"
      ? stream.error
      : undefined;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 min-h-screen">
        {stream.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <TextType
              text={[
                "กรรมการบริษัทจำกัดมีหน้าที่อะไรบ้าง",
                "เปรียบเทียบหน้าที่และความรับผิดของกรรมการ",
                "กรรมการพ้นจากตำแหน่งได้ในกรณีใด",
              ]}
              typingSpeed={75}
            />
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Render messages - filter out tool messages as they're displayed separately */}
            {stream.messages
              .filter((message) => !isToolMessage(message))
              .map((message, messageIndex) => {
                // Get tool calls associated with this AI message
                const associatedToolCalls = isAIMessage(message)
                  ? toolCallsByMessage.get(message) || []
                  : [];

                return (
                  <div key={message.id || messageIndex}>
                    {/* Message */}
                    {extractTextContent(message.content) !== "" && (
                      <div
                        className={`flex ${
                          isHumanMessage(message)
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg px-4 py-3 ${
                            isHumanMessage(message)
                              ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900"
                              : "bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">
                            {extractTextContent(message.content)}
                            {messageIndex ===
                              stream.messages.filter((m) => !isToolMessage(m))
                                .length -
                                1 &&
                              isLoading && (
                                <span className="inline-block w-2 h-4 bg-gray-400 dark:bg-gray-600 ml-1 animate-pulse" />
                              )}
                          </p>
                        </div>
                      </div>
                    )}
                    {/* Tool calls associated with this message */}
                    {associatedToolCalls.map((toolCallState) => (
                      <ToolCallBubble
                        key={toolCallState.toolCall.id}
                        toolCallState={toolCallState}
                      />
                    ))}
                    {/* Error bubble associated with this message */}
                    {errorMessage &&
                      isAIMessage(message) &&
                      messageIndex ===
                        stream.messages.filter((m) => !isToolMessage(m))
                          .length -
                          1 &&
                      toast.error("Error")}
                  </div>
                );
              })}
            {isLoading && (
              <div className="flex justify-center items-center gap-1.5 py-2">
                <span
                  className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-dot-wave"
                  style={{ animationDelay: "0ms" }}
                />
                <span
                  className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-dot-wave"
                  style={{ animationDelay: "200ms" }}
                />
                <span
                  className="inline-block w-2 h-2 bg-gray-400 dark:bg-gray-600 rounded-full animate-dot-wave"
                  style={{ animationDelay: "400ms" }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Input Area */}
      <ChatInput onSubmit={handleInputSubmit} isLoading={isLoading} />
    </div>
  );
}
