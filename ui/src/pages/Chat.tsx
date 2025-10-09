"use client"

import { useEffect, useState } from "react"
import {
  Send,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Layout } from "@/components/Layout"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import chatApi from "@/lib/chat"
import { getUsernameFromToken } from "@/lib/api"
import { connectChatSocket } from "@/lib/ws"
import { uniqueNamesGenerator, adjectives, colors, animals } from "unique-names-generator"

interface Room {
  id: string
  name: string
  createdAt?: Date
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  feedback?: "up" | "down" | null
  roomId?: string
}

function generateRoomName() {
  return uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
    style: "capital",
  })
}

function waitForSocketOpen(socket: WebSocket, timeout = 5000): Promise<void> {
  return new Promise((resolve, reject) => {
    if (socket.readyState === WebSocket.OPEN) return resolve()
    const timer = setTimeout(() => reject(new Error("Socket timeout")), timeout)
    socket.onopen = () => {
      clearTimeout(timer)
      resolve()
    }
    socket.onerror = () => {
      clearTimeout(timer)
      reject(new Error("Socket error"))
    }
  })
}

export default function Chat() {
  const [message, setMessage] = useState("")
  const [rooms, setRooms] = useState<Room[]>([])
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null)
  const [renamingRoom, setRenamingRoom] = useState<string | null>(null)
  const [newRoomName, setNewRoomName] = useState("")
  const [isRoomListCollapsed, setIsRoomListCollapsed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  const suggestedQuestions = ["About Company", "About Role Responsibility", "About Project"]

  useEffect(() => {
    const user = getUsernameFromToken()
    setUsername(user)
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [error])

  useEffect(() => {
    const initChat = async () => {
      try {
        const res = await chatApi.getRooms()
        if (res.length === 0) {
          const randomName = generateRoomName()
          const created = await chatApi.createRoom(randomName)
          const defaultRoom: Room = { id: created.id, name: created.roomName }
          setRooms([defaultRoom])
          setCurrentRoom(defaultRoom)
        } else {
          const sortedRooms = res
            .map((r) => ({ id: r.id, name: r.roomName }))
            .sort((a, b) => (a.id > b.id ? -1 : 1))
          setRooms(sortedRooms)
          setCurrentRoom(sortedRooms[0])
        }
      } catch {
        setError("Failed to load chat rooms.")
      }
    }
    initChat()
  }, [])

  useEffect(() => {
    setMessages((prev) => {
      if (prev.length && currentRoom && prev[0]?.roomId === currentRoom.id) return prev
      return []
    })
  }, [currentRoom])

  useEffect(() => {
    if (!currentRoom) {
      if (socket) {
        socket.close()
        setSocket(null)
      }
      setIsConnected(false)
      return
    }
    const newSocket = connectChatSocket(
      currentRoom.id,
      (data) => {
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data,
          timestamp: new Date(),
          roomId: currentRoom.id,
          feedback: null,
        }
        setMessages((prev) => [...prev, aiMessage])
      },
      (err) => {
        setError(err)
      }
    )
    newSocket.onopen = () => setIsConnected(true)
    newSocket.onclose = () => setIsConnected(false)
    setSocket(newSocket)
    return () => {
      newSocket.close()
      setSocket(null)
      setIsConnected(false)
    }
  }, [currentRoom])

  const handleSendMessage = async () => {
    if (!message.trim()) return
    try {
      let activeRoom = currentRoom
      if (!activeRoom) {
        const randomName = generateRoomName()
        const created = await chatApi.createRoom(randomName)
        activeRoom = { id: created.id, name: created.roomName }
        setRooms((prev) => [activeRoom!, ...prev])
        setCurrentRoom(activeRoom)
        await new Promise((r) => setTimeout(r, 200))
      }
      if (socket) {
        await waitForSocketOpen(socket)
      }
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: "user",
        content: message,
        timestamp: new Date(),
        roomId: activeRoom.id,
      }
      setMessages((prev) => [...prev, userMessage])
      socket?.send(message)
      setMessage("")
    } catch (err) {
      console.error(err)
      setError("Failed to send message.")
    }
  }

  const handleCreateRoom = async () => {
    try {
      setLoading(true)
      const randomName = generateRoomName()
      const created = await chatApi.createRoom(randomName)
      const newRoom: Room = { id: created.id, name: created.roomName }
      setRooms((prev) => [newRoom, ...prev])
      setCurrentRoom(newRoom)
    } catch {
      setError("Failed to create room.")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await chatApi.deleteRoom(roomId)
      setRooms((prev) => prev.filter((room) => room.id !== roomId))
      if (currentRoom?.id === roomId) setCurrentRoom(null)
    } catch {
      setError("Failed to delete room.")
    }
  }

  const handleStartRename = (room: Room) => {
    setRenamingRoom(room.id)
    setNewRoomName(room.name)
  }

  const handleSaveRename = async (roomId: string) => {
    if (!newRoomName.trim()) return
    try {
      const updated = await chatApi.updateRoom(roomId, newRoomName)
      setRooms((prev) =>
        prev.map((r) => (r.id === roomId ? { ...r, name: updated.roomName } : r)),
      )
      if (currentRoom?.id === roomId)
        setCurrentRoom((prev) =>
          prev ? { ...prev, name: updated.roomName } : null,
        )
      setRenamingRoom(null)
      setNewRoomName("")
    } catch {
      setError("Failed to rename room.")
    }
  }

  const handleCancelRename = () => {
    setRenamingRoom(null)
    setNewRoomName("")
  }

  const handleFeedback = (messageId: string, feedback: "up" | "down") => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, feedback: msg.feedback === feedback ? null : feedback }
          : msg,
      ),
    )
  }

  return (
    <Layout>
      <div className="flex h-full">
        <div
          className={`${
            isRoomListCollapsed ? "w-0" : "w-64"
          } transition-all duration-300 border-r border-border bg-muted/30 flex flex-col overflow-hidden`}
        >
          <div className="p-4 border-b border-border">
            <Button
              onClick={handleCreateRoom}
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 rounded-lg"
            >
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Creating..." : "Create Room"}
            </Button>
          </div>
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
                          <Button
                            size="sm"
                            onClick={() => handleSaveRename(room.id)}
                            className="h-7 px-2 text-xs"
                          >
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
                                <Edit className="h-4 w-4 mr-2" /> Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDeleteRoom(room.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Remove
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
        <div className="flex flex-col flex-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsRoomListCollapsed(!isRoomListCollapsed)}
            className="h-10 w-8 p-0 border-r border-border hover:bg-muted/50"
          >
            {isRoomListCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
          {error && (
            <div className="px-4 py-2 bg-destructive/10 border-b border-destructive/20">
              <p className="text-destructive text-sm text-center">{error}</p>
            </div>
          )}
          <div className="px-4 py-2 text-xs text-muted-foreground text-center">
            {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
          </div>
          {messages.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
                {messages.map((msg) => (
                  <div key={msg.id} className="space-y-2">
                    {msg.role === "user" ? (
                      <div className="flex justify-end">
                        <div className="bg-primary text-primary-foreground rounded-2xl px-4 py-3 max-w-[80%]">
                          <p className="text-sm leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex justify-start">
                          <div className="bg-muted rounded-2xl px-4 py-3 max-w-[80%]">
                            <p className="text-sm leading-relaxed">{msg.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(msg.id, "up")}
                            className={`h-7 w-7 p-0 hover:bg-muted ${
                              msg.feedback === "up" ? "bg-muted text-primary" : ""
                            }`}
                          >
                            <ThumbsUp className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleFeedback(msg.id, "down")}
                            className={`h-7 w-7 p-0 hover:bg-muted ${
                              msg.feedback === "down" ? "bg-muted text-destructive" : ""
                            }`}
                          >
                            <ThumbsDown className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-2xl px-4 py-6">
                <h1 className="text-3xl font-semibold text-center mb-8">
                  {currentRoom ? currentRoom.name : "What can I help with?"}
                </h1>
                <div className="flex flex-wrap gap-3 justify-center mb-6">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      onClick={() => {
                        setMessage(question)
                        if (isConnected) handleSendMessage()
                      }}
                      className="rounded-full border-muted hover:border-primary hover:text-primary"
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <div className="border-t border-border bg-background">
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="relative">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && isConnected && handleSendMessage()}
                  placeholder={isConnected ? "Ask anything about company..." : "Waiting for connection..."}
                  disabled={!isConnected}
                  className="h-12 pr-12 rounded-3xl shadow-sm disabled:bg-muted disabled:text-muted-foreground"
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || !isConnected}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full bg-primary hover:bg-primary/90 disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}
