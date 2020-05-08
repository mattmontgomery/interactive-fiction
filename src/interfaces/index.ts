import { AnyAction } from "redux";

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

export interface GameSet<T> {
  [object: string]: T;
}
export interface GameObject {
  name: string;
  article: "a" | "the";
  descriptions: Descriptions;
  objects?: GameObject[];
  canGet: boolean;
}
export interface Actor {
  descriptions: Descriptions;
}

export interface GameState {
  gameState: string[];
  ended: boolean;
  env: "production" | "development" | "demo" | "test";
  log: string[];
  actors: {
    [actor: string]: Actor;
  };
  verbs: string[];
  triggersEvents: string[];
  room: string;
  rooms: GameSet<Room>;
  objects: GameSet<GameObject>;
  inventory: string[];
}

export interface GameDispatch {
  (GameAction): void;
}
export interface GameAction extends AnyAction {
  type: string;
  data?: any;
}
