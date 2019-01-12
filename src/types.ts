import { Router } from "express";

import { IConfiguration, IControlState, IOverride, IProgram, IReading, IRule, ITimeOfDay } from "./common/types";

export const INJECTABLES = {
    // symbols for constants
    ConfigRootDir: Symbol("ConfigRootDir"),
    GpioRootDir: Symbol("GpioRootDir"),
    OneWireRootDir: Symbol("OneWireRootDir"),

    // symbols for the main players
    ConfigManager: Symbol("ConfigManager"),
    Controller: Symbol("Controller"),
    OverrideManager: Symbol("OverrideManager"),
    SensorManager: Symbol("SensorManager"),
    System: Symbol("System"),

    // symbols for the supporting cast
    Clock: Symbol("Clock"),
    Device: Symbol("Device"),

    // symbols for the server
    ExpressApp: Symbol("ExpressApp"),
    ExpressPort: Symbol("ExpressPort"),
    ExpressStaticRootDir: Symbol("ExpressStaticRootDir"),

    // symbols for the apis
    ConfigApi: Symbol("ConfigApi"),
    ControlApi: Symbol("ControlApi"),
    OverrideApi: Symbol("OverrideApi"),
    SensorApi: Symbol("SensorApi"),
};

// entry point for the app
export interface IController {
    start(): Promise<void>;
    getActiveProgram(now: Date): IProgram;
    getControlState(): IControlState;
}

// models the physical boiler and pumps
export interface ISystem {
    getDeviceState(): Promise<ReadonlyArray<IDeviceState>>;
    applyControlState(controlState: IControlState): Promise<void>;
}

// models a device in the system
export interface IDevice {
    getState(): Promise<IDeviceState>;
    switch(state: boolean): Promise<void>;
}

export interface IDeviceState {
    id: string;
    description: string;
    state: boolean;
}

// models the 1-wire sensor network
export interface ISensorManager {
    readAvailableSensors(): Promise<ReadonlyArray<IReading>>;
    readConfiguredSensors(): Promise<ReadonlyArray<IReading>>;
    // readSesnor(id: string): Promise<IReading>;
}

// manages the application configuratiom
export interface IConfigManager {
    start(): Promise<any>;
    getConfig(): IConfiguration;
    setConfig(config: IConfiguration): Promise<any>;
}

// manages overrides to the standard configuration
export interface IOverrideManager {
    addOverride(rule: IRule): void;
    getOverrides(): ReadonlyArray<IOverride>;
    clearOverrides(): void;
    housekeep(): void;
}

/**
 * The remaining interfaces are for immutable classes
 */
export interface IApi {
    addRoutes(router: Router): void;
}

export interface IClock {
    now(): Date;
    timeOfDay(): ITimeOfDay;
}
