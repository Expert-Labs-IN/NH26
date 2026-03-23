import { model } from 'mongoose';
import ChatSchema from './chat.schema';
import { IChat } from '@/types/interface/chat.interface';

const chatModel = model<IChat>('Chat', ChatSchema);

export default chatModel;