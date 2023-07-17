import { Test, TestingModule } from "@nestjs/testing";
import { PuppeteerModule } from "../src/puppeteer.module";
import { BrowserService } from "../src/browser.service"
import { Page } from "puppeteer";

describe("BrowserService", () => {
    let service: BrowserService;
    let onModuleInitSpy: jest.SpyInstance;
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                PuppeteerModule.register({
                    local: true,
                    stealth: true,
                    launchOnModuleInit: true,
                    options: {
                        slowMo: 50,
                        headless: false
                    }
                })
            ], 
            exports: [PuppeteerModule]
        }).compile();
        service = await moduleRef.resolve(BrowserService);
        onModuleInitSpy = jest.spyOn(service, 'onModuleInit');
        moduleRef.enableShutdownHooks();
        await moduleRef.init();
    });

    it ("Should be defined", async () => {
        expect(service).toBeDefined()
    });

    it("Should connnect on start up", async () => {
        expect(onModuleInitSpy).toBeCalledTimes(1);
        expect(service.isConnected()).toBeTruthy();
    });

    describe ("Basic navigation", () => {
        let page: Page;

        it ("Should return a usable page", async () => {
            page = await service.newPage();
            expect(page).toBeDefined();
            expect(page.isClosed()).toBeFalsy();
        });

        it ("Should go to google.com", async () => {
            await expect(page.goto('https://www.google.com')).resolves.toBeDefined();
        }); 
        
        it ("Should close the page correctly", async () => {
            await page.close();
        })
    });

    afterAll(async () => {
        await moduleRef.close();
    });
})