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

interface GameAction extends Action {
  data: any;
}

const interactiveParserMiddleware: Middleware = ({ getState }) => {
  return (next) => (action) => parser(getState(), next, action);
};

const reducers = {
  inventory: (state = [], action: GameAction) => {
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
  room: (state = "", action: GameAction) => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.actors.EGO.defaultRoom;
    }
    return state;
  },
  actors: (state = {}, action: GameAction) => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.actors;
    }

    return state;
  },
  objects: (state = {}, action: GameAction) => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.objects;
      case OBJECT_OBJECT_REMOVE:
        return Object.entries(state)
          .map(([key, value]) => ({
            ...(value as {}),
            objects: ((value as { objects: string[] }).objects || []).filter(
              (i) => i !== action.data.object
            ),
            key,
          }))
          .reduce((acc, curr) => ({ ...acc, [curr.key]: curr }), {});
    }
    return state;
  },
  rooms: (state = {}, action: GameAction) => {
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
  verbs: (state = [], action: GameAction) => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.verbs;
    }
    return state;
  },
  triggersEvents: (state = [], action: GameAction) => {
    switch (action.type) {
      case HYDRATE_NEW:
        return action.data.triggersEvents;
    }
    return state;
  },
  gameState: (state = [], action: GameAction) => {
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
  log: (state = [], action: any) => {
    return [...state, action];
  },
  ended: (state = false, action: AnyAction) => {
    if (action.type === END_GAME) {
      return true;
    } else {
      return state;
    }
  },
  env: (state = process.env.NODE_ENV || "", action: AnyAction) => {
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
