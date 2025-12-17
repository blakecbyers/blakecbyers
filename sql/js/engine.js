class SQLEngine {
    constructor(db) { this.db = db; }
    execute(query) {
        try {
            const q = query.trim().replace(/\s+/g, ' ');
            if (!q) throw new Error("The grinder needs beans! Enter a query.");

            const regex = /SELECT\s+(.+?)\s+FROM\s+([a-zA-Z0-9_]+)(?:\s+(?:INNER\s+)?JOIN\s+([a-zA-Z0-9_]+)\s+ON\s+(.+?))?(?:\s+WHERE\s+(.+?))?(?:\s+GROUP\s+BY\s+(.+?))?(?:\s+ORDER\s+BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?$/i;
            const match = q.match(regex);
            if (!match) throw new Error("Recipe Invalid. Try: SELECT * FROM menu");

            const [_, selectStr, table1, joinTable, joinOn, whereStr, groupStr, orderStr, limitStr] = match;

            if (!this.db[table1]) throw new Error(`Stockroom check: Table '${table1}' not found.`);
            let data = JSON.parse(JSON.stringify(this.db[table1]));

            if (joinTable) {
                if (!this.db[joinTable]) throw new Error(`Table '${joinTable}' not found.`);
                const t2 = this.db[joinTable];
                const [left, right] = joinOn.split('=').map(s => s.trim());
                if (!left || !right) throw new Error("Connector missing (ON clause invalid).");
                const leftKey = left.split('.').pop();
                const rightKey = right.split('.').pop();
                let joined = [];
                data.forEach(r1 => { t2.forEach(r2 => { if (String(r1[leftKey]) == String(r2[rightKey])) joined.push({ ...r1, ...r2 }); }); });
                data = joined;
            }

            if (whereStr) data = data.filter(row => this.evalWhere(row, whereStr));

            const isAgg = /COUNT|SUM|AVG|MIN|MAX/i.test(selectStr);
            if (groupStr) {
                const gCol = groupStr.trim();
                const groups = {};
                data.forEach(r => { const k = r[gCol]; if (!groups[k]) groups[k] = []; groups[k].push(r); });
                data = Object.keys(groups).map(k => this.processSelect(groups[k], selectStr, k, gCol));
            } else if (isAgg) {
                data = [this.processSelect(data, selectStr)];
            } else {
                if (selectStr.trim() !== '*') {
                    const cols = selectStr.split(',').map(c => c.trim());
                    data = data.map(r => { const newR = {}; cols.forEach(c => { if (r[c] !== undefined) newR[c] = r[c]; }); return newR; });
                }
            }

            if (orderStr) {
                const [key, dir] = orderStr.split(/\s+/);
                const m = dir?.toUpperCase() === 'DESC' ? -1 : 1;
                data.sort((a, b) => (a[key] < b[key] ? -1 : 1) * m);
            }
            if (limitStr) data = data.slice(0, parseInt(limitStr));

            return { success: true, data };
        } catch (e) { return { success: false, error: e.message }; }
    }

    evalWhere(row, cond) {
        const m = cond.match(/([a-zA-Z0-9_.]+)\s*(=|!=|>|<|>=|<=|LIKE)\s*(.+)/i);
        if (!m) return true;
        let [__, col, op, val] = m;
        col = col.split('.').pop();
        val = val.replace(/^['"]|['"]$/g, '');
        if (!isNaN(val)) val = Number(val);
        const rVal = row[col];
        switch (op.toUpperCase()) {
            case '=': return rVal == val;
            case '>': return rVal > val;
            case '<': return rVal < val;
            case 'LIKE': return String(rVal).includes(val.replace(/%/g, ''));
            default: return false;
        }
    }

    processSelect(rows, selectStr, groupKey, groupCol) {
        const res = {};
        if (groupCol) res[groupCol] = groupKey;
        selectStr.split(',').map(c => c.trim()).forEach(col => {
            if (col === groupCol) return;
            if (col.toUpperCase().includes('COUNT')) res['count'] = rows.length;
            else if (col.toUpperCase().includes('AVG')) {
                const f = col.match(/\((.+?)\)/)[1];
                const s = rows.reduce((a, b) => a + (Number(b[f]) || 0), 0);
                res[`avg_${f}`] = rows.length ? parseFloat((s / rows.length).toFixed(2)) : 0;
            } else if (col.toUpperCase().includes('SUM')) {
                const f = col.match(/\((.+?)\)/)[1];
                res[`sum_${f}`] = rows.reduce((a, b) => a + (Number(b[f]) || 0), 0);
            } else { if (rows[0] && rows[0][col] !== undefined) res[col] = rows[0][col]; }
        });
        return res;
    }
}
