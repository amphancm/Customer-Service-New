"use client"

import { useState } from "react"
import { Send, Plus, MoreHorizontal, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/Layout";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Room {
  id: string
  name: string
  createdAt: Date
}

export default function Chat() {
  const [message, setMessage] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [renamingRoom, setRenamingRoom] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState("")
  const [isRoomListCollapsed, setIsRoomListCollapsed] = useState(false)

  const suggestedQuestions = ["About Company", "About Role Responsibility", "About Project"]

  const handleCreateRoom = () => {
    const newRoom: Room = {
      id: Date.now().toString(),
      name: `Room ${rooms.length + 1}`,
      createdAt: new Date(),
    }

    setRooms((prev) => [...prev, newRoom])
    setCurrentRoom(newRoom)
  }

  const handleSendMessage = () => {
    if (!message.trim()) return
    console.log("[v0] Sending message:", message, "in room:", currentRoom?.name || "General")
    setMessage("")
  }

  const handleDeleteRoom = (roomId: string) => {
    setRooms((prev) => prev.filter((room) => room.id !== roomId))
    if (currentRoom?.id === roomId) {
      setCurrentRoom(null)
    }
  }

  const handleStartRename = (room: Room) => {
    setRenamingRoom(room.id)
    setNewRoomName(room.name)
  }

  const handleSaveRename = (roomId: string) => {
    if (!newRoomName.trim()) return

    setRooms((prev) => prev.map((room) => (room.id === roomId ? { ...room, name: newRoomName.trim() } : room)))

    if (currentRoom?.id === roomId) {
      setCurrentRoom((prev) => (prev ? { ...prev, name: newRoomName.trim() } : null))
    }

    setRenamingRoom(null)
    setNewRoomName("")
  }

  const handleCancelRename = () => {
    setRenamingRoom(null)
    setNewRoomName("")
  }

  return (
    <Layout>
      <div className="flex h-full ">
        {/* Left Panel - Room List */}
        <div
          className={`${isRoomListCollapsed ? "w-0" : "w-64"} bg-blacktransition-all duration-300 border-r border-border bg-muted/30 flex flex-col overflow-hidden`}
        >
          {/* Create Room Button */}
          <div className="p-4 border-b border-border">
            <Button onClick={handleCreateRoom} className="w-full bg-primary hover:bg-primary/90 rounded-lg">
              <Plus className="h-4 w-4 mr-2" />
              Create Room
            </Button>
          </div>

          {/* Room List */}
          <div className="flex-1 overflow-y-auto p-2">
            {rooms.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm mt-8">
                No rooms yet. Create your first room to get started.
              </div>
            ) : (
              <div className="space-y-1">
                {rooms.map((room) => (
                  <div key={room.id}>
                    {renamingRoom === room.id ? (
                      <div className="p-2 space-y-2">
                        <Input
                          value={newRoomName}
                          onChange={(e) => setNewRoomName(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === "Enter") handleSaveRename(room.id)
                            if (e.key === "Escape") handleCancelRename()
                          }}
                          className="h-8 text-sm"
                          autoFocus
                        />
                        <div className="flex gap-1">
                          <Button size="sm" onClick={() => handleSaveRename(room.id)} className="h-7 px-2 text-xs">
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleCancelRename}
                            className="h-7 px-2 text-xs bg-transparent"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="relative">
                        <Button
                          variant={currentRoom?.id === room.id ? "default" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentRoom(room)}
                          className="w-full justify-between h-auto p-3 text-left group hover:bg-muted/50 hover:text-black"
                        >
                          <span className="truncate pr-2">{room.name}</span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/20 rounded"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleStartRename(room)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Collapse/Expand Toggle Button */}
        <div className="flex flex-col w-full">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRoomListCollapsed(!isRoomListCollapsed)}
            className="h-10 w-8 p-0 border-r border-border hover:bg-muted/50"
          >
            {isRoomListCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>

          {/* Right Panel - Main Chat Area */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-2xl px-4 py-6">
              <h1 className="text-3xl font-semibold text-center mb-8">
                {currentRoom ? `${currentRoom.name}` : "What can I help with?"}
              </h1>

              {/* Chat Input */}
              <div className="relative mb-6">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask anything about company..."
                  className="h-12 pr-12 shadow-soft"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-primary hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Suggested Questions */}
              <div className="flex flex-wrap gap-3 justify-center">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => setMessage(question)}
                    className="rounded-full border-muted hover:border-primary hover:text-primary"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
