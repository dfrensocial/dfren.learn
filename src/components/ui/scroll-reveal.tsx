"use client";

import { useEffect } from "react";

/**
 * Scroll motion for the whole site: one small script, one IntersectionObserver, CSS does the animating
 * (see the "Motion" block in globals.css). No animation library.
 *
 * Everything REPLAYS: an element animates in when it enters the screen and resets once it has left, so
 * scrolling away and back plays it again (up or down). Pages render fully visible without JS; elements are
 * only tagged after hydration. Effects:
 *  - blocks fade and rise; card groups (grids, lists) fade, rise and scale in one after another;
 *  - headings (landing page) reveal word by word out of a mask;
 *  - images wipe open from the top while settling from a slight zoom;
 *  - numbers count up (`data-count`);
 *  - the hero replays its load animation whenever you come back to the top.
 *
 * Default (no props): landing-page behaviour. `items`: a CSS selector for the exact elements to reveal on
 * pages with another structure (blog, legal). `stagger` delays those items in sequence.
 */
const STAGGER_MS = 70;
const MAX_STAGGER_STEPS = 5;

type Kind = "reveal" | "img" | "split" | "count";

function splitWords(el: HTMLElement) {
  let i = 0;
  const walk = (node: Node) => {
    Array.from(node.childNodes).forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const frag = document.createDocumentFragment();
        (child.textContent ?? "").split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) {
            frag.appendChild(document.createTextNode(" "));
            return;
          }
          const outer = document.createElement("span");
          outer.className = "split-word";
          const inner = document.createElement("span");
          inner.style.setProperty("--i", String(i++));
          inner.textContent = part;
          outer.appendChild(inner);
          frag.appendChild(outer);
        });
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        walk(child);
      }
    });
  };
  walk(el);
}

