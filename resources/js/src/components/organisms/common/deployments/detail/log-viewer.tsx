interface LogViewerProps {
  logLines: string[];
}

function LogViewer({ logLines }: LogViewerProps) {
  if (!logLines || logLines.length === 0) {
    return (
      <div className="rounded-lg border border-virel-border bg-[#0a0c10] p-4">
        <div className="flex h-32 items-center justify-center text-virel-textMuted">No log output yet.</div>
      </div>
    );
  }

  return (
    <div className="max-h-[500px] overflow-y-auto rounded-lg border border-virel-border bg-[#0a0c10] p-4 font-mono text-sm">
      <div className="flex flex-col">
        {logLines.map((line, i) => {
          const isSuccess = line.includes('completed successfully') || line.includes('Backup saved');
          const isError = line.includes('Error:') || line.includes('failed');
          let textColor = 'text-virel-text';
          if (isSuccess) textColor = 'text-[#40916c]';
          if (isError) textColor = 'text-virel-errorText';

          return (
            <div key={i} className="flex rounded px-2 hover:bg-white/5">
              <span className="mr-4 w-8 shrink-0 text-right text-virel-textMuted select-none">{i + 1}</span>
              <span className={`${textColor} break-all whitespace-pre-wrap`}>{line}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { LogViewer };
export type { LogViewerProps };
