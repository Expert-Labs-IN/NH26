export default interface ITask {
    _id?: string;
    title: string;
    description?: string;
    imageUrl?: string;
    status: "Pending" | "Assigned" | "In Progress" | "Completed" | "Rejected";
    assignedTo?: string | null; // userId of the assigned user
    dueDate?: Date;
    priority?: string;
    createdAt?: string;
}