export function ScrollReveal({ items, stagger = false }: { items?: string; stagger?: boolean } = {}) {
  useEffect(() => {
    const kinds = new Map<Element, Kind>();
    const imagesByHost = new Map<Element, HTMLElement[]>();
    const undo: (() => void)[] = [];
    const countTimers = new Map<Element, { timeout?: number; raf?: number }>();
    const skip = (el: Element) => Boolean(el.closest(".marquee"));

    function addBlock(el: Element, step = 0, scale = false) {
      const node = el as HTMLElement;
      if (skip(node) || kinds.has(node)) return;
      node.style.setProperty("--reveal-delay", `${Math.min(step, MAX_STAGGER_STEPS) * STAGGER_MS}ms`);
      node.classList.add("reveal");
      if (scale) node.classList.add("reveal-scale");
      kinds.set(node, "reveal");
      undo.push(() => {
        node.classList.remove("reveal", "reveal-scale", "is-visible");
        node.style.removeProperty("--reveal-delay");
      });
    }

    function addHeading(el: Element) {
      const node = el as HTMLElement;
      if (skip(node) || kinds.has(node) || node.dataset.split) return;
      const original = node.innerHTML;
      node.dataset.split = "1";
      node.setAttribute("aria-label", node.textContent?.trim() ?? "");
      splitWords(node);
      kinds.set(node, "split");
      undo.push(() => {
        node.innerHTML = original;
        node.classList.remove("split-in");
        node.removeAttribute("aria-label");
        delete node.dataset.split;
      });
    }

    // A fully clipped image reports zero visible area, so the observer would never fire for it.
    // We watch its container instead and open every image inside when the container is on screen.
    function addImage(el: Element) {
      const node = el as HTMLElement;
      const host = node.parentElement;
      if (!host || skip(node) || kinds.has(node) || node.offsetWidth < 120) return;
      node.classList.add("reveal-img");
      kinds.set(node, "img");
      imagesByHost.set(host, [...(imagesByHost.get(host) ?? []), node]);
      undo.push(() => node.classList.remove("reveal-img", "is-visible"));
    }

    function addCounter(el: Element) {
      const node = el as HTMLElement;
      const finalText = node.dataset.count ?? "";
      if (Number.isNaN(parseFloat(finalText))) return;
      node.textContent = (0).toFixed((finalText.split(".")[1] ?? "").length);
      kinds.set(node, "count");
      undo.push(() => {
        node.textContent = finalText;
      });
    }

    const firstSection = document.querySelector("main > section");

    if (items) {
      document.querySelectorAll(items).forEach((el, i) => addBlock(el, stagger ? i % (MAX_STAGGER_STEPS + 1) : 0));
    } else {
      document.querySelectorAll("main section h2, main section h3").forEach(addHeading);
      document.querySelectorAll("main > section").forEach((section) => {
        const inner = section.firstElementChild;
        if (!inner) return;
        const isHero = section === firstSection;
        Array.from(inner.children).forEach((block) => {
          if (/^H[1-6]$/.test(block.tagName)) return; // headings animate by word, not as a block
          if (isHero && block.tagName !== "DL") return; // the hero has its own load animation
          const isGroup =
            /^(UL|OL|DL)$/.test(block.tagName) || (block.classList.contains("grid") && block.children.length > 1);
          if (isGroup && !isHero) {
            Array.from(block.children).forEach((item, i) => addBlock(item, i % (MAX_STAGGER_STEPS + 1), true));
          } else {
            addBlock(block);
          }
        });
      });
      document.querySelectorAll("main section img").forEach(addImage);
      document.querySelectorAll("[data-count]").forEach(addCounter);

      // Dark bands open up like a curtain as they scroll in (CSS scroll-driven; the hero is excluded).
      document.querySelectorAll("main > section.bg-black").forEach((band) => {
        if (band === firstSection) return;
        band.classList.add("band-in");
        undo.push(() => band.classList.remove("band-in"));
      });

      // Cursor-following glow on `.glow-card` cards (module cards).
      const onMove = (e: PointerEvent) => {
        const card = (e.target as Element | null)?.closest?.(".glow-card") as HTMLElement | null;
        if (!card) return;
        const r = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - r.left}px`);
        card.style.setProperty("--my", `${e.clientY - r.top}px`);
      };
      document.addEventListener("pointermove", onMove, { passive: true });
      undo.push(() => document.removeEventListener("pointermove", onMove));
    }

    function countUp(node: HTMLElement) {
      const finalText = node.dataset.count ?? "";
      const target = parseFloat(finalText);
      const decimals = (finalText.split(".")[1] ?? "").length;
      const state = countTimers.get(node) ?? {};
      countTimers.set(node, state);
      const start = performance.now();
      const tick = (now: number) => {
        const t = Math.min(1, (now - start) / 1500);
        node.textContent = (target * (1 - Math.pow(1 - t, 3))).toFixed(decimals);
        if (t < 1) state.raf = requestAnimationFrame(tick);
        else node.textContent = finalText;
      };
      state.raf = requestAnimationFrame(tick);
    }

    function setVisible(el: Element, kind: Kind, on: boolean) {
      const node = el as HTMLElement;
      if (kind === "split") {
        node.classList.toggle("split-in", on);
      } else if (kind === "count") {
        const state = countTimers.get(node) ?? {};
        countTimers.set(node, state);
        window.clearTimeout(state.timeout);
        if (state.raf) cancelAnimationFrame(state.raf);
        if (on) {
          state.timeout = window.setTimeout(() => countUp(node), 450);
        } else {
          node.textContent = (0).toFixed(((node.dataset.count ?? "").split(".")[1] ?? "").length);
        }
      } else {
        node.classList.toggle("is-visible", on);
      }
    }

    // Hero: replay the load animation each time you scroll back up to it.
    let heroObserver: IntersectionObserver | undefined;
    if (!items && firstSection && "IntersectionObserver" in window) {
      let left = false;
      heroObserver = new IntersectionObserver(([entry]) => {
        if (!entry.isIntersecting) {
          left = true;
          return;
        }
        if (!left) return;
        left = false;
        const parts = firstSection.querySelectorAll<HTMLElement>(".hero-word, .hero-rise");
        parts.forEach((p) => p.classList.add("anim-off"));
        void (firstSection as HTMLElement).offsetWidth; // force a reflow so the animation restarts
        parts.forEach((p) => p.classList.remove("anim-off"));
      });
      heroObserver.observe(firstSection);
    }

    if (!("IntersectionObserver" in window)) {
      kinds.forEach((kind, el) => setVisible(el, kind, true));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const on = e.isIntersecting;
          imagesByHost.get(e.target)?.forEach((img) => setVisible(img, "img", on));
          const kind = kinds.get(e.target);
          if (kind && kind !== "img") setVisible(e.target, kind, on);
        }
      },
      { threshold: 0.01, rootMargin: "0px 0px -8% 0px" },
    );
    kinds.forEach((kind, el) => {
      if (kind !== "img") io.observe(el);
    });
    imagesByHost.forEach((_, host) => io.observe(host));

    return () => {
      io.disconnect();
      heroObserver?.disconnect();
      countTimers.forEach((s) => {
        window.clearTimeout(s.timeout);
        if (s.raf) cancelAnimationFrame(s.raf);
      });
      // Leave the page exactly as the server rendered it (route change, dev hot reload).
      undo.forEach((fn) => fn());
    };
  }, [items, stagger]);

  return null;
}
