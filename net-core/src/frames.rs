// net-core/src/frames.rs

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Clone, Copy, Debug)]
pub struct EthernetFrame {
    pub id: u32,
    pub link_id: u32,
    pub from_node_id: u32,
    pub progress: f64,
    pub speed: f64,
    pub src_mac: u32,
    pub dst_mac: u32,
}
