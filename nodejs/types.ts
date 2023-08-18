export type EventArgs = {
    id: number;
    match: string;
    buf: number;
    file: string;
    event: string;
};

export type GhostMessage = {
    title: string;
    url: string;
    syntax: string;
    text: string;
    selections: Array<{ start: number; end: number }>;
};
