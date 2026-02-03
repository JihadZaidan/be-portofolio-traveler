import React from "react";
import { useInitialLoading } from "../../hooks/useInitialLoading";

type InitialShimmerProps = {
  skeleton: React.ReactNode;
  children: React.ReactNode;
  delayMs?: number;
};

const InitialShimmer: React.FC<InitialShimmerProps> = ({ skeleton, children, delayMs }) => {
  const isLoading = useInitialLoading({ delayMs });
  if (isLoading) return <>{skeleton}</>;
  return <>{children}</>;
};

export default InitialShimmer;
