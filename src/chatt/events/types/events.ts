import { Message } from '../../messages/schemas/message.schema';

export interface ServerToClientMessages {
  newMessage: (payload: Message) => void;
}
