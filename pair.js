// ==================== AUTO COMMAND LOADER ====================
const commandLoader = require('./lib/commandLoader');

// Load all commands
commandLoader.loadCommands();

// Watch for new commands
commandLoader.watchCommands();

// Command handler - Ye purane command handler ki jagah ayega
const cmdName = command.toLowerCase();
const command = commandLoader.getCommand(cmdName);

if (command) {
    // Permission checks
    if (command.ownerOnly && !isOwner) {
        return await socket.sendMessage(sender, {
            text: "🔐 Only bot owner can use this command!"
        }, { quoted: msg });
    }
    
    if (command.groupOnly && !isGroup) {
        return await socket.sendMessage(sender, {
            text: "❌ This command only works in groups!"
        }, { quoted: msg });
    }
    
    if (command.adminOnly && !isAdmins && !isOwner) {
        return await socket.sendMessage(sender, {
            text: "🔐 Only group admins can use this command!"
        }, { quoted: msg });
    }
    
    // Execute command
    await command.execute(socket, msg, args, sender, from, isGroup, isAdmins, isOwner, prefix, config);
    return;
}
// Agar command nahi mili to aage badho (old handler)
