"use strict";

// АвтоБой
class AutoFight {
    constructor() {
        this.moves = {
            move1: {
                canUse: false,
                link: 'a[href*="num=1"]',
                count: 0,
                PPIndex: 0
            },
            move2: {
                canUse: false,
                link: 'a[href*="num=2"]',
                count: 0,
                PPIndex: 1
            },
            move3: {
                canUse: false,
                link: 'a[href*="num=3"]',
                count: 0,
                PPIndex: 2
            },
            move4: {
                canUse: false,
                link: 'a[href*="num=4"]',
                count: 0,
                PPIndex: 3
            },
        };
        this.escapedPokemons = ['#412', '#515', '#588', '#627', '#631', '#641', '#708', '#744', '#765', '#280', '#333', '#420', '#403', '#616', '#629', '#632', '#642', '#710', '#744', '#766', '#214', '#328', '#412', '#513', '#588', '#627', '#631', '#641', '#708', '#744', '#765', '#280', '#333', '#413', '#511', '#616', '#629', '#632', '#642', '#710', '#744', '#766', '#214', '#328'];

    }

    kick() {
        for (let i = 1; i < 5; i++) {
            let move = this.moves['move' + i];
            if (move.canUse && move.count > 0) {
                move.count -= 1;
                frames[0].document.querySelector(move.link)?.click();
                break;
            }
        }
    }

    quitFight() {
        let quitButton = frames[0].document.querySelector('#exitFight');;
        if (quitButton) {
            quitButton.click();
        }
    }

    huntBtnEnable(state) {
        var huntBtnEl = frames[3].document.querySelector('a[href*="hunt=1"] > img');
        var buttonState = parseInt(huntBtnEl.src.slice(-5));
        if (state == 'on') {
            if (buttonState == 1) {
                huntBtnEl.click();
            }
        } else {
            if (buttonState == 2) {
                huntBtnEl.click();
            }
        }
    }

    isEscapedPokemonsOrShine() {
        var enemyPokemonTitle = frames[0].document.querySelectorAll('td[class="title"] > span')[1].className;
        var regPokeNumber = /\#\d{3}\.{0,1}\d{0,1}/g;
        var enemyPokemonNumber = frames[0].document.querySelectorAll('td[class="title"] > span')[1].innerHTML.slice('</a>').match(regPokeNumber)[0];
        if (enemyPokemonTitle !== 'poketitle' || this.escapedPokemons.includes(enemyPokemonNumber)) {
            return true;
        } else {
            return false;
        }
    }
}




// АвтоКапча
class AutoCaptcha {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    async createTask(image) {
        var createTaskURL = 'https://api.anti-captcha.com/createTask';
        var createTaskData = {
            'clientKey': this.apiKey,
            'task': {
                "type": "ImageToTextTask",
                "body": image,
                "numeric": 1,
                "minLength": 4,
                "maxLength": 4
            },
            "softId": 1077
        };
        var createTask = await fetch(createTaskURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json, charset=utf-8'
            },
            body: JSON.stringify(createTaskData)
        });
        var resultJson = await createTask.json();
        if (resultJson.errorId === 0) {
            setTimeout(() => { this.getTaskResult(resultJson.taskId) }, 5000);
        } else {
            console.log('Ошибка API: ' + resultJson.errorCode + ', ' + resultJson.errorDescription);
        }
    }

    async getTaskResult(taskId) {
        var getTaskResultURL = 'https://api.anti-captcha.com/getTaskResult';
        let getTaskResultData = {
            'clientKey': this.apiKey,
            'taskId': taskId
        };
        var result = '';
        var getTaskResult = await fetch(getTaskResultURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json, charset=utf-8'
            },
            body: JSON.stringify(getTaskResultData)
        });
        var resultJson = await getTaskResult.json();

        if (resultJson.errorId == 0) {
            // Получаем рузультат...
            if (resultJson.status == 'ready') {
                frames[0].document.querySelector('input[name="keystring"]').value = resultJson.solution.text;
                setTimeout(() => { frames[0].document.querySelector('input[value="Отправить"]').click(); }, 2000)
            } else {
                setTimeout(() => { this.getTaskResult(taskId) }, 2000);
            }
        } else {
            console.log('Ошибка API: ' + resultJson.errorCode + ', ' + resultJson.errorDescription);
        }
    }

    creatImageBase64URL(imageEl) {
        var canvas = document.createElement('canvas');
        canvas.width = imageEl.width;
        canvas.height = imageEl.height;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(imageEl, 0, 0);
        var dataURL = canvas.toDataURL('image, png').replace('data:image/png;base64,', '');
        return dataURL;
    }
}



// random arena helper

let trainersPokemons = {};

