"use client";

import { useEffect, useSyncExternalStore } from "react";
import {
  bagEditLink,
  resolveBagLink,
  type LookbookBag,
} from "@/lib/bag-edit-links";

const changed = "dearelle-lookbook-link";
const entryKey = "dearelleLookbookOverlay";
function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener);
  window.addEventListener(changed, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(changed, listener);
  };
}
const getSearch = () => window.location.search;
const serverSearch = () => "";
const notify = () => window.dispatchEvent(new Event(changed));

function collectionLink() {
  const url = new URL(window.location.href);
  url.searchParams.delete("bag");
  url.searchParams.delete("colour");
  return `${url.pathname}${url.search}${url.hash}`;
}

export function useBagLookbook(bags: LookbookBag[]) {
  const search = useSyncExternalStore(subscribe, getSearch, serverSearch);
  const selected = resolveBagLink(bags, search);

  useEffect(() => {
    // A link opened from WhatsApp needs a collection entry underneath it too.
    // Preserve Next's existing history state; don't emit synthetic popstate events.
    if (
      resolveBagLink(bags, window.location.search) &&
      !history.state?.[entryKey]
    ) {
      const href = `${location.pathname}${location.search}${location.hash}`;
      history.replaceState(
        { ...history.state, [entryKey]: false },
        "",
        collectionLink(),
      );
      history.pushState({ ...history.state, [entryKey]: true }, "", href);
      notify();
    }
  }, [bags]);

  function open(bag: LookbookBag, colour: string) {
    history.pushState(
      { ...history.state, [entryKey]: true },
      "",
      bagEditLink(bag.slug, colour),
    );
    notify();
  }
  function close() {
    if (history.state?.[entryKey]) history.back();
    else {
      history.replaceState(history.state, "", collectionLink());
      notify();
    }
  }
  function chooseColour(id: string) {
    if (!selected) return;
    history.replaceState(
      { ...history.state, [entryKey]: true },
      "",
      bagEditLink(selected.bag.slug, id),
    );
    notify();
  }
  return {
    selected,
    invalid: new URLSearchParams(search).has("bag") && !selected,
    open,
    close,
    chooseColour,
  };
}
