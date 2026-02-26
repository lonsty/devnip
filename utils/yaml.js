// 轻量 YAML 解析器（支持常用子集，无需第三方库）
// 支持：字符串、数字、布尔、null、对象、数组、多行字符串、注释
export const YamlTool = {
  toJson(yamlStr, indent = 2) {
    try {
      const obj = this._parse(yamlStr);
      return { success: true, data: JSON.stringify(obj, null, indent) };
    } catch (e) {
      return { success: false, error: `YAML parse error: ${e.message}` };
    }
  },

  // opts: { arrayStyle: 'block'|'flow', arraySpacing: 'space'|'compact', removeQuotes: boolean }
  fromJson(jsonStr, indent = 2, opts = {}) {
    try {
      const obj = JSON.parse(jsonStr);
      return { success: true, data: this._stringify(obj, indent, 0, opts) };
    } catch (e) {
      return { success: false, error: `JSON parse error: ${e.message}` };
    }
  },

  validate(yamlStr) {
    try {
      this._parse(yamlStr);
      return { success: true, data: 'Valid YAML' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  // sortMode: 'key-asc' | 'key-desc' | 'value-asc' | 'value-desc'
  sort(yamlStr, sortMode = 'key-asc', indent = 2, opts = {}) {
    try {
      let obj = this._parse(yamlStr);
      obj = this._sortObject(obj, sortMode);
      return { success: true, data: this._stringify(obj, indent, 0, opts) };
    } catch (e) {
      return { success: false, error: `YAML parse error: ${e.message}` };
    }
  },

  _sortObject(obj, mode = 'key-asc') {
    if (Array.isArray(obj)) return obj.map(item => this._sortObject(item, mode));
    if (obj !== null && typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (mode === 'key-asc') {
        entries.sort((a, b) => a[0].localeCompare(b[0]));
      } else if (mode === 'key-desc') {
        entries.sort((a, b) => b[0].localeCompare(a[0]));
      } else if (mode === 'value-asc') {
        entries.sort((a, b) => this._compareValues(a[1], b[1]));
      } else if (mode === 'value-desc') {
        entries.sort((a, b) => this._compareValues(b[1], a[1]));
      }
      return entries.reduce((sorted, [key, val]) => {
        sorted[key] = this._sortObject(val, mode);
        return sorted;
      }, {});
    }
    return obj;
  },

  _compareValues(a, b) {
    const sa = typeof a === 'object' ? JSON.stringify(a) : String(a ?? '');
    const sb = typeof b === 'object' ? JSON.stringify(b) : String(b ?? '');
    return sa.localeCompare(sb);
  },

  format(yamlStr, indent = 2, opts = {}) {
    try {
      // Validate by parsing first
      this._parse(yamlStr);
      // Format preserving comments, quotes, and structure
      let data = this._formatPreservingComments(yamlStr, indent, opts);
      return { success: true, data };
    } catch (e) {
      return { success: false, error: `YAML parse error: ${e.message}` };
    }
  },

  // Format rules aligned with Google yamlfmt / Prettier / yamllint best practices:
  // 1. Normalize indentation to consistent N spaces
  // 2. Colon spacing: no space before, one space after (key: value)
  // 3. Hyphen spacing: one space after - in sequences (- item)
  // 4. Trailing whitespace removal
  // 5. Inline comment spacing: at least 1 space before #, 1 space after #
  // 6. Consecutive blank lines collapsed to max 1
  // 7. Block scalar (| >) content preserved with adjusted base indent
  // 8. File ends with single newline
  // 9. Document markers (--- / ...) at column 0
  // 10. Pure comment lines aligned to next content line's indent
  // 11. removeQuotes: strip unnecessary quotes from scalar values
  // 12. arrayStyle: convert block/flow array styles
  _formatPreservingComments(str, indent, opts = {}) {
    const removeQuotes = opts.removeQuotes || false;
    const arrayStyle = opts.arrayStyle || 'block';
    const arraySpacing = opts.arraySpacing || 'space';
    const lines = str.split('\n');
    const result = [];
    const indentStack = []; // { oldIndent, newIndent }
    let prevNewIndent = 0;
    let consecutiveBlankCount = 0;
    let inBlockScalar = false;
    let blockScalarOldBase = 0;
    let blockScalarNewBase = 0;
    // Track bare-key lines (e.g. "key:" with no inline value) for same-indent list fixup
    let prevBareKeyOldIndent = -1;
    let prevBareKeyNewIndent = -1;

    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i];
      const trimmed = raw.trim();

      // --- Block scalar content passthrough ---
      if (inBlockScalar) {
        if (trimmed === '') {
          // Empty line inside block scalar: preserve
          result.push('');
          continue;
        }
        const curIndent = this._getIndent(raw);
        if (curIndent > blockScalarOldBase || (curIndent === blockScalarOldBase && !trimmed.includes(':'))) {
          // Still inside block scalar: re-indent content
          const relativeIndent = curIndent - blockScalarOldBase;
          const newLine = ' '.repeat(blockScalarNewBase + relativeIndent) + trimmed;
          result.push(this._trimTrailing(newLine));
          continue;
        }
        // Exited block scalar — fall through to normal processing
        inBlockScalar = false;
      }

      // --- Collapse consecutive blank lines (max 1) ---
      if (trimmed === '') {
        consecutiveBlankCount++;
        if (consecutiveBlankCount <= 1) result.push('');
        continue;
      }
      consecutiveBlankCount = 0;

      // --- Document markers: always at column 0 ---
      if (trimmed === '---' || trimmed === '...') {
        result.push(trimmed);
        continue;
      }

      // --- Pure comment lines: align to next content line ---
      if (trimmed.startsWith('#')) {
        let nextIndent = prevNewIndent;
        for (let j = i + 1; j < lines.length; j++) {
          const nt = lines[j].trim();
          if (nt === '' || nt.startsWith('#')) continue;
          const oldInd = this._getIndent(lines[j]);
          nextIndent = this._mapIndent(oldInd, indentStack, indent, prevNewIndent);
          break;
        }
        // Ensure "# " after hash
        const commentContent = this._normalizeCommentText(trimmed);
        result.push(' '.repeat(nextIndent) + commentContent);
        continue;
      }

      // --- Content lines ---
      const oldIndent = this._getIndent(raw);

      // Pop deeper/equal entries when de-indenting
      while (indentStack.length > 0 && indentStack[indentStack.length - 1].oldIndent >= oldIndent) {
        indentStack.pop();
      }

      let newIndent;
      if (oldIndent === 0) {
        newIndent = 0;
      } else if (indentStack.length > 0) {
        newIndent = indentStack[indentStack.length - 1].newIndent + indent;
      } else {
        newIndent = indent;
      }

      // YAML allows list items at the same indent as a bare key (e.g. "a:\n- b")
      // In that case, re-indent the "- " items as children of the key
      if (trimmed.startsWith('- ') && oldIndent === prevBareKeyOldIndent && prevBareKeyOldIndent >= 0) {
        newIndent = prevBareKeyNewIndent + indent;
      }

      indentStack.push({ oldIndent, newIndent });
      prevNewIndent = newIndent;

      // Normalize the content portion
      let content = raw.trimStart();
      content = this._normalizeContentSpacing(content);

      // Apply removeQuotes on values
      if (removeQuotes) {
        content = this._applyRemoveQuotes(content);
      }

      // Detect block scalar start (key: | or key: >)
      const blockMatch = content.match(/^(\S.*?):\s+([|>][+-]?\d*)\s*$/);
      if (blockMatch) {
        inBlockScalar = true;
        // Determine the old base indent for block content
        // Block content starts at old indent + original indent step
        blockScalarOldBase = oldIndent + this._detectOriginalIndent(lines, i);
        blockScalarNewBase = newIndent + indent;
      }

      // Track bare-key lines: "key:" with no value after colon
      const { main: contentMain } = this._splitInlineComment(content);
      const bareKeyMatch = contentMain.trim().match(/^(.+):\s*$/);
      if (bareKeyMatch && !contentMain.trim().startsWith('- ')) {
        prevBareKeyOldIndent = oldIndent;
        prevBareKeyNewIndent = newIndent;
      } else if (!trimmed.startsWith('- ') || oldIndent !== prevBareKeyOldIndent) {
        // Reset when we encounter a non-list line or list at different indent
        prevBareKeyOldIndent = -1;
        prevBareKeyNewIndent = -1;
      }

      const formatted = ' '.repeat(newIndent) + content;
      result.push(this._trimTrailing(formatted));
    }

    // Remove trailing empty lines, then ensure single newline at end
    while (result.length > 0 && result[result.length - 1] === '') {
      result.pop();
    }

    let output = result.join('\n') + '\n';

    // Apply array style conversion
    if (arrayStyle === 'flow') {
      output = this._convertBlockArraysToFlow(output, indent, arraySpacing);
      output = this._normalizeFlowArraySpacing(output, arraySpacing);
    } else if (arrayStyle === 'block') {
      output = this._convertFlowArraysToBlock(output, indent);
    }

    return output;
  },

  // Remove unnecessary quotes from scalar values in a content line
  _applyRemoveQuotes(content) {
    // Split off inline comment
    const { main, comment } = this._splitInlineComment(content);

    // Handle "- value" lines
    const dashMatch = main.match(/^(-\s+)(.*)/);
    if (dashMatch) {
      const val = dashMatch[2].trim();
      const unquoted = this._tryUnquoteValue(val);
      let result = dashMatch[1] + unquoted;
      if (comment !== null) result += ' ' + this._normalizeCommentText(comment);
      return result;
    }

    // Handle "key: value" lines
    const colonIdx = this._findMappingColon(main);
    if (colonIdx !== -1) {
      const key = main.substring(0, colonIdx).trim();
      const afterColon = main.substring(colonIdx + 1);
      const val = afterColon.trim();
      if (val) {
        const unquoted = this._tryUnquoteValue(val);
        let result = key + ': ' + unquoted;
        if (comment !== null) result += ' ' + this._normalizeCommentText(comment);
        return result;
      }
    }

    return comment !== null ? main + ' ' + this._normalizeCommentText(comment) : content;
  },

  // Try to remove quotes from a value, handling flow collections too
  _tryUnquoteValue(val) {
    // Flow sequence: [...]
    if (val.startsWith('[') && val.endsWith(']')) {
      return this._unquoteFlowCollection(val, '[', ']');
    }
    // Flow mapping: {...}
    if (val.startsWith('{') && val.endsWith('}')) {
      return this._unquoteFlowCollection(val, '{', '}');
    }
    return this._tryUnquote(val);
  },

  // Remove quotes from items inside a flow collection
  _unquoteFlowCollection(val, openBr, closeBr) {
    const inner = val.slice(1, -1).trim();
    if (inner === '') return val;
    const items = this._splitFlowItems(inner);
    const unquoted = items.map(item => {
      const trimItem = item.trim();
      // For flow mapping items, handle key: value
      if (openBr === '{') {
        const ci = trimItem.indexOf(':');
        if (ci !== -1) {
          const k = this._tryUnquote(trimItem.substring(0, ci).trim());
          const v = this._tryUnquote(trimItem.substring(ci + 1).trim());
          return k + ': ' + v;
        }
      }
      return this._tryUnquote(trimItem);
    });
    return openBr + unquoted.join(', ') + closeBr;
  },

  // Try to remove quotes if safe
  _tryUnquote(val) {
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      const inner = val.slice(1, -1);
      if (this._isSafeUnquoted(inner)) return inner;
    }
    return val;
  },

  // Convert block-style arrays to flow-style in formatted YAML text
  _convertBlockArraysToFlow(str, indent, spacing) {
    const lines = str.split('\n');
    const result = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      const trimmed = line.trim();

      // Detect "key:" or "key: # comment" line followed by block array items
      const { main: mainPart } = this._splitInlineComment(trimmed);
      const colonMatch = mainPart.trim().match(/^(.+):\s*$/);
      if (colonMatch && i + 1 < lines.length) {
        const nextTrimmed = lines[i + 1]?.trim();
        if (nextTrimmed && nextTrimmed.startsWith('- ')) {
          const keyIndent = this._getIndent(line);
          const itemIndent = this._getIndent(lines[i + 1]);
          // Collect all array items at this level (only simple scalars)
          const items = [];
          let j = i + 1;
          let allScalar = true;
          while (j < lines.length) {
            const itemLine = lines[j];
            const itemTrimmed = itemLine.trim();
            if (itemTrimmed === '' || itemTrimmed.startsWith('#')) { j++; continue; }
            const itemInd = this._getIndent(itemLine);
            if (itemInd < itemIndent) break;
            if (itemInd > itemIndent) { allScalar = false; break; }
            if (!itemTrimmed.startsWith('- ')) break;
            // Strip inline comment from item value
            const rawVal = itemTrimmed.substring(2).trim();
            const { main: valMain } = this._splitInlineComment(rawVal);
            const val = valMain.trim();
            // Only convert simple scalar arrays (no nested objects/arrays)
            if (val === '' || this._findMappingColon(val) !== -1 || val.startsWith('- ') || val.startsWith('[') || val.startsWith('{')) {
              allScalar = false;
              break;
            }
            items.push(val);
            j++;
          }
          if (allScalar && items.length > 0) {
            const joined = items.join(', ');
            const flowArr = spacing === 'space' ? `[ ${joined} ]` : `[${joined}]`;
            result.push(' '.repeat(keyIndent) + colonMatch[1] + ': ' + flowArr);
            i = j;
            continue;
          }
        }
      }

      // Pass through non-matching lines
      result.push(line);
      i++;
    }

    return result.join('\n');
  },

  // Convert flow-style arrays to block-style in formatted YAML text
  _convertFlowArraysToBlock(str, indent) {
    const lines = str.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Look for "key: [...]" pattern
      const { main, comment } = this._splitInlineComment(trimmed);
      const colonIdx = this._findMappingColon(main);
      if (colonIdx !== -1) {
        const afterColon = main.substring(colonIdx + 1).trim();
        if (afterColon.startsWith('[') && afterColon.endsWith(']')) {
          const inner = afterColon.slice(1, -1).trim();
          if (inner !== '') {
            const items = this._splitFlowItems(inner);
            // Only convert if all items are simple scalars (no nested structures)
            const allScalar = items.every(item => {
              const t = item.trim();
              return t !== '' && !t.startsWith('[') && !t.startsWith('{') && this._findMappingColon(t) === -1;
            });
            if (allScalar && items.length > 0) {
              const keyIndent = this._getIndent(line);
              const keyPart = main.substring(0, colonIdx).trim();
              const keyLine = ' '.repeat(keyIndent) + keyPart + ':';
              const commentSuffix = comment !== null ? ' ' + this._normalizeCommentText(comment) : '';
              result.push(keyLine + commentSuffix);
              for (const item of items) {
                result.push(' '.repeat(keyIndent + indent) + '- ' + item.trim());
              }
              continue;
            }
          }
          // Empty flow array [] — keep as-is
        }
      }

      // Also handle standalone flow arrays on "- [...]" lines
      if (trimmed.startsWith('- [') && trimmed.endsWith(']')) {
        const arrContent = trimmed.substring(2).trim();
        const inner = arrContent.slice(1, -1).trim();
        if (inner !== '') {
          const items = this._splitFlowItems(inner);
          const allScalar = items.every(item => {
            const t = item.trim();
            return t !== '' && !t.startsWith('[') && !t.startsWith('{') && this._findMappingColon(t) === -1;
          });
          if (allScalar && items.length > 0) {
            const lineIndent = this._getIndent(line);
            for (const item of items) {
              result.push(' '.repeat(lineIndent) + '- ' + item.trim());
            }
            continue;
          }
        }
      }

      result.push(line);
    }

    return result.join('\n');
  },

  // Normalize spacing in existing flow arrays (e.g. [a,b] -> [ a, b ] or vice versa)
  _normalizeFlowArraySpacing(str, spacing) {
    const lines = str.split('\n');
    const result = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const { main, comment } = this._splitInlineComment(trimmed);

      // Match "key: [...]" pattern
      const colonIdx = this._findMappingColon(main);
      if (colonIdx !== -1) {
        const afterColon = main.substring(colonIdx + 1).trim();
        if (afterColon.startsWith('[') && afterColon.endsWith(']')) {
          const inner = afterColon.slice(1, -1).trim();
          if (inner !== '') {
            const items = this._splitFlowItems(inner);
            const joined = items.map(item => item.trim()).join(', ');
            const flowArr = spacing === 'space' ? `[ ${joined} ]` : `[${joined}]`;
            const keyIndent = this._getIndent(line);
            const keyPart = main.substring(0, colonIdx).trim();
            const commentSuffix = comment !== null ? ' ' + this._normalizeCommentText(comment) : '';
            result.push(' '.repeat(keyIndent) + keyPart + ': ' + flowArr + commentSuffix);
            continue;
          }
        }
      }

      // Match standalone "- [...]" or just "[...]"
      const flowMatch = main.match(/^(-\s+)?(\[.+\])$/);
      if (flowMatch && flowMatch[2]) {
        const prefix = flowMatch[1] || '';
        const arr = flowMatch[2];
        const inner = arr.slice(1, -1).trim();
        if (inner !== '') {
          const items = this._splitFlowItems(inner);
          const joined = items.map(item => item.trim()).join(', ');
          const flowArr = spacing === 'space' ? `[ ${joined} ]` : `[${joined}]`;
          const lineIndent = this._getIndent(line);
          const commentSuffix = comment !== null ? ' ' + this._normalizeCommentText(comment) : '';
          result.push(' '.repeat(lineIndent) + prefix + flowArr + commentSuffix);
          continue;
        }
      }

      result.push(line);
    }

    return result.join('\n');
  },

  // Normalize colon/hyphen/inline-comment spacing in a content line
  _normalizeContentSpacing(content) {
    // Split off inline comment (must not be inside quotes)
    const { main, comment } = this._splitInlineComment(content);
    let normalized = main;

    // Hyphen at start of sequence item: ensure exactly "- " (one space after -)
    const dashMatch = normalized.match(/^(-\s*)(.*)/);
    if (dashMatch && dashMatch[1] !== '- ') {
      normalized = '- ' + dashMatch[2];
    }

    // Colon spacing for mapping keys: "key: value"
    normalized = this._normalizeColonSpacing(normalized);

    // Trailing whitespace on main part
    normalized = normalized.trimEnd();

    // Re-attach inline comment with proper spacing
    if (comment !== null) {
      const normalizedComment = this._normalizeCommentText(comment);
      normalized = normalized + ' ' + normalizedComment;
    }

    return normalized;
  },

  // Normalize "key:value" or "key :  value" to "key: value"
  // Handles the first unquoted colon as the mapping separator.
  // Skips lines that are pure scalar values (no mapping colon).
  _normalizeColonSpacing(str) {
    // Handle sequence item prefix "- "
    const dashPrefix = str.match(/^(-\s+)/);
    const prefix = dashPrefix ? dashPrefix[1] : '';
    const rest = dashPrefix ? str.substring(prefix.length) : str;

    // Don't touch lines that start with quotes (scalar values)
    if (rest.startsWith('"') || rest.startsWith("'")) return str;
    // Don't touch block scalar indicators
    if (rest === '|' || rest === '>' || /^[|>][+-]?\d*$/.test(rest)) return str;
    // Don't touch flow collections
    if (rest.startsWith('{') || rest.startsWith('[')) return str;

    // Find first colon outside quotes that acts as mapping key separator
    let inSingle = false, inDouble = false;
    for (let i = 0; i < rest.length; i++) {
      const ch = rest[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (inSingle || inDouble) continue;

      if (ch === ':') {
        // A colon inside a URL-like value (e.g. http://...) should not be treated
        // as mapping separator. Heuristic: if colon is preceded by another colon
        // or if before the colon is a scheme-like pattern, skip.
        // Simple approach: only treat as separator if this appears to be a key
        // (key part has no colons before this point and is a valid key pattern)
        const keyPart = rest.substring(0, i);
        // If key looks like a URL scheme (ends with "http", "https", "ftp", etc.) skip
        if (/^https?$|^ftp$|^mailto$/i.test(keyPart.trim())) continue;

        // Trim spaces before colon
        let keyEnd = i;
        while (keyEnd > 0 && rest[keyEnd - 1] === ' ') keyEnd--;
        const key = rest.substring(0, keyEnd);
        const afterColon = rest.substring(i + 1).trimStart();

        if (afterColon === '') {
          return prefix + key + ':';
        }
        return prefix + key + ': ' + afterColon;
      }
    }

    return str;
  },

  // Split inline comment from content, respecting quoted strings
  _splitInlineComment(content) {
    let inSingle = false, inDouble = false;
    for (let i = 0; i < content.length; i++) {
      const ch = content[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (inSingle || inDouble) continue;

      // Inline comment: space(s) followed by #
      if (ch === '#' && i > 0 && /\s/.test(content[i - 1])) {
        return {
          main: content.substring(0, i).trimEnd(),
          comment: content.substring(i)
        };
      }
    }
    return { main: content, comment: null };
  },

  // Ensure comment has "# " format (space after #)
  _normalizeCommentText(commentStr) {
    // commentStr starts with # possibly followed by content
    if (commentStr.startsWith('# ') || commentStr === '#') return commentStr;
    if (commentStr.startsWith('#')) return '# ' + commentStr.substring(1);
    return commentStr;
  },

  // Remove trailing whitespace from a line
  _trimTrailing(line) {
    return line.replace(/\s+$/, '');
  },

  // Detect the original indent step used after a given line (for block scalar)
  _detectOriginalIndent(lines, lineIdx) {
    for (let j = lineIdx + 1; j < lines.length; j++) {
      const t = lines[j].trim();
      if (t === '') continue;
      return this._getIndent(lines[j]) - this._getIndent(lines[lineIdx]);
    }
    return 2;
  },

  _mapIndent(oldIndent, stack, targetIndent, fallback) {
    if (oldIndent === 0) return 0;
    for (let i = stack.length - 1; i >= 0; i--) {
      if (stack[i].oldIndent < oldIndent) {
        return stack[i].newIndent + targetIndent;
      }
    }
    return fallback;
  },

  _parse(str) {
    const lines = str.split('\n');
    const result = this._parseLines(lines, 0, 0);
    return result.value;
  },

  _parseLines(lines, start, baseIndent) {
    // 检测是否为数组或对象
    let i = start;
    while (i < lines.length && this._isEmptyOrComment(lines[i])) i++;
    if (i >= lines.length) return { value: null, end: i };

    const firstLine = lines[i];
    const trimmed = firstLine.trimStart();

    if (trimmed.startsWith('- ') || trimmed === '-') {
      return this._parseArray(lines, i, this._getIndent(firstLine));
    }
    if (this._findMappingColon(trimmed) !== -1) {
      return this._parseObject(lines, i, this._getIndent(firstLine));
    }
    return { value: this._parseScalar(trimmed), end: i + 1 };
  },

  _parseObject(lines, start, baseIndent) {
    const obj = {};
    let i = start;
    while (i < lines.length) {
      if (this._isEmptyOrComment(lines[i])) { i++; continue; }
      const indent = this._getIndent(lines[i]);
      if (indent < baseIndent) break;
      if (indent > baseIndent) break;

      const trimmed = lines[i].trimStart();
      const colonIdx = this._findMappingColon(trimmed);
      if (colonIdx === -1) break;

      const key = trimmed.substring(0, colonIdx).trim();
      // Remove surrounding quotes from key if present
      const cleanKey = (key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))
        ? key.slice(1, -1) : key;
      const afterColon = trimmed.substring(colonIdx + 1).trim();

      if (afterColon && afterColon !== '|' && afterColon !== '>') {
        // 去除行内注释
        const val = this._stripInlineComment(afterColon);
        obj[cleanKey] = this._parseScalar(val);
        i++;
      } else if (afterColon === '|' || afterColon === '>') {
        // 多行字符串
        const block = [];
        i++;
        while (i < lines.length) {
          const ci = this._getIndent(lines[i]);
          if (ci <= baseIndent && lines[i].trim() !== '') break;
          block.push(lines[i].trimStart());
          i++;
        }
        obj[cleanKey] = afterColon === '|' ? block.join('\n') : block.join(' ');
      } else {
        // 嵌套：动态检测下一个非空行的缩进
        i++;
        let childIndent = baseIndent + 2;
        let childTrimmed = '';
        for (let j = i; j < lines.length; j++) {
          if (!this._isEmptyOrComment(lines[j])) {
            childIndent = this._getIndent(lines[j]);
            childTrimmed = lines[j].trimStart();
            break;
          }
        }
        // YAML allows list items at the same indent as the key (e.g. "a:\n- b\n- c")
        if (childIndent === baseIndent && (childTrimmed.startsWith('- ') || childTrimmed === '-')) {
          const nested = this._parseArray(lines, i, childIndent);
          obj[cleanKey] = nested.value;
          i = nested.end;
        } else if (childIndent <= baseIndent) {
          obj[cleanKey] = null;
        } else {
          const nested = this._parseLines(lines, i, childIndent);
          obj[cleanKey] = nested.value;
          i = nested.end;
        }
      }
    }
    return { value: obj, end: i };
  },

  // Find the mapping colon index, skipping colons inside quotes
  _findMappingColon(str) {
    let inSingle = false, inDouble = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (inSingle || inDouble) continue;
      if (ch === ':' && (i + 1 >= str.length || str[i + 1] === ' ' || str[i + 1] === '\t')) {
        return i;
      }
    }
    return -1;
  },

  // Strip inline comment (respecting quotes)
  _stripInlineComment(str) {
    let inSingle = false, inDouble = false;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (inSingle || inDouble) continue;
      if (ch === '#' && i > 0 && /\s/.test(str[i - 1])) {
        return str.substring(0, i).trimEnd();
      }
    }
    return str;
  },

  _parseArray(lines, start, baseIndent) {
    const arr = [];
    let i = start;
    while (i < lines.length) {
      if (this._isEmptyOrComment(lines[i])) { i++; continue; }
      const indent = this._getIndent(lines[i]);
      if (indent < baseIndent) break;
      if (indent > baseIndent) break;

      const trimmed = lines[i].trimStart();
      if (!trimmed.startsWith('-')) break;

      const afterDash = trimmed.substring(1).trim();
      if (afterDash === '') {
        // 嵌套：动态检测下一个非空行的缩进
        i++;
        let childIndent = indent + 2;
        for (let j = i; j < lines.length; j++) {
          if (!this._isEmptyOrComment(lines[j])) {
            childIndent = this._getIndent(lines[j]);
            break;
          }
        }
        const nested = this._parseLines(lines, i, childIndent);
        arr.push(nested.value);
        i = nested.end;
      } else if (this._findMappingColon(afterDash) !== -1) {
        // 数组元素是对象（同一行开始）
        const fakeLine = ' '.repeat(indent + 2) + afterDash;
        const tempLines = [fakeLine, ...lines.slice(i + 1)];
        const nested = this._parseObject(tempLines, 0, indent + 2);
        arr.push(nested.value);
        i = i + 1 + (nested.end - 1);
      } else {
        arr.push(this._parseScalar(afterDash));
        i++;
      }
    }
    return { value: arr, end: i };
  },

  _parseScalar(str) {
    if (!str || str === '~' || str === 'null') return null;
    if (str === 'true') return true;
    if (str === 'false') return false;
    // 带引号的字符串
    if ((str.startsWith('"') && str.endsWith('"')) || (str.startsWith("'") && str.endsWith("'"))) {
      return str.slice(1, -1);
    }
    // 数字
    if (/^-?\d+$/.test(str)) return parseInt(str, 10);
    if (/^-?\d+\.\d+$/.test(str)) return parseFloat(str);
    // 内联数组 [a, b]
    if (str.startsWith('[') && str.endsWith(']')) {
      try { return JSON.parse(str); } catch { /* not valid JSON, parse as YAML flow sequence */ }
      return this._parseFlowSequence(str);
    }
    // 内联对象 {a: b}
    if (str.startsWith('{') && str.endsWith('}')) {
      try { return JSON.parse(str); } catch { /* not valid JSON, parse as YAML flow mapping */ }
      return this._parseFlowMapping(str);
    }
    return str;
  },

  // Parse YAML flow sequence: [item1, item2, ...]
  _parseFlowSequence(str) {
    const inner = str.slice(1, -1).trim();
    if (inner === '') return [];
    const items = this._splitFlowItems(inner);
    return items.map(item => this._parseScalar(item.trim()));
  },

  // Parse YAML flow mapping: {key: value, key2: value2}
  _parseFlowMapping(str) {
    const inner = str.slice(1, -1).trim();
    if (inner === '') return {};
    const items = this._splitFlowItems(inner);
    const obj = {};
    for (const item of items) {
      const colonIdx = item.indexOf(':');
      if (colonIdx === -1) continue;
      const key = item.substring(0, colonIdx).trim();
      const val = item.substring(colonIdx + 1).trim();
      const cleanKey = (key.startsWith('"') && key.endsWith('"')) || (key.startsWith("'") && key.endsWith("'"))
        ? key.slice(1, -1) : key;
      obj[cleanKey] = this._parseScalar(val);
    }
    return obj;
  },

  // Split flow items by commas, respecting nested brackets and quotes
  _splitFlowItems(str) {
    const items = [];
    let depth = 0;
    let inSingle = false, inDouble = false;
    let start = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      if (ch === "'" && !inDouble) { inSingle = !inSingle; continue; }
      if (ch === '"' && !inSingle) { inDouble = !inDouble; continue; }
      if (inSingle || inDouble) continue;
      if (ch === '[' || ch === '{') { depth++; continue; }
      if (ch === ']' || ch === '}') { depth--; continue; }
      if (ch === ',' && depth === 0) {
        items.push(str.substring(start, i));
        start = i + 1;
      }
    }
    if (start < str.length) items.push(str.substring(start));
    return items;
  },

  _getIndent(line) {
    const m = line.match(/^(\s*)/);
    return m ? m[1].length : 0;
  },

  _isEmptyOrComment(line) {
    const t = line.trim();
    return t === '' || t.startsWith('#') || t === '---' || t === '...';
  },

  _stringify(obj, indent = 2, level = 0, opts = {}) {
    const pad = ' '.repeat(indent * level);
    const arrayStyle = opts.arrayStyle || 'block';
    const arraySpacing = opts.arraySpacing || 'space';
    const removeQuotes = opts.removeQuotes || false;

    if (obj === null || obj === undefined) return pad + 'null';
    if (typeof obj === 'boolean') return pad + String(obj);
    if (typeof obj === 'number') return pad + String(obj);
    if (typeof obj === 'string') {
      if (obj.includes('\n')) return pad + '|\n' + obj.split('\n').map(l => pad + ' '.repeat(indent) + l).join('\n');
      if (removeQuotes && this._isSafeUnquoted(obj)) return pad + obj;
      if (/[:#{}[\],&*?|>'"!%@`]/.test(obj) || obj === '') return pad + `"${obj}"`;
      return pad + obj;
    }
    if (Array.isArray(obj)) {
      if (obj.length === 0) return pad + '[]';
      if (arrayStyle === 'flow') {
        const flowStr = this._stringifyFlowArray(obj, arraySpacing, removeQuotes);
        return pad + flowStr;
      }
      return obj.map(item => {
        if (typeof item === 'object' && item !== null) {
          const inner = this._stringify(item, indent, level + 1, opts).trimStart();
          return `${pad}- ${inner}`;
        }
        return `${pad}- ${this._stringifyValue(item, removeQuotes)}`;
      }).join('\n');
    }
    if (typeof obj === 'object') {
      const keys = Object.keys(obj);
      if (keys.length === 0) return pad + '{}';
      return keys.map(key => {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          const inner = this._stringify(val, indent, level + 1, opts);
          return `${pad}${key}:\n${inner}`;
        }
        return `${pad}${key}: ${this._stringifyValue(val, removeQuotes)}`;
      }).join('\n');
    }
    return pad + String(obj);
  },

  _stringifyFlowArray(arr, spacing, removeQuotes) {
    const items = arr.map(item => {
      if (item === null || item === undefined) return 'null';
      if (typeof item === 'boolean' || typeof item === 'number') return String(item);
      if (typeof item === 'string') {
        if (removeQuotes && this._isSafeUnquoted(item)) return item;
        if (/[:#{}[\],&*?|>'"!%@`\s]/.test(item) || item === '') return `"${item}"`;
        return item;
      }
      return JSON.stringify(item);
    });
    const joined = items.join(', ');
    return spacing === 'space' ? `[ ${joined} ]` : `[${joined}]`;
  },

  _isSafeUnquoted(str) {
    if (str === '') return false;
    if (str === 'null' || str === 'true' || str === 'false' || str === '~') return false;
    if (/^-?\d+(\.\d+)?$/.test(str)) return false;
    if (/[:#{}[\],&*?|>'"!%@`\n\r]/.test(str)) return false;
    if (/^\s|\s$/.test(str)) return false;
    return true;
  },

  _stringifyValue(val, removeQuotes = false) {
    if (val === null || val === undefined) return 'null';
    if (typeof val === 'string') {
      if (removeQuotes && this._isSafeUnquoted(val)) return val;
      if (/[:#{}[\],&*?|>'"!%@`]/.test(val) || val === '') return `"${val}"`;
      return val;
    }
    return String(val);
  }
};
