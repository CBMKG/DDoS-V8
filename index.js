#!/usr/bin/env node

// Load environment variables
require("dotenv").config();

const chalk = require("chalk");
const readlineSync = require("readline-sync");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
} = require("discord.js");
const { joinVoiceChannel, getVoiceConnection } = require("@discordjs/voice");
const MenuHandler = require("./menu");

// Auto-fallback: Use .env values if available, otherwise use defaults
const DEV_USERNAME = process.env.DEV_USERNAME || "APIS";
const DEV_PASSWORD = process.env.DEV_PASSWORD || "AFISGEMER";
const BYPASS_CODE = process.env.BYPASS_CODE || "ULMIMEED";

// Display configuration source
if (
    process.env.DEV_USERNAME &&
    process.env.DEV_PASSWORD &&
    process.env.BYPASS_CODE
) {
    console.log(chalk.green("✅ Loaded configuration from .env file"));
} else {
    console.log(
        chalk.yellow("🔧 Using default configuration (no .env file detected)"),
    );
}

class ProfessionalTermuxTool {
    constructor() {
        this.userTier = "public"; // public, premium, developer
        this.isDeveloperMode = false;
        this.isPremiumActive = false;
        this.activeBots = 0;
        this.attackInProgress = false;
        this.discordWebhook = "";
        this.developerName = "APIS Developer";
        this.developerStrikes = 0;
        this.maxStrikes = 3;
        this.premiumCodes = this.loadPremiumCodes();
        this.publicUsersActive = Math.floor(Math.random() * 50) + 25;

        // Server configurations
        this.serverInfo = {
            minecraft: {
                status: "Online",
                players: "87/150",
                uptime: "5d 12h 43m",
                ip: "192.168.1.100:25565",
            },
            samp: {
                status: "Online",
                players: "245/500",
                uptime: "12d 8h 15m",
                ip: "192.168.1.101:7777",
            },
            gtav: {
                status: "Online",
                players: "64/100",
                uptime: "2d 4h 22m",
                ip: "192.168.1.102:30120",
            },
            website: {
                status: "Online",
                response: "45ms",
                uptime: "30d 14h 5m",
                url: "https://example.com",
            },
        };

        // Tier configurations
        this.tierConfig = {
            public: { maxBots: 100000, interval: 5000, label: "🆓 Public" },
            premium: { maxBots: 1000000, interval: 2000, label: "💎 Premium" },
            developer: {
                maxBots: 1000000000000000000000000000000000000000000000000000000000000000000000000000000000000,
                interval: 400,
                label: "👑 Developer",
            },
        };

        this.apiKey = "";
        this.discordInvite = "https://discord.gg/7HdbG73ks4";
        this.bypassUsed = false;

        // Discord Bot System
        this.discordBot = null;
        this.botToken = "";
        this.botOnline = false;
        this.currentVoiceChannel = null;
        this.radio24Active = false;
        this.userLevels = this.loadUserLevels();
        this.maxLevel = 2000;
        this.radio24Interval = null; // Fix interval leak

        // Demo Codes System
        this.demoCodes = {
            TRXNIH: {
                active: true,
                description: "Demo Access Code",
                level: "premium",
            },
            DECKS: {
                active: true,
                description: "Special Demo Code",
                level: "developer",
            },
        };

        // Server Specifications
        this.serverSpecs = {
            america: {
                location: "America - New York",
                ram: "2TB DDR5",
                gpu: "RTX 5090 24GB",
                cpu: "Intel Xeon E5-2699 v4",
                storage: "10TB NVMe SSD",
                network: "10Gbps",
                uptime: "99.99%",
            },
            singapore: {
                location: "Singapore - Digital Ocean",
                ram: "2TB DDR5",
                gpu: "RTX 5090 24GB",
                cpu: "AMD EPYC 7763",
                storage: "8TB NVMe SSD",
                network: "10Gbps",
                uptime: "99.98%",
            },
            indonesia: {
                location: "Indonesia - Jakarta",
                ram: "1.5TB DDR5",
                gpu: "RTX 5090 24GB",
                cpu: "Intel Xeon Gold 6258R",
                storage: "6TB NVMe SSD",
                network: "10Gbps",
                uptime: "99.97%",
            },
            kalimantan: {
                location: "Kalimantan - Balikpapan (3 Servers)",
                ram: "3TB DDR5 (Total)",
                gpu: "RTX 5090 24GB x3",
                cpu: "AMD EPYC 7763 x3",
                storage: "15TB NVMe SSD (Total)",
                network: "30Gbps (Total)",
                uptime: "99.95%",
            },
        };

        // Configuration - expose credentials for menu handler
        this.config = {
            devUsername: DEV_USERNAME,
            devPassword: DEV_PASSWORD,
            bypassCode: BYPASS_CODE,
        };

        // Initialize menu handler
        this.menuHandler = new MenuHandler(this);
    }

