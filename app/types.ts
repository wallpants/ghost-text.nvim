import { type BaseEvents, type EventsMap } from "bunvim";

export type WebsocketData = {
    buffer: number | null;
    lines: string[];
};

// eslint-disable-next-line
export interface CustomEvents extends BaseEvents {
    requests: EventsMap;
    notifications: {
        BufDelete: [buffer: number];
        AttachBuffer: [lines: string[]];

        // neovim native
        nvim_buf_detach_event: [buffer: number];
        nvim_buf_lines_event: [
            buffer: number,
            changedtick: number,
            firstline: number,
            lastline: number,
            linedata: string[],
            more: boolean,
        ];
        nvim_buf_changedtick_event: [buffer: number, changedtick: number];
    };
}

export type PluginInit = {
    port: number;
    filetype_domains: Record<string, string[]>;
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
    selections: { start: number; end: number }[];
};

export type WsMessage = {
    text: string;
};
