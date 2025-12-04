import { get, on } from './dom.js';

/**
 * Layout Manager
 * Handles the CSS Grid resizing logic for the workspace.
 * 
 * Why Mouse Events?
 * - We use explicit `mousedown`/`mousemove` on gutters instead of `ResizeObserver`
 *   because we need to control the *grid column* definitions (`220px ... 40%`),
 *   not just react to size changes. This gives us precise control over the resize UX.
 */
export class LayoutManager {
    constructor() {
        this.workspace = get('workspace');
        this.gutterSidebar = get('gutter-sidebar');
        this.gutterOutput = get('gutter-output');
        this.outputPane = get('output-pane');
        this.toggleBtn = get('toggle-output-btn');
        this.layoutToggle = get('layout-toggle'); // Header toggle

        this.sidebarWidth = 220;
        this.outputWidthPercent = 40;
        this.isDragging = false;
        this.currentGutter = null;
    }

    init() {
        if (!this.workspace) return;

        // Bind Gutter Events
        on(this.gutterSidebar, 'mousedown', this.startDrag('sidebar'));
        on(this.gutterOutput, 'mousedown', this.startDrag('output'));
        
        // Global Mouse Events
        on(document, 'mousemove', (e) => this.onDrag(e));
        on(document, 'mouseup', () => this.stopDrag());

        // Toggle Events
        const toggleHandler = () => this.toggleOutput();
        on(this.toggleBtn, 'click', toggleHandler);
        on(this.layoutToggle, 'click', toggleHandler);
    }

    startDrag(gutterName) {
        return (e) => {
            this.isDragging = true;
            this.currentGutter = gutterName;
            document.body.style.cursor = 'col-resize';
            
            if (gutterName === 'sidebar') this.gutterSidebar.classList.add('dragging');
            else this.gutterOutput.classList.add('dragging');
            
            e.preventDefault();
        };
    }

    onDrag(e) {
        if (!this.isDragging) return;
        
        const containerRect = this.workspace.getBoundingClientRect();
        
        if (this.currentGutter === 'sidebar') {
            let newWidth = e.clientX - containerRect.left;
            if (newWidth < 150) newWidth = 150;
            if (newWidth > containerRect.width * 0.5) newWidth = containerRect.width * 0.5;
            this.sidebarWidth = newWidth;
        } else if (this.currentGutter === 'output') {
            const rightEdge = containerRect.right;
            let newWidthPx = rightEdge - e.clientX;
            let newPercent = (newWidthPx / containerRect.width) * 100;
            if (newPercent < 10) newPercent = 10;
            if (newPercent > 60) newPercent = 60;
            this.outputWidthPercent = newPercent;
        }
        this.updateGrid();
    }

    stopDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.currentGutter = null;
            document.body.style.cursor = '';
            this.gutterSidebar.classList.remove('dragging');
            this.gutterOutput.classList.remove('dragging');
        }
    }

    toggleOutput() {
        const isCollapsed = this.outputPane.classList.toggle('collapsed');
        this.toggleBtn.textContent = isCollapsed ? '^' : 'v';
        this.updateGrid();
    }

    updateGrid() {
        const isCollapsed = this.outputPane.classList.contains('collapsed');
        const out = isCollapsed ? '30px' : `${this.outputWidthPercent}%`;
        this.workspace.style.gridTemplateColumns = `${this.sidebarWidth}px 4px minmax(0, 1fr) 4px ${out}`;
    }
}
