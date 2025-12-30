import React, { useState } from 'react';

interface AssemblyEditorProps {
    onRun: (code: string) => void;
}

export const AssemblyEditor: React.FC<AssemblyEditorProps> = ({ onRun }) => {
    const [code, setCode] = useState<string>(
        "// Type commands here\n" +
        "// TCP [src] [dst] [data]\n" +
        "TCP 80 443 HELLO\n" +
        "UDP 53 0 DNS_REQ"
    );

    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#1e1e1e', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', background: '#333', color: '#ccc', fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>ASSEMBLY EDITOR</span>
                <button
                    onClick={() => onRun(code)}
                    style={{ background: '#4CAF50', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '2px', cursor: 'pointer', fontSize: '12px' }}
                >
                    RUN ▶
                </button>
            </div>
            <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{
                    flex: 1,
                    background: '#1e1e1e',
                    color: '#d4d4d4',
                    border: 'none',
                    resize: 'none',
                    padding: '10px',
                    fontFamily: 'monospace',
                    fontSize: '14px',
                    lineHeight: '1.5',
                    outline: 'none'
                }}
                spellCheck={false}
            />
        </div>
    );
};