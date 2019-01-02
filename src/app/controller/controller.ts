import { inject, injectable } from "inversify";

import {
    IConfigManager,
    IConfiguration,
    IController,
    IControlState,
    INJECTABLES,
    IProgram,
    IReading,
    IRule,
    IRuleResult,
    ISensorManager,
    ISystem,
} from "../../types";

@injectable()
export class Controller implements IController {

    private controlState: IControlState;

    constructor(
        @inject(INJECTABLES.ConfigManager) private configManager: IConfigManager,
        @inject(INJECTABLES.SensorManager) private sensorManager: ISensorManager,
        @inject(INJECTABLES.System) private system: ISystem,
    ) {}

    public getControlState(): IControlState {
        return {
            heating: this.controlState.heating,
            hotWater: this.controlState.hotWater,
        };
    }
    public async start(): Promise<void> {
        await this.configManager.start();

        this.controlState = {
            heating: false,
            hotWater: false,
        };
        // TO DO...
        // console.log("Controller started");
    }

    public async refresh(now: Date): Promise<any> {
        return this.sensorManager.readConfiguredSensors()
        .then((sensorReadings) => {
            const config: IConfiguration = this.configManager.getConfig();

            // find the active program
            const program = this.getActiveProgram(now);

            // apply the rules to get new control state
            const newControlState: IControlState = { heating: false, hotWater: false };

            program.getRules().forEach((rule: IRule) => {
                const result: IRuleResult = rule.applyRule(this.controlState, sensorReadings, now);
                if (result.heating !== null) {
                    newControlState.heating =  result.heating;
                }
                if (result.hotWater !== null) {
                    newControlState.hotWater =  result.hotWater;
                }
            });
            this.controlState = newControlState;

            // switch the devices based on new control state
            this.system.boiler.switch(this.controlState.heating || this.controlState.hotWater);
            this.system.chPump.switch(this.controlState.heating);
            this.system.hwPump.switch(this.controlState.hotWater);
        })
        .catch(() => {
            // what to do here?  How can an error here be reported?
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
            if (dc.date.toDateString() === now.toDateString()) {
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
            activeProgram = {
                id: "",
                maxHwTemp: 50,
                minHwTemp: 45,
                name: "",
                getRules(): ReadonlyArray<IRule> {
                    return [] as ReadonlyArray<IRule>;
                },
            };
        }

        return activeProgram;
    }
}
