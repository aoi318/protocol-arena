// frontend/src/components/NetworkCanvas.tsx

import { useEffect, useRef, useState } from 'react';
import init, { NetworkState } from 'net-core';
import { HexViewer } from './HexViewer';

const PACKET_SIZE = 32;
const OFFSET_STATE = 5;
const OFFSET_X = 8;
const OFFSET_Y = 16;

export const NetworkCanvas = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const stateRef = useRef<NetworkState | null>(null);

    const [wasmMemory, setWasmMemory] = useState<WebAssembly.Memory | null>(null);
    const [selectedPacket, setSelectedPacket] = useState<DataView | null>(null);

    useEffect(() => {
        const startWasm = async () => {
            const wasm = await init();
            setWasmMemory(wasm.memory);

            const state = NetworkState.new();
            stateRef.current = state;
        };
        startWasm();
    }, []);

    useEffect(() => {
        if (!wasmMemory) return;

        const render = () => {
            const canvas = canvasRef.current;
            const state = stateRef.current;
            if (!canvas || !state) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            state.tick();

            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const view = new DataView(wasmMemory.buffer);
            const ptr = state.packets_ptr();
            const len = state.packets_len();

            for (let i = 0; i < len; i++) {
                const base = ptr + (i * PACKET_SIZE);
                const x = view.getFloat64(base + OFFSET_X, true);
                const y = view.getFloat64(base + OFFSET_Y, true);
                const stateVal = view.getUint8(base + OFFSET_STATE);

                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);

                if (stateVal === 0) ctx.fillStyle = 'gray';        // Closed
                else if (stateVal === 2) ctx.fillStyle = 'orange';  // SynSent (→)
                else if (stateVal === 3) ctx.fillStyle = '#aa00ff'; // SynReceived (←) ★追加
                else if (stateVal === 4) ctx.fillStyle = 'green';   // Established (→)
                else ctx.fillStyle = 'blue';                        // UDP / Others

                ctx.fill();
            }

            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [wasmMemory]);

    const handleAddPacket = (kind: number) => {
        const state = stateRef.current;
        if (!state) return;

        state.add_packet(kind);
    }

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        const state = stateRef.current;
        if (!canvas || !state || !wasmMemory) return;

        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const view = new DataView(wasmMemory.buffer);
        const ptr = state.packets_ptr();
        const len = state.packets_len();

        for (let i = 0; i < len; i++) {
            const base = ptr + (i * PACKET_SIZE);
            const x = view.getFloat64(base + OFFSET_X, true);
            const y = view.getFloat64(base + OFFSET_Y, true);

            const dist = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);

            if (dist < 15) {
                const packetData = wasmMemory.buffer.slice(base, base + PACKET_SIZE);
                setSelectedPacket(new DataView(packetData));

                return;
            }
        }

        setSelectedPacket(null);
    }

    return (
        <div style={{ padding: '20px' }}>
            <h2 style={{ marginBottom: '10px' }}>Protocol Battle Arena</h2>

            {/* 操作パネル */}
            <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
                <button
                    onClick={() => handleAddPacket(0)}
                    style={{ padding: '10px 20px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send TCP (SYN)
                </button>
                <button
                    onClick={() => handleAddPacket(1)}
                    style={{ padding: '10px 20px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    Send UDP
                </button>
            </div>

            {/* メイン画面 */}
            <canvas
                ref={canvasRef}
                width={1000}
                height={500}
                style={{ border: '1px solid black', background: '#f0f0f0', cursor: 'pointer' }}
                onClick={handleClick}
            />

            {/* メモリ */}
            <HexViewer data={selectedPacket} label="Packet Snapshot" />
        </div>


    );
};