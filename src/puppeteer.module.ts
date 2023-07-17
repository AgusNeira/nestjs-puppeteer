import { Module } from "@nestjs/common";
import { BrowserService } from "./browser.service";
import { ConfigurableModuleClass } from "./configurable-browser-module";

@Module({
    providers: [BrowserService],
    exports: [BrowserService]
})
export class PuppeteerModule extends ConfigurableModuleClass {};