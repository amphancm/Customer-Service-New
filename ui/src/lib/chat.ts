import { fetchWithAuth } from "./api";


export type ChatRoom = {
  id: string;
  roomName: string;
  owner: string;
};

const BASE = "/chat";

export async function createRoom(roomName: string): Promise<ChatRoom> {
  const res = await fetchWithAuth(`${BASE}/create-room?roomName=${encodeURIComponent(roomName)}`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to create room");
  }
  return (await res.json()) as ChatRoom;
}

export async function getRooms(): Promise<ChatRoom[]> {
  const res = await fetchWithAuth(`${BASE}/rooms`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to fetch rooms");
  }
  return (await res.json()) as ChatRoom[];
}

export async function getRoom(roomId: string): Promise<ChatRoom> {
  const res = await fetchWithAuth(`${BASE}/room/${roomId}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to get room");
  }
  return (await res.json()) as ChatRoom;
}

export async function updateRoom(roomId: string, newName: string): Promise<ChatRoom> {
  const res = await fetchWithAuth(`${BASE}/room/${roomId}?new_name=${encodeURIComponent(newName)}`, {
    method: "PUT",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to update room");
  }
  return (await res.json()) as ChatRoom;
}

export async function deleteRoom(roomId: string): Promise<{ message: string }> {
  const res = await fetchWithAuth(`${BASE}/room/${roomId}`, { method: "DELETE" });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Failed to delete room");
  }
  return (await res.json()) as { message: string };
}

export default {
  createRoom,
  getRooms,
  getRoom,
  updateRoom,
  deleteRoom,
};
