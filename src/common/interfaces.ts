/*
All these interfaces are intended for use with immutable classes.
*/
export type RuleType = "BasicHeatingRule" | "AnotherRuleType...";

export interface IProgram {
    id: string;
    name: string;
    minHwTemp: number;
    maxHwTemp: number;
    getRules(): ReadonlyArray<IRuleConfig>;
}

// interface for the mutable version of Program
export interface IProgramM {
    id: string;
    name: string;
    minHwTemp: number;
    maxHwTemp: number;
    getRules(): ReadonlyArray<IRuleConfig>;
}

export interface IRuleConfig {
    id: string;
    kind: RuleType;
    data: any;
    startTime: ITimeOfDay;
    endTime: ITimeOfDay;
}

export interface ITimeOfDay {
    hour: number;
    minute: number;
    second: number;

    isLaterThan(other: ITimeOfDay): boolean;
    isSameAs(other: ITimeOfDay): boolean;
    isEarlierThan(other: ITimeOfDay): boolean;

    addHours(hours: number): ITimeOfDay;
    addMinutes(minutes: number): ITimeOfDay;
    addSeconds(seconds: number): ITimeOfDay;

    toSeconds(): number;
    toString(): string;
}

export interface IControlState {
    heating: boolean;
    hotWater: boolean;
}

export interface IConfiguration {
    getProgramConfig(): ReadonlyArray<IProgram>;
    getNamedConfig(): INamedConfig;
    getDatedConfig(): ReadonlyArray<IDatedConfig>;
    getSensorConfig(): ReadonlyArray<ISensorConfig>;
    toMutable(): IConfigurationM;
}

// interface for the mutable version of Program
export interface IConfigurationM {
    datedConfig: IDatedConfigM;
    namedConfig: INamedConfigM;
    programConfig: IProgramM [];
    sensorConfig: ISensorConfigM [];
}

export interface INamedConfig {
    weekdayProgramId: string;
    saturdayProgramId: string;
    sundayProgramId: string;
}

// interface for the mutable version of named config
type INamedConfigM = INamedConfig;

export interface IDatedConfig {
    programId: string;
    date: Date;
}

// interface for the mutable version of dated config
type IDatedConfigM = IDatedConfig;

export interface ISensorConfig {
    id: string;
    description: string;
    role: string;
    reading: number;
}

// interface for the mutable version of sensor config
export type ISensorConfigM = ISensorConfig;

// the data required for senor configuration and the data required for displaying readings
// is almost identical.  The same interface is used for both
export type ISensorReading = ISensorConfig;

export interface IOverride {
    readonly id: string;
    readonly date: Date;
    readonly rule: IRuleConfig;
}

// export interface IConfigValidation {
//     getBoolean(val: any, message: string, defaultValue?: boolean): boolean;
//     getString(val: any, message: string, defaultValue?: string): string;
//     getNumber(val: any, message: string, defaultValue?: number): number;
//     getDate(val: any, message: string, defaultValue?: Date): Date;
// }

export interface ILogEntry {
    // the date and time of the entry
    date: Date;

    // the control state at this time
    heating: boolean;
    hotWater: boolean;

    // the sensor values at this time
    readings: ReadonlyArray<number>;
}

export interface ILogExtract {
    // the query parameters
    sensors: ReadonlyArray<string>;
    from: Date;
    to: Date;

    // the data retrieved
    entries: ReadonlyArray<ILogEntry>;
}

export interface IControlStateApiResponse {
    date: Date;
    controlState: IControlState;
    activeProgram: IProgram;
}

export interface IConfigApiResponse {
    date: Date;
    config: IConfiguration;
}

export interface IOverrideApiResponse {
    date: Date;
    overrides: ReadonlyArray<IOverride>;
}

export interface ISensorApiResponse {
    date: Date;
    sensors: ReadonlyArray<ISensorReading>;
}
export interface ILogApiResponse {
    date: Date;
    log: ILogExtract;
}
