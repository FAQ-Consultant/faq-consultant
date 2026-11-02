
export const products = [
  {
    id: "MP-KB16",
    name: "Máy khoan bàn MP-KB16",
    category: "Máy khoan",
    description: "Khoan kim loại, gia công cơ khí nhỏ và vừa.",

    price: 8500000,
    currency: "VND",

    inventory: {
      quantity: 12,
      status: "in_stock"
    },

    specifications: {
      power: "750 W",
      voltage: "220 V",
      speed: "280–2800 vòng/phút",
      maxDrillingDiameter: "16 mm",
      weight: "85 kg"
    },

    warrantyMonths: 12,

    image: null,

    tags: [
      "máy khoan bàn",
      "khoan kim loại",
      "gia công cơ khí"
    ]
  },

  {
    id: "MP-TC400",
    name: "Máy tiện cơ khí MP-TC400",
    category: "Máy tiện",
    description: "Tiện trụ, tiện mặt đầu và gia công chi tiết kim loại.",

    price: 68000000,
    currency: "VND",

    inventory: {
      quantity: 5,
      status: "limited"
    },

    specifications: {
      power: "2200 W",
      voltage: "380 V",
      speed: "50–2000 vòng/phút",
      maxTurningDiameter: "400 mm",
      weight: "1200 kg"
    },

    warrantyMonths: 12,

    image: null,

    tags: [
      "máy tiện",
      "tiện trụ",
      "tiện mặt đầu"
    ]
  },

  {
    id: "MP-CNC650",
    name: "Máy phay CNC MP-CNC650",
    category: "Máy phay CNC",
    description: "Phay CNC, gia công chi tiết cơ khí chính xác.",

    price: 485000000,
    currency: "VND",

    inventory: {
      quantity: 2,
      status: "limited"
    },

    specifications: {
      power: "7500 W",
      voltage: "380 V",
      spindleSpeed: "8000 vòng/phút",
      travelXYZ: "650/400/450 mm",
      weight: "4500 kg"
    },

    warrantyMonths: 24,

    image: null,

    tags: [
      "máy CNC",
      "máy phay CNC",
      "gia công chính xác"
    ]
  },

  {
    id: "MP-KN15",
    name: "Máy nén khí công nghiệp MP-KN15",
    category: "Máy nén khí",
    description: "Cung cấp khí nén cho thiết bị và dây chuyền sản xuất.",

    price: 32000000,
    currency: "VND",

    inventory: {
      quantity: 8,
      status: "in_stock"
    },

    specifications: {
      power: "11000 W",
      voltage: "380 V",
      speed: "1450 vòng/phút",
      workingPressure: "8 bar",
      airflow: "1.5 m³/phút",
      weight: "420 kg"
    },

    warrantyMonths: 12,

    tags: [
      "máy nén khí",
      "khí nén công nghiệp",
      "dây chuyền sản xuất"
    ]
  }
];
