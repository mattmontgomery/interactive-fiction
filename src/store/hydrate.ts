import { Store } from "redux";
import { HYDRATE_NEW } from "./actions";

export default async function hydrateFromJson(
  store: any,
  uri: string
): Promise<Store> {
  const resp = await fetch(uri);
  store.dispatch({
    type: HYDRATE_NEW,
    data: await resp.json(),
  });
  return store;
}
