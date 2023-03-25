import { Plugin, TFile, TFolder, Vault } from 'obsidian';

export default class MyPlugin extends Plugin {
    onload() {
        const vault = this.app.vault;
        const workspace = this.app.workspace;

        workspace.onLayoutReady(() => {
            const fileTree = vault.getRoot();

            const files: TFile[] = [];

            // TODO: add support for selection desired folder(s)
            Vault.recurseChildren(fileTree, (file) => {
                if (file instanceof TFolder) {
                    return;
                }

                files.push(<TFile>file);
            })

            const filesAmount = files.length;

            const randomNumber = Math.floor(Math.random() * (filesAmount + 1));
            const randomFile = files[randomNumber];

            workspace.getLeaf(true).openFile(randomFile);
        });
    }
}
