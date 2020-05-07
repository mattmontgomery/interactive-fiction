import { Store } from "redux";

export default async function hydrateFromJson(
  store: any,
  uri: string
): Promise<Store> {
  const resp = await fetch(uri);
  store.dispatch({
    type: "hydrate",
    data: await resp.json(),
  });
  return store;
}
