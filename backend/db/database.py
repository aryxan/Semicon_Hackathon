import os
import sqlite3
import json

DB_PATH = os.path.join(os.path.dirname(__file__), '..', 'data', 'wafers.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS wafers (
            wafer_id TEXT PRIMARY KEY,
            batch_id TEXT,
            status TEXT,
            risk_score REAL,
            stages TEXT,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def save_wafer(wafer_data: dict):
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute('''
        INSERT INTO wafers (wafer_id, batch_id, status, risk_score, stages)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(wafer_id) DO UPDATE SET
            status=excluded.status,
            risk_score=excluded.risk_score,
            stages=excluded.stages,
            updated_at=CURRENT_TIMESTAMP
    ''', (
        wafer_data['waferId'],
        wafer_data.get('batchId', 'UNKNOWN'),
        wafer_data.get('status', 'NORMAL'),
        wafer_data.get('riskScore', 0.0),
        json.dumps(wafer_data.get('stages', []))
    ))
    conn.commit()
    conn.close()

def get_all_wafers():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    c = conn.cursor()
    c.execute('SELECT * FROM wafers')
    rows = c.fetchall()
    conn.close()
    
    wafers = []
    for r in rows:
        w = dict(r)
        w['stages'] = json.loads(w['stages'])
        w['waferId'] = w.pop('wafer_id')
        w['batchId'] = w.pop('batch_id')
        w['riskScore'] = w.pop('risk_score')
        wafers.append(w)
    return wafers
