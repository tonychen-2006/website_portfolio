import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import styles from "./Reflect.module.css";

type Category = "all" | "academics" | "personal" | "projects" | "work";

type ContentBlock =
  | { type: "text"; value: string }
  | { type: "image"; src: string; alt?: string; description?: string };

export interface Post {
  slug: string;
  date: string;
  title: string;
  content: ContentBlock[];
  category: Exclude<Category, "all">;
}

const TABS: { label: string; value: Category }[] = [
  { label: "All", value: "all" },
  { label: "Academics", value: "academics" },
  { label: "Personal", value: "personal" },
  { label: "Projects", value: "projects" },
  { label: "Work", value: "work" },
];

export const posts: Post[] = [
  {
    slug: "pid-controller-logic-cruise-control",
    date: "March 2026",
    title: "Understanding PID Control Logic for Cruise Control",
    content: [
      {
        type: "text",
        value:
          "To compete in long distance races, such as ASC at the American Solar Challenge, our team must ensure that the drivers are well rested " +
          "so they can endure the long drive. Utilizing cruise control allows the speed to stay constant and for the driver to only focus on steering " +
          "and being aware of the road ahead. The most crucial part of cruise control is the PI formula where the algorithm adjusts the acceleration based " +
          "upon the error between the set velocity and the actual velocity. This post walks through how the PI controller and force equations are " +
          "implemented in cruise_control.c and how the program computes the net force for each tick. " +
          "The Simulink block diagram below models the full vehicle dynamics, each block maps directly to a function in the code, explained in the sections that follow.",
      },
      {
        type: "image",
        src: "/reflect/cruise_control_reflect/system_block_diagram.png",
        alt: "Block diagram showing cruise control system architecture",
        description:
          "Simulink block diagram of the cruise control model. Force In enters a summing junction that subtracts three resistive forces — " +
          "hill gravity (sin of hill angle × mass), rolling friction (17.15 N constant), and air drag (velocity² × 0.0838 coefficient). " +
          "The net force passes through a 1/m inertia block to produce acceleration, then a 1/s integrator for velocity, this then feeds back into the drag calculation.",
      },

      // ── PI Controller ─────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nPI Controller" +
          "\nIn the block diagram above, Force In is the output of the PI controller: the driving force the algorithm commands each tick. " +
          "The formula below defines how that force is computed:",
      },
      {
        type: "image",
        src: "/reflect/cruise_control_reflect/pi_controller_formula.png",
        alt: "Handwritten PI controller formula: F_control = Kp × error + Ki × ∫error·dt",
        description:
          "The PI control formula: F_control equals Kp times the velocity error plus Ki times the integral of error over time. " +
          "The error term is simply V_setpoint subtracted by V_current: the difference between the target cruise speed and the car's actual velocity.",
      },
      {
        type: "text",
        value:
          "The controller runs at 10 Hz, which is the delay in the FreeRTOS task which motor data is recieved/sent, for this being 100ms aligning to 10 Hz (dt = 1/frequency). Each tick, Error() " +
          "computes V_setpoint − V_current as shown in the formula. PiControllerForce() then applies the two terms — Kp·error for the proportional response and Ki·∫error·dt for the integral accumulation:" +
          "\n\n    integral += error × dt" +
          "\n    F_pi = KP × error + KI × integral" +
          "\n\nThe gains are defined as:" +
          "\n\n    #define KP  0.5 × VEHICLE_MASS_KG    // 175 N per m/s of error" +
          "\n    #define KI  0.00009 × VEHICLE_MASS_KG  // 0.0315 N·s per m/s of error" +
          "\n\nScaling by the vehicle mass (350 kg) means the output is directly in Newtons. " +
          "Anti-windup prevents the integral from growing when the output is already saturated at the nominal force limit, " +
          "if the previous tick's force exceeded nominal, the integral accumulation pauses:" +
          "\n\n    bool saturated = isfinite(nominal_force)" +
          "\n                     && (prev_force_output >= nominal_force);" +
          "\n    if (!saturated) integral += error × dt;" +
          "\n\nTo validate this logic, I compiled cruise_control.c into a standalone simulation and ran it against the plant model. The dashboard below captures a live run with setpoint step changes:",
      },
      {
        type: "image",
        src: "/reflect/cruise_control_reflect/pi_response.png",
        alt: "Graph showing PI controller response — speed converging to setpoint over time",
        description:
          "Live simulation of the PI controller. The velocity trace ramps from about 14 m/s up to 15.5 m/s and then steps down to 13 m/s, " +
          "smoothly tracking each setpoint change. The PI error spikes briefly on each step and settles back to zero as the integral term catches up. " +
          "The DAC output shows the steady-state force the controller holds once drag and rolling resistance balance out.",
      },

      // ── Force Equations in Code ───────────────────────────────────
      {
        type: "text",
        value:
          "\nForce Equations in Code" +
          "\nThe simulation above shows the controller converging, but the accuracy of the response depends entirely on correctly modeling the resistive forces. " +
          "The handwritten equation below captures the core relationship: Newton's second law applied to the vehicle:",
      },
      {
        type: "image",
        src: "/reflect/cruise_control_reflect/force_equation.png",
        alt: "Handwritten force equation: ma = F_NET, m dv/dt = F_output − (F_drag + F_rolling + F_hill)",
        description:
          "Newton's second law for the car: ma = F_NET expands to m·dv/dt = F_output minus the sum of drag, rolling resistance, and hill gravity. " +
          "F_output is the controller's capped force from the PI law above, and the three resistive terms are the same forces shown in the Simulink block diagram.",
      },
      {
        type: "text",
        value:
          "\nEach of the three resistive terms in the equation above maps to a function in cruise_control.c:" +
          "\n\n• ForceDrag(): aerodynamic drag, quadratic in velocity:" +
          "\n    F_drag = 0.5 × ρ × Cd × A × v²" +
          "\n    return 0.5f × 1.267f × 0.1166f × 1.1853f × powf(v, 2);" +
          "\n\n• ForceRolling() — tyre rolling resistance, constant:" +
          "\n    F_roll = Crr × m × g" +
          "\n    return 0.0234f × 350.0f × 9.81f;    // ≈ 80.3 N" +
          "\n\n• ForceHill(): gravity component on a slope:" +
          "\n    F_hill = m × g × sin(θ)" +
          "\n    return 350.0f × 9.81f × sinf(radian);" +
          "\n    θ is the road pitch from the IMU Kalman filter. A 5° incline adds ~300 N." +
          "\n    The function rejects the reading and holds the previous value if θ is NaN, exceeds ±0.35 rad, or jumps >0.05 rad between ticks." +
          "\n\nNominalForce(): caps the controller at what the motor can physically deliver:" +
          "\n    N = (η × P) / v = (0.95 × 2000) / v" +
          "\n    At 10 m/s this is 190 N; at 20 m/s it drops to 95 N." +
          "\n\nForceOutput(): takes the minimum of the PI force and the nominal cap:" +
          "\n    force_output = MIN(pi_controller_force, nominal_force);" +
          "\n    If either value is not finite, the valid one is used. If both are invalid, the previous tick's output is held.",
      },

      // ── Net Force → Velocity ──────────────────────────────────────
      {
        type: "text",
        value:
          "\nNet Force to Velocity" +
          "\nVelocitySetMs() implements the m·dv/dt equation from the force diagram, tying everything together each 100 ms tick:" +
          "\n\n    F_net = ForceOutput(dt) − (ForceDrag() + ForceRolling() + ForceHill(θ))" +
          "\n    accel = Clamp(F_net / 350.0, −2.5, 2.0)    // m/s²" +
          "\n    velocity += accel × dt" +
          "\n    velocity = Clamp(velocity, 6.94, 22.22)     // 25–80 km/h" +
          "\n\nThe acceleration clamp at [−2.5, +2.0] m/s² prevents jerky motion. " +
          "The minimum speed of 6.94 m/s (25 km/h) keeps regenerative braking functional, " +
          "and the maximum of 22.22 m/s (80 km/h) is the car's design speed limit. " +
          "If F_net is not finite (e.g. division by zero in NominalForce at zero velocity), the previous velocity is held.",
      },

      // ── Wrap-up ───────────────────────────────────────────────────
      {
        type: "text",
        value:
          "The biggest takeaway from implementing this was that the force model matters as much as the controller gains. " +
          "A well-tuned PI loop still fails if the drag or hill term is wrong, then the car either overshoots on downhills or stalls on climbs. " +
          "Scaling KP and KI by the vehicle mass and capping at the nominal force kept the controller output physically meaningful, " +
          "and the isfinite() guards on every floating-point result ensured the system never produces an undefined acceleration on real hardware.",
      },
    ],
    category: "projects",
  },
  // {
  //   slug: "kalman-filters-embedded",
  //   date: "March 2026",
  //   title: "Understanding Kalman Filters and Embedded Applications",
  //   content: [
  //     {
  //       type: "text",
  //       value:
  //         ""
  //     }
  //   ],
  //   category: "projects",
  // },
  {
    slug: "learing-zephyr-at-internship",
    date: "Feb 2026",
    title: "Learning Zephyr for the first time for an Internship",
    content: [
      {
        type: "text",
        value:
          "Before working at Verdi, I only understood how to use STM32-based FreeRTOS oS threads to run concurrent tasks, and at " +
          "Verdi I was expected to have fluency in Zephyr to produce for the team. This task was difficult as I had no idea how to " +
          "use the syntax, build system and general flow of this new system. Although being very challenging, I put myself up to the " +
          "task as I wished to contribute to the company to the best of my ability as well as improve my learning on a new firmware system " +
          "I could use in the future. This resulted in inspiring me to build my own Zephyr project during late Decemeber before I started " +
          "my internship. I build a simple embedded network using Zephyr where I used a nRF Nordic Semiconductors board and sent BLE commands " +
          "through their mobile nRF app to control LEDS and GPIOs on the board. This built a small base for me before I started working for Verdi." +
          "While working at the company, I learned to pick up syntax and ask questions whenever I could. I also utilized my tools, using AI to learn " +
          "and give me examples of Zephyr programs. I always remembered to relate the new information I learned and compared it against things that " +
          "I knew before. After a month or so at the company, I became more confident in my abilites using Zephyr to create new threads, control GPIO outputs " +
          "and utilize all the peripherals on a given PCB exactly like I would using STM32-FreeRTOS based syntax. I still have a while to go and a project to " +
          "fully complete and will continue this blog thread in the next iteration!",
      },
    ],
    category: "work",
  },
  {
    slug: "cubemx-functionality",
    date: "December 2025",
    title: "Utilizing CubeMX and Initalizing Peripherals in a STM32 Project",
    content: [
      {
        type: "text",
        value:
          "On my student design team, UBC Solar, we utilize CubeMX to set the configurations of all the peripherals, such as UART, CAN, GPIOs, and etc. of the " +
          "PCBs we use. This post explains the usage of this application and how our team used it for our Driver Dashboard (DRD) PCB which I owned. CubeMX is " +
          "capable of autogenerating code based upon the inputs from the UI application. The screenshot below shows the CubeMX interface for our DRD board — " +
          "the left sidebar lists every peripheral category, the center panel holds the GPIO configuration table, and the right side displays the chip pinout with each pin labeled to its schematic net name.",
      },
      {
        type: "image",
        src: "/reflect/cubemx_reflect/ioc_layout.png",
        alt: "CubeMX IOC pinout layout for DRD PCB",
        description:
          "Three-panel CubeMX view, allows users to easily set configurations. Left sidebar lists peripheral categories (System Core, Analog, Timers, Connectivity, Multimedia, Computing, " +
          "Middleware). Center panel shows the GPIO configuration table with pins PA0, PA1, PA6, PA10, PA11, PB6, PB7 and their mode, pull, output level, " +
          "and user labels (DEBUG_LED, DISPLAY, DRIVE_STATE, HAZARD, ECOPOWER). Right side shows the STM32F103RCTx LQFP64 chip pinout diagram with " +
          "color-coded pins labeled to their schematic net names: CAN_TX/RX, UART4_TX/RX, SPI1_MOSI, ADC inputs, and all GPIO signals.",
      },

      // ── System Core ──────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nSystem Core" +
          "\nStarting with the first category in the left sidebar, System Core contains the core MCU peripherals that every STM32 project needs to configure.",
      },
      {
        type: "text",
        value:
          "• DMA: Direct Memory Access controller, used to transfer data between peripherals and memory without CPU intervention. " +
          "DMA was not used on the DRD as our data transfers were small enough to handle in interrupt/polling mode.",
      },
      {
        type: "text",
        value:
          "• GPIO (General-Purpose Input/Output): where most of the DRD's pin configuration lives, covering all buttons, LEDs, and control signals. " +
          "In CubeMX, each GPIO pin is configured with a set of properties that map directly to how the hardware behaves:" +
          "\n\n    ◦ GPIO Mode: determines what drives the pin. Output Push-Pull actively drives the pin high or low (used for LEDs like DEBUG_LED, or output signals like BRK_OUT). " +
          "Input mode means the MCU only reads the pin state (used for BRK_IN). External Interrupt mode triggers an ISR on a rising or falling edge — " +
          "exactly how DRIVE_STATE_NEXT and DRIVE_STATE_PREV are configured so switch presses generate interrupts instead of being polled." +
          "\n    ◦ GPIO Pull-Up / Pull-Down: when a pin is an input, it can float at an undefined voltage if nothing is driving it. " +
          "A pull-up resistor ties the pin to VDD through a weak internal resistor so it reads high by default and goes low when the button connects it to ground. " +
          "A pull-down does the opposite. On the DRD, DRIVE_STATE_NEXT and ECOPOWER use pull-down resistors, " +
          "while No Pull-Up/No Pull-Down is used on output pins like DEBUG_LED and HAZARD since the MCU is actively driving them." +
          "\n    ◦ GPIO Output Level: sets the initial state of an output pin at boot. \"Low\" means the pin starts at 0V, so LEDs and signals default to off until firmware explicitly turns them on." +
          "\n    ◦ Maximum Output Speed: controls the slew rate of the output driver. \"Low\" is sufficient for GPIO-toggled signals like LEDs and is preferred " +
          "because faster slew rates generate more electromagnetic noise. Higher speeds are only needed for peripherals that switch at MHz rates like SPI clocks." +
          "\n    ◦ User Label: CubeMX lets you assign a name to each pin (e.g. DEBUG_LED, HAZARD, ECOPOWER) that matches the schematic net. " +
          "These labels appear as #defines in the generated code, so firmware references DEBUG_LED_Pin instead of raw GPIO_PIN_0." +
          "\n\nThe GPIO configuration table in CubeMX shows all of these columns at a glance for every configured pin, making it easy to verify " +
          "that each pin's mode, pull resistor, output level, and label match the schematic before generating code.",
      },
      {
        type: "text",
        value:
          "• IWDG (Independent Watchdog timer): a hardware timer that resets the MCU if firmware hangs and fails to refresh it within the timeout window. " +
          "We did not enable IWDG on the DRD but it is commonly used in production safety-critical systems." +
          "\n• NVIC: Nested Vectored Interrupt Controller — manages all interrupt priorities and enable/disable states. " +
          "CubeMX auto-configures NVIC entries for every peripheral that uses interrupts (CAN, UART, TIM, etc.). " +
          "On the DRD this was critical for setting interrupt priorities so that CAN message reception would not be starved by lower-priority tasks." +
          "\n• RCC (Reset and Clock Control): configures the system clock tree, PLL settings, and peripheral clock enables. " +
          "CubeMX provides a visual clock tree editor where you set the HSE/HSI source, PLL multiplier, and bus prescalers. " +
          "Getting RCC right is essential since every peripheral's clock derives from this configuration." +
          "\n• SYS: System configuration for the debug interface and timebase source. On the DRD, Debug was set to Trace Asynchronous SW (SWD) for J-Link debugging, " +
          "and the Timebase Source was set to SysTick which FreeRTOS uses for its scheduler tick." +
          "\n• WWDG (Window Watchdog): similar to IWDG but with a configurable window where the refresh must happen within a specific time range (not too early, not too late). " +
          "WWDG was not utilized on the DRD.",
      },

      // ── Analog ────────────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nAnalog" +
          "\nADC1_IN8 and ADC2_IN9 are configured as analog input channels. On the DRD these were used for reading analog sensor values. " +
          "CubeMX configures the ADC resolution, sampling time, and conversion mode. We used single-conversion mode triggered from firmware " +
          "since the ADC reads were only needed at specific points in the control loop.",
      },

      // ── Timers ────────────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nTimers" +
          "\nThe STM32F103RCTx has a wide range of timer peripherals, each with different capabilities. " +
          "The timer we actually used on the DRD was TIM4 — configured for periodic interrupt generation to drive consistent timing " +
          "for display refresh rates and debouncing button inputs. CubeMX calculates the prescaler and auto-reload values based on " +
          "the system clock frequency, which made it straightforward to get the exact timing interval we needed.",
      },
      {
        type: "text",
        value:
          "The remaining timers on this MCU:" +
          "\n\n• RTC: Real-Time Clock, a low-power counter that keeps track of calendar time. Not used on the DRD since the board does not need wall-clock time." +
          "\n• TIM1: Advanced-control timer with complementary PWM outputs, useful for motor control. Not used on the DRD but configured by CubeMX with a warning since its pins overlap with other functions." +
          "\n• TIM2 / TIM3: General-purpose 16-bit timers with input capture, output compare, and PWM generation. Not directly used on the DRD; they show warnings in CubeMX because their default pin mappings conflict with other configured peripherals." +
          "\n• TIM5: Another general-purpose timer, similar to TIM2/TIM3. Not used on the DRD." +
          "\n• TIM6 / TIM7: Basic timers with no I/O pins, typically used as simple counters or to trigger the DAC. Not used on the DRD." +
          "\n• TIM8: A second advanced-control timer like TIM1, with complementary PWM outputs. Not used on the DRD." +
          "\n\nThe warning triangles in CubeMX indicate that a timer's pins or clock configuration may conflict with another peripheral. " +
          "You resolve these by checking the pin mapping and adjusting if needed.",
      },

      // ── Connectivity ──────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nConnectivity" +
          "\nThis category covers all the communication peripherals on the DRD.",
      },
      {
        type: "text",
        value:
          "CAN: CAN_TX and CAN_RX were mapped to their dedicated pins at the top of the chip. CubeMX lets you enable the CAN peripheral, " +
          "set the baud rate prescaler, and configure the bit timing segments (BS1/BS2). For the DRD this was critical since " +
          "the board communicates drive-state commands and receives motor controller and BMS status frames over CAN. Once configured, CubeMX autogenerates " +
          "the HAL_CAN_Init() call and the GPIO alternate-function mapping so you don't have to touch any register-level code for initialization.",
      },
      {
        type: "text",
        value:
          "UART: UART4_RX and UART4_TX were used for serial debug output and communication. In CubeMX you simply enable UART4, " +
          "set the baud rate (we used 115200), word length, stop bits, and parity. The tool then generates the UART handle struct and the MX_UART4_Init() " +
          "function. This saved a lot of time compared to manually writing the register configurations for the USART peripheral.",
      },
      {
        type: "text",
        value:
          "SPI (Display Interface): The DRD drives an SPI display, so we needed several pins configured together:" +
          "\n\n• DISPLAY_CS: chip select, active low" +
          "\n• DISPLAY_SCL: SPI clock line" +
          "\n• DISPLAY_A0: data/command select pin" +
          "\n• SPI1_MOSI: master-out data" +
          "\n• DISPLAY_RESET: hardware reset for the display controller" +
          "\n\nCubeMX configures SPI1 in transmit-only master mode since we only write to the display. The CS, A0, and RESET pins are set as regular " +
          "GPIO outputs since they are controlled manually in firmware rather than by the SPI hardware.",
      },

      // ── Multimedia & Computing ────────────────────────────────────
      {
        type: "text",
        value:
          "\nMultimedia & Computing" +
          "\nMultimedia contains peripherals for audio/video interfaces (I2S, SAI) — not used on the DRD since the board has no audio functionality. " +
          "Computing covers hardware accelerators like the CRC (Cyclic Redundancy Check) calculation unit, which can compute checksums faster than software. " +
          "We didn't enable hardware CRC on the DRD but it can be a useful peripheral for communication-heavy applications.",
      },

      // ── Middleware ─────────────────────────────────────────────────
      {
        type: "text",
        value:
          "\nMiddleware and Software Packs" +
          "\nThis is where CubeMX manages higher-level software libraries that run on top of the HAL drivers.",
      },
      {
        type: "text",
        value:
          "FreeRTOS — the middleware we used on the DRD. CubeMX integrates FreeRTOS directly, letting you configure the scheduler, " +
          "define tasks, set stack sizes, and allocate memory pools all from the UI. It then generates the osKernelStart() call, task creation functions, " +
          "and the FreeRTOSConfig.h with all your settings. This was the backbone of the DRD firmware since every feature (drive-state machine, CAN parsing, " +
          "display rendering) ran as its own FreeRTOS task.",
      },
      {
        type: "text",
        value:
          "Other available middleware (not used on the DRD):" +
          "\n\n• FATFS: FAT file system module for reading/writing SD cards or USB storage." +
          "\n• AIROC-Wi-Fi-Bluetooth: Wireless connectivity stacks for boards with Wi-Fi/BT modules." +
          "\n• I-CUBE packages (Cesium, FS-RTOS, ITTIADB, Mongoose, embOS, wolfMQTT, wolfSSH): Third-party packs providing TLS, MQTT, embedded databases, and alternative RTOS options." +
          "\n• FP-SNS packages (MOTENV1, MOTENVWB1, SMARTAG2, STAIOTCFT, STBOX1): ST function packs for sensor and IoT applications, bundling firmware examples for specific development kits.",
      },

      // ── Clock Configuration ───────────────────────────────────────
      {
        type: "text",
        value:
          "\nClock Configuration" +
          "\nBeyond the peripheral categories on the sidebar, CubeMX provides a dedicated Clock Configuration tab that visualizes the entire clock tree of the MCU. " +
          "This is one of the most important screens in the tool because every peripheral's operating frequency derives from this tree, and getting it wrong can cause " +
          "peripherals to run at incorrect baud rates or fail to initialize entirely.",
      },
      {
        type: "image",
        src: "/reflect/cubemx_reflect/clock_tree.png",
        alt: "CubeMX clock tree configuration for STM32F103RCTx",
        description:
          "CubeMX clock tree visualization. Left side shows four oscillator sources: LSE (32.768 KHz), LSI RC (40 KHz), HSI RC (8 MHz), and HSE (8 MHz). " +
          "Center: the PLL Source Mux selects HSE through a /1 prescaler into the PLL at ×9, and the System Clock Mux routes PLLCLK to SYSCLK at 72 MHz " +
          "with Enable CSS visible. Right side fans out to bus prescalers — AHB /1 → 72 MHz HCLK, APB1 /2 → 36 MHz PCLK1 (timers ×2 back to 72 MHz), " +
          "APB2 /1 → 72 MHz PCLK2, and ADC prescaler /6 → 12 MHz.",
      },
      {
        type: "text",
        value:
          "\nClock Sources & PLL" +
          "\n• HSE vs HSI: The STM32F103RCTx has two main oscillator inputs — the HSE (High-Speed External) is an 8 MHz crystal on the board, " +
          "and the HSI (High-Speed Internal) is an 8 MHz RC oscillator built into the chip. We chose the HSE because an external crystal " +
          "has significantly tighter frequency tolerance (typically ±20 ppm vs ±1% for HSI), which matters for CAN and UART " +
          "where baud rate accuracy directly affects whether communication works at all. A 1% drift on CAN at 500 kbps would cause bit stuffing errors " +
          "and dropped frames. The LSI (Low-Speed Internal) 40 KHz RC oscillator feeds the RTC and IWDG — its accuracy doesn't matter " +
          "since they only need approximate timing." +
          "\n• PLL: The HSE feeds into the PLL with a /1 prescaler and x9 multiplier, " +
          "producing 72 MHz (8 × 9 = 72) — the maximum system clock for the STM32F103. Running at max " +
          "gives us the most headroom for FreeRTOS context switching and CAN interrupt latency. A lower multiplier (say x6 for 48 MHz) " +
          "would tighten timing margins on the display refresh and button debounce interrupts." +
          "\n• System Clock Mux: PLLCLK is selected as the SYSCLK source (72 MHz). Running directly off HSE or HSI at 8 MHz " +
          "would be far too slow for our FreeRTOS tick rate and peripheral throughput requirements.",
      },
      {
        type: "text",
        value:
          "\nBus Prescalers" +
          "\n• AHB: /1 → HCLK = 72 MHz. Drives the AHB bus, Cortex core, memory, and DMA. No reason to divide this " +
          "down since the core handles 72 MHz fine, and a slower HCLK would bottleneck every instruction fetch and data access." +
          "\n• APB1: /2 → PCLK1 = 36 MHz. This is a hardware constraint — the APB1 bus maximum on the STM32F103 is 36 MHz. " +
          "APB1 peripherals like UART4, TIM2-TIM7, CAN, and SPI2 run at this clock. " +
          "However, the STM32 automatically doubles APB1 timer clocks back to 72 MHz when the prescaler is not /1, " +
          "so TIM4 actually clocks at 72 MHz — vital for finer timer resolution on display refresh and debounce intervals." +
          "\n• APB2: /1 → PCLK2 = 72 MHz. SPI1, TIM1, TIM8, and the ADCs run here. " +
          "We keep APB2 at full speed because SPI1 drives the display and needs the fastest possible clock to minimize screen update latency." +
          "\n• ADC: /6 → 12 MHz (72 / 6). The datasheet specifies a max ADC clock of 14 MHz, " +
          "so the options are /6 (12 MHz) or /8 (9 MHz). We chose /6 for faster conversion times while staying within spec — " +
          "at 12 MHz each 12-bit conversion takes about 1 µs, more than fast enough for our polling-based reads." +
          "\n• USB: /1 → 72 MHz. Although USB requires 48 MHz and is not used on the DRD, " +
          "CubeMX still shows this path. A design needing USB would adjust the PLL to produce a SYSCLK that divides cleanly to 48 MHz.",
      },
      {
        type: "text",
        value:
          "The Enable CSS (Clock Security System) option monitors the HSE and automatically switches to HSI if the external crystal fails, " +
          "preventing the MCU from locking up. On a safety-critical board like the DRD this is worth enabling " +
          "since a crystal failure during a race would otherwise leave the drive-state machine completely unresponsive.",
      },
      // {
      //   type: "text",
      //   value:
      //     "Project Manager\n" +
      //     "The Project Manager tab in CubeMX controls how the generated code is structured and built. This is where you configure the toolchain, " +
      //     "linker settings, and firmware package before generating code.",
      // },
      // {
      //   type: "image",
      //   src: "/reflect/cubemx_reflect/project_settings.png",
      //   alt: "CubeMX Project Manager settings for the DRD project",
      //   description:
      //     "The Project Manager for the DRD. The project is named \"drd\" and outputs to the firmware_v4 repository path. " +
      //     "CMake with GCC is selected as the build system, and the STM32Cube FW_F1 V1.8.6 firmware package provides the HAL drivers.",
      // },
      // {
      //   type: "text",
      //   value:
      //     "For the DRD, the Project Manager is configured with the following settings:\n" +
      //     "\n• Project Settings:" +
      //     "\n    ◦ Project Name: \"drd\" — this determines the name of the generated project folder and the .ioc file. We keep it short to avoid path length issues on Windows build machines." +
      //     "\n    ◦ Project Location: points directly into our firmware_v4 monorepo at /firmware/components/drd/cube/. This is intentional — rather than generating code in an isolated folder " +
      //     "and copying it in, we point CubeMX straight into the repo so that any peripheral change is immediately visible in git diff. This also means our CI pipeline picks up " +
      //     "CubeMX changes without any manual copy step." +
      //     "\n    ◦ Application Structure: set to \"Advanced\", which separates generated code into Drivers/, Middlewares/, and Core/ folders. We chose this over \"Basic\" " +
      //     "because it keeps the HAL driver sources isolated from our application code. When CubeMX regenerates, only the Core/Src/main.c and initialization files are touched — " +
      //     "it won't accidentally overwrite our custom source files in other directories." +
      //     "\n    ◦ Toolchain / IDE: CMake with GCC. We chose CMake over STM32CubeIDE's native Eclipse project format because our firmware_v4 monorepo has a top-level CMakeLists.txt " +
      //     "that compiles all components (DRD, telemetry, motor controller) together with shared libraries. Using CMake means the DRD build integrates seamlessly into " +
      //     "the monorepo without maintaining a separate IDE project. It also makes CI easier since cmake --build works headlessly on any platform." +
      //     "\n    ◦ Default Compiler/Linker: GCC (arm-none-eabi-gcc), the standard open-source cross-compiler for ARM Cortex-M targets. " +
      //     "We use GCC over alternatives like ARM Compiler (armcc) because it is free, well-supported by the CMake toolchain, and produces comparable code quality." +
      //     "\n• Linker Settings:" +
      //     "\n    ◦ Minimum Heap Size: 0x200 (512 bytes) — this is intentionally small. FreeRTOS manages its own memory pools (configTOTAL_HEAP_SIZE in FreeRTOSConfig.h) " +
      //     "rather than using the C library malloc/free, so the system heap only needs to serve any startup allocations before the scheduler runs. " +
      //     "512 bytes is sufficient for that. Keeping it small also avoids wasting SRAM on the STM32F103RCTx, which only has 48 KB total." +
      //     "\n    ◦ Minimum Stack Size: 0x400 (1024 bytes) — this is the MSP (main stack pointer) stack, used only during hardware initialization and ISRs before FreeRTOS starts. " +
      //     "Once the scheduler launches, each task runs on its own stack (typically 256-512 words per task). 1024 bytes for MSP is conservative enough to handle " +
      //     "nested HAL init calls and any early-boot fault handlers without overflowing." +
      //     "\n• Thread-safe Settings:" +
      //     "\n    ◦ Cortex-M3NS (non-secure) — the core architecture for the STM32F103. \"NS\" designates non-secure since this chip does not have TrustZone." +
      //     "\n    ◦ Enable multi-threaded support is unchecked — this controls whether the C library (newlib) uses mutexes around functions like malloc and printf. " +
      //     "Since FreeRTOS handles all concurrency and we avoid calling C library heap functions from multiple tasks, enabling this would just add unnecessary overhead." +
      //     "\n    ◦ Thread-safe Locking Strategy: default mapping based on RTOS selection. CubeMX auto-selects the correct locking wrappers when FreeRTOS is enabled." +
      //     "\n• MCU and Firmware Package:" +
      //     "\n    ◦ MCU Reference: STM32F103RCTx — this confirms the exact chip variant (103 = performance line, R = 256 KB flash, C = 48 KB SRAM, T = LQFP package, x = temp range)." +
      //     "\n    ◦ Firmware Package: STM32Cube FW_F1 V1.8.6 — the HAL driver and middleware package for the STM32F1 family. " +
      //     "This specific version was chosen because it is the latest stable release for the F1 line and includes all bug fixes for CAN and UART HAL drivers. " +
      //     "It provides every HAL_xxx function (HAL_GPIO_Init, HAL_CAN_Init, etc.) plus the FreeRTOS CMSIS-OS wrapper that the generated code calls.",
      // },
      {
        type: "text",
        value:
          "After configuring all of these peripherals, CubeMX generates the full initialization code into MX_GPIO_Init(), MX_CAN_Init(), " +
          "MX_UART4_Init(), MX_SPI1_Init(), MX_ADC1_Init(), MX_ADC2_Init(), and MX_TIM4_Init() inside main.c. It also produces the " +
          "correct clock tree configuration to ensure all peripheral clocks are enabled at the right frequencies. From there, all the actual " +
          "application logic, the drive-state machine, CAN message parsing, display rendering, is written by hand inside the USER CODE blocks " +
          "that CubeMX preserves between regenerations. This workflow made it much easier to iterate on the hardware configuration without " +
          "losing any of the firmware I already wrote.",
      },
    ],
    category: "projects",
  },
  {
    slug: "cellular-python-script",
    date: "November 2025",
    title: "Writing a Python Script on a RPI to Transmit Data over Cellular Comms",
    content: [
      {
        type: "text",
        value:
          "At UBC Solar, our solar car generates a constant stream of CAN bus telemetry, battery voltages, motor temperatures, drive-state commands, that the " +
          "strategy team needs in real time to make race decisions. I wrote a Python script that runs on a Raspberry Pi inside the chase vehicle, reads raw CAN " +
          "frames from a USB-CAN adapter over a cellular connection, decodes them using a DBC file, and streams them into InfluxDB so the team can monitor " +
          "everything live on Grafana dashboards. The diagram below traces this pipeline end to end.",
      },
      {
        type: "image",
        src: "/reflect/cellular_reflect/system_overview.png",
        alt: "System architecture diagram showing CAN bus to RPI to InfluxDB pipeline",
        description:
          "System architecture diagram showing the end-to-end data path: CAN bus frames from the solar car enter a USB-CAN adapter, " +
          "which connects to the Raspberry Pi over serial. The Pi runs the Python decode script and writes batched points to InfluxDB " +
          "through a Tailscale VPN tunnel over a cellular uplink.",
      },

      // ── Serial & Frame Extraction ────────────────────────────────
      {
        type: "text",
        value:
          "\nSerial Input & Frame Extraction" +
          "\nThe script opens /dev/ttyUSB0 at 230400 baud and reads raw bytes in 16 KB chunks. The USB-CAN adapter sends hex-encoded data " +
          "terminated by \\r\\n (0x0D0A). Each complete CAN record is 21 bytes, the script splits the hex stream on the 0d0a delimiter, " +
          "validates that each 42-character hex segment contains only valid hex digits, and converts it into a raw 21-byte frame. " +
          "A rolling buffer carries any incomplete tail from one chunk into the next read, so no data is lost across serial read boundaries.",
      },

      // ── Frame Layout & Decode ─────────────────────────────────────
      {
        type: "text",
        value:
          "\nFrame Layout & DBC Decode" +
          "\nEach 21-byte frame is split into three fields: an 8-byte timestamp, a 4-byte CAN ID, and an 8-byte payload. " +
          "The script supports two frame layouts, one with a 1-byte filler between the timestamp and ID (with_filler) and one without (no_filler). " +
          "It tries the filler layout first and falls back to no-filler on decode failure, making it resilient to firmware-side format changes." +
          "\n\nThe CAN ID is looked up against a DBC file (brightside.dbc) loaded with the cantools library. The DBC defines every message on UBC Solar's CAN bus, " +
          "message names, signal bit positions, scaling factors, and sender nodes. When a frame's ID matches a DBC entry, cantools decodes the 8-byte payload " +
          "into named signals with real-world values (e.g. battery_voltage_V, motor_temp_C). A message cache dictionary avoids repeated DBC lookups for the same ID." +
          "In the 21-byte frame structure, the timestamp is parsed as a big-endian double (or uint64 seconds/milliseconds as fallback), " +
          "the CAN ID is extracted as a big-endian 4-byte integer, and the payload is decoded using cantools against the DBC file.",
      },

      // ── Timestamp Parsing ─────────────────────────────────────────
      {
        type: "text",
        value:
          "\nTimestamp Parsing" +
          "\nThe 8-byte timestamp field can arrive in different formats depending on the CAN adapter firmware version. The parser tries " +
          "multiple interpretations in order: big-endian double (>d), unsigned 64-bit integer as seconds (>Q), and unsigned 64-bit integer " +
          "as milliseconds (>Q ÷ 1000). This defensive approach means the script works across adapter firmware revisions without any code changes. " +
          "A configuration flag USE_NOW_TIME lets the team switch between using the embedded CAN timestamp and the Pi's system clock, " +
          "we typically use system time (True) during races since the Pi's clock is NTP-synced over cellular.",
      },

      // ── InfluxDB Write Pipeline ───────────────────────────────────
      {
        type: "text",
        value:
          "\nInfluxDB Write Pipeline" +
          "\nDecoded signals are converted into InfluxDB Point objects. Each point uses the DBC sender name as the measurement " +
          "(e.g. ECU, BMS, MotorController), tags the message class name, and stores every numeric signal as a float field. " +
          "Boolean signals are cast to 0.0 or 1.0, and non-numeric values are skipped." +
          "\n\nThe InfluxDB v2 Python client writes in batches, 1000 points per batch with a 500 ms flush interval. " +
          "If the cellular link drops or InfluxDB is temporarily unreachable, the client retries with exponential backoff " +
          "(5s base, up to 30s max, 5 retries). This buffering strategy is critical for cellular reliability, " +
          "the link can have intermittent drops during a race without losing telemetry data. " +
          "Once data lands in InfluxDB, the strategy team views it through Grafana dashboards like the one captured below:",
      },
      {
        type: "image",
        src: "/reflect/cellular_reflect/grafana.png",
        alt: "Grafana dashboard showing live telemetry data from InfluxDB",
        description:
          "Photo of the Grafana 'Pit Crew — Brightside' dashboard on a laptop during testing. Top row shows live status panels: TEL Heartbeat at 3006, " +
          "TEL Watchdog, IMU Read, and GPS Read all reading GOOD, with GPS Satellite Count showing NO SATS. Below is an LV Current and Pack Current " +
          "time-series graph (ECU Pack Current and ECU LV Current) plotted over several minutes, with the MPPT section partially visible at the bottom.",
      },

      // ── Networking & Deployment ───────────────────────────────────
      {
        type: "text",
        value:
          "\nNetworking & Deployment" +
          "\nThe dashboard above works from anywhere because of the networking layer underneath. The Raspberry Pi connects to our InfluxDB server over Tailscale, a WireGuard-based mesh VPN. This means the Pi " +
          "and the server see each other on a private network regardless of what cellular carrier or NAT the Pi is behind. " +
          "The script reads all InfluxDB connection details (URL, org, bucket, token) from a .env file, making it easy to swap " +
          "between test and race configurations without touching code." +
          "\n\nFor deployment, the script runs as a systemd service that starts automatically on boot once three dependencies are satisfied: " +
          "the network is online, Tailscale is connected, and InfluxDB is reachable. This ensures the Pi begins logging CAN data " +
          "as soon as it has connectivity, with no manual intervention needed on race day. The service can be managed with standard " +
          "systemctl commands (start, stop, enable, disable), and logs stream to the systemd journal for debugging.",
      },

      // ── Stats & Error Tracking ────────────────────────────────────
      {
        type: "text",
        value:
          "\nStatistics & Error Tracking" +
          "\nThe script maintains a set of counters that are logged every second: frames_seen (total 21-byte frames from serial), " +
          "decoded (successfully matched to DBC), written (points sent to InfluxDB), decode_errors (frames that failed parsing), " +
          "write_errors (failed InfluxDB writes), and unknown_ids (CAN IDs not in the DBC). It also computes an avg_decoded/s ingest rate. " +
          "These stats made it easy to diagnose issues during testing, for example, a spike in unknown_ids told us the DBC file was outdated " +
          "and missing new messages added by the electrical team." +
          "\n\nOn shutdown (SIGINT or SIGTERM), the script flushes any remaining buffered points to InfluxDB, logs final statistics, " +
          "and cleanly closes the serial port, write API, and client connections. This ensures no data is silently dropped when the service is stopped.",
      },

      // ── Summary ───────────────────────────────────────────────────
      {
        type: "text",
        value:
          "This script became one of the core pieces of UBC Solar's telemetry infrastructure. It replaced an earlier approach that required " +
          "manual log downloads after each race day, giving the strategy team real-time visibility into the car's state for the first time. " +
          "Building it taught me a lot about serial protocol parsing, defensive programming for unreliable networks, and designing systems " +
          "that need to run unattended in the field.",
      },
    ],
    category: "projects",
  },
  // {
  //   slug: "gps-code-and-parse",
  //   date: "February 2025",
  //   title: "Parsing NMEA Sentences for Location Values on a GPS Module",
  //   content: [
  //     {
  //       type: "text",
  //       value:
  //         ""
  //     }
  //   ],
  //   category: "projects",
  // },
];

