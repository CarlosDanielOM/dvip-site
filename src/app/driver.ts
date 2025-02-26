export interface Driver {
    first_name: string;
    last_name: string;
    pin: string;
    active: boolean;
    daily_limit: number;
    total_limit: number;
    daily_used?: number;
    total_used?: number;
    created_by: string;
    created_at?: string;
}
