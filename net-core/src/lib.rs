// net-core/src/lib.rs

mod packets;

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
        let packet: Packet = Packet::new(id, kind, 0.0, 50.0);

        self.packets.push(packet);
    }

    pub fn tick(&mut self) {
        for packet in &mut self.packets {
            packet.step();
        }
    }

    pub fn packets_ptr(&self) -> *const Packet {
        self.packets.as_ptr()
    }

    pub fn packets_len(&self) -> usize {
        self.packets.len()
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
}
