import * as Debug from "debug";
import { inject, injectable } from "inversify";
import { setInterval } from "timers";

import {
    IConfiguration,
    IControlState,
    IOverride,
    IProgram,
    IRuleConfig,
    ISensorReading,
    ITimeOfDay,
} from "../../common/interfaces";

import {
    IClock,
    IConfigManager,
    IController,
    ILogger,
    INJECTABLES,
    IOverrideManager,
    IRule,
    IRuleResult,
    ISensorManager,
    ISystem,
} from "../../types";

import { Program } from "../../common/types";

const errorLog = Debug("error");
const controllerLog = Debug("controller");

@injectable()
export class Controller implements IController {

    private controlState: IControlState;

    constructor(
        @inject(INJECTABLES.ConfigManager) private configManager: IConfigManager,
        @inject(INJECTABLES.SensorManager) private sensorManager: ISensorManager,
        @inject(INJECTABLES.OverrideManager) private overideManager: IOverrideManager,
        @inject(INJECTABLES.System) private system: ISystem,
        @inject(INJECTABLES.Clock) private clock: IClock,
        @inject(INJECTABLES.RuleFactory) private ruleFactory: (ruleConfig: IRuleConfig) => IRule,
        @inject(INJECTABLES.Logger) private logger: ILogger,
    ) {}

    public getControlState(): IControlState {
        return this.controlState;
    }

    public start(refreshIntervalSeconds?: number, logIntervalMinutes?: number): Promise<any> {

        return this.configManager.start()
        .then(() => {
            return this.sensorManager.start();
        })
        .then(() => {
            return this.logger.init();
        })
        .then(() => {
            this.controlState = {
                heating: false,
                hotWater: false,
            };
        })
        .then(() => {
            return this.refresh();
        })
        // .then(() => {
        //     return this.log();
        // })
        .then(() => {
            // kick the timers off
            if (refreshIntervalSeconds !== undefined && refreshIntervalSeconds > 5) {
                setInterval(() => {
                    this.refresh();
                },
                refreshIntervalSeconds * 1000);
            }

            if (logIntervalMinutes !== undefined && logIntervalMinutes > 5) {
                setInterval(() => {
                    this.log();
                },
                logIntervalMinutes * 1000 * 60);
            }
        })
        .catch((error) => {
            const msg = "Failed to start controller: " + error;
            errorLog(msg);
            throw new Error(msg);
        });
    }

    public refresh(now?: Date): Promise<void> {
        controllerLog("Refreshing Controller");

        if (!now) {
            now = this.clock.now();
        }

        return this.sensorManager.refresh()

        .then(() => {
            const newControlState: IControlState = { heating: false, hotWater: false };
            const sensorReadings = this.sensorManager.getReadings();
            const program = this.getActiveProgram(now);

            if (program) {
                controllerLog("Active program " + program.name);

                const hwReading: number = this.sensorManager.getReadingByRole("hw");

                controllerLog("hw reading " + hwReading);

                // set the hot water based on the program threshold values
                if (!hwReading ||
                    typeof hwReading !== "number" ||
                    isNaN(hwReading) ||
                    hwReading === Number.POSITIVE_INFINITY ||
                    hwReading === Number.NEGATIVE_INFINITY) {

                    newControlState.hotWater = false;

                } else {

                    controllerLog(`program min ${program.minHwTemp} max ${program.maxHwTemp}`);
                    controllerLog(`control state ${JSON.stringify(this.controlState)}`);

                    if (hwReading < program.minHwTemp) {
                        newControlState.hotWater = true;

                    } else if (hwReading < program.maxHwTemp && this.controlState.hotWater) {
                        // keep the hw on until the upper threshold is reached
                        // if the hw is off then we are on theway back down again so keep it off
                        // this behaviour is to prevent the HW continually cycling around the upper threshold value
                        newControlState.hotWater = true;
                    }
                }

                // set the heating based on the program rules
                program.getRules().forEach((rule: IRuleConfig) => {
                    this.applyRule(rule, sensorReadings, now, newControlState);
                });
            }

            // we can still use the overrides even if we have no program
            this.overideManager.getOverrides().forEach((ov: IOverride) => {
                this.applyRule(ov.rule, sensorReadings, now, newControlState);
            });

            // processing is now complete, remember the new control state
            this.controlState = newControlState;

            // switch the devices based on new control state
            this.system.applyControlState(newControlState);
        })

        .catch((error) => {
            const message = "Cannot refresh controller: " + error;
            errorLog(message);
        });
    }

    public getActiveProgram(now: Date): IProgram {
        let activeProgram: IProgram = null;
        const config: IConfiguration = this.configManager.getConfig();

        const datedConfig = config.getDatedConfig();
        const namedConfig = config.getNamedConfig();
        const programs = config.getProgramConfig();

        // look for dated programs first
        datedConfig.forEach((dc) => {
            if (dc.timeOfYear.isToday(now)) {
                const program = programs.find((p) => p.id === dc.programId);
                if (program) {
                    activeProgram = program;
                }
            }
        });

        // next look for named programs next
        if (activeProgram === null) {
            let id: string;
            if (now.getDay() === 0) {
                id = namedConfig.sundayProgramId;
            } else if (now.getDay() === 6) {
                id = namedConfig.saturdayProgramId;
            } else {
                id = namedConfig.weekdayProgramId;
            }

            const program = programs.find((p) => p.id === id);
            if (program) {
                activeProgram = program;
            }
        }

        // if still no program found supply a default
        if (activeProgram === null) {
            activeProgram = new Program({
                id: "",
                maxHwTemp: 50,
                minHwTemp: 45,
                name: "",
                rules: [],
            });
        }

        return activeProgram;
    }

    private applyRule(
        ruleConfig: IRuleConfig,
        sensorReadings: ReadonlyArray<ISensorReading>,
        now: ITimeOfDay | Date,
        newControlState: IControlState): void {

        // the rule factory selects the right rule to use for this config (based on the value of ruleConfig.kind)
        const rule: IRule = this.ruleFactory(ruleConfig);

        const result: IRuleResult = rule.applyRule(this.controlState, sensorReadings, now);
        if (result.heating !== null) {
            newControlState.heating =  result.heating;
        }
        if (result.hotWater !== null) {
            newControlState.hotWater =  result.hotWater;
        }
    }

    private log(): Promise<boolean> {
        return this.logger.log(
            this.clock.now(),
            this.sensorManager.getReadings(),
            this.getControlState());
    }
}
