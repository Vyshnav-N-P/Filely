import {create} from "zustand";

export type RoomState= {
    ID : string;
    ConnectionStatus : "Connected" | "Connecting" | "Disconnected" | "Waiting" | "Failed" ;
}

export type Actions = {
    setRoomID : (id: string) => void;
    setConnectionStatus : (conn : "Connected" | "Connecting" | "Disconnected" | "Waiting" | "Failed") => void;
}

export const useRoomStore = create<RoomState & Actions>((set)=>({
    ID :"" ,
    ConnectionStatus : "Waiting",
    setRoomID : (id: string) => set(()=> ( {ID :id})),
    setConnectionStatus : (conn : "Connected" | "Connecting" | "Disconnected") =>  set(()=> ( {ConnectionStatus : conn})),
}));