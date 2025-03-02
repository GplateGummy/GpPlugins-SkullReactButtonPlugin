import definePlugin from "@utils/types";
import { RestAPI, Constants, FluxDispatcher } from "@webpack/common";
import { Logger } from "@utils/Logger";
const logger = new Logger("SkullReact");

const SkullIcon = () => {
    return <svg width="800px" height="800px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" className="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><path fill="#CCD6DD" d="M34 16C34 6 26.837 0 18 0C9.164 0 2 6 2 16c0 5.574.002 10.388 6 12.64V33a3 3 0 1 0 6 0v-3.155c.324.027.659.05 1 .07V33a3 3 0 1 0 6 0v-3.085c.342-.021.676-.043 1-.07V33a3 3 0 0 0 6 0v-4.36c5.998-2.252 6-7.066 6-12.64z"></path><circle fill="#292F33" cx="11" cy="14" r="5"></circle><circle fill="#292F33" cx="25" cy="14" r="5"></circle><path fill="#292F33" d="M19.903 23.062C19.651 22.449 18.9 22 18 22s-1.652.449-1.903 1.062A1.494 1.494 0 0 0 15 24.5a1.5 1.5 0 0 0 1.5 1.5c.655 0 1.206-.422 1.41-1.007c.03.001.059.007.09.007s.06-.006.09-.007a1.496 1.496 0 1 0 1.813-1.931z"></path></svg>
};

export default definePlugin({
    name: "SkullReact",
    description: "Adds a button to the message hover menu to quickly toggle the 💀 reaction",
    authors: [{name: "GplateGam", id: 1278091053836009522n}],

    async start() {
        logger.info("Plugin started");
    },
    stop() {
        logger.info("Plugin stopped");
    },
    
    hasUserReactedWithSkull(message) {
        if (!message.reactions) return false;
        
        const skullReaction = message.reactions.find(reaction => reaction.emoji.name === "💀");
        return skullReaction && skullReaction.me;
    },
    
    async toggleSkullReactionViaAPI(message) {
        try {
            const hasReacted = this.hasUserReactedWithSkull(message);
            logger.info(`${hasReacted ? "Removing" : "Adding"} reaction via API for message ${message.id}`);
            
            const endpoint = `/channels/${message.channel_id}/messages/${message.id}/reactions/${encodeURIComponent("💀")}/%40me`;
            logger.info(`Using endpoint: ${endpoint}`);
            
            if (hasReacted) {
                await RestAPI.del({
                    url: endpoint
                });

                logger.info("API request successful, dispatching UI update for removal");
            } else {
                await RestAPI.put({
                    url: endpoint + "?location=Message%20Reaction%20Picker&type=0",
                    oldFormErrors: true
                });

                logger.info("API request successful, dispatching UI update for addition");
            }
            
            logger.info("Successfully dispatched reaction event");
        } catch (error) {
            logger.error(`Failed to ${this.hasUserReactedWithSkull(message) ? "remove" : "add"} skull reaction via API:`, error);
        }
    },
    
    renderMessagePopoverButton(message) {
        const hasReacted = this.hasUserReactedWithSkull(message);
        
        return {
            label: hasReacted ? "Remove 💀 reaction" : "React with 💀",
            icon: SkullIcon,
            message: message,
            onClick: () => {
                logger.info(`Button clicked for message ${message?.id}`);
                this.toggleSkullReactionViaAPI(message);
            }
        };
    }
});
