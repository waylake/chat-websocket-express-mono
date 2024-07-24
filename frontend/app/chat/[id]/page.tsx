"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { apiRequest } from "@/lib/api";
import io from "socket.io-client";

interface Message {
  id: number;
  content: string;
  userId: number;
  username: string;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const params = useParams();
  const roomId = params.id;
  const messageEndRef = useRef<HTMLDivElement>(null);
  const socket = useRef<any>(null);

  useEffect(() => {
    socket.current = io("http://localhost:3000", {
      withCredentials: true,
    });

    socket.current.emit("join room", roomId);

    const fetchMessages = async () => {
      try {
        const fetchedMessages = await apiRequest(`/messages/${roomId}`);
        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
        // TODO: Show error message to user
      }
    };

    fetchMessages();

    socket.current.on("new message", (message: Message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.current.off("new message");
      socket.current.emit("leave room", roomId);
      socket.current.disconnect();
    };
  }, [roomId]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === "") return;
    try {
      const message = {
        content: newMessage,
        chatRoomId: roomId,
      };
      socket.current.emit("send message", message);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <Card className="flex-grow flex flex-col">
        <CardHeader>
          <CardTitle>Chat Room {roomId}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto">
          {messages.map((message) => (
            <div key={message.id} className="mb-2">
              <strong>{message.username}: </strong>
              {message.content}
            </div>
          ))}
          <div ref={messageEndRef} />
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="w-full flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-grow"
            />
            <Button type="submit">Send</Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
