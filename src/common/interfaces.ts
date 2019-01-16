/**
 * The remaining interfaces are for immutable classes
 */
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

    addHours(hours: number): ITimeOfDay;
    addMinutes(minutes: number): ITimeOfDay;
    addSeconds(seconds: number): ITimeOfDay;

    toSeconds(): number;
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

export interface IOverride {
    readonly id: string;
    readonly date: Date;
    readonly rule: IRule;
}
