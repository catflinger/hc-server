
export const INJECTABLES = {
    ConfigManager: Symbol("ConfigManager"),
    ConfigRootDir: Symbol("ConfigRootDir"),
    Configuration: Symbol("Configuration"),
    Controller: Symbol("Controller"),
    DatedConfig: Symbol("DatedConfig"),
    Device: Symbol("Device"),
    GpioRootDir: Symbol("GpioRootDir"),
    NamedConfig: Symbol("NamedConfig"),
    OneWireRootDir: Symbol("OneWireRootDir"),
    Program: Symbol("Program"),
    Rule: Symbol("Rule"),
    SensorConfig: Symbol("SensorConfig"),
    SensorManager: Symbol("SensorManager"),
    System: Symbol("SystemSystem"),
};

// entry point for the app
export interface IController {
    start(): void;
}

// models the physical boiler and pumps
export interface ISystem {
    boiler: ISwitchable;
    chPump: ISwitchable;
    hwPump: ISwitchable;
}

// models a device in the system
export interface ISwitchable {
    id: string;
    description: string;
    getState(): Promise<IDeviceState>;
    switch(state: boolean): Promise<void>;
}

// models the 1-wire sensor network
export interface ISensorManager {
    readAvailableSensors(): Promise<IReading[]>;
    readConfiguredSensors(): Promise<IReading[]>;
}

// manages the application configuratiom
export interface IConfigManager {
    getConfig(): Promise<IConfiguration>;
    setConfig(config: IConfiguration): Promise<any>;
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
    applyRule(currentState: IControlState, readings: IReading[], time: ITimeOfDay): IRuleResult;
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