function arenaHelper() {
    if (arenaHelperEnabled) {
        if (frames[0].document.title !== 'LEAGUE-17 FIGHT!') {
            trainersPokemons = {};
        } else {
            // add pokemon to 'trainersPokemons'
            let pokNameEl = frames[0].document.querySelectorAll(".title")[1]?.querySelector('span');
            let enemyNick = frames[0].document.querySelectorAll("#txt_c > b > big > font")[1];
            if (pokNameEl && enemyNick) {
                let currentPokemon = pokNameEl.innerText.trim();
                trainersPokemons[currentPokemon] = arenaPokemons[currentPokemon];
                // add title for pokemon name
                pokNameEl.setAttribute('title', `${[currentPokemon]}: ${trainersPokemons[currentPokemon]}`);

                // add title for nickname
                let keys = Object.keys(trainersPokemons)
                let res = '';
                for (let i = 0; i < keys.length; i++) {
                    res += keys[i] + ': ';
                    res += trainersPokemons[keys[i]] + '\n';
                }
                enemyNick?.setAttribute('title', res);
            }
            // if not a fight trainersPokemons = {}
            if (frames[0].document.title !== 'LEAGUE-17 FIGHT!') {
                trainersPokemons = {};
            }
        }
    } else {
        document.querySelector('#_location').removeEventListener('load', arenaHelper);
    }
}


