// net-core/src/lib.rs

mod packets;

use crate::packets::TcpState;
use packets::Packet;
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct NetworkState {
    packets: Vec<Packet>,
}

#[wasm_bindgen]
impl NetworkState {
    pub fn new() -> Self {
        Self {
            packets: Vec::new(),
        }
    }

    pub fn add_packet(&mut self, kind: u8) {
        let id: u32 = self.packets.len() as u32;
        let y: f64 = 50.0 + (self.packets.len() as f64 * 50.0);

        let packet: Packet = Packet::new(id, kind, 0.0, y);

        self.packets.push(packet);
    }

    pub fn tick(&mut self) {
        for packet in &mut self.packets {
            packet.step();

            if packet.kind == 0 {
                if 400.0 < packet.x && packet.tcp_state == TcpState::Closed as u8 {
                    packet.tcp_state = TcpState::SynSent as u8;
                } else if 700.0 < packet.x && packet.tcp_state == TcpState::SynSent as u8 {
                    packet.tcp_state = TcpState::Established as u8;
                }
            }
        }
    }

    pub fn packets_ptr(&self) -> *const Packet {
        self.packets.as_ptr()
    }

    pub fn packets_len(&self) -> usize {
        self.packets.len()
    }

    pub fn get_packet_state(&self, index: usize) -> u8 {
        if index < self.packets.len() {
            self.packets[index].tcp_state
        } else {
            0
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_network_state_tick() {
        let mut state: NetworkState = NetworkState::new();

        state.add_packet(0);
        assert_eq!(state.packets_len(), 1);

        let ptr: *const Packet = state.packets_ptr();
        assert!(!ptr.is_null());

        state.tick();
    }

    #[test]
    fn test_packet_state_transition() {
        let mut state: NetworkState = NetworkState::new();
        state.add_packet(0);
        for _ in 0..800 {
            state.tick();
        }

        assert_eq!(state.get_packet_state(0), 4);
    }
}
