import Lookable from "./Lookable";

export default interface GameConfig {
  verbs: {
    [key: string]: {} & Lookable;
  };
  actors: {};
  rooms: {};
  objects: {};
}
