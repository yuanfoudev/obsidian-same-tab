import { Plugin, WorkspaceLeaf, ItemView, TFile, MarkdownView } from 'obsidian';
import 'tslib';

const VIEW_TYPE_SAME_TAB = "same-tab-view";

class SameTabView extends ItemView {
    private titleEl: HTMLElement;
    private mdView: MarkdownView;

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

    override async onOpen() {
        const container = this.containerEl.children[1];
        container.empty();

        // 创建标题容器
        this.titleEl = container.createEl('div', {
            cls: 'same-tab-title'
        });

        // 创建 MarkdownView
        this.mdView = new MarkdownView(this.leaf);
        this.mdView.containerEl.style.display = 'block';
        container.appendChild(this.mdView.containerEl);
    }

    // 更新内容
    async updateContent(file: TFile) {
        if (file && file.extension === 'md') {
            // 更新标题
            this.titleEl.setText(file.basename);
            
            // 使用 MarkdownView 加载文件，但不激活它
            await this.mdView.leaf.openFile(file, { active: false });
            
            // 确保主编辑器保持焦点
            const activeLeaf = this.app.workspace.getLeaf();
            if (activeLeaf) {
                this.app.workspace.setActiveLeaf(activeLeaf, { focus: true });
            }
        } else {
            this.titleEl.setText('');
            this.mdView.clear();
        }
    }

    override async onClose() {
        this.mdView.containerEl.detach();
    }
}

export default class SameTabPlugin extends Plugin {
    private view: SameTabView;

    async onload() {
        // 注册视图
        this.registerView(
            VIEW_TYPE_SAME_TAB,
            (leaf) => (this.view = new SameTabView(leaf))
        );

        // 监听文件打开事件
        this.registerEvent(
            this.app.workspace.on('file-open', async (file) => {
                if (this.view && file) {
                    await this.view.updateContent(file);
                }
            })
        );

        // 添加样式
        this.addStyle();

        // 插件加载时自动创建视图
        this.app.workspace.onLayoutReady(() => {
            this.initView();
        });
    }

    private addStyle() {
        const style = document.createElement('style');
        style.textContent = `
            .same-tab-title {
                padding: 10px 20px;
                font-size: 1.2em;
                font-weight: bold;
                border-bottom: 1px solid var(--background-modifier-border);
            }
        `;
        document.head.appendChild(style);
    }

    async initView() {
        const { workspace } = this.app;
        
        // 在右侧创建视图，但不激活它
        const leaf = workspace.getRightLeaf(false);
        if (leaf) {
            await leaf.setViewState({
                type: VIEW_TYPE_SAME_TAB,
                active: false,  // 设置为 false，防止自动激活
            });

            // 显示视图但不聚焦
            workspace.revealLeaf(leaf, { focus: false });

            // 初始化内容
            const currentFile = this.app.workspace.getActiveFile();
            if (currentFile && this.view) {
                await this.view.updateContent(currentFile);
            }
        }
    }

    async onunload() {
        this.app.workspace.detachLeavesOfType(VIEW_TYPE_SAME_TAB);
    }
} 