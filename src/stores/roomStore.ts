import {create} from "zustand";

export enum ConnectStatus{
    Connected = "Connected",
    Connecting = "Connecting",
    Disconnected = "Disconnected",
    Waiting = "Waiting",
    Failed = "Failed"
}
export type RoomState= {
    ID : string;
    ConnectionStatus : ConnectStatus ;
}

export type Actions = {
    setRoomID : (id: string) => void;
    setConnectionStatus : (conn : ConnectStatus) => void;
}

export const useRoomStore = create<RoomState & Actions>((set)=>({
    ID :"" ,
    ConnectionStatus : ConnectStatus.Waiting,
    setRoomID : (id: string) => set(()=> ( {ID :id})),
    setConnectionStatus : (conn : ConnectStatus) =>  set(()=> ( {ConnectionStatus : conn})),
}));