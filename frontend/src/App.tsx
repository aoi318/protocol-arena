import { NetworkCanvas } from './components/NetworkCanvas';
import { HexViewer } from './components/HexViewer';

function App() {

  const dummyBuffer = new ArrayBuffer(32);
  const dummyView = new DataView(dummyBuffer);
  // ちょっと値を入れてみる
  dummyView.setUint8(0, 0xFF);
  dummyView.setUint8(4, 0xAA);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Protocol Battle Arena</h1>
      <NetworkCanvas />
      <HexViewer data={dummyView} label="Test Packet" />
    </div>
  );
}

export default App;