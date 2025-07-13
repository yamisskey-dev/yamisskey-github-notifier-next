import { type INotifierConfig, NotifierBase } from "@notifier/server/notifier/base";
import type { INotifierPayload } from "@notifier/server/notifier/types";
import type { DestinationConfigItem, ServerContext } from "@notifier/server/types";

export type DiscordNotificationServiceConfig = INotifierConfig & DestinationConfigItem<"discord">;

export type DiscordNotificationPayload = INotifierPayload;

export class DiscordNotificationService extends NotifierBase<DiscordNotificationPayload, DiscordNotificationServiceConfig> {
  // biome-ignore lint/complexity/noUselessConstructor: <explanation>
  constructor(ctx: ServerContext, config: DiscordNotificationServiceConfig) {
    super(ctx, config);
  }

  override async send(payload: DiscordNotificationPayload): Promise<void> {
    const { webhookUrl, username, avatarUrl } = this.config.config;

    if (this.config.options.debug.printPayload) {
      this.ctx.var.logger.info("payload: ", JSON.stringify(payload));
    }

    const discordPayload: {
      content: string;
      username?: string;
      avatar_url?: string;
    } = {
      content: payload.content,
    };

    if (username) {
      discordPayload.username = username;
    }

    if (avatarUrl) {
      discordPayload.avatar_url = avatarUrl;
    }

    return fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(discordPayload),
    })
      .then((res) => {
        if (!res.ok) {
          this.ctx.var.logger.error(`Discord webhook error: ${res.statusText}`, "error");
        }
      })
      .catch((error) => {
        this.ctx.var.logger.error(`Error sending Discord notification: ${String(error)}`, "error");
      });
  }
}
