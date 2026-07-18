import { spawnSync } from 'node:child_process';

export interface NativeFolderDialogCommand {
  command: string;
  args: string[];
}

// Prefer PowerShell 7+ (`pwsh`) when it's installed. Windows PowerShell 5.1
// (`powershell.exe`) runs on .NET Framework, whose `FolderBrowserDialog` has no
// modern-dialog upgrade path — it always renders the legacy Windows-95-style
// folder tree, which users find hard to navigate and which is flaky at
// returning `SelectedPath`. pwsh runs on .NET 5+, where the SAME
// `FolderBrowserDialog` renders the modern Windows 11 folder picker and returns
// reliably. Detection is a one-shot cheap probe; the result is cached so a
// user opening the picker repeatedly doesn't re-spawn a probe each time.
let cachedWindowsShell: string | undefined;

export function resolveWindowsPowerShell(): string {
  if (cachedWindowsShell) return cachedWindowsShell;
  try {
    const probe = spawnSync('pwsh', ['-NoProfile', '-Command', '$PSVersionTable.PSVersion.Major'], {
      timeout: 5_000,
      windowsHide: true,
    });
    if (probe.status === 0) {
      cachedWindowsShell = 'pwsh';
      return cachedWindowsShell;
    }
  } catch {
    /* pwsh not installed — fall back to Windows PowerShell */
  }
  cachedWindowsShell = 'powershell.exe';
  return cachedWindowsShell;
}

function errorCode(error: unknown): unknown {
  return error && typeof error === 'object' && 'code' in error
    ? (error as { code?: unknown }).code
    : undefined;
}

function errorMessage(error: unknown): string {
  if (error instanceof Error && error.message) return error.message;
  return String(error);
}

function hardLinuxFolderDialogFailure(error: unknown, stderrText: string): string | null {
  const code = errorCode(error);
  if (code === 'ENOENT') return 'zenity is not installed';
  if (/cannot open display/i.test(stderrText)) return stderrText;
  if (/no such file or directory/i.test(stderrText) && /zenity/i.test(stderrText)) return stderrText;
  return null;
}

const WINDOWS_FOLDER_DIALOG_SCRIPT = [
  'Add-Type -AssemblyName System.Windows.Forms;',
  '$owner = New-Object System.Windows.Forms.Form;',
  "$owner.Text = 'Open Design';",
  '$owner.TopMost = $true;',
  '$owner.ShowInTaskbar = $true;',
  "$owner.StartPosition = 'CenterScreen';",
  '$owner.Width = 1;',
  '$owner.Height = 1;',
  '$dialog = New-Object System.Windows.Forms.FolderBrowserDialog;',
  "$dialog.Description = 'Select a code folder to link';",
  '$dialog.ShowNewFolderButton = $true;',
  'try {',
  '  if ($dialog.ShowDialog($owner) -eq [System.Windows.Forms.DialogResult]::OK) { $dialog.SelectedPath }',
  '} finally {',
  '  $owner.Dispose();',
  '}',
].join(' ');

export function buildWindowsFolderDialogCommand(
  shell: string = resolveWindowsPowerShell(),
): NativeFolderDialogCommand {
  return {
    command: shell,
    args: ['-NoProfile', '-Sta', '-Command', WINDOWS_FOLDER_DIALOG_SCRIPT],
  };
}

export function parseFolderDialogStdout(error: unknown, stdout: string): string | null {
  if (error) {
    return null;
  }

  const selectedPath = stdout.trim();
  return selectedPath.length > 0 ? selectedPath : null;
}

export function parseLinuxFolderDialogResult(error: unknown, stdout: string, stderr: string): string | null {
  if (error) {
    const stderrText = stderr.trim();
    const code = errorCode(error);
    const hardFailure = hardLinuxFolderDialogFailure(error, stderrText);
    if (hardFailure) {
      throw new Error(`Could not open folder picker: ${hardFailure}`);
    }
    if (code === 1) return null;
    throw new Error(`Could not open folder picker: ${stderrText || errorMessage(error)}`);
  }

  const selectedPath = stdout.trim();
  return selectedPath.length > 0 ? selectedPath : null;
}
