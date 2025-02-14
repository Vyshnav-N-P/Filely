export interface ProgressBarProps{
    progress: number;
    type: "sending" | "receiving";
  }
  
export interface connectProps{
    file: File| null;
  }