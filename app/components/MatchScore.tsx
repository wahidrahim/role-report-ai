type MatchScoreProps = {
  matchScore: number;
  verdict: string;
};

export default function MatchScore(props: MatchScoreProps) {
  const { matchScore, verdict } = props;
  let scoreOutOfTen = (matchScore / 10).toFixed(1);

  if (scoreOutOfTen.endsWith('.0')) {
    scoreOutOfTen = scoreOutOfTen.slice(0, -2);
  }

  return (
    <div>
      <div>{scoreOutOfTen}/10</div>
      <div>{verdict}</div>
    </div>
  );
}
