
export const INJECTABLES = {
    ConfigManager: Symbol("ConfigManager"),
    ConfigRootDir: Symbol("ConfigRootDir"),
    Configuration: Symbol("Configuration"),
    Controller: Symbol("Controller"),
    DatedConfig: Symbol("DatedConfig"),
    NamedConfig: Symbol("NamedConfig"),
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
    getState(): IDeviceState;
    switch(state: boolean): void;
}

// models the 1-wire sensor network
export interface ISensorManager {
    getReadings(): IReading[];
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
    id: string;
    startTime: ITimeOfDay;
    endTime: ITimeOfDay;
    apply(currentState: IControlState, readings: IReading[], time: ITimeOfDay): IRuleResult;
}

export interface IRuleResult {
    heating: boolean | null;
    hotWater: boolean | null;
}

export interface ITimeOfDay {
    hour: number;
    minute: number;
    second: number;
}

export interface IControlState {
    heating: boolean;
    hotWater: boolean;
}

export interface IReading {
    value: number;
    role: string;
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