const PREVIEW_CHARS = 800;

function resolveImgSrc(src: string) {
  return src.startsWith("/") ? import.meta.env.BASE_URL + src.slice(1) : src;
}

/** Render text with bold section headings (sidebar categories) */
function renderText(text: string): ReactNode[] {
  const lines = text.split("\n");
  let foundHeading = false;
  let foundNonEmpty = false;
  return lines.map((line, i) => {
    const trimmed = line.trimStart();
    const isNonEmpty = trimmed.length > 0;
    // Bold the first non-empty line if it looks like a section heading
    if (
      isNonEmpty &&
      !foundNonEmpty &&
      !foundHeading &&
      trimmed.length <= 60 &&
      !trimmed.includes(".") &&
      !trimmed.startsWith("•") &&
      !trimmed.startsWith("◦") &&
      !trimmed.startsWith("The ") &&
      !trimmed.startsWith("After ") &&
      !trimmed.startsWith("Other ") &&
      !trimmed.startsWith("CubeMX ")
    ) {
      foundHeading = true;
      foundNonEmpty = true;
      return (
        <span key={i}>
          {i > 0 && "\n"}<strong>{trimmed}</strong>
        </span>
      );
    }
    if (isNonEmpty) foundNonEmpty = true;
    return (
      <span key={i}>
        {i > 0 && "\n"}{line}
      </span>
    );
  });
}

