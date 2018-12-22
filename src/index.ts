import { IDeviceState } from "./types";

const ds: IDeviceState = {
    description: "hot water",
    id: "hw",
    state: true,
};

console.log("hello world " + JSON.stringify(ds));
