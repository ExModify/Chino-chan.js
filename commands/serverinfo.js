const Discord = require('discord.js');
const si = require('systeminformation');

module.exports = {
    name: 'serverinfo',
    canPrivate: true,
    requirePrefix: true,
    minimumLevel: 0,
    type: "Information",
    execute: (bot, message, prefix, command, parameter, language) => {
        var Embed = new Discord.RichEmbed();

        Embed.setColor(255 << 16 | 050 << 8 | 230);

        Embed.setTitle(`**${language.ServerInformation}**`);

        si.cpu(CPUData => {
            si.mem(memData => {
                si.memLayout(memLayoutData => {
                    si.graphics(GraphData => {
                        si.osInfo(osInfoData => {
                            si.fsSize(fsSizeData => {
                                var CPU = CPUData.manufacturer + " " + CPUData.brand;

                                var MaxSpeedGhz = CPUData.speedmax;

                                var CPUCores = CPUData.cores;

                                var TotalMem = (memData.total / 1024 / 1024).toFixed(2);
                                var FreeMem = (memData.free / 1024 / 1024).toFixed(2);
                                var UsedMem = (memData.used / 1024 / 1024).toFixed(2);

                                var MemoryModules = memLayoutData.map((v, i, a) => [parseInt(v.size) / 1024 / 1024, v.type, v.formFactor, v.clockSpeed]);
                                var VRAMS = GraphData["controllers"].map((v, i, a) => {
                                    if (v.vram)
                                        if (!isNaN(parseInt(v.vram))) 
                                            return [v.model, v.vram];
                                });

                                var platform = osInfoData.platform;
                                var distro = osInfoData.distro;
                                var uptime = si.time().uptime;
                                var hours = Math.trunc(uptime / 3600);
                                var mins = Math.trunc(uptime / 60) - hours * 60;
                                var secs = (uptime - (mins * 60) - (hours * 3600)).toFixed(0);
                                
                                var fsInfo = fsSizeData.map((v, i, a) => [v.fs, v.type, v.use]);

                                var Text = `---${language.ServerInformation}---\n`;
                                Text += `--${language.CPU}--\n`;
                                Text += `- ${language.Brand}: ${CPU}\n`;
                                Text += `- ${language.CPUCores}: ${CPUCores}\n`;

                                Text += `\n--${language.MemoryUsage}--\n`;
                                Text += `- ${UsedMem}MB/${TotalMem}MB, ${language.FreeMemory}: ${FreeMem}\n`;
                                MemoryModules.forEach((v, i, a) => {
                                    Text += `#${i}: ${v[2]} ${v[1]} ${v[0]}MB ${isNaN(v[3]) ? "" : v[3] + "Mhz"}\n`;
                                });

                                Text += `\n--${language.GraphicInfos}--\n`;
                                Text += `- ${language.VRAMs}\n`;
                                VRAMS.forEach((v, i, a) => {
                                    if (v)
                                        Text += `- #${i}: ${v[0]} - ${parseInt(v[1]) / 1024 / 1024}MB\n`;
                                });

                                Text += `\n--${language.OS}--\n`;
                                Text += `- ${language.Platform}: ${platform}\n`;
                                Text += `- ${language.Distro}: ${distro}\n`;
                                Text += `- ${language.Uptime}: ${hours} ${language.Hours}, ${mins} ${language.Minutes}, ${secs} ${language.Seconds}\n\n`;

                                Text += `--${language.Drives}--\n`;
                                fsInfo.forEach((v, i, a) => {
                                    if(v[1] != undefined)
                                        Text += `- #${i} ${v[0]}(${v[1]}) - ${v[2].toFixed(0)}% ${language.Used}\n`;
                                });

                                Embed.setDescription(Text);
                                message.channel.send({embed:Embed});
                            });
                        });
                    });
                });
            });
        });
    }
};