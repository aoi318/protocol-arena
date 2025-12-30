import React, { useState } from 'react';

export interface LogEntry {
    id: number;
    timestamp: string;
    src: string;
    dst: string;
    summary: string;
    details: string;
}

interface PacketLoggerProps {
    logs: LogEntry[];
}

export const PacketLogger: React.FC<PacketLoggerProps> = ({ logs }) => {
    const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

    const toggleExpand = (id: number) => {
        const newSet = new Set(expandedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setExpandedIds(newSet);
    };

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#1e1e1e', color: '#ccc', fontFamily: 'monospace' }}>
            <div style={{ padding: '8px 12px', background: '#333', fontSize: '12px', fontWeight: 'bold', borderBottom: '1px solid #444' }}>
                PACKET HISTORY
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                {logs.length === 0 && <div style={{ color: '#666', fontSize: '12px' }}>No packets yet...</div>}

                {logs.map((log) => (
                    <div key={log.id} style={{ marginBottom: '8px', border: '1px solid #444', borderRadius: '4px', background: '#252526' }}>
                        {/* ヘッダー行 */}
                        <div
                            onClick={() => toggleExpand(log.id)}
                            style={{
                                padding: '8px',
                                cursor: 'pointer',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '13px'
                            }}
                        >
                            <span>
                                <span style={{ color: '#4CAF50' }}>{log.src}</span>
                                <span style={{ margin: '0 8px', color: '#888' }}>→</span>
                                <span style={{ color: '#2196F3' }}>{log.dst}</span>
                            </span>
                            <span style={{ fontSize: '10px', color: '#666' }}>
                                {expandedIds.has(log.id) ? '▲' : '▽'}
                            </span>
                        </div>

                        {/* 展開部分 */}
                        {expandedIds.has(log.id) && (
                            <div style={{ padding: '8px', borderTop: '1px solid #444', background: '#1e1e1e', fontSize: '12px', color: '#aaa' }}>
                                <div style={{ marginBottom: '4px' }}>Time: {log.timestamp}</div>
                                <div style={{ marginBottom: '4px' }}>Info: {log.summary}</div>
                                <div style={{ whiteSpace: 'pre-wrap', color: '#ce9178' }}>
                                    {log.details}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};