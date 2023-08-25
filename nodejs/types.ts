export type PluginProps = {
    port: number;
    filetype_domains: { [filetype: string]: string[] };
};

export type NeovimNotificationArgs = {
    id: number;
    match: string;
    buf: number;
    file: string;
    event: string;
};

export type GhostClientMessage = {
    title: string;
    url: string;
    syntax: string;
    text: string;
    selections: Array<{ start: number; end: number }>;
};

export type WsMessage = {
    text: string;
};
