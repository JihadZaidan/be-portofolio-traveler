import React from "react";

type SkeletonProps = {
  className?: string;
  rounded?: string;
  style?: React.CSSProperties;
};

const Skeleton: React.FC<SkeletonProps> = ({
  className = "",
  rounded = "rounded-lg",
  style,
}) => {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`.trim()}
      aria-busy="true"
      aria-live="polite"
      style={style}
    />
  );
};

export const SkeletonText: React.FC<{
  lines?: number;
  className?: string;
  lineClassName?: string;
}> = ({ lines = 1, className = "", lineClassName = "" }) => {
  return (
    <div className={className}>
      {Array.from({ length: lines }).map((_, idx) => (
        <Skeleton
          key={idx}
          className={`h-3 ${idx === lines - 1 ? "w-2/3" : "w-full"} ${lineClassName}`.trim()}
        />
      ))}
    </div>
  );
};

export const SkeletonCircle: React.FC<{ size?: number; className?: string }> = ({
  size = 32,
  className = "",
}) => {
  return (
    <Skeleton
      className={`${className}`.trim()}
      rounded="rounded-full"
      style={{ width: size, height: size }}
    />
  );
};

export default Skeleton;
