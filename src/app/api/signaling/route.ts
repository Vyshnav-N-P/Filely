import { NextResponse } from "next/server";

// Temporary in-memory store (resets when function restarts)
let signalingStore: { [key: string]: any } = {};

// Handle POST requests (Store offer, answer, or ICE candidates)
export async function POST(req: Request) {
  try {
    const { roomId, type, data } = await req.json();

    if (!roomId || !type || !data) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!signalingStore[roomId]) {
      signalingStore[roomId] = {};
    }

    if (type === "offer") {
      signalingStore[roomId].offer = data;
    } else if (type === "answer") {
      signalingStore[roomId].answer = data;
    } else if (type === "candidate") {
      if (!signalingStore[roomId].candidates)
        signalingStore[roomId].candidates = [];
      signalingStore[roomId].candidates.push(data);
    }

    return NextResponse.json(
      { message: "Signaling data stored" },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// Handle GET requests (Retrieve signaling data)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const roomId = searchParams.get("roomId");

    if (!roomId || !signalingStore[roomId]) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    return NextResponse.json(signalingStore[roomId], { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
