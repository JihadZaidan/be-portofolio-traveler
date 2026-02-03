import { useEffect, useState } from "react";

type UseInitialLoadingOptions = {
  delayMs?: number;
};

export const useInitialLoading = (options: UseInitialLoadingOptions = {}) => {
  const { delayMs = 850 } = options;
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const t = window.setTimeout(() => {
      setIsLoading(false);
    }, delayMs);
    return () => window.clearTimeout(t);
  }, [delayMs]);

  return isLoading;
};
