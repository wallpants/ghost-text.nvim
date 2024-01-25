import { type BaseEvents } from "bunvim";
import { array, boolean, number, object, record, string, type Output } from "valibot";

export const PluginPropsSchema = object({
    config: object({
        port: number(),
        autostart: boolean(),
        filetype_domains: record(array(string())),
    }),
});
export type PluginProps = Output<typeof PluginPropsSchema>;
export type Config = PluginProps["config"];

export const ContentChangeSchema = object({
    abs_path: string(),
    lines: array(string()),
});
export type ContentChange = Output<typeof ContentChangeSchema>;

export type WsServerMessage = {
    text: string;
};

export type WsBrowserMessage = {
    title: string;
    url: string;
    syntax: string;
    text: string;
    selections: { start: number; end: number }[];
};

// eslint-disable-next-line
export interface CustomEvents extends BaseEvents {
    requests: {
        before_exit: [];
    };
    notifications: {
        buffer_delete: [];

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
