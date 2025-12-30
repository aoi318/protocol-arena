// net-core/src/lib.rs

mod frames;
mod topology;

use crate::frames::EthernetFrame;
use std::collections::HashMap;
use std::panic;
use topology::{Link, Node};
use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct NetworkState {
    nodes: Vec<Node>,
    links: Vec<Link>,
    frames: Vec<EthernetFrame>,

    #[wasm_bindgen(skip)]
    mac_tables: HashMap<u32, HashMap<u32, u32>>,
}

#[wasm_bindgen]
impl NetworkState {
    pub fn new() -> Self {
        panic::set_hook(Box::new(console_error_panic_hook::hook));

        Self {
            nodes: Vec::new(),
            links: Vec::new(),
            frames: Vec::new(),
            mac_tables: HashMap::new(),
        }
    }

    // ノード追加 (kind: 0=Host, 1=Switch)
    pub fn add_node(&mut self, x: f64, y: f64, kind: u8) -> u32 {
        let id: u32 = self.nodes.len() as u32;
        let node: Node = Node { id, x, y, kind };
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

        // src_mac は一旦簡易的に送信元ノードIDと同じにする
        let src_mac = from_node_id;

        let frame: EthernetFrame = EthernetFrame {
            id,
            link_id,
            from_node_id,
            progress: 0.0,
            speed,
            src_mac,
            dst_mac,
        };
        self.frames.push(frame);
        id
    }

    fn get_connected_links(&self, node_id: u32) -> Vec<u32> {
        let mut result = Vec::new();
        for link in &self.links {
            if link.node_a_id == node_id || link.node_b_id == node_id {
                result.push(link.id);
            }
        }
        result
    }

    pub fn tick(&mut self) {
        // 1. 移動
        for frame in &mut self.frames {
            frame.progress += frame.speed;
        }

        // 2. 到着判定
        let mut arrived_indices = Vec::new();
        for (i, frame) in self.frames.iter().enumerate() {
            if frame.progress >= 1.0 {
                arrived_indices.push(i);
            }
        }

        // 3. スイッチング処理
        for index in arrived_indices.into_iter().rev() {
            let frame = self.frames.remove(index);

            let link = &self.links[frame.link_id as usize];
            let current_node_id = if frame.from_node_id == link.node_a_id {
                link.node_b_id
            } else {
                link.node_a_id
            };

            let node = &self.nodes[current_node_id as usize];

            if node.kind == 0 {
                // === Host (PC) ===
                if frame.dst_mac == current_node_id {
                    web_sys::console::log_1(
                        &format!("PC {}: Packet Received!", current_node_id).into(),
                    );
                }
            } else {
                // === Switch ===
                // Learning
                let table = self
                    .mac_tables
                    .entry(current_node_id)
                    .or_insert(HashMap::new());
                table.insert(frame.src_mac, frame.link_id);

                // Forwarding
                if let Some(&target_link_id) = table.get(&frame.dst_mac) {
                    if target_link_id != frame.link_id {
                        self.send_frame(target_link_id, current_node_id, frame.dst_mac);
                    }
                } else {
                    // Flooding
                    let links = self.get_connected_links(current_node_id);
                    for l_id in links {
                        if l_id != frame.link_id {
                            self.send_frame(l_id, current_node_id, frame.dst_mac);
                        }
                    }
                }
            }
        }
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
    pub fn frames(&self) -> *const EthernetFrame {
        self.frames.as_ptr()
    }
    pub fn frames_len(&self) -> usize {
        self.frames.len()
    }
}

// テスト
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_topology_creation() {
        let mut state: NetworkState = NetworkState::new();

        // 0 = Host
        let id1: u32 = state.add_node(0.0, 0.0, 0);
        assert_eq!(id1, 0);

        let id2: u32 = state.add_node(100.0, 100.0, 0);
        assert_eq!(id2, 1);

        let link_id: u32 = state.add_link(id1, id2);
        assert_eq!(link_id, 0);

        assert_eq!(state.nodes_len(), 2);
    }

    #[test]
    fn test_switch_flooding() {
        let mut state = NetworkState::new();
        // Node 0 (Host) -- Node 1 (Switch) -- Node 2 (Host)
        let n0 = state.add_node(0.0, 0.0, 0);
        let n1_sw = state.add_node(50.0, 0.0, 1); // Switch
        let n2 = state.add_node(100.0, 0.0, 0);

        let l1 = state.add_link(n0, n1_sw);
        let _l2 = state.add_link(n1_sw, n2);

        // Host 0 -> Host 2 へ送信
        state.send_frame(l1, n0, n2);

        // Tickを進めて、スイッチまで到達させる
        for _ in 0..25 {
            state.tick();
        }

        // スイッチがFloodingしてフレームが増えているはず (frames_len > 0)
        assert!(state.frames_len() > 0);
    }
}
