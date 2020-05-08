import { SUBMIT_EVENT } from "../CommandBar";
import { Dispatch, AnyAction } from "redux";
import {
  INVENTORY_ITEM_ADD,
  INVENTORY_ITEM_DROP,
  ROOM_OBJECT_REMOVE,
  OBJECT_OBJECT_REMOVE,
  END_GAME,
  ENV_SET,
} from "../store/actions";
import { getResponse } from "../strings";

import { GameState } from "../interfaces";

interface ParserAction extends AnyAction {
  data: any;
}

export default function parser(
  state: GameState,
  next: Dispatch,
  action: ParserAction
) {
  let failure = true;
  if (action.type !== SUBMIT_EVENT) {
    return next(action);
  }
  const parts = action.data.toUpperCase().split(" ").reverse();

  if (action.data!.toUpperCase() === "CHEAT: END GAME") {
    return next({
      type: END_GAME,
    });
  }
  const verb = parts.pop();

  if (verb === "SETENV") {
    return next({ type: ENV_SET, data: parts.join("") });
  }
  const currentRoom = state.rooms[state.room];

  const objectReducer = (source, append?: string) => (acc, obj) => {
    const object = state.objects[`${obj}${append}`] || state.objects[obj] || {};
    acc[obj] = { ...object, source };
    return acc;
  };
  const inventoryObjects = {
    ...state.inventory.reduce(objectReducer("inventory"), {}),
  };
  const eligibleObjects = {
    ...state.inventory.reduce(objectReducer("inventory"), {}),
    ...(currentRoom.objects || []).reduce(objectReducer("room"), {}),
    ...(currentRoom.objects || []).reduce(
      objectReducer("room", `-${state.room}`),
      {}
    ),
    ...Object.values(inventoryObjects)
      .map((item: any) => item.objects)
      .reduce((acc, curr) => [...acc, ...(curr || [])], [])
      .reduce(objectReducer("inventory-item"), {}),
  };

  if (!~state.verbs.indexOf(verb)) {
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
  // strip the word "at"
  if (parts.length && parts.reverse()[0].toLowerCase() === "at") {
    // continue
    parts.reverse().pop();
  } else {
    parts.reverse();
  }
  // verb on self
  if (
    (parts.length === 0 || ~["SELF", "ME"].indexOf(parts.join())) &&
    state.actors.EGO.descriptions[verb]
  ) {
    return next({
      type: "ADD_STATE",
      data: state.actors.EGO.descriptions[verb],
    });
  }
  // CASE: WE HAVE NO OBJECT
  if (parts.length === 0 && !currentRoom.descriptions[verb]) {
    return next({
      type: "ADD_STATE",
      data: "I'm sorry, you will have to be more specific.",
    });
  }

  // CASE: WE HAVE AN OBJECT
  const object = parts.reverse().join("-");

  // look in your inventory for object
  if (
    verb === "GET" &&
    eligibleObjects[object] &&
    eligibleObjects[object].source === "inventory"
  ) {
    return next({
      type: "ADD_STATE",
      data: getResponse(
        false,
        "GET_INVENTORY",
        object,
        eligibleObjects[object]
      ),
    });
  }

  // potentially pick up an item
  if (
    verb === "GET" &&
    eligibleObjects[object] &&
    eligibleObjects[object].source !== "inventory" &&
    eligibleObjects[object].canGet
  ) {
    next({
      type: INVENTORY_ITEM_ADD,
      data: object,
    });
    const sourceObjectMapper = {
      room: ROOM_OBJECT_REMOVE,
      "inventory-item": OBJECT_OBJECT_REMOVE,
    };
    next({
      type: sourceObjectMapper[eligibleObjects[object].source],
      data: { object, room: state.room },
    });
    return next({
      type: "ADD_STATE",
      data:
        eligibleObjects[object].descriptions[verb] ||
        getResponse(true, "GET", object, eligibleObjects[object]),
    });
  }

  // drop an item
  if (verb === "DROP" && eligibleObjects[object]) {
    if (eligibleObjects[object].source === "inventory") {
      next({
        type: INVENTORY_ITEM_DROP,
        data: {
          object,
          room: state.room,
        },
      });
      return next({
        type: "ADD_STATE",
        data: getResponse(true, "DROP", object, eligibleObjects[object]),
      });
    } else {
      return next({
        type: "ADD_STATE",
        data: getResponse(false, "DROP", object, eligibleObjects[object]),
      });
    }
  }

  if (
    verb !== "GET" &&
    eligibleObjects[object] &&
    eligibleObjects[object]!.source === "inventory" &&
    eligibleObjects[object]!.descriptions[verb]
  ) {
    // get the description from the objects
    return next({
      type: "ADD_STATE",
      data: getResponse(
        true,
        `${verb}_INVENTORY`,
        object,
        state.objects[object]
      ),
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

  if (parts.length === 3 && verb === "USE") {
    const receivingObject = parts[2];
    const actingObject = parts[0];
    // check eligible objects
    if (
      eligibleObjects[receivingObject] &&
      eligibleObjects[actingObject] &&
      eligibleObjects[receivingObject].usesObjects &&
      ~eligibleObjects[receivingObject].usesObjects.indexOf(actingObject)
    ) {
      next({
        type: "ADD_STATE",
        data:
          eligibleObjects[receivingObject].descriptions[
            `${verb}-${actingObject}`
          ],
      });
      failure = false;
      if (
        ~state.triggersEvents.indexOf(verb) &&
        currentRoom.events &&
        currentRoom.events[`${verb}-${receivingObject}-${actingObject}`]
      ) {
        const event =
          currentRoom.events[`${verb}-${receivingObject}-${actingObject}`];
        if (event.triggers === "END_GAME") {
          next({
            type: END_GAME,
          });
        }
      }
    }
  }
  // we failed to [verb]
  if (failure) {
    return next({
      type: "ADD_STATE",
      data: getResponse(false, verb, object),
    });
  }
}
