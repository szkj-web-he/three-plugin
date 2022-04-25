export interface GeoVertex {
    x: number,
    y: number,
    z: number,
}

export interface TextureMapping {
    u: number,
    v?: number,
}

export interface Normal {
    x: number,
    y: number,
    z: number
}

export interface Line {
    raw_string: string,
    command: string,
    args: string[],
    line_number: number
}
