type MatchScoreProps = {
  matchScore: number;
  verdict: string;
};

export default function MatchScore(props: MatchScoreProps) {
  const { matchScore, verdict } = props;

  return (
    <div>
      <div>{matchScore}/10</div>
      <div>{verdict}</div>
    </div>
  );
}
