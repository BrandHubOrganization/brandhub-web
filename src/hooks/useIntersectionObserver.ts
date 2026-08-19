import { useEffect, useRef, useState } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export function useIntersectionObserver(
  options: UseIntersectionObserverOptions = {},
) {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    freezeOnceVisible = false,
  } = options;
  const [targetRef, setTargetRef] = useState<Element | null>(null);
  const [isIntersecting, setIsIntersecting] = useState<boolean>(false);

  const frozenRef = useRef<boolean>(false);

  useEffect(() => {
    if (!targetRef || (freezeOnceVisible && frozenRef.current)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        if (isElementIntersecting && freezeOnceVisible) {
          frozenRef.current = true;
          observer.disconnect();
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(targetRef);

    return () => {
      observer.disconnect();
    };
  }, [targetRef, threshold, root, rootMargin, freezeOnceVisible]);

  return { ref: setTargetRef, isIntersecting };
}
