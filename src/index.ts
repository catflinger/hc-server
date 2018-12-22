import { IDeviceState } from "./types";


let ds: IDeviceState = {
    id: "hw", 
    description: "hot water",
    state: true
};

console.log("hello world " + JSON.stringify(ds));