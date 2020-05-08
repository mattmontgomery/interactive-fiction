import {
  applyMiddleware,
  createStore,
  combineReducers,
  Action,
  Middleware,
  AnyAction,
} from "redux";
import parser from "../utils/parser";
import {
  INVENTORY_ITEM_ADD,
  INVENTORY_ITEM_DROP,
  ROOM_OBJECT_REMOVE,
  OBJECT_OBJECT_REMOVE,
  HYDRATE_NEW,
  END_GAME,
  ENV_SET,
} from "./actions";
import { GameState } from "../interfaces";

interface GameAction extends Action {
  data: any;
}

const interactiveParserMiddleware: Middleware = ({ getState }) => {
  return (next) => (action) => parser(getState(), next, action);
};

const reducers = {
  inventory: (
    state: GameState["inventory"] = [],
    action: GameAction
  ): GameState["inventory"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.actors.EGO.defaultObjects;
      case INVENTORY_ITEM_ADD:
        return [...state, action.data];
      case INVENTORY_ITEM_DROP:
        return state.filter((item) => item !== action.data);
    }
    return state;
  },
  room: (
    state: GameState["room"] = "",
    action: GameAction
  ): GameState["room"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.actors.EGO.defaultRoom;
    }
    return state;
  },
  actors: (
    state: GameState["actors"] = {},
    action: GameAction
  ): GameState["actors"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.actors;
    }

    return state;
  },
  objects: (
    state: GameState["objects"] = {},
    action: GameAction
  ): GameState["objects"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.objects;
      case OBJECT_OBJECT_REMOVE:
        return Object.entries(state)
          .map(([key, value]) => ({
            ...value,
            objects: (value.objects || []).filter(
              (i) => i !== action.data.object
            ),
            key,
          }))
          .reduce((acc, curr) => ({ ...acc, [curr.key]: curr }), {});
    }
    return state;
  },
  rooms: (
    state: GameState["rooms"] = {},
    action: GameAction
  ): GameState["rooms"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.rooms;
      case INVENTORY_ITEM_DROP:
        return {
          ...action.data.rooms,
          [action.data.room]: {
            ...state[action.data.room],
            objects: [
              ...(state[action.data.room].objects || []),
              action.data.object,
            ],
          },
        };
      case ROOM_OBJECT_REMOVE:
        return {
          ...action.data.rooms,
          [action.data.room]: {
            ...state[action.data.room],
            objects: [...(state[action.data.room].objects || [])].filter(
              (i) => i !== action.data.object
            ),
          },
        };
    }
    return state;
  },
  verbs: (
    state: GameState["verbs"] = [],
    action: GameAction
  ): GameState["verbs"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.verbs;
    }
    return state;
  },
  triggersEvents: (
    state: GameState["triggersEvents"] = [],
    action: GameAction
  ): GameState["triggersEvents"] => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.triggersEvents;
    }
    return state;
  },
  gameState: (
    state: GameState["gameState"] = [],
    action: GameAction
  ): GameState["gameState"] => {
    switch (action.type) {
      case "ADD_STATE":
        return [...state, action.data];
      case HYDRATE_NEW:
        return [
          action.data.rooms[action.data.actors.EGO.defaultRoom].descriptions
            .INTRO,
        ];
    }
    return state;
  },
  log: (state: GameState["log"] = [], action: any): GameState["log"] => {
    return [...state, action];
  },
  ended: (
    state: GameState["ended"] = false,
    action: AnyAction
  ): GameState["ended"] => {
    if (action.type === END_GAME) {
      return true;
    } else {
      return state;
    }
  },
  env: (
    state: GameState["env"] = process.env.NODE_ENV || "",
    action: AnyAction
  ): GameState["env"] => {
    switch (action.type) {
      case ENV_SET:
        return action.data;
      default:
        return state;
    }
  },
};

export default createStore(
  combineReducers(reducers),
  applyMiddleware(interactiveParserMiddleware)
);
