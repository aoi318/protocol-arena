// net-core/src/packets.rs

use wasm_bindgen::prelude::*;

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
    fn test_udp_header_size() {
        assert_eq!(8, size_of::<UdpHeader>());
    }
}
