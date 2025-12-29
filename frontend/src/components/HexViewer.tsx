import React from 'react';

interface HexViewerProps {
    data: DataView | null;
    label?: string;
}

export const HexViewer: React.FC<HexViewerProps> = ({ data, label = "Memory Dump" }) => {
    if (!data) {
        return <div style={{ padding: 10, color: '#999' }}>Select a packet to inspect memory</div>;
    }

    const toHex = (byte: number) => byte.toString(16).padStart(2, '0').toUpperCase();

    const rows = [];
    for (let i = 0; i < data.byteLength; i += 8) {
        const rowBytes = [];
        for (let j = 0; j < 8; j++) {
            if (i + j < data.byteLength) {
                const val = data.getUint8(i + j);
                rowBytes.push(toHex(val));
            } else {
                rowBytes.push("  ");
            }
        }
        rows.push({
            addr: toHex(i),
            bytes: rowBytes,
        });
    }

    return (
        <div style={{ fontFamily: 'monospace', background: '#222', color: '#0f0', padding: '10px', borderRadius: '4px', marginTop: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', fontSize: '14px', borderBottom: '1px solid #444' }}>{label}</h3>
            <table style={{ borderCollapse: 'collapse', width: '100%' }}>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.addr}>
                            {/* アドレス部分*/}
                            <th style={{ textAlign: 'right', paddingRight: '10px', color: '#888', borderRight: '1px solid #444' }}>
                                {row.addr}
                            </th>
                            {/* データ部分*/}
                            <td style={{ paddingLeft: '10px' }}>
                                {row.bytes.map((byte, idx) => (
                                    <span key={idx} style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>
                                        {byte}
                                    </span>
                                ))}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}