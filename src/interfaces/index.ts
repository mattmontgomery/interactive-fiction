export interface Descriptions {
  [verb: string]: string;
}
export interface Room {
  objects: string[];
  descriptions: Descriptions;
  events: {
    [verb: string]: {
      triggers: string;
    };
  };
}
export interface GameObject {
  name: string;
  article: string;
  descriptions: Descriptions;
  objects: GameObject[];
  canGet: boolean;
}
export interface Actor {
  descriptions: Descriptions;
}

export interface GameState {
  ended: boolean;
  env: string;
  log: string[];
  actors: {
    [actor: string]: Actor;
  };
  verbs: string;
  triggersEvents: string;
  room: string;
  rooms: {
    [room: string]: Room;
  };
  objects: {
    [object: string]: GameObject;
  };
  inventory: string[];
}
