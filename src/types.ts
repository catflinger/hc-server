import { Router } from "express";

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

export interface IOverride {
    readonly id: string;
    readonly date: Date;
    readonly rule: IRule;
}

/**
 * The remaining interfaces are for immutable classes
 */
export interface IDeviceState {
    id: string;
    description: string;
    state: boolean;
}

export interface IProgram {
    id: string;
    name: string;
    minHwTemp: number;
    maxHwTemp: number;
    getRules(): ReadonlyArray<IRule>;
}

export interface IRule {
    startTime: ITimeOfDay;
    endTime: ITimeOfDay;
    applyRule(currentState: IControlState, readings: ReadonlyArray<IReading>, time: ITimeOfDay | Date): IRuleResult;
}

export interface IRuleResult {
    heating: boolean | null;
    hotWater: boolean | null;
}

export interface ITimeOfDay {
    hour: number;
    minute: number;
    second: number;
    isLaterThan(other: ITimeOfDay): boolean;
    isSameAs(other: ITimeOfDay): boolean;
    isEarlierThan(other: ITimeOfDay): boolean;
}

export interface IControlState {
    heating: boolean;
    hotWater: boolean;
}

export interface IReading {
    id: string;
    description: string;
    role: string;
    value: number;
}

export interface IConfiguration {
    getProgramConfig(): ReadonlyArray<IProgram>;
    getNamedConfig(): INamedConfig;
    getDatedConfig(): ReadonlyArray<IDatedConfig>;
    getSensorConfig(): ReadonlyArray<ISensorConfig>;
}

export interface INamedConfig {
    weekdayProgramId: string;
    saturdayProgramId: string;
    sundayProgramId: string;
}

export interface IDatedConfig {
    programId: string;
    date: Date;
}

export interface ISensorConfig {
    id: string;
    description: string;
    role: string;
    deleted: boolean;
}

export interface IApi {
    addRoutes(router: Router): void;
}

export interface IClock {
    now(): Date;
    timeOfDay(): ITimeOfDay;
}