    loadPremiumCodes() {
        try {
            if (fs.existsSync("premium_codes.json")) {
                return JSON.parse(
                    fs.readFileSync("premium_codes.json", "utf8"),
                );
            }
        } catch (error) {
            console.log(chalk.yellow("⚠️ Could not load premium codes file"));
        }
        return {};
    }

    loadUserLevels() {
        try {
            if (fs.existsSync("user_levels.json")) {
                return JSON.parse(fs.readFileSync("user_levels.json", "utf8"));
            }
        } catch (error) {
            console.log(chalk.yellow("⚠️ Could not load user levels file"));
        }
        return {};
    }

    saveUserLevels() {
        try {
            fs.writeFileSync(
                "user_levels.json",
                JSON.stringify(this.userLevels, null, 2),
            );
        } catch (error) {
            console.log(chalk.red("❌ Could not save user levels"));
        }
    }

    async initializeDiscordBot(token) {
        try {
            this.discordBot = new Client({
                intents: [
                    GatewayIntentBits.Guilds,
                    GatewayIntentBits.GuildMessages,
                    GatewayIntentBits.MessageContent,
                    GatewayIntentBits.GuildVoiceStates,
                    GatewayIntentBits.GuildMembers,
                ],
            });

            this.discordBot.on("ready", () => {
                console.log(
                    chalk.green(
                        `✅ Discord Bot ${this.discordBot.user.tag} online!`,
                    ),
                );
                this.botOnline = true;
                this.discordBot.user.setActivity(
                    "TERMUX TOOL v3.0 PRO | !help",
                    { type: "PLAYING" },
                );
            });

            this.discordBot.on("messageCreate", async (message) => {
                if (message.author.bot) return;

                // Level system
                await this.handleUserLevel(
                    message.author.id,
                    message.author.username,
                );

                // Commands
                if (message.content.toLowerCase().startsWith("!join")) {
                    await this.handleJoinCommand(message);
                } else if (
                    message.content.toLowerCase().startsWith("!radio24")
                ) {
                    await this.handleRadio24Command(message);
                } else if (message.content.toLowerCase().includes("halla")) {
                    await this.handleHallaResponse(message);
                } else if (message.content.toLowerCase().startsWith("!level")) {
                    await this.handleLevelCommand(message);
                } else if (message.content.toLowerCase().startsWith("!role")) {
                    await this.handleRoleCommand(message);
                }
            });

            this.discordBot.on(
                "voiceStateUpdate",
                async (oldState, newState) => {
                    // Bot follows user voice channel
                    if (newState.member && !newState.member.user.bot) {
                        if (newState.channel && this.botOnline) {
                            await this.followUserVoice(newState.channel);
                        }
                    }
                },
            );

            await this.discordBot.login(token);
            this.botToken = token;
            return true;
        } catch (error) {
            console.log(chalk.red(`❌ Discord Bot Error: ${error.message}`));
            return false;
        }
    }

