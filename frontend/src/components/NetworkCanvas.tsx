import React, { useEffect, useRef, useState } from 'react';
import init, { NetworkState } from 'net-core';

const NODE_SIZE = 24;  // id(4) + pad(4) + x(8) + y(8) = 24
const LINK_SIZE = 24;  // id(4) + a(4) + b(4) + pad(4) + len(8) = 24
const FRAME_SIZE = 40; // id(4) + link(4) + from(4) + pad(4) + prog(8) + speed(8) + src(4) + dst(4) = 40

export const NetworkCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [network, setNetwork] = useState<NetworkState | null>(null);
    const [memory, setMemory] = useState<WebAssembly.Memory | null>(null);

    useEffect(() => {
        init().then((wasm) => {
            const net = NetworkState.new();
            setNetwork(net);
            setMemory(wasm.memory);

            // --- デバッグ用の初期配置 ---
            const n1 = net.add_node(100, 300, 0);
            const n2 = net.add_node(500, 300, 0);
            const link = net.add_link(n1, n2);
            setInterval(() => {
                net.send_frame(link, n1, 0xFF);
            }, 2000);
            // ---------------------------
        });
    }, []);

    useEffect(() => {
        if (!network || !memory || !canvasRef.current) return;

        const ctx = canvasRef.current.getContext('2d');
        if (!ctx) return;

        let animationId: number;

        const render = () => {
            network.tick();

            ctx.fillStyle = '#1e1e1e';
            ctx.fillRect(0, 0, 800, 600);

            const buffer = memory.buffer;
            const view = new DataView(buffer);

            const nodesPtr = network.nodes();
            const nodesLen = network.nodes_len();
            const nodes = [];

            for (let i = 0; i < nodesLen; i++) {
                const base = nodesPtr + i * NODE_SIZE;
                const id = view.getUint32(base + 0, true);
                const x = view.getFloat64(base + 8, true);
                const y = view.getFloat64(base + 16, true);

                nodes.push({ id, x, y });

                ctx.beginPath();
                ctx.arc(x, y, 20, 0, Math.PI * 2);
                ctx.fillStyle = '#4CAF50';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.stroke();

                ctx.fillStyle = '#fff';
                ctx.font = '12px monospace';
                ctx.fillText(`Node ${id}`, x - 20, y - 30);
            }

            const linksPtr = network.links();
            const linksLen = network.links_len();
            const links = [];

            for (let i = 0; i < linksLen; i++) {
                const base = linksPtr + i * LINK_SIZE;
                const id = view.getUint32(base + 0, true);
                const nodeAId = view.getUint32(base + 4, true);
                const nodeBId = view.getUint32(base + 8, true);
                const length = view.getFloat64(base + 16, true);

                links.push({ id, nodeAId, nodeBId, length });

                const nodeA = nodes.find(n => n.id === nodeAId);
                const nodeB = nodes.find(n => n.id === nodeBId);

                if (nodeA && nodeB) {
                    ctx.beginPath();
                    ctx.moveTo(nodeA.x, nodeA.y);
                    ctx.lineTo(nodeB.x, nodeB.y);
                    ctx.strokeStyle = '#666';
                    ctx.lineWidth = 4;
                    ctx.stroke();
                }
            }

            const framesPtr = network.frames();
            const framesLen = network.frames_len();

            for (let i = 0; i < framesLen; i++) {
                const base = framesPtr + i * FRAME_SIZE;

                const linkId = view.getUint32(base + 4, true);
                const fromNodeId = view.getUint32(base + 8, true);
                const progress = view.getFloat64(base + 16, true);

                const link = links.find(l => l.id === linkId);
                if (link) {
                    const nodeA = nodes.find(n => n.id === link.nodeAId);
                    const nodeB = nodes.find(n => n.id === link.nodeBId);

                    if (nodeA && nodeB) {
                        const start = (fromNodeId === nodeA.id) ? nodeA : nodeB;
                        const end = (fromNodeId === nodeA.id) ? nodeB : nodeA;

                        const x = start.x + (end.x - start.x) * progress;
                        const y = start.y + (end.y - start.y) * progress;

                        ctx.beginPath();
                        ctx.arc(x, y, 8, 0, Math.PI * 2);
                        ctx.fillStyle = '#FFEB3B';
                        ctx.fill();
                    }
                }
            }
        };

        const loop = () => {
            render();
            animationId = requestAnimationFrame(loop);
        };
        loop();

        return () => cancelAnimationFrame(animationId);
    }, [network, memory]);

    return (
        <canvas
            ref={canvasRef}
            width={800}
            height={600}
            style={{ width: '100%', height: '100%' }}
        />
    );
};