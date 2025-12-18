import { type INotifierConfig, NotifierBase } from "@notifier/server/notifier/base";
import type { INotifierPayload } from "@notifier/server/notifier/types";
import type { DestinationConfigItem, ServerContext } from "@notifier/server/types";

export type MisskeyNotificationServiceConfig = INotifierConfig & DestinationConfigItem<"misskey">;

export type MisskeyNotificationPayload = INotifierPayload;

export class MisskeyNotificationService extends NotifierBase<MisskeyNotificationPayload, MisskeyNotificationServiceConfig> {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(ctx: ServerContext, config: MisskeyNotificationServiceConfig) {
    super(ctx, config);
  }

  override async send(payload: MisskeyNotificationPayload): Promise<void> {
    const { token, defaultPostVisibility, url: _url } = this.config.config;
    const url = _url.endsWith("/") ? _url : `${_url}/`;

    if (this.config.options.debug.printPayload) {
      this.ctx.var.logger.info("payload: ", JSON.stringify(payload));
    }

    try {
      const res = await fetch(`${url}api/notes/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "yamisskey-github-notifier/1.0",
        },
        body: JSON.stringify({
          i: token,
          text: payload.content,
          visibility: defaultPostVisibility,
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        this.ctx.var.logger.error(`Misskey API error: ${res.status} ${res.statusText} - ${body}`);
      }
    } catch (error) {
      this.ctx.var.logger.error(`Error sending notification: ${String(error)}`);
    }
  }
}
