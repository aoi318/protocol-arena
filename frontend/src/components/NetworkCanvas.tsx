// frontend/src/components/NetworkCanvas.tsx

import { useEffect, useRef, useState } from 'react';
import init, { NetworkState } from 'net-core';
import { HexViewer } from './HexViewer';

const PACKET_SIZE = 24;
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
            state.add_packet(0); // TCP
            state.add_packet(1); // UDP
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

                console.log(stateVal);

                ctx.beginPath();
                ctx.arc(x, y, 10, 0, Math.PI * 2);

                if (stateVal === 0) ctx.fillStyle = 'gray';
                else if (stateVal === 2) ctx.fillStyle = 'orange';
                else if (stateVal === 4) ctx.fillStyle = 'green';
                else ctx.fillStyle = 'blue';

                ctx.fill();
            }

            requestAnimationFrame(render);
        };

        const animationId = requestAnimationFrame(render);
        return () => cancelAnimationFrame(animationId);
    }, [wasmMemory]);

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

            setSelectedPacket(null);
        }
    }

    return (
        <div>
            <canvas
                ref={canvasRef}
                width={800}
                height={400}
                style={{ border: '1px solid black', background: '#f0f0f0', cursor: 'pointer' }}
                onClick={handleClick}
            />

            <HexViewer data={selectedPacket} label="Packet Snapshot" />
        </div>


    );
};