export type ProjectCategory = "design-team" | "course" | "personal";

export interface ProjectImage {
  src: string;
  alt: string;
}

export interface Project {
  id: number;
  title: string;
  summary: string;
  description: string[];   // each string = one bullet point
  role: string;
  tools: string[];
  images?: ProjectImage[];   // multiple → carousel; one → static; omit → no photo
  githubUrl?: string;
  category: ProjectCategory;
}

const projects: Project[] = [
  {
    id: 1,
    title: "Driver Display - Drive State Machine",
    summary: "Safety-critical drive-state controller for a solar race car HMI.",
    description: [
      "Safety-critical FSM controlling → REVERSE <-> PARK <-> DRIVE state transitions, with pre-condition checks (brake hold, motor temp, BMS status) enforced before any transition is accepted.",
      "CAN bus message parsing from the motor controller and BMS through a custom hardware abstraction layer; outgoing state commands packed as CAN frames and sent to the motor control interface.",
      "Interrupt-driven peripheral drivers for button inputs, and indicator LEDs, allowing deterministic response times under FreeRTOS.",
      "Utilizes an Extended Kalman Filter (EKF) program to estimate battery state-of-charge",
    ],
    role: "Drive-state machine design and implementation, CAN message parsing, HAL for dashboard peripherals, FreeRTOS task architecture.",
    tools: ["C", "STM32", "FreeRTOS", "CAN bus", "STM32CubeIDE", "J-Link / GDB"],
    images: [
      {
        src: "/drd.png",
        alt: "Driver display dashboard on the solar race car",
      },
    ],
    githubUrl: "https://github.com/UBC-Solar/firmware_v4/tree/main/firmware/components/drd",
    category: "design-team",
  },
  {
    id: 2,
    title: "Sunlite — Cellular Telemetry Gateway",
    summary: "Raspberry Pi 4B service streaming live solar car CAN telemetry to InfluxDB over LTE/5G.",
    description: [
      "Python service running on a Raspberry Pi 4B that reads live vehicle CAN traffic through its telemetry system using UART, decodes frames against the team's DBC file, and forwards timestamped records to an InfluxDB instance over a NETGEAR LTE/5G hotspot.",
      "Tailscale mesh VPN configured on the Pi for secure remote SSH access from any team member's machine without exposing the Pi to the public internet.",
      "Automated installation via shell scripts that provision the Python venv, dependencies, systemd services, InfluxDB CLI, and Tailscale in a single run on a fresh Raspberry Pi OS image.",
      "Simulation and characterization tooling for validating the pipeline against a YAML-templated CAN message set without physical hardware.",
    ],
    role: "CAN-to-InfluxDB pipeline, gRPC transport layer, Tailscale remote access setup, installation automation, and simulation tooling.",
    tools: ["Python", "Raspberry Pi 4B", "CAN bus", "DBC", "InfluxDB", "gRPC", "Tailscale", "LTE/5G", "systemd", "Shell"],
    images: [
      {
        src: "/cellular.jpeg",
        alt: "Sunlite cellular telemetry hardware on the solar race car",
      },
    ],
    githubUrl: "https://github.com/UBC-Solar/sunlite",
    category: "design-team",
  },
  {
    id: 3,
    title: "GPS Telemetry Firmware",
    summary: "FreeRTOS firmware thread parsing live GPS data from NMEA sentences and broadcasting positions over CAN.",
    description: [
      "FreeRTOS task that reads raw NMEA 0183 sentences (GGA, GLL, GSA, RMC, VTG, GSV) from a GPS module over UART, validates each sentence's checksum, and extracts position, velocity, and fix-quality fields.",
      "Parsed data packaged into CAN frames and transmitted over the solar car's telemetry system, enabling the pit crew to locate the vehicle to within 0.5m at a 200ms update rate.",
      "Task architecture designed within the FreeRTOS scheduler to meet strict real-time deadlines without starving higher-priority tasks.",
    ],
    role: "Sole firmware author — NMEA parser, checksum validation, CAN frame packing, FreeRTOS task design and integration.",
    tools: ["C", "STM32", "FreeRTOS", "NMEA 0183", "CAN bus", "UART", "J-Link / GDB"],
    images: [
      {
        src: "/gps.png",
        alt: "GPS module mounted on the UBC Solar car PCB",
      },
    ],
    githubUrl: "https://github.com/UBC-Solar/firmware_v3/tree/master/components/tel",
    category: "design-team",
  },
  {
    id: 4,
    title: "FPGA Tron — Light-Cycle Game",
    summary: "Tron light-cycle game running on an FPGA with VGA output and a lookahead AI opponent.",
    description: [
      "160×120 pixel VGA arena running on a Nios V (RISC-V rv32im_zicsr) soft processor on the Intel DE10-Lite FPGA in bare-metal C.",
      "Interrupt-driven player input — KEY0/KEY1 pushbuttons queue turns that resolve at the next game tick; speed selected via slide switches.",
      "Lookahead AI opponent; collisions with walls, obstacles, or trails end a round; simultaneous head-on collision scores a draw.",
      "Scores displayed live on 7-segment HEX displays; full-screen colour flash signals the end of a 9-round match.",
    ],
    role: "Sole developer — game logic, VGA rendering loop, interrupt-driven input, lookahead AI, and cross-compiled build system.",
    tools: ["C", "Nios V (RISC-V)", "Intel DE10-Lite", "VGA", "FPGA", "Makefile"],
    images: [
      {
        src: "/tron.jpeg",
        alt: "FPGA Tron light-cycle game running on VGA display",
      },
    ],
    githubUrl: "https://github.com/tonychen-2006/fpga_tron_game",
    category: "course",
  },
  {
    id: 5,
    title: "RISC-V Single-Cycle CPU",
    summary: "A complete RV32I-subset CPU implemented in SystemVerilog and verified on an Intel FPGA.",
    description: [
      "Classic single-cycle architecture (Harris & Harris): every instruction completes in one clock cycle with no pipelining or caching.",
      "Controller split into a main decoder (opcode → control signals) and ALU decoder (funct3/funct7 → ALUControl), directing a datapath with a 32×32-bit register file, sign-extender, ALU, and result mux.",
      "Supports R-type (add, sub, and, or, slt), I-type (lw, addi, andi, ori, slti), S-type (sw), B-type (beq), and J-type (jal) instructions.",
      "DE-board peripherals (LEDs, HEX displays, slide switches) exposed via MMIO at 0xFF200000; correctness verified with a self-checking SystemVerilog testbench and a hand-assembled assembly demo.",
    ],
    role: "Sole designer — full RTL implementation across all modules (controller, datapath, ALU, regfile, memories), testbench authoring, and assembly-level verification.",
    tools: ["SystemVerilog", "RISC-V Assembly", "ModelSim / QuestaSim", "Intel DE10-Lite", "FPGA"],
    images: [
      {
        src: "/riscv.jpeg",
        alt: "RISC-V single-cycle CPU block diagram and FPGA board",
      },
    ],
    githubUrl: "https://github.com/tonychen-2006/riscv_cpu_single_cycle",
    category: "course",
  },
  {
    id: 6,
    title: "Music Sync — GoPro × Apple Music Bridge",
    summary: "ESP32 + iOS system that auto-syncs GoPro recordings to Apple Music for frame-perfect video edits.",
    description: [
      "ESP32 BLE GATT server (Nordic UART Service) paired to an iOS CoreBluetooth client; the app polls Apple Music every 150ms and sends song URI, title, duration, playback state, and millisecond-accurate position as compact BLE commands.",
      "ESP32 WiFi client drives the GoPro HTTP shutter API and automatically starts and stops recording when playback state changes, keeping footage locked to the music timeline.",
      "Song and starting/ending clip events persisted to LittleFS flash, then on-demand Final Cut Pro-compatible XML timeline generation, split into 140-byte BLE chunks for reliable transfer.",
      "iOS app reassembles BLE chunks, reconstructs the full XML, and exports it via the native share sheet for direct import into Final Cut Pro.",
    ],
    role: "Sole developer — ESP32 C++ firmware (BLE server, GoPro WiFi control, LittleFS event log, XML generation, chunk protocol), iOS Swift app (CoreBluetooth client, Apple Music tracking, XML reassembly, share sheet).",
    tools: ["C++", "ESP32", "PlatformIO", "Swift", "SwiftUI", "CoreBluetooth", "BLE", "LittleFS", "GoPro HTTP API", "Xcode"],
    images: [
      {
        src: "/music_sync.png",
        alt: "Music Sync app screenshot — GoPro and Apple Music integration",
      },
    ],
    githubUrl: "https://github.com/tonychen-2006/music_sync",
    category: "personal",
  },
  {
    id: 7,
    title: "Custom Heap Allocator",
    summary: "A from-scratch dynamic memory allocator in C with block splitting, coalescing, and alignment.",
    description: [
      "Implemented malloc, free, and realloc from scratch in C, supporting block splitting on allocation and immediate coalescing of adjacent free blocks to reduce heap fragmentation.",
      "Designed a free-list metadata structure (header/footer boundary tags) to enable O(1) coalescing and efficient heap traversal without scanning all allocated blocks.",
      "Enforced 8-byte alignment on all allocations and validated correctness with a heap consistency checker that detects overlapping blocks, invalid pointers, and list invariant violations.",
    ],
    role: "Sole developer — allocator design, metadata layout, free-list management, alignment enforcement, and heap consistency checker.",
    tools: ["C", "GDB", "Valgrind", "Linux"],
    images: [
      {
        src: "/malloc.png",
        alt: "Custom heap allocator memory block diagram",
      },
    ],
    githubUrl: "https://github.com/tonychen-2006/heap_allocation/tree/main",
    category: "course",
  },
];

export default projects;
