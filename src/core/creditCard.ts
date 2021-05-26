export interface CardCustomisation {
    id: string;
    name: string;
    background: string;
}

export interface CardView {
    id: string;
    background: string;
}

export interface CardCollection {
    id: string;
    defaultName: string;
    cardViews: Array<CardView>;
}
