// app/chat-rooms/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api";

interface ChatRoom {
  id: number;
  name: string;
  description: string;
}

export default function ChatRoomsPage() {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDescription, setNewRoomDescription] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  const fetchChatRooms = async () => {
    try {
      const rooms = await apiRequest("/chatrooms");
      setChatRooms(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      // TODO: Show error message to user
    }
  };

  const handleJoinRoom = (roomId: number) => {
    router.push(`/chat/${roomId}`);
  };

  const handleCreateRoom = async () => {
    try {
      await apiRequest("/chatrooms", "POST", {
        name: newRoomName,
        description: newRoomDescription,
        isPrivate: false,
      });
      setIsDialogOpen(false);
      setNewRoomName("");
      setNewRoomDescription("");
      fetchChatRooms(); // Refresh the list of chat rooms
    } catch (error) {
      console.error("Error creating chat room:", error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Chat Rooms</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Room</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Chat Room</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newRoomDescription}
                  onChange={(e) => setNewRoomDescription(e.target.value)}
                  className="col-span-3"
                />
              </div>
            </div>
            <Button onClick={handleCreateRoom}>Create Room</Button>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {chatRooms.map((room) => (
          <Card key={room.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>{room.name}</CardTitle>
              <CardDescription>{room.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => handleJoinRoom(room.id)}
                className="w-full"
              >
                Join Room
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
