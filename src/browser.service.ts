import { Inject, Injectable, InternalServerErrorException, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import assert from 'assert';
import { Browser, HTTPRequest, Page } from "puppeteer";
import puppeteer from "puppeteer-extra";
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { MODULE_OPTIONS_TOKEN } from './configurable-browser-module';
import { BrowserModuleOptions } from './options';

@Injectable()
export class BrowserService implements OnModuleInit, OnModuleDestroy {
    public async onModuleInit(): Promise<void> {
        if (this.config.launchOnModuleInit) await this.connect();
    }

    async onModuleDestroy() {
        await this.close();
    }

    private readonly logger: Logger = new Logger(BrowserService.name);

    private _browser: Browser | null;
    private readonly browserless: boolean;

    constructor(@Inject(MODULE_OPTIONS_TOKEN) private config: BrowserModuleOptions) {
        this.browserless = 'browserWSEndpoint' in this.config.options;
    }

    public isConnected(): boolean {
        return !!this._browser && this._browser.isConnected();
    }

    public async connect(): Promise<void> {
        this.logger.debug(`Initializing BrowserService...`);
        if (this.isConnected()) {
            this.logger.debug(`Browser was already initialized`);
            return;
        }
        try {
            if (this.config.stealth) puppeteer.use(StealthPlugin());
            if (this.browserless) 
                this._browser = await puppeteer.connect(this.config.options);
            else this._browser = await puppeteer.launch(this.config.options);
        } catch (e: any) {
            this.logger.error(`Failed to connect to browser`)
            this.logger.error(e.message);
            this.logger.error(e.stack);

            if (e.message.includes("ECONNREFUSED"))
                throw new InternalServerErrorException(`ECONNREFUSED: Couldn't connect to browser's endpoint`);
            if (e.message.includes("ENOTFOUND"))
                throw new InternalServerErrorException(`ENOTFOUND: Browser's endpoint not found`);
            throw e;
        }
        this.logger.log(`Browser connection established`);
    }

    public async close() {
        if (this.isConnected()) {
            await this._browser!.close();
            this._browser = null;
        } else {
            this.logger.debug(`Browser already destroyed`);
        }
    }

    public async newPage(): Promise<Page> {
        this.logger.debug(`Initializing new page`);
        assert(this._browser, `Browser connection is not established`);

        const page = await this._browser!.newPage();

        if (this.config.blockedResources) {
            this.logger.debug(`Setting up blocked resources: ${this.config.blockedResources}`);
            await page.setRequestInterception(true);
            page.on("request", (request: HTTPRequest) => {
                if (request.resourceType() in this.config.blockedResources!) {
                    request.abort();
                    return;
                }
                request.continue();
            });
        }

        if (this.config.userAgent) {
            this.logger.debug(`Setting up user agent`);
            await page.setUserAgent(this.config.userAgent);
        }

        this.logger.log(`Page created`);
        return page;
    }
}