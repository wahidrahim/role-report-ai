type MatchScoreProps = {
  matchScore: number;
  verdict: string;
};

export default function MatchScore(props: MatchScoreProps) {
  const { matchScore, verdict } = props;
  const scoreOutOf10 = matchScore / 10;

  return (
    <div>
      <div>{scoreOutOf10}/10</div>
      <div>{verdict}</div>
    </div>
  );
}
