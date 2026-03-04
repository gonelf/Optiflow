'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Rocket, Github, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

type DeployStep = 'idle' | 'running' | 'done' | 'error';

interface DeployButtonProps {
  pageId: string;
}

export function DeployButton({ pageId }: DeployButtonProps) {
  const [step, setStep] = useState<DeployStep>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [deploymentUrl, setDeploymentUrl] = useState<string | null>(null);
  const [githubUrl, setGithubUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleDeploy = async () => {
    setStep('running');
    setStatusMessage('Preparing files...');
    setErrorMessage(null);
    setDeploymentUrl(null);
    setGithubUrl(null);
    setDialogOpen(true);

    try {
      setStatusMessage('Creating GitHub repository...');
      const res = await fetch(`/api/pages/${pageId}/deploy`, { method: 'POST' });
      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'NO_GITHUB_ACCOUNT') {
          setStep('error');
          setErrorMessage('Please sign in with GitHub to use one-click deploy.');
          return;
        }
        if (data.error === 'INSUFFICIENT_SCOPE') {
          setStep('error');
          setErrorMessage(
            'Your GitHub connection needs the "repo" permission. Please sign out and sign back in with GitHub to grant access.'
          );
          return;
        }
        throw new Error(data.error || 'Deployment failed');
      }

      setStatusMessage('Deploying to Vercel...');
      // Brief pause so the user sees the Vercel step
      await new Promise((r) => setTimeout(r, 400));

      setStep('done');
      setDeploymentUrl(data.deploymentUrl);
      setGithubUrl(data.githubUrl);
    } catch (err) {
      setStep('error');
      setErrorMessage(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const isRunning = step === 'running';

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="border-violet-200 text-violet-700 hover:bg-violet-50"
        onClick={handleDeploy}
        disabled={isRunning}
      >
        {isRunning ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="mr-2 h-4 w-4" />
        )}
        Deploy
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deploy to Vercel</DialogTitle>
            <DialogDescription>
              Your page will be published as a live website.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {isRunning && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-violet-600" />
                <span>{statusMessage}</span>
              </div>
            )}

            {step === 'done' && deploymentUrl && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 font-medium">
                  <CheckCircle className="h-5 w-5" />
                  <span>Your page is live!</span>
                </div>

                <a
                  href={deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-violet-600 shrink-0" />
                  <span className="flex-1 truncate text-blue-600 underline">{deploymentUrl}</span>
                </a>

                {githubUrl && (
                  <a
                    href={githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Github className="h-4 w-4" />
                    View source on GitHub
                  </a>
                )}
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-red-600 font-medium">
                  <XCircle className="h-5 w-5" />
                  <span>Deployment failed</span>
                </div>
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