    async handleUserLevel(userId, username) {
        if (!this.userLevels[userId]) {
            this.userLevels[userId] = { username, level: 1, xp: 0 };
        }

        this.userLevels[userId].xp += Math.floor(Math.random() * 10) + 5;
        const currentLevel = this.userLevels[userId].level;
        const requiredXP = currentLevel * 100;

        if (
            this.userLevels[userId].xp >= requiredXP &&
            currentLevel < this.maxLevel
        ) {
            this.userLevels[userId].level++;
            this.userLevels[userId].xp = 0;
            console.log(
                chalk.green(
                    `🎊 ${username} naik ke level ${this.userLevels[userId].level}!`,
                ),
            );
        }

        this.saveUserLevels();
    }

    async handleJoinCommand(message) {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) {
            message.reply("❌ Anda harus berada di voice channel!");
            return;
        }

        try {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            this.currentVoiceChannel = voiceChannel;
            message.reply(`✅ Bot berhasil join ke ${voiceChannel.name}!`);

            await this.sendDiscordWebhook(
                "🎤 Bot Join Voice Channel",
                `Bot berhasil join ke voice channel **${voiceChannel.name}**`,
                0x00ff00,
            );
        } catch (error) {
            message.reply(`❌ Error joining voice: ${error.message}`);
        }
    }

    async handleRadio24Command(message) {
        const voiceChannel = message.member?.voice?.channel;
        if (!voiceChannel) {
            message.reply(
                "❌ Anda harus berada di voice channel untuk Radio24!",
            );
            return;
        }

        this.radio24Active = !this.radio24Active;

        if (this.radio24Active) {
            const connection = joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: voiceChannel.guild.id,
                adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            });

            this.currentVoiceChannel = voiceChannel;
            message.reply(
                "📻 **RADIO24 ACTIVATED** - Bot akan stay 24/7 di voice channel!",
            );

            // Clear existing interval to prevent leaks
            if (this.radio24Interval) {
                clearInterval(this.radio24Interval);
            }

            // Keep bot in voice channel
            this.radio24Interval = setInterval(async () => {
                if (this.radio24Active && this.currentVoiceChannel) {
                    try {
                        const existingConnection = getVoiceConnection(
                            this.currentVoiceChannel.guild.id,
                        );
                        if (!existingConnection) {
                            joinVoiceChannel({
                                channelId: this.currentVoiceChannel.id,
                                guildId: this.currentVoiceChannel.guild.id,
                                adapterCreator:
                                    this.currentVoiceChannel.guild
                                        .voiceAdapterCreator,
                            });
                        }
                    } catch (error) {
                        console.log(chalk.red("Radio24 reconnection failed"));
                    }
                }
            }, 60000); // Check every minute
        } else {
            message.reply(
                "📻 **RADIO24 DEACTIVATED** - Bot akan keluar dari voice channel.",
            );

            // Clear the interval to prevent leak
            if (this.radio24Interval) {
                clearInterval(this.radio24Interval);
                this.radio24Interval = null;
            }

            if (this.currentVoiceChannel) {
                const connection = getVoiceConnection(
                    this.currentVoiceChannel.guild.id,
                );
                if (connection) {
                    connection.destroy();
                }
            }
        }
    }

    async handleHallaResponse(message) {
        const serverName = message.guild.name;
        const responses = [
            `Halla juga! Salam dari server **${serverName}**! 👋`,
            `Hai! Senang bertemu di server **${serverName}**! 🎉`,
            `Halla! Selamat datang di **${serverName}**! ✨`,
        ];

        const randomResponse =
            responses[Math.floor(Math.random() * responses.length)];
        message.reply(randomResponse);
    }

    async handleLevelCommand(message) {
        const userId = message.author.id;
        const userLevel = this.userLevels[userId] || { level: 1, xp: 0 };

        const embed = new EmbedBuilder()
            .setTitle("📊 Level Status")
            .setDescription(`**${message.author.username}**`)
            .addFields([
                {
                    name: "🎯 Level",
                    value: `${userLevel.level}/${this.maxLevel}`,
                    inline: true,
                },
                {
                    name: "⭐ XP",
                    value: `${userLevel.xp}/${userLevel.level * 100}`,
                    inline: true,
                },
                {
                    name: "📈 Progress",
                    value: this.createProgressBar(
                        userLevel.xp,
                        userLevel.level * 100,
                    ),
                    inline: false,
                },
            ])
            .setColor(0x00ff00);

        message.reply({ embeds: [embed] });
    }

    async handleRoleCommand(message) {
        if (
            !message.member.permissions.has(
                PermissionsBitField.Flags.ManageRoles,
            )
        ) {
            message.reply(
                "❌ Anda tidak memiliki permission untuk manage roles!",
            );
            return;
        }

        // Role management available in TERMUX TOOL panel
        message.reply("🔧 Role management tersedia di TERMUX TOOL panel!");
    }

    createProgressBar(current, max) {
        const percentage = (current / max) * 100;
        const filled = Math.round(percentage / 5);
        const empty = 20 - filled;
        return `[${"█".repeat(filled)}${"░".repeat(empty)}] ${percentage.toFixed(1)}%`;
    }

    async followUserVoice(channel) {
        if (
            this.botOnline &&
            this.currentVoiceChannel &&
            channel.id !== this.currentVoiceChannel.id
        ) {
            try {
                const connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
                this.currentVoiceChannel = channel;
                console.log(
                    chalk.blue(
                        `🎤 Bot pindah mengikuti user ke ${channel.name}`,
                    ),
                );
            } catch (error) {
                console.log(
                    chalk.red(`❌ Error following voice: ${error.message}`),
                );
            }
        }
    }

    savePremiumCodes() {
        try {
            fs.writeFileSync(
                "premium_codes.json",
                JSON.stringify(this.premiumCodes, null, 2),
            );
        } catch (error) {
            console.log(chalk.red("❌ Could not save premium codes"));
        }
    }

    generatePremiumCode(duration, unit) {
        const code = crypto.randomBytes(8).toString("hex").toUpperCase();
        const now = new Date();
        let expiryDate = new Date(now);

        switch (unit) {
            case "minutes":
                expiryDate.setMinutes(now.getMinutes() + duration);
                break;
            case "hours":
                expiryDate.setHours(now.getHours() + duration);
                break;
            case "days":
                expiryDate.setDate(now.getDate() + duration);
                break;
            case "months":
                expiryDate.setMonth(now.getMonth() + duration);
                break;
            case "years":
                expiryDate.setFullYear(now.getFullYear() + duration);
                break;
            default:
                expiryDate.setHours(now.getHours() + duration);
        }

        this.premiumCodes[code] = {
            created: now.toISOString(),
            expires: expiryDate.toISOString(),
            used: false,
            creator: this.developerName,
        };

        this.savePremiumCodes();
        return code;
    }

    validatePremiumCode(code) {
        if (!this.premiumCodes[code]) return false;

        const codeData = this.premiumCodes[code];
        const now = new Date();
        const expiry = new Date(codeData.expires);

        if (now > expiry || codeData.used) {
            return false;
        }

        codeData.used = true;
        codeData.usedAt = now.toISOString();
        this.savePremiumCodes();
        return true;
    }

    generateApiKey() {
        const chars =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < 32; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    async sendDiscordWebhook(title, message, color = 0x00ff00, fields = []) {
        if (!this.discordWebhook) return;

        const embed = {
            title: title,
            description: message,
            color: color,
            timestamp: new Date().toISOString(),
            footer: {
                text: `TERMUX TOOL v3.0 PRO | ${this.developerName}`,
                icon_url: "https://cdn.discordapp.com/emojis/🤖.png",
            },
            fields: fields,
        };

        try {
            console.log(chalk.blue("📡 Discord: ") + chalk.gray(title));

            await axios.post(
                this.discordWebhook,
                {
                    embeds: [embed],
                },
                {
                    timeout: 10000,
                    headers: {
                        "Content-Type": "application/json",
                    },
                },
            );

            console.log(chalk.green("✅ Discord notification sent"));
        } catch (error) {
            console.log(chalk.red(`❌ Discord error: ${error.message}`));
        }
    }

    async runProfessionalAttack() {
        this.menuHandler.displayProfessionalHeader();
        console.log(chalk.yellow("🚀 Professional Attack Configuration\n"));

        // Server type selection
        console.log(chalk.cyan("🎯 Select Target Type:"));
        console.log("1. 🏎️ SA-MP Server");
        console.log("2. 🎮 Minecraft Server");
        console.log("3. 🚗 GTA V FiveM Server");
        console.log("4. 🌐 Website/URL");

        const serverChoice = readlineSync.questionInt(
            chalk.cyan("\nSelect target (1-4): "),
        );

        let serverType, targetAddress;
        switch (serverChoice) {
            case 1:
                serverType = "SA-MP";
                targetAddress = readlineSync.question(
                    chalk.cyan("🏎️ Enter SA-MP server IP:PORT: "),
                );
                break;
            case 2:
                serverType = "Minecraft";
                targetAddress = readlineSync.question(
                    chalk.cyan("🎮 Enter Minecraft server IP:PORT: "),
                );
                break;
            case 3:
                serverType = "GTA V";
                targetAddress = readlineSync.question(
                    chalk.cyan("🚗 Enter FiveM server IP:PORT: "),
                );
                break;
            case 4:
                serverType = "Website";
                targetAddress = readlineSync.question(
                    chalk.cyan("🌐 Enter target URL: "),
                );
                break;
            default:
                console.log(chalk.red("❌ Invalid choice!"));
                readlineSync.question(chalk.gray("Press Enter to return..."));
                return;
        }

        // Get current tier configuration
        const currentTier = this.tierConfig[this.userTier];
        const maxBots = currentTier.maxBots;
        const defaultBots =
            this.userTier === "developer"
                ? 100000
                : this.userTier === "premium"
                  ? 50000
                  : 10000;

        console.log(
            chalk.green(
                `\n${currentTier.label} | Max Bots: ${maxBots.toLocaleString()}`,
            ),
        );

        let botCount;
        if (this.userTier === "developer") {
            console.log(
                chalk.red(
                    "👑 DEVELOPER MODE: Custom bot configuration available",
                ),
            );
            botCount = readlineSync.questionInt(
                chalk.cyan(`Enter bot count (1-${maxBots.toLocaleString()}): `),
                {
                    defaultInput: defaultBots.toString(),
                },
            );
        } else {
            botCount = readlineSync.questionInt(
                chalk.cyan(`Enter bot count (1-${maxBots.toLocaleString()}): `),
                {
                    defaultInput: defaultBots.toString(),
                },
            );
        }

        if (botCount > maxBots) {
            console.log(
                chalk.red(
                    `❌ Maximum ${maxBots.toLocaleString()} bots allowed for ${this.userTier} tier!`,
                ),
            );
            readlineSync.question(chalk.gray("Press Enter to return..."));
            return;
        }

        // Enhanced custom interval for developer mode
        let customInterval = currentTier.interval;
        if (this.userTier === "developer") {
            console.log(
                chalk.red("\n👑 DEVELOPER ADVANCED SPEED CONFIGURATION"),
            );
            console.log(chalk.cyan("A. 🚀 Ultra Custom Speed Settings"));
            console.log(chalk.cyan("B. ⚡ Quick Standard Settings"));

            const speedChoice = readlineSync
                .question(chalk.yellow("Choose speed option (A/B): "))
                .toUpperCase();

            if (speedChoice === "A") {
                console.log(
                    chalk.magenta("\n🚀 Ultra Custom Speed Configuration"),
                );
                console.log(chalk.cyan("Select time unit:"));
                console.log("1. 🔥 Milliseconds (Ultra Speed)");
                console.log("2. ⚡ Seconds (High Speed)");
                console.log("3. 🕐 Minutes (Medium Speed)");
                console.log("4. 🕐 Hours (Low Speed)");

                const unitChoice = readlineSync.questionInt(
                    chalk.cyan("\nSelect time unit (1-4): "),
                );

                let multiplier = 1;
                let unitName = "milliseconds";
                let examples = "";

                switch (unitChoice) {
                    case 1:
                        multiplier = 1;
                        unitName = "milliseconds";
                        examples = chalk.gray(
                            "Examples: 100ms = Ultra Fast, 500ms = Very Fast, 1000ms = Fast",
                        );
                        break;
                    case 2:
                        multiplier = 1000;
                        unitName = "seconds";
                        examples = chalk.gray(
                            "Examples: 1s = Fast, 5s = Medium, 10s = Slow",
                        );
                        break;
                    case 3:
                        multiplier = 60000;
                        unitName = "minutes";
                        examples = chalk.gray(
                            "Examples: 1min = Very Slow, 5min = Ultra Slow, 10min = Extreme Slow",
                        );
                        break;
                    case 4:
                        multiplier = 3600000;
                        unitName = "hours";
                        examples = chalk.gray(
                            "Examples: 1hr = Hourly, 2hr = Bi-hourly, 24hr = Daily",
                        );
                        break;
                    default:
                        console.log(
                            chalk.red("❌ Invalid choice, using milliseconds"),
                        );
                        multiplier = 1;
                        unitName = "milliseconds";
                }

                console.log(`\n${examples}`);
                const customValue = readlineSync.questionFloat(
                    chalk.cyan(`Enter ${unitName} value: `),
                );
                customInterval = Math.max(
                    1,
                    Math.floor(customValue * multiplier),
                );

                console.log(
                    chalk.green(
                        `✅ Custom interval set to: ${customInterval}ms (${customValue} ${unitName})`,
                    ),
                );
            } else {
                const useCustom = readlineSync.keyInYN(
                    chalk.yellow("Use quick custom interval (milliseconds)? "),
                );
                if (useCustom) {
                    console.log(
                        chalk.gray(
                            "Quick examples: 100ms = Ultra, 500ms = Fast, 1000ms = Normal, 2000ms = Slow",
                        ),
                    );
                    customInterval = readlineSync.questionInt(
                        chalk.cyan(
                            "Enter interval in milliseconds (min 1ms): ",
                        ),
                        {
                            defaultInput: "1000",
                        },
                    );
                    if (customInterval < 1) customInterval = 1;
                }
            }
        }

        // Start attack
        console.log(chalk.yellow(`\n🚀 Initializing Professional Attack...`));
        console.log(chalk.cyan(`🎯 Target: ${serverType} | ${targetAddress}`));
        console.log(
            chalk.blue(
                `🤖 Bots: ${botCount.toLocaleString()} | Interval: ${customInterval}ms`,
            ),
        );
        console.log(chalk.green(`👑 Mode: ${currentTier.label}`));

        // Send Discord notification
        await this.sendDiscordWebhook(
            "🚀 Attack Initiated",
            `Professional attack started on **${serverType}** server`,
            0xff0000,
            [
                {
                    name: "🎯 Target",
                    value: `${serverType}\n${targetAddress}`,
                    inline: true,
                },
                {
                    name: "🤖 Bot Count",
                    value: botCount.toLocaleString(),
                    inline: true,
                },
                {
                    name: "⚡ Interval",
                    value: `${customInterval}ms`,
                    inline: true,
                },
                {
                    name: "👤 User Tier",
                    value: currentTier.label,
                    inline: true,
                },
                {
                    name: "⏰ Started",
                    value: new Date().toLocaleString(),
                    inline: true,
                },
            ],
        );

        // Execute attack simulation
        this.attackInProgress = true;
        await this.executeAttack(
            botCount,
            customInterval,
            serverType,
            targetAddress,
        );
    }

    async executeAttack(botCount, interval, serverType, target) {
        console.log(chalk.yellow("\n📊 Attack Progress:"));
        console.log(chalk.cyan("════════════════════════════════════════"));

        const batchSize = Math.min(botCount, 1000);
        const batches = Math.ceil(botCount / batchSize);

        for (let batch = 1; batch <= batches; batch++) {
            const currentBatch = Math.min(
                batchSize,
                botCount - (batch - 1) * batchSize,
            );

            console.log(
                chalk.green(
                    `\n🚀 Batch ${batch}/${batches} - Spawning ${currentBatch} bots...`,
                ),
            );

            // Simulate bot spawning
            for (let i = 1; i <= currentBatch; i++) {
                if (i % 100 === 0 || i === currentBatch) {
                    const progress = (batch - 1) * batchSize + i;
                    const percentage = ((progress / botCount) * 100).toFixed(1);
                    console.log(
                        chalk.blue(
                            `   Bot ${progress.toLocaleString()}/${botCount.toLocaleString()} (${percentage}%) connected...`,
                        ),
                    );

                    // Send real-time Discord progress update
                    if (progress % 1000 === 0 || progress === botCount) {
                        await this.sendDiscordWebhook(
                            "⚡ Real-Time Attack Progress",
                            `**Bot ${progress.toLocaleString()}/${botCount.toLocaleString()}** (${percentage}%) connected to **${serverType}**`,
                            0x0099ff,
                            [
                                {
                                    name: "🤖 Progress",
                                    value: `Bot ${progress.toLocaleString()}/${botCount.toLocaleString()}`,
                                    inline: true,
                                },
                                {
                                    name: "📊 Percentage",
                                    value: `${percentage}%`,
                                    inline: true,
                                },
                                {
                                    name: "🎯 Target",
                                    value: serverType,
                                    inline: true,
                                },
                                {
                                    name: "⚡ Status",
                                    value: "Connecting...",
                                    inline: true,
                                },
                                {
                                    name: "📡 Response",
                                    value: `${Math.floor(Math.random() * 200) + 50}ms`,
                                    inline: true,
                                },
                                {
                                    name: "⏰ Time",
                                    value: new Date().toLocaleTimeString(),
                                    inline: true,
                                },
                            ],
                        );
                    }
                }
                this.activeBots++;

                // Add small delay for visual effect
                if (i % 50 === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 10));
                }
            }

            // Simulate server response
            const responseTime = Math.floor(Math.random() * 200) + 50;
            const packetsLost = Math.floor(Math.random() * 5);

            console.log(
                chalk.yellow(
                    `   📡 Server response: ${responseTime}ms | Packets lost: ${packetsLost}`,
                ),
            );

            if (batch < batches) {
                console.log(
                    chalk.gray(
                        `   ⏳ Waiting ${interval}ms before next batch...`,
                    ),
                );
                await new Promise((resolve) => setTimeout(resolve, interval));
            }
        }

        // Attack completion
        console.log(chalk.green("\n✅ Attack completed successfully!"));
        console.log(
            chalk.cyan(
                `📊 Final Stats: ${this.activeBots.toLocaleString()} bots deployed`,
            ),
        );

        // Send completion notification
        await this.sendDiscordWebhook(
            "✅ Attack Completed",
            `Professional attack on **${serverType}** completed successfully`,
            0x00ff00,
            [
                { name: "🎯 Target", value: target, inline: true },
                {
                    name: "🤖 Total Bots",
                    value: this.activeBots.toLocaleString(),
                    inline: true,
                },
                {
                    name: "⏰ Completed",
                    value: new Date().toLocaleString(),
                    inline: true,
                },
                { name: "🎯 Success Rate", value: "98.7%", inline: true },
                { name: "📊 Avg Response", value: "125ms", inline: true },
                {
                    name: "⚡ Total Time",
                    value: `${Math.floor((batches * interval) / 400)}s`,
                    inline: true,
                },
            ],
        );

        this.attackInProgress = false;
        console.log(chalk.gray("\n📝 Attack log saved to system database"));
        readlineSync.question(
            chalk.gray("Press Enter to return to main menu..."),
        );
    }

    async start() {
        await this.menuHandler.start();
    }
}

// Initialize and start the application
const app = new ProfessionalTermuxTool();
app.start().catch(console.error);
