interface GraphPointPayload {
  time: number;
  value: number;
}

export interface GraphPayload {
  id: string;
  title: string;
  data: Array<GraphPointPayload>;
}
