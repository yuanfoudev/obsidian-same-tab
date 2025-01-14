import { Plugin, WorkspaceLeaf, TFile, MarkdownView } from 'obsidian';

const VIEW_TYPE_SAME_TAB = "same-tab-view";

class SameTabView extends MarkdownView {
    constructor(leaf: WorkspaceLeaf) {
        super(leaf);
    }

    getViewType() {
        return VIEW_TYPE_SAME_TAB;
    }

    getDisplayText() {
        return "同步笔记面板";
    }

    getIcon() {
        return "leafy-green";
    }
}

export default class SameTabPlugin extends Plugin {
    private view: SameTabView;
    private leaf: WorkspaceLeaf | null = null;

    async onload() {
        // 注册视图
        this.registerView(
            VIEW_TYPE_SAME_TAB,
            (leaf) => {
                this.leaf = leaf;
                return (this.view = new SameTabView(leaf));
            }
        );

        // 监听活动叶子变化
        this.registerEvent(
            this.app.workspace.on('active-leaf-change', async (leaf) => {
                if (this.view && leaf?.view instanceof MarkdownView) {
                    const file = leaf.view.file;
                    // 只处理 markdown 文件
                    if (file && file.extension === 'md') {
                        await this.view.leaf.openFile(file, { active: false });
                    }
                }
            })
        );

        // 插件加载时自动创建视图
        this.app.workspace.onLayoutReady(() => {
            this.initView();
        });
    }

    async onunload() {
        // 使用保存的 leaf 引用来关闭视图
        if (this.leaf) {
            await this.leaf.detach();
            this.leaf = null;
        }
    }

    async initView() {
        // 如果已经有视图，先关闭它
        if (this.leaf) {
            await this.leaf.detach();
            this.leaf = null;
        }

        // 创建新视图
        this.leaf = this.app.workspace.getRightLeaf(false);
        if (this.leaf) {
            await this.leaf.setViewState({
                type: VIEW_TYPE_SAME_TAB,
                active: false,
            });

            // 显示视图
            this.app.workspace.revealLeaf(this.leaf);

            // 初始化内容
            const currentFile = this.app.workspace.getActiveFile();
            if (currentFile && this.view && currentFile.extension === 'md') {
                await this.view.leaf.openFile(currentFile, { active: false });
            }
        }
    }
} 