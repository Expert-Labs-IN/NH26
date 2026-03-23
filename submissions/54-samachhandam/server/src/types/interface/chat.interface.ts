export interface Ichat{
    role : String,
    content : String
}

export interface IChat {
    userId: string;
    messages: Ichat[];
    sessionId?: string;
}