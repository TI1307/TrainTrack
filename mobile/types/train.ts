export type Stop = {
  name: string;
  time: string;
  passed: boolean;
};

export type Train = {
  id: string;
  trainNumber: string;
  departureTime: string;
  departureStation: string;
  arrivalTime: string;
  arrivalStation: string;
  duration: string;
  isCurrent: boolean;
  stops: Stop[];
};