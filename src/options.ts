import { ConnectOptions, PuppeteerLaunchOptions, ResourceType } from "puppeteer";

export class BrowserModuleOptions {
    local?: boolean = true;
    options: PuppeteerLaunchOptions | ConnectOptions;
    userAgent?: string;
    stealth?: boolean = false;
    blockedResources?: ResourceType[] = [];
    launchOnModuleInit?: boolean = true;
}