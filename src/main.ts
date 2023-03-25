import { App, Plugin, PluginSettingTab, Setting, TFile, TFolder, Vault } from 'obsidian';

interface MyPluginSettings {
    mySetting: string;
    openNoteAfterOtherPlugins: boolean;
    folderScope: string | null;
}

const DEFAULT_SETTINGS: MyPluginSettings = {
    mySetting: 'default',
    openNoteAfterOtherPlugins: true,
    folderScope: null,
}

export default class MyPlugin extends Plugin {
    settings: MyPluginSettings;

    async onload() {
        await this.loadSettings();

        this.addSettingTab(new MyPluginSettingTab(this.app, this));

        const vault = this.app.vault;
        const workspace = this.app.workspace;

        workspace.onLayoutReady(() => {
            const fileTree = vault.getRoot();

            const files: TFile[] = [];

            // TODO: add support for selecting desired folder(s)
            // TODO: add support for ignoring files that have specific mark
            Vault.recurseChildren(fileTree, (file) => {
                if (file instanceof TFolder) {
                    return;
                }

                files.push(<TFile>file);
            })

            const filesAmount = files.length;

            const randomNumber = Math.floor(Math.random() * (filesAmount + 1));
            const randomFile = files[randomNumber];

            if (this.settings.openNoteAfterOtherPlugins) {
                setTimeout(() => {
                    workspace.getLeaf(true).openFile(randomFile);
                }, 0);
            } else {
                workspace.getLeaf(true).openFile(randomFile);
            }
        });
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }
}

export class MyPluginSettingTab extends PluginSettingTab {
    plugin: MyPlugin;

    constructor(app: App, plugin: MyPlugin) {
        super(app, plugin);
        this.plugin = plugin;
    }

    display() {
        console.log(this);

        const { containerEl } = this;

        containerEl.empty();

        containerEl.createEl('h2', { text: 'General' });

        new Setting(containerEl)
            .setName('Open random note after other plugins')
            .setDesc('Some plugins, like `Daily notes`, open a note on startup as well')
            .addToggle((toggle) => toggle
                .setValue(this.plugin.settings.openNoteAfterOtherPlugins)
                .onChange(async (value) => {
                    this.plugin.settings.openNoteAfterOtherPlugins = value;
                    await this.plugin.saveSettings();
                })
            )

        // TODO: implement ISuggestOwner, multiple choises
        new Setting(containerEl)
            .setName('Folders from which random note should be pulled out')
            .setDesc('Path should be absolute')
            .addText((text) => text
                .setPlaceholder('Example: /folder')
                .setValue(this.plugin.settings.folderScope ?? '')
                .onChange(async (value) => {
                    this.plugin.settings.folderScope = value;
                    await this.plugin.saveSettings();
                })
            )
    }
}
