import { AlertCircle } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/core/components/ui/alert';

type AnalysisErrorAlertProps = {
  title: string;
  message: string;
};

export function AnalysisErrorAlert(props: AnalysisErrorAlertProps) {
  const { title, message } = props;

  return (
    <Alert
      variant="destructive"
      className="bg-destructive/10 text-destructive border-destructive/20"
    >
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
