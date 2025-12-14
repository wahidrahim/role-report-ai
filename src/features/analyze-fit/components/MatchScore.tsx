type MatchScoreProps = {
  matchScore?: number;
  verdict?: string;
  isLoading?: boolean;
};

export default function MatchScore({ matchScore, verdict, isLoading }: MatchScoreProps) {
  // Only show loading state if we're loading AND we don't have a score yet
  if (isLoading && matchScore === undefined) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 py-12 animate-in fade-in duration-500">
        <style jsx>{`
          @keyframes scan {
            0% {
              background-position: 200% 0;
            }
            100% {
              background-position: -200% 0;
            }
          }
          .animate-scan {
            background: linear-gradient(
              90deg,
              transparent 0%,
              rgba(255, 255, 255, 0.5) 50%,
              transparent 100%
            );
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: scan 3s linear infinite;
          }
        `}</style>

        <div className="relative">
          {/* Base subtext */}
          <p className="text-xs font-mono text-primary/40 text-center uppercase tracking-[0.2em] relative z-0">
            Processing Data Streams...
          </p>
          {/* Overlay bright shimmer subtext */}
          <div className="absolute inset-0 overflow-hidden z-10 w-full text-center">
            <p className="text-xs font-mono text-center uppercase tracking-[0.2em] animate-scan">
              Processing Data Streams...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    // Custom curve points: [score, hue]
    // Design goals:
    // - 0-4: Red to Orange
    // - 5-6: distinct Amber/Gold (prevent premature green)
    // - 7-8: transitioning to Green
    // - 9-10: deep Emerald
    const points = [
      [0, 0], // Red
      [4, 25], // Orange
      [6, 45], // Amber/Gold
      [8, 100], // Green
      [10, 150], // Emerald
    ];

    // Find the segment
    let lower = points[0];
    let upper = points[points.length - 1];

    for (let i = 0; i < points.length - 1; i++) {
      if (score >= points[i][0] && score <= points[i + 1][0]) {
        lower = points[i];
        upper = points[i + 1];
        break;
      }
    }

    const range = upper[0] - lower[0];
    const progress = range === 0 ? 0 : (score - lower[0]) / range;
    const hue = lower[1] + (upper[1] - lower[1]) * progress;

    // Lightness curve: Brighter for lower scores (alert), slightly deeper for high scores (richness)
    // 60% -> 50%
    const lightness = 60 - (score / 10) * 10;

    return `hsl(${hue}, 95%, ${lightness}%)`;
  };

  return (
    <div className="flex flex-col items-start space-y-4">
      <div
        className="text-8xl font-black tracking-tight text-primary flex items-baseline gap-1"
        style={{
          color: matchScore !== undefined ? getScoreColor(matchScore) : undefined,
        }}
      >
        {matchScore}
        <span className="text-4xl font-medium text-muted-foreground/40">/10</span>
      </div>
      <div className="text-muted-foreground text-lg leading-relaxed">{verdict}</div>
    </div>
  );
}