const arenaPokemons = {
    '#763 Tsareena 100-lvl': 'Rapid Spin,Power Whip,High Jump Kick,Zen Headbutt',
    '#260 Swampert 100-lvl': 'Stealth Rock,Earthquake,Scald,Roar',
    '#463 Lickilicky 100-lvl': 'Protect,Toxic,Dragon Tail,Wish',
    '#461 Weavile 100-lvl': 'Swords Dance,Icicle Crash,Night Slash,Low Kick',
    '#213 Shuckle 100-lvl': 'Sticky Web,Stealth Rock,Toxic,Rock Tomb',
    '#455 Carnivine 100-lvl': 'Sleep Powder,Power Whip,Swords Dance,Crunch',
    '#189 Jumpluff 100-lvl': 'Swords Dance,Acrobatics,Seed Bomb,Sleep Powder',
    '#257 Blaziken 100-lvl': 'Swords Dance,Flare Blitz,High Jump Kick,Stone Edge',
    '#741.1 Oricorio Pom-Pom 100-lvl': 'Calm Mind,Roost,Hurricane,Revelation Dance',
    '#430 Honchkrow 100-lvl': 'Brave Bird,Sucker Punch,Superpower,Night Slash',
    '#211 Qwilfish 100-lvl': 'Thunder Wave,Liquidation,Destiny Bond,Toxic Spikes',
    '#342 Crawdaunt 100-lvl': 'Dragon Dance,Crabhammer,Superpower,Crunch',
    '#099 Kingler 100-lvl': 'Swords Dance,Liquidation,Rock Slide,X-Scissor',
    '#581 Swanna 100-lvl': 'Roost,Scald,Hurricane,Ice Beam',
    '#369 Relicanth 100-lvl': 'Stealth Rock,Head Smash,Earthquake,Waterfall',
    '#089 Muk 100-lvl': 'Curse,Poison Jab,Fire Punch,Ice Punch',
    '#567 Archeops 100-lvl': 'Acrobatics,Stone Edge,Earthquake,Stealth Rock',
    '#121 Starmie 100-lvl': 'Hydro Pump,Ice Beam,Psyshock,Thunderbolt',
    '#251 Celebi 100-lvl': 'Nasty Plot,Psychic,Giga Drain,Earth Power',
    '#062 Poliwrath 100-lvl': 'Circle Throw,Scald,Toxic,Rest',
    '#632 Durant 100-lvl': 'Hone Claws,Iron Head,Rock Slide,Superpower',
    '#168 Ariados 100-lvl': 'Sticky Web,Toxic Spikes,Megahorn,Poison Jab',
    '#542 Leavanny 100-lvl': 'Swords Dance,Leaf Blade,X-Scissor,Sticky Web',
    '#777 Togedemaru 100-lvl': 'Nuzzle,Iron Head,Zing Zap,Spiky Shield',
    '#593 Jellicent 100-lvl': 'Recover,Scald,Hex,Taunt',
    '#612 Haxorus 100-lvl': 'Dragon Dance,Dragon Claw,Earthquake,Poison Jab',
    '#637 Volcarona 100-lvl': 'Quiver Dance,Fiery Dance,Bug Buzz,Roost',
    '#423 Gastrodon 100-lvl': 'Scald,Recover,Toxic,Earthquake',
    '#787 Tapu Bulu 100-lvl': 'Bulk Up,Horn Leech,Stone Edge,Superpower',
    '#450 Hippowdon 100-lvl': 'Stealth Rock,Earthquake,Toxic,Slack Off',
    '#701 Hawlucha 100-lvl': 'Swords Dance,High Jump Kick,Acrobatics,Taunt',
    '#373 Salamence 100-lvl': 'Dragon Dance,Dragon Claw,Earthquake,Fire Blast',
    '#389 Torterra 100-lvl': 'Rock Polish,Earthquake,Stone Edge,Wood Hammer',
    '#018 Pidgeot 100-lvl': 'Defog,Heat Wave,Air Slash,Roost',
    '#752 Araquanid 100-lvl': 'Sticky Web,Liquidation,Leech Life,Toxic',
    '#711 Gourgeist 100-lvl': 'Foul Play,Leech Seed,Will-O-Wisp,Synthesis',
    '#164 Noctowl 100-lvl': 'Work Up,Roost,Heat Wave,Hurricane',
    '#279 Pelipper 100-lvl': 'Rain Dance,Hydro Pump,Hurricane,Roost',
    '#214 Heracross 100-lvl': 'Close Combat,Megahorn,Stone Edge,Earthquake',
    '#169 Crobat 100-lvl': 'Acrobatics,Super Fang,Roost,Taunt',
    '#135 Jolteon 100-lvl': 'Charge Beam,Thunderbolt,Shadow Ball,Hidden Power',
    '#160 Feraligatr 100-lvl': 'Dragon Dance,Liquidation,Ice Punch,Crunch',
    '#756 Shiinotic 100-lvl': 'Strength Sap,Moonblast,Spore,Giga Drain',
    '#558 Crustle 100-lvl': 'Spikes,Stealth Rock,Rock Blast,X-Scissor',
    '#625 Bisharp 100-lvl': 'Swords Dance,Night Slash,Iron Head,Sucker Punch',
    '#346 Cradily 100-lvl': 'Recover,Toxic,Stealth Rock,Seed Bomb',
    '#658 Greninja 100-lvl': 'Dark Pulse,Hydro Pump,Spikes,Taunt',
    '#227 Skarmory 100-lvl': 'Stealth Rock,Roost,Brave Bird,Roar',
    '#143 Snorlax 100-lvl': 'Curse,Body Slam,Earthquake,Rest',
    '#537 Seismitoad 100-lvl': 'Stealth Rock,Hydro Pump,Earth Power,Sludge Wave',
    '#776 Turtonator 100-lvl': 'Shell Smash,Draco Meteor,Dragon Pulse,Flamethrower',
    '#171 Lanturn 100-lvl': 'Hydro Pump,Ice Beam,Hidden Power,Thunderbolt',
    '#516 Simipour 100-lvl': 'Nasty Plot,Ice Beam,Scald,Focus Blast',
    '#336 Seviper 100-lvl': 'Dark Pulse,Flamethrower,Sludge Wave,Giga Drain',
    '#617 Accelgor 100-lvl': 'Bug Buzz,Focus Blast,Energy Ball,Spikes',
    '#748 Toxapex 100-lvl': 'Toxic,Haze,Scald,Recover',
    '#242 Blissey 100-lvl': 'Seismic Toss,Toxic,Flamethrower,Soft-Boiled',
    '#547 Whimsicott 100-lvl': 'Moonblast,Energy Ball,Psychic,Stun Spore',
    '#012 Butterfree 100-lvl': 'Quiver Dance,Air Slash,Bug Buzz,Sleep Powder',
    '#683 Aromatisse 100-lvl': 'Trick Room,Nasty Plot,Moonblast,Psyshock',
    '#475 Gallade 100-lvl': 'Swords Dance,Close Combat,Stone Edge,Psycho Cut',
    '#110 Weezing 100-lvl': 'Toxic Spikes,Will-O-Wisp,Sludge Bomb,Fire Blast',
    '#142 Aerodactyl 100-lvl': 'Earthquake,Stone Edge,Taunt,Crunch',
    '#678 Meowstic 100-lvl': 'Light Screen,Reflect,Psychic,Thunder Wave',
    '#232 Donphan 100-lvl': 'Rapid Spin,Stealth Rock,Ice Shard,Earthquake',
    '#454 Toxicroak 100-lvl': 'Swords Dance,Drain Punch,Gunk Shot,Sucker Punch',
    '#419 Floatzel 100-lvl': 'Bulk Up,Liquidation,Ice Punch,Taunt',
    '#523 Zebstrika 100-lvl': 'Thunderbolt,Overheat,Hidden Power,Thunder Wave',
    '#745 Lycanroc Midday 100-lvl': 'Accelerock,Swords Dance,Rock Slide,Stealth Rock',
    '#026 Raichu 100-lvl': 'Thunderbolt,Grass Knot,Nasty Plot,Focus Blast',
    '#003 Venusaur 100-lvl': 'Growth,Sludge Bomb,Giga Drain,Hidden Power',
    '#598 Ferrothorn 100-lvl': 'Stealth Rock,Leech Seed,Thunder Wave,Power Whip',
    '#775 Komala 100-lvl': 'Rapid Spin,Wish,Toxic,Protect',
    '#518 Musharna 100-lvl': 'Thunder Wave,Heal Bell,Psychic,Moonlight',
    '#786 Tapu Lele 100-lvl': 'Calm Mind,Moonblast,Psyshock,Focus Blast',
    '#503 Samurott 100-lvl': 'Swords Dance,Liquidation,Megahorn,Sacred Sword',
    '#130 Gyarados 100-lvl': 'Dragon Dance,Waterfall,Ice Fang,Taunt',
    '#196 Espeon 100-lvl': 'Calm Mind,Psychic,Shadow Ball,Dazzling Gleam',
    '#560 Scrafty 100-lvl': 'Dragon Dance,Drain Punch,Crunch,Zen Headbutt',
    '#323 Camerupt 100-lvl': 'Stealth Rock,Lava Plume,Roar,Earth Power',
    '#596 Galvantula 100-lvl': 'Sticky Web,Bug Buzz,Thunderbolt,Energy Ball',
    '#376 Metagross 100-lvl': 'Agility,Earthquake,Meteor Mash,Zen Headbutt',
    '#085 Dodrio 100-lvl': 'Swords Dance,Frustration,Jump Kick,Brave Bird',
    '#779 Bruxish 100-lvl': 'Psychic Fangs,Liquidation,Swords Dance,Aqua Jet',
    '#563 Cofagrigus 100-lvl': 'Nasty Plot,Shadow Ball,Trick Room,Hidden Power',
    '#282 Gardevoir 100-lvl': 'Psyshock,Draining Kiss,Calm Mind,Hidden Power',
    '#154 Meganium 100-lvl': 'Synthesis,Giga Drain,Dragon Tail,Aromatherapy',
    '#195 Quagsire 100-lvl': 'Earthquake,Recover,Scald,Toxic',
    '#078 Rapidash 100-lvl': 'Flare Blitz,Wild Charge,Morning Sun,Will-O-Wisp',
    '#212 Scizor 100-lvl': 'Swords Dance,Iron Head,X-Scissor,Superpower',
    '#478 Froslass 100-lvl': 'Spikes,Taunt,Ice Beam,Destiny Bond',
    '#103 Exeggutor 100-lvl': 'Sleep Powder,Giga Drain,Psychic,Hidden Power',
    '#348 Armaldo 100-lvl': 'Earthquake,Rapid Spin,X-Scissor,Stone Edge',
    '#512 Simisage 100-lvl': 'Nasty Plot,Focus Blast,Giga Drain,Hidden Power',
    '#473 Mamoswine 100-lvl': 'Earthquake,Icicle Crash,Ice Shard,Superpower',
    '#758 Salazzle 100-lvl': 'Nasty Plot,Sludge Wave,Flamethrower,Hidden Power',
    '#773 Silvally 100-lvl': 'Work Up,Multi-Attack,Ice Beam,Thunderbolt',
    '#051 Dugtrio 100-lvl': 'Memento,Stealth Rock,Earthquake,Sucker Punch',
    '#275 Shiftry 100-lvl': 'Defog,Swords Dance,Seed Bomb,Sucker Punch',
    '#076 Golem 100-lvl': 'Stealth Rock,Earthquake,Rock Blast,Fire Punch',
    '#785 Tapu Koko 100-lvl': 'Taunt,Thunderbolt,Dazzling Gleam,Hidden Power',
    '#793 Nihilego 100-lvl': 'Stealth Rock,Toxic Spikes,Power Gem,Sludge Wave',
    '#706 Goodra 100-lvl': 'Draco Meteor,Fire Blast,Thunderbolt,Sludge Wave',
    '#724 Decidueye 100-lvl': 'Spirit Shackle,Leaf Blade,Shadow Sneak,Swords Dance',
    '#437 Bronzong 100-lvl': 'Stealth Rock,Toxic,Heavy Slam,Protect',
    '#045 Vileplume 100-lvl': 'Toxic,Strength Sap,Giga Drain,Sludge Bomb',
    '#197 Umbreon 100-lvl': 'Heal Bell,Toxic,Moonlight,Foul Play',
    '#411 Bastiodon 100-lvl': 'Stealth Rock,Roar,Toxic,Heavy Slam',
    '#199 Slowking 100-lvl': 'Nasty Plot,Psyshock,Scald,Slack Off',
    '#569 Garbodor 100-lvl': 'Toxic Spikes,Spikes,Gunk Shot,Earthquake',
    '#057 Primeape 100-lvl': 'Close Combat,Stone Edge,Gunk Shot,Earthquake',
    '#594 Alomomola 100-lvl': 'Scald,Toxic,Wish,Protect',
    '#738 Vikavolt 100-lvl': 'Thunderbolt,Bug Buzz,Energy Ball,Roost',
    '#210 Granbull 100-lvl': 'Play Rough,Thunder Wave,Earthquake,Heal Bell',
    '#094 Gengar 100-lvl': 'Sludge Bomb,Shadow Ball,Focus Blast,Thunderbolt',
    '#601 Klinklang 100-lvl': 'Shift Gear,Gear Grind,Wild Charge,Frustration',
    '#471 Glaceon 100-lvl': 'Ice Beam,Shadow Ball,Heal Bell,Hidden Power',
    '#635 Hydreigon 100-lvl': 'Dark Pulse,Earth Power,Flash Cannon,Roost',
    '#178 Xatu 100-lvl': 'Calm Mind,Psychic,Heat Wave,Roost',
    '#715 Noivern 100-lvl': 'Super Fang,Taunt,Draco Meteor,Flamethrower',
    '#136 Flareon 100-lvl': 'Flame Charge,Superpower,Flare Blitz,Facade',
    '#435 Skuntank 100-lvl': 'Acid Spray,Flamethrower,Dark Pulse,Taunt',
    '#157 Typhlosion 100-lvl': 'Sunny Day,Solar Beam,Fire Blast,Hidden Power',
    '#182 Bellossom 100-lvl': 'Quiver Dance,Strength Sap,Giga Drain,Hidden Power',
    '#186 Politoed 100-lvl': 'Scald,Toxic,Protect,Hypnosis',
    '#049 Venomoth 100-lvl': 'Quiver Dance,Bug Buzz,Psychic,Sleep Powder',
    '#623 Golurk 100-lvl': 'Stealth Rock,Earthquake,Shadow Punch,Ice Punch',
    '#272 Ludicolo 100-lvl': 'Hydro Pump,Giga Drain,Ice Beam,Focus Blast',
    '#538 Throh 100-lvl': 'Bulk Up,Circle Throw,Rest,Payback',
    '#470 Leafeon 100-lvl': 'Swords Dance,Leaf Blade,Double-Edge,Synthesis',
    '#474 Porygon-Z 100-lvl': 'Nasty Plot,Shadow Ball,Tri Attack,Thunder Wave',
    '#668 Pyroar 100-lvl': 'Flamethrower,Hyper Voice,Will-O-Wisp,Hidden Power',
    '#693 Clawitzer 100-lvl': 'Aura Sphere,Dark Pulse,Scald,Ice Beam',
    '#754 Lurantis 100-lvl': 'Solar Blade,Defog,Superpower,Synthesis',
    '#727 Incineroar 100-lvl': 'Darkest Lariat,Earthquake,Bulk Up,Flare Blitz',
    '#681 Aegislash 100-lvl': 'Swords Dance,Iron Head,Shadow Ball,Shadow Sneak',
    '#217 Ursaring 100-lvl': 'Swords Dance,Close Combat,Crunch,Slash',
    '#652 Chesnaught 100-lvl': 'Wood Hammer,Leech Seed,Bulk Up,Superpower',
    '#334 Altaria 100-lvl': 'Dragon Dance,Earthquake,Dragon Claw,Roost',
    '#031 Nidoqueen 100-lvl': 'Stealth Rock,Earth Power,Taunt,Sludge Bomb',
    '#407 Roserade 100-lvl': 'Sleep Powder,Leaf Storm,Sludge Bomb,Hidden Power',
    '#426 Drifblim 100-lvl': 'Acrobatics,Will-O-Wisp,Destiny Bond,Shadow Ball',
    '#124 Jynx 100-lvl': 'Lovely Kiss,Nasty Plot,Ice Beam,Psychic',
    '#344 Claydol 100-lvl': 'Earthquake,Ice Beam,Psychic,Rapid Spin',
    '#660 Diggersby 100-lvl': 'Swords Dance,Agility,Earthquake,Frustration',
    '#788 Tapu Fini 100-lvl': 'Scald,Toxic,Taunt,Haze',
    '#620 Mienshao 100-lvl': 'Swords Dance,High Jump Kick,Stone Edge,Poison Jab',
    '#392 Infernape 100-lvl': 'Swords Dance,Flare Blitz,Close Combat,Stone Edge',
    '#055 Golduck 100-lvl': 'Scald,Calm Mind,Ice Beam,Psyshock',
    '#101 Electrode 100-lvl': 'Foul Play,Signal Beam,Taunt,Thunderbolt',
    '#230 Kingdra 100-lvl': 'Surf,Draco Meteor,Ice Beam,Hydro Pump',
    '#445 Garchomp 100-lvl': 'Swords Dance,Dragon Claw,Earthquake,Fire Blast',
    '#774 Minior 100-lvl': 'Shell Smash,Acrobatics,Earthquake,Power Gem',
    '#295 Exploud 100-lvl': 'Boomburst,Focus Blast,Fire Blast,Surf',
    '#141 Kabutops 100-lvl': 'Swords Dance,Aqua Jet,Liquidation,Stone Edge',
    '#472 Gliscor 100-lvl': 'Swords Dance,Acrobatics,Earthquake,Roost',
    '#526 Gigalith 100-lvl': 'Stealth Rock,Rock Blast,Earthquake,Toxic',
    '#466 Electivire 100-lvl': 'Thunderbolt,Flamethrower,Earthquake,Ice Punch',
    '#676 Furfrou 100-lvl': 'Baby-Doll Eyes,Cotton Guard,Toxic,Frustration',
    '#151 Mew 100-lvl': 'Nasty Plot,Psyshock,Aura Sphere,Giga Drain',
    '#760 Bewear 100-lvl': 'Drain Punch,Swords Dance,Frustration,Earthquake',
    '#628 Braviary 100-lvl': 'Bulk Up,Roost,Brave Bird,Superpower',
    '#205 Forretress 100-lvl': 'Stealth Rock,Gyro Ball,Rapid Spin,Toxic',
    '#365 Walrein 100-lvl': 'Toxic,Ice Beam,Super Fang,Roar',
    '#609 Chandelure 100-lvl': 'Calm Mind,Shadow Ball,Flamethrower,Hidden Power',
    '#091 Cloyster 100-lvl': 'Shell Smash,Rock Blast,Icicle Spear,Hydro Pump',
    '#237 Hitmontop 100-lvl': 'Close Combat,Rapid Spin,Sucker Punch,Toxic',
    '#740 Crabominable 100-lvl': 'Close Combat,Stone Edge,,Earthquake',
    '#591 Amoonguss 100-lvl': 'Foul Play,Spore,Giga Drain,Synthesis',
    '#713 Avalugg 100-lvl': 'Avalanche,Rapid Spin,Earthquake,Recover',
    '#034 Nidoking 100-lvl': 'Earth Power,Thunderbolt,Flamethrower,Ice Beam',
    '#614 Beartic 100-lvl': 'Swords Dance,Icicle Crash,Superpower,Throat Chop',
    '#131 Lapras 100-lvl': 'Hydro Pump,Ice Beam,Thunderbolt,Toxic',
    '#615 Cryogonal 100-lvl': 'Freeze-Dry,Recover,Haze,Hidden Power',
    '#584 Vanilluxe 100-lvl': 'Autotomize,Freeze-Dry,Flash Cannon,Hidden Power',
    '#733 Toucannon 100-lvl': 'Brick Break,Bullet Seed,Rock Blast,Roost',
    '#571 Zoroark 100-lvl': 'Nasty Plot,Night Daze,Focus Blast,Flamethrower',
    '#695 Heliolisk 100-lvl': 'Thunderbolt,Surf,Hyper Voice,Glare',
    '#229 Houndoom 100-lvl': 'Nasty Plot,Fire Blast,Dark Pulse,Hidden Power',
    '#497 Serperior 100-lvl': 'Giga Drain,Glare,Hidden Power,Dragon Pulse',
    '#149 Dragonite 100-lvl': 'Dragon Dance,Earthquake,Extreme Speed,Outrage',
    '#460 Abomasnow 100-lvl': 'Wood Hammer,Ice Shard,Earthquake,Hidden Power',
    '#106 Hitmonlee 100-lvl': 'High Jump Kick,Mach Punch,Poison Jab,Stone Edge',
    '#385 Jirachi 100-lvl': 'Iron Head,Thunder Wave,Ice Punch,Fire Punch',
    '#462 Magnezone 100-lvl': 'Thunderbolt,Thunder Wave,Flash Cannon,Hidden Power',
    '#764 Comfey 100-lvl': 'Calm Mind,Giga Drain,Hidden Power,Draining Kiss',
    '#630 Mandibuzz 100-lvl': 'Foul Play,Toxic,Roost,Defog',
    '#549 Lilligant 100-lvl': 'Quiver Dance,Sleep Powder,Giga Drain,Hidden Power',
    '#579 Reuniclus 100-lvl': 'Acid Armor,Calm Mind,Rest,Psyshock',
    '#297 Hariyama 100-lvl': 'Close Combat,Heavy Slam,Stone Edge,Earthquake',
    '#553 Krookodile 100-lvl': 'Earthquake,Stone Edge,Crunch,Superpower',
    '#681.1 Aegislash 100-lvl': 'Swords Dance,Iron Head,Shadow Ball,Shadow Sneak',
    '#009 Blastoise 100-lvl': 'Rapid Spin,Scald,Toxic,Ice Beam',
    '#464 Rhyperior 100-lvl': 'Rock Polish,Rock Blast,Earthquake,Megahorn',
    '#530 Excadrill 100-lvl': 'Swords Dance,Rock Slide,Iron Head,Earthquake',
    '#340 Whiscash 100-lvl': 'Dragon Dance,Earthquake,Waterfall,Stone Edge',
    '#409 Rampardos 100-lvl': 'Head Smash,Fire Punch,Earthquake,Superpower',
    '#500 Emboar 100-lvl': 'Flare Blitz,Superpower,Wild Charge,Sucker Punch',
    '#286 Breloom 100-lvl': 'Seed Bomb,Swords Dance,Mach Punch,Rock Tomb',
    '#780 Drampa 100-lvl': 'Draco Meteor,Hyper Voice,Flamethrower,Glare',
    '#359 Absol 100-lvl': 'Play Rough,Swords Dance,Sucker Punch,Superpower',
    '#781 Dhelmise 100-lvl': 'Power Whip,Earthquake,Rapid Spin,Shadow Claw',
    '#689 Barbaracle 100-lvl': 'Shell Smash,Stone Edge,Earthquake,Liquidation',
    '#770 Palossand 100-lvl': 'Earth Power,Shadow Ball,Stealth Rock,Toxic',
    '#006 Charizard 100-lvl': 'Dragon Dance,Flare Blitz,Earthquake,Outrage',
    '#691 Dragalge 100-lvl': 'Draco Meteor,Toxic Spikes,Sludge Wave,Focus Blast',
    '#768 Golisopod 100-lvl': 'Swords Dance,Leech Life,Liquidation,Spikes',
    '#730 Primarina 100-lvl': 'Moonblast,Psychic,Calm Mind,Scald',
    '#476 Probopass 100-lvl': 'Stealth Rock,Thunder Wave,Flash Cannon,Earth Power',
    '#778 Mimikyu 100-lvl': 'Shadow Sneak,Swords Dance,Play Rough,Shadow Claw',
    '#332 Cacturne 100-lvl': 'Swords Dance,Sucker Punch,Seed Bomb,Drain Punch',
    '#703 Carbink 100-lvl': 'Toxic,Stealth Rock,Moonblast,Protect',
    '#556 Maractus 100-lvl': 'Spikes,Toxic,Spiky Shield,Giga Drain',
    '#452 Drapion 100-lvl': 'Swords Dance,Crunch,Poison Jab,Earthquake',
    '#700 Sylveon 100-lvl': 'Moonblast,Toxic,Heal Bell,Wish',
    '#448 Lucario 100-lvl': 'Swords Dance,Meteor Mash,Close Combat,Extreme Speed',
    '#480 Uxie 100-lvl': 'Stealth Rock,Memento,Psychic,Taunt',
    '#350 Milotic 100-lvl': 'Scald,Recover,Toxic,Dragon Tail',
    '#310 Manectric 100-lvl': 'Flamethrower,Thunderbolt,Thunder Wave,Hidden Power',
    '#362 Glalie 100-lvl': 'Spikes,Taunt,Explosion,Ice Beam',
    '#068 Machamp 100-lvl': 'Close Combat,Knock Off,Stone Edge,Bullet Punch',
    '#539 Sawk 100-lvl': 'Close Combat,Earthquake,Knock Off,Ice Punch',
    '#743 Ribombee 100-lvl': 'Quiver Dance,Bug Buzz,Psychic,Moonblast',
    '#181 Ampharos 100-lvl': 'Thunderbolt,Heal Bell,Toxic,Focus Blast',
    '#321 Wailord 100-lvl': 'Hydro Pump,Ice Beam,Water Spout,Hidden Power',
    '#065 Alakazam 100-lvl': 'Psychic,Shadow Ball,Focus Blast,Calm Mind',
    '#534 Conkeldurr 100-lvl': 'Bulk Up,Drain Punch,Ice Punch,Thunder Punch',
    '#357 Tropius 100-lvl': 'Leech Seed,Protect,Air Slash,Giga Drain',
    '#134 Vaporeon 100-lvl': 'Scald,Toxic,Protect,Wish',
    '#330 Flygon 100-lvl': 'Dragon Dance,Dragon Claw,Earthquake,Superpower',
    '#127 Pinsir 100-lvl': 'Close Combat,Swords Dance,Stone Edge,X-Scissor',
    '#604 Eelektross 100-lvl': 'Giga Drain,Flamethrower,Acid Spray,Thunderbolt',
    '#514 Simisear 100-lvl': 'Nasty Plot,Fire Blast,Focus Blast,Hidden Power',
    '#671 Florges 100-lvl': 'Aromatherapy,Moonblast,Toxic,Synthesis',
    '#655 Delphox 100-lvl': 'Calm Mind,Psyshock,Flamethrower,Dazzling Gleam',
    '#405 Luxray 100-lvl': 'Wild Charge,Superpower,Ice Fang,Crunch',
    '#319 Sharpedo 100-lvl': 'Crunch,Earthquake,Ice Beam,Waterfall',
    '#059 Arcanine 100-lvl': 'Flare Blitz,Wild Charge,Morning Sun,Extreme Speed',
    '#477 Dusknoir 100-lvl': 'Will-O-Wisp,Fire Punch,Earthquake,Shadow Sneak',
    '#508 Stoutland 100-lvl': 'Frustration,Crunch,Superpower,Thunder Wave',
    '#080 Slowbro 100-lvl': 'Scald,Psyshock,Slack Off,Toxic',
    '#442 Spiritomb 100-lvl': 'Calm Mind,Dark Pulse,Will-O-Wisp,Rest',
    '#707 Klefki 100-lvl': 'Foul Play,Spikes,Thunder Wave,Toxic',
    '#395 Empoleon 100-lvl': 'Stealth Rock,Defog,Scald,Toxic',
    '#545 Scolipede 100-lvl': 'Swords Dance,Poison Jab,Megahorn,Earthquake',
    '#208 Steelix 100-lvl': 'Stealth Rock,Earthquake,Dragon Tail,Iron Head',
    '#254 Sceptile 100-lvl': 'Swords Dance,Leaf Blade,Earthquake,Acrobatics',
    '#709 Trevenant 100-lvl': 'Will-O-Wisp,Wood Hammer,Earthquake,Shadow Claw',
    '#107 Hitmonchan 100-lvl': 'Bulk Up,Drain Punch,Ice Punch,Mach Punch',
    '#621 Druddigon 100-lvl': 'Glare,Stealth Rock,Dragon Tail,Fire Punch',
    '#565 Carracosta 100-lvl': 'Shell Smash,Stone Edge,Waterfall,Earthquake',
    '#224 Octillery 100-lvl': 'Hydro Pump,Ice Beam,Fire Blast,Energy Ball',
    '#226 Mantine 100-lvl': 'Roost,Scald,Defog,Toxic',
    '#036 Clefable 100-lvl': 'Moonblast,Thunder Wave,Wish,Heal Bell',
    '#555 Darmanitan 100-lvl': 'Flare Blitz,Earthquake,Rock Slide,Superpower',
    '#073 Tentacruel 100-lvl': 'Hydro Pump,Sludge Wave,Ice Beam,Acid Spray',
    '#465 Tangrowth 100-lvl': 'Giga Drain,Earthquake,Sludge Bomb,Hidden Power',
    '#038 Ninetales 100-lvl': 'Nasty Plot,Flamethrower,Energy Ball,Psyshock',
    '#589 Escavalier 100-lvl': 'Megahorn,Iron Head,Knock Off,Toxic',
    '#248 Tyranitar 100-lvl': 'Dragon Dance,Crunch,Stone Edge,Earthquake',
    '#766 Passimian 100-lvl': 'Close Combat,Gunk Shot,Earthquake,Rock Slide',
    '#028 Sandslash 100-lvl': 'Swords Dance,Earthquake,Stone Edge,Rapid Spin',
    '#586 Sawsbuck 100-lvl': 'Swords Dance,Horn Leech,Jump Kick,Double-Edge',
    '#468 Togekiss 100-lvl': 'Nasty Plot,Air Slash,Aura Sphere,Roost',
    '#784 Kommo-o 100-lvl': 'Dragon Dance,Close Combat,Outrage,Poison Jab',
    '#663 Talonflame 100-lvl': 'Brave Bird,Flare Blitz,Roost,Swords Dance',
    '#398 Staraptor 100-lvl': 'Brave Bird,Close Combat,Double-Edge,Quick Attack',
    '#750 Mudsdale 100-lvl': 'Counter,Earthquake,Toxic,Iron Defense',
    '#699 Aurorus 100-lvl': 'Freeze-Dry,Stealth Rock,Rock Tomb,Thunder Wave',
    '#306 Aggron 100-lvl': 'Autotomize,Head Smash,Earthquake,Iron Head'
};