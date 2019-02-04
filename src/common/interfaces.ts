/*
All these interfaces are intended for use with immutable classes.
*/

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
    applyRule(currentState: IControlState, readings: ReadonlyArray<ISensorReading>, time: ITimeOfDay | Date): IRuleResult;
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
    toMutable(): any;
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

// the data required for senor configuration and the data required for displaying readings
// is almost identical.  The same interface is used for both
export interface ISensorConfig {
    id: string;
    description: string;
    role: string;
    reading: number;
}
export type ISensorReading = ISensorConfig;

export interface IOverride {
    readonly id: string;
    readonly date: Date;
    readonly rule: IRule;
}

export interface IConfigValidation {
    getBoolean(val: any, message: string, defaultValue?: boolean): boolean;
    getString(val: any, message: string, defaultValue?: string): string;
    getNumber(val: any, message: string, defaultValue?: number): number;
    getDate(val: any, message: string, defaultValue?: Date): Date;
}

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
