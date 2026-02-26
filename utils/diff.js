// 文本差异对比工具（Myers diff 算法）
export const DiffTool = {
  compare(textA, textB, ignoreWhitespace = false) {
    let linesA = textA.split('\n');
    let linesB = textB.split('\n');

    if (ignoreWhitespace) {
      linesA = linesA.map(l => l.trim());
      linesB = linesB.map(l => l.trim());
    }

    const result = this._myersDiff(linesA, linesB);
    let added = 0, removed = 0, modified = 0;
    for (const item of result) {
      if (item.type === 'add') added++;
      else if (item.type === 'remove') removed++;
    }

    return {
      success: true,
      data: {
        changes: result,
        stats: { added, removed, unchanged: result.filter(r => r.type === 'equal').length }
      }
    };
  },

  _myersDiff(a, b) {
    const N = a.length, M = b.length;
    const max = N + M;
    const v = new Array(2 * max + 1);
    v[max + 1] = 0;
    const trace = [];

    for (let d = 0; d <= max; d++) {
      trace.push([...v]);
      for (let k = -d; k <= d; k += 2) {
        let x;
        if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
          x = v[max + k + 1];
        } else {
          x = v[max + k - 1] + 1;
        }
        let y = x - k;
        while (x < N && y < M && a[x] === b[y]) { x++; y++; }
        v[max + k] = x;
        if (x >= N && y >= M) {
          return this._backtrack(trace, max, a, b);
        }
      }
    }
    return [];
  },

  _backtrack(trace, max, a, b) {
    const moves = [];
    let x = a.length, y = b.length;

    for (let d = trace.length - 1; d >= 0; d--) {
      const v = trace[d];
      const k = x - y;
      let prevK;
      if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
        prevK = k + 1;
      } else {
        prevK = k - 1;
      }
      const prevX = v[max + prevK];
      const prevY = prevX - prevK;

      while (x > prevX && y > prevY) {
        moves.unshift({ type: 'equal', lineA: a[x - 1], lineB: b[y - 1], indexA: x - 1, indexB: y - 1 });
        x--; y--;
      }
      if (d > 0) {
        if (x === prevX) {
          moves.unshift({ type: 'add', lineB: b[y - 1], indexB: y - 1 });
          y--;
        } else {
          moves.unshift({ type: 'remove', lineA: a[x - 1], indexA: x - 1 });
          x--;
        }
      }
    }
    return moves;
  },

  charDiff(strA, strB) {
    const a = [...strA], b = [...strB];
    return this._myersDiff(a, b);
  }
};