export default function Reflect() {
  const [active, setActive] = useState<Category>("all");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [lightbox, setLightbox] = useState<string | null>(null);
  const filtered =
    active === "all" ? posts : posts.filter((p) => p.category === active);

  const toggle = (slug: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });

  return (
    <main className={`main-content ${styles.page}`}>
      <Link to="/" className={styles.back}>
        ← Back
      </Link>

      <header className={styles.header}>
        <p className={styles.eyebrow}>Blog Posts</p>
        <h1 className={styles.title}>Writing</h1>
        <p className={styles.subtitle}>
          Notes on engineering, learning, and aspirations!
        </p>
      </header>

      <div className={styles.tabs}>
        {TABS.map((tab) => (
          <button
            key={tab.value}
            className={`${styles.tab} ${active === tab.value ? styles.tabActive : ""}`}
            onClick={() => setActive(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className={styles.feed}>
        {filtered.length === 0 ? (
          <p className={styles.empty}>No posts in this category yet.</p>
        ) : (
          filtered.map((post) => {
            const isExpanded = expanded.has(post.slug);

            // Build a flat text string to decide preview truncation
            const fullText = post.content
              .filter((b): b is ContentBlock & { type: "text" } => b.type === "text")
              .map((b) => b.value)
              .join(" ");
            const needsTruncation = fullText.length > PREVIEW_CHARS;

            // In collapsed mode, show blocks until text budget is exhausted
            let charsLeft = PREVIEW_CHARS;
            const visibleBlocks: ContentBlock[] = [];
            if (!isExpanded && needsTruncation) {
              for (const block of post.content) {
                if (block.type === "image") {
                  visibleBlocks.push(block);
                } else {
                  if (charsLeft <= 0) break;
                  if (block.value.length <= charsLeft) {
                    visibleBlocks.push(block);
                    charsLeft -= block.value.length;
                  } else {
                    visibleBlocks.push({
                      type: "text",
                      value: block.value.slice(0, charsLeft).trimEnd() + "...",
                    });
                    charsLeft = 0;
                  }
                }
              }
            }

            const blocks = isExpanded || !needsTruncation ? post.content : visibleBlocks;

            return (
              <article key={post.slug} className={styles.card}>
                <div className={styles.cardMeta}>
                  <span className={styles.date}>{post.date}</span>
                  <span className={styles.categoryBadge}>{post.category}</span>
                </div>
                <h2 className={styles.postTitle}>{post.title}</h2>

                <div className={styles.blockFlow}>
                  {blocks.map((block, i) =>
                    block.type === "text" ? (
                      <p key={i} className={styles.excerpt}>
                        {renderText(block.value)}
                      </p>
                    ) : block.description ? (
                      <div key={i} className={styles.imgWithDesc}>
                        <div
                          className={styles.inlineImgWrap}
                          onClick={() => setLightbox(resolveImgSrc(block.src))}
                        >
                          <img
                            src={resolveImgSrc(block.src)}
                            alt={block.alt ?? ""}
                            className={styles.inlineImg}
                            loading="lazy"
                            decoding="async"
                          />
                        </div>
                        <p className={styles.imgDesc}>{block.description}</p>
                      </div>
                    ) : (
                      <div
                        key={i}
                        className={styles.inlineImgWrap}
                        onClick={() => setLightbox(resolveImgSrc(block.src))}
                      >
                        <img
                          src={resolveImgSrc(block.src)}
                          alt={block.alt ?? ""}
                          className={styles.inlineImg}
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    ),
                  )}
                </div>

                {needsTruncation && (
                  <button
                    className={styles.readMore}
                    onClick={() => toggle(post.slug)}
                  >
                    {isExpanded ? "Show less ↑" : "Read more ↓"}
                  </button>
                )}
              </article>
            );
          })
        )}
      </div>
      {lightbox && (
        <div className={styles.lightbox} onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" className={styles.lightboxImg} />
        </div>
      )}
    </main>
  );
}
