import { PriorityModel } from "./priority-model";

export interface TodoModel {

    id: string;
    startDate: Date | string;
    endDate: Date | string;
    title: string;
    priority: PriorityModel;

}