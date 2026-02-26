import React from "react";

type AiMotionLoadingPageProps = {
  label?: string;
};

const AiMotionLoadingPage: React.FC<AiMotionLoadingPageProps> = ({
  label = "Preparing AI Workspace",
}) => {
  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-[#070B2B]">
      <style>{`
        @keyframes aiFloat {
          0% { transform: translate3d(0, 0, 0) scale(1); }
          50% { transform: translate3d(0, -10px, 0) scale(1.04); }
          100% { transform: translate3d(0, 0, 0) scale(1); }
        }
        @keyframes aiSpin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes aiBlob {
          0% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
          33% { border-radius: 54% 46% 58% 42% / 46% 58% 42% 54%; }
          66% { border-radius: 44% 56% 46% 54% / 56% 44% 54% 46%; }
          100% { border-radius: 50% 50% 50% 50% / 50% 50% 50% 50%; }
        }
        @keyframes aiHue {
          0% { filter: hue-rotate(0deg) saturate(1.1); }
          50% { filter: hue-rotate(28deg) saturate(1.25); }
          100% { filter: hue-rotate(0deg) saturate(1.1); }
        }
        @keyframes aiGlow {
          0% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.85; transform: scale(1.06); }
          100% { opacity: 0.55; transform: scale(1); }
        }
      `}</style>

      <div className="flex flex-col items-center gap-5">
        <div
          className="relative h-40 w-40"
          style={{
            animation: "aiFloat 1400ms ease-in-out infinite",
          }}
        >
          <div
            className="absolute -inset-3"
            style={{
              animation: "aiSpin 1100ms linear infinite",
            }}
          >
            <div
              className="h-full w-full"
              style={{
                borderRadius: "9999px",
                background:
                  "conic-gradient(from 0deg, rgba(120,170,255,0.0), rgba(120,170,255,0.95), rgba(240,120,255,0.85), rgba(70,210,255,0.85), rgba(120,170,255,0.0))",
                filter: "blur(0.2px)",
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
                mask:
                  "radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 6px))",
                opacity: 0.9,
              }}
            />
          </div>

          <div
            className="absolute inset-0 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.85), rgba(255,255,255,0.20) 35%, rgba(255,255,255,0) 70%)",
              animation: "aiHue 2200ms ease-in-out infinite",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(255,150,240,0.95), rgba(140,130,255,0.75) 40%, rgba(70,210,255,0.55) 70%, rgba(0,0,0,0) 100%)",
              filter: "blur(0px)",
              animation: "aiHue 2400ms ease-in-out infinite, aiBlob 1600ms ease-in-out infinite",
            }}
          />

          <div
            className="absolute -inset-8 rounded-full"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(120,170,255,0.35), rgba(240,120,255,0.12) 55%, rgba(0,0,0,0) 70%)",
              filter: "blur(18px)",
              animation: "aiGlow 1600ms ease-in-out infinite",
            }}
          />

          <div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow:
                "0 0 0 1px rgba(255,255,255,0.12), 0 18px 55px rgba(0,0,0,0.55)",
            }}
          />
        </div>

        <div className="text-center">
          <p className="text-sm font-semibold text-white">{label}</p>
          <p className="mt-1 text-xs text-white/65">AI motion loading</p>
        </div>
      </div>
    </div>
  );
};

export default AiMotionLoadingPage;
