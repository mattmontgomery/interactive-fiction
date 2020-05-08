interface InventoryObject {
  article: string;
  name: string;
  descriptions: {
    [verb: string]: string;
  };
}
interface ResponseFunction {
  (object: string, extra?: InventoryObject | any): string;
}
interface Responses {
  [verb: string]: (string | ResponseFunction)[];
}
export const FAILURE_RESPONSES: Responses = {
  GET_INVENTORY: [
    `Yeah, you're already holding that. I mean, you could drop it and pick it up, if you wanted, I guess, but why?`,
    (obj, extra) =>
      `You're already holding ${(extra as InventoryObject).article} ${
        (extra as InventoryObject).name
      }.`,
  ],
  DROP: [
    `You're not holding that. So... yeah.`,
    (_, extra) =>
      `You're not holding ${(extra as InventoryObject).article} ${
        (extra as InventoryObject).name
      }. K?`,
  ],
  LOOK: [
    `The thing you're looking for isn't here.`,
    (lookItem) =>
      `So, uh, this is awkward, but there isn't a ${lookItem} here.`,
    (lookItem) => `Hey. No ${lookItem} here. Sorry. Move along.`,
  ],
  SEARCH: [`You search and search and search, but to no avail.`],
  GET: [`You can't get that. Sorry.`],
  MALFORMED_REQUEST: [
    "What did you think was going to happen? Nothing happens.",
  ],
};

export const SUCCESS_RESPONSES: Responses = {
  DROP: [
    `You have successfully dropped the thing you were holding. You're having so much fun. Whee!`,
    (obj) => `Yeah! You dropped ${obj}! What next?`,
  ],
  LOOK: [
    `The thing you're looking for isn't here.`,
    (lookItem) =>
      `So, uh, this is awkward, but there isn't a ${lookItem} here.`,
    (lookItem) => `Hey. No ${lookItem} here. Sorry. Move along.`,
  ],
  LOOK_INVENTORY: [(item, extra: InventoryObject) => extra.descriptions.LOOK],
  SEARCH: [],
  SEARCH_INVENTORY: [
    (item, extra) =>
      `You are holding ${(extra as InventoryObject).article} ${
        (extra as InventoryObject).name
      }. ${(extra as InventoryObject).descriptions.SEARCH}`,
  ],
  GET: [
    `You successfully pick the thing up you wanted to pick up. Nice job. A gold star appears on your forehead.`,
    (item, extra) =>
      `You get ${(extra as InventoryObject).article} ${
        (extra as InventoryObject).name
      }. Neat!`,
  ],
};

export function getResponse(success, action, data, extra?) {
  console.log({ success, action, data, extra });
  const responseSet = success ? SUCCESS_RESPONSES : FAILURE_RESPONSES;
  action = !responseSet[action] ? "MALFORMED_REQUEST" : action;
  const response =
    responseSet[action][Math.floor(Math.random() * responseSet[action].length)];
  return typeof response === "function" ? response(data, extra) : response;
}
