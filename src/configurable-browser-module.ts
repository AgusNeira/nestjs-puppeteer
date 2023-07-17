import { ConfigurableModuleBuilder } from "@nestjs/common";
import { BrowserModuleOptions } from "./options";

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
    new ConfigurableModuleBuilder<BrowserModuleOptions>().build();