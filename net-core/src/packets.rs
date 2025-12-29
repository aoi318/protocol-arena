// net-core/src/packets.rs

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[repr(C)]
#[derive(Debug, Clone, Copy)]
pub struct Packet {
    pub id: u32,
    pub kind: u8, // 0: TCP, 1: UDP
    pub x: f64,
    pub y: f64,
    pub tcp_state: u8,
}

#[wasm_bindgen]
#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct TcpHeader {
    pub src_port: u16,
    pub dst_port: u16,
    pub seq_num: u32,
    pub ack_num: u32,
    pub offset_flags: u16,
    pub window_size: u16,
    pub checksum: u16,
    pub urgent_ptr: u16,
}

#[wasm_bindgen]
#[repr(u8)]
#[derive(Debug, Clone, Copy)]
pub enum TcpState {
    Closed = 0,
    Listen = 1,
    SynSent = 2,
    SynReceived = 3,
    Established = 4,
    FinWait = 5,
}

#[wasm_bindgen]
#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct UdpHeader {
    pub src_port: u16,
    pub dst_port: u16,
    pub length: u16,
    pub checksum: u16,
}

impl Packet {
    pub fn new(id: u32, kind: u8, x: f64, y: f64) -> Self {
        Self {
            id,
            kind,
            x,
            y,
            tcp_state: TcpState::Closed as u8,
        }
    }

    pub fn step(&mut self) {
        self.x += 1.0;
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_packet_creation() {
        let p: Packet = Packet::new(1, 0, 10.0, 20.0);

        assert_eq!(p.tcp_state, TcpState::Closed as u8);
    }

    #[test]
    fn test_packet_movement() {
        let mut packet: Packet = Packet::new(1, 0, 0.0, 50.0);

        packet.step();

        assert!(packet.x > 0.0);
    }

    #[test]
    fn test_tcp_header_size() {
        assert_eq!(20, size_of::<TcpHeader>());
    }

    #[test]
    fn test_udp_header_size() {
        assert_eq!(8, size_of::<UdpHeader>());
    }
}
