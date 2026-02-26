// 轻量 Markdown 渲染器（纯 JS，支持 GFM 子集）
export const MarkdownTool = {
  render(md) {
    // 1. 提取代码块和行内代码，用占位符替代，避免内容被后续正则处理
    const codeBlocks = [];
    const inlineCodes = [];

    // 代码块（使用不会被 _escapeHtml 改变的占位符）
    let html = md.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
      const escaped = this._escapeHtml(code.trimEnd());
      const escapedLang = this._escapeHtml(lang);
      const placeholder = `\x00CB${codeBlocks.length}\x00`;
      codeBlocks.push(`<pre><code class="language-${escapedLang}">${escaped}</code></pre>`);
      return placeholder;
    });

    // 行内代码
    html = html.replace(/`([^`]+)`/g, (_, code) => {
      const escaped = this._escapeHtml(code);
      const placeholder = `\x00IC${inlineCodes.length}\x00`;
      inlineCodes.push(`<code>${escaped}</code>`);
      return placeholder;
    });

    // 2. 转义剩余 HTML
    html = this._escapeHtml(html);

    // 3. Markdown 语法处理（占位符仍为占位符，不会被误匹配）

    // 标题
    html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
    html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
    html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
    html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');

    // 水平线
    html = html.replace(/^(---|\*\*\*|___)$/gm, '<hr>');

    // 粗体、斜体、删除线
    html = html.replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

    // 链接和图片
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img alt="$1" src="$2" style="max-width:100%">');
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 任务列表
    html = html.replace(/^- \[x\]\s+(.+)$/gm, '<li class="task done"><input type="checkbox" checked disabled> $1</li>');
    html = html.replace(/^- \[ \]\s+(.+)$/gm, '<li class="task"><input type="checkbox" disabled> $1</li>');

    // 无序列表
    html = html.replace(/^[*\-+]\s+(.+)$/gm, '<uli>$1</uli>');
    // 有序列表
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<oli>$1</oli>');

    // 包裹连续无序列表项
    html = html.replace(/(<uli>.*?<\/uli>\n?)+/g, match => {
      const items = match.replace(/<\/?uli>/g, (t) => t === '<uli>' ? '<li>' : '</li>');
      return `<ul>${items}</ul>`;
    });
    // 包裹连续有序列表项
    html = html.replace(/(<oli>.*?<\/oli>\n?)+/g, match => {
      const items = match.replace(/<\/?oli>/g, (t) => t === '<oli>' ? '<li>' : '</li>');
      return `<ol>${items}</ol>`;
    });

    // 引用块
    html = html.replace(/^&gt;\s+(.+)$/gm, '<blockquote>$1</blockquote>');
    // 合并连续引用
    html = html.replace(/<\/blockquote>\n<blockquote>/g, '\n');

    // 表格
    html = html.replace(/^(\|.+\|)\n(\|[-|\s:]+\|)\n((?:\|.+\|\n?)*)/gm, (tableMatch, header, sep, body) => {
      void tableMatch; void sep;
      const ths = header.split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`);
      const rows = body.trim().split('\n').map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`);
        return `<tr>${cells.join('')}</tr>`;
      });
      return `<table><thead><tr>${ths.join('')}</tr></thead><tbody>${rows.join('')}</tbody></table>`;
    });

    // 段落（连续非空行包裹为 <p>，跳过占位符行）
    html = html.replace(/^(?!<[a-z])(?!\x00)((?!<\/)[^\n]+)$/gm, '<p>$1</p>');
    // 清理多余空行
    html = html.replace(/\n{3,}/g, '\n\n');

    // 4. 最后还原占位符（确保代码块内容不被任何 markdown 规则处理）
    for (let i = 0; i < codeBlocks.length; i++) {
      html = html.replace(`\x00CB${i}\x00`, codeBlocks[i]);
    }
    for (let i = 0; i < inlineCodes.length; i++) {
      html = html.replace(`\x00IC${i}\x00`, inlineCodes[i]);
    }

    return html;
  },

  _escapeHtml(str) {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
};
