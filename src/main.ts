import { App, Editor, MarkdownView, Plugin, TFile, WorkspaceLeaf, ViewState } from 'obsidian';

const VIEW_TYPE_SAME_TAB = "same-tab-view";

class SameTabView extends MarkdownView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType(): string {
        return VIEW_TYPE_SAME_TAB;
    }

    getDisplayText(): string {
        return "Same Tab View";
    }

    async onOpen() {
        super.onOpen();
    }

    async onClose() {
        super.onClose();
    }
}

export default class SameTabPlugin extends Plugin {
    private activeFile: TFile | null = null;
    private activeView: SameTabView | null = null;

    async onload() {
        console.log('加载 Same Tab 插件');

        this.registerView(
            VIEW_TYPE_SAME_TAB,
            (leaf) => {
                this.activeView = new SameTabView(leaf);
                return this.activeView;
            }
        );

        this.addRibbonIcon('documents', 'Open Same Tab View', () => {
            this.activateView();
        });

        this.registerEvent(
            this.app.workspace.on('file-open', async (file) => {
                if (file) {
                    this.activeFile = file;
                    await this.updateView();
                }
            })
        );
    }

    async activateView() {
        const { workspace } = this.app;
        
        let leaf = workspace.getLeavesOfType(VIEW_TYPE_SAME_TAB)[0];
        
        if (!leaf) {
            leaf = workspace.getLeaf('split');
            await leaf.setViewState({
                type: VIEW_TYPE_SAME_TAB,
                active: true,
            } as ViewState);
        }

        workspace.revealLeaf(leaf);
    }

    async updateView() {
        if (!this.activeFile || !this.activeView) return;

        const content = await this.app.vault.read(this.activeFile);
        if (this.activeView.editor) {
            this.activeView.editor.setValue(content);
        }
    }

    async onunload() {
        console.log('卸载 Same Tab 插件');
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_SAME_TAB);
    }
} 