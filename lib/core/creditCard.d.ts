export interface CardCustomisation {
    id: string;
    name: string;
    background: string;
}
export interface CardBackground {
    id: string;
    background: string;
}
export interface CardCollection {
    id: string;
    backgrounds: Array<CardBackground>;
}
