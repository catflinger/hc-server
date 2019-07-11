import { ConfigValidation } from "../config-validation";
import { IControlApiResponse } from "../interfaces";

export class ControlApiResponse implements IControlApiResponse {
    public readonly date: Date;

    constructor(data: any) {
        if (data.date) {
            this.date = ConfigValidation.getDate(data.date, "ControlApiResponse: date");
        } else {
            throw new Error("date missing from ControlApiResponse");
        }
    }
}
