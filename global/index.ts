
declare const global: any;

import * as Monitor from '../lib/monitor';
global.Monitor = Monitor;

import {Chat} from './chat';
global.Chat = Chat;

import * as Tools from '../tools';
global.Tools = Tools;

global.toId = Tools.toId;
global.splint = Tools.splint;
global.toUserName = Tools.toUserName;

import * as Config from '../config/config';
global.Config = Config;

global.Servers = Object.create(null);

import * as Discord from '../discord';
import * as Showdown from '../showdown';


Showdown.connectTimer;

Discord.Bot.connect();

Chat.loadPlugins();