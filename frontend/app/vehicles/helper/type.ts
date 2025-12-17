export type vehicle_type = {
    cars: number,
    bikes: number,
    motorbikes: number,
}


export type request_type = {
    number: string,
    apt_id: string,
    owner: string,
    created_at: string,
    color: string,
    type: string
}

export type filterType = {
    number?: string,
    apt_id?: string,
    owner?: string,
    color?: string,
    type?: string
}