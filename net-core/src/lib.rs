// net-core/src/lib.rs

mod frames;
mod topology;
// mod packets;

use std::panic;
use topology::{Link, Node};
use wasm_bindgen::prelude::*;

use crate::frames::EthernetFrame;

#[wasm_bindgen]
pub struct NetworkState {
    nodes: Vec<Node>,
    links: Vec<Link>,
    frames: Vec<EthernetFrame>,
}

#[wasm_bindgen]
impl NetworkState {
    pub fn new() -> Self {
        panic::set_hook(Box::new(console_error_panic_hook::hook));

        Self {
            nodes: Vec::new(),
            links: Vec::new(),
            frames: Vec::new(),
        }
    }

    // ノード追加
    pub fn add_node(&mut self, x: f64, y: f64) -> u32 {
        let id: u32 = self.nodes.len() as u32;
        let node: Node = Node { id, x, y };
        self.nodes.push(node);

        id
    }

    // リンク追加
    pub fn add_link(&mut self, node_a_id: u32, node_b_id: u32) -> u32 {
        let id: u32 = self.links.len() as u32;

        let node_a: &Node = &self.nodes[node_a_id as usize];
        let node_b: &Node = &self.nodes[node_b_id as usize];

        let dx: f64 = node_a.x - node_b.x;
        let dy: f64 = node_a.y - node_b.y;
        let length: f64 = (dx * dx + dy * dy).sqrt();

        let link: Link = Link {
            id,
            node_a_id,
            node_b_id,
            length,
        };
        self.links.push(link);

        id
    }

    pub fn send_frame(&mut self, link_id: u32, from_node_id: u32, dst_mac: u32) -> u32 {
        let id: u32 = self.frames.len() as u32;

        let speed: f64 = 0.05;

        let frame: EthernetFrame = EthernetFrame {
            id,
            link_id,
            from_node_id,
            progress: 0.0,
            speed,
            src_mac: 0,
            dst_mac,
        };
        self.frames.push(frame);
        id
    }

    pub fn tick(&mut self) {
        self.frames.retain_mut(|frame: &mut EthernetFrame| {
            frame.progress += frame.speed;

            if 1.0 <= frame.progress { false } else { true }
        });
    }

    pub fn get_frame(&self, index: usize) -> Option<EthernetFrame> {
        if index < self.frames.len() {
            Some(self.frames[index])
        } else {
            None
        }
    }

    // --- JS参照用 (Getter) ---

    pub fn nodes(&self) -> *const Node {
        self.nodes.as_ptr()
    }

    pub fn nodes_len(&self) -> usize {
        self.nodes.len()
    }

    pub fn links(&self) -> *const Link {
        self.links.as_ptr()
    }

    pub fn links_len(&self) -> usize {
        self.links.len()
    }
}

// テスト
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_topology_creation() {
        let mut state: NetworkState = NetworkState::new();

        let id1: u32 = state.add_node(0.0, 0.0);
        assert_eq!(id1, 0);

        let id2: u32 = state.add_node(100.0, 100.0);
        assert_eq!(id2, 1);

        let link_id: u32 = state.add_link(id1, id2);
        assert_eq!(link_id, 0);

        assert_eq!(state.nodes_len(), 2);
        assert_eq!(state.links_len(), 1);
    }

    #[test]
    fn test_frame_movement() {
        let mut state: NetworkState = NetworkState::new();
        let node1: u32 = state.add_node(0.0, 0.0);
        let node2: u32 = state.add_node(100.0, 0.0);

        let link_id: u32 = state.add_link(node1, node2);

        let frame_id: u32 = state.send_frame(link_id, node1, 0xFF);

        state.tick();

        let frame: EthernetFrame = state.get_frame(frame_id as usize).unwrap();

        assert!(frame.progress > 0.0);
        assert_eq!(frame.link_id, link_id);
    }

    #[test]
    fn test_frame_arrival() {
        let mut state: NetworkState = NetworkState::new();
        let n1: u32 = state.add_node(0.0, 0.0);
        let n2: u32 = state.add_node(100.0, 0.0);
        let link: u32 = state.add_link(n1, n2);

        let fid: u32 = state.send_frame(link, n1, 0xFF);

        for _ in 0..25 {
            state.tick();
        }

        assert!(state.get_frame(fid as usize).is_none());
    }
}
