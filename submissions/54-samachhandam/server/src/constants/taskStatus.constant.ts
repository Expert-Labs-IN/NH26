export const TASK_STATUS = {
    PENDING: "Pending",
    ASSIGNED: "Assigned",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed"
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];