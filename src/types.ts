import { Router } from "express";

import { IConfiguration, IControlState, ILogExtract, IOverride, IProgram, IRuleConfig, ISensorReading, ITimeOfDay } from "./common/interfaces";

export const INJECTABLES = {
    // symbols for constants
    ConfigRootDir: Symbol("ConfigRootDir"),
    GpioRootDir: Symbol("GpioRootDir"),
    LoggerConfig: Symbol("LoggerConfig"),
    OneWireRootDir: Symbol("OneWireRootDir"),

    // symbols for the main players
    ConfigManager: Symbol("ConfigManager"),
    Controller: Symbol("Controller"),
    Logger: Symbol("Logger"),
    OverrideManager: Symbol("OverrideManager"),
    Rule: Symbol("Rule"),
    RuleFactory: Symbol("RuleFactory"),
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
    LogApi: Symbol("LogApi"),
    OverrideApi: Symbol("OverrideApi"),
    SensorApi: Symbol("SensorApi"),

    // symbols for development and debugging support
    DevApiDelayMs: Symbol("DevApiDelayMs"),
    DevLogApi: Symbol("DevLogApi"),
};

// entry point for the app
export interface IController {
    start(refreshIntervalSeconds?: number, logIntervalMinutes?: number): Promise<void>;
    getActiveProgram(now: Date): IProgram;
    getControlState(): IControlState;
    refresh(now?: Date): Promise<void>;
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
    start(): Promise<void>;
    getReadings(): ISensorReading[];
    refresh(): Promise<void>;
}

// manages the application configuratiom
export interface IConfigManager {
    start(): Promise<any>;
    getConfig(): IConfiguration;
    setConfig(config: IConfiguration): Promise<any>;
}

// models a rule for controlling the devices
export interface IRule {
    applyRule(currentState: IControlState, readings: ReadonlyArray<ISensorReading>, time: ITimeOfDay | Date): IRuleResult;
}

export interface IRuleResult {
    heating: boolean | null;
    hotWater: boolean | null;
}

// manages overrides to the standard configuration
export interface IOverrideManager {
    addOverride(rule: IRuleConfig): void;
    getOverrides(): ReadonlyArray<IOverride>;
    clearOverrides(): void;
    housekeep(): void;
}

// logs sensor readings and other information
export interface ILogger {
    config: ILoggerConfig;
    init(): Promise<void>;
    end(): Promise<void>;
    log(
        date: Date,
        readings: ReadonlyArray<ISensorReading>,
        controlState: IControlState,
    ): Promise<boolean>;
    getExtract(ids: string[], from: Date, to: Date): Promise<ILogExtract>;
}

export interface ILoggerConfig {
    server: string;
    user: string;
    password: string;
    database: string;
    testUser: string;
    testPassword: string;
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

export type RuleConstructor = new(ruleConfig: IRuleConfig) => IRule;
