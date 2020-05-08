import { RefObject } from "react";

export default (el: RefObject<HTMLElement>) => () => {
  if (
    el &&
    el.current &&
    el.current.parentElement &&
    el.current.offsetHeight > el.current.parentElement!.offsetHeight
  ) {
    el.current.parentElement.scrollTo(0, el.current.scrollHeight);
  }
};
