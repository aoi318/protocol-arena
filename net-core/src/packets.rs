// net-core/src/packets.rs

use wasm_bindgen::prelude::*;

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
#[repr(C, packed)]
#[derive(Debug, Clone, Copy)]
pub struct UdpHeader {
    pub src_port: u16,
    pub dst_port: u16,
    pub length: u16,
    pub checksum: u16,
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tcp_header_size() {
        assert_eq!(20, size_of::<TcpHeader>());
    }

    #[test]
    fn test_udp_header_size() {
        assert_eq!(8, size_of::<UdpHeader>());
    }
}
