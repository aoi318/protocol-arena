import { useState } from 'react';
import './App.css';
import { NetworkCanvas } from './components/NetworkCanvas';
import { AssemblyEditor } from './components/AssemblyEditor';
import { PacketLogger, type LogEntry } from './components/PacketLogger';
import { HexViewer } from './components/HexViewer';

function App() {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, timestamp: '10:00:01', src: 'Client1', dst: 'Server1', summary: 'SYN', details: 'Seq: 0\nWindow: 65535' },
    { id: 2, timestamp: '10:00:02', src: 'Server1', dst: 'Client1', summary: 'SYN/ACK', details: 'Seq: 0\nAck: 1' },
  ]);

  const [selectedMemory] = useState<DataView | null>(null);

  const handleRunCode = (code: string) => {
    console.log("Running code:", code);
    setLogs(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      src: 'Console',
      dst: 'System',
      summary: 'Command Executed',
      details: code
    }]);
  };

  return (
    <div className="app-container">
      {/* 左サイドバー */}
      <div className="sidebar-left">
        <div className="panel">
          <AssemblyEditor onRun={handleRunCode} />
        </div>
        <div className="panel">
          <HexViewer data={selectedMemory} label="Memory Inspector" />
        </div>
      </div>

      {/* 中央メイン画面 */}
      <div className="main-view">
        <div className="panel-header">NETWORK ARENA</div>
        <div style={{ flex: 1, position: 'relative' }}>
          <NetworkCanvas />
        </div>
      </div>

      {/* 右サイドバー (NEW!) */}
      <div className="sidebar-right">
        <PacketLogger logs={logs} />
      </div>
    </div>
  );
}

export default App;