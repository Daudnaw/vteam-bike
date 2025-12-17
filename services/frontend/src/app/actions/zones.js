'use server';

const zones = {
    zones: [
        {
            _id: "zone001",
            name: "zone001",
            type: "polygon",
            area: [
                [59.3329, 18.0649],
                [59.3335, 18.0672],
                [59.3324, 18.0680],
                [59.3318, 18.0660],
            ],
            active: true,
            zoneType: "parking",
        },
        {
            _id: "zone002",
            name: "zone002",
            type: "circle",
            center: [59.3294, 18.0687],
            radius: 180,
            active: true,
            zoneType: "speed_limit",
            maxSpeed: 30,
        },
        {
            _id: "zone003",
            name: "zone003",
            type: "polygon",
            area: [
                [59.3205, 18.0873],
                [59.3211, 18.0890],
                [59.3200, 18.0905],
                [59.3189, 18.0885],
            ],
            active: true,
            zoneType: "no_go",
        },
        {
            _id: "zone004",
            name: "zone004",
            type: "circle",
            center: [59.2925, 18.0830],
            radius: 250,
            active: false,
            zoneType: "custom",
        },
        {
            _id: "zone005",
            name: "zone005",
            type: "polygon",
            area: [
                [59.3242, 18.0715],
                [59.3248, 18.0733],
                [59.3236, 18.0742],
                [59.3229, 18.0723],
            ],
            active: true,
            zoneType: "speed_limit",
            maxSpeed: 20,
        },
        {
            _id: "zone006",
            name: "zone006",
            type: "circle",
            center: [59.3384, 18.0581],
            radius: 140,
            active: true,
            zoneType: "custom",
        },
        {
            _id: "zone007",
            name: "zone007",
            type: "polygon",
            area: [
                [59.3471, 18.0728],
                [59.3479, 18.0745],
                [59.3468, 18.0756],
                [59.3460, 18.0737],
            ],
            active: true,
            zoneType: "custom",
        },
        {
            _id: "zone008",
            name: "zone008",
            type: "circle",
            center: [59.3152, 18.0824],
            radius: 300,
            active: true,
            zoneType: "no_go",
        },
    ],
};

export async function getZones() {
    return zones;
}
