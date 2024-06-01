import { ExtensionContext, StatusBarAlignment, window, extensions } from 'vscode';

export async function activate(context: ExtensionContext) {
  const vscodeGitExtension = extensions.getExtension('vscode.git');

  if (!vscodeGitExtension) {
    window.showErrorMessage('Vscode git extension not detected');
    return;
  }

  if (!vscodeGitExtension?.isActive) {
    window.showErrorMessage('Vscode git extension not active');
    await vscodeGitExtension?.activate();
    return;
  }

  const gitModel = vscodeGitExtension?.exports?.model;

  if (!gitModel) {
    return;
  }
  await vscodeGitExtension?.exports?.model.isInitialized;

  const fetchItem = window.createStatusBarItem(StatusBarAlignment.Left, 101);
  const pullItem = window.createStatusBarItem(StatusBarAlignment.Left, 100);
  const pushItem = window.createStatusBarItem(StatusBarAlignment.Left, 99);

  const repositories = gitModel.repositories;

  if (repositories.length === 0) {
    window.showErrorMessage('No repositories detected');
    return;
  } else if (repositories.length > 1) {
    window.showInformationMessage('Multiple repositories detected');
  }

  const repository = gitModel.repositories[0];

  repository.onRunOperation((operation: string) => {
    if (operation === 'Fetch') {
      fetchItem.text = `$(sync~spin)`;
    }
  });

  repository.onDidRunOperation((response: any) => {
    const operationName = response.operation?.kind;

    if (operationName === 'Fetch') {
      fetchItem.text = `$(sync)`;
    }

    switch (operationName) {
      case 'Fetch':
        fetchItem.text = `$(sync)`;
      case 'Fetch':
      case 'Push':
      case 'Pull':
      case 'Commit':
        const head = repository.HEAD;
        pullItem.text = `${head.behind}$(arrow-down)`;
        pushItem.text = `${head.ahead}$(arrow-up)`;
        pushItem.show();
        pullItem.show();
        break;
    }
  });

  fetchItem.command = 'git.fetchAll';
  fetchItem.text = `$(sync)`;
  fetchItem.tooltip = 'Fetch';
  context.subscriptions.push(fetchItem);
  fetchItem.show();

  pullItem.command = 'git.pullRebase';
  pullItem.text = `$(arrow-down)`;
  pullItem.tooltip = 'Pull (rebase)';
  context.subscriptions.push(pullItem);

  pushItem.command = 'git.push';
  pushItem.text = `$(arrow-up)`;
  pushItem.tooltip = 'Push';
  context.subscriptions.push(pushItem);
}

export function deactivate() {}
