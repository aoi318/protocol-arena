import React from 'react';
import { NetworkCanvas } from './components/NetworkCanvas';

// Apple風のカードコンポーネント (再利用するため)
const Card = ({ title, children, className = "" }: { title: string, children: React.ReactNode, className?: string }) => (
  <div className={`bg-mac-panel rounded-2xl border border-mac-border shadow-sm flex flex-col overflow-hidden ${className}`}>
    <div className="px-4 py-3 border-b border-mac-border bg-gray-50/50 backdrop-blur-sm">
      <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</h2>
    </div>
    <div className="flex-1 overflow-auto p-4 relative">
      {children}
    </div>
  </div>
);

function App() {
  return (
    <div className="h-screen w-screen p-4 flex gap-4 overflow-hidden bg-mac-bg font-sans">

      {/* --- 左サイドバー (エディタ & メモリ) --- */}
      <div className="w-80 flex flex-col gap-4 shrink-0">

        {/* 1. エディタエリア */}
        <Card title="Editor" className="flex-1">
          <div className="text-sm text-gray-400 font-mono">
            {/* ここに将来エディタが入る */}
            // Code goes here...<br />
            const node = new Node();
          </div>
        </Card>

        {/* 2. メモリマップエリア */}
        <Card title="Memory Map" className="h-1/3">
          <div className="space-y-2">
            {/* ダミーデータ表示 */}
            <div className="flex justify-between text-xs border-b border-gray-100 pb-1">
              <span className="font-mono text-gray-400">0x00</span>
              <span className="font-mono text-blue-600">AF 30 11</span>
            </div>
            <div className="flex justify-between text-xs border-b border-gray-100 pb-1">
              <span className="font-mono text-gray-400">0x04</span>
              <span className="font-mono text-blue-600">00 00 FF</span>
            </div>
          </div>
        </Card>

      </div>

      {/* --- メインエリア (キャンバス & 履歴) --- */}
      <div className="flex-1 flex flex-col gap-4 min-w-0">

        {/* 3. メイン画面 (Canvas) */}
        <Card title="Network Topology" className="flex-[2] relative p-0">
          {/* CanvasはPaddingなしで全画面表示したいので親のスタイルを調整 */}
          <div className="absolute inset-0 top-10"> {/* top-10はヘッダー分 */}
            <NetworkCanvas />
          </div>
        </Card>

        {/* 4. パケット履歴 */}
        <Card title="Packet Inspector" className="flex-1 min-h-[150px]">
          <table className="w-full text-left text-xs">
            <thead className="text-gray-400 font-medium">
              <tr>
                <th className="pb-2">Time</th>
                <th className="pb-2">Source</th>
                <th className="pb-2">Dest</th>
                <th className="pb-2">Info</th>
              </tr>
            </thead>
            <tbody className="font-mono text-gray-600">
              {/* ダミーログ */}
              <tr className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                <td className="py-1">0.05s</td>
                <td>Node 0</td>
                <td>Node 1</td>
                <td>Ethernet Frame (Size: 64)</td>
              </tr>
              <tr className="border-b border-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                <td className="py-1">0.10s</td>
                <td>Node 1</td>
                <td>Broadcast</td>
                <td>ARP Request</td>
              </tr>
            </tbody>
          </table>
        </Card>

      </div>
    </div>
  );
}

export default App;