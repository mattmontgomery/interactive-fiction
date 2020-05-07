import {
  applyMiddleware,
  createStore,
  combineReducers,
  Action,
  Middleware,
} from "redux";
import { SUBMIT_EVENT } from "../CommandBar";

interface GameAction extends Action {
  data: any;
}

interface Responses {
  [verb: string]: (string | ResponseFunction)[];
}
interface ResponseFunction {
  (verb: string): string;
}

const interactiveParserMiddleware: Middleware = ({ getState }) => {
  return (next) => (action) => {
    console.log({
      searchingFor: SUBMIT_EVENT,
      type: action.type,
      data: action.data,
      nextAction: next(action),
    });
    if (action.type === SUBMIT_EVENT) {
      const currentRoom = getState().rooms[getState().room];

      const objectReducer = (source, append?: string) => (acc, obj) => {
        console.log({
          acc,
          obj,
          append,
          source,
          objs: getState().objects[`${obj}${append}`],
        });
        const object =
          getState().objects[`${obj}${append}`] || getState().objects[obj];
        acc[obj] = { ...object, source };
        return acc;
      };
      const eligibleObjects = {
        ...getState().inventory.reduce(objectReducer("inventory"), {}),
        ...(currentRoom.objects || []).reduce(objectReducer("room"), {}),
        ...(currentRoom.objects || []).reduce(
          objectReducer("room", `-${getState().room}`),
          {}
        ),
      };

      console.log({ eligibleObjects, currentRoom });

      const parts = action.data.split(" ").reverse();
      const verb = parts.pop().toUpperCase();
      if (!~getState().verbs.indexOf(verb)) {
        return next({
          type: "ADD_STATE",
          data: "I'm sorry, I have NO idea what you meant",
        });
      }
      // verb on room
      if (parts.length === 0 && currentRoom.descriptions[verb]) {
        return next({
          type: "ADD_STATE",
          data: currentRoom.descriptions[verb],
        });
      }
      // CASE: WE HAVE NO OBJECT
      if (parts.length === 0 && !currentRoom.descriptions[verb]) {
        return next({
          type: "ADD_STATE",
          data: "I'm sorry, you will have to be more specific.",
        });
      }
      if (parts.reverse()[0].toLowerCase() === "at") {
        // continue
        parts.reverse().pop();
      } else {
        parts.reverse();
      }
      if (parts.length === 0) {
        return next({
          type: "ADD_STATE",
          data: "I'm sorry, you will have to be more specific.",
        });
      }

      // CASE: WE HAVE AN OBJECT
      const object = parts.reverse().join("-").toUpperCase();

      console.log({ object, eligibleObjects });

      // look in your inventory for object

      if (
        eligibleObjects[object] &&
        eligibleObjects[object]!.source === "inventory"
      ) {
        // get the description from the objects
        return next({
          type: "ADD_STATE",
          data: `You are holding ${getState().objects[object].article} ${
            getState().objects[object].name
          }. ${getState().objects[object].descriptions[verb]}`,
        });
      }

      if (
        eligibleObjects[object] &&
        eligibleObjects[object].source === "room" &&
        eligibleObjects[object].descriptions[verb]
      ) {
        // get the description from the objects
        return next({
          type: "ADD_STATE",
          data: eligibleObjects[object].descriptions[verb],
        });
      }

      // we failed to [verb]
      if (FAILURE_RESPONSES[verb]) {
        const failureResponse =
          FAILURE_RESPONSES[verb][
            Math.floor(Math.random() * FAILURE_RESPONSES[verb].length)
          ];
        return next({
          type: "ADD_STATE",
          data:
            typeof failureResponse === "function"
              ? failureResponse(object)
              : failureResponse,
        });
      }
      // if (~getState().objects.indexOf(parts[1]))
      // parse the heck out of that thing
    } else {
      return next(action);
    }
  };
};

const reducers = {
  inventory: (state = {}, action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.actors.EGO.defaultObjects;
    }
    return state;
  },
  room: (state = "", action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.actors.EGO.defaultRoom;
    }
    return state;
  },
  actors: (state = {}, action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.actors;
    }

    return state;
  },
  objects: (state = {}, action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.objects;
    }
    return state;
  },
  rooms: (state = {}, action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.rooms;
    }
    return state;
  },
  verbs: (state = [], action: GameAction) => {
    switch (action.type) {
      case "hydrate":
        return action.data.verbs;
    }
    return state;
  },
  gameState: (state = [], action: GameAction) => {
    switch (action.type) {
      case "ADD_STATE":
        return [...state, action.data];
    }
    return state;
  },
};

const FAILURE_RESPONSES: Responses = {
  LOOK: [
    `The thing you're looking for isn't here.`,
    (lookItem) =>
      `So, uh, this is awkward, but there isn't a ${lookItem} here.`,
    (lookItem) => `Hey. No ${lookItem} here. Sorry. Move along.`,
  ],
  SEARCH: [`You search and search and search, but to no avail.`],
};

export default createStore(
  combineReducers(reducers),
  applyMiddleware(interactiveParserMiddleware)
);
