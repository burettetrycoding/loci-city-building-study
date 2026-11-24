import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CommandBlockProps {
  title: string;
  code: string;
}

const CommandBlock: React.FC<CommandBlockProps> = ({ title, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API unavailable
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-2.5 text-xs text-slate-400">
        <span>{title}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-200 transition-colors hover:bg-slate-800"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-teal-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-slate-100">
        <code>{code}</code>
      </pre>
    </div>
  );
};

export const GitHubGuideView: React.FC = () => {
  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h2 className="font-display text-3xl font-semibold text-slate-900">
          Host Your Study City on GitHub Pages
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          This project is already configured with a relative asset path and an automated GitHub Actions workflow so you can host it for free on GitHub Pages in a few minutes.
        </p>
      </div>

      {/* Step 1 */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-slate-900">
          01. Create a GitHub Repository
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Sign in to GitHub and create a new public repository (for example, <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">loci-study-city</code>). Leave it empty without adding a README if you plan to push from your terminal.
        </p>
      </section>

      {/* Step 2 */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-slate-900">
          02. Push Your Code to GitHub
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          Open a terminal inside your downloaded project folder and run these commands (replace <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">YOUR_USERNAME</code> and <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">loci-study-city</code>):
        </p>
        <CommandBlock
          title="Terminal — Push to main branch"
          code={`git init
git add .
git commit -m "Initial Loci focus city builder"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/loci-study-city.git
git push -u origin main`}
        />
      </section>

      {/* Step 3 */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-slate-900">
          03. Turn On GitHub Pages
        </h3>
        <ol className="list-inside list-decimal space-y-2 text-sm leading-relaxed text-slate-600">
          <li>Open your repository on GitHub and click <strong>Settings</strong>.</li>
          <li>In the left sidebar, click <strong>Pages</strong>.</li>
          <li>Under <strong>Build and deployment &rarr; Source</strong>, select <strong>GitHub Actions</strong>.</li>
          <li>
            The included <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">.github/workflows/deploy.yml</code> workflow will automatically run <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">npm run build</code> and publish your static HTML site.
          </li>
        </ol>
        <p className="pt-1 text-sm text-slate-600">
          Within about 60 seconds, your live URL will appear at{' '}
          <span className="font-mono text-xs font-medium text-teal-700">
            https://YOUR_USERNAME.github.io/loci-study-city/
          </span>
          .
        </p>
      </section>

      {/* Alternative static HTML method */}
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6">
        <h3 className="font-display text-lg font-semibold text-slate-900">
          Alternative: Build Static HTML Files Manually
        </h3>
        <p className="text-sm leading-relaxed text-slate-600">
          If you prefer uploading plain HTML, CSS, and JavaScript files directly via GitHub&apos;s web interface, build the <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800">dist/</code> folder locally and upload its contents to a repository, then set Pages Source to <strong>Deploy from a branch (main / root)</strong>:
        </p>
        <CommandBlock
          title="Terminal — Generate static HTML folder"
          code={`npm install
npm run build
# Upload everything inside the generated dist/ folder (index.html + assets/)`}
        />
      </section>
    </div>
  );
};
