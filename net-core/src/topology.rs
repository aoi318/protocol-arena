// net-core/src/topology.rs

use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Node {
    pub id: u32,
    pub x: f64,
    pub y: f64,
}

#[wasm_bindgen]
#[derive(Debug, Clone, Copy)]
pub struct Link {
    pub id: u32,
    pub node_a_id: u32,
    pub node_b_id: u32,
    pub length: f64,
}
