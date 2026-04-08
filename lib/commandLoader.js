// lib/commandLoader.js
const fs = require('fs');
const path = require('path');

class CommandLoader {
    constructor() {
        this.commands = new Map();
        this.aliases = new Map();
        this.commandsPath = path.join(process.cwd(), 'commands');
    }

    // Load all commands automatically
    loadCommands() {
        if (!fs.existsSync(this.commandsPath)) {
            fs.mkdirSync(this.commandsPath, { recursive: true });
            console.log('📁 Created commands folder');
            return;
        }

        const commandFiles = fs.readdirSync(this.commandsPath).filter(file => 
            file.endsWith('.js') && !file.startsWith('_')
        );

        for (const file of commandFiles) {
            this.loadCommand(file);
        }

        console.log(`✅ Loaded ${this.commands.size} commands`);
        return this.commands.size;
    }

    // Load single command
    loadCommand(file) {
        const filePath = path.join(this.commandsPath, file);
        
        // Clear cache
        delete require.cache[require.resolve(filePath)];
        
        try {
            const command = require(filePath);
            
            if (command.name) {
                this.commands.set(command.name.toLowerCase(), command);
            }
            
            if (command.aliases && Array.isArray(command.aliases)) {
                command.aliases.forEach(alias => {
                    this.aliases.set(alias.toLowerCase(), command);
                });
            }
            
            console.log(`  ✓ Loaded: ${command.name}`);
            return true;
        } catch (error) {
            console.error(`  ✗ Failed: ${file} - ${error.message}`);
            return false;
        }
    }

    // Auto watch commands folder
    watchCommands() {
        const watcher = fs.watch(this.commandsPath, (eventType, filename) => {
            if (filename && filename.endsWith('.js')) {
                console.log(`\n🔄 Detected: ${filename}`);
                
                // Remove old command
                const oldCommand = this.getCommandByFile(filename);
                if (oldCommand) {
                    this.commands.delete(oldCommand.name);
                    if (oldCommand.aliases) {
                        oldCommand.aliases.forEach(alias => {
                            this.aliases.delete(alias);
                        });
                    }
                }
                
                // Load new command
                setTimeout(() => {
                    this.loadCommand(filename);
                    console.log(`✅ Auto-loaded: ${filename}\n`);
                }, 100);
            }
        });
        
        console.log('👀 Watching commands folder... (add/delete files, bot auto-loads!)');
        return watcher;
    }

    getCommandByFile(filename) {
        const filePath = path.join(this.commandsPath, filename);
        try {
            delete require.cache[require.resolve(filePath)];
            const command = require(filePath);
            return command;
        } catch {
            return null;
        }
    }

    getCommand(cmdName) {
        return this.commands.get(cmdName.toLowerCase()) || this.aliases.get(cmdName.toLowerCase());
    }

    getAllCommands() {
        return Array.from(this.commands.values());
    }
}

module.exports = new CommandLoader();
